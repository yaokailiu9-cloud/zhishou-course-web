// Minimal live-node patch: retain concurrent code, check-in, and family changes.
// The Secret must already be configured and bound through Zion's official tools.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const cli=process.env.ZION_CLI||'/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.7.8/bin/zion-mcp';
function run(...args){return JSON.parse(cp.execFileSync(cli,args,{cwd:process.env.ZION_PROJECT_CWD||root,encoding:'utf8',maxBuffer:10000000,timeout:120000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const flow=snapshot.server.actionFlows.find(x=>x.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
const node=flow.allNodes.find(x=>x.uniqueId==='sui9sl3ko');assert.equal(node.type,'CUSTOM_CODE');
assert.ok(JSON.stringify(node.inputArgsDataBinding.wechat_pay_key).includes('secretConfigId'),'Bind secure key first');
const orderTable=snapshot.server.dataModel.tableMetadata.find(x=>x.name==='course_registration_order');assert.ok(orderTable);
for(const role of snapshot.server.roleConfigs){const p=role.permissionConfig.tablePermissionById[orderTable.id]||{};assert.ok(!['insert','update','delete','select','aggregate','count'].some(k=>p[k]),'Order direct permissions must stay closed');}
let code=node.code;assert.ok(!code.includes('// COURSE_PAYMENT_START'),'Payment code already staged; inspect before updating');
code=code.replace('var SERVICE_TABLES = [','var SERVICE_TABLES = ["course_registration_order", ');
const cancel="if(op==='CANCEL_ENROLLMENT') {\n  var e=ownedEnrollment(p.enrollmentId);";
assert.ok(code.includes(cancel),'Live cancel handler changed; review before applying');
code=code.replace(cancel,cancel+"\n  if(e.status!=='CANCELED'&&list('course_registration_order',and(eq('customer_id',s.actor.accountId),eq('public_class_id',e.public_class_id),eq('status','PAID','text')),'id',1).length)fail('已缴费报名请联系工作人员办理退款，不能直接取消');");
const end="context.setReturn('state',s);";assert.equal(code.split(end).length,2);
code=code.replace(end,'// COURSE_PAYMENT_START\n'+read('utils/md5.js').replace('module.exports = { md5Base64 };','')+'\n'+read('backend/consultation/course-payment.js')+'\n// COURSE_PAYMENT_END\n'+end);
const result=run('schema','tool-call','--toolCalls',JSON.stringify([{name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:node.uniqueId,config:{type:'CUSTOM_CODE',code}}}]));assert.ok(!result.errors,JSON.stringify(result.errors));
console.log(JSON.stringify({staged:true,project:state.projectExId,node:node.uniqueId,validation:run('schema','validate')},null,2));
