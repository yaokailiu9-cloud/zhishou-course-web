const auth=require('../../utils/auth');
const questionnaire=require('../../utils/questionnaire');
const service=require('../../utils/consultationService');
const empty=()=>({name:'',gender:'',age:'',grade:'',economicSource:'',issues:[],description:'',dailyBehavior:'',guardianName:'',guardianPhone:'',consent:false});
Page({
 data:{loading:true,busy:false,error:'',offer:null,paid:false,submitted:false,loggedIn:false,issues:[],form:empty()},
 onLoad(){require('../../utils/loginReturn').restore(this,'questionnaire','');},
 onShow(){this.refresh();},
 async refresh(){
  this.setData({loading:true,error:''});
  try{
   if(wx.getInvitationError&&wx.getInvitationError())throw new Error(wx.getInvitationError());
   const r=await questionnaire.context(),e=r.enrollment||null,form=e?{name:e.child_name||'',gender:e.child_gender||'',age:e.child_age==null?'':String(e.child_age),grade:e.child_grade||'',economicSource:e.child_economic_source||'',issues:Array.isArray(e.child_issues)?e.child_issues:[],description:e.child_description||'',dailyBehavior:e.child_daily_behavior||'',guardianName:e.guardian_name||e.registrant_name||'',guardianPhone:e.guardian_phone||e.phone||'',consent:!!e.guardian_consent_at}:this.data.form;
   this.enrollmentId=e&&e.id;this.setData({offer:r.offer,issues:r.issues||[],paid:!!e,submitted:!!(e&&e.child_submitted_at),loggedIn:auth.isLoggedIn(),form});
  }catch(e){service.error(this,e);}finally{this.setData({loading:false});}
 },
 input(e){const key=e.currentTarget.dataset.key;if(Object.prototype.hasOwnProperty.call(this.data.form,key))this.setData({['form.'+key]:e.detail.value});},
 chooseGender(e){if(!this.data.submitted)this.setData({'form.gender':e.currentTarget.dataset.value});},
 toggleIssue(e){
  if(this.data.submitted)return;const value=e.currentTarget.dataset.value,current=this.data.form.issues.slice(),index=current.indexOf(value);
  if(index>=0)current.splice(index,1);else if(current.length>=2){wx.showToast({title:'只能选择最重要的两个问题',icon:'none'});return;}else current.push(value);
  this.setData({'form.issues':current});
 },
 toggleConsent(){if(!this.data.submitted)this.setData({'form.consent':!this.data.form.consent});},
 login(){if(wx.getInvitationError&&wx.getInvitationError()){wx.retryInvitation&&wx.retryInvitation();return;}wx.login({});},
 async pay(){
  if(this.data.busy||!this.data.offer)return;
  if(!auth.isLoggedIn()){this.login();return;}
  const name=String(this.data.form.guardianName||'').trim(),phone=String(this.data.form.guardianPhone||'').trim();
  if(!name||!/^1[3-9]\d{9}$/.test(phone)){this.setData({error:'请先填写家长姓名和有效的11位联系电话。'});return;}
  this.setData({busy:true,error:''});try{const r=await questionnaire.pay({name,phone});if(r&&r.enrollment){this.enrollmentId=r.enrollment.id;this.setData({paid:true,form:{...this.data.form,guardianName:name,guardianPhone:phone}});await this.refresh();}}catch(e){service.error(this,e);}finally{this.setData({busy:false});}
 },
 async submit(){
  if(this.data.busy||!this.enrollmentId||this.data.submitted)return;const f=this.data.form;
  if(!f.name.trim()||!f.gender||f.age===''||!f.grade.trim()||!f.economicSource.trim()||f.issues.length!==2||!f.dailyBehavior.trim()||!f.guardianName.trim()||!/^1[3-9]\d{9}$/.test(f.guardianPhone.trim())||!f.consent){this.setData({error:'请完整填写必填项、选择两个最重要的问题，并确认监护人同意。'});return;}
  this.setData({busy:true,error:''});try{await questionnaire.submit({enrollmentId:this.enrollmentId,name:f.name,gender:f.gender,age:f.age,grade:f.grade,economicSource:f.economicSource,issues:f.issues,description:f.description,dailyBehavior:f.dailyBehavior,guardianName:f.guardianName,guardianPhone:f.guardianPhone,consent:true});this.setData({submitted:true});wx.showToast({title:'问卷已提交',icon:'success'});}catch(e){service.error(this,e);}finally{this.setData({busy:false});}
 }
});
