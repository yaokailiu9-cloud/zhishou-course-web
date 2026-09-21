// Actual Zion identity and actionflow adapter. No administrator credential is used here.
const FID='9f60a0be-4628-4268-a769-661264846cf4';
const ENDPOINT='https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2';
let requestQueue=Promise.resolve();
function graphql(query,variables,jwt){
 const next=requestQueue.then(()=>sendGraphql(query,variables,jwt));
 requestQueue=next.catch(()=>{}).then(()=>new Promise(resolve=>setTimeout(resolve,350)));
 return next;
}
async function sendGraphql(query,variables,jwt){const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',...(jwt?{Authorization:'Bearer '+jwt}:{})},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(20000)});const data=await r.json();if(!r.ok||data.errors)throw Error(data.errors?.[0]?.message||data.message||('Zion 请求失败，HTTP '+r.status));return data.data;}
async function login(actor){const r=await graphql('mutation DemoAccountLogin($username:String!,$password:String!){authenticateWithUsername(username:$username,password:$password,register:false){account{id}jwt{token}}}',{username:actor.username,password:actor.password});const auth=r.authenticateWithUsername;if(!auth?.jwt?.token||String(auth.account.id)!==String(actor.id))throw Error('后台登录身份不匹配');return auth.jwt.token;}
async function invoke(jwt,operation,payload={}){const r=await graphql('mutation DemoService($args:Json!){fz_invoke_action_flow(actionFlowId:"'+FID+'",versionId:1,args:$args)}',{args:{operation,payload}},jwt);let out=r.fz_invoke_action_flow;if(typeof out==='string')out=JSON.parse(out);let result=out?.result||out;if(typeof result==='string')result=JSON.parse(result);if(!result?.ok)throw Error(result?.message||out?.message||out?.error?.message||'后台服务未完成');return result.data;}
module.exports={login,invoke};
