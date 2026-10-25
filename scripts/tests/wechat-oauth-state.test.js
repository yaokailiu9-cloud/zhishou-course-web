const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http');
process.env.SESSION_SECRET='oauth-state-boundary-test-only-secret';
const {sign,verify,refToken}=require('../../server/h5'),{createServer}=require('../../index');
async function setup(t){const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));t.after(()=>s.close());return (path,cookie='')=>new Promise((resolve,reject)=>{const req=http.request({host:'127.0.0.1',port:s.address().port,path,headers:{'user-agent':'MicroMessenger/8.0',cookie}},res=>{let body='';res.on('data',v=>body+=v);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));});req.on('error',reject);req.end();});}
function stateOf(r){const state=new URL(r.headers.location).searchParams.get('state'),cookie=r.headers['set-cookie'].find(x=>x.startsWith('zhishou_h5_oauth=')).split(';')[0];return {state,cookie,value:verify(decodeURIComponent(cookie.slice(cookie.indexOf('=')+1)))};}
test('网页登录state符合微信128字节限制，完整数据在签名HttpOnly cookie，包含新服务号和10分钟过期',async t=>{
 const req=await setup(t),returnTo='/web/#/pages/questionnaire/questionnaire';
 const result=await req('/api/h5?action=login&ref='+encodeURIComponent(refToken('17'))+'&return='+encodeURIComponent(returnTo));
 assert.equal(result.status,302);const {state,cookie,value}=stateOf(result),auth=new URL(result.headers.location);
 assert.match(state,/^[0-9a-f]{48}$/);assert.ok(Buffer.byteLength(state)<=128);assert.equal(auth.searchParams.get('appid'),'wx8daa76a8eb887e47');assert.equal(auth.searchParams.get('scope'),'snsapi_userinfo');assert.equal(value.nonce,state);assert.equal(value.referrerId,'17');assert.equal(value.returnTo,returnTo);assert.equal(value.appId,'wx8daa76a8eb887e47');assert.ok(value.exp> Date.now()/1000+590 && value.exp<=Date.now()/1000+600);
 assert.match(result.headers['set-cookie'].find(x=>x.startsWith('zhishou_h5_oauth=')),/HttpOnly; SameSite=Lax; Max-Age=600/);assert.ok(!auth.href.includes('referrerId'));assert.ok(!cookie.includes('private-user-jwt'));
});
test('跨浏览器nonce、缺少或篡改cookie、过期、错误公众号和旧的超长state均在换码前拒绝',async t=>{
 const req=await setup(t),a=stateOf(await req('/api/h5?action=login')),b=stateOf(await req('/api/h5?action=login'));
 const original=global.fetch;let calls=0;global.fetch=async()=>{calls++;throw new Error('must reject before contacting backend')};t.after(()=>global.fetch=original);
 const cookieFor=value=>'zhishou_h5_oauth='+encodeURIComponent(sign(value));
 for(const [state,cookie] of [[a.state,''],[a.state,b.cookie],[a.state,a.cookie+'tampered'],[a.state,cookieFor({...a.value,exp:1})],[a.state,cookieFor({...a.value,appId:'wx6dafecca8d5fd24e'})],[sign({kind:'oauth',exp:Math.floor(Date.now()/1000)+600}),a.cookie]]){
  const result=await req('/api/wechat-oauth-callback?'+new URLSearchParams({state,code:'one-time-code'}),cookie);
  assert.equal(result.status,302);assert.match(new URL(result.headers.location,'https://local').searchParams.get('loginError'),/过期|当前微信窗口/);assert.ok(!(result.headers['set-cookie']||[]).some(c=>c.startsWith('zhishou_h5_session=')));
 }
 assert.equal(calls,0);
});
test('合法nonce仅使用cookie中的返回数据，授权拒绝后清除待登录cookie',async t=>{
 const req=await setup(t),{state,cookie}=stateOf(await req('/api/h5?action=login'));
 const result=await req('/api/wechat-oauth-callback?'+new URLSearchParams({state,referrerId:'999',returnTo:'https://evil.invalid'}),cookie);
 assert.match(new URL(result.headers.location,'https://local').searchParams.get('loginError'),/未获得微信授权/);assert.ok(result.headers['set-cookie'].some(c=>c.startsWith('zhishou_h5_oauth=;')&&c.includes('Max-Age=0')));
});
