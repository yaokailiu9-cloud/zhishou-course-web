// Minimal live-node patch: route every consultation booking to the supervisor 程思琦 (service_provider.id = 15).
// Retains concurrent live code; only the asserted provider-selection snippets change.
// Usage: node scripts/stage-supervisor-routing.js [--dry-run <node-code-file>]
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const swaps=[
 ['var s=getState(), p=s.payload, op=s.operation;','// All consultation bookings are routed to the supervisor 程思琦 (service_provider.id = 15), who confirms times and sees every intake.\nvar CONSULTATION_SUPERVISOR_ID = 15;\nfunction consultationSupervisor() {\n  var p = list("service_provider", and(eq("id", CONSULTATION_SUPERVISOR_ID), eq("service_status", "ACTIVE", "text"), eq("service_kind", "STAFF", "text")), "id can_accept_order", 1)[0];\n  if (!p || !p.can_accept_order) fail("咨询主管暂未开放预约，请联系工作人员");\n  return p;\n}\nvar s=getState(), p=s.payload, op=s.operation;'],
 ['    var providerId=e.public_class && e.public_class.organizer_id;\n    var provider=providerId && list("service_provider",and(eq("id",providerId),eq("service_status","ACTIVE","text")),"id can_accept_order",1)[0];\n    if (!provider || !provider.can_accept_order) fail("负责老师暂未开放预约，请联系工作人员");\n','    var provider=consultationSupervisor();\n'],
 ["  var teacher=one('service_provider',enrollment.public_class.organizer_id,'id service_kind service_status can_accept_order');\n  if (teacher.service_status!=='ACTIVE' || teacher.service_kind==='AGENT' || !teacher.can_accept_order) fail('负责老师暂未开放预约，请联系工作人员');\n","  var teacher=consultationSupervisor();\n"],
];
function patch(code){
  assert.ok(!code.includes('CONSULTATION_SUPERVISOR_ID'),'Supervisor routing already staged; inspect before updating');
  for(const [from,to] of swaps){assert.equal(code.split(from).length,2,'Live code changed; review: '+from.slice(0,60));code=code.replace(from,to);}
  return code;
}
if(process.argv[2]==='--dry-run'){process.stdout.write(patch(fs.readFileSync(process.argv[3],'utf8')));process.exit(0);}
function run(...args){return JSON.parse(cp.execFileSync('npx',['-y','zion-mcp@2.7.8',...args],{encoding:'utf8',maxBuffer:20000000,timeout:180000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const flow=snapshot.server.actionFlows.find(x=>x.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
const node=flow.allNodes.find(x=>x.uniqueId==='g3oknp94t');assert.equal(node.type,'CUSTOM_CODE');
const code=patch(node.code);
const result=run('schema','tool-call','--toolCalls',JSON.stringify([{name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:node.uniqueId,config:{type:'CUSTOM_CODE',code}}}]));assert.ok(!result.errors,JSON.stringify(result.errors));
console.log(JSON.stringify({staged:true,project:state.projectExId,node:node.uniqueId,validation:run('schema','validate')},null,2));
