const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http');
process.env.SESSION_SECRET='isolated-course-invitation-deadline-test-secret';
const {sign,verify,refToken}=require('../../server/h5');
const {createServer}=require('../../index');

test('课程邀请依据实时截止时间，兼容旧码且不放宽登录凭据有效期',async t=>{
 const originalFetch=global.fetch,originalSecret=process.env.WECHAT_OA_APP_SECRET;
 process.env.WECHAT_OA_APP_SECRET='test-only-secret';
 let course={id:'16',status:'PUBLISHED',starts_at:'2099-10-17T06:00:00Z',registration_closes_at:'2099-10-16T10:00:00Z'},expiredSession=false;
 const operations=[];
 global.fetch=async(url,options={})=>{
  const response=data=>({ok:true,text:async()=>JSON.stringify(data)});
  const {query,variables}=JSON.parse(options.body);
  if(variables.args?.operation==='WEBSITE_WECHAT_LOGIN')return response({data:{fz_invoke_action_flow:{result:{ok:true,data:{appId:'wx8daa76a8eb887e47',profile:{openid:'new-test-user',unionid:'same-test-union',nickname:'合成'},existingAccount:null}}}}});
  if(query.includes('authenticateWithUsername'))return response({data:{authenticateWithUsername:{account:{id:'101'},jwt:{token:'fresh-jwt'}}}});
  if(query.includes('UpdateH5WechatProfile'))return response({data:{update_account_by_pk:{id:'101'}}});
  const {operation,payload}=variables.args;operations.push({operation,payload,auth:options.headers.authorization});
  if(operation==='BIND_INVITATION'&&expiredSession&&options.headers.authorization==='Bearer stale-jwt')return response({errors:[{message:'Error: 请先微信登录',extensions:{classification:'ACTION_FLOW_GENERIC'}}]});
  return response({data:{fz_invoke_action_flow:{result:{ok:true,data:operation==='GET_CLASS'?{classInfo:course}:operation==='REFERRAL_OVERVIEW'?{canInvite:true}:{} }}}});
 };
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(()=>{server.close();global.fetch=originalFetch;if(originalSecret===undefined)delete process.env.WECHAT_OA_APP_SECRET;else process.env.WECHAT_OA_APP_SECRET=originalSecret;});
 const jar=new Map();
 async function req(action,input){return new Promise((resolve,reject)=>{const r=http.request({host:'127.0.0.1',port:server.address().port,path:action.startsWith('/api/')?action:'/api/h5?action='+action,method:input?'POST':'GET',headers:{'User-Agent':'MicroMessenger/8.0',Cookie:[...jar].map(([k,v])=>k+'='+v).join('; '),...(input?{'Content-Type':'application/json'}:{})}},res=>{let raw='';res.on('data',c=>raw+=c);res.on('end',()=>{for(const cookie of res.headers['set-cookie']||[]){const pair=cookie.split(';')[0],i=pair.indexOf('=');jar.set(pair.slice(0,i),pair.slice(i+1));}resolve({status:res.statusCode,headers:res.headers,body:raw?JSON.parse(raw):null});});});r.on('error',reject);r.end(input?JSON.stringify(input):undefined);});}
 const returnTo='/web/#/pages/public-class-detail/public-class-detail?id=16';
 const capture=ref=>req('capture-referral',{ref,returnTo});
 jar.set('zhishou_h5_session',sign({account:{id:'17'},jwt:'fresh-jwt',exp:Math.floor(Date.now()/1000)+60}));
 const shared=await req('referral-context&classId=16');assert.equal(shared.status,200);
 const token=new URL(shared.body.data.shareUrl).searchParams.get('ref');assert.equal(verify(token).classId,'16');assert.equal(verify(token).exp,undefined,'课程不再依赖生成日起的固定天数');
 jar.clear();assert.equal((await capture(token)).status,200);assert.equal(operations.find(c=>c.operation==='GET_CLASS').auth,undefined,'课程有效期只读，不依赖旧登录');
 assert.equal((await capture(sign({kind:'ref',accountId:'17',exp:1}))).status,200,'旧签名码在该课程截止前仍可用');
 assert.equal((await req('capture-referral',{ref:sign({kind:'ref',accountId:'17',exp:1}),returnTo:'/web/#/pages/plaza/plaza'})).status,400,'非课程旧码仍按原有效期处理');
 assert.equal((await capture(token.slice(0,-1)+(token.endsWith('a')?'b':'a'))).status,400);
 assert.equal((await req('capture-referral',{ref:token,returnTo:'/web/#/pages/public-class-detail/public-class-detail?id=99'})).status,400,'绑定课程不能篡改');
 const saved={...course};course={...saved,registration_closes_at:new Date(Date.now()-1000).toISOString()};
 const closed=await capture(token);assert.equal(closed.status,400);assert.equal(closed.body.code,'INVITATION_UNAVAILABLE','截止是最终结果，前端不再锁住全部页面');assert.match(closed.body.message,/报名已截止/);assert.equal(closed.body.ticketClass,'16','截止后报名码改为打开本人入场码');
 course={...saved,registration_closes_at:null,starts_at:new Date(Date.now()-1000).toISOString()};assert.match((await capture(token)).body.message,/报名已截止/);
 course={...saved,status:'CLOSED'};assert.match((await capture(token)).body.message,/暂未开放/);
 course=saved;assert.equal((await capture(token)).status,200,'延后截止时间时原二维码恢复，无需重发');
 const login=await req('login');assert.equal(login.status,302);const state=new URL(login.headers.location).searchParams.get('state');
 course={...saved,registration_closes_at:new Date(Date.now()-1000).toISOString()};const before=operations.filter(c=>c.operation==='BIND_INVITATION').length;
 const callback=await req('/api/wechat-oauth-callback?'+new URLSearchParams({state,code:'test-only-code'}));assert.equal(callback.headers.location,'/web/?ticketClass=16#/pages/index/index','授权期间截止仍完成登录，并直接打开本场入场码');assert.equal(operations.filter(c=>c.operation==='BIND_INVITATION').length,before,'授权期间截止，不写入推荐绑定');
 const signedIn=await req('session');assert.equal(signedIn.body.data.loggedIn,true,'家长登录不被已截止的报名码阻断');assert.equal(signedIn.body.data.invitation,null);
 jar.delete('zhishou_h5_session');jar.set('zhishou_invitation',encodeURIComponent(sign({kind:'invitation',referrerId:'17',returnTo,exp:Math.floor(Date.now()/1000)+600})));const relogin=await req('login');const reloginState=verify(decodeURIComponent(jar.get('zhishou_h5_oauth')));assert.equal(reloginState.referrerId,null,'已截止课程的旧邀请不再阻断重新登录');assert.equal(reloginState.ticketClass,'16','已截止课程的邀请登录后打开入场码');assert.equal(jar.get('zhishou_invitation'),'','旧邀请随之清除');
 assert.equal(verify(sign({kind:'oauth',exp:1})),null);assert.equal(verify(sign({account:{id:'101'},jwt:'stale',exp:1})),null);
 course=saved;expiredSession=true;jar.set('zhishou_h5_session',sign({account:{id:'101'},jwt:'stale-jwt',exp:Math.floor(Date.now()/1000)+60}));
 const stale=await capture(token);assert.equal(stale.status,401);assert.equal(stale.body.code,'INVITATION_LOGIN_REQUIRED');assert.ok(jar.get('zhishou_invitation'),'登录过期仍保存原课程');
 const reauth=await req('login');assert.equal(verify(decodeURIComponent(jar.get('zhishou_h5_oauth'))).returnTo,returnTo);
});
