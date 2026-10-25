const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const read=f=>fs.readFileSync(path.resolve(__dirname,'../..',f),'utf8');
const APP='wx8daa76a8eb887e47',OLD='wx6dafecca8d5fd24e';
const USERNAME=(app,openid)=>'wxh5_'+crypto.createHash('sha256').update(app+':'+openid).digest('hex').slice(0,36);
function resolve(options={}){
 const calls=[],queries=[],s={actor:{accountId:null}};
 const token={openid:'new-wechat-openid',unionid:'same-wechat-union',access_token:'private-oauth-token',...options.token};
 const profile={openid:token.openid,unionid:token.unionid,nickname:'原微信用户',headimgurl:'https://example.invalid/a.png',...options.profile};
 const accounts=options.accounts||[{id:'201',username:USERNAME(OLD,'legacy-wechat-openid'),wechat_openid:'legacy-wechat-openid'}];
 vm.runInNewContext(read('backend/consultation/common.js')+'\n'+read('backend/consultation/wechat-web-login.js'),{op:'WEBSITE_WECHAT_LOGIN',p:{code:'real-one-use-code',openid:'attacker-openid',unionid:'attacker-union',accountId:'999'},s,context:{
  callThirdPartyApi:(api,args)=>{calls.push({api,args});if(options.throw)throw new Error('credential must not leak');return options.failure||{code:200,data:api==='rvhgukwrr'?token:profile};},
  runGql:(name,query,variables)=>{queries.push({name,query,variables});return {accounts};}
 }});
 return {data:JSON.parse(JSON.stringify(s.result.data)),calls,queries};
}
test('新服务号用一次性code核实身份，UnionID匹配原账号；不信任请求中的账号或openid',()=>{
 const r=resolve();assert.equal(r.data.appId,APP);assert.equal(r.data.profile.openid,'new-wechat-openid');assert.equal(r.data.existingAccount.id,'201');assert.equal(r.data.existingAccount.openid,'legacy-wechat-openid');assert.deepEqual(JSON.parse(JSON.stringify(r.calls[0])),{api:'rvhgukwrr',args:{gyhv1hcj0:'real-one-use-code'}});assert.equal(r.calls[1].args.k2jjan49n,'private-oauth-token');assert.ok(JSON.stringify(r.queries).includes('same-wechat-union'));assert.doesNotMatch(JSON.stringify(r.data),/private-oauth-token|attacker/);
});
test('缺少UnionID、冲突账号、微信错误或跨用户资料时不创建或恢复账户',()=>{
 for(const options of [{token:{unionid:''},profile:{unionid:''}},{accounts:[{id:'201'},{id:'202'}]},{profile:{openid:'another-wechat-user'}},{profile:{unionid:'another-union'}},{failure:{code:200,data:{errcode:40029,errmsg:'private-credentials'}}},{throw:true}])assert.throws(()=>resolve(options),/UnionID|多个账号|身份|失效|暂不可用/);
});
test('真实新访客返回新身份，原账号不能凭昵称或手机号误匹配',()=>{
 const r=resolve({accounts:[]});assert.equal(r.data.existingAccount,null);assert.equal(r.data.profile.unionid,'same-wechat-union');assert.match(r.queries[0].query,/limit:2/);assert.doesNotMatch(r.queries[0].query,/nickname|phone/);
});
process.env.SESSION_SECRET='website-login-migration-test-only-secret';
const {authenticateWechatAccount}=require('../../server/h5');
test('跨公众号登录恢复原账号凭据，保留原OpenID；角色和已有账号不重新注册',async t=>{
 const original=global.fetch,calls=[],resolved=resolve().data,existing=resolved.existingAccount;
 global.fetch=async(url,init)=>{const b=JSON.parse(init.body);calls.push(b);let data;if(b.variables.args)data={fz_invoke_action_flow:{result:{ok:true,data:resolved}}};else if(b.query.includes('authenticateWithUsername'))data={authenticateWithUsername:{account:{id:'201',username:existing.username},jwt:{token:'private-existing-jwt'}}};else data={update_account_by_pk:{id:'201',wechat_nickname:'原微信用户'}};return {ok:true,text:async()=>JSON.stringify({data})};};t.after(()=>global.fetch=original);
 const login=await authenticateWechatAccount('real-one-use-code');assert.equal(login.account.id,'201');assert.equal(calls[1].variables.username,existing.username);assert.equal(calls[1].variables.password,'ZhS_'+crypto.createHmac('sha256',process.env.SESSION_SECRET).update('legacy-wechat-openid').digest('base64url'));assert.equal(calls[1].variables.register,false);assert.equal(calls[2].variables.data.wechat_openid,'legacy-wechat-openid');assert.ok(!Object.hasOwn(calls[2].variables.data,'user_type'));
});
test('匹配的老账号认证失败不注册新账号；无效凭据映射和账号ID冲突拒绝登录',async t=>{
 const original=global.fetch;t.after(()=>global.fetch=original);
 for(const mode of ['missing','mapping','account']){
  const resolved=resolve().data;if(mode==='mapping')resolved.existingAccount.username=USERNAME(OLD,'another-openid');let registrations=0;
  global.fetch=async(url,init)=>{const b=JSON.parse(init.body);let value;if(b.variables.args)value={data:{fz_invoke_action_flow:{result:{ok:true,data:resolved}}}};else {registrations+=Number(b.variables.register);value=mode==='missing'?{errors:[{message:'missing',extensions:{classification:'ACCOUNT_DOES_NOT_EXIST'}}]}:{data:{authenticateWithUsername:{account:{id:'999'},jwt:{token:'wrong'}}}};}return {ok:true,text:async()=>JSON.stringify(value)};};
  await assert.rejects(authenticateWechatAccount('real-code'));assert.equal(registrations,0);
 }
});
