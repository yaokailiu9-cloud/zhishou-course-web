const auth=require('../../utils/auth');
const referral=require('../../utils/referral');
const service=require('../../utils/consultationService');
const qr=require('../../utils/courseQr');
Page({
 data:{loading:true,error:'',allowed:false,shareUrl:'',qrError:''},
 onShow(){this.refresh();},
 async refresh(){
  this.setData({loading:true,error:'',allowed:false,shareUrl:'',qrError:''});
  if(!auth.requireLogin('登录后生成简易方案梳理二维码。')){this.setData({loading:false});return;}
  try{const r=await referral.context('', 'questionnaire');if(!r.canInvite||!r.shareUrl)throw new Error('当前账号没有发放问卷的权限');this.setData({allowed:true,shareUrl:r.shareUrl},()=>qr.draw(this,'questionnaire-code',r.shareUrl).catch(()=>this.setData({qrError:'二维码生成失败，请刷新重试。'})));}
  catch(e){service.error(this,e);}finally{this.setData({loading:false});}
 },
 openPoster(){
  if(!this.data.shareUrl)return;
  try{wx.showReferralPoster({url:this.data.shareUrl,title:'简易方案梳理',name:(wx.getStorageSync('userInfo')||{}).nickName||'',kind:'questionnaire'});}catch(_){this.setData({qrError:'二维码大图生成失败，请刷新重试。'});}
 }
});
