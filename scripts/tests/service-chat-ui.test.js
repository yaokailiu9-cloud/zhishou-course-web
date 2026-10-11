const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function harness(){let id='201';const calls=[],service={requestKey:()=> 'same-key',formatTime:v=>v,call:async(op,payload)=>{calls.push({op,payload});return {};}};const identity={capture:()=>({id}),current:s=>s.id===id},module={exports:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../utils/serviceChat.js'),'utf8'),{module,require:name=>name==='./consultationService'?service:name==='./viewSession'?identity:name==='./childArchive'?{answeredSections:()=>[]}:name==='./auth'?{isLoggedIn:()=>true}:{},wx:{showToast(){},showModal(){},navigateTo(){}},setInterval:()=>1,clearInterval(){},Date,Number,Map});
const p={...module.exports.methods,data:structuredClone(module.exports.data),setData(v){Object.assign(this.data,v);},serviceEpoch:1,serviceCaseVersion:1,serviceSelectedId:31,serviceChatIdentity:identity.capture()};p.data.serviceMode=true;p.data.serviceTab='feedback';return {p,service,calls,changeId:x=>id=x};}
test('选中草稿时捕获版本，后台刷新不把旧输入变成可覆盖的新版本',async()=>{const {p,service,calls}=harness();p.data.serviceFeedback=[{id:1,reply:{id:2,revision:3,stage:'DRAFT',body:{content:'旧稿'}}}];p.selectServiceReply({currentTarget:{dataset:{id:1}}});p.data.serviceFeedback[0].reply.revision=4;p.data.serviceInput='本地编辑';service.call=async(op,payload)=>{calls.push({op,payload});throw Error('内容已更新');};await p.saveServiceDraft();assert.equal(calls[0].payload.revision,3);assert.equal(p.data.serviceInput,'本地编辑');assert.match(p.data.serviceError,/已更新/);});
test('家长发送失败保留输入和同一请求号，重试不会改变幂等键',async()=>{const h=harness();h.p.data.serviceInput='未发出的反馈';h.service.call=async(op,p)=>{h.calls.push({op,p});throw Error('网络失败');};await h.p.sendServiceFeedback();await h.p.sendServiceFeedback();assert.equal(h.p.data.serviceInput,'未发出的反馈');assert.equal(h.calls[0].p.requestKey,h.calls[1].p.requestKey);});
test('换号或离开后旧请求不能恢复客户内容或特权状态',async()=>{const h=harness();let resolve;h.service.call=()=>new Promise(r=>resolve=r);const loading=h.p.loadServiceChat();h.changeId('202');resolve({staff:true,canManage:true,cases:[{id:999,childName:'旧用户孩子'}]});await loading;assert.equal(h.p.data.serviceCases.length,0);assert.equal(h.p.data.serviceCanManage,false);});
test('发送和审核处理中不能切换档案，避免把结果写入另一个孩子',async()=>{const h=harness();h.p.data.serviceBusy=true;await h.p.selectServiceCase({currentTarget:{dataset:{id:32}}});assert.equal(h.p.serviceSelectedId,31);assert.equal(h.calls.length,0);});

test('重新进入家长反馈清除残留忙碌和工作人员筛选，自动打开本人的档案',async()=>{
 const h=harness();h.p.data.serviceBusy=true;h.p.data.serviceFilter='GENERAL';h.p.data.serviceLevelFilter=3;h.p.data.serviceSearch='其他孩子';
 h.service.call=async op=>op==='SERVICE_CHAT_OVERVIEW'?{staff:false,cases:[{id:31,childName:'本人孩子',pending:0}]}:{owner:true,staff:false,appointment:{id:31,child_info:{}},feedback:[]};
 await h.p.loadServiceChat();assert.equal(h.p.data.serviceBusy,false);assert.equal(h.p.data.serviceActive.id,31);assert.equal(h.p.data.serviceDetail.owner,true);assert.equal(h.p.data.serviceFilter,'ALL');assert.equal(h.p.data.serviceLevelFilter,0);assert.equal(h.p.data.serviceSearch,'');
});
test('家长头像仅多档案时打开列表，方案审核仅供工作人员进入',()=>{
 const h=harness();h.p.data.serviceAllCases=[{id:31}];h.p.toggleServiceDrawer();assert.equal(h.p.data.serviceDrawer,false);h.p.data.serviceAllCases.push({id:32});h.p.toggleServiceDrawer();assert.equal(h.p.data.serviceDrawer,true);
 h.p.data.serviceDetail={owner:true,staff:false};h.p.switchServiceTab({currentTarget:{dataset:{tab:'plan'}}});assert.equal(h.p.data.serviceTab,'feedback');h.p.data.serviceDetail={staff:true};h.p.switchServiceTab({currentTarget:{dataset:{tab:'plan'}}});assert.equal(h.p.data.serviceTab,'plan');
});
test('反馈按发布时间从早到晚，较晚公开的老师回复位于家长新反馈之后',async()=>{
 const h=harness();h.service.call=async()=>({owner:true,staff:false,appointment:{id:31,child_info:{}},feedback:[{id:22,content:'新的家长反馈',createdAt:'2026-10-11T10:00:00Z'},{id:11,content:'早期反馈',createdAt:'2026-10-11T09:00:00Z',reply:{id:44,body:{content:'最新公开的老师回复'},availableAt:'2026-10-11T11:00:00Z'}}],nextCursor:11});
 await h.p.refreshServiceCase();assert.deepEqual(Array.from(h.p.data.serviceFeedback,f=>f.id),[11,22]);assert.deepEqual(Array.from(h.p.data.serviceMessages,f=>f.content),['早期反馈','新的家长反馈','最新公开的老师回复']);
});
test('加载更早反馈插在顶部，轮询保留已加载历史和最早游标',async()=>{
 const h=harness();h.p.data.serviceFeedback=[{id:22,content:'最新'}];h.p.data.serviceFeedbackCursor=22;h.service.call=async()=>({owner:true,appointment:{child_info:{}},feedback:[{id:11,content:'更早'}],nextCursor:11});await h.p.moreServiceFeedback();assert.deepEqual(Array.from(h.p.data.serviceFeedback,f=>f.id),[11,22]);
 h.service.call=async()=>({owner:true,appointment:{child_info:{}},feedback:[{id:33,content:'新到达'},{id:22,content:'最新'}],nextCursor:22});await h.p.refreshServiceCase(true);assert.deepEqual(Array.from(h.p.data.serviceFeedback,f=>f.id),[11,22,33]);
});
