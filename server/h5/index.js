const crypto = require("crypto");

const DEFAULT_ZION_GRAPHQL_URL = "https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2";
const ACTION_FLOW_ID = "9f60a0be-4628-4268-a769-661264846cf4";
const ACTION_FLOW_VERSION = 1;
const SESSION_COOKIE = "zhishou_h5_session";
const SESSION_SECONDS = 60 * 60 * 24 * 14;

function required(name) {
  const value = process.env[name];
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
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(sign(session))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}${secure}`);
}

function clearSession(res) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
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
  if (data.errors && data.errors.length) throw new Error(`ZION:${data.errors[0].message || "请求失败"}`);
  return data.data || {};
}

async function authenticateWechatAccount(profile) {
  const secret = required("SESSION_SECRET");
  const appId = required("WECHAT_OA_APP_ID");
  const identity = crypto.createHash("sha256").update(`${appId}:${profile.openid}`).digest("hex").slice(0, 36);
  const username = `wxh5_${identity}`;
  const password = `ZhS_${crypto.createHmac("sha256", secret).update(profile.openid).digest("base64url")}`;
  const data = await zionGraphql(`mutation H5WechatLogin($username:String!,$password:String!){
    authenticateWithUsername(username:$username,password:$password,register:true){account{id username}jwt{token}}
  }`, {username, password});
  const login = data.authenticateWithUsername;
  if (!login || !login.account || !login.jwt || !login.jwt.token) throw new Error("AUTH:微信身份登录失败");
  const accountData = {
    wechat_nickname: String(profile.nickname || "微信用户").slice(0, 80),
    wechat_avatar_url: String(profile.headimgurl || "").slice(0, 1500),
    wechat_openid: profile.openid,
    wechat_unionid: profile.unionid || "",
    user_type: "customer",
    last_login_at: new Date().toISOString()
  };
  const updated = await zionGraphql(`mutation UpdateH5WechatProfile($id:bigint!,$data:account_set_input!){
    update_account_by_pk(pk_columns:{id:$id},_set:$data){id username wechat_nickname wechat_avatar_url}
  }`, {id:login.account.id, data:accountData}, login.jwt.token);
  const account = updated.update_account_by_pk || login.account;
  return {jwt:login.jwt.token, account:{id:String(account.id), name:account.wechat_nickname || profile.nickname || "微信用户", avatarUrl:account.wechat_avatar_url || profile.headimgurl || ""}};
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

async function exchangeWechatCode(code) {
  const appid = required("WECHAT_OA_APP_ID");
  const secret = required("WECHAT_OA_APP_SECRET");
  const tokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token"
    + `?appid=${encodeURIComponent(appid)}&secret=${encodeURIComponent(secret)}`
    + `&code=${encodeURIComponent(code)}&grant_type=authorization_code`;
  const token = await jsonRequest(tokenUrl);
  if (token.errcode || !token.openid || !token.access_token) throw new Error("AUTH:微信授权已失效，请重新登录");
  const profileUrl = "https://api.weixin.qq.com/sns/userinfo"
    + `?access_token=${encodeURIComponent(token.access_token)}&openid=${encodeURIComponent(token.openid)}&lang=zh_CN`;
  const profile = await jsonRequest(profileUrl);
  if (profile.errcode || !profile.openid) throw new Error("AUTH:无法读取微信用户信息");
  return profile;
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
  if (/微信|课程|报名|推荐|手机号|姓名|登录|截止|名额|取消|工作人员|权限|发布|名单/.test(message)) {
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
  const [courseData, enrollments, referralStatus, referrals, manager] = await Promise.all([
    invoke(session && session.jwt, "LIST_CLASSES", {}),
    session ? invoke(session.jwt, "MY_ENROLLMENTS", {}) : Promise.resolve({items:[]}),
    session ? invoke(session.jwt, "MY_REFERRAL_STATUS", {}) : Promise.resolve({binding:null}),
    session ? invoke(session.jwt, "MY_REFERRALS", {}) : Promise.resolve({items:[]}),
    managerBootstrap(session)
  ]);
  return {
    loggedIn:!!session,
    user:session ? session.account : null,
    courses:courseData.classes || [],
    enrollments:enrollments.items || [],
    referralBinding:referralStatus.binding || null,
    referrals:referrals.items || [],
    referralToken:session ? refToken(session.account.id) : "",
    canManage:manager.canManage,
    managerClasses:manager.managerClasses
  };
}

async function handleApi(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
    const action = url.searchParams.get("action") || "bootstrap";
    if (action === "login") {
      const state = sign({kind:"oauth", referrerId:decodeRef(url.searchParams.get("ref")), returnTo:safeReturn(url.searchParams.get("return")), exp:Math.floor(Date.now()/1000)+600});
      const origin = process.env.PUBLIC_ORIGIN || `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
      const callback = `${origin.replace(/\/$/, "")}/api/wechat-oauth-callback`;
      const auth = "https://open.weixin.qq.com/connect/oauth2/authorize"
        + `?appid=${encodeURIComponent(required("WECHAT_OA_APP_ID"))}`
        + `&redirect_uri=${encodeURIComponent(callback)}&response_type=code&scope=snsapi_userinfo&state=${encodeURIComponent(state)}#wechat_redirect`;
      return redirect(res, auth);
    }
    if (action === "logout") { clearSession(res); return json(res, 200, {ok:true}); }
    if (action === "bootstrap") return json(res, 200, {ok:true, data:await bootstrap(req)});
    if (action === "course") return json(res, 200, {ok:true, data:await invoke(readSession(req)?.jwt, "GET_CLASS", {classId:url.searchParams.get("id")})});
    const session = readSession(req);
    if (!session) return json(res, 401, {ok:false, message:"请先微信登录"});
    if (action === "staff" && req.method === "GET") return json(res, 200, {ok:true, data:await invoke(session.jwt, "STAFF_CLASSES", {})});
    if (action === "roster" && req.method === "GET") return json(res, 200, {ok:true, data:await invoke(session.jwt, "COURSE_ROSTER", {classId:url.searchParams.get("classId")})});
    if (req.method !== "POST" && action !== "referrals") return json(res, 405, {ok:false, message:"请求方式无效"});
    if (action === "referrals") return json(res, 200, {ok:true, data:await invoke(session.jwt, "MY_REFERRALS", {})});
    const input = await body(req);
    if (action === "enroll") return json(res, 200, {ok:true, data:await invoke(session.jwt, "ENROLL", {classId:input.classId,name:input.name,phone:input.phone})});
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
    const profile = await exchangeWechatCode(code);
    const login = await authenticateWechatAccount(profile);
    if (state.referrerId && String(state.referrerId) !== String(login.account.id)) {
      await invoke(login.jwt, "LOCK_REFERRER", {referrerId:state.referrerId});
    }
    setSession(res, {jwt:login.jwt, account:login.account, exp:Math.floor(Date.now()/1000)+SESSION_SECONDS});
    return redirect(res, safeReturn(state.returnTo));
  } catch (error) {
    return redirect(res, `/web/?loginError=${encodeURIComponent(friendly(error))}`);
  }
}

module.exports = {handleApi, handleOauthCallback, sign, verify, decodeRef, refToken, safeReturn, friendly};
