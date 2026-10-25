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
// The website server login currently uses the old official account (see docs/zion-rules.md, 2026-10-25 rollback);
// server-side cross-account restore tests return when the unified login is re-enabled.
