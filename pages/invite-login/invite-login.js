Page({
 data:{loading:true,error:''},
 onShow(){this.refresh();},
 async refresh(){
  this.setData({loading:true,error:''});
  try{if(wx.getInvitationError&&wx.getInvitationError())throw new Error(wx.getInvitationError());}
  catch(e){this.setData({error:e.message||'报名入口暂时无法打开，请重试。'});}
  finally{this.setData({loading:false});}
 },
 async login(){
  if(this.data.loading)return;
  this.setData({loading:true,error:''});
  try{if(wx.retryInvitation)await wx.retryInvitation();else wx.login({});}
  catch(e){this.setData({error:e.message||'报名入口暂时无法打开，请重试。'});}
  finally{this.setData({loading:false});}
 }
});
