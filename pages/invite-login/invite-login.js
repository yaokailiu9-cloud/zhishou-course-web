Page({
 data:{loading:true,error:''},
 onShow(){this.refresh();},
 async refresh(){
  this.setData({loading:true,error:''});
  try{if(wx.getInvitationError&&wx.getInvitationError())throw new Error('报名二维码暂时无法打开，请让分享人重新发送。');await require('../../utils/referral').context();}
  catch(e){this.setData({error:'报名入口暂时无法打开，请让分享人重新发送二维码。'});}
  finally{this.setData({loading:false});}
 },
 login(){if(this.data.error){if(wx.retryInvitation)wx.retryInvitation();return;}wx.login({});}
});
