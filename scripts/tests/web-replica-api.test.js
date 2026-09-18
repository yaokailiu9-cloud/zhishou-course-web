const test=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
process.env.SESSION_SECRET='replica-isolated-test-secret-not-for-production';
const {createServer}=require('../../index');
const {sign}=require('../../server/h5');
function request(server,{method='GET',action,headers={},body}){return new Promise((resolve,reject)=>{const req=http.request({host:'127.0.0.1',port:server.address().port,path:'/api/h5?action='+action,method,headers},res=>{let raw='';res.on('data',v=>raw+=v);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:JSON.parse(raw)}))});req.on('error',reject);req.end(body==null?undefined:JSON.stringify(body))})}
test('replica gateway keeps JWT server-side, preserves user authorization, and rejects cross-origin writes',async t=>{
  const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>server.close());
  const originalFetch=global.fetch;const calls=[];
  global.fetch=async(url,options)=>{calls.push({url,options});return{ok:true,text:async()=>JSON.stringify({data:{course:[{id:'7'}]}})}};t.after(()=>global.fetch=originalFetch);
  const jwt='private-session-jwt';const cookie='zhishou_h5_session='+encodeURIComponent(sign({account:{id:'12',name:'Test'},jwt,exp:Math.floor(Date.now()/1000)+60}));
  const session=await request(server,{action:'session',headers:{cookie}});assert.equal(session.body.data.user.id,'12');assert.ok(!JSON.stringify(session).includes(jwt));assert.equal(session.headers['cache-control'],'no-store');
  const r=await request(server,{action:'graphql',method:'POST',headers:{cookie,'content-type':'application/json'},body:{query:'query { course { id } }'}});
  assert.equal(r.status,200);assert.equal(r.body.data.course[0].id,'7');assert.equal(calls[0].options.headers.authorization,'Bearer '+jwt);
  await request(server,{action:'graphql',method:'POST',headers:{cookie,'content-type':'application/json'},body:{query:'query { course { id } }',anonymous:true}});assert.equal(calls[1].options.headers.authorization,undefined);
  await request(server,{action:'graphql',method:'POST',headers:{authorization:'Bearer forged','content-type':'application/json'},body:{query:'query { course { id } }'}});assert.equal(calls[2].options.headers.authorization,undefined);
  const blocked=await request(server,{action:'graphql',method:'POST',headers:{cookie,origin:'https://unrelated.example','content-type':'application/json'},body:{query:'mutation { example }'}});assert.equal(blocked.status,403);assert.equal(calls.length,3);
  const form=await request(server,{action:'graphql',method:'POST',headers:{cookie,'content-type':'text/plain'},body:{query:'query { course { id } }'}});assert.equal(form.status,403);
  const get=await request(server,{action:'graphql'});assert.equal(get.status,405);
  const logout=await request(server,{action:'logout'});assert.equal(logout.status,405);
  const loggedOut=await request(server,{action:'logout',method:'POST',headers:{cookie,'content-type':'application/json'},body:{}});assert.equal(loggedOut.status,200);assert.match(loggedOut.headers['set-cookie'][0],/Max-Age=0/);
});
