const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
process.env.SESSION_SECRET = 'role-integration-test-secret-with-sufficient-length';
const {sign,refToken,decodeRef} = require('../../server/h5');
const {createServer} = require('../../index');

test('网页按后台身份请求推荐列表，报名使用已签名推荐人，会话身份不可由请求覆盖', async () => {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (_url, options) => {
    const {operation,payload} = JSON.parse(options.body).variables.args;
    const auth = options.headers.authorization;
    calls.push({operation,payload,auth});
    let data = {};
    if (operation === 'FAMILY_OVERVIEW') data = {role:auth==='Bearer agent-jwt'?'AGENT':'CUSTOMER',canInvite:auth==='Bearer agent-jwt'};
    else if (operation === 'REFERRAL_OVERVIEW') data={canInvite:auth==='Bearer agent-jwt',isManager:false,binding:null,candidate:payload.referrerId?{name:'推荐人'}:null};
    else if (operation === 'STAFF_CLASSES') return {ok:true,text:async()=>JSON.stringify({errors:[{message:'当前账号没有工作人员权限'}]})};
    else if (operation === 'LIST_CLASSES') data={classes:[]};
    else if (operation === 'MY_REFERRAL_STATUS') data={binding:null};
    else if (operation === 'MY_ENROLLMENTS' || operation === 'MY_REFERRALS') data={items:[]};
    else if (operation === 'ENROLL') data={enrollment:{id:77}};
    return {ok:true,text:async()=>JSON.stringify({data:{fz_invoke_action_flow:{result:{ok:true,data}}}})};
  };
  const server=createServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  function call(jwt, action, input, referrerId) {
    const cookie=sign({jwt,account:{id:'18'},referrerId,exp:Math.floor(Date.now()/1000)+60});
    return new Promise((resolve,reject)=>{
      const req=http.request({host:'127.0.0.1',port:server.address().port,path:'/api/h5?action='+action,method:input?'POST':'GET',headers:{Cookie:'zhishou_h5_session='+cookie,...(input?{'Content-Type':'application/json'}:{})}},res=>{
        let raw='';res.on('data',chunk=>raw+=chunk);res.on('end',()=>resolve({status:res.statusCode,body:JSON.parse(raw)}));
      });
      req.on('error',reject);req.end(input?JSON.stringify(input):undefined);
    });
  }
  try {
    const customer=await call('customer-jwt','bootstrap');
    assert.equal(customer.status,200);
    assert.equal(customer.body.data.canInvite,false);
    assert.equal(customer.body.data.referralToken,'');
    assert.ok(!calls.some(c=>c.operation==='MY_REFERRALS'));
    const agent=await call('agent-jwt','bootstrap');
    assert.equal(agent.body.data.canInvite,true);
    assert.ok(agent.body.data.referralToken);
    assert.ok(calls.some(c=>c.operation==='MY_REFERRALS' && c.auth==='Bearer agent-jwt'));
    await call('customer-jwt','enroll',{classId:1,name:'测试',phone:'13800000000',ref:refToken('17'),accountId:999});
    assert.equal(calls.at(-1).payload.referrerId,'17');
    assert.equal(calls.at(-1).auth,'Bearer customer-jwt');
    assert.equal(calls.at(-1).payload.accountId,undefined);
    await call('customer-jwt','enroll',{classId:1,name:'测试',phone:'13800000000',ref:'999'},'17');
    assert.equal(calls.at(-1).payload.referrerId,'17');
    assert.ok(!calls.some(c=>c.operation==='LOCK_REFERRER'));
    const context=await call('agent-jwt','referral-context&classId=7&accountId=999');
    assert.equal(decodeRef(context.body.data.referralToken),'18');
    const link=new URL(context.body.data.shareUrl);assert.equal(decodeRef(link.searchParams.get('ref')),'18');assert.equal(link.hash,'#/pages/public-class-detail/public-class-detail?id=7');
    const nonAgent=await call('customer-jwt','referral-context&ref='+encodeURIComponent(refToken('17')));
    assert.equal(nonAgent.body.data.referralToken,'');assert.equal(nonAgent.body.data.shareUrl,'');assert.equal(calls.at(-1).payload.referrerId,'17');
    await call('customer-jwt','referral-context&ref=forged&referrerId=999');assert.equal(calls.at(-1).payload.referrerId,null);
    await call('customer-jwt','referral-context',undefined,'17');assert.equal(calls.at(-1).payload.referrerId,'17');
    assert.equal((await call('customer-jwt','enroll')).status,405);
  } finally {
    global.fetch=originalFetch;
    await new Promise(resolve=>server.close(resolve));
  }
});
