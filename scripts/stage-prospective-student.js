// Patch only the verified eligibility snippets in the two existing live nodes.
// Invoke with PLUGIN_ROOT pointing to the installed official Zion plugin.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const helper=fs.readFileSync(path.join(root,'backend/consultation/common.js'),'utf8').match(/\/\/ Prospective-student eligibility[^]*?\n}\n/)[0];
function swap(code,from,to){assert.equal(code.split(from).length,2,'Live code changed; review before staging: '+from.slice(0,100));return code.replace(from,to);}
function patch(id,code){
 assert.ok(!code.includes('function verifiedPublicClass('),'Eligibility already staged; inspect live code');
 code=swap(code,'var APPOINTMENT_FIELDS = ',helper+'var APPOINTMENT_FIELDS = ');
 if(id==='h4i3zzuex'){
  code=swap(code,'attendance_status child_submitted_at','attendance_status verified_at verified_by_id child_submitted_at');
  code=swap(code,'status:e.status, attendanceStatus:e.attendance_status','status:e.status, attendanceStatus:e.attendance_status, canBookConsultation:verifiedPublicClass(e)');
 }else if(id==='g3oknp94t'){
  code=swap(code,"enrollment.status!=='REGISTERED' || enrollment.attendance_status!=='ATTENDED' || !enrollment.verified_at || !enrollment.verified_by_id || isQuestionnaire(enrollment.public_class)",'!verifiedPublicClass(enrollment)');
  code=swap(code,'one("public_class_enrollment",a.enrollment_id,"id attendance_status status verified_at")','one("public_class_enrollment",a.enrollment_id,ENROLL_FIELDS)');
  code=swap(code,'e.attendance_status!=="ATTENDED" || e.status!=="REGISTERED" || !e.verified_at','!verifiedPublicClass(e) || String(e.customer_id)!==String(a.customer_id)');
 }else throw new Error('Unexpected node');
 return code;
}
if(require.main===module){
 if(process.argv[2]==='--dry-run'){
  for(const id of ['h4i3zzuex','g3oknp94t'])fs.writeFileSync('/tmp/zhishou-eligible-'+id+'.js',patch(id,fs.readFileSync(path.join(process.argv[3],'zhishou-'+id+'.js'),'utf8')));
  console.log('Verified both live patches');
 }else{
  const pluginRoot=process.env.PLUGIN_ROOT||process.env.CLAUDE_PLUGIN_ROOT;assert.ok(pluginRoot,'Set the installed official PLUGIN_ROOT');
  function run(...args){return JSON.parse(cp.execFileSync(path.join(pluginRoot,'bin/zion-mcp'),args,{cwd:root,encoding:'utf8',maxBuffer:20000000,timeout:180000}));}
  run('project','set-current','--projectExId','JmAxbl1MMe4');
  const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
  const snapshot=run('schema','snapshot','--args','{"full":true}');
  const tables=snapshot.server.dataModel.tableMetadata;
  for(const name of ['course_referral','public_class_enrollment','offline_appointment']){
   const table=tables.find(t=>t.name===name);assert.ok(table);
   for(const role of snapshot.server.roleConfigs){const p=role.permissionConfig.tablePermissionById[table.id]||{};assert.ok(!['select','insert','update','delete'].some(k=>p[k]),'Direct access must remain closed: '+name);}
  }
  const flow=snapshot.server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');assert.ok(flow);
  const calls=['h4i3zzuex','g3oknp94t'].map(id=>{const node=flow.allNodes.find(n=>n.uniqueId===id);assert.equal(node.type,'CUSTOM_CODE');return {name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:id,config:{type:'CUSTOM_CODE',code:patch(id,node.code)}}};});
  const output=path.join(root,'.codex-work/prospective-student');fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'before.json'),JSON.stringify(snapshot));
  const r=run('schema','tool-call','--toolCalls',JSON.stringify(calls));assert.ok(!r.errors,JSON.stringify(r.errors));
  console.log(JSON.stringify({staged:true,nodes:calls.map(c=>c.args.nodeId),validation:run('schema','validate')},null,2));
 }
}
module.exports={patch};
