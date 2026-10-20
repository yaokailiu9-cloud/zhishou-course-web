// Replace only the reviewed portions of the two latest deployed code nodes.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cwd=process.env.ZION_PROJECT_CWD||root;
const cli=process.env.ZION_CLI||'/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.7.13/bin/zion-mcp';
const run=(...args)=>{try{return JSON.parse(cp.execFileSync(cli,args,{cwd,encoding:'utf8',maxBuffer:20000000,timeout:180000,env:{...process.env,PLUGIN_ROOT:path.dirname(path.dirname(cli)),MCP_LOG_FILE:'off'}}));}catch(e){throw Error(String(e.stdout||e.stderr||'Zion call failed').slice(-3000));}};
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function once(code,from,to){assert.equal(code.split(from).length,2,'Live code changed; review '+from.slice(0,80));return code.replace(from,to);}
const common=read('backend/consultation/common.js'),payment=read('backend/consultation/course-payment.js');
const paidHelper=common.slice(common.indexOf('// PAID_PURCHASE_LINK_START'),common.indexOf('// PAID_PURCHASE_LINK_END')+'// PAID_PURCHASE_LINK_END'.length);
assert.ok(paidHelper.includes('function paidLinkConsultationSource('));
function patch(code,id){
 assert.ok(!code.includes('// INTERNAL_PURCHASE_LINKS_START'),'Already staged; inspect before updating');
 const first=code.indexOf('// MANUAL_PACKAGE_APPROVAL_START'),last=code.indexOf('// MANUAL_PACKAGE_APPROVAL_END')+'// MANUAL_PACKAGE_APPROVAL_END'.length;
 if(first>=0){assert.ok(last>first);code=code.slice(0,first)+paidHelper+code.slice(last);}else code=once(code,'var APPOINTMENT_FIELDS =',paidHelper+'\nvar APPOINTMENT_FIELDS =');
 if(id==='g3oknp94t'){
  if(code.includes('function packageConsultationSource(')){
   code=once(code,'approval=manualPackagePurchaseSource(accountId)','approval=paidLinkConsultationSource(accountId)');
   code=once(code,'if(archived&&approval)archived.manualApproval=true;','if(archived&&approval)archived.viaPurchaseLink=true;');
   code=once(code,'manualApproval:!!(archived&&archived.manualApproval)','viaPurchaseLink:!!(archived&&archived.viaPurchaseLink)');
  }else{
   const pkg=read('backend/consultation/package.js'),helper=pkg.slice(pkg.indexOf('function packageConsultationSource('),pkg.indexOf('// Each PAID'));
   code=once(code,'// Each PAID',helper+'// Each PAID');
   code=once(code,'archived=archivedConsultation(s.actor.accountId),pkg=','archived=packageConsultationSource(s.actor.accountId),pkg=');
   code=once(code,'var archived=archivedConsultation(s.actor.accountId);','var archived=packageConsultationSource(s.actor.accountId);');
   code=once(code,'    package:pkg?',"    viaPurchaseLink:!!(archived&&archived.viaPurchaseLink),\n    package:pkg?");
   code=once(code,'child_info:childInfo,staff_note:','child_info:childInfo.name?childInfo:null,staff_note:');
  }
  code=once(code,'archived=archivedConsultation(a.customer_id)','archived=packageConsultationSource(a.customer_id)');
 }else{
  code=once(code,"if(op==='PREPARE_COURSE_PAYMENT'){",'// INTERNAL_PURCHASE_LINKS_START\n'+read('backend/consultation/link-signature.js')+'\n'+read('backend/consultation/purchase-links.js')+'\n// INTERNAL_PURCHASE_LINKS_END\n'+"if(op==='PREPARE_COURSE_PAYMENT'){");
  code=once(code,"var c=one('public_class',p.classId,CLASS_FIELDS),scope=","var c=one('public_class',p.classId,CLASS_FIELDS),linkGrant=p.paymentLinkToken?purchaseLinkGrant(p.paymentLinkToken,c):null,scope=");
  if(code.includes('!manualPackagePurchaseSource(s.actor.accountId)&&'))code=once(code,'!manualPackagePurchaseSource(s.actor.accountId)&&','!linkGrant&&!paidLinkConsultationSource(s.actor.accountId)&&');
  else code=once(code,"if(c.product_kind==='CONSULT_PACKAGE'&&!list('offline_appointment'","if(c.product_kind==='CONSULT_PACKAGE'&&!linkGrant&&!paidLinkConsultationSource(s.actor.accountId)&&!list('offline_appointment'");
  const pending=payment.split('\n').find(line=>line.includes('if(pending){if(linkGrant)'));
  assert.ok(pending);code=once(code,'    if(pending)result(s,{order:payPublic(pending),resume:true});',pending);
  code=once(code,'source:JSON.stringify({referrerId:candidate?candidate.account_id:null})','source:JSON.stringify({referrerId:candidate?candidate.account_id:null,linkPurchase:linkGrant||undefined})');
 }
 return code;
}
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');if(state.schemaExId!==state.schemaRevision.deployedSchemaExId)assert.equal(process.env.REVIEWED_ZION_DRAFT,state.schemaExId,'Unpublished changes exist; audit before proceeding');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const table=snapshot.server.dataModel.tableMetadata.find(t=>t.name==='course_registration_order');assert.ok(table);
for(const role of snapshot.server.roleConfigs){const p=role.permissionConfig.tablePermissionById[table.id]||{};assert.ok(!['select','insert','update','delete','aggregate','count'].some(k=>p[k]),'Order provenance must stay backend-only');}
const flow=snapshot.server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
const out=path.join(root,'.codex-work/internal-purchase-links');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'before.json'),JSON.stringify(snapshot));
const calls=['g3oknp94t','sui9sl3ko'].map(id=>{const n=flow.allNodes.find(n=>n.uniqueId===id);assert.equal(n.type,'CUSTOM_CODE');fs.writeFileSync(path.join(out,id+'-before.js'),n.code);const code=patch(n.code,id);fs.writeFileSync(path.join(out,id+'-after.js'),code);return {name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:id,config:{type:'CUSTOM_CODE',code}}};});
if(process.argv.includes('--apply')){const r=run('schema','tool-call','--toolCalls',JSON.stringify(calls));assert.ok(!r.errors,JSON.stringify(r.errors));console.log(JSON.stringify({staged:true,validation:run('schema','validate')}));}else console.log(JSON.stringify({dryRun:true,nodes:calls.map(c=>c.args.nodeId)}));
