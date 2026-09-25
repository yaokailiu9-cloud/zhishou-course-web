const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {readableError}=require('../../utils/serviceError');
const presentation=require('../../utils/coursePresentation');
function setup(call=async()=>({id:'123'}),readClass){
 let p;const modals=[];
 const checkedCall=(op,value)=>op==='GET_STAFF_CLASS'?Promise.resolve({classInfo:readClass||{id:'123',revision:2,status:'PUBLISHED',registration_closes_at:presentation.iso(p.data.form.closeDate,p.data.form.closeTime)}}):call(op,value);
 vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../../pages/course-edit/course-edit.js'),'utf8'),{
  Page:v=>p=v,require:n=>n.includes('coursePresentation')?presentation:n.includes('consultationService')?{call:checkedCall,error:(page,e)=>page.setData({error:readableError(e.message)}),formatTime:value=>value}:n.endsWith('/auth')?{requireLogin:()=>true}:{},
  wx:{showToast(){},pageScrollTo(){},enableAlertBeforeUnload(){},disableAlertBeforeUnload(){},showModal:v=>modals.push(v)},encodeURIComponent
 });
 p.data=structuredClone(p.data);p.setData=function(patch){for(const[k,v]of Object.entries(patch)){const keys=k.split('.');let obj=this.data;for(const key of keys.slice(0,-1))obj=obj[key];obj[keys.at(-1)]=v;}};
 p.data.loading=false;p.data.allowed=true;p.refresh=async()=>{};
 Object.assign(p.data.form,{title:'发布回归验证',date:'2099-01-01',time:'14:00',groupGuide:'请按工作人员指引进群'});
 return {p,modals};
}
test('原生表单提交使用最后输入值，保留图片和历史链接并忽略额外字段',async()=>{
 let payload;const {p}=setup(async(op,v)=>{payload=v;return{id:'123'};});
 Object.assign(p.data.form,{coverId:'8',groupQrId:'9',shareCodeId:'10',signupUrl:'https://example.invalid/legacy'});
 await p.publish({detail:{value:{title:'最后输入的课程名称',groupGuide:'最新进群指引',coverId:'伪造',status:'CLOSED'}}});
 assert.equal(payload.title,'最后输入的课程名称');assert.equal(payload.groupGuide,'最新进群指引');
 assert.equal(payload.coverId,'8');assert.equal(payload.groupQrId,'9');assert.equal(payload.shareCodeId,'10');assert.equal(payload.signupUrl,'https://example.invalid/legacy');
 assert.equal(payload.status,'PUBLISHED');assert.equal(p.savedVersion,1);assert.equal(p.classId,'123');
});
test('时间、人数与手机号校验失败时保留表单，显示具体原因且不发请求',async()=>{
 for(const [fields,message,saved] of [
  [{date:'2000-01-01'},/未来/],
  [{closeDate:'2099-01-01',closeTime:'15:00'},/报名截止时间/],
  [{checkinDate:'2099-01-01',checkinTime:'13:00'},/签到截止时间/],
 [{contactPhone:'123'},/11位/],
  [{registrationFee:'100.001'},/报名费用/],
  [{capacity:'2'},/已报名人数/,{reserved_count:3}],
  [{date:'invalid'},/开课时间无效/]
 ]){
  let calls=0;const {p}=setup(async()=>{calls++;});Object.assign(p.data.form,fields);p.data.savedClass=saved||null;
  await p.publish();assert.equal(calls,0);assert.match(p.data.publishError,message);assert.equal(p.data.form.title,'发布回归验证');assert.equal(p.data.busy,false);
 }
});
test('已发布的历史课程允许修改说明，不强制改成未来日期',async()=>{
 let calls=0;const {p}=setup(async()=>{calls++;return{id:'123'};});p.classId='123';p.data.status='PUBLISHED';p.data.form.date='2000-01-01';
 await p.publish();assert.equal(calls,1);assert.equal(p.data.publishError,'');
});
test('新课程默认带入100元，发布时把费用交给后端保存',async()=>{
 let payload;const {p}=setup(async(_op,value)=>{payload=value;return{id:'123'};});
 assert.equal(p.data.form.registrationFee,'100');await p.publish();assert.equal(payload.registrationFee,'100');
});
test('付费课程走独立支付流程，取消缴费不调用免费报名接口',async()=>{
 let page,calls=0,paymentFee;
 vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../../pages/class-enroll/class-enroll.js'),'utf8'),{
  Page:value=>page=value,
  require:name=>name.includes('coursePayment')?{enroll:async(_payload,fee)=>{paymentFee=fee;return null;}}:name.includes('consultationService')?{call:async()=>{calls++;},error(){}}:name.includes('/auth')?{requireLogin:()=>true}:name.includes('coursePresentation')?presentation:{takeEnrollmentForm:()=>null,restore:()=>false},
  wx:{redirectTo(){throw new Error('Canceled payment must not navigate');}},
 });
 page.data=structuredClone(page.data);page.setData=function(patch){for(const[k,v]of Object.entries(patch)){const keys=k.split('.');let obj=this.data;for(const key of keys.slice(0,-1))obj=obj[key];obj[keys.at(-1)]=v;}};
 page.data.classInfo=presentation.classCard({id:1,title:'付费课',registration_fee:100,canEnroll:true});page.data.form={name:'家长',phone:'13800000000'};
 await page.submit();assert.equal(calls,0);assert.equal(paymentFee,'￥100.00');assert.equal(page.data.busy,false);
});
test('提交过程中再次点击不覆盖输入，也不会重复写入',async()=>{
 let finish,calls=0;const {p}=setup(()=>{calls++;return new Promise(resolve=>finish=resolve);});
 const first=p.publish();await p.publish({detail:{value:{title:'重复点击'}}});assert.equal(calls,1);assert.equal(p.data.form.title,'发布回归验证');
 p.input({currentTarget:{dataset:{key:'title'}},detail:{value:'提交过程中继续编辑'}});finish({id:'123'});await first;
 assert.equal(p.data.form.title,'提交过程中继续编辑');assert.match(p.data.saveNotice,/新增修改仍待保存/);
});
test('发布失败弹出可读业务原因，保留草稿并恢复按钮',async()=>{
 const {p,modals}=setup(async()=>{throw Error('org.graalvm.polyglot.PolyglotException: Error: 当前账号没有这项工作人员权限');});
 await p.publish();assert.equal(p.data.publishError,'当前账号没有这项工作人员权限');assert.equal(modals[0].content,p.data.publishError);
 assert.equal(p.data.busy,false);assert.equal(p.data.form.title,'发布回归验证');assert.equal(p.classId,undefined);
});
test('报名截止时间未写入后端时不显示保存成功',async()=>{
 const {p}=setup(async()=>({id:'123'}),{id:'123',revision:2,status:'PUBLISHED',registration_closes_at:'2099-01-01T22:00:00+08:00'});
 Object.assign(p.data.form,{date:'2099-01-02',closeDate:'2099-01-01',closeTime:'23:30'});
 await p.publish();
 assert.match(p.data.publishError,/报名截止时间未在后端生效/);
 assert.equal(p.data.saveNotice,'');
 assert.equal(p.data.form.closeTime,'23:30');
});
test('仅解包已知业务错误，异常堆栈及未知技术细节不透出',()=>{
 for(const message of ['请先微信登录','请选择未来的开课时间再发布','课程名称填写不完整或过长','课程已被更新，请刷新后再修改']){
  assert.equal(readableError('PolyglotException: Error: '+message+'\n at internal.js:1'),message);
 }
 for(const message of ['SQL secret customer table','数据库密码: secret','请选择未来的开课时间再发布 secret'])
  assert.equal(readableError('PolyglotException: Error: '+message),'服务暂时无法连接，请稍后重试。');
});
