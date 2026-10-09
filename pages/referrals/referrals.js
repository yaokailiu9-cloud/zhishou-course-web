const service=require('../../utils/consultationService');
const auth=require('../../utils/auth');
const referral=require('../../utils/referral');
const viewSession=require('../../utils/viewSession');
const qr=require('../../utils/courseQr');
Page({
 data:{loading:false,error:'',qrError:'',allowed:false,isManager:false,shareUrl:'',scope:'own',items:[],nextCursor:null,total:0,courseTitle:'',booking:null,bookingBusy:false,bookingNotice:'',bookingForm:{name:'',phone:'',date:'',time:'',concerns:''}},
 onLoad(q={}){this.classId=q.id||'';},
 onShow(){this.refresh();},
 onHide(){this.requestId=(this.requestId||0)+1;},
 async refresh(){
  const requestId=this.requestId=(this.requestId||0)+1,identity=viewSession.capture();
  this.setData({allowed:false,isManager:false,shareUrl:'',items:[],nextCursor:null,total:0,error:'',qrError:'',loading:false,booking:null,bookingBusy:false});
  if(!auth.isLoggedIn()){wx.redirectTo({url:'/pages/customer/customer'});return;}
  this.setData({loading:true});
  try{
   const r=await referral.context(this.classId);
   if(requestId!==this.requestId||!viewSession.current(identity))return;
   if(!r.canInvite){wx.redirectTo({url:'/pages/customer/customer'});return;}
   this.setData({allowed:true,isManager:!!r.isManager,shareUrl:r.shareUrl||'',scope:r.isManager?this.data.scope:'own'},()=>{
    if(r.shareUrl)qr.draw(this,'referral-code',r.shareUrl).catch(()=>this.setData({qrError:'二维码生成失败，可复制下方推荐链接。'}));
   });
   if(this.classId){const c=await service.call('GET_CLASS',{classId:this.classId});if(requestId!==this.requestId||!viewSession.current(identity))return;this.setData({courseTitle:c.classInfo.title});}
   await this.load(false,requestId,identity);
  }catch(e){if(requestId===this.requestId&&viewSession.current(identity))service.error(this,e);}
  finally{if(requestId===this.requestId&&viewSession.current(identity))this.setData({loading:false});}
 },
 async load(more,requestId=this.requestId,identity=viewSession.capture()){
  const r=await service.call('REFERRAL_CLIENTS',{scope:this.data.scope,cursor:more?this.data.nextCursor:null});
  if(requestId!==this.requestId||!viewSession.current(identity))return;
  const items=(r.items||[]).map(row=>({...row,timeText:service.formatTime(row.lockedAt),isProspectiveStudent:(row.enrollments||[]).some(e=>e.canBookConsultation===true),enrollments:(row.enrollments||[]).map(e=>({...e,statusText:e.productKind==='QUESTIONNAIRE'?(e.submittedAt?'问卷已提交':'已缴费 · 待填写'):e.status==='CANCELED'?'已取消':e.attendanceStatus==='ATTENDED'?'已到课':e.attendanceStatus==='ABSENT'?'未到课':'已报名 · 待到课'}))}));
  this.setData({items:more?this.data.items.concat(items):items,nextCursor:r.nextCursor,total:r.total});
 },
 async more(){if(this.data.loading||!this.data.nextCursor)return;this.setData({loading:true,error:''});const identity=viewSession.capture(),requestId=this.requestId;try{await this.load(true,requestId,identity);}catch(e){if(requestId===this.requestId&&viewSession.current(identity))service.error(this,e);}finally{if(requestId===this.requestId&&viewSession.current(identity))this.setData({loading:false});}},
 changeScope(e){if(this.data.loading)return;this.setData({scope:e.currentTarget.dataset.scope==='all'&&this.data.isManager?'all':'own'});this.refresh();},
 async copyInvitation(){const identity=viewSession.capture();try{const r=await referral.context(this.classId);if(!viewSession.current(identity))return;if(!r.canInvite||!r.shareUrl)throw new Error('请重新核实代理身份后获取邀请链接');wx.setClipboardData({data:r.shareUrl});}catch(e){if(viewSession.current(identity))service.error(this,e);}},
 async shareCode(){try{const r=await referral.context(this.classId);if(!r.canInvite||!r.shareUrl)throw new Error('请重新核实代理身份后生成报名码');if(wx.showReferralPoster)wx.showReferralPoster({url:r.shareUrl,title:this.data.courseTitle||'知守课程报名',name:(wx.getStorageSync('userInfo')||{}).nickName||''});else wx.showToast({title:'请截图保存报名二维码发送给朋友',icon:'none'});}catch(e){service.error(this,e);}},
 async book(e){if(this.data.bookingBusy)return;const referralId=e.currentTarget.dataset.referral,enrollmentId=e.currentTarget.dataset.enrollment,identity=viewSession.capture();this.setData({bookingBusy:true,error:'',bookingNotice:''});try{const r=await service.call('GET_AGENT_APPOINTMENT',{referralId,enrollmentId});if(!viewSession.current(identity))return;this.setData({booking:{referralId,enrollmentId,appointment:r.appointment?service.decorate(r.appointment):null},bookingForm:{name:r.name||'',phone:r.phone||'',date:'',time:'',concerns:''}});if(wx.pageScrollTo)wx.pageScrollTo({scrollTop:0,duration:200});}catch(e){if(viewSession.current(identity))service.error(this,e);}finally{if(viewSession.current(identity))this.setData({bookingBusy:false});}},
 bookingInput(e){const key=e.currentTarget.dataset.key;if(['name','phone','date','time','concerns'].includes(key))this.setData({['bookingForm.'+key]:e.detail.value});},
 closeBooking(){if(!this.data.bookingBusy)this.setData({booking:null});},
 async submitBooking(){if(this.data.bookingBusy||!this.data.booking)return;const f=this.data.bookingForm;if(!f.date||!f.time||!f.name.trim()||!/^1[3-9]\d{9}$/.test(f.phone)||!f.concerns.trim()){service.error(this,new Error('请填写姓名、手机号、日期、时间和咨询困扰'));return;}const identity=viewSession.capture();this.setData({bookingBusy:true,error:''});try{const r=await service.call('CREATE_AGENT_APPOINTMENT',{referralId:this.data.booking.referralId,enrollmentId:this.data.booking.enrollmentId,...f,requestedTime:f.date+'T'+f.time+':00+08:00'});if(!viewSession.current(identity))return;this.setData({booking:{...this.data.booking,appointment:service.decorate(r.appointment)},bookingNotice:'已提交咨询预约，等待负责人老师确认时间。'});}catch(e){if(viewSession.current(identity))service.error(this,e);}finally{if(viewSession.current(identity))this.setData({bookingBusy:false});}},
 courses(){wx.switchTab({url:'/pages/plaza/plaza'});}
});
