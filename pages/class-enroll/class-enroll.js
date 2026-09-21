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
  if(this.data.classInfo.isPaid){
   wx.showModal({title:'确认缴费报名',content:`本场课程报名费为 ${this.data.classInfo.feeText}。只有完成支付后才会报名成功并生成入场凭证。`,confirmText:'去缴费',success:r=>{if(r.confirm)wx.showModal({title:'支付通道待开通',content:'课程金额已由后台读取，但当前项目尚未开通微信支付。在支付回调接好前不会生成成功报名。',showCancel:false});}});
   return;
  }
  this.setData({busy:true,error:''});try{const r=await service.call('ENROLL',{classId:this.classId,name,phone});wx.redirectTo({url:'/pages/class-ticket/class-ticket?id='+r.enrollment.id+'&success=1'});}catch(e){service.error(this,e);}finally{this.setData({busy:false});}
 }
});
