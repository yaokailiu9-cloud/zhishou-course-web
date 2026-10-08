// Minimal live-node patch: repeat purchases of the 5-session package (1000 single-session display),
// and every manager who can take bookings may accept bookings that default to the supervisor.
// Every replacement is asserted against the current live text so concurrent edits are retained.
// Usage: node scripts/stage-package-repurchase.js [--dry-run <dir with node .js files>]
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const oldPackage=cp.execFileSync('git',['show','0ac270b:backend/consultation/package.js'],{cwd:root,encoding:'utf8'});
const ASSIGNED=['  var assigned = String(a.provider_id) === String(s.actor.providerId) && !!s.actor.providerId;','  // Bookings default to the supervisor, but every manager who can take bookings may accept them.\n  var assigned = !!s.actor.providerId && (String(a.provider_id) === String(s.actor.providerId) || (s.actor.serviceKind === "STAFF" && !!s.actor.canAccept));'];
const NODES={
  h4i3zzuex:[ASSIGNED],z07supad5:[ASSIGNED],dv4kpohsg:[ASSIGNED],
  g3oknp94t:[ASSIGNED,[oldPackage,read('backend/consultation/package.js')],
    ['{status:"CONFIRMED",confirmed_at:confirmed,staff_note:text(p.note,"预约说明",2000,false)}','{status:"CONFIRMED",confirmed_at:confirmed,provider_id:s.actor.providerId,staff_note:text(p.note,"预约说明",2000,false)}'],
    ['  var assigned=!!s.actor.providerId && String(a.provider_id)===String(s.actor.providerId);','  var assigned=!!s.actor.providerId && (String(a.provider_id)===String(s.actor.providerId) || (s.actor.serviceKind==="STAFF" && !!s.actor.canAccept));'],
    ['and(eq("id",a.id),eq("provider_id",s.actor.providerId),eq("updated_at"','and(eq("id",a.id),eq("updated_at"',2]],
  sui9sl3ko:[ASSIGNED,
    ["  if(enrollment&&enrollment.status==='REGISTERED')result(s,{enrollment:enrollment});","  // The 5-session package can be bought repeatedly; each paid order adds sessions.\n  if(enrollment&&enrollment.status==='REGISTERED'&&c.product_kind!=='CONSULT_PACKAGE')result(s,{enrollment:enrollment});"],
    ["    var review=!!(existing&&existing.status==='REGISTERED')||!classView(c,false).canEnroll;","    var repeat=c.product_kind==='CONSULT_PACKAGE'&&!!existing&&existing.status==='REGISTERED';\n    var review=(!!(existing&&existing.status==='REGISTERED')&&!repeat)||!classView(c,false).canEnroll;"],
    ["    if(!review){","    if(!review&&!repeat){"],
    ["  var history=pageRows('offline_appointment',eq('provider_id',s.actor.providerId),APPOINTMENT_FIELDS,","  // Managers who can take bookings see every booking so they can accept others' bookings.\n  var history=pageRows('offline_appointment',s.actor.serviceKind==='STAFF'&&s.actor.canAccept?{}:eq('provider_id',s.actor.providerId),APPOINTMENT_FIELDS,"]],
};
function patch(id,code){
  assert.ok(!code.includes('PACKAGE_UNIT_PRICE')&&!code.includes('Bookings default to the supervisor'),'Already staged; inspect before updating');
  for(const [from,to,count=1] of NODES[id]){assert.equal(code.split(from).length-1,count,id+': live code changed; review: '+from.slice(0,70));code=code.split(from).join(to);}
  return code;
}
if(process.argv[2]==='--dry-run'){
  for(const id of Object.keys(NODES))fs.writeFileSync('/tmp/rp-'+id+'.js',patch(id,fs.readFileSync(path.join(process.argv[3],id+'.js'),'utf8')));
  console.log('dry run ok');process.exit(0);
}
function run(...args){return JSON.parse(cp.execFileSync('npx',['-y','zion-mcp@2.7.8',...args],{encoding:'utf8',maxBuffer:20000000,timeout:180000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const flow=snapshot.server.actionFlows.find(x=>x.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
const calls=Object.keys(NODES).map(id=>{const n=flow.allNodes.find(x=>x.uniqueId===id);assert.equal(n.type,'CUSTOM_CODE');return {name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:id,config:{type:'CUSTOM_CODE',code:patch(id,n.code)}}};});
const result=run('schema','tool-call','--toolCalls',JSON.stringify(calls));assert.ok(!result.errors,JSON.stringify(result.errors));
console.log(JSON.stringify({staged:true,project:state.projectExId,nodes:Object.keys(NODES),validation:run('schema','validate')},null,2));
