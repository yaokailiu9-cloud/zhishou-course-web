// Minimal live-node patch: the chat archive list reports unread direct messages and who sent the latest one.
// Replaces only the service-management block of node z07supad5 with backend/consultation/service-review.js.
// Usage: node scripts/stage-chat-unread.js [--dry-run <outDir>]   (run with ZION_PROJECT_CWD set to the main folder)
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
function run(...args){return JSON.parse(cp.execFileSync('npx',['-y','zion-mcp@2.7.15',...args],{cwd:process.env.ZION_PROJECT_CWD||root,encoding:'utf8',maxBuffer:50000000,timeout:180000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
const dry=process.argv[2]==='--dry-run'?process.argv[3]:null;
assert.equal(run('schema','load').projectExId,'JmAxbl1MMe4');
const flow=run('schema','snapshot','--args','{"full":true}').server.actionFlows.find(x=>x.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
const node=flow.allNodes.find(x=>x.uniqueId==='z07supad5');assert.equal(node.type,'CUSTOM_CODE');
const live=node.code,start=live.indexOf('// Service management:'),end=live.lastIndexOf('context.setReturn("state",s);');
assert.equal(live.split('// Service management:').length,2,'Service block anchor changed; review before applying');
assert.ok(start>=0&&end>start&&live.includes('function dialogueUnread('),'Live node lacks the dialogue unread helper');
assert.ok(!live.includes("op==='SERVICE_CHAT_UNREAD'"),'Already staged');
const code=live.slice(0,start)+read('backend/consultation/service-review.js').trim()+'\n'+live.slice(end);
if(dry){fs.mkdirSync(dry,{recursive:true});fs.writeFileSync(path.join(dry,'z07supad5.before.js'),live);fs.writeFileSync(path.join(dry,'z07supad5.js'),code);console.log(JSON.stringify({dryRun:dry}));process.exit(0);}
const out=run('schema','tool-call','--toolCalls',JSON.stringify([{name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:'z07supad5',config:{type:'CUSTOM_CODE',code}}}]));
assert.ok(!out.errors,JSON.stringify(out.errors));
console.log(JSON.stringify({staged:true,validation:run('schema','validate')},null,2));
