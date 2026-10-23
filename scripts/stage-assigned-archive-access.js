// Minimal live-node patch: a child's archive is visible to 总管 (active STAFF who can take bookings) and to the
// 监护专员/总监 a 总管 assigned in 服务管理 — never merely because the account is the booking's provider_id.
// Usage: node scripts/stage-assigned-archive-access.js [--dry-run <outDir>]
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const cli=process.env.ZION_CLI||'npx';const cliArgs=process.env.ZION_CLI?[]:['-y','zion-mcp@2.7.15'];
function run(...args){return JSON.parse(cp.execFileSync(cli,[...cliArgs,...args],{cwd:process.env.ZION_PROJECT_CWD||root,encoding:'utf8',maxBuffer:50000000,timeout:180000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
const dry=process.argv[2]==='--dry-run'?process.argv[3]:null;
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const table=snapshot.server.dataModel.tableMetadata.find(x=>x.name==='offline_appointment');assert.ok(table);
for(const role of snapshot.server.roleConfigs){const p=role.permissionConfig.tablePermissionById[table.id]||{};assert.ok(!['insert','update','delete','select','aggregate','count'].some(k=>p[k]),'offline_appointment direct permissions must stay closed');}
const flow=snapshot.server.actionFlows.find(x=>x.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
function patch(code,from,to){assert.equal(code.split(from).length,2,'Live anchor changed; review before applying: '+from.slice(0,80));return code.replace(from,()=>to);}
const MARK='// ASSIGNED_ARCHIVE_ACCESS';
const helper=code=>patch(code,
 '  var assigned = !!s.actor.providerId && (String(a.provider_id) === String(s.actor.providerId) || (s.actor.serviceKind === "STAFF" && !!s.actor.canAccept));',
 '  '+MARK+': only 总管 open consultations as staff; others reach archives through 总管 assignment in 服务管理.\n  var assigned = !!s.actor.providerId && s.actor.serviceKind === "STAFF" && !!s.actor.canAccept;');
const edits={
 h4i3zzuex:helper,
 dv4kpohsg:helper,
 g3oknp94t(code){
  code=helper(code);
  return patch(code,'var assigned=!!s.actor.providerId && (String(a.provider_id)===String(s.actor.providerId) || (s.actor.serviceKind==="STAFF" && !!s.actor.canAccept));',
   'var assigned=!!s.actor.providerId && s.actor.serviceKind==="STAFF" && !!s.actor.canAccept;');
 },
 sui9sl3ko(code){
  code=helper(code);
  code=patch(code,"managed=list('offline_appointment',s.actor.serviceKind==='STAFF'&&s.actor.canAccept?{}:eq('provider_id',s.actor.providerId),'id customer_id status',501);",
   "managed=s.actor.serviceKind==='STAFF'&&s.actor.canAccept?list('offline_appointment',{},'id customer_id status',501):[];");
  return patch(code,"var history=pageRows('offline_appointment',s.actor.serviceKind==='STAFF'&&s.actor.canAccept?{}:eq('provider_id',s.actor.providerId),APPOINTMENT_FIELDS,",
   "var history=pageRows('offline_appointment',s.actor.serviceKind==='STAFF'&&s.actor.canAccept?{}:{_or:[eq('guardian_id',s.actor.providerId)].concat(s.actor.reviewRole==='DIRECTOR'?[eq('director_id',s.actor.providerId)]:[])},APPOINTMENT_FIELDS,");
 },
 z07supad5(code){
  code=helper(code);
  code=patch(code,"scopes.push(eq('guardian_id',s.actor.providerId),eq('provider_id',s.actor.providerId));","scopes.push(eq('guardian_id',s.actor.providerId));");
  return patch(code,"assigned=s.actor.canReply&&s.actor.providerId&&((String(a.guardian_id)===String(s.actor.providerId)||String(a.provider_id)===String(s.actor.providerId))||serviceRole()==='DIRECTOR'&&String(a.director_id)===String(s.actor.providerId))",
   "assigned=s.actor.canReply&&s.actor.providerId&&(String(a.guardian_id)===String(s.actor.providerId)||serviceRole()==='DIRECTOR'&&String(a.director_id)===String(s.actor.providerId))");
 }
};
const calls=[];
for(const [nodeId,edit] of Object.entries(edits)){
 const node=flow.allNodes.find(x=>x.uniqueId===nodeId);assert.equal(node.type,'CUSTOM_CODE');
 assert.ok(!node.code.includes(MARK),'Already staged in '+nodeId);
 const code=edit(node.code);
 if(dry){fs.mkdirSync(dry,{recursive:true});fs.writeFileSync(path.join(dry,nodeId+'.before.js'),node.code);fs.writeFileSync(path.join(dry,nodeId+'.js'),code);}
 calls.push({name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId,config:{type:'CUSTOM_CODE',code}}});
}
if(dry){console.log(JSON.stringify({dryRun:dry,nodes:Object.keys(edits)}));process.exit(0);}
const out=run('schema','tool-call','--toolCalls',JSON.stringify(calls));assert.ok(!out.errors,JSON.stringify(out.errors));
console.log(JSON.stringify({staged:true,nodes:Object.keys(edits),validation:run('schema','validate')},null,2));
