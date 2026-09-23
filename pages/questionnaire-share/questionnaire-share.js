const auth=require('../../utils/auth');
const referral=require('../../utils/referral');
const service=require('../../utils/consultationService');
const qr=require('../../utils/courseQr');
const QUESTIONNAIRE_CLASS_ID='11';
Page({
 data:{loading:true,recordsLoading:false,error:'',allowed:false,isManager:false,shareUrl:'',qrError:'',records:[],nextCursor:null},
 onShow(){this.refresh();},
 async refresh(){
  this.setData({loading:true,recordsLoading:false,error:'',allowed:false,isManager:false,shareUrl:'',qrError:'',records:[],nextCursor:null});
  if(!auth.requireLogin('登录后生成简易方案梳理二维码。')){this.setData({loading:false});return;}
  try{
   const r=await referral.context('', 'questionnaire');
   if(!r.canInvite||!r.shareUrl)throw new Error('当前账号没有发放问卷的权限');
   this.setData({allowed:true,isManager:!!r.isManager,shareUrl:r.shareUrl},()=>qr.draw(this,'questionnaire-code',r.shareUrl).catch(()=>this.setData({qrError:'二维码生成失败，请刷新重试。'})));
   if(r.isManager)await this.loadRecords(false);
  }catch(e){service.error(this,e);}finally{this.setData({loading:false});}
 },
 async loadRecords(more){
  this.setData({recordsLoading:true});
  try{
   const r=await service.call('STAFF_CHILD_INTAKES',{cursor:more?this.data.nextCursor:null});
   const records=(r.items||[]).filter(item=>item.public_class&&String(item.public_class.id)===QUESTIONNAIRE_CLASS_ID&&item.child_submitted_at).map(item=>({...item,submittedText:service.formatTime(item.child_submitted_at),statusText:item.feedback_status==='CONFIRMED'?'已完成梳理':item.feedback_status==='DRAFT'?'梳理中':'待梳理'}));
   this.setData({records:more?this.data.records.concat(records):records,nextCursor:r.nextCursor||null});
  }catch(e){service.error(this,e);}finally{this.setData({recordsLoading:false});}
 },
 loadMore(){if(!this.data.recordsLoading&&this.data.nextCursor)this.loadRecords(true);},
 openRecord(e){const id=e.currentTarget.dataset.id;if(id)wx.navigateTo({url:'/pages/questionnaire-review/questionnaire-review?id='+id});},
 openPoster(){
  if(!this.data.shareUrl)return;
  try{wx.showReferralPoster({url:this.data.shareUrl,title:'简易方案梳理',name:(wx.getStorageSync('userInfo')||{}).nickName||'',kind:'questionnaire'});}catch(_){this.setData({qrError:'二维码大图生成失败，请刷新重试。'});}
 }
});
