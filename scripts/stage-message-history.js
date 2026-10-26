// Patch only verified live chat nodes; preserve concurrent schema, permissions and other service handlers.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cli=process.env.ZION_CLI;
assert.ok(cli,'Set ZION_CLI to the installed Zion plugin bin/zion-mcp');
const out=process.argv[3]||path.join(root,'.codex-work/message-history'),dry=process.argv[2]==='--dry-run';fs.mkdirSync(out,{recursive:true});
function run(...args){return JSON.parse(cp.execFileSync(cli,args,{cwd:process.env.ZION_PROJECT_CWD||root,encoding:'utf8',maxBuffer:50000000,timeout:180000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
const read=f=>fs.readFileSync(path.join(root,'backend/consultation',f+'.js'),'utf8');
const baseline=f=>cp.execFileSync('git',['show','ecf0eb2:backend/consultation/'+f+'.js'],{cwd:root,encoding:'utf8'});
function swap(code,before,after){assert.equal(code.split(before).length,2,'Live code changed; inspect anchor '+before.slice(0,100));return code.replace(before,()=>after);}
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');assert.equal(state.schemaExId,state.schemaRevision.deployedSchemaExId,'Unpublished schema edits require inspection');
const snapshot=run('schema','snapshot','--args','{"full":true}'),tables=snapshot.server.dataModel.tableMetadata;
for(const [name,fields]of [['consultation_feedback',['status','content','author_id','appointment_id']],['service_review_item',['request_key','kind','stage','body','history','revision','feedback_id','appointment_id','author_id']]]){
 const t=tables.find(t=>t.name===name);assert.ok(t);for(const field of fields)assert.ok(t.columnMetadata.some(c=>c.name===field));
 for(const role of snapshot.server.roleConfigs){const p=role.permissionConfig.tablePermissionById[t.id]||{};assert.ok(!['select','insert','update','delete','aggregate','count'].some(k=>p[k]),'Direct table access must stay closed');}
}
const flow=snapshot.server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');assert.ok(flow);assert.ok(!flow.async,'Message status and audit must share one synchronous transaction');
const block=(code,tag)=>{const start=code.indexOf('// '+tag+'_START'),end=code.indexOf('// '+tag+'_END')+('// '+tag+'_END').length;assert.ok(start>=0&&end>start);return code.slice(start,end);};
const calls=[];
for(const nodeId of ['z07supad5','g3oknp94t','sui9sl3ko','dv4kpohsg']){
 const node=flow.allNodes.find(n=>n.uniqueId===nodeId);assert.equal(node.type,'CUSTOM_CODE');let code=node.code;
 if(nodeId!=='dv4kpohsg')code=swap(code,block(baseline('dialogue-unread'),'DIALOGUE_UNREAD'),block(read('dialogue-unread'),'DIALOGUE_UNREAD'));
 if(nodeId==='z07supad5'){
  assert.ok(!code.includes('Message deletion is a reversible status change'),'Already staged');
  code=swap(code,block(baseline('dialogue-unread'),'PARENT_READ_QUOTE'),block(read('dialogue-unread'),'PARENT_READ_QUOTE'));
  const part=v=>v.slice(v.indexOf('function dialogueMessage(a,row)'),v.indexOf('// SERVICE_REVIEW_HANDLERS:'));
  code=swap(code,part(baseline('followup')).trim(),part(read('followup')).trim());
  code=swap(code,baseline('service-review'),read('service-review'));
  code=swap(code,'context.setReturn("state",s);',read('message-history')+'\ncontext.setReturn("state",s);');
 }else if(nodeId==='dv4kpohsg'){
  const before='list("consultation_feedback",eq("appointment_id",a.id),FEEDBACK_FIELDS,501)',after='list("consultation_feedback",and(eq("appointment_id",a.id),{_not:eq("status","DELETED","text")}),FEEDBACK_FIELDS,501)';code=swap(code,before,after);
 }
 fs.writeFileSync(path.join(out,nodeId+'.before.js'),node.code);fs.writeFileSync(path.join(out,nodeId+'.js'),code);
 new (require('node:vm').Script)(code);
 calls.push({name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId,config:{type:'CUSTOM_CODE',code}}});
}
fs.writeFileSync(path.join(out,'before.json'),JSON.stringify(snapshot));
if(dry){console.log(JSON.stringify({dryRun:true,nodes:calls.map(c=>c.args.nodeId)}));process.exit(0);}
const result=run('schema','tool-call','--toolCalls',JSON.stringify(calls));assert.ok(!result.errors,JSON.stringify(result.errors));fs.writeFileSync(path.join(out,'stage-result.json'),JSON.stringify(result));console.log(JSON.stringify({staged:true,validation:run('schema','validate')}));
