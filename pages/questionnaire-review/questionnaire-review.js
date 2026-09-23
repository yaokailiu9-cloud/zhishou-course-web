const auth=require('../../utils/auth');
const service=require('../../utils/consultationService');
Page({
 data:{loading:true,error:'',intake:null,title:'问卷内容',statusText:'管理查看',issuesText:'',submittedText:''},
 onLoad(query={}){this.enrollmentId=query.id||'';require('../../utils/loginReturn').restore(this,'questionnaire-review',this.enrollmentId);},
 onShow(){this.refresh();},
 async refresh(){
  if(!auth.requireLogin('登录后查看问卷内容。')){this.setData({loading:false});return;}
  if(!this.enrollmentId){this.setData({loading:false,error:'问卷记录编号无效'});return;}
  this.setData({loading:true,error:''});
  try{const r=await service.call('GET_CHILD_INTAKE',{enrollmentId:this.enrollmentId}),intake=r.intake;this.setData({intake,title:(intake.child_name||'未填写姓名')+'的问卷',statusText:intake.feedback_status==='CONFIRMED'?'已完成梳理':intake.feedback_status==='DRAFT'?'梳理中':'待梳理',issuesText:Array.isArray(intake.child_issues)?intake.child_issues.join('、'):'未填写',submittedText:service.formatTime(intake.child_submitted_at)});}catch(e){service.error(this,e);}finally{this.setData({loading:false});}
 }
});
