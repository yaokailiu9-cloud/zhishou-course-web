const service=require('../../utils/consultationService');const auth=require('../../utils/auth');
const {enrollmentCard}=require('../../utils/coursePresentation');
Page({data:{loading:false,error:'',loggedIn:false,items:[],nextCursor:null,filter:'ALL',filters:[{key:'ALL',label:'全部'},{key:'PENDING',label:'待参加'},{key:'ATTENDED',label:'已参加'},{key:'CANCELED',label:'已取消'}]},
 onShow(){this.refresh();},
 login(){auth.requireLogin('登录后查看你的公开课报名。');},
 selectFilter(e){if(this.data.loading)return;this.setData({filter:e.currentTarget.dataset.key});this.refresh();},
 refresh(){return this.load(false);},loadMore(){return this.load(true);},
 async load(more){if(this.data.loading)return;const loggedIn=auth.isLoggedIn();this.setData({loggedIn});if(!loggedIn){this.setData({items:[],nextCursor:null});return;}this.setData({loading:true,error:''});try{const r=await service.call('MY_ENROLLMENTS',{filter:this.data.filter,cursor:more?this.data.nextCursor:null});this.setData({items:(more?this.data.items:[]).concat((r.items||[]).map(enrollmentCard)),nextCursor:r.nextCursor});}catch(e){service.error(this,e);}finally{this.setData({loading:false});}},
 open(e){wx.navigateTo({url:'/pages/class-ticket/class-ticket?id='+e.currentTarget.dataset.id});},
 classes(){wx.navigateTo({url:'/pages/public-class/public-class'});}
});
