const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http');
process.env.SESSION_SECRET='isolated-payment-identity-session-key';
const {sign,verify}=require('../../server/h5');
const payment=require('../../server/h5/payment-identity');
const session={account:{id:'201'},jwt:'existing-website-login'};
async function server(t,invoke,onSession=()=>{}){
  const app=http.createServer(async(req,res)=>{
    const ctx={body:async req=>{let raw='';for await(const b of req)raw+=b;return JSON.parse(raw||'{}');},setSession:(_res,value)=>onSession(value),session:req.headers['x-no-session']?null:session,invoke,sign,verify,
      appendCookie:(res,c)=>res.setHeader('Set-Cookie',[...(res.getHeader('Set-Cookie')||[]),c]),
      json:(res,status,data)=>{res.statusCode=status;res.end(JSON.stringify(data));},
      redirect:(res,url)=>{res.statusCode=302;res.setHeader('Location',url);res.end();}};
    try{await payment.handle(new URL(req.url,'https://local').searchParams.get('action'),req,res,ctx);}catch(e){res.statusCode=500;res.end(e.message);}
  });
  await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());
  return (path,options={})=>new Promise((resolve,reject)=>{const r=http.request({host:'127.0.0.1',port:app.address().port,path,method:options.method||'GET',headers:{'user-agent':'MicroMessenger/8.0',...options.headers}},res=>{let body='';res.on('data',v=>body+=v);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));});r.on('error',reject);r.end(options.body?JSON.stringify(options.body):undefined);});
}
test('付款授权使用新公众号，保留原网站登录；OAuth state短且绑定当前会话',async t=>{
  const operations=[],access={appId:payment.APP_ID,merchantId:payment.MERCHANT_ID};
  const request=await server(t,async(jwt,op,input)=>{operations.push({jwt,op,input});return op==='PAYMENT_ACCESS'?access:{...access,ticket:'server-signed-payment-identity',expiresAt:Math.floor(Date.now()/1000)+3600};});
  const path='/web/?ref=existing-ref#/pages/class-enroll/class-enroll?id=7';
  const begin=await request('/api/h5?action=payment-login&return='+encodeURIComponent(path));
  assert.equal(begin.status,302);const auth=new URL(begin.headers.location);
  assert.equal(auth.searchParams.get('appid'),payment.APP_ID);assert.equal(auth.searchParams.get('scope'),'snsapi_base');assert.ok(auth.searchParams.get('state').length<=128);
  assert.match(begin.headers['set-cookie'][0],/HttpOnly/);assert.ok(!auth.href.includes(session.jwt));
  const nonceCookie=begin.headers['set-cookie'][0].split(';')[0],state=auth.searchParams.get('state');
  const done=await request('/api/h5?action=payment-callback&code=fresh-code&state='+state,{headers:{cookie:nonceCookie}});
  assert.equal(done.status,302);assert.equal(done.headers.location,path);assert.equal(operations.at(-1).op,'AUTHORIZE_PAYMENT');assert.equal(operations.at(-1).jwt,session.jwt);
  const saved=done.headers['set-cookie'].find(v=>v.startsWith(payment.COOKIE+'='));assert.ok(saved);assert.ok(!done.body.includes('server-signed-payment-identity'));
  const ready=await request('/api/h5?action=payment-access',{method:'POST',headers:{cookie:saved.split(';')[0]}});assert.equal(JSON.parse(ready.body).data.authorized,true);
});
test('支付授权拒绝伪造state、跨会话、缺少cookie和外部跳转',async t=>{
  const request=await server(t,async()=>({appId:payment.APP_ID,merchantId:payment.MERCHANT_ID}));
  const begin=await request('/api/h5?action=payment-login&return='+encodeURIComponent('https://evil.invalid/'));
  const auth=new URL(begin.headers.location),nonce=begin.headers['set-cookie'][0].split(';')[0];
  assert.equal((await request('/api/h5?action=payment-callback&code=code&state=wrong',{headers:{cookie:nonce}})).status,400);
  assert.equal((await request('/api/h5?action=payment-callback&code=code&state='+auth.searchParams.get('state'))).status,400);
  assert.equal((await request('/api/h5?action=payment-access',{method:'POST',headers:{'x-no-session':'1'}})).status,401);
  assert.equal(payment.returnPath('https://evil.invalid/'),'/web/');assert.equal(payment.returnPath('//evil.invalid/web/'),'/web/');
  const binding=require('node:crypto').createHash('sha256').update('another-session').digest('hex');
  const other=payment.NONCE_COOKIE+'='+encodeURIComponent(sign({kind:'payment-oauth',accountId:'201',binding,nonce:'other',exp:Math.floor(Date.now()/1000)+60}));
  assert.equal((await request('/api/h5?action=payment-callback&code=code&state=other',{headers:{cookie:other}})).status,400);
});
test('其他账号、过期票据及旧服务号票据不能用于新商户付款',()=>{
  const req=v=>({headers:{cookie:payment.COOKIE+'='+encodeURIComponent(sign(v))}}),base={accountId:'201',appId:payment.APP_ID,merchantId:payment.MERCHANT_ID,ticket:'ticket',exp:Math.floor(Date.now()/1000)+60};
  assert.equal(payment.identity(req(base),session,verify),'ticket');
  for(const change of [{accountId:'202'},{appId:'wx6dafecca8d5fd24e'},{merchantId:'1666219884'},{exp:1}])assert.equal(payment.identity(req({...base,...change}),session,verify),'');
});
test('新支付配置缺失或指向旧商户时，不跳转到旧收银台',async t=>{
  const request=await server(t,async()=>({appId:'wx6dafecca8d5fd24e',merchantId:'1666219884'}));
  const result=await request('/api/h5?action=payment-access',{method:'POST'});assert.equal(result.status,500);assert.match(result.body,/配置正在更新/);
});

test('新支付授权仅短期保留有效联系信息和原课程路径，不替换登录身份',async t=>{
 let saved;const request=await server(t,async()=>({appId:payment.APP_ID,merchantId:payment.MERCHANT_ID}),v=>saved=v);
 const path='/web/#/pages/class-enroll/class-enroll?id=7';
 const r=await request('/api/h5?action=payment-access',{method:'POST',body:{name:'测试家长',phone:'13800000000',returnTo:path}});
 assert.equal(r.status,200);assert.equal(saved.jwt,session.jwt);assert.equal(saved.paymentContact.returnTo,path);assert.equal(saved.paymentContact.name,'测试家长');assert.ok(saved.paymentContact.exp<=Date.now()/1000+600);
 saved=null;await request('/api/h5?action=payment-access',{method:'POST',body:{name:'测试',phone:'invalid',returnTo:path}});assert.equal(saved,null);
});
