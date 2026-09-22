const crypto = require("crypto");

const DEFAULT_ZION_GRAPHQL_URL = "https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2";
const DEFAULT_WECHAT_OA_APP_ID = "wx6dafecca8d5fd24e";
const ACTION_FLOW_ID = "9f60a0be-4628-4268-a769-661264846cf4";
const ACTION_FLOW_VERSION = 1;
const SESSION_COOKIE = "zhishou_h5_session";
const SESSION_SECONDS = 60 * 60 * 24 * 14;
const INVITATION_COOKIE = 'zhishou_invitation';
const INVITATION_SECONDS = 60 * 60 * 24 * 30;
let wechatJsapiCache = {accessToken:"", accessExpiresAt:0, ticket:"", ticketExpiresAt:0};

function required(name) {
  const aliases = name === "SESSION_SECRET"
    ? ["SESSION_SECRET", "SECRET", "PASSWORD"]
    : name === "WECHAT_OA_APP_SECRET"
      ? ["WECHAT_OA_APP_SECRET", "WECHAT_APP_SECRET"]
      : [name];
  const value = aliases.map(key => String(process.env[key] || "").trim()).find(Boolean);
  if (!value) throw new Error(`CONFIG:${name}`);
  return value;
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function sign(payload, secret = required("SESSION_SECRET")) {
  const body = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verify(token, secret = required("SESSION_SECRET")) {
  if (!token || typeof token !== "string") return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const value = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return value.exp && value.exp < Math.floor(Date.now() / 1000) ? null : value;
  } catch (_) {
    return null;
  }
}

function parseCookies(req) {
  return String(req.headers.cookie || "").split(";").reduce((all, part) => {
    const index = part.indexOf("=");
    if (index > 0) all[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
    return all;
  }, {});
}

function readSession(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const session = verify(token);
  return session && session.jwt && session.account ? session : null;
}

function setSession(res, session) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  appendCookie(res, `${SESSION_COOKIE}=${encodeURIComponent(sign(session))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(0,session.exp-Math.floor(Date.now()/1000))}${secure}`);
}

function clearSession(res) {
  appendCookie(res, `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  appendCookie(res, `${INVITATION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function appendCookie(res, cookie) {
  const previous = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', [...(Array.isArray(previous)?previous:previous?[previous]:[]), cookie]);
}

// Only public course routes may be restored from an invitation, never external URLs.
function invitationReturn(value) {
  const route=String(value||'');
  return /^\/web\/#\/pages\/(?:public-class-detail\/public-class-detail|class-enroll\/class-enroll)\?id=[1-9][0-9]*$/.test(route)
    || route==='/web/#/pages/questionnaire/questionnaire'
    || /^\/web\/#\/pages\/(?:plaza\/plaza|public-class\/public-class)$/.test(route) ? route : '/web/#/pages/plaza/plaza';
}

function readInvitation(req, session=readSession(req)) {
  const token=parseCookies(req)[INVITATION_COOKIE];
  const invitation=token?verify(token):null;
  if(invitation?.kind==='invitation' && /^[1-9][0-9]*$/.test(String(invitation.referrerId||''))
    && (!invitation.accountId || !session || String(invitation.accountId)===String(session.account.id))) return invitation;
  return session?.referrerId ? {referrerId:session.referrerId,returnTo:invitationReturn(session.referralReturn)} : null;
}

function setInvitation(res, invitation) {
  const value={...invitation,kind:'invitation',returnTo:invitationReturn(invitation.returnTo),exp:Math.floor(Date.now()/1000)+INVITATION_SECONDS};
  const secure=process.env.NODE_ENV==='production'?'; Secure':'';
  appendCookie(res,`${INVITATION_COOKIE}=${encodeURIComponent(sign(value))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${INVITATION_SECONDS}${secure}`);
  return value;
}

function invitationRef(req, session, token) {
  return decodeRef(token) || readInvitation(req,session)?.referrerId || null;
}

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch (_) { throw new Error("REMOTE:服务返回格式异常"); }
  if (!response.ok) throw new Error(`REMOTE:HTTP ${response.status}`);
  return data;
}

async function zionGraphql(query, variables, jwt) {
  const headers = {"content-type":"application/json"};
  if (jwt) headers.authorization = `Bearer ${jwt}`;
  const data = await jsonRequest(process.env.ZION_GRAPHQL_URL || DEFAULT_ZION_GRAPHQL_URL, {
    method: "POST", headers, body: JSON.stringify({query, variables: variables || {}})
  });
  if (data.errors && data.errors.length) {
    const error = new Error(`ZION:${data.errors[0].message || "请求失败"}`);
    error.classification = data.errors[0].extensions?.classification;
    throw error;
  }
  return data.data || {};
}

function wechatAppId() {
  return String(process.env.WECHAT_OA_APP_ID || DEFAULT_WECHAT_OA_APP_ID).trim();
}

function wechatAppSecret() {
  return String(process.env.WECHAT_OA_APP_SECRET || process.env.WECHAT_APP_SECRET || "").trim();
}

async function wechatJsapiTicket() {
  const now = Date.now();
  if (wechatJsapiCache.ticket && wechatJsapiCache.ticketExpiresAt > now) return wechatJsapiCache.ticket;
  let accessToken = wechatJsapiCache.accessToken;
  if (!accessToken || wechatJsapiCache.accessExpiresAt <= now) {
    const tokenUrl = new URL("https://api.weixin.qq.com/cgi-bin/token");
    tokenUrl.search = new URLSearchParams({grant_type:"client_credential", appid:wechatAppId(), secret:required("WECHAT_OA_APP_SECRET")}).toString();
    const token = await jsonRequest(tokenUrl);
    if (token.errcode || !token.access_token) throw new Error("AUTH:微信分享配置暂不可用");
    accessToken = token.access_token;
    wechatJsapiCache.accessToken = accessToken;
    wechatJsapiCache.accessExpiresAt = now + Math.max(60, Number(token.expires_in || 7200) - 120) * 1000;
  }
  const ticketUrl = new URL("https://api.weixin.qq.com/cgi-bin/ticket/getticket");
  ticketUrl.search = new URLSearchParams({access_token:accessToken, type:"jsapi"}).toString();
  const result = await jsonRequest(ticketUrl);
  if (result.errcode || !result.ticket) throw new Error("AUTH:微信分享配置暂不可用");
  wechatJsapiCache.ticket = result.ticket;
  wechatJsapiCache.ticketExpiresAt = now + Math.max(60, Number(result.expires_in || 7200) - 120) * 1000;
  return result.ticket;
}

function signWechatShareUrl(ticket, url, nonceStr, timestamp) {
  const source = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
  return crypto.createHash("sha1").update(source).digest("hex");
}

function shareUrlForRequest(req, value) {
  const protocol = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const expected = new URL(process.env.PUBLIC_ORIGIN || `${protocol}://${req.headers.host || "localhost"}`);
  const target = new URL(String(value || ""));
  if (target.origin !== expected.origin || !target.pathname.startsWith("/web")) throw new Error("INPUT:分享地址无效");
  target.hash = "";
  return target.href;
}

async function wechatShareConfig(req, value) {
  const url = shareUrlForRequest(req, value);
  const nonceStr = crypto.randomBytes(12).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000);
  const ticket = await wechatJsapiTicket();
  return {appId:wechatAppId(), timestamp, nonceStr, signature:signWechatShareUrl(ticket,url,nonceStr,timestamp)};
}

async function authenticateWechatWithZion(code) {
  const data = await zionGraphql(`mutation H5WechatLogin($code:String!){
    loginWithWechat(code:$code,createIfNotExists:true){
      account{id username phoneNumber profileImageUrl permissionRoles}
      jwt{token}
    }
  }`, {code});
  const login = data.loginWithWechat;
  if (!login || !login.account || !login.jwt || !login.jwt.token) throw new Error("AUTH:微信身份登录失败");
  const account = login.account;
  return {
    jwt:login.jwt.token,
    account:{
      id:String(account.id),
      name:account.username || "微信用户",
      avatarUrl:account.profileImageUrl || ""
    }
  };
}

async function exchangeWechatCode(code) {
  const tokenUrl = new URL("https://api.weixin.qq.com/sns/oauth2/access_token");
  tokenUrl.search = new URLSearchParams({
    appid:wechatAppId(),
    secret:required("WECHAT_OA_APP_SECRET"),
    code,
    grant_type:"authorization_code"
  }).toString();
  const token = await jsonRequest(tokenUrl);
  if (token.errcode || !token.openid || !token.access_token) throw new Error("AUTH:微信授权已失效，请重新登录");

  const profileUrl = new URL("https://api.weixin.qq.com/sns/userinfo");
  profileUrl.search = new URLSearchParams({
    access_token:token.access_token,
    openid:token.openid,
    lang:"zh_CN"
  }).toString();
  const profile = await jsonRequest(profileUrl);
  if (profile.errcode || !profile.openid) throw new Error("AUTH:无法读取微信用户信息");
  return profile;
}

async function authenticateWechatProfile(profile) {
  const identity = crypto.createHash("sha256").update(`${wechatAppId()}:${profile.openid}`).digest("hex").slice(0, 36);
  const username = `wxh5_${identity}`;
  const password = `ZhS_${crypto.createHmac("sha256", required("SESSION_SECRET")).update(profile.openid).digest("base64url")}`;
  const authenticate = register => zionGraphql(`mutation H5WechatProfileLogin($username:String!,$password:String!,$register:Boolean!){
    authenticateWithUsername(username:$username,password:$password,register:$register){account{id username}jwt{token}}
  }`, {username, password, register});
  let auth;
  try {
    auth = await authenticate(false);
  } catch (error) {
    // Registration is not an upsert: existing accounts must use register:false.
    if (error.classification !== "ACCOUNT_DOES_NOT_EXIST") throw error;
    try {
      auth = await authenticate(true);
    } catch (registrationError) {
      // Another callback may have registered this same WeChat identity meanwhile.
      if (registrationError.classification !== "USERNAME_ALREADY_EXISTS") throw registrationError;
      auth = await authenticate(false);
    }
  }
  const login = auth.authenticateWithUsername;
  if (!login || !login.account || !login.jwt || !login.jwt.token) throw new Error("AUTH:微信身份登录失败");

  const accountData = {
    wechat_nickname:String(profile.nickname || "微信用户").slice(0, 80),
    wechat_avatar_url:String(profile.headimgurl || "").slice(0, 1500),
    wechat_openid:profile.openid,
    wechat_unionid:profile.unionid || "",
    // Business identity is maintained by the account's active service_provider
    // relation (STAFF / AGENT / no relation). Never downgrade it on login.
    last_login_at:new Date().toISOString()
  };
  const updated = await zionGraphql(`mutation UpdateH5WechatProfile($id:bigint!,$data:account_set_input!){
    update_account_by_pk(pk_columns:{id:$id},_set:$data){id username wechat_nickname wechat_avatar_url}
  }`, {id:login.account.id, data:accountData}, login.jwt.token);
  const account = updated.update_account_by_pk || login.account;
  return {
    jwt:login.jwt.token,
    account:{
      id:String(account.id),
      name:account.wechat_nickname || profile.nickname || "微信用户",
      avatarUrl:account.wechat_avatar_url || profile.headimgurl || ""
    }
  };
}

async function authenticateWechatAccount(code) {
  if (!wechatAppSecret()) return authenticateWechatWithZion(code);
  return authenticateWechatProfile(await exchangeWechatCode(code));
}

async function invoke(jwt, operation, payload = {}) {
  const data = await zionGraphql(`mutation H5CourseService($args:Json!){
    fz_invoke_action_flow(actionFlowId:"${ACTION_FLOW_ID}",versionId:${ACTION_FLOW_VERSION},args:$args)
  }`, {args:{operation, payload}}, jwt);
  let output = data.fz_invoke_action_flow;
  if (typeof output === "string") output = JSON.parse(output);
  let result = output && (output.result || output);
  if (typeof result === "string") result = JSON.parse(result);
  if (!result || result.ok !== true) {
    const message = output && (output.message || output.errorMessage || output.error && output.error.message)
      || result && (result.message || result.errorMessage || result.error && result.error.message);
    throw new Error(`COURSE:${message || "课程服务暂不可用"}`);
  }
  return result.data;
}

function refToken(accountId) {
  return sign({kind:"ref", accountId:String(accountId), exp:Math.floor(Date.now()/1000)+60*60*24*180});
}

function decodeRef(token) {
  const data = verify(token);
  return data && data.kind === "ref" && /^[1-9][0-9]*$/.test(String(data.accountId || "")) ? String(data.accountId) : "";
}

function safeReturn(value) {
  const raw = String(value || "/web/");
  return raw.startsWith("/web/") && !raw.startsWith("//") ? raw.slice(0, 500) : "/web/";
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader("Location", location);
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

async function body(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 100000) throw new Error("INPUT:请求内容过长");
  }
  try { return raw ? JSON.parse(raw) : {}; } catch (_) { throw new Error("INPUT:请求格式无效"); }
}

function friendly(error) {
  const message = String(error && error.message || "");
  if (message.startsWith("CONFIG:")) return "网页微信登录尚未完成公众号参数配置";
  if (/wechat authentication web app id does not exist/i.test(message)) return "Zion 尚未配置公众号网页应用，请先填写公众号 AppID 和 AppSecret";
  if (/微信|课程|报名|推荐|问卷|梳理|缴费|支付|手机号|姓名|登录|截止|名额|取消|工作人员|权限|发布|名单/.test(message)) {
    return message.replace(/^(?:AUTH|COURSE|INPUT|ZION):/, "").replace(/^(?:org\.graalvm\.polyglot\.)?PolyglotException:\s*Error:\s*/, "").split("\n")[0].slice(0, 120);
  }
  return "服务暂时不可用，请稍后重试";
}

async function managerBootstrap(session) {
  if (!session) return {canManage:false, managerClasses:[]};
  try {
    const data = await invoke(session.jwt, "STAFF_CLASSES", {});
    return {canManage:true, managerClasses:data.classes || []};
  } catch (_) {
    return {canManage:false, managerClasses:[]};
  }
}

async function bootstrap(req) {
  const session = readSession(req);
  const family = session ? await invoke(session.jwt, "FAMILY_OVERVIEW", {}) : {canInvite:false, role:"GUEST"};
  const [courseData, enrollments, referralStatus, referrals, manager] = await Promise.all([
    invoke(session && session.jwt, "LIST_CLASSES", {}),
    session ? invoke(session.jwt, "MY_ENROLLMENTS", {}) : Promise.resolve({items:[]}),
    session ? invoke(session.jwt, "MY_REFERRAL_STATUS", {}) : Promise.resolve({binding:null}),
    session && family.canInvite ? invoke(session.jwt, "MY_REFERRALS", {}) : Promise.resolve({items:[]}),
    managerBootstrap(session)
  ]);
  return {
    loggedIn:!!session,
    user:session ? session.account : null,
    courses:courseData.classes || [],
    enrollments:enrollments.items || [],
    referralBinding:referralStatus.binding || null,
    referrals:referrals.items || [],
    referralToken:session && family.canInvite ? refToken(session.account.id) : "",
    role:family.role,
    canInvite:!!family.canInvite,
    canManage:manager.canManage,
    managerClasses:manager.managerClasses
  };
}

async function handleApi(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
    const action = url.searchParams.get("action") || "bootstrap";
    // Browser replica uses the existing user session; never an administrator token.
    if (action === "session") {
      const session = readSession(req);
      const invitation=readInvitation(req,session);
      return json(res, 200, {ok:true, data:{loggedIn:!!session, user:session ? session.account : null, invitation:invitation?{returnTo:invitationReturn(invitation.returnTo)}:null}});
    }
    if (action === "share-signature") {
      if (req.method !== "GET") return json(res, 405, {ok:false,message:"请求方式无效"});
      return json(res, 200, {ok:true, data:await wechatShareConfig(req, url.searchParams.get("url"))});
    }
    if (["graphql", "logout", "capture-referral", "enroll", "course-pay", "course-pay-status", "questionnaire-pay"].includes(action)) {
      const origin = req.headers.origin;
      const expected = process.env.PUBLIC_ORIGIN || `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;
      if (req.method !== "POST") return json(res, 405, {ok:false,message:"请求方式无效"});
      if (!String(req.headers["content-type"] || "").startsWith("application/json") || (origin && origin !== new URL(expected).origin)) {
        return json(res, 403, {ok:false,message:"请求来源无效"});
      }
    }
    if(action==='capture-referral') {
      const input=await body(req), current=readSession(req), referrerId=decodeRef(input.ref);
      if(!referrerId)return json(res,400,{ok:false,message:'推荐二维码已失效，请联系分享人重新生成'});
      if(String(referrerId)===String(current?.account?.id))return json(res,200,{ok:true,data:{invitation:null}});
      const previous=readInvitation(req,current), safeTarget=invitationReturn(input.returnTo);
      // Refreshing the login gate must not replace the original course with the plaza.
      const returnTo=safeTarget===input.returnTo?safeTarget:String(previous?.referrerId)===referrerId?invitationReturn(previous.returnTo):safeTarget;
      const invitation=setInvitation(res,{referrerId,returnTo,accountId:current?.account?.id||previous?.accountId||null});
      if(current)setSession(res,{...current,referrerId,referralReturn:invitation.returnTo});
      return json(res,200,{ok:true,data:{invitation:{returnTo:invitation.returnTo}}});
    }
    if (action === "graphql") {
      const input = await body(req);
      if (typeof input.query !== "string" || input.query.length > 60000 || !input.query.trim()) return json(res, 400, {errors:[{message:"请求格式无效"}]});
      const session = readSession(req);
      try {
        const data = await zionGraphql(input.query, input.variables, input.anonymous ? null : session?.jwt);
        return json(res, 200, {data});
      } catch(error) {
        return json(res, 200, {errors:[{message:friendly(error)}]});
      }
    }
    if (action === "login") {
      const current=readSession(req), invitation=readInvitation(req,current);
      const referrerId=invitationRef(req,current,url.searchParams.get('ref'));
      const returnTo=referrerId?invitationReturn(invitation?.returnTo||url.searchParams.get('return')):'/web/#/pages/index/index';
      const invitationAccountId=current?.account?.id||invitation?.accountId||null;
      if(referrerId)setInvitation(res,{referrerId,returnTo,accountId:invitationAccountId});
      const state = sign({kind:"oauth", referrerId, returnTo, invitationAccountId, exp:Math.floor(Date.now()/1000)+600});
      const origin = process.env.PUBLIC_ORIGIN || `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
      const callback = `${origin.replace(/\/$/, "")}/api/wechat-oauth-callback`;
      const auth = "https://open.weixin.qq.com/connect/oauth2/authorize"
        + `?appid=${encodeURIComponent(wechatAppId())}`
        + `&redirect_uri=${encodeURIComponent(callback)}&response_type=code&scope=snsapi_userinfo&state=${encodeURIComponent(state)}#wechat_redirect`;
      return redirect(res, auth);
    }
    if (action === "logout") { clearSession(res); return json(res, 200, {ok:true}); }
    if (action === "bootstrap") return json(res, 200, {ok:true, data:await bootstrap(req)});
    if (action === "course") return json(res, 200, {ok:true, data:await invoke(readSession(req)?.jwt, "GET_CLASS", {classId:url.searchParams.get("id")})});
    if (action === "referral-context") {
      if (req.method !== "GET") return json(res,405,{ok:false,message:"请求方式无效"});
      const current = readSession(req);
      const forwardedReferrer=invitationRef(req,current,url.searchParams.get("ref"));
      const data = await invoke(current?.jwt, "REFERRAL_OVERVIEW", {referrerId:forwardedReferrer});
      const token = current && data.canInvite ? refToken(current.account.id) : "";
      const origin = process.env.PUBLIC_ORIGIN || `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
      const link = new URL('/web/', origin);
      if (token) link.searchParams.set('ref', token);
      const classId = url.searchParams.get('classId'),target=url.searchParams.get('target');
      link.hash = target==='questionnaire' ? '/pages/questionnaire/questionnaire' : classId && /^[1-9][0-9]*$/.test(classId) ? '/pages/public-class-detail/public-class-detail?id='+classId : '/pages/plaza/plaza';
      return json(res,200,{ok:true,data:{...data,referralToken:token,forwardToken:forwardedReferrer?refToken(forwardedReferrer):'',shareUrl:token?link.href:""}});
    }
    if (action === "questionnaire-context") {
      if (req.method !== "GET") return json(res,405,{ok:false,message:"请求方式无效"});
      const current=readSession(req),referrerId=invitationRef(req,current,url.searchParams.get('ref'));
      return json(res,200,{ok:true,data:await invoke(current?.jwt,'GET_QUESTIONNAIRE',{referrerId})});
    }
    const session = readSession(req);
    if (!session) return json(res, 401, {ok:false, message:"请先微信登录"});
    if (action === "staff" && req.method === "GET") return json(res, 200, {ok:true, data:await invoke(session.jwt, "STAFF_CLASSES", {})});
    if (action === "roster" && req.method === "GET") return json(res, 200, {ok:true, data:await invoke(session.jwt, "COURSE_ROSTER", {classId:url.searchParams.get("classId")})});
    if (req.method !== "POST" && action !== "referrals") return json(res, 405, {ok:false, message:"请求方式无效"});
    if (action === "referrals") return json(res, 200, {ok:true, data:await invoke(session.jwt, "MY_REFERRALS", {})});
    const input = await body(req);
    if (action === "questionnaire-pay") {
      const referrerId=invitationRef(req,session,input.ref),context=await invoke(session.jwt,'GET_QUESTIONNAIRE',{referrerId});
      return json(res,200,{ok:true,data:await require('./course-payment').prepare(invoke,session.jwt,{classId:context.offer.id,name:input.name,phone:input.phone,referrerId})});
    }
    if (action === "course-pay") return json(res,200,{ok:true,data:await require('./course-payment').prepare(invoke,session.jwt,{classId:input.classId,name:input.name,phone:input.phone,referrerId:invitationRef(req,session,input.ref)})});
    if (action === "course-pay-status") return json(res,200,{ok:true,data:await require('./course-payment').status(invoke,session.jwt,input.orderId)});
    if (action === "enroll") return json(res, 200, {ok:true, data:await invoke(session.jwt, "ENROLL", {classId:input.classId,name:input.name,phone:input.phone,referrerId:invitationRef(req,session,input.ref)})});
    if (action === "cancel") return json(res, 200, {ok:true, data:await invoke(session.jwt, "CANCEL_ENROLLMENT", {enrollmentId:input.enrollmentId})});
    if (action === "saveClass") return json(res, 200, {ok:true, data:await invoke(session.jwt, "SAVE_CLASS", {
      status:"PUBLISHED", title:input.title, description:input.description, city:input.city,
      capacity:input.capacity, groupGuide:input.groupGuide, notice:input.notice,
      startsAt:input.startsAt, registrationClosesAt:input.registrationClosesAt || null,
      checkinClosesAt:input.checkinClosesAt || null
    })});
    return json(res, 404, {ok:false, message:"接口不存在"});
  } catch (error) {
    return json(res, 500, {ok:false, message:friendly(error)});
  }
}

async function handleOauthCallback(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
    const state = verify(url.searchParams.get("state"));
    if (!state || state.kind !== "oauth") throw new Error("AUTH:登录请求已过期，请重新发起");
    const code = url.searchParams.get("code");
    if (!code) throw new Error("AUTH:未获得微信授权");
    const login = await authenticateWechatAccount(code);
    // Keep the invitation through login; Zion binds ownership only after enrollment.
    const sameAccount=!state.invitationAccountId||String(state.invitationAccountId)===String(login.account.id);
    const referrerId = sameAccount && state.referrerId && String(state.referrerId) !== String(login.account.id) ? state.referrerId : null;
    const returnTo=referrerId?invitationReturn(state.returnTo):'/web/#/pages/index/index';
    setSession(res, {jwt:login.jwt, account:login.account, referrerId, referralReturn:returnTo, exp:Math.floor(Date.now()/1000)+SESSION_SECONDS});
    if(referrerId)setInvitation(res,{referrerId,returnTo,accountId:login.account.id});
    else appendCookie(res,`${INVITATION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    return redirect(res, returnTo);
  } catch (error) {
    return redirect(res, `/web/?loginError=${encodeURIComponent(friendly(error))}`);
  }
}

async function handlePaymentNotify(req,res){return require('./course-payment').notify(req,res,invoke);}
module.exports = {handleApi, handleOauthCallback, handlePaymentNotify, sign, verify, decodeRef, refToken, safeReturn, friendly, wechatAppId, wechatAppSecret, authenticateWechatAccount, signWechatShareUrl, shareUrlForRequest};
