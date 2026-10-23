// Offline consultation content inside the chat archive view: appointment, teacher record, execution feedback,
// notes, teacher replies and the direct plan dialogue. Every read and write goes through the existing
// consultation operations, so the backend still decides who may see or send what. Archive data is read-only here.
const service=require('./consultationService');
const viewSession=require('./viewSession');
const dialogue=require('./consultationDialogue');
const SERVICE_KEYS=['__service_feedback__','__consultation_dialogue__'];
const data={...dialogue.data,consult:null,consultLoading:false,consultError:'',consultDenied:false,consultFeedback:[],consultFeedbackCursor:null,consultMoreLoading:false,consultBusy:false,consultAdviceIndex:0,consultFeedbackInput:'',consultNoteInput:'',consultReplyInputs:{}};
function adviceText(record,key){const item=record&&Array.isArray(record.advice)&&record.advice.find(a=>a.key===key);return item?item.content:'';}
function decorateFeedback(record,item){const note=item.advice_key==='conversation';return {...service.decorate(item),kindText:note?'家长留言':'执行反馈',adviceText:note?'':adviceText(record,item.advice_key),timeText:service.formatTime(item.created_at),replies:(item.replies||[]).slice().sort((a,b)=>Number(a.id)-Number(b.id)).map(r=>({...r,timeText:r.created_at?service.formatTime(r.created_at):''}))};}
// Plan-feedback and service-feedback messages have their own tabs; keep them out of the record list.
function consultFeedback(record,rows){return (rows||[]).filter(f=>SERVICE_KEYS.indexOf(f.advice_key)<0).map(f=>decorateFeedback(record,f));}
function same(page,identity,epoch,version){return !page.unloaded&&viewSession.current(identity)&&page.serviceEpoch===epoch&&page.serviceCaseVersion===version;}
const methods={
 ...dialogue.methods,
 resetConsult(){this.suspendDialogue();this.dialogueIdentity=null;this.dialoguePending=null;this.dialogueAfterId=null;this.dialogueSeenId=undefined;this.consultKeys={};this.consultRequest=null;this.setData({...data});},
 async loadConsult(silent=false){
  const id=this.serviceSelectedId;if(!id||this.consultRequest)return;
  const identity=this.serviceChatIdentity,epoch=this.serviceEpoch,version=this.serviceCaseVersion,request={};this.consultRequest=request;this.appointmentId=id;
  if(!silent)this.setData({consultLoading:true,consultError:''});
  try{
   const r=await service.call('GET_APPOINTMENT',{paginate:true,appointmentId:id});
   if(!same(this,identity,epoch,version))return;
   if(this.dialogueSeenId===undefined)this.dialogueSeenId=r.dialogueReadMark==null?null:Number(r.dialogueReadMark);
   const a=service.decorate(r.appointment),record=r.record||null,advice=record&&Array.isArray(record.advice)?record.advice:[];
   const previous=silent?this.data.consultFeedback:[],rows=new Map(previous.map(f=>[String(f.id),f]));consultFeedback(record,r.feedbacks).forEach(f=>rows.set(String(f.id),f));
   this.setData({consult:{appointment:a,record,advice,isStaff:!!r.isStaff,canAccept:!!r.canAccept,canReply:!!r.canReply,canSendFeedback:!r.isStaff&&!!record&&record.status==='CONFIRMED'&&['CONFIRMED','COMPLETED'].indexOf(a.status)>=0&&advice.length>0,canSendNote:!r.isStaff&&['CONFIRMED','COMPLETED'].indexOf(a.status)>=0,needsArchive:!r.isStaff&&a.status==='CONFIRMED'&&!a.child_info,canEditArchive:!!(r.isStaff&&r.canReply&&a.child_info)},consultFeedback:[...rows.values()].sort((x,y)=>Number(y.id)-Number(x.id)),...(silent&&previous.length?{}:{consultFeedbackCursor:r.nextFeedbackCursor||null}),consultDenied:false,consultError:'',canTalk:r.canTalk===true,...(this.data.dialogueOpen?{}:{dialogueUnread:Number(r.dialogueUnread)||0}),consultAdviceIndex:Math.min(this.data.consultAdviceIndex,Math.max(advice.length-1,0))});
   this.syncDialogue();
  }catch(e){
   if(!same(this,identity,epoch,version))return;
   // Reviewers outside the consultation (for example a director only) keep the feedback and plan tabs.
   const denied=/不能访问|没有|权限/.test(String(e&&e.message||''));
   if(silent&&!denied)return;
   this.setData({consultDenied:denied,consultError:denied?'':String(e&&e.message||'咨询记录读取失败，请重试'),...(denied?{consult:null,canTalk:false}:{})});
   if(denied){this.syncDialogue();if(['talk','consult'].indexOf(this.data.serviceTab)>=0)this.setData({serviceTab:'feedback'});}
  }finally{if(this.consultRequest===request){this.consultRequest=null;if(same(this,identity,epoch,version))this.setData({consultLoading:false});}}
 },
 async moreConsultFeedback(){
  const cursor=this.data.consultFeedbackCursor;if(!cursor||this.data.consultMoreLoading)return;
  const identity=this.serviceChatIdentity,epoch=this.serviceEpoch,version=this.serviceCaseVersion;this.setData({consultMoreLoading:true});
  try{const r=await service.call('GET_APPOINTMENT',{paginate:true,appointmentId:this.serviceSelectedId,feedbackCursor:cursor});if(!same(this,identity,epoch,version))return;const record=this.data.consult&&this.data.consult.record;const rows=new Map(this.data.consultFeedback.map(f=>[String(f.id),f]));consultFeedback(record,r.feedbacks).forEach(f=>rows.set(String(f.id),f));this.setData({consultFeedback:[...rows.values()].sort((x,y)=>Number(y.id)-Number(x.id)),consultFeedbackCursor:r.nextFeedbackCursor||null});}
  catch(e){if(same(this,identity,epoch,version))this.setData({consultError:String(e&&e.message||'读取失败，请重试')});}
  finally{if(same(this,identity,epoch,version))this.setData({consultMoreLoading:false});}
 },
 inputConsult(e){const field=e.currentTarget.dataset.field;if(['consultFeedbackInput','consultNoteInput'].indexOf(field)>=0)this.setData({[field]:e.detail.value});},
 inputConsultReply(e){this.setData({['consultReplyInputs.'+e.currentTarget.dataset.id]:e.detail.value});},
 chooseConsultAdvice(e){this.setData({consultAdviceIndex:Number(e.detail.value)||0});},
 // Each send keeps its request key until it succeeds, so a retry after a network error never duplicates the message.
 async consultSend(operation,keyName,payload){
  if(this.data.consultBusy)return false;
  const identity=this.serviceChatIdentity,epoch=this.serviceEpoch,version=this.serviceCaseVersion,keys=this.consultKeys||(this.consultKeys={}),signature=JSON.stringify(payload);
  if(!keys[keyName]||keys[keyName].signature!==signature)keys[keyName]={signature,key:service.requestKey()};
  this.setData({consultBusy:true,consultError:''});
  try{await service.call(operation,{appointmentId:this.serviceSelectedId,...payload,requestKey:keys[keyName].key});if(!same(this,identity,epoch,version))return false;delete keys[keyName];wx.showToast({title:'已发送',icon:'success'});this.loadConsult(true);return true;}
  catch(e){if(same(this,identity,epoch,version))this.setData({consultError:String(e&&e.message||'发送未确认，内容已保留，请重试')});return false;}
  finally{if(same(this,identity,epoch,version))this.setData({consultBusy:false});}
 },
 async sendConsultFeedback(){const c=this.data.consult;if(!c||!c.canSendFeedback)return;const item=c.advice[this.data.consultAdviceIndex],content=String(this.data.consultFeedbackInput||'').trim();if(!item){this.setData({consultError:'请先选择老师的执行建议'});return;}if(!content){this.setData({consultError:'请填写执行情况'});return;}if(await this.consultSend('SEND_FEEDBACK','feedback',{adviceKey:item.key,content})&&String(this.data.consultFeedbackInput||'').trim()===content)this.setData({consultFeedbackInput:''});},
 async sendConsultNote(){const c=this.data.consult;if(!c||!c.canSendNote)return;const content=String(this.data.consultNoteInput||'').trim();if(!content){this.setData({consultError:'请填写留言内容'});return;}if(await this.consultSend('SEND_NOTE','note',{content})&&String(this.data.consultNoteInput||'').trim()===content)this.setData({consultNoteInput:''});},
 async sendConsultReply(e){const c=this.data.consult;if(!c||!c.canReply)return;const id=e.currentTarget.dataset.id,content=String(this.data.consultReplyInputs[id]||'').trim();if(!content){this.setData({consultError:'请填写回复内容'});return;}if(await this.consultSend('REPLY_FEEDBACK','reply:'+id,{feedbackId:id,content})&&String(this.data.consultReplyInputs[id]||'').trim()===content)this.setData({['consultReplyInputs.'+id]:''});},
 // Confirming times, writing records, recordings and archive edits keep their dedicated page and its checks.
 openConsultDetail(){if(this.serviceSelectedId)wx.navigateTo({url:'/pages/consultation-detail/consultation-detail?id='+this.serviceSelectedId});}
};
module.exports={data,methods,consultFeedback};
