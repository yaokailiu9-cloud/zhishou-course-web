// Append only the invitation-binding handler to the verified live authorization node.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),pluginRoot=process.env.PLUGIN_ROOT||process.env.CLAUDE_PLUGIN_ROOT;
assert.ok(pluginRoot,'Set the installed official PLUGIN_ROOT');
function run(...args){return JSON.parse(cp.execFileSync(path.join(pluginRoot,'bin/zion-mcp'),args,{cwd:root,encoding:'utf8',maxBuffer:20000000,timeout:180000}));}
run('project','set-current','--projectExId','JmAxbl1MMe4');
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const table=snapshot.server.dataModel.tableMetadata.find(t=>t.name==='course_referral');assert.ok(table);
for(const role of snapshot.server.roleConfigs){const p=role.permissionConfig.tablePermissionById[table.id]||{};assert.ok(!['select','insert','update','delete'].some(k=>p[k]),'Referral table must remain private');}
const flow=snapshot.server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');assert.ok(flow);assert.equal(flow.isAsync,false);
const node=flow.allNodes.find(n=>n.uniqueId==='h4i3zzuex');assert.equal(node.type,'CUSTOM_CODE');assert.ok(!node.code.includes("referralState.operation === 'BIND_INVITATION'"),'Already staged; inspect before updating');
const anchor="if (referralState.operation === 'REFERRAL_OVERVIEW') {";assert.equal(node.code.split(anchor).length,2);
const source=fs.readFileSync(path.join(root,'backend/consultation/referral.js'),'utf8');
const start=source.indexOf('// A signed invitation is verified by H5'),end=source.indexOf(anchor,start);assert.ok(start>=0&&end>start);
const code=node.code.replace(anchor,source.slice(start,end)+anchor);new Function('context',code);
const result=run('schema','tool-call','--toolCalls',JSON.stringify([{name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:node.uniqueId,config:{type:'CUSTOM_CODE',code}}}]));assert.ok(!result.errors,JSON.stringify(result.errors));
console.log(JSON.stringify({staged:true,node:node.uniqueId,validation:run('schema','validate')},null,2));
