// Preserve concurrent live nodes while adding the reviewed service-management handlers.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),out=path.join(root,'.codex-work/service-review');fs.mkdirSync(out,{recursive:true});
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function run(...args){return JSON.parse(cp.execFileSync('npx',['-y','zion-mcp@2.7.13',...args],{cwd:root,encoding:'utf8',maxBuffer:30000000,timeout:180000}));}
function swap(code,old,next){assert.equal(code.split(old).length,2,'Live snippet changed; inspect before writing');return code.replace(old,next);}
run('project','set-current','--projectExId','JmAxbl1MMe4');const state=run('schema','load');assert.equal(state.typeSystem,'pre_type_system_refactor');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const tables=snapshot.server.dataModel.tableMetadata;
for(const [name,fields] of [['service_review_item',['request_key','kind','body','stage','revision','available_at','history','appointment_id','feedback_id','author_id']],['offline_appointment',['guardian_id','director_id','service_metadata']],['service_provider',['review_role']]]){
 const t=tables.find(t=>t.name===name);assert.ok(t);for(const field of fields)assert.ok(t.columnMetadata.some(c=>c.name===field),field);
}
for(const role of snapshot.server.roleConfigs)for(const name of ['service_review_item','offline_appointment','consultation_feedback','service_provider']){const table=tables.find(t=>t.name===name),p=role.permissionConfig.tablePermissionById[table.id]||{};for(const op of name==='service_provider'?['insert','update','delete']:['select','insert','update','delete','count','aggregate'])assert.ok(!p[op],`${role.name}/${name}/${op} must stay closed`);}
fs.writeFileSync(path.join(out,'before.json'),JSON.stringify(snapshot));
const flow=snapshot.server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');assert.ok(flow);
const old=cp.execFileSync('git',['show','d4c328c:backend/consultation/authorize.js'],{cwd:root,encoding:'utf8'}).trim();
const calls=['h4i3zzuex','z07supad5'].map(id=>{
 const node=flow.allNodes.find(n=>n.uniqueId===id);assert.equal(node.type,'CUSTOM_CODE');let code=node.code;
 if(id==='h4i3zzuex'){const next=read('backend/consultation/authorize.js').trim();if(code.includes(old))code=swap(code,old,next);else assert.ok(code.includes(next),'Live authorization differs from reviewed version');}
 else if(code.includes("op==='SERVICE_CHAT_OVERVIEW'")){const start=code.indexOf('// Service management:'),end=code.lastIndexOf('context.setReturn("state",s);');assert.ok(start>=0&&end>start);code=code.slice(0,start)+read('backend/consultation/service-review.js')+'\n'+code.slice(end);}
 else {code=swap(code,'var SERVICE_TABLES = [','var SERVICE_TABLES = ["service_review_item", ');code=swap(code,'if(f.advice_key==="__consultation_dialogue__")','if(["__consultation_dialogue__","__service_feedback__"].indexOf(f.advice_key)>=0)');code=swap(code,'context.setReturn("state",s);',read('backend/consultation/service-review.js')+'\ncontext.setReturn("state",s);');}
 fs.writeFileSync(path.join(out,'node-'+id+'.js'),code);return {name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:id,config:{type:'CUSTOM_CODE',code}}};
});
if(process.argv.includes('--dry-run')){console.log('Verified both minimal live patches; no nodes updated');process.exit(0);}
const result=run('schema','tool-call','--toolCalls',JSON.stringify(calls));assert.ok(!result.errors,JSON.stringify(result.errors));fs.writeFileSync(path.join(out,'stage-result.json'),JSON.stringify(result));console.log(JSON.stringify(run('schema','validate')));
