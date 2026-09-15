const service=require('../../utils/consultationService');const auth=require('../../utils/auth');
const {enrollmentCard}=require('../../utils/coursePresentation');const qr=require('../../utils/courseQr');
Page({data:{loggedIn:false,loading:true,busy:false,error:'',qrError:'',enrollment:null,success:false},
 onLoad(q={}){this.enrollmentId=q.id||'';this.setData({success:q.success==='1'});},
 onShow(){this.refresh();},
 async refresh(){if(!auth.requireLogin('登录后查看本人的报名和入场凭证。')){this.setData({loggedIn:false,loading:false,enrollment:null});return;}this.setData({loggedIn:true,loading:true,error:'',qrError:'',enrollment:null});try{const r=await service.call('GET_ENROLLMENT',{enrollmentId:this.enrollmentId});const e=enrollmentCard(r.enrollment);this.setData({enrollment:e},()=>{if(e.entryPayload&&e.attendance_status!=='ATTENDED')qr.draw(this,'entry-code',e.entryPayload).catch(()=>this.setData({qrError:'二维码暂未显示，可向工作人员出示报名信息人工核实。'}));});}catch(e){service.error(this,e);}finally{this.setData({loading:false});}},
 groupQr(){const q=this.data.enrollment.public_class.group_qr;if(q&&q.url)wx.previewImage({urls:[q.url]});},
 callTeacher(){const phone=this.data.enrollment.public_class.contact_phone;if(phone)wx.makePhoneCall({phoneNumber:phone});},
 consultation(){wx.navigateTo({url:'/pages/customer/customer'});},
 viewClass(){wx.navigateTo({url:'/pages/public-class-detail/public-class-detail?id='+this.data.enrollment.public_class_id});},
 cancel(){if(this.data.busy)return;wx.showModal({title:'取消本场报名',content:'取消后释放名额，当前入场码将失效。报名截止前有名额时可以重新报名。',success:async r=>{if(!r.confirm)return;this.setData({busy:true,error:''});try{await service.call('CANCEL_ENROLLMENT',{enrollmentId:this.enrollmentId});this.setData({success:false});await this.refresh();}catch(e){service.error(this,e);}finally{this.setData({busy:false});}}});}
});
