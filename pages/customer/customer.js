const service=require('../../utils/consultationService');
const auth=require('../../utils/auth');
const chatContext=require('../../utils/chatContext');
Page({
 data:{loading:false,busy:false,error:'',isLoggedIn:false,eligible:false,enrollments:[],appointments:[],nextAppointmentCursor:null,moreLoading:false,showForm:false,form:{name:'',phone:'',requestedTime:'',concerns:''}},
 onLoad(){if(require("../../utils/loginReturn").restore(this,"customer",""))this.bookingKey=service.requestKey();},
 onShow(){chatContext.enterCustomerView();this.refresh();},
 refresh(){const generation=this.listGeneration=(this.listGeneration||0)+1;this.setData({moreLoading:false});
  const user=auth.getLoggedInUser();this.setData({isLoggedIn:!!user,error:''});if(!user){this.setData({enrollments:[],appointments:[],eligible:false});return;}
  this.setData({loading:true});
  service.call('MY_OVERVIEW',{paginate:true}).then(data=>generation===this.listGeneration && this.setData({eligible:data.eligible,enrollments:(data.enrollments||[]).map(service.decorate),appointments:(data.appointments||[]).map(service.decorate),nextAppointmentCursor:data.nextAppointmentCursor||null})).catch(e=>{if(generation===this.listGeneration)service.error(this,e);}).finally(()=>{if(generation===this.listGeneration)this.setData({loading:false});});
 },
 async moreAppointments(){if(this.data.loading||this.data.moreLoading||!this.data.nextAppointmentCursor)return;const generation=this.listGeneration||0;this.setData({moreLoading:true});try{const r=await service.call('MY_OVERVIEW',{paginate:true,appointmentCursor:this.data.nextAppointmentCursor});if(generation!==(this.listGeneration||0))return;this.setData({appointments:this.data.appointments.concat((r.appointments||[]).map(service.decorate)),nextAppointmentCursor:r.nextAppointmentCursor||null});}catch(e){if(generation===(this.listGeneration||0))service.error(this,e);}finally{if(generation===(this.listGeneration||0))this.setData({moreLoading:false});}},
 login(){auth.requireLogin('登录后查看自己的报名、预约和咨询记录。');},
 goClasses(){wx.navigateTo({url:'/pages/public-class/public-class'});},
 goMine(){wx.navigateTo({url:'/pages/my-enrollments/my-enrollments'});},
 openClass(e){wx.navigateTo({url:'/pages/class-ticket/class-ticket?id='+e.currentTarget.dataset.id});},
 openAppointment(e){wx.navigateTo({url:'/pages/consultation-detail/consultation-detail?id='+e.currentTarget.dataset.id});},
 apply(){if(!auth.requireLogin())return;if(this.data.showForm)return;if(!this.data.eligible){this.goClasses();return;}const e=this.data.enrollments.find(i=>i.attendance_status==='ATTENDED')||{};this.bookingKey=service.requestKey();this.setData({showForm:true,error:'',form:{name:e.registrant_name||'',phone:e.phone||'',requestedTime:'',concerns:''}});},
 input(e){const key=e.currentTarget.dataset.key;if(['name','phone','requestedTime','concerns'].includes(key))this.setData({['form.'+key]:e.detail.value});},
 closeForm(){if(!this.data.busy)this.setData({showForm:false});},
 submit(){if(this.data.busy)return;const f=this.data.form;if(!f.name.trim()||!/^1[3-9]\d{9}$/.test(f.phone)||!f.requestedTime.trim()||!f.concerns.trim()){service.error(this,new Error('请填写姓名、有效手机号、期望时间和本次困扰'));return;}this.setData({busy:true,error:''});service.call('CREATE_APPOINTMENT',{...this.data.form,requestKey:this.bookingKey}).then(r=>{this.setData({showForm:false});wx.navigateTo({url:'/pages/consultation-detail/consultation-detail?id='+r.id});}).catch(e=>service.error(this,e)).finally(()=>this.setData({busy:false}));},
 goHome(){wx.switchTab({url:'/pages/index/index'});}
});
