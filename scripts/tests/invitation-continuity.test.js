const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http');
process.env.SESSION_SECRET='invitation-test-only-signing-secret';
const {sign,verify,refToken,decodeRef}=require('../../server/h5');
const {createServer}=require('../../index');
test('扫码邀请跨登录、刷新、无参数首页、支付和登录重试保留；换号不串来源',async t=>{
 const originalFetch=global.fetch,originalSecret=process.env.WECHAT_OA_APP_SECRET;
 process.env.WECHAT_OA_APP_SECRET='test-wechat-secret';let actor='101';const operations=[];
 global.fetch=async(url,options={})=>{
  let value;
  if(String(url).includes('/sns/oauth2/access_token'))value=new URL(url).searchParams.get('code')==='denied'?{errcode:40029}:{openid:'test-'+actor,access_token:'test-access'};
  else if(String(url).includes('/sns/userinfo'))value={openid:'test-'+actor,nickname:'合成用户'};
  else {const {query,variables}=JSON.parse(options.body);
   if(query.includes('authenticateWithUsername'))value={data:{authenticateWithUsername:{account:{id:actor},jwt:{token:'jwt-'+actor}}}};
   else if(query.includes('UpdateH5WechatProfile'))value={data:{update_account_by_pk:{id:actor,wechat_nickname:'合成用户'}}};
   else {operations.push(variables.args);const op=variables.args.operation;value={data:{fz_invoke_action_flow:{result:{ok:true,data:op==='PREPARE_COURSE_PAYMENT'?{enrollment:{id:8}}:op==='ENROLL'?{enrollment:{id:7}}:{candidate:{name:'合成推荐人'}}}}}};}
  }
  return {ok:true,text:async()=>JSON.stringify(value)};
 };
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(()=>{server.close();global.fetch=originalFetch;if(originalSecret===undefined)delete process.env.WECHAT_OA_APP_SECRET;else process.env.WECHAT_OA_APP_SECRET=originalSecret;});
 const jar=new Map();
 async function req(path,input,headers={},cookies=jar){return new Promise((resolve,reject)=>{const r=http.request({host:'127.0.0.1',port:server.address().port,path,method:input?'POST':'GET',headers:{Cookie:[...cookies].map(([k,v])=>k+'='+v).join('; '),...(input?{'Content-Type':'application/json'}:{}),...headers}},res=>{let raw='';res.on('data',c=>raw+=c);res.on('end',()=>{for(const item of res.headers['set-cookie']||[]){const pair=item.split(';')[0],i=pair.indexOf('=');if(item.includes('Max-Age=0'))cookies.delete(pair.slice(0,i));else cookies.set(pair.slice(0,i),pair.slice(i+1));}resolve({status:res.statusCode,headers:res.headers,raw,data:raw?JSON.parse(raw).data:null});});});r.on('error',reject);r.end(input?JSON.stringify(input):undefined);});}
 const returnTo='/web/#/pages/public-class-detail/public-class-detail?id=7';
 const capture=await req('/api/h5?action=capture-referral',{ref:refToken('17'),returnTo});
 assert.equal(capture.status,200);assert.match(capture.headers['set-cookie'][0],/HttpOnly; SameSite=Lax/);
 assert.equal((await req('/api/h5?action=session')).data.invitation.returnTo,returnTo);
 await req('/api/h5?action=capture-referral',{ref:refToken('17'),returnTo:'/web/#/pages/invite-login/invite-login'});
 assert.equal((await req('/api/h5?action=session')).data.invitation.returnTo,returnTo,'刷新登录门槛不覆盖原课程');
 let login=await req('/api/h5?action=login');let state=new URL(login.headers.location).searchParams.get('state');
 assert.equal(verify(state).referrerId,'17');assert.equal(verify(state).returnTo,returnTo);
 const denied=await req('/api/wechat-oauth-callback?'+new URLSearchParams({code:'denied',state}));assert.match(denied.headers.location,/loginError/);
 assert.equal((await req('/api/h5?action=session')).data.invitation.returnTo,returnTo,'登录失败后的刷新保留原场次');
 login=await req('/api/h5?action=login');state=new URL(login.headers.location).searchParams.get('state');
 const callback=await req('/api/wechat-oauth-callback?'+new URLSearchParams({code:'ok',state}));assert.equal(callback.headers.location,returnTo);
 const session=await req('/api/h5?action=session');assert.equal(session.data.loggedIn,true);assert.equal(session.data.user.id,'101');assert.equal(session.data.invitation.returnTo,returnTo);assert.ok(!session.raw.includes('jwt-101'));
 const context=await req('/api/h5?action=referral-context');assert.equal(decodeRef(context.data.forwardToken),'17','登录后 URL 无参数时转发仍保留推荐人');assert.equal(context.data.referralToken,'','普通用户不能生成自己的代理码');
 await req('/api/h5?action=enroll',{classId:7,name:'合成',phone:'13800000000'});assert.equal(operations.at(-1).payload.referrerId,'17');
 await req('/api/h5?action=course-pay',{classId:7,name:'合成',phone:'13800000000'});assert.equal(operations.at(-1).payload.referrerId,'17');
 const before=verify(decodeURIComponent(jar.get('zhishou_h5_session')));
 await req('/api/h5?action=capture-referral',{ref:refToken('19'),returnTo});
 const after=verify(decodeURIComponent(jar.get('zhishou_h5_session')));assert.equal(after.jwt,before.jwt);assert.equal(after.exp,before.exp);assert.equal(after.referrerId,'19');
 assert.equal((await req('/api/h5?action=capture-referral',{ref:'forged',returnTo})).status,400);
 await req('/api/h5?action=enroll',{classId:7});assert.equal(operations.at(-1).payload.referrerId,'19');
 assert.equal((await req('/api/h5?action=capture-referral',{ref:refToken('20'),returnTo},{Origin:'https://evil.invalid'})).status,403);
 jar.delete('zhishou_h5_session');login=await req('/api/h5?action=login');state=new URL(login.headers.location).searchParams.get('state');assert.equal(verify(state).invitationAccountId,'101');
 assert.equal((await req('/api/wechat-oauth-callback?'+new URLSearchParams({code:'same-account',state}))).headers.location,returnTo,'会话到期后同一微信重新登录可恢复');
 jar.delete('zhishou_h5_session');login=await req('/api/h5?action=login');state=new URL(login.headers.location).searchParams.get('state');actor='102';
 assert.equal((await req('/api/wechat-oauth-callback?'+new URLSearchParams({code:'different-account',state}))).headers.location,'/web/#/pages/index/index');assert.equal((await req('/api/h5?action=session')).data.invitation,null);
 await req('/api/h5?action=capture-referral',{ref:refToken('17'),returnTo:'https://evil.invalid'});assert.equal((await req('/api/h5?action=session')).data.invitation.returnTo,'/web/#/pages/plaza/plaza');
 await req('/api/h5?action=logout',{});assert.equal(jar.size,0);assert.equal((await req('/api/h5?action=session')).data.invitation,null);
 assert.equal((await req('/api/h5?action=capture-referral',{ref:sign({kind:'ref',accountId:'17',exp:1}),returnTo})).status,400);
});
