const service=require('../../utils/consultationService');
const auth=require('../../utils/auth');
const viewSession=require('../../utils/viewSession');
Page({
 data:{loading:true,busy:false,allowed:false,loggedIn:false,error:'',shareUrl:'',expiresText:'',offer:null},
 onShow(){this.refresh();},
 onUnload(){this.generation=(this.generation||0)+1;},
 async refresh(){
  const generation=this.generation=(this.generation||0)+1,identity=viewSession.capture();
  this.setData({loading:true,allowed:false,loggedIn:auth.isLoggedIn(),error:'',shareUrl:'',expiresText:'',offer:null});
  if(!auth.isLoggedIn()){this.setData({loading:false});return;}
  try{const r=await service.call('INTERNAL_PURCHASE_ACCESS');if(generation!==this.generation||!viewSession.current(identity))return;this.setData({allowed:r.allowed===true});}
  catch(e){if(generation===this.generation&&viewSession.current(identity))service.error(this,e);}
  finally{if(generation===this.generation)this.setData({loading:false});}
 },
 login(){auth.requireLogin('登录后生成咨询缴费链接。');},
 goProfile(){wx.switchTab({url:'/pages/profile/profile'});},
 async generate(){
  if(this.data.busy||!this.data.allowed)return;
  const generation=this.generation,identity=viewSession.capture();this.setData({busy:true,error:'',shareUrl:'',expiresText:''});
  try{const r=await service.call('CREATE_PURCHASE_LINK');if(generation!==this.generation||!viewSession.current(identity))return;
   const date=new Date(new Date(r.expiresAt).getTime()+8*3600000);this.setData({shareUrl:r.url,offer:r.offer,expiresText:date.toISOString().slice(0,16).replace('T',' ')+'（北京时间）'});
  }catch(e){if(generation===this.generation&&viewSession.current(identity))service.error(this,e);}
  finally{if(generation===this.generation)this.setData({busy:false});}
 },
 copy(){if(!this.data.shareUrl)return;wx.setClipboardData({data:this.data.shareUrl,success:()=>wx.showToast({title:'链接已复制',icon:'success'}),fail:()=>this.setData({error:'复制失败，请重试。'})});}
});
