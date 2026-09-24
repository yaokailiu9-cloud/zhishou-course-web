const auth=require('../../utils/auth');
const service=require('../../utils/consultationService');
const pad=value=>String(value).padStart(2,'0');
function schedule(value){
 const now=new Date(),d=value?new Date(value):new Date(Date.now()+10800000),max=new Date(now);max.setFullYear(max.getFullYear()+1);
 return {availableDate:`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,availableTime:`${pad(d.getHours())}:${pad(d.getMinutes())}`,minAvailableDate:`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`,maxAvailableDate:`${max.getFullYear()}-${pad(max.getMonth()+1)}-${pad(max.getDate())}`};
}
Page({
 data:{loading:true,busy:false,error:'',intake:null,title:'问卷内容',statusText:'管理查看',issuesText:'',submittedText:'',feedbackContent:'',confirmedText:'',availableText:'',...schedule()},
 onLoad(query={}){this.enrollmentId=query.id||'';require('../../utils/loginReturn').restore(this,'questionnaire-review',this.enrollmentId);},
 onShow(){this.refresh();},
 async refresh(){
  if(!auth.requireLogin('登录后查看问卷内容。')){this.setData({loading:false});return;}
  if(!this.enrollmentId){this.setData({loading:false,error:'问卷记录编号无效'});return;}
  this.setData({loading:true,error:''});
  try{const r=await service.call('GET_CHILD_INTAKE',{enrollmentId:this.enrollmentId});this.applyIntake(r.intake);}catch(e){service.error(this,e);}finally{this.setData({loading:false});}
 },
 applyIntake(intake,preserveSchedule){
  this.dirty=false;
  const timing=preserveSchedule?{}:schedule(intake.feedback_available_at);
  this.setData({intake,title:(intake.child_name||'未填写姓名')+'的问卷',statusText:intake.feedback_status==='CONFIRMED'?'已完成梳理':intake.feedback_status==='DRAFT'?'梳理中':'待梳理',issuesText:Array.isArray(intake.child_issues)?intake.child_issues.join('、'):'未填写',submittedText:service.formatTime(intake.child_submitted_at),feedbackContent:intake.feedback_content||'',confirmedText:service.formatTime(intake.feedback_confirmed_at),availableText:service.formatTime(intake.feedback_available_at),...timing});
 },
 inputFeedback(e){this.dirty=true;this.setData({feedbackContent:e.detail.value});},
 availableDateChange(e){this.setData({availableDate:e.detail.value});},
 availableTimeChange(e){this.setData({availableTime:e.detail.value});},
 releaseAt(){const value=new Date(this.data.availableDate+'T'+this.data.availableTime+':00+08:00');return isNaN(value.getTime())?'':value.toISOString();},
 saveDraft(){this.saveFeedback(false);},
 publishFeedback(){
  if(!String(this.data.feedbackContent||'').trim()){this.setData({error:'请先填写给家长的梳理回复。'});return;}
  const availableAt=this.releaseAt();
  if(!availableAt||new Date(availableAt).getTime()<Date.now()-300000){this.setData({error:'请选择当前时间之后的家长可查看时间。'});return;}
  wx.showModal({title:'发布梳理回复',content:`发布后不能再修改。家长可在 ${this.data.availableDate} ${this.data.availableTime} 查看完整回复。`,confirmText:'确认发布',success:r=>{if(r.confirm)this.saveFeedback(true);}});
 },
 async saveFeedback(confirm){
  if(this.data.busy||!this.data.intake||this.data.intake.feedback_status==='CONFIRMED')return;
  const content=String(this.data.feedbackContent||'').trim();
  if(!content){this.setData({error:'请先填写给家长的梳理回复。'});return;}
  this.setData({busy:true,error:''});
  try{
   const r=await service.call('SAVE_CHILD_FEEDBACK',{enrollmentId:this.enrollmentId,revision:this.data.intake.feedback_revision,content,confirm,...(confirm?{availableAt:this.releaseAt()}:{})});
   this.applyIntake(r.intake,!confirm);
   wx.showToast({title:confirm?'回复已发布':'草稿已保存',icon:'success'});
  }catch(e){service.error(this,e);}finally{this.setData({busy:false});}
 }
});
