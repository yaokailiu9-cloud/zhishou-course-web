const service=require('../../utils/consultationService');
const auth=require('../../utils/auth');
const referral=require('../../utils/referral');
const viewSession=require('../../utils/viewSession');
const qr=require('../../utils/courseQr');
Page({
 data:{loading:false,error:'',qrError:'',allowed:false,isManager:false,shareUrl:'',scope:'own',items:[],nextCursor:null,total:0,courseTitle:''},
 onLoad(q={}){this.classId=q.id||'';},
 onShow(){this.refresh();},
 onHide(){this.requestId=(this.requestId||0)+1;},
 async refresh(){
  const requestId=this.requestId=(this.requestId||0)+1,identity=viewSession.capture();
  this.setData({allowed:false,isManager:false,shareUrl:'',items:[],nextCursor:null,total:0,error:'',qrError:'',loading:false});
  if(!auth.requireLogin('登录后查看你的推荐报名码和推荐客户。'))return;
  this.setData({loading:true});
  try{
   const r=await referral.context(this.classId);
   if(requestId!==this.requestId||!viewSession.current(identity))return;
   if(!r.canInvite)throw new Error('当前账号没有推荐权限，请联系管理人员设置代理身份。');
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
  const items=(r.items||[]).map(row=>({...row,timeText:service.formatTime(row.lockedAt),enrollments:(row.enrollments||[]).map(e=>({...e,statusText:e.productKind==='QUESTIONNAIRE'?(e.submittedAt?'问卷已提交':'已缴费 · 待填写'):e.status==='CANCELED'?'已取消':e.attendanceStatus==='ATTENDED'?'已到课':e.attendanceStatus==='ABSENT'?'未到课':'已报名 · 待到课'}))}));
  this.setData({items:more?this.data.items.concat(items):items,nextCursor:r.nextCursor,total:r.total});
 },
 async more(){if(this.data.loading||!this.data.nextCursor)return;this.setData({loading:true,error:''});const identity=viewSession.capture(),requestId=this.requestId;try{await this.load(true,requestId,identity);}catch(e){if(requestId===this.requestId&&viewSession.current(identity))service.error(this,e);}finally{if(requestId===this.requestId&&viewSession.current(identity))this.setData({loading:false});}},
 changeScope(e){if(this.data.loading)return;this.setData({scope:e.currentTarget.dataset.scope==='all'&&this.data.isManager?'all':'own'});this.refresh();},
 async shareCode(){try{const r=await referral.context(this.classId);if(!r.canInvite||!r.shareUrl)throw new Error('请重新核实代理身份后生成报名码');if(wx.showReferralPoster)wx.showReferralPoster({url:r.shareUrl,title:this.data.courseTitle||'知手课程报名',name:(wx.getStorageSync('userInfo')||{}).nickName||''});else wx.showToast({title:'请截图保存报名二维码发送给朋友',icon:'none'});}catch(e){service.error(this,e);}},
 courses(){wx.switchTab({url:'/pages/plaza/plaza'});}
});
