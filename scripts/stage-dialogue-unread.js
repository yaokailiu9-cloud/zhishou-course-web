// Minimal live-node patch: every manager who may open an archive can use its plan feedback,
// and each reader gets new-message counts tracked in consultation_dialogue_read.
// Usage: node scripts/stage-dialogue-unread.js [--dry-run <outDir>]
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const cli=process.env.ZION_CLI||'npx';const cliArgs=process.env.ZION_CLI?[]:['-y','zion-mcp@2.7.8'];
function run(...args){return JSON.parse(cp.execFileSync(cli,[...cliArgs,...args],{cwd:process.env.ZION_PROJECT_CWD||root,encoding:'utf8',maxBuffer:50000000,timeout:180000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
const dry=process.argv[2]==='--dry-run'?process.argv[3]:null;
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const flow=snapshot.server.actionFlows.find(x=>x.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
const table=snapshot.server.dataModel.tableMetadata.find(x=>x.name==='consultation_dialogue_read');assert.ok(table,'Create consultation_dialogue_read first');
for(const role of snapshot.server.roleConfigs){const p=role.permissionConfig.tablePermissionById[table.id]||{};assert.ok(!['insert','update','delete','select','aggregate','count'].some(k=>p[k]),'Read-mark direct permissions must stay closed');}
const helper=read('backend/consultation/dialogue-unread.js');
function patch(code,from,to){assert.equal(code.split(from).length,2,'Live anchor changed; review before applying: '+from.slice(0,80));return code.replace(from,()=>to);}
const STATUSES='["PENDING","CONFIRMED","COMPLETED","孩子档案"]';
const edits={
 g3oknp94t(code){
  code=patch(code,'if (op === "GET_APPOINTMENT") {',helper+'if (op === "GET_APPOINTMENT") {');
  code=patch(code,'var canTalk='+STATUSES+'.indexOf(a.status)>=0 && !!a.customer_id && !!a.provider_id && (String(a.customer_id)===String(s.actor.accountId) || (String(a.provider_id)===String(s.actor.providerId) && !!s.actor.providerId && s.actor.canReply));',
   '// Every manager who may open this archive sees and answers the same plan feedback.\n  var canTalk='+STATUSES+'.indexOf(a.status)>=0 && !!a.customer_id && (String(a.customer_id)===String(s.actor.accountId) || (assigned && !!s.actor.canReply));\n  var dialogueState=canTalk?(dialogueUnread([a])[a.id]||{unread:0,mark:0}):{unread:0,mark:0};');
  return patch(code,'canTalk:canTalk});','canTalk:canTalk,dialogueUnread:dialogueState.unread,dialogueReadMark:dialogueState.mark});');
 },
 z07supad5(code){
  code=patch(code,'function dialogueAppointment() {',helper+'function dialogueAppointment() {');
  code=patch(code,'if('+STATUSES+'.indexOf(a.status)<0 || !a.customer_id || !a.provider_id)fail("方案需绑定客户和负责老师后才能继续反馈");','if('+STATUSES+'.indexOf(a.status)<0 || !a.customer_id)fail("方案需绑定客户后才能继续反馈");');
  code=patch(code,'if(String(a.provider_id)!==String(s.actor.providerId))fail("只能与本人负责的咨询客户对话");','if(String(a.provider_id)!==String(s.actor.providerId) && !(s.actor.serviceKind==="STAFF" && s.actor.canAccept))fail("只能与本人负责的咨询客户对话");');
  code=patch(code,'var more=newer.length>20;newer=newer.slice(0,20);','var more=newer.length>20;newer=newer.slice(0,20);\n    if(newer.length)markDialogueRead(a,newer[newer.length-1].id);');
  return patch(code,'var page=pageRows("consultation_feedback",scope,fields,p.beforeId,20,true);','var page=pageRows("consultation_feedback",scope,fields,p.beforeId,20,true);\n    if(!p.beforeId && page.items.length)markDialogueRead(a,page.items[0].id);');
 },
 sui9sl3ko(code){
  code=patch(code,"if(op==='MY_OVERVIEW') {",helper+"if(op==='DIALOGUE_UNREAD_TOTAL') {\n  login(s);var mine=list('offline_appointment',eq('customer_id',s.actor.accountId),'id customer_id status',200),managed=[];\n  if(s.actor.providerId&&s.actor.canReply)managed=list('offline_appointment',s.actor.serviceKind==='STAFF'&&s.actor.canAccept?{}:eq('provider_id',s.actor.providerId),'id customer_id status',501);\n  var counts=dialogueUnread(mine.concat(managed)),total=function(rows){return rows.reduce(function(n,a){return n+(counts[a.id]?counts[a.id].unread:0);},0);};\n  result(s,{staff:total(managed.filter(function(a){return String(a.customer_id)!==String(s.actor.accountId);})),customer:total(mine)});\n}\nif(op==='MY_OVERVIEW') {");
  code=patch(code,'appointments:history.items,nextAppointmentCursor:history.nextCursor,isStaff:','appointments:withDialogueUnread(history.items),nextAppointmentCursor:history.nextCursor,isStaff:');
  return patch(code,'appointments:history.items,nextAppointmentCursor:history.nextCursor,canAccept:','appointments:s.actor.canReply?withDialogueUnread(history.items):history.items,nextAppointmentCursor:history.nextCursor,canAccept:');
 }
};
const calls=[];
for(const [nodeId,edit] of Object.entries(edits)){
 const node=flow.allNodes.find(x=>x.uniqueId===nodeId);assert.equal(node.type,'CUSTOM_CODE');
 assert.ok(!node.code.includes('// DIALOGUE_UNREAD_START'),'Already staged in '+nodeId);
 const code=edit(node.code);
 if(dry){fs.mkdirSync(dry,{recursive:true});fs.writeFileSync(path.join(dry,nodeId+'.before.js'),node.code);fs.writeFileSync(path.join(dry,nodeId+'.js'),code);}
 calls.push({name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId,config:{type:'CUSTOM_CODE',code}}});
}
if(dry){console.log(JSON.stringify({dryRun:dry,nodes:Object.keys(edits)}));process.exit(0);}
const out=run('schema','tool-call','--toolCalls',JSON.stringify(calls));assert.ok(!out.errors,JSON.stringify(out.errors));
console.log(JSON.stringify({staged:true,nodes:Object.keys(edits),validation:run('schema','validate')},null,2));
