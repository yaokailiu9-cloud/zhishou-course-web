const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const zion=require('../../server/role-demo/zion');const {startDemo}=require('../../server/role-demo');
test('三个真实后台账号的本机入口分别认证，会话不串用，身份不来自请求参数',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'role-demo-http-'));const file=path.join(dir,'accounts.json');const actors={manager:{id:16,name:'测试管理',username:'m',password:'test-m'},agent:{id:17,name:'测试代理',username:'a',password:'test-a'},customer:{id:18,name:'测试客户',username:'c',password:'test-c'}};fs.writeFileSync(file,JSON.stringify({projectId:'JmAxbl1MMe4',classId:88,actors}));
 const savedLogin=zion.login,savedInvoke=zion.invoke,calls=[];zion.login=async a=>'private-jwt-'+a.id;zion.invoke=async(jwt,op,payload)=>{calls.push({jwt,op,payload});if(op==='FAMILY_OVERVIEW')return {role:'CUSTOMER',enrollments:{items:[]}};return {ok:true};};
 const demo=startDemo({accountsFile:file,ports:[3131,3132,3133]});await Promise.all(demo.servers.map(s=>new Promise(resolve=>s.listening?resolve():s.once('listening',resolve))));
 async function req(port,url,body,cookie,origin){return fetch('http://localhost:'+port+url,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...(origin?{Origin:origin}:{})},...(body?{body:JSON.stringify(body)}:{})});}
 try{const cookies=[];for(const port of [3131,3132,3133]){assert.equal((await req(port,'/api/action',{operation:'ENROLL',payload:{classId:88}})).status,401);const r=await req(port,'/api/login',{});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/HttpOnly/);cookies.push(r.headers.get('set-cookie').split(';')[0]);}
 assert.equal(new Set(cookies.map(c=>c.split('=')[0])).size,3);const manager=await (await req(3131,'/api/state',null,cookies[0])).json();assert.equal(manager.backend,'ZION');assert.equal(manager.loggedIn,true);assert.ok(!JSON.stringify(manager).includes('private-jwt'));assert.ok(!JSON.stringify(manager).includes('test-m'));
 const stolen=cookies[0].replace('zhishou_demo_manager','zhishou_demo_customer');assert.equal((await(await req(3133,'/api/state',null,stolen)).json()).loggedIn,false);
 await req(3133,'/api/action',{operation:'ENROLL',payload:{classId:88,account_id:16,role:'MANAGER'}},cookies[2]);assert.equal(calls.at(-1).jwt,'private-jwt-18');
 const n=calls.length;assert.equal((await req(3131,'/api/action',{operation:'SET_AGENT',payload:{accountId:999,active:true}},cookies[0])).status,400);assert.equal(calls.length,n);
 assert.equal((await req(3131,'/api/action',{operation:'SET_AGENT',payload:{accountId:17,active:true}},cookies[0],'https://external.invalid')).status,403);
 assert.equal((await req(3131,'/api/advance',{},cookies[0])).status,404);
 await req(3133,'/api/logout',{},cookies[2]);assert.equal((await(await req(3133,'/api/state',null,cookies[2])).json()).loggedIn,false);assert.equal((await(await req(3131,'/api/state',null,cookies[0])).json()).loggedIn,true);
 }finally{demo.close();zion.login=savedLogin;zion.invoke=savedInvoke;fs.rmSync(dir,{recursive:true,force:true});}
});
