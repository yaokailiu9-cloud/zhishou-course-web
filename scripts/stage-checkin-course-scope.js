// Patch only the verified live check-in scope; preserve concurrent node changes.
// ZION_CLI must point to the installed Zion plugin's bin/zion-mcp.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cli=process.env.ZION_CLI;
assert.ok(cli,'Set ZION_CLI to the installed plugin bin/zion-mcp');
function run(...args){return JSON.parse(cp.execFileSync(cli,args,{cwd:process.env.ZION_PROJECT_CWD||root,encoding:'utf8',maxBuffer:50000000,timeout:180000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
assert.equal(state.schemaExId,state.schemaRevision.deployedSchemaExId,'Review existing unpublished changes first');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const table=snapshot.server.dataModel.tableMetadata.find(t=>t.name==='public_class');
assert.ok(table.columnMetadata.some(c=>c.name==='product_kind'&&c.type==='TEXT'),'Verify product_kind');
const flow=snapshot.server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
const node=flow.allNodes.find(n=>n.uniqueId==='h4i3zzuex');assert.equal(node.type,'CUSTOM_CODE');
const before="return isCheckinManager ? {} : {checkin_assignments:and(eq('staff_account_id',actor.accountId),eq('active',true,'boolean'))};";
const after="return and(COURSE_SCOPE, isCheckinManager ? {} : {checkin_assignments:and(eq('staff_account_id',actor.accountId),eq('active',true,'boolean'))});";
assert.ok(node.code.includes('var COURSE_SCOPE ='),'Verify shared course filter');
assert.ok(fs.readFileSync(path.join(root,'backend/consultation/checkin.js'),'utf8').includes(after));
if(node.code.includes(after)){console.log(JSON.stringify({alreadyApplied:true}));process.exit(0);}
assert.equal(node.code.split(before).length,2,'Live scope changed; review before applying');
const code=node.code.replace(before,()=>after),out=path.join(root,'.codex-work/checkin-course-scope');
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'before.js'),node.code);fs.writeFileSync(path.join(out,'after.js'),code);
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({dryRun:true,nodeId:node.uniqueId,out}));process.exit(0);}
const update=run('schema','tool-call','--toolCalls',JSON.stringify([{name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:node.uniqueId,config:{type:'CUSTOM_CODE',code}}}]));
assert.ok(!update.errors,JSON.stringify(update.errors));
console.log(JSON.stringify({staged:true,nodeId:node.uniqueId,validation:run('schema','validate')},null,2));
