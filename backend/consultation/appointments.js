var s=getState(), p=s.payload, op=s.operation;
if (op === "CREATE_APPOINTMENT") {
  login(s); var key=requestKey(s,"appointment");
  var existing=list("offline_appointment",eq("request_key",key,"text"),"id",1)[0];
  if (existing) result(s,{id:existing.id});
  else {
    var eligible=list("public_class_enrollment",and(eq("customer_id",s.actor.accountId),eq("status","REGISTERED","text"),eq("attendance_status","ATTENDED","text")),ENROLL_FIELDS,100);
    var e=eligible.filter(function(e){return !p.enrollmentId || String(e.id)===String(p.enrollmentId);})[0];
    if (!e || !e.verified_at || !e.verified_by_id) fail("请先参加免费公开课，待工作人员核实到课后再申请");
    var providerId=e.public_class && e.public_class.organizer_id;
    var provider=providerId && list("service_provider",and(eq("id",providerId),eq("service_status","ACTIVE","text")),"id can_accept_order",1)[0];
    if (!provider || !provider.can_accept_order) fail("负责老师暂未开放预约，请联系工作人员");
    var object={request_key:key,customer_id:s.actor.accountId,enrollment_id:e.id,provider_id:provider.id,requested_time:text(p.requestedTime,"期望时间",160,true),contact_name:text(p.name || e.registrant_name,"家长姓名",60,true),phone:phone(p.phone || e.phone),concerns:text(p.concerns,"本次困扰",4000,true),status:"PENDING"};
    insert("offline_appointment",object,"offline_appointment_request_key");
    result(s,{id:list("offline_appointment",eq("request_key",key,"text"),"id",1)[0].id});
  }
}
if (op === "CONFIRM_APPOINTMENT") {
  staff(s,"canAccept"); var a=appointment(s,p.appointmentId,"staff");
  var confirmed=date(p.confirmedAt,"咨询时间");
  if (new Date(confirmed).getTime()<=Date.now()) fail("请选择未来的咨询时间");
  var e=one("public_class_enrollment",a.enrollment_id,"id attendance_status status verified_at");
  if (e.attendance_status!=="ATTENDED" || e.status!=="REGISTERED" || !e.verified_at) fail("请先核实该客户实际参加公开课");
  update("offline_appointment",and(eq("id",a.id),eq("status","PENDING","text")),{status:"CONFIRMED",confirmed_at:confirmed,staff_note:text(p.note,"预约说明",2000,false)}); result(s,{id:a.id});
}
if (op === "CANCEL_APPOINTMENT") {
  var a=appointment(s,p.appointmentId);
  if (String(a.customer_id)!==String(s.actor.accountId)) staff(s,"canAccept");
  if (["PENDING","CONFIRMED"].indexOf(a.status)<0) fail("当前预约不能取消");
  update("offline_appointment",and(eq("id",a.id),eq("status",a.status,"text")),{status:"CANCELED"});result(s,{id:a.id});
}
if (op === "SAVE_CHILD_INFO") {
  var a=appointment(s,p.appointmentId,"owner"), c=p.childInfo || {};
  if (a.status!=="CONFIRMED") fail("预约确认后、咨询完成前可以填写孩子基础信息");
  if (c.age === "" || c.age === null || c.age === undefined) fail("请填写年龄");
  var age=Number(c.age);if (!Number.isInteger(age)||age<0||age>30) fail("请填写有效年龄");
  var child={name:text(c.name,"孩子姓名或称呼",60,true),age:age,grade:text(c.grade,"年级",60,false),guardian:text(c.guardian,"家长姓名",60,true),relationship:text(c.relationship,"与孩子关系",60,true),phone:phone(c.phone),concerns:text(c.concerns,"主要困扰",4000,true),goals:text(c.goals,"沟通期待",2000,false)};
  update("offline_appointment",and(eq("id",a.id),eq("status","CONFIRMED","text")),{child_info:child});result(s,{id:a.id});
}
if (op === "GET_APPOINTMENT") {
  var a=appointment(s,p.appointmentId);
  var assigned=!!s.actor.providerId && String(a.provider_id)===String(s.actor.providerId);
  var record=list("offline_consultation_record",and(eq("appointment_id",a.id),assigned ? {} : eq("status","CONFIRMED","text")),RECORD_FIELDS,1)[0] || null;
  var jobs=pageRows("consultation_summary_job",and(eq("appointment_id",a.id),assigned ? {} : eq("requester_id",s.actor.accountId)),JOB_FIELDS,p.summaryCursor,30,p.paginate===true);
  var feedback=pageRows("consultation_feedback",eq("appointment_id",a.id),FEEDBACK_FIELDS,p.feedbackCursor,200,p.paginate===true);
  result(s,{appointment:a,record:record,feedbacks:feedback.items,nextFeedbackCursor:feedback.nextCursor,summaryJobs:jobs.items.map(refreshSummaryJob),nextSummaryCursor:jobs.nextCursor,isStaff:assigned,canAccept:assigned && s.actor.canAccept,canReply:assigned && s.actor.canReply});
}
context.setReturn("state",s);
