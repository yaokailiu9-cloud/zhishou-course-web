const service=require('../../utils/consultationService');
const {classCard}=require('../../utils/coursePresentation');
Page({
 data:{loading:false,error:'',classes:[],search:'',nextCursor:null},
 onLoad(query={}){if(query.id){this.redirected=true;wx.redirectTo({url:'/pages/public-class-detail/public-class-detail?id='+encodeURIComponent(query.id)});}},
 onShow(){if(!this.redirected)this.refresh();},
 searchInput(e){this.setData({search:e.detail.value});},
 refresh(){return this.load(false);},
 loadMore(){return this.load(true);},
 async load(more){if(more && this.appliedSearch!==this.data.search)more=false;
  if(this.data.loading){if(!more)this.pendingSearch=true;return;}this.setData({loading:true,error:''});
  try{const search=this.data.search;const r=await service.call('LIST_CLASSES',{search:search,cursor:more?this.data.nextCursor:null});this.appliedSearch=search;this.setData({classes:(more?this.data.classes:[]).concat((r.classes||[]).map(classCard)),nextCursor:r.nextCursor});}
  catch(e){service.error(this,e);}finally{this.setData({loading:false});if(this.pendingSearch){this.pendingSearch=false;this.refresh();}}
 },
 choose(e){wx.navigateTo({url:'/pages/public-class-detail/public-class-detail?id='+e.currentTarget.dataset.id});},
 goMine(){wx.navigateTo({url:'/pages/my-enrollments/my-enrollments'});},
 goCustomer(){wx.navigateTo({url:'/pages/customer/customer'});},
 onShareAppMessage(){return {title:'免费公开课 · 一起学习如何更好地沟通',path:'/pages/public-class/public-class'};}
});
