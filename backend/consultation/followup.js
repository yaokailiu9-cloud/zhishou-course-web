var s=getState(), p=s.payload, op=s.operation;
if (op === "SAVE_RECORD") {
  staff(s,"canReply");var a=appointment(s,p.appointmentId,"staff");
  if (["CONFIRMED","COMPLETED"].indexOf(a.status)<0) fail("预约确认后才能整理沟通记录");
  var old=list("offline_consultation_record",eq("appointment_id",a.id),RECORD_FIELDS,1)[0];
  if (old && old.status==="CONFIRMED") fail("该记录已确认，后续内容请通过反馈回复或下次咨询补充");
  var advice=Array.isArray(p.advice) ? p.advice : [];
  if (advice.length>30) fail("单次最多30条执行建议");
  advice=advice.map(function(item,index){var key=text(item.key || ("step-"+(index+1)),"建议标识",100,true);if(key==="__consultation_dialogue__")fail("建议标识无效");return {key:key,content:text(item.content,"执行建议",2000,true)};});
  if (new Set(advice.map(function(i){return i.key;})).size !== advice.length) fail("建议标识不能重复");
  var confirm=p.confirm===true;
  if (confirm && (!a.child_info || !a.child_info.name)) fail("请先请家长补充孩子基础信息");
  if (confirm && !advice.length) fail("请至少填写一条执行建议");
  var object={appointment_id:a.id,author_id:s.actor.providerId,summary:text(p.summary,"沟通记录",16000,confirm),advice:advice,status:confirm?"CONFIRMED":"DRAFT",confirmed_at:confirm?new Date().toISOString():null};
  if (old) update("offline_consultation_record",and(eq("id",old.id),eq("status","DRAFT","text")),object);
  else if (!insert("offline_consultation_record",object,"offline_consultation_record_appointment_id_key")) fail("记录已由其他操作创建，请刷新后重试");
  result(s,{id:a.id});
}
if (op === "COMPLETE_APPOINTMENT") {
  staff(s,"canReply");var a=appointment(s,p.appointmentId,"staff");
  if (!a.confirmed_at || new Date(a.confirmed_at).getTime()>Date.now()) fail("咨询开始后才能确认完成");
  var r=list("offline_consultation_record",and(eq("appointment_id",a.id),eq("status","CONFIRMED","text")),"id",1)[0];
  if (!r || !a.child_info) fail("请先完善基础信息并确认咨询记录");
  update("offline_appointment",and(eq("id",a.id),eq("status","CONFIRMED","text")),{status:"COMPLETED",completed_at:new Date().toISOString()});result(s,{id:a.id});
}
if(op === "SEND_NOTE") {
  var a=appointment(s,p.appointmentId,"owner");
  if(["CONFIRMED","COMPLETED"].indexOf(a.status)<0) fail("预约确认后可以留言沟通");
  insert("consultation_feedback",{request_key:requestKey(s,"note"),appointment_id:a.id,author_id:s.actor.accountId,advice_key:"conversation",content:text(p.content,"沟通内容",6000,true),status:"PENDING"},"consultation_feedback_request_key");
  result(s,{id:a.id});
}
if (op === "SEND_FEEDBACK") {
  var a=appointment(s,p.appointmentId,"owner");
  if (["CONFIRMED","COMPLETED"].indexOf(a.status)<0) fail("当前预约尚不能反馈执行情况");
  var r=list("offline_consultation_record",and(eq("appointment_id",a.id),eq("status","CONFIRMED","text")),RECORD_FIELDS,1)[0];
  if (!r || !Array.isArray(r.advice) || !r.advice.some(function(i){return i.key===p.adviceKey;})) fail("请选择老师已确认的执行建议");
  var key=requestKey(s,"feedback");
  insert("consultation_feedback",{request_key:key,appointment_id:a.id,author_id:s.actor.accountId,advice_key:p.adviceKey,content:text(p.content,"执行情况",6000,true),status:"PENDING"},"consultation_feedback_request_key");
  result(s,{id:a.id});
}
if (op === "REPLY_FEEDBACK") {
  staff(s,"canReply");var f=one("consultation_feedback",p.feedbackId,"id appointment_id advice_key");var a=appointment(s,f.appointment_id,"staff");
  if(f.advice_key==="__consultation_dialogue__")fail("请在咨询对话中发送消息");
  insert("consultation_feedback_reply",{request_key:requestKey(s,"reply"),feedback_id:f.id,author_id:s.actor.providerId,content:text(p.content,"回复",6000,true)},"consultation_feedback_reply_request_key");
  update("consultation_feedback",eq("id",f.id),{status:"REPLIED"});result(s,{id:a.id});
}
// Bound customers can continue feedback inside their plan, independent of paid chat sessions.
function dialogueAppointment() {
  var a=appointment(s,p.appointmentId);
  if(["PENDING","CONFIRMED","COMPLETED","孩子档案"].indexOf(a.status)<0 || !a.customer_id || !a.provider_id)fail("方案需绑定客户和负责老师后才能继续反馈");
  if(String(a.customer_id)!==String(s.actor.accountId)){
    staff(s,"canReply");
    if(String(a.provider_id)!==String(s.actor.providerId))fail("只能与本人负责的咨询客户对话");
  }
  return a;
}
function dialogueMessage(a,row) {
  return {id:row.id,content:row.content,createdAt:row.created_at,senderRole:String(row.author_id)===String(a.customer_id)?"customer":"teacher",isMine:String(row.author_id)===String(s.actor.accountId)};
}
if(op==="GET_CONSULTATION_DIALOGUE") {
  var a=dialogueAppointment(),scope=and(eq("appointment_id",a.id),eq("advice_key","__consultation_dialogue__","text")),fields="id created_at author_id content";
  if(p.afterId && p.beforeId)fail("对话分页参数无效");
  if(p.afterId) {
    var newer=gql("query DialogueNewRows($where:consultation_feedback_bool_exp!){rows: consultation_feedback(where:$where,order_by:{id:asc},limit: 21){"+fields+"}}",{where:and(scope,compare("_gt","id",id(p.afterId)))}).rows||[];
    var more=newer.length>20;newer=newer.slice(0,20);
    result(s,{messages:newer.map(function(row){return dialogueMessage(a,row);}),hasMoreNewer:more});
  } else {
    var page=pageRows("consultation_feedback",scope,fields,p.beforeId,20,true);
    result(s,{messages:page.items.reverse().map(function(row){return dialogueMessage(a,row);}),nextCursor:page.nextCursor});
  }
}
if(op==="SEND_CONSULTATION_MESSAGE") {
  var a=dialogueAppointment(),key=requestKey(s,"dialogue:"+a.id),content=text(p.content,"消息",6000,true);
  insert("consultation_feedback",{request_key:key,appointment_id:a.id,author_id:s.actor.accountId,advice_key:"__consultation_dialogue__",content:content,status:"REPLIED"},"consultation_feedback_request_key");
  var saved=list("consultation_feedback",and(eq("request_key",key,"text"),eq("appointment_id",a.id),eq("author_id",s.actor.accountId)),"id created_at author_id content",1)[0];
  if(!saved)fail("消息发送失败，请重试");
  result(s,{message:dialogueMessage(a,saved)});
}
context.setReturn("state",s);
