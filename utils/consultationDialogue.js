const service=require('./consultationService');
const viewSession=require('./viewSession');
const data={canTalk:false,dialogueOpen:false,dialogueMessages:[],dialogueCursor:null,dialogueLoading:false,dialogueSending:false,dialogueContent:'',dialogueError:''};
function active(page,identity,generation){return !page.unloaded&&!page.hidden&&page.data.dialogueOpen&&page.data.canTalk&&viewSession.current(identity)&&generation===page.dialogueGeneration;}
const methods={
 syncDialogue(){
  if(!this.data.canTalk||(this.dialogueIdentity&&!viewSession.current(this.dialogueIdentity))){const canTalk=this.data.canTalk&&(!this.dialogueIdentity||viewSession.current(this.dialogueIdentity));this.suspendDialogue();this.dialogueIdentity=null;this.dialoguePending=null;this.dialogueAfterId=null;this.setData({...data,canTalk});return;}
  if(this.data.dialogueOpen&&!this.hidden){this.refreshDialogue();this.startDialoguePolling();}
 },
 openDialogue(){
  if(!this.data.canTalk)return;
  if(this.dialogueIdentity&&!viewSession.current(this.dialogueIdentity)){this.syncDialogue();return;}
  this.dialogueIdentity=viewSession.capture();this.setData({dialogueOpen:true,dialogueError:''});
  this.startDialoguePolling();return this.loadDialogue(this.data.dialogueMessages.length?'poll':'initial');
 },
 closeDialogue(){this.suspendDialogue();this.setData({dialogueOpen:false});},
 suspendDialogue(){clearInterval(this.dialogueTimer);this.dialogueTimer=null;this.dialogueGeneration=(this.dialogueGeneration||0)+1;this.dialogueRequest=null;if(!this.unloaded)this.setData({dialogueLoading:false,dialogueSending:false});},
 startDialoguePolling(){clearInterval(this.dialogueTimer);this.dialogueTimer=setInterval(()=>this.refreshDialogue(),8000);},
 inputDialogue(e){this.dialogueEditVersion=(this.dialogueEditVersion||0)+1;this.setData({dialogueContent:e.detail.value});},
 mergeDialogue(messages){
  const rows=new Map(this.data.dialogueMessages.map(row=>[String(row.id),row]));
  for(const message of messages||[])rows.set(String(message.id),{...message,timeText:service.formatTime(message.createdAt),senderLabel:message.senderRole==='teacher'?'老师':'学生/家长'});
  this.setData({dialogueMessages:[...rows.values()].sort((a,b)=>Number(a.id)-Number(b.id))});
 },
 refreshDialogue(){return this.loadDialogue(this.dialogueAfterId?'poll':'initial');},
 moreDialogue(){if(this.data.dialogueCursor)return this.loadDialogue('more');},
 async loadDialogue(mode){
  if(this.dialogueRequest||this.hidden||this.unloaded||!this.data.dialogueOpen||!this.data.canTalk)return;
  if(!this.dialogueIdentity||!viewSession.current(this.dialogueIdentity)){this.syncDialogue();return;}
  const identity=this.dialogueIdentity,generation=this.dialogueGeneration,request={};this.dialogueRequest=request;
  this.setData({dialogueLoading:true});
  try{
   const params={appointmentId:this.appointmentId,...(mode==='more'?{beforeId:this.data.dialogueCursor}:mode==='poll'&&this.dialogueAfterId?{afterId:this.dialogueAfterId}:{})};
   const result=await service.call('GET_CONSULTATION_DIALOGUE',params);
   if(!active(this,identity,generation))return;
   this.mergeDialogue(result.messages);const rows=result.messages||[];if(mode!=='more'&&rows.length)this.dialogueAfterId=rows[rows.length-1].id;
   this.setData({dialogueError:'',...(mode==='poll'?{}:{dialogueCursor:result.nextCursor||null})});
  }catch(error){if(active(this,identity,generation))this.setData({dialogueError:error.message||'对话读取失败，请重试'});}
  finally{if(this.dialogueRequest===request){this.dialogueRequest=null;if(active(this,identity,generation))this.setData({dialogueLoading:false});}}
 },
 async sendDialogue(){
  if(this.data.dialogueSending||!this.data.canTalk||!this.data.dialogueOpen)return;
  if(!this.dialogueIdentity||!viewSession.current(this.dialogueIdentity)){this.syncDialogue();return;}
  const content=String(this.data.dialogueContent||'').trim();
  if(!content||content.length>6000){this.setData({dialogueError:content?'消息最多6000字':'请填写消息内容'});return;}
  const identity=this.dialogueIdentity,generation=this.dialogueGeneration,version=this.dialogueEditVersion||0;
  if(!this.dialoguePending||this.dialoguePending.content!==content)this.dialoguePending={content,key:service.requestKey()};
  const pending=this.dialoguePending;this.setData({dialogueSending:true,dialogueError:''});
  try{
   const saved=await service.call('SEND_CONSULTATION_MESSAGE',{appointmentId:this.appointmentId,content,requestKey:pending.key});
   if(!viewSession.current(identity)||this.unloaded||generation!==this.dialogueGeneration)return;
   this.dialoguePending=null;
   if(saved.message)this.mergeDialogue([saved.message]);
   if((this.dialogueEditVersion||0)===version)this.setData({dialogueContent:''});
   this.setData({dialogueError:''});
  }catch(error){if(viewSession.current(identity)&&!this.unloaded&&generation===this.dialogueGeneration)this.setData({dialogueError:'发送未确认，内容已保留。可刷新对话后重试。'});}
  finally{if(viewSession.current(identity)&&!this.unloaded&&generation===this.dialogueGeneration)this.setData({dialogueSending:false});}
 }
};
module.exports={data,methods};
