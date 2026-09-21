// Targeted deployment: preserve live payment secrets/bindings and concurrent handlers.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const cli=process.env.ZION_CLI||'/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.7.8/bin/zion-mcp';
function run(...args){return JSON.parse(cp.execFileSync(cli,args,{cwd:root,encoding:'utf8',maxBuffer:10000000,timeout:120000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
function block(code,start,end){const a=code.indexOf(start),b=code.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,'Review changed live handler: '+start);return code.slice(a,b);}
function replace(code,start,end,source){return code.replace(block(code,start,end),block(source,start,end));}
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const flow=snapshot.server.actionFlows.find(x=>x.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
assert.equal(flow.isAsync,false,'Enrollment and attribution must share a transaction');
const tables=snapshot.server.dataModel.tableMetadata;
const referralTable=tables.find(t=>t.name==='course_referral');assert.ok(referralTable);
for(const role of snapshot.server.roleConfigs){const p=role.permissionConfig.tablePermissionById[referralTable.id]||{};assert.ok(!['insert','update','delete','select','aggregate','count'].some(k=>p[k]),'Keep referral table private');}
const auth=flow.allNodes.find(n=>n.uniqueId==='h4i3zzuex'),classes=flow.allNodes.find(n=>n.uniqueId==='sui9sl3ko');
assert.equal(auth.type,'CUSTOM_CODE');assert.equal(classes.type,'CUSTOM_CODE');
assert.ok(!auth.code.includes('// REFERRALS_START'),'Already staged; inspect before updating');
let authCode=replace(auth.code,'var actor =','var state =',read('backend/consultation/authorize.js'));
authCode+='\n// REFERRALS_START\n'+read('backend/consultation/referral.js')+'\n// REFERRALS_END\n';
let classCode=replace(classes.code,"if(op==='ENROLL')", "if(op==='MY_ENROLLMENTS')",read('backend/consultation/classes.js'));
classCode=replace(classCode,"if(op==='LOCK_REFERRER')","if(op==='GET_ENROLLMENT')",read('backend/consultation/classes.js'));
if(!classCode.includes('function activeReferrer('))classCode+='\n'+block(read('backend/consultation/family.js'),'function activeReferrer(','function intake(');
for(const code of [authCode,classCode])new Function('context',code);
const result=run('schema','tool-call','--toolCalls',JSON.stringify([auth,classes].map((node,i)=>({name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:node.uniqueId,config:{type:'CUSTOM_CODE',code:i?classCode:authCode}}}))));
assert.ok(!result.errors,JSON.stringify(result.errors));
console.log(JSON.stringify({staged:true,project:state.projectExId,validation:run('schema','validate')},null,2));
