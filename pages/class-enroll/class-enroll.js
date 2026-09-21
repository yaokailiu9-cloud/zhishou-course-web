const service=require('../../utils/consultationService');
const auth=require('../../utils/auth');
const {classCard}=require('../../utils/coursePresentation');
Page({data:{loading:true,busy:false,error:'',classInfo:null,form:{name:'',phone:''}},
 onLoad(q={}){this.classId=q.id||'';const form=require('../../utils/loginReturn').takeEnrollmentForm(this.classId);if(form)this.setData({form});require("../../utils/loginReturn").restore(this,"class-enroll",this.classId);},
 onShow(){this.refresh();},
 async refresh(){this.setData({loading:true,error:''});try{const r=await service.call('GET_CLASS',{classId:this.classId});if(r.enrollment&&r.enrollment.status==='REGISTERED'){wx.redirectTo({url:'/pages/class-ticket/class-ticket?id='+r.enrollment.id});return;}this.setData({classInfo:classCard(r.classInfo)});}catch(e){service.error(this,e);}finally{this.setData({loading:false});}},
 input(e){const k=e.currentTarget.dataset.key;if(['name','phone'].includes(k))this.setData({['form.'+k]:e.detail.value});},
 async submit(){
  if(this.data.busy||!this.data.classInfo)return;
  if(!auth.requireLogin('登录后保存你的课程报名和入场凭证。',{enrollmentForm:this.data.form}))return;
  const name=this.data.form.name.trim(),phone=this.data.form.phone.trim();
  if(!name||!/^1[3-9]\d{9}$/.test(phone)){this.setData({error:'请填写姓名和有效的11位手机号。'});return;}
  this.setData({busy:true,error:''});try{
   const payload={classId:this.classId,name,phone};
   const r=this.data.classInfo.isPaid?await require('../../utils/coursePayment').enroll(payload,this.data.classInfo.feeText):await service.call('ENROLL',payload);
   if(r&&r.enrollment)wx.redirectTo({url:'/pages/class-ticket/class-ticket?id='+r.enrollment.id+'&success=1'});
  }catch(e){service.error(this,e);}finally{this.setData({busy:false});}
 }
});
