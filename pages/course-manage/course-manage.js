const service=require('../../utils/consultationService');const auth=require('../../utils/auth');const {classCard,classShare}=require('../../utils/coursePresentation');
Page({data:{loading:true,error:'',allowed:false,classes:[],search:'',nextCursor:null},
 onShow(){this.refresh();}, inputSearch(e){this.setData({search:e.detail.value});},
 refresh(){return this.load(false);},more(){return this.load(true);},
 async load(more){if(more && this.appliedSearch!==this.data.search)more=false;if(this.fetching){if(!more)this.pendingSearch=true;return;}if(!auth.requireLogin('请登录课程工作人员账号。')){this.setData({loading:false,allowed:false});return;}this.fetching=true;this.setData({loading:true,error:''});try{const search=this.data.search;const r=await service.call('STAFF_CLASSES',{search:search,cursor:more?this.data.nextCursor:null});this.appliedSearch=search;this.setData({allowed:true,classes:(more?this.data.classes:[]).concat((r.classes||[]).map(classCard)),nextCursor:r.nextCursor});}catch(e){if(!more)this.setData({allowed:false,classes:[]});service.error(this,e);}finally{this.fetching=false;this.setData({loading:false});if(this.pendingSearch){this.pendingSearch=false;this.refresh();}}},
 create(){wx.navigateTo({url:'/pages/course-edit/course-edit'});},
 edit(e){wx.navigateTo({url:'/pages/course-edit/course-edit?id='+e.currentTarget.dataset.id});},
 roster(e){wx.navigateTo({url:'/pages/course-roster/course-roster?id='+e.currentTarget.dataset.id});},
 onShareAppMessage(e={}){const id=e.target && e.target.dataset && e.target.dataset.id;return classShare(this.data.classes.find(c=>String(c.id)===String(id)));}
});
