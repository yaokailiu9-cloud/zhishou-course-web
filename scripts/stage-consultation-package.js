// Minimal live-node patch for the paid 5-session package (see backend/consultation/package.js).
// Retains concurrent live code: every replacement is asserted against the current live text.
// Usage: node scripts/stage-consultation-package.js [--dry-run <g3oknp94t.js> <sui9sl3ko.js>]
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
function once(code,from,to){assert.equal(code.split(from).length,2,'Live code changed; review: '+from.slice(0,70));return code.replace(from,to);}
function patchAppointments(code){
  assert.ok(!code.includes("op === 'GET_PACKAGE'"),'Package code already staged; inspect before updating');
  const start=code.indexOf('if (op === "CREATE_APPOINTMENT") {'),end=code.indexOf('if (op === "CONFIRM_APPOINTMENT") {');
  assert.ok(start>0&&end>start,'CREATE_APPOINTMENT block not found');
  const old=code.slice(start,end);
  // Only replace the free self-booking handler reviewed on 2026-10-08.
  assert.ok(old.includes('consultationSupervisor()')&&old.includes('请先参加免费公开课')&&old.length<2000,'Live CREATE_APPOINTMENT changed; review before updating');
  return code.slice(0,start)+read('backend/consultation/package.js')+code.slice(end);
}
function patchClasses(code){
  assert.ok(!code.includes('CONSULT_PACKAGE'),'Package guards already staged; inspect before updating');
  const q="if(isQuestionnaire(c))fail('请使用专属问卷二维码进入');";
  assert.equal(code.split(q).length,3,'GET_CLASS/ENROLL guards changed; review');
  code=code.split(q).join(q+"if(c.product_kind==='CONSULT_PACKAGE')fail('5次咨询请在“我的线下咨询”中购买');");
  const q2="if(isQuestionnaire(previous))fail('系统问卷不能在课程管理中修改');";
  code=once(code,q2,q2+"if(previous&&previous.product_kind==='CONSULT_PACKAGE')fail('5次咨询不能在课程管理中修改');");
  const payment=read('backend/consultation/course-payment.js'),anchor="var view=classView(c,false);if(!view.canEnroll||!c.organizer_id)fail(view.closedReason||'课程未开放报名');";
  const gate=payment.slice(payment.indexOf(anchor)+anchor.length).split('\n')[1].trim();assert.ok(gate.startsWith("if(c.product_kind==='CONSULT_PACKAGE'"));
  return once(code,anchor,anchor+'\n      '+gate);
}
if(process.argv[2]==='--dry-run'){
  fs.writeFileSync('/tmp/pkg-g3oknp94t.js',patchAppointments(fs.readFileSync(process.argv[3],'utf8')));
  fs.writeFileSync('/tmp/pkg-sui9sl3ko.js',patchClasses(fs.readFileSync(process.argv[4],'utf8')));
  console.log('dry run ok');process.exit(0);
}
function run(...args){return JSON.parse(cp.execFileSync('npx',['-y','zion-mcp@2.7.8',...args],{encoding:'utf8',maxBuffer:20000000,timeout:180000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const flow=snapshot.server.actionFlows.find(x=>x.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
const node=id=>{const n=flow.allNodes.find(x=>x.uniqueId===id);assert.equal(n.type,'CUSTOM_CODE');return n;};
const calls=[['g3oknp94t',patchAppointments],['sui9sl3ko',patchClasses]].map(([id,patch])=>({name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:id,config:{type:'CUSTOM_CODE',code:patch(node(id).code)}}}));
const result=run('schema','tool-call','--toolCalls',JSON.stringify(calls));assert.ok(!result.errors,JSON.stringify(result.errors));
console.log(JSON.stringify({staged:true,project:state.projectExId,nodes:calls.map(c=>c.args.nodeId),validation:run('schema','validate')},null,2));
