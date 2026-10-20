// Preserve concurrent backend work; replace owned blocks only after exact deployed-source comparison.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cwd=process.env.ZION_PROJECT_CWD||root,dir=path.join(root,'.codex-work/recipient-payment-links');
const cli='/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.7.13/bin/zion-mcp';
function run(...args){return JSON.parse(cp.execFileSync(cli,args,{cwd,encoding:'utf8',maxBuffer:20000000,timeout:180000,env:{...process.env,PLUGIN_ROOT:path.dirname(path.dirname(cli)),MCP_LOG_FILE:'off'}}));}
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),previous=f=>cp.execFileSync('git',['show','HEAD:'+f],{cwd:root,encoding:'utf8'});
function helper(s){return s.slice(s.indexOf('// PAID_PURCHASE_LINK_START'),s.indexOf('// PAID_PURCHASE_LINK_END')+ '// PAID_PURCHASE_LINK_END'.length);}
function payment(s,load){return s.slice(s.indexOf('var PAY_APP')).trim().replace('// PURCHASE_LINK_HANDLERS: build inserts link-signature.js and purchase-links.js here.','// INTERNAL_PURCHASE_LINKS_START\n'+load('backend/consultation/link-signature.js')+'\n'+load('backend/consultation/purchase-links.js')+'\n// INTERNAL_PURCHASE_LINKS_END');}
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');assert.equal(state.schemaExId,state.schemaRevision.deployedSchemaExId,'Review unpublished backend changes first');
const snapshot=run('schema','snapshot','--args','{"full":true}'),flow=snapshot.server.actionFlows.find(f=>f.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'before.json'),JSON.stringify(snapshot));
function once(s,a,b){assert.equal(s.split(a).length,2,'Concurrent drift in owned block');return s.replace(a,b);}
const calls=['g3oknp94t','sui9sl3ko'].map(nodeId=>{const n=flow.allNodes.find(n=>n.uniqueId===nodeId);let code=once(n.code,helper(previous('backend/consultation/common.js')),helper(read('backend/consultation/common.js')));
 if(nodeId==='sui9sl3ko')code=once(code,payment(previous('backend/consultation/course-payment.js'),previous),payment(read('backend/consultation/course-payment.js'),read));
 fs.writeFileSync(path.join(dir,nodeId+'-after.js'),code);return {name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId,config:{type:'CUSTOM_CODE',code}}};});
if(process.argv.includes('--apply')){console.log(JSON.stringify(run('schema','tool-call','--toolCalls',JSON.stringify(calls))));console.log(JSON.stringify(run('schema','validate')));}else console.log(JSON.stringify({dryRun:true,nodes:calls.map(c=>c.args.nodeId)}));
