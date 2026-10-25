// Payment OAuth is separate from website login so changing the collecting company
// cannot create a second business account or replace staff/referral identities.
const crypto = require('node:crypto');
const APP_ID = 'wx8daa76a8eb887e47';
const MERCHANT_ID = '1119085869';
const COOKIE = 'zhishou_payment_identity';
const NONCE_COOKIE = 'zhishou_payment_oauth';
function cookie(req, name, verify) {
  const raw = String(req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  if (!raw) return null;
  try { return verify(decodeURIComponent(raw.slice(name.length + 1))); } catch (_) { return null; }
}
function identity(req, session, verify) {
  const value = cookie(req, COOKIE, verify);
  return value && session && value.appId === APP_ID && value.merchantId === MERCHANT_ID
    && value.accountId === String(session.account.id) && typeof value.ticket === 'string' ? value.ticket : '';
}
function returnPath(raw) {
  const url = new URL(String(raw || '/web/'), 'https://local.invalid');
  if (url.origin !== 'https://local.invalid' || url.pathname !== '/web/') return '/web/';
  url.searchParams.delete('paymentError');
  return url.pathname + url.search + url.hash;
}
function setCookie(res, name, value, seconds, ctx) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  ctx.appendCookie(res, `${name}=${encodeURIComponent(ctx.sign(value))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${secure}`);
}
async function handle(action, req, res, ctx) {
  const {session, invoke, sign, verify, json, redirect} = ctx;
  if (!session) return json(res, 401, {ok:false, message:'请先微信登录'});
  const url = new URL(req.url, 'https://local.invalid');
  if (action === 'payment-access') {
    const access = await invoke(session.jwt, 'PAYMENT_ACCESS', {});
    if (access.appId !== APP_ID || access.merchantId !== MERCHANT_ID) throw new Error('微信支付收款配置正在更新，请稍后重试');
    const authorized=!!identity(req, session, verify);
    if(!authorized&&ctx.body&&ctx.setSession){const input=await ctx.body(req);if(typeof input.name==='string'&&input.name.length<=60&&/^1[3-9][0-9]{9}$/.test(input.phone||''))ctx.setSession(res,{...session,paymentContact:{name:input.name,phone:input.phone,returnTo:returnPath(input.returnTo),exp:Math.floor(Date.now()/1000)+600}});}
    return json(res, 200, {ok:true, data:{...access, authorized}});
  }
  if (!/MicroMessenger/i.test(req.headers['user-agent'] || '')) return json(res, 403, {ok:false, message:'请在微信中打开网页后缴费'});
  if (req.method !== 'GET') return json(res, 405, {ok:false, message:'请求方式无效'});
  if (action === 'payment-login') {
    const access = await invoke(session.jwt, 'PAYMENT_ACCESS', {});
    if (access.appId !== APP_ID || access.merchantId !== MERCHANT_ID) throw new Error('微信支付收款配置正在更新，请稍后重试');
    const nonce = crypto.randomBytes(24).toString('hex'), exp = Math.floor(Date.now()/1000) + 600;
    const binding = crypto.createHash('sha256').update(session.jwt).digest('hex');
    const state = {kind:'payment-oauth', accountId:String(session.account.id), nonce, binding, returnTo:returnPath(url.searchParams.get('return')), exp};
    setCookie(res, NONCE_COOKIE, state, 600, ctx);
    const origin = process.env.PUBLIC_ORIGIN || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
    const callback = new URL('/api/h5?action=payment-callback', origin).href;
    const authorization = new URL('https://open.weixin.qq.com/connect/oauth2/authorize');
    authorization.search = new URLSearchParams({appid:APP_ID, redirect_uri:callback, response_type:'code', scope:'snsapi_base', state:nonce}).toString();
    authorization.hash = 'wechat_redirect';
    return redirect(res, authorization.href);
  }
  const state = cookie(req, NONCE_COOKIE, verify);
  const binding = crypto.createHash('sha256').update(session.jwt).digest('hex');
  if (!state || state.kind !== 'payment-oauth' || state.accountId !== String(session.account.id)
    || url.searchParams.get('state') !== state.nonce || state.binding !== binding) {
    return json(res, 400, {ok:false, message:'微信支付授权已过期，请返回课程页面重试'});
  }
  ctx.appendCookie(res, `${NONCE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  const target = new URL(returnPath(state.returnTo), 'https://local.invalid');
  try {
    const code = url.searchParams.get('code');
    if (!code || code.length > 256) throw new Error('微信支付授权未完成，请重试');
    const authorized = await invoke(session.jwt, 'AUTHORIZE_PAYMENT', {code});
    if (authorized.appId !== APP_ID || authorized.merchantId !== MERCHANT_ID || typeof authorized.ticket !== 'string'
      || !Number.isInteger(authorized.expiresAt) || authorized.expiresAt <= Date.now()/1000
      || authorized.expiresAt > Date.now()/1000 + 7200) throw new Error('微信支付授权失败，请重试');
    setCookie(res, COOKIE, {accountId:String(session.account.id), appId:APP_ID, merchantId:MERCHANT_ID, ticket:authorized.ticket, exp:authorized.expiresAt}, Math.floor(authorized.expiresAt-Date.now()/1000), ctx);
  } catch (_) {
    target.searchParams.set('paymentError', '微信支付授权未完成，请重新点击缴费；如持续失败，请联系工作人员检查新服务号配置');
  }
  return redirect(res, target.pathname + target.search + target.hash);
}
module.exports = {APP_ID, MERCHANT_ID, COOKIE, NONCE_COOKIE, identity, returnPath, handle};
