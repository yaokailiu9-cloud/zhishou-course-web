// Minimal live-node patch: append the reviewed course viewing grant handlers to the last service node.
// Run after the course_view_grant table exists and its direct role permissions are closed.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),out=path.join(root,'.codex-work/course-access');fs.mkdirSync(out,{recursive:true});
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function run(...args){return JSON.parse(cp.execFileSync('npx',['-y','zion-mcp@2.7.8',...args],{cwd:root,encoding:'utf8',maxBuffer:30000000,timeout:180000}));}
run('project','set-current','--projectExId','JmAxbl1MMe4');const state=run('schema','load');assert.equal(state.typeSystem,'pre_type_system_refactor');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const tables=snapshot.server.dataModel.tableMetadata;
const grant=tables.find(t=>t.name==='course_view_grant');assert.ok(grant,'Create course_view_grant first');
for(const field of ['duration_hours','expires_at','revoked_at','request_key','viewer_id','granted_by_id','course_id'])assert.ok(grant.columnMetadata.some(c=>c.name===field),field);
const lesson=tables.find(t=>t.name==='course_lesson'),course=tables.find(t=>t.name==='course');
for(const role of snapshot.server.roleConfigs){
 const perms=role.permissionConfig.tablePermissionById;
 for(const op of ['select','insert','update','delete','count','aggregate'])assert.ok(!(perms[grant.id]||{})[op],`${role.name}/course_view_grant/${op} must stay closed`);
 for(const table of [course,lesson])for(const op of ['insert','update','delete'])assert.ok(!(perms[table.id]||{})[op],`${role.name}/${table.name}/${op} must be closed`);
 // Phase 2 (after the new frontend is live): pass --require-hidden-video to confirm the video columns are closed.
 const columns=((perms[lesson.id]||{}).select||{}).columns||[];
 if(process.argv.includes('--require-hidden-video'))for(const column of ['video','video_url'])assert.ok(!columns.includes(column),`${role.name} must not read course_lesson.${column}`);
}
fs.writeFileSync(path.join(out,'before.json'),JSON.stringify(snapshot));
const flow=snapshot.server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');assert.ok(flow);
const node=flow.allNodes.find(n=>n.uniqueId==='dv4kpohsg');assert.equal(node.type,'CUSTOM_CODE');
let code=node.code;const block=read('backend/consultation/course-access.js').trim();
if(code.includes("op.indexOf('COURSE_VIEW_') === 0")){const start=code.indexOf('// Course viewing grants:'),end=code.indexOf('if (!s.result) fail("暂不支持此操作");');assert.ok(start>=0&&end>start);code=code.slice(0,start)+block+'\n'+code.slice(end);}
else {const end='if (!s.result) fail("暂不支持此操作");';assert.equal(code.split(end).length,2,'Live node end changed; inspect before writing');code=code.replace(end,block+'\n'+end);}
fs.writeFileSync(path.join(out,'node-dv4kpohsg.js'),code);
if(process.argv.includes('--dry-run')){console.log('Verified minimal live patch; no nodes updated');process.exit(0);}
const result=run('schema','tool-call','--toolCalls',JSON.stringify([{name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:node.uniqueId,config:{type:'CUSTOM_CODE',code}}}]));assert.ok(!result.errors,JSON.stringify(result.errors));
console.log(JSON.stringify(run('schema','validate')));
