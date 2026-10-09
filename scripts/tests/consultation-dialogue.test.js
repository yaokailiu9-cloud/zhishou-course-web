const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function harness(){
 let identity='201',counter=0;const calls=[],timers=new Map();
 const service={requestKey:()=>String(++counter),formatTime:value=>value||'',call:async(op,payload)=>{calls.push({op,payload});return {messages:[],nextCursor:null};}};
 const session={capture:()=>({id:identity}),current:s=>s.id===identity};
 const scope={module:{exports:{}},require:name=>name==='./viewSession'?session:service,clearInterval:id=>timers.delete(id),setInterval:fn=>{const id=++counter;timers.set(id,fn);return id;}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../utils/consultationDialogue.js'),'utf8'),scope);
 const api=scope.module.exports,page={...api.methods,data:structuredClone(api.data),appointmentId:31,setData(values){Object.assign(this.data,values);}};
 page.data.canTalk=true;return {page,service,calls,timers,changeIdentity:value=>identity=value};
}
test('对话在详情内打开，加载与刷新仅拉消息并保持输入，关闭后停止轮询',async()=>{
 const h=harness();await h.page.openDialogue();assert.equal(h.timers.size,1);assert.equal(h.calls[0].op,'GET_CONSULTATION_DIALOGUE');
 h.page.inputDialogue({detail:{value:'未发出的输入'}});h.service.call=async()=>({messages:[{id:1,content:'老师问候',senderRole:'teacher',createdAt:'时间',isMine:false}]});
 await h.page.refreshDialogue();assert.equal(h.page.data.dialogueContent,'未发出的输入');assert.equal(h.page.data.dialogueMessages[0].senderLabel,'老师');h.page.closeDialogue();assert.equal(h.timers.size,0);
});
test('发送失败保留输入和请求号，重试成功清空；重复回读不重复展示',async()=>{
 const h=harness();await h.page.openDialogue();h.page.inputDialogue({detail:{value:'学生消息'}});const keys=[];
 h.service.call=async(op,p)=>{keys.push(p.requestKey);throw Error('网络错误');};await h.page.sendDialogue();assert.equal(h.page.data.dialogueContent,'学生消息');assert.match(h.page.data.dialogueError,/已保留/);
 const message={id:1,content:'学生消息',senderRole:'customer',isMine:true};h.service.call=async(op,p)=>{keys.push(p.requestKey);return {message};};await h.page.sendDialogue();assert.equal(keys[0],keys[1]);assert.equal(h.page.data.dialogueContent,'');h.page.mergeDialogue([message]);assert.equal(h.page.data.dialogueMessages.length,1);
});
test('发送期间新输入保留，自己发出的新编号不跳过尚未拉取的老师消息',async()=>{
 const h=harness();h.service.call=async()=>({messages:[{id:10,content:'旧消息',senderRole:'teacher'}]});await h.page.openDialogue();
 h.page.inputDialogue({detail:{value:'第一条'}});let resolve;h.service.call=op=>op==='SEND_CONSULTATION_MESSAGE'?new Promise(r=>resolve=r):Promise.resolve({messages:[]});
 const sending=h.page.sendDialogue();h.page.inputDialogue({detail:{value:'还在输入第二条'}});resolve({message:{id:12,content:'第一条',senderRole:'customer',isMine:true}});await sending;
 assert.equal(h.page.data.dialogueContent,'还在输入第二条');let afterId;h.service.call=async(op,p)=>{afterId=p.afterId;return {messages:[{id:11,content:'老师刚发的消息',senderRole:'teacher'},{id:12,content:'第一条',senderRole:'customer'}]};};await h.page.refreshDialogue();assert.equal(afterId,10);assert.deepEqual(Array.from(h.page.data.dialogueMessages,m=>m.id),[10,11,12]);
});
test('早期消息分页与新增消息水位分别保留',async()=>{
 const h=harness();h.service.call=async()=>({messages:[{id:30,content:'最新'}],nextCursor:'30'});await h.page.openDialogue();
 let before;h.service.call=async(op,p)=>{before=p.beforeId;return {messages:[{id:10,content:'更早'}],nextCursor:'10'};};await h.page.moreDialogue();assert.equal(before,'30');assert.equal(h.page.dialogueAfterId,30);assert.equal(h.page.data.dialogueCursor,'10');
});
test('切换账号时旧对话响应不能展示，原账号输入与消息清除',async()=>{
 const h=harness();await h.page.openDialogue();h.page.inputDialogue({detail:{value:'原账号草稿'}});let resolve;h.service.call=()=>new Promise(r=>resolve=r);const loading=h.page.refreshDialogue();h.changeIdentity('202');resolve({messages:[{id:1,content:'不可泄露的旧回复'}]});await loading;assert.equal(h.page.data.dialogueMessages.length,0);h.page.syncDialogue();assert.equal(h.page.data.dialogueOpen,false);assert.equal(h.page.data.dialogueContent,'');assert.equal(h.timers.size,0);
});
test('隐藏和重新打开期间的旧请求不会覆盖新消息或卡住发送按钮',async()=>{
 const h=harness();await h.page.openDialogue();let resolve;h.service.call=()=>new Promise(r=>resolve=r);const loading=h.page.refreshDialogue();h.page.hidden=true;h.page.suspendDialogue();resolve({messages:[{id:1,content:'离开页面后的旧响应'}]});await loading;assert.equal(h.page.data.dialogueMessages.length,0);assert.equal(h.page.data.dialogueLoading,false);assert.equal(h.timers.size,0);
});
test('未经服务端开放时没有发送和读取请求，空白消息不提交',async()=>{
 const h=harness();h.page.data.canTalk=false;await h.page.openDialogue();await h.page.sendDialogue();assert.equal(h.calls.length,0);h.page.data.canTalk=true;await h.page.openDialogue();h.page.inputDialogue({detail:{value:'  '}});await h.page.sendDialogue();assert.equal(h.calls.length,1);assert.match(h.page.data.dialogueError,/请填写/);
});
test('收起对话后切换账号不能重新展开旧账号的历史消息',async()=>{
 const h=harness();h.service.call=async()=>({messages:[{id:1,content:'原账号消息'}]});await h.page.openDialogue();h.page.closeDialogue();h.changeIdentity('202');await h.page.openDialogue();assert.equal(h.page.data.canTalk,false);assert.equal(h.page.data.dialogueOpen,false);assert.equal(h.page.data.dialogueMessages.length,0);
});
