// Patch only the verified viewing handler, preserving all concurrent service nodes.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),cwd=process.env.ZION_PROJECT_CWD||root;
function run(...args){return JSON.parse(cp.execFileSync('npx',['-y','zion-mcp@2.7.13',...args],{cwd,encoding:'utf8',timeout:180000,maxBuffer:30000000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');assert.equal(state.typeSystem,'pre_type_system_refactor');
const snapshot=run('schema','snapshot','--args','{"full":true}'),server=snapshot.server;
const course=server.dataModel.tableMetadata.find(t=>t.name==='course');
assert.ok(course.columnMetadata.some(c=>c.name==='public_video'&&c.type==='BOOLEAN'));
for(const role of server.roleConfigs){
 const grants=role.permissionConfig.tablePermissionById;
 for(const name of ['course','course_lesson','course_view_grant']){
  const t=server.dataModel.tableMetadata.find(t=>t.name===name),p=grants[t.id]||{};
  for(const op of ['insert','update','delete'])assert.ok(!p[op],role.name+'/'+name+'/'+op);
  if(name==='course_lesson')for(const column of ['video','video_url'])assert.ok(!p.select.columns.includes(column));
  if(name==='course_view_grant')assert.ok(!p.select&&!p.count&&!p.aggregate);
 }
}
const flow=server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
const node=flow.allNodes.find(n=>n.uniqueId==='dv4kpohsg');assert.equal(node.type,'CUSTOM_CODE');
const next=fs.readFileSync(path.join(root,'backend/consultation/course-access.js'),'utf8').trim();
const previous=next.replace('{id title enabled public_video}}','{id title enabled}}')
 .replace("// Only the server-stored flag opens video; a share URL never grants access.\n    var isPublic = course.enabled === true && course.public_video === true;\n    var canWatch = isPublic || viewStaff, reason = '';\n    if (!canWatch && !s.actor.accountId) reason = 'LOGIN';\n    else if (!canWatch) {", "var canWatch = viewStaff, reason = '';\n    if (!s.actor.accountId) reason = 'LOGIN';\n    else if (!viewStaff) {")
 .replace('result(s, {canWatch:canWatch, isPublic:isPublic, reason:reason, lessons:','result(s, {canWatch:canWatch, reason:reason, lessons:');
assert.equal(node.code.split(previous).length,2,'Live viewing handler changed; inspect before patching');
const code=node.code.replace(previous,next);
if(process.argv.includes('--dry-run')){console.log('Verified public video flag, closed direct permissions and minimal patch');process.exit(0);}
const result=run('schema','tool-call','--toolCalls',JSON.stringify([{name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:node.uniqueId,config:{type:'CUSTOM_CODE',code}}}]));assert.ok(!result.errors,JSON.stringify(result.errors));
console.log(JSON.stringify(run('schema','validate')));
