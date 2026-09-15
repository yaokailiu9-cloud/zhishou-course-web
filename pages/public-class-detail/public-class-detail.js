const service=require('../../utils/consultationService');
const {classCard,classShare}=require('../../utils/coursePresentation');
Page({
 data:{loading:true,error:'',classInfo:null,enrollment:null},
 onLoad(q={}){this.classId=q.id||'';if(!this.classId&&q.scene){try{this.classId=decodeURIComponent(q.scene);}catch(_){this.classId='';}}},
 onShow(){this.refresh();},
 async refresh(){this.setData({loading:true,error:'',classInfo:null});try{const r=await service.call('GET_CLASS',{classId:this.classId});this.setData({classInfo:classCard(r.classInfo),enrollment:r.enrollment});}catch(e){service.error(this,e);}finally{this.setData({loading:false});}},
 enroll(){if(this.data.enrollment && this.data.enrollment.status==='REGISTERED'){wx.navigateTo({url:'/pages/class-ticket/class-ticket?id='+this.data.enrollment.id});return;}wx.navigateTo({url:'/pages/class-enroll/class-enroll?id='+this.classId});},
 onShareAppMessage(){return classShare(this.data.classInfo);}
});
