Page({
 data:{loading:true,error:'',referrerName:'',bound:false},
 onShow(){this.refresh();},
 async refresh(){
  this.setData({loading:true,error:''});
  try{if(wx.getInvitationError&&wx.getInvitationError())throw new Error(wx.getInvitationError());const r=await require('../../utils/referral').context();this.setData({referrerName:(r.binding||r.candidate||{}).name||'',bound:!!r.binding});}
  catch(e){this.setData({error:e.message||'推荐信息暂未加载，请重试'});}
  finally{this.setData({loading:false});}
 },
 login(){if(this.data.error){if(wx.retryInvitation)wx.retryInvitation();return;}wx.login({});}
});
