const service=require('../../utils/consultationService');
const {classCard,classShare}=require('../../utils/coursePresentation');
Page({
 data:{loading:true,error:'',classInfo:null,enrollment:null,canInvite:false},
 onLoad(q={}){this.classId=q.id||'';if(!this.classId&&q.scene){try{this.classId=decodeURIComponent(q.scene);}catch(_){this.classId='';}}},
 async onShow(){await Promise.all([this.refresh(),this.loadReferral()]);if(wx.prepareCourseShare)wx.prepareCourseShare(this);},
 async loadReferral(){const v=require('../../utils/viewSession'),identity=v.capture();this.setData({canInvite:false});try{const r=await require('../../utils/referral').context(this.classId);if(v.current(identity))this.setData({canInvite:!!r.canInvite});}catch(_){}},
 referralCode(){wx.navigateTo({url:'/pages/referrals/referrals?id='+this.classId});},
 async refresh(){this.setData({loading:true,error:'',classInfo:null});try{const r=await service.call('GET_CLASS',{classId:this.classId});this.setData({classInfo:classCard(r.classInfo),enrollment:r.enrollment});}catch(e){service.error(this,e);}finally{this.setData({loading:false});}},
 enroll(){if(this.data.enrollment && this.data.enrollment.status==='REGISTERED'){wx.navigateTo({url:'/pages/class-ticket/class-ticket?id='+this.data.enrollment.id});return;}wx.navigateTo({url:'/pages/class-enroll/class-enroll?id='+this.classId});},
 onShareAppMessage(){return classShare(this.data.classInfo);}
});
