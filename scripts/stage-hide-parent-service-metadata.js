// Minimal live-node patch: parents never receive the internal service grading (level, sub-level, priority,
// danger, phase, memo) for their own archive. Staff responses are unchanged.
// Usage: node scripts/stage-hide-parent-service-metadata.js [--dry-run <outDir>]
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const cli=process.env.ZION_CLI||'npx';const cliArgs=process.env.ZION_CLI?[]:['-y','zion-mcp@2.7.13'];
function run(...args){return JSON.parse(cp.execFileSync(cli,[...cliArgs,...args],{cwd:process.env.ZION_PROJECT_CWD||root,encoding:'utf8',maxBuffer:50000000,timeout:180000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
const dry=process.argv[2]==='--dry-run'?process.argv[3]:null;
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
const snapshot=run('schema','snapshot','--args','{"full":true}');
// The action flow must stay the only path to the grading: direct table access for both default roles is closed.
const table=snapshot.server.dataModel.tableMetadata.find(x=>x.name==='offline_appointment');assert.ok(table);
for(const role of snapshot.server.roleConfigs){const p=role.permissionConfig.tablePermissionById[table.id]||{};assert.ok(!['insert','update','delete','select','aggregate','count'].some(k=>p[k]),'offline_appointment direct permissions must stay closed');}
const flow=snapshot.server.actionFlows.find(x=>x.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
function patch(code,from,to){assert.equal(code.split(from).length,2,'Live anchor changed; review before applying: '+from.slice(0,80));return code.replace(from,()=>to);}
const node=flow.allNodes.find(x=>x.uniqueId==='z07supad5');assert.equal(node.type,'CUSTOM_CODE');
assert.ok(!node.code.includes('// PARENT_METADATA_HIDDEN'),'Already staged');
let code=patch(node.code,
 "var meta=Object.assign({},a.service_metadata||{});if(!s.actor.canReply)delete meta.memo;",
 "var meta=Object.assign({},a.service_metadata||{});if(!s.actor.canReply)delete meta.memo;// PARENT_METADATA_HIDDEN: a parent's own archive carries no internal grading.\nif(String(a.customer_id)===String(s.actor.accountId))meta={};");
code=patch(code,
 "if(!access.staff){a=Object.assign({},a,{service_metadata:Object.assign({},a.service_metadata||{})});delete a.service_metadata.memo;}",
 "if(!access.staff){a=Object.assign({},a,{service_metadata:{}});}");
if(dry){fs.mkdirSync(dry,{recursive:true});fs.writeFileSync(path.join(dry,'z07supad5.before.js'),node.code);fs.writeFileSync(path.join(dry,'z07supad5.js'),code);console.log(JSON.stringify({dryRun:dry,nodes:['z07supad5']}));process.exit(0);}
const out=run('schema','tool-call','--toolCalls',JSON.stringify([{name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:'z07supad5',config:{type:'CUSTOM_CODE',code}}}]));
assert.ok(!out.errors,JSON.stringify(out.errors));
console.log(JSON.stringify({staged:true,nodes:['z07supad5'],validation:run('schema','validate')},null,2));
