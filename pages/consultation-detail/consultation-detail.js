const service=require('../../utils/consultationService');const auth=require('../../utils/auth');
Page({
 data:{loading:true,busy:false,error:'',appointment:null,record:null,feedbacks:[],summaryJobs:[],nextFeedbackCursor:null,nextSummaryCursor:null,moreLoading:false,isStaff:false,canAccept:false,canReply:false,childForm:{name:'',age:'',grade:'',guardian:'',relationship:'',phone:'',concerns:'',goals:''},recordForm:{summary:'',advice:''},noteContent:'',feedbackContent:'',adviceIndex:0,replyContents:{},confirmDate:'',confirmTime:'',staffNote:'',recording:false,recordingSeconds:0,summaryBusy:false},
 onLoad(query={}){this.unloaded=false;this.appointmentId=query.id;this.feedbackKey=service.requestKey();this.replyKeys={};if(require("../../utils/loginReturn").restore(this,"consultation-detail",this.appointmentId)){this.dirtyChild=true;this.dirtyRecord=true;}},
 onShow(){this.refresh();},
 onHide(){this.stopRecording();},onUnload(){this.unloaded=true;this.stopRecording();if(!this.recordingActive)this.detachRecorder();clearInterval(this.recordingTimer);},
 refresh(){const generation=this.listGeneration=(this.listGeneration||0)+1;this.setData({moreLoading:false});if(!auth.requireLogin('登录后查看本人的咨询资料。')){this.setData({loading:false});return;}this.setData({loading:true,error:''});return service.call('GET_APPOINTMENT',{paginate:true,appointmentId:this.appointmentId}).then(r=>{if(generation!==this.listGeneration||this.unloaded)return;const a=r.appointment;this.setData({appointment:service.decorate(a),record:r.record,feedbacks:(r.feedbacks||[]).map(item=>({...service.decorate(item),replies:(item.replies||[]).slice().sort((a,b)=>Number(a.id)-Number(b.id))})),summaryJobs:(r.summaryJobs||[]).map(service.decorate),nextFeedbackCursor:r.nextFeedbackCursor||null,nextSummaryCursor:r.nextSummaryCursor||null,isStaff:r.isStaff,canAccept:r.canAccept,canReply:r.canReply,childForm:this.dirtyChild?this.data.childForm:a.child_info||{name:'',age:'',grade:'',guardian:a.contact_name||'',relationship:'',phone:a.phone||'',concerns:a.concerns||'',goals:''},recordForm:this.dirtyRecord?this.data.recordForm:{summary:r.record&&r.record.summary||'',advice:r.record&&Array.isArray(r.record.advice)?r.record.advice.map(i=>i.content).join('\n'):''}});}).catch(e=>{if(generation===this.listGeneration&&!this.unloaded)service.error(this,e);}).finally(()=>{if(generation===this.listGeneration&&!this.unloaded)this.setData({loading:false});});},
 inputChild(e){const key=e.currentTarget.dataset.key;if(['name','age','grade','guardian','relationship','phone','concerns','goals'].includes(key)){this.dirtyChild=true;this.childEditVersion=(this.childEditVersion||0)+1;this.setData({['childForm.'+key]:e.detail.value});}},
 inputRecord(e){const key=e.currentTarget.dataset.key;if(['summary','advice'].includes(key)){this.dirtyRecord=true;this.recordEditVersion=(this.recordEditVersion||0)+1;this.setData({['recordForm.'+key]:e.detail.value});}},
 inputNote(e){this.setData({noteContent:e.detail.value});},
 async sendNote(){const content=this.data.noteContent;if(!content.trim()){this.formError('请填写留言内容');return;}if(await this.run('SEND_NOTE',{content,requestKey:this.noteKey||(this.noteKey=service.requestKey())})){this.noteKey=null;if(this.data.noteContent===content)this.setData({noteContent:''});}},
 async retrySummary(e){await this.run('RETRY_SUMMARY',{jobId:e.currentTarget.dataset.id});},
 async processRecording(e){await this.run('PROCESS_RECORDING',{jobId:e.currentTarget.dataset.id});},
 inputFeedback(e){this.setData({feedbackContent:e.detail.value});},chooseAdvice(e){this.setData({adviceIndex:Number(e.detail.value)});},
 inputReply(e){this.setData({['replyContents.'+e.currentTarget.dataset.id]:e.detail.value});},
 dateChange(e){this.setData({confirmDate:e.detail.value});},timeChange(e){this.setData({confirmTime:e.detail.value});},noteChange(e){this.setData({staffNote:e.detail.value});},
 async run(operation,payload={}){if(this.data.busy)return false;const childVersion=this.childEditVersion||0,recordVersion=this.recordEditVersion||0;this.setData({busy:true,error:''});try{await service.call(operation,{appointmentId:this.appointmentId,...payload});if(operation==='SAVE_CHILD_INFO'&&(this.childEditVersion||0)===childVersion)this.dirtyChild=false;if(operation==='SAVE_RECORD'&&(this.recordEditVersion||0)===recordVersion)this.dirtyRecord=false;wx.showToast({title:'已保存',icon:'success'});await this.refresh();return true;}catch(e){service.error(this,e);return false;}finally{this.setData({busy:false});}},
 formError(message){this.setData({error:message});if(wx.pageScrollTo)wx.pageScrollTo({scrollTop:0,duration:200});},
 saveChild(){const c=this.data.childForm;for(const [key,label] of [['name','孩子姓名或称呼'],['guardian','家长姓名'],['relationship','与孩子关系'],['concerns','当前主要困扰']])if(!String(c[key] || '').trim()){this.formError('请填写'+label);return;}if(!String(c.age).trim()||!Number.isInteger(Number(c.age))||Number(c.age)<0||Number(c.age)>30){this.formError('孩子年龄请填写0至30的整数');return;}if(!/^1[3-9]\d{9}$/.test(c.phone || '')){this.formError('请填写有效的11位联系电话');return;}this.run('SAVE_CHILD_INFO',{childInfo:JSON.parse(JSON.stringify(c))});},
 confirmAppointment(){if(!this.data.confirmDate||!this.data.confirmTime){this.formError('请填写确认日期和时间');return;}this.run('CONFIRM_APPOINTMENT',{confirmedAt:this.data.confirmDate+'T'+this.data.confirmTime+':00+08:00',note:this.data.staffNote});},
 cancelAppointment(){wx.showModal({title:'取消本次预约',content:'取消后如需咨询，可以重新提交申请。',success:r=>{if(r.confirm)this.run('CANCEL_APPOINTMENT');}});},
 saveRecord(e){const confirm=e.currentTarget.dataset.confirm===true||e.currentTarget.dataset.confirm==='true';const lines=this.data.recordForm.advice.split('\n').map(v=>v.trim()).filter(Boolean);if(lines.length>30||lines.some(v=>v.length>2000)){this.formError('执行建议最多30条，每条最多2000字');return;}if(confirm&&(!this.data.recordForm.summary.trim()||!lines.length)){this.formError('请填写沟通记录及至少一条执行建议');return;}const submit=()=>this.run('SAVE_RECORD',{summary:this.data.recordForm.summary,advice:this.data.recordForm.advice.split('\n').map(s=>s.trim()).filter(Boolean).map((content,i)=>({key:'step-'+(i+1),content})),confirm});if(confirm)wx.showModal({title:'确认沟通记录',content:'确认后家长可以查看记录与建议；后续补充将通过反馈回复保留。',success:r=>{if(r.confirm)submit();}});else submit();},
 complete(){wx.showModal({title:'确认咨询已完成',content:'请在实际沟通结束且记录完善后确认，之后仍可持续反馈与回复。',success:r=>{if(r.confirm)this.run('COMPLETE_APPOINTMENT');}});},
 async sendFeedback(){const advice=this.data.record&&this.data.record.advice||[];const item=advice[this.data.adviceIndex];if(!item){this.formError('请先选择老师的执行建议');return;}const content=this.data.feedbackContent;if(!content.trim()){this.formError('请填写执行反馈');return;}if(await this.run('SEND_FEEDBACK',{adviceKey:item.key,content,requestKey:this.feedbackKey})){this.feedbackKey=service.requestKey();if(this.data.feedbackContent===content)this.setData({feedbackContent:''});}},
 async sendReply(e){const id=e.currentTarget.dataset.id,content=this.data.replyContents[id] || '';if(!content.trim()){this.formError('请填写回复内容');return;}this.replyKeys[id]=this.replyKeys[id]||service.requestKey();if(await this.run('REPLY_FEEDBACK',{feedbackId:id,content,requestKey:this.replyKeys[id]})){delete this.replyKeys[id];if(this.data.replyContents[id]===content)this.setData({['replyContents.'+id]:''});}},
 async summarizeText(){if(this.data.summaryBusy)return;this.setData({summaryBusy:true,error:''});try{await service.call('SUMMARIZE_TEXT',{appointmentId:this.appointmentId,requestKey:service.requestKey()});this.refresh();}catch(e){service.error(this,e);}finally{this.setData({summaryBusy:false});}},
 useSummary(e){const job=this.data.summaryJobs.find(i=>String(i.id)===String(e.currentTarget.dataset.id));if(job&&job.draft){this.dirtyRecord=true;this.recordEditVersion=(this.recordEditVersion||0)+1;const apply=()=>this.setData({'recordForm.summary':job.draft});if(this.data.recordForm.summary.trim())wx.showModal({title:'替换老师记录？',content:'当前已有手工内容，使用此草稿会替换正文。请先确认需要保留的内容。',success:r=>{if(r.confirm)apply();}});else apply();}},
 startRecording(){
  if(this.data.recording||this.data.summaryBusy||this.unloaded)return;
  wx.showModal({title:'面谈录音与总结',content:'请确认所有参与者同意录音，并同意将录音上传至本咨询服务用于转写与总结。录音由你手动开始、停止。',confirmText:'已同意，开始',success:r=>{
   if(!r.confirm||this.unloaded)return;
   this.recordingConsentAt=new Date().toISOString();
   if(!this.recorder){
    this.recorder=wx.getRecorderManager();
    this.recorderStopHandler=data=>{
     this.recordingActive=false;this.stoppingRecording=false;clearInterval(this.recordingTimer);
     if(!this.unloaded)this.setData({recording:false});
     if(this.unloaded)this.detachRecorder();
     if(data.tempFilePath)this.uploadRecording(data.tempFilePath);
    };
    this.recorderErrorHandler=()=>{
     this.recordingActive=false;this.stoppingRecording=false;clearInterval(this.recordingTimer);
     if(!this.unloaded)this.setData({recording:false,error:'录音未能完成，请检查微信麦克风授权后重试。'});
     else{this.detachRecorder();wx.showToast({title:'录音未能完成，请重新录制',icon:'none'});}
    };
    this.recorder.onStop(this.recorderStopHandler);this.recorder.onError(this.recorderErrorHandler);
   }
   this.recordingActive=true;this.stoppingRecording=false;this.setData({recording:true,recordingSeconds:0});
   this.recordingTimer=setInterval(()=>{if(!this.unloaded)this.setData({recordingSeconds:this.data.recordingSeconds+1});},1000);
   try{this.recorder.start({duration:600000,sampleRate:16000,numberOfChannels:1,encodeBitRate:48000,format:'mp3'});}catch(e){this.recorderErrorHandler();}
  }});
 },
 detachRecorder(){if(!this.recorder)return;if(this.recorderStopHandler)this.recorder.offStop(this.recorderStopHandler);if(this.recorderErrorHandler)this.recorder.offError(this.recorderErrorHandler);},
 stopRecording(){if(this.recordingActive&&this.recorder&&!this.stoppingRecording){this.stoppingRecording=true;this.recorder.stop();}},
 async uploadRecording(path){if(!this.unloaded)this.setData({summaryBusy:true,error:''});try{const upload=require('../../utils/consultationRecording');await upload.uploadAndSummarize(path,this.appointmentId,this.recordingConsentAt);if(!this.unloaded)this.refresh();}catch(e){if(!this.unloaded)service.error(this,e);else wx.showToast({title:'录音处理未完成，请返回咨询页检查',icon:'none'});}finally{if(!this.unloaded)this.setData({summaryBusy:false});}},
 async moreHistory(e){const kind=e.currentTarget.dataset.kind,feedback=kind==='feedback',cursor=feedback?this.data.nextFeedbackCursor:this.data.nextSummaryCursor;if(this.data.loading||this.data.moreLoading||!cursor)return;const generation=this.listGeneration||0;this.setData({moreLoading:true});try{const r=await service.call('GET_APPOINTMENT',{paginate:true,appointmentId:this.appointmentId,[feedback?'feedbackCursor':'summaryCursor']:cursor});if(generation!==(this.listGeneration||0)||this.unloaded)return;if(feedback)this.setData({feedbacks:this.data.feedbacks.concat((r.feedbacks||[]).map(service.decorate)),nextFeedbackCursor:r.nextFeedbackCursor||null});else this.setData({summaryJobs:this.data.summaryJobs.concat((r.summaryJobs||[]).map(service.decorate)),nextSummaryCursor:r.nextSummaryCursor||null});}catch(e){if(generation===(this.listGeneration||0)&&!this.unloaded)service.error(this,e);}finally{if(generation===(this.listGeneration||0)&&!this.unloaded)this.setData({moreLoading:false});}},
 refreshSummary(){this.refresh();},
 backToCustomer(){wx.navigateBack({fail:()=>wx.navigateTo({url:'/pages/customer/customer'})});}
});
