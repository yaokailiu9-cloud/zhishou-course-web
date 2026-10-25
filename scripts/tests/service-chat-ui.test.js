const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function harness(){let id='201';const calls=[],service={requestKey:()=> 'same-key',formatTime:v=>v,decorate:v=>({...v,statusText:v.status}),call:async(op,payload)=>{calls.push({op,payload});return {};}};const identity={capture:()=>({id}),current:s=>s.id===id},module={exports:{}};
const wx={storage:{},showToast(){},showModal(){},navigateTo(){},getStorageSync(k){return this.storage[k]||'';},setStorageSync(k,v){this.storage[k]=v;},removeStorageSync(k){delete this.storage[k];}};
// The consultation mixins are loaded for real so the chat page's combined methods are under test.
const load=(file,stubs)=>{const m={exports:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../utils/'+file),'utf8'),{module:m,require:name=>stubs(name),wx,setInterval:()=>1,clearInterval(){},Date,Number,Map,Promise,String,Object,JSON});return m.exports;};
const shared=name=>name==='./consultationService'?service:name==='./viewSession'?identity:name==='./childArchive'?{answeredSections:()=>[]}:name==='./auth'?{isLoggedIn:()=>true}:name==='./chatBadge'?{apply(){},refresh(){}}:{};
const dialogue=load('consultationDialogue.js',shared),consultation=load('serviceConsultation.js',name=>name==='./consultationDialogue'?dialogue:shared(name));
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../utils/serviceChat.js'),'utf8'),{module,require:name=>name==='./serviceConsultation'?consultation:shared(name),wx,setInterval:()=>1,clearInterval(){},Date,Number,Map,Promise});
const p={...module.exports.methods,data:structuredClone(module.exports.data),setData(v,callback){Object.assign(this.data,v);if(callback)callback();},serviceEpoch:1,serviceCaseVersion:1,serviceSelectedId:31,serviceChatIdentity:identity.capture()};p.data.serviceMode=true;p.data.serviceTab='feedback';return {p,service,calls,wx,changeId:x=>id=x};}
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

test('咨询记录与老师沟通由后台授权决定：无权读取时隐藏对应标签并回到家长反馈',async()=>{
 const h=harness();h.p.data.serviceTab='consult';h.service.call=async op=>{if(op==='GET_APPOINTMENT')throw Error('不能访问其他客户的咨询资料');return {};};
 await h.p.loadConsult();assert.equal(h.p.data.consult,null);assert.equal(h.p.data.canTalk,false);assert.equal(h.p.data.consultDenied,true);assert.equal(h.p.data.serviceTab,'feedback');
 h.p.switchServiceTab({currentTarget:{dataset:{tab:'consult'}}});assert.equal(h.p.data.serviceTab,'feedback');h.p.switchServiceTab({currentTarget:{dataset:{tab:'talk'}}});assert.equal(h.p.data.serviceTab,'feedback');
});
test('咨询记录只列执行反馈和留言，排除方案对话与家长反馈审核消息，并按老师建议标注',async()=>{
 const h=harness();h.service.call=async op=>op==='GET_APPOINTMENT'?{appointment:{id:31,status:'COMPLETED',child_info:{name:'孩子'}},record:{status:'CONFIRMED',advice:[{key:'step-1',content:'按时睡觉'}]},feedbacks:[{id:1,advice_key:'step-1',content:'执行'},{id:2,advice_key:'conversation',content:'留言'},{id:3,advice_key:'__service_feedback__',content:'审核反馈'},{id:4,advice_key:'__consultation_dialogue__',content:'对话'}],isStaff:false,canTalk:true}:{};
 await h.p.loadConsult();assert.deepEqual(Array.from(h.p.data.consultFeedback,f=>f.id),[2,1]);assert.equal(h.p.data.consultFeedback[1].adviceText,'按时睡觉');assert.equal(h.p.data.consultFeedback[0].kindText,'家长留言');
 assert.equal(h.p.data.consult.canSendFeedback,true);assert.equal(h.p.data.consult.canSendNote,true);assert.equal(h.p.data.consult.canReply,false);assert.equal(h.p.data.canTalk,true);
});
test('聊天中提交执行反馈失败保留内容，重试沿用同一请求号；档案只读不产生写入',async()=>{
 const h=harness();h.p.data.consult={canSendFeedback:true,advice:[{key:'step-1',content:'按时睡觉'}]};h.p.data.consultFeedbackInput='坚持了五天';
 h.service.call=async(op,payload)=>{h.calls.push({op,payload});throw Error('网络失败');};
 await h.p.sendConsultFeedback();await h.p.sendConsultFeedback();assert.equal(h.p.data.consultFeedbackInput,'坚持了五天');assert.equal(h.calls[0].op,'SEND_FEEDBACK');assert.equal(h.calls[0].payload.requestKey,h.calls[1].payload.requestKey);assert.equal(h.calls[0].payload.adviceKey,'step-1');
 h.calls.length=0;h.p.openServiceArchive();assert.equal(h.p.data.serviceTab,'archive');assert.equal(h.calls.length,0);
});
test('工作台或我的方案指定档案后，聊天直接打开该档案',async()=>{
 const h=harness();h.wx.storage.serviceChatCaseId='32';h.service.call=async(op,payload)=>op==='SERVICE_CHAT_OVERVIEW'?{staff:true,cases:[{id:31,childName:'甲'},{id:32,childName:'乙'}]}:op==='GET_SERVICE_CASE'?{staff:true,appointment:{id:payload.appointmentId,child_info:{}},feedback:[]}:{};
 await h.p.loadServiceChat();assert.equal(h.p.data.serviceActive.id,32);assert.equal(h.wx.storage.serviceChatCaseId,undefined);
});
test('服务管理可暂不分配监护专员：默认选中“暂不分配”，只分配总监时提交空的监护专员；已有监护专员时预选并提交',async()=>{
 const h=harness();const staff=[{id:7,display_name:'监护甲',service_kind:'GUARDIAN'},{id:8,display_name:'总监乙',service_kind:'STAFF',review_role:'DIRECTOR'},{id:9,display_name:'代理丙',service_kind:'AGENT'}];
 h.service.call=async(op,payload)=>{h.calls.push({op,payload});return op==='LIST_SERVICE_STAFF'?{items:staff}:{};};
 h.p.refreshServiceCase=async()=>{};h.p.scrollServiceContentToTop=()=>{};
 h.p.data.serviceDetail={appointment:{id:31,guardian_id:null,director_id:null,updated_at:'t1'}};
 await h.p.openServiceAssignment();
 assert.deepEqual(Array.from(h.p.data.serviceGuardians,g=>g.display_name),['暂不分配监护专员','监护甲','总监乙']);assert.equal(h.p.data.serviceGuardianIndex,0);
 h.p.data.serviceDirectorIndex=0;await h.p.saveServiceAssignment();
 const save=h.calls.find(c=>c.op==='ASSIGN_SERVICE_CASE');assert.equal(save.payload.guardianId,null);assert.equal(save.payload.directorId,8);
 h.calls.length=0;h.p.data.serviceDetail={appointment:{id:31,guardian_id:7,director_id:8,updated_at:'t2'}};await h.p.openServiceAssignment();assert.equal(h.p.data.serviceGuardianIndex,1);
 await h.p.saveServiceAssignment();assert.equal(h.calls.find(c=>c.op==='ASSIGN_SERVICE_CASE').payload.guardianId,7);
 h.calls.length=0;h.p.data.serviceDirectors=[];await h.p.saveServiceAssignment();assert.equal(h.calls.length,0);assert.match(h.p.data.serviceError,/授权总监/);
});
test('档案头像显示其他档案的新消息数，列表把有新消息的档案排前并标出发送家长，打开后清零',async()=>{
 const h=harness();h.p.serviceSelectedId=null;
 h.service.call=async op=>op==='SERVICE_CHAT_OVERVIEW'?{staff:true,unreadTotal:5,cases:[{id:31,childName:'甲',unread:2,latest:'甲家长消息',latestFrom:'甲妈妈（家长）'},{id:30,childName:'乙',unread:3,latest:'乙家长消息',latestFrom:'乙爸爸（家长）'},{id:32,childName:'丙',unread:0}]}:{owner:false,staff:true,unread:0,appointment:{id:31,child_info:{}},feedback:[]};
 await h.p.loadServiceChat();
 assert.equal(h.p.data.serviceActive.id,31);assert.equal(h.p.data.serviceOtherUnread,3);
 assert.deepEqual(h.p.data.serviceCases.map(c=>[c.id,c.unread]),[[30,3],[32,0],[31,0]]);assert.equal(h.p.data.serviceCases[0].latestFrom,'乙爸爸（家长）');
 await h.p.selectServiceCase({currentTarget:{dataset:{id:30}}});
 assert.equal(h.p.data.serviceOtherUnread,0);assert.ok(h.p.data.serviceCases.every(c=>c.unread===0));
});

test('打开聊天和孩子档案默认定位底部；读历史时轮询不拉回，失败不提前清未读',async()=>{
 const h=harness();h.p.data.serviceAllCases=[{id:31,childName:'甲',serverUnread:2,unread:2,pending:2}];h.p.serviceUnreadTotal=2;
 h.service.call=async(op,p)=>{h.calls.push({op,p});if(op==='GET_SERVICE_CASE')return {owner:false,staff:true,unread:p.markRead?0:2,appointment:{id:31,child_info:{}},feedback:[{id:1,content:'较早消息',createdAt:'2026-10-25T10:00:00Z'},{id:2,content:'最新消息',createdAt:'2026-10-25T11:00:00Z'}]};return {};};
 await h.p.refreshServiceCase();assert.equal(h.p.data.serviceFeedbackScrollTarget,'service-feedback-end');assert.equal(h.p.data.serviceOtherUnread,0);assert.equal(h.p.data.serviceAllCases[0].pending,2);
 h.p.openServiceArchive();assert.equal(h.p.data.serviceTab,'archive');assert.equal(h.p.data.serviceFeedbackScrollTarget,'service-feedback-end');
 h.p.data.serviceTab='feedback';h.p.onServiceFeedbackScroll({detail:{scrollTop:0,scrollHeight:1500,clientHeight:500}});await h.p.refreshServiceCase(true);assert.equal(h.calls.at(-1).p.markRead,false);assert.equal(h.p.data.serviceFeedbackScrollTarget,'');
 h.service.call=async()=>{throw Error('读取失败')};h.p.data.serviceAllCases[0].serverUnread=2;h.p.serviceUnreadTotal=2;h.p.applyServiceUnread();await h.p.selectServiceCase({currentTarget:{dataset:{id:32}}});assert.equal(h.p.data.serviceAllCases[0].unread,2);assert.equal(h.p.data.serviceOtherUnread,2);
});
