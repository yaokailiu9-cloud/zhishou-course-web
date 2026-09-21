// Explicit local demonstration. Never imported by the production server.
const http=require('node:http');const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');const zion=require('./zion');
const definitions=[{key:'manager',label:'管理人员',port:3001,id:1001},{key:'agent',label:'代理',port:3002,id:1002},{key:'customer',label:'客户',port:3003,id:1003}];
function startDemo({accountsFile=path.resolve('.codex-work/role-demo/zion-accounts.json'),ports=definitions.map(x=>x.port)}={}){
 if(process.env.NODE_ENV==='production')throw Error('联调服务器不允许在生产环境启动');
 const config=JSON.parse(fs.readFileSync(accountsFile,'utf8'));if(config.projectId!=='JmAxbl1MMe4'||!config.classId)throw Error('真实后台联调配置尚未就绪');
 const sessions=new Map(),events=[];
 const users=definitions.map((d,i)=>({...d,port:ports[i],id:config.actors[d.key].id,name:config.actors[d.key].name}));
 function event(actor,operation){events.unshift({id:Date.now()+Math.random(),at:new Date().toISOString(),actor,operation});events.splice(12);}
 async function service(user,jwt,operation,payload={}){return zion.invoke(jwt,operation,payload);}
 const allowed=new Set(['SET_AGENT','BIND_CUSTOMER','ENROLL','SUBMIT_CHILD_INTAKE','SAVE_CHILD_FEEDBACK','GET_CHILD_INTAKE']);
 const labels={SET_AGENT:'指定 / 调整代理身份',BIND_CUSTOMER:'直接绑定客户归属',ENROLL:'公开课报名成功',SUBMIT_CHILD_INTAKE:'提交孩子资料',SAVE_CHILD_FEEDBACK:'保存工作人员回复',LOGIN:'后台账号登录成功',LOGOUT:'退出登录'};
 function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
 async function overview(user,jwt){const info=await service(user,jwt,'FAMILY_OVERVIEW');const extra={};if(info.role==='MANAGER'){
 const [agents,intakes,binding]=await Promise.all([service(user,jwt,'LIST_AGENTS'),service(user,jwt,'STAFF_CHILD_INTAKES'),service(user,jwt,'MANAGED_CUSTOMER_REFERRAL',{customerId:config.actors.customer.id})]);
 extra.agents=agents.items.filter(a=>String(a.account_id)===String(config.actors.agent.id));extra.intakes=intakes.items.filter(a=>String(a.public_class?.id)===String(config.classId));extra.customerBinding=binding.binding;
 }if(info.role==='AGENT')extra.clients=(await service(user,jwt,'MY_REFERRALS')).items.filter(c=>String(c.referred_account_id)===String(config.actors.customer.id));return {...info,...extra};}
 const servers=users.map(user=>{const cookieName='zhishou_demo_'+user.key;const server=http.createServer(async(req,res)=>{try{
 const origin='http://localhost:'+user.port;if(!['localhost:'+user.port,'127.0.0.1:'+user.port].includes(req.headers.host))return send(res,403,{message:'仅限本机演示'});
 const url=new URL(req.url,origin);if(req.method==='GET'&&!url.pathname.startsWith('/api/')){const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css'};let file=files[url.pathname]?path.join(__dirname,files[url.pathname]):url.pathname==='/qrcode.js'?path.join(__dirname,'../../utils/vendor/qrcode.js'):null;if(!file)return send(res,404,{message:'不存在'});res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'});res.end(fs.readFileSync(file));return;}
 const cookies=Object.fromEntries(String(req.headers.cookie||'').split(';').filter(x=>x.includes('=')).map(x=>x.trim().split('=')));const token=cookies[cookieName];const session=sessions.get(token);const loggedIn=session&&session.id===user.id&&session.expires>Date.now();
 if(req.method==='GET'&&url.pathname==='/api/state')return send(res,200,{demo:true,backend:'ZION',classId:config.classId,user,users,loggedIn:!!loggedIn,clockOffset:0,serverNow:new Date().toISOString(),events,...(loggedIn?{data:await overview(user,session.jwt)}:{})});
 if(req.method!=='POST')return send(res,405,{message:'请使用POST'});if(req.headers.origin&&req.headers.origin!==origin)return send(res,403,{message:'请求来源无效'});if(!String(req.headers['content-type']).startsWith('application/json'))return send(res,415,{message:'请使用JSON'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>50000)return send(res,413,{message:'请求过长'});}const input=JSON.parse(raw||'{}');
 if(url.pathname==='/api/login'){const jwt=await zion.login(config.actors[user.key]);const token=crypto.randomBytes(24).toString('hex');sessions.set(token,{id:user.id,jwt,expires:Date.now()+3600000});res.setHeader('Set-Cookie',cookieName+'='+token+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600');event(user.label,labels.LOGIN);return send(res,200,{ok:true});}
 if(!loggedIn)return send(res,401,{message:'请先登录后台测试账号'});
 if(url.pathname==='/api/logout'){sessions.delete(token);res.setHeader('Set-Cookie',cookieName+'=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');event(user.label,labels.LOGOUT);return send(res,200,{ok:true});}
 if(url.pathname==='/api/action'&&allowed.has(input.operation)){const payload=input.payload||{};
 if(input.operation==='SET_AGENT'&&String(payload.accountId)!==String(config.actors.agent.id))throw Error('联调只能指定本次测试代理');
 if(input.operation==='BIND_CUSTOMER'&&(String(payload.customerId)!==String(config.actors.customer.id)||String(payload.agentAccountId)!==String(config.actors.agent.id)))throw Error('联调只能绑定本次测试客户');
 if(input.operation==='ENROLL'&&String(payload.classId)!==String(config.classId))throw Error('联调只能报名本次测试课程');
 const result=await service(user,session.jwt,input.operation,payload);if(input.operation!=='GET_CHILD_INTAKE')event(user.label,labels[input.operation]+(input.operation==='SAVE_CHILD_FEEDBACK'&&input.payload.confirm?'（确认完成）':''));return send(res,200,{ok:true,data:result});}
 return send(res,404,{message:'不支持此演示操作'});
 }catch(e){send(res,400,{message:e.message});}});server.listen(user.port,'127.0.0.1');return server;});
 return {servers,users,close(){for(const server of servers)server.close();}};
}
module.exports={startDemo};if(require.main===module){const demo=startDemo();console.log('三个真实Zion测试账号 · 项目数据库联调 · 仅本机入口');for(const u of demo.users)console.log(u.label+': http://localhost:'+u.port);}
