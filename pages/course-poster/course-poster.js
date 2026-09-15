const service=require('../../utils/consultationService');
const {classCard,classShare}=require('../../utils/coursePresentation');
// Keep this registered route available for older navigation paths.
Page({
 data:{loading:true,error:'',classInfo:null},
 onLoad(q={}){this.classId=q.id||'';},
 onShow(){this.refresh();},
 async refresh(){this.setData({loading:true,error:'',classInfo:null});try{const r=await service.call('GET_CLASS',{classId:this.classId});this.setData({classInfo:classCard(r.classInfo)});}catch(e){service.error(this,e);}finally{this.setData({loading:false});}},
 onShareAppMessage(){return classShare(this.data.classInfo);},
 detail(){if(this.data.classInfo)wx.navigateTo({url:'/pages/public-class-detail/public-class-detail?id='+encodeURIComponent(String(this.data.classInfo.id))});}
});
