// Minimal live-node patch: a 总管 may assign an archive to a 总监 alone (监护专员 optional), and the archive
// list no longer shows the booking provider as if they were the assigned 监护专员.
// Usage: node scripts/stage-optional-guardian.js [--dry-run <outDir>]
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const cli=process.env.ZION_CLI||'npx';const cliArgs=process.env.ZION_CLI?[]:['-y','zion-mcp@2.7.15'];
function run(...args){return JSON.parse(cp.execFileSync(cli,[...cliArgs,...args],{cwd:process.env.ZION_PROJECT_CWD||root,encoding:'utf8',maxBuffer:50000000,timeout:180000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
const dry=process.argv[2]==='--dry-run'?process.argv[3]:null;
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const table=snapshot.server.dataModel.tableMetadata.find(x=>x.name==='offline_appointment');assert.ok(table);
for(const role of snapshot.server.roleConfigs){const p=role.permissionConfig.tablePermissionById[table.id]||{};assert.ok(!['insert','update','delete','select','aggregate','count'].some(k=>p[k]),'offline_appointment direct permissions must stay closed');}
const flow=snapshot.server.actionFlows.find(x=>x.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
function patch(code,from,to){assert.equal(code.split(from).length,2,'Live anchor changed; review before applying: '+from.slice(0,80));return code.replace(from,()=>to);}
const MARK='// OPTIONAL_GUARDIAN';
const node=flow.allNodes.find(x=>x.uniqueId==='z07supad5');assert.equal(node.type,'CUSTOM_CODE');assert.ok(!node.code.includes(MARK),'Already staged');
let code=patch(node.code," var guardian=one('service_provider',p.guardianId,'id service_kind service_status can_reply review_role'),director=",
 " "+MARK+": a 总管 may hand an archive to a 总监 alone; without a 监护专员 nobody gains guardian access.\n var guardian=p.guardianId==null||p.guardianId===''?null:one('service_provider',p.guardianId,'id service_kind service_status can_reply review_role'),director=");
code=patch(code,"if(guardian.service_status!=='ACTIVE'||!guardian.can_reply||guardian.service_kind==='AGENT')fail('请选择启用的监护专员');",
 "if(guardian&&(guardian.service_status!=='ACTIVE'||!guardian.can_reply||guardian.service_kind==='AGENT'))fail('请选择启用的监护专员');");
code=patch(code,"{guardian_id:guardian.id,director_id:director.id,service_metadata:meta}","{guardian_id:guardian?guardian.id:null,director_id:director.id,service_metadata:meta}");
code=patch(code,"guardianName:a.guardian&&a.guardian.display_name||a.provider&&a.provider.display_name||''","guardianName:a.guardian&&a.guardian.display_name||''");
if(dry){fs.mkdirSync(dry,{recursive:true});fs.writeFileSync(path.join(dry,'z07supad5.before.js'),node.code);fs.writeFileSync(path.join(dry,'z07supad5.js'),code);console.log(JSON.stringify({dryRun:dry,nodes:['z07supad5']}));process.exit(0);}
const out=run('schema','tool-call','--toolCalls',JSON.stringify([{name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:'z07supad5',config:{type:'CUSTOM_CODE',code}}}]));
assert.ok(!out.errors,JSON.stringify(out.errors));
console.log(JSON.stringify({staged:true,nodes:['z07supad5'],validation:run('schema','validate')},null,2));
