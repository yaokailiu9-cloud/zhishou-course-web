// Minimal live-node patch for the teacher chat:
// 1. Staff who may open an archive's direct messages also get the parent's read position
//    (consultation_dialogue_read of the archive's customer). Parents never get any staff read state.
// 2. SEND_CONSULTATION_MESSAGE and SEND_SERVICE_FEEDBACK accept a WeChat-style quote. The quoted text is read by the backend
//    from a message in the same archive that the sender may see; clients cannot forge the quote.
// Usage: node scripts/stage-parent-read-quote.js [--dry-run <outDir>] | --repo (patch backend/consultation only)
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const cli=process.env.ZION_CLI||'npx';const cliArgs=process.env.ZION_CLI?[]:['-y','zion-mcp@2.8.0'];
function run(...args){return JSON.parse(cp.execFileSync(cli,[...cliArgs,...args],{cwd:process.env.ZION_PROJECT_CWD||root,encoding:'utf8',maxBuffer:50000000,timeout:180000,env:{...process.env,MCP_LOG_FILE:'off'}}));}
function patch(code,from,to){assert.equal(code.split(from).length,2,'Live anchor changed; review before applying: '+from.slice(0,80));return code.replace(from,()=>to);}

const HELPERS=`// PARENT_READ_QUOTE_START
// Quotes are stored inside the message text behind invisible markers that typed text may not contain.
var QUOTE_MARK="\\u2063";
function quoteBody(v){var m=/^\\u2063【引用】[\\s\\S]*?\\u2063\\n/.exec(String(v||""));return m?String(v).slice(m[0].length):String(v||"");}
function dialogueQuote(a){
  if(!p.quoteKind&&!p.quoteId)return "";
  var own=String(a.customer_id)===String(s.actor.accountId),label,body;
  // Feedback and reviewed replies follow the archive's own visibility (assigned staff, 总管), not the chat's.
  if(p.quoteKind!=="dialogue"&&!own)serviceCase(a.id);
  if(p.quoteKind==="reply"){
    var r=list("service_review_item",and(eq("id",id(p.quoteId)),eq("appointment_id",a.id),eq("kind","REPLY","text")),"id stage available_at body",1)[0];
    if(!r||(own&&!serviceVisible(r))||!r.body||!r.body.content)fail("引用的消息不存在或不可见");
    label="老师回复";body=r.body.content;
  } else if(p.quoteKind==="dialogue"||p.quoteKind==="feedback") {
    var f=list("consultation_feedback",and(eq("id",id(p.quoteId)),eq("appointment_id",a.id),eq("advice_key",p.quoteKind==="dialogue"?"__consultation_dialogue__":"__service_feedback__","text")),"id author_id content",1)[0];
    if(!f)fail("引用的消息不存在或不可见");
    label=String(f.author_id)===String(a.customer_id)?(p.quoteKind==="feedback"?"家长反馈":"家长"):"老师";body=quoteBody(f.content);
  } else fail("引用类型无效");
  body=String(body).replace(/\\u2063/g,"").replace(/\\s+/g," ").trim();if(body.length>80)body=body.slice(0,80)+"…";
  return QUOTE_MARK+"【引用】"+label+"："+body+QUOTE_MARK+"\\n";
}
// Only staff learn how far the parent has read; the parent's own reads stay invisible to other parents.
function parentReadState(a){
  if(String(a.customer_id)===String(s.actor.accountId))return {};
  var row=(gql("query ParentDialogueRead($where:consultation_dialogue_read_bool_exp!){rows: consultation_dialogue_read(where:$where,limit:1){last_read_id service_read_at}}",{where:and(eq("reader_id",a.customer_id),eq("appointment_id",a.id))}).rows||[])[0]||{};
  return {parentReadId:Number(row.last_read_id)||0,parentServiceReadAt:row.service_read_at||null};
}
// PARENT_READ_QUOTE_END
`;

function edit(code,{dialogue=true,service=true}={}){
 if(dialogue){
  code=patch(code,'function dialogueMessage(a,row) {',HELPERS+'function dialogueMessage(a,row) {');
  code=patch(code,'result(s,{messages:newer.map(function(row){return dialogueMessage(a,row);}),hasMoreNewer:more});',
   'result(s,Object.assign({messages:newer.map(function(row){return dialogueMessage(a,row);}),hasMoreNewer:more},parentReadState(a)));');
  code=patch(code,'result(s,{messages:page.items.reverse().map(function(row){return dialogueMessage(a,row);}),nextCursor:page.nextCursor});',
   'result(s,Object.assign({messages:page.items.reverse().map(function(row){return dialogueMessage(a,row);}),nextCursor:page.nextCursor},parentReadState(a)));');
  code=patch(code,'content=text(p.content,"消息",6000,true);\n  insert("consultation_feedback",{request_key:key,appointment_id:a.id,author_id:s.actor.accountId,advice_key:"__consultation_dialogue__"',
   'content=text(p.content,"消息",6000,true);\n  if(content.indexOf(QUOTE_MARK)>=0)fail("消息包含无效字符");content=dialogueQuote(a)+content;\n  insert("consultation_feedback",{request_key:key,appointment_id:a.id,author_id:s.actor.accountId,advice_key:"__consultation_dialogue__"');
 }
 if(service){
  code=patch(code,"canDraft:access.staff&&!!s.actor.canReply,plan:serviceView(plan,access.staff),",
   "canDraft:access.staff&&!!s.actor.canReply,parentServiceReadAt:access.staff?parentReadState(a).parentServiceReadAt:undefined,plan:serviceView(plan,access.staff),");
  code=patch(code,"content=text(p.content,'反馈内容',6000,true);\n insert('consultation_feedback',",
   "content=text(p.content,'反馈内容',6000,true);\n if(content.indexOf(QUOTE_MARK)>=0)fail('反馈包含无效字符');content=dialogueQuote(access.row)+content;\n insert('consultation_feedback',");
 }
 return code;
}

if(process.argv[2]==='--repo'){
 // In the repo the helpers sit with the shared read helpers (dialogue-unread.js); live they go into z07supad5 only.
 const f0=path.join(root,'backend/consultation/dialogue-unread.js'),f1=path.join(root,'backend/consultation/followup.js'),f2=path.join(root,'backend/consultation/service-review.js');
 fs.writeFileSync(f0,fs.readFileSync(f0,'utf8')+HELPERS);
 fs.writeFileSync(f1,edit(fs.readFileSync(f1,'utf8'),{service:false}).replace(HELPERS,''));
 fs.writeFileSync(f2,edit(fs.readFileSync(f2,'utf8'),{dialogue:false}));
 console.log(JSON.stringify({repo:true}));process.exit(0);
}
const dry=process.argv[2]==='--dry-run'?process.argv[3]:null;
const state=run('schema','load');assert.equal(state.projectExId,'JmAxbl1MMe4');
const snapshot=run('schema','snapshot','--args','{"full":true}');
const table=snapshot.server.dataModel.tableMetadata.find(x=>x.name==='consultation_dialogue_read');assert.ok(table);
for(const role of snapshot.server.roleConfigs){const perm=role.permissionConfig.tablePermissionById[table.id]||{};assert.ok(!['insert','update','delete','select','aggregate','count'].some(k=>perm[k]),'Read-mark direct permissions must stay closed');}
const flow=snapshot.server.actionFlows.find(x=>x.uniqueId==='9f60a0be-4628-4268-a769-661264846cf4');
const node=flow.allNodes.find(x=>x.uniqueId==='z07supad5');assert.equal(node.type,'CUSTOM_CODE');
assert.ok(!node.code.includes('PARENT_READ_QUOTE_START'),'Already staged');
// parentReadState is defined in the dialogue section; GET_SERVICE_CASE lives later in the same node.
assert.ok(node.code.indexOf('function dialogueMessage(a,row)')<node.code.indexOf("if(op==='GET_SERVICE_CASE')"));
const code=edit(node.code);
if(dry){fs.mkdirSync(dry,{recursive:true});fs.writeFileSync(path.join(dry,'z07supad5.before.js'),node.code);fs.writeFileSync(path.join(dry,'z07supad5.js'),code);console.log(JSON.stringify({dryRun:dry,nodes:['z07supad5']}));process.exit(0);}
const out=run('schema','tool-call','--toolCalls',JSON.stringify([{name:'UPDATE_ACTION_FLOW_NODE',args:{actionFlowId:flow.uniqueId,nodeId:'z07supad5',config:{type:'CUSTOM_CODE',code}}}]));
assert.ok(!out.errors,JSON.stringify(out.errors));
console.log(JSON.stringify({staged:true,nodes:['z07supad5'],validation:run('schema','validate')},null,2));
