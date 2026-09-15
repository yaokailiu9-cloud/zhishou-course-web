var s=getState(), p=s.payload, op=s.operation;
if (op === "SAVE_RECORD") {
  staff(s,"canReply");var a=appointment(s,p.appointmentId,"staff");
  if (["CONFIRMED","COMPLETED"].indexOf(a.status)<0) fail("预约确认后才能整理沟通记录");
  var old=list("offline_consultation_record",eq("appointment_id",a.id),RECORD_FIELDS,1)[0];
  if (old && old.status==="CONFIRMED") fail("该记录已确认，后续内容请通过反馈回复或下次咨询补充");
  var advice=Array.isArray(p.advice) ? p.advice : [];
  if (advice.length>30) fail("单次最多30条执行建议");
  advice=advice.map(function(item,index){return {key:text(item.key || ("step-"+(index+1)),"建议标识",100,true),content:text(item.content,"执行建议",2000,true)};});
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
  staff(s,"canReply");var f=one("consultation_feedback",p.feedbackId,"id appointment_id");var a=appointment(s,f.appointment_id,"staff");
  insert("consultation_feedback_reply",{request_key:requestKey(s,"reply"),feedback_id:f.id,author_id:s.actor.providerId,content:text(p.content,"回复",6000,true)},"consultation_feedback_reply_request_key");
  update("consultation_feedback",eq("id",f.id),{status:"REPLIED"});result(s,{id:a.id});
}
context.setReturn("state",s);
