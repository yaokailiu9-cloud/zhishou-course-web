// Minimal patches against the freshly loaded live nodes; preserve concurrent work.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cwd=process.env.ZION_PROJECT_CWD||root;
const cli=process.env.ZION_CLI||'/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.7.13/bin/zion-mcp';
const run=(...args)=>JSON.parse(cp.execFileSync(cli,args,{cwd,encoding:'utf8',maxBuffer:20000000,timeout:180000,env:{...process.env,PLUGIN_ROOT:path.dirname(path.dirname(cli)),MCP_LOG_FILE:'off'}}));
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function once(code,from,to){assert.equal(code.split(from).length,2,'Live code changed; review '+from.slice(0,90));return code.replace(from,to);}
const common=read('backend/consultation/common.js');
const helper=common.slice(common.indexOf('// MANUAL_PACKAGE_APPROVAL_START'),common.indexOf('// MANUAL_PACKAGE_APPROVAL_END')+'// MANUAL_PACKAGE_APPROVAL_END'.length);
assert.ok(helper.includes('function manualPackagePurchaseSource('));
function patch(code,node){
 assert.ok(!code.includes('// MANUAL_PACKAGE_APPROVAL_START'),'Already staged; inspect deployed version before retry');
 const prerequisite=code.includes('function verifiedPublicClass(')?'':common.slice(common.indexOf('// Prospective-student eligibility'),common.indexOf('// MANUAL_PACKAGE_APPROVAL_START'));
 code=once(code,'var APPOINTMENT_FIELDS =',prerequisite+helper+'\nvar APPOINTMENT_FIELDS =');
 if(node==='g3oknp94t'){
  const pkg=read('backend/consultation/package.js');
  const source=pkg.slice(pkg.indexOf('function packageConsultationSource('),pkg.indexOf('// Each PAID'));
  code=once(code,'// Each PAID',source+'// Each PAID');
  code=once(code,'archived=archivedConsultation(s.actor.accountId),pkg=','archived=packageConsultationSource(s.actor.accountId),pkg=');
  code=once(code,'var archived=archivedConsultation(s.actor.accountId);','var archived=packageConsultationSource(s.actor.accountId);');
  code=once(code,'    package:pkg?',"    manualApproval:!!(archived&&archived.manualApproval),\n    package:pkg?");
  code=once(code,'child_info:childInfo,staff_note:', 'child_info:childInfo.name?childInfo:null,staff_note:');
 }else{
  code=once(code,"if(c.product_kind==='CONSULT_PACKAGE'&&!list('offline_appointment'","if(c.product_kind==='CONSULT_PACKAGE'&&!manualPackagePurchaseSource(s.actor.accountId)&&!list('offline_appointment'");
 }
 return code;
}
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
assert.equal(state.schemaRevision.deployedSchemaExId,state.schemaExId,'Unpublished changes exist; inspect first');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const flow=snapshot.server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
const out=path.join(root,'.codex-work/manual-package-purchase');fs.mkdirSync(out,{recursive:true});
const calls=['g3oknp94t','sui9sl3ko'].map(id=>{const node=flow.allNodes.find(n=>n.uniqueId===id);assert.equal(node.type,'CUSTOM_CODE');fs.writeFileSync(path.join(out,id+'-before.js'),node.code);const code=patch(node.code,id);fs.writeFileSync(path.join(out,id+'-after.js'),code);return {name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:id,config:{type:'CUSTOM_CODE',code}}};});
fs.writeFileSync(path.join(out,'before.json'),JSON.stringify(snapshot));
if(process.argv.includes('--apply')){const applied=run('schema','tool-call','--toolCalls',JSON.stringify(calls));assert.ok(!applied.errors,JSON.stringify(applied.errors));console.log(JSON.stringify({staged:true,validation:run('schema','validate')},null,2));}
else console.log(JSON.stringify({dryRun:true,nodes:calls.map(c=>c.args.nodeId),output:out}));
