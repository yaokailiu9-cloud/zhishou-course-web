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
if (op === "SAVE_CHILD_INFO" || op === "SAVE_CHILD_ARCHIVE") {
  var managed=op==="SAVE_CHILD_ARCHIVE";
  if (managed) staff(s,"canReply");
  var a=appointment(s,p.appointmentId,managed ? "staff" : "owner"), c=p.childInfo || {};
  if (!c || typeof c!=="object" || Array.isArray(c)) fail("档案格式无效");
  if (managed) {
    if (!a.child_info || typeof a.child_info!=="object" || Array.isArray(a.child_info)) fail("请先录入孩子档案");
    if (typeof p.previousUpdatedAt!=="string" || p.previousUpdatedAt!==a.updated_at) fail("档案已被更新，请重新打开后再修改");
  } else if (a.status!=="CONFIRMED") fail("预约确认后、咨询完成前可以填写孩子基础信息");
  if (c.age === "" || c.age === null || c.age === undefined) fail("请填写年龄");
  var age=Number(c.age);if (!Number.isInteger(age)||age<0||age>30) fail("请填写有效年龄");
  var child={name:text(c.name,"孩子姓名或称呼",60,true),age:age,grade:text(c.grade,"年级",60,false),guardian:text(c.guardian,"家长姓名",60,!managed),relationship:text(c.relationship,"与孩子关系",60,!managed),phone:managed&&!c.phone?"":phone(c.phone),concerns:text(c.concerns,"主要困扰",4000,!managed),goals:text(c.goals,"沟通期待",2000,false)};
  // The archive lives in the verified child_info JSONB column. Accept only paper-form keys.
  // Preserve these keys when an older client saves the original eight-field form.
  var previous=a.child_info && typeof a.child_info==="object" ? a.child_info : {};
  if (managed) child=Object.assign({},previous,child);
  var plain={gender:20,wechatNickname:60,filledAt:10,fatherName:120,fatherOccupation:120,motherName:120,motherOccupation:120,familyMembers:2000,fatherDisrespectResponse:2000,motherDisrespectResponse:2000,paternalAttitude:2000,maternalAttitude:2000,otherFactors:2000,hobbies:2000,personality:2000,specificProblems:4000,influences:4000,opposeTeacherMethod:120,opposeParentsMethod:120,opposeRelativesMethod:120,fightingMethod:120,moneyAmount:30,moneySource:2000,signatureName:120,signatureDate:10,remarks:2000};
  var choices={parentsDivorced:["是","否"],fatherCognition:["不管","控制","配合","自我"],motherCognition:["不管","控制","配合","自我"],fatherPlanSupport:["反对","无所谓","赞同"],fatherDiscipline:["严格","可共情","时严时松"],motherPlanSupport:["反对","无所谓","赞同"],motherDiscipline:["严格","可共情","时严时松"],paternalNearby:["是","否"],paternalInterference:["从不","偶尔","经常"],maternalNearby:["是","否"],maternalInterference:["从不","偶尔","经常"],obedience:["听话","一般","不听话"],ruleAwareness:["强","一般","弱"],socialAbility:["强","一般","弱"],runsAway:["是","否"],badFriends:["是","否"],overnightAbsent:["是","否"],opposeTeacher:["是","否"],opposeTeacherDegree:["轻微","一般","严重"],opposeParents:["是","否"],opposeParentsDegree:["轻微","一般","严重"],opposeRelatives:["是","否"],opposeRelativesDegree:["轻微","一般","严重"],fighting:["是","否"],fightingDegree:["轻微","一般","严重"]};
  var multi={dailyTraits:["虚荣心强","好静乖巧","花钱无度","不乱花钱","义气忠义","敏感胆小","争强好胜","特善交际","积极阳光","圆润可爱","毅力不足","心思灵活","嫉妒心强","不爱学习","自觉性强","朋友特多","善良重情","疑心甚重"],readConfirmed:["基本纲要","郑重声明","特训营","天性辨别"],issues:["拖沓","扯皮","焦躁","日夜颠倒","辍学","无情","挑食","消极","厌学","撒泼摆烂","自残","抑郁","推诿","贪玩","胡乱花钱","爱讲公平","暴力","自我封闭","懒惰","马虎","爱讲道理","对抗","沉默","沉迷游戏"]};
  Object.keys(plain).forEach(function(key){var v=Object.prototype.hasOwnProperty.call(c,key)?c[key]:previous[key];child[key]=text(v,key,plain[key],false);});
  Object.keys(choices).forEach(function(key){var v=Object.prototype.hasOwnProperty.call(c,key)?c[key]:previous[key];if(v==null||v==="")child[key]="";else {if(typeof v!=="string"||choices[key].indexOf(v)<0) fail("档案选项无效："+key);child[key]=v;}});
  Object.keys(multi).forEach(function(key){var v=Object.prototype.hasOwnProperty.call(c,key)?c[key]:previous[key];if(v==null||v==="")v=[];if(!Array.isArray(v)||v.length>multi[key].length||v.some(function(item){return typeof item!=="string"||multi[key].indexOf(item)<0;})||new Set(v).size!==v.length) fail("档案多选项无效："+key);child[key]=v;});
  if(child.gender && ["男","女","其他"].indexOf(child.gender)<0) fail("性别选项无效");
  ["filledAt","signatureDate"].forEach(function(key){if(child[key]&&!/^\d{4}-\d{2}-\d{2}$/.test(child[key])) fail("请按年-月-日填写日期");});
  var scope=managed ? and(eq("id",a.id),eq("provider_id",s.actor.providerId),eq("updated_at",a.updated_at,"timestamptz")) : and(eq("id",a.id),eq("status","CONFIRMED","text"));
  update("offline_appointment",scope,{child_info:child});
  result(s,managed ? {id:a.id,updatedAt:one("offline_appointment",a.id,"id updated_at").updated_at} : {id:a.id});
}
if (op === "SAVE_CHILD_REMARKS") {
  staff(s,"canReply"); var a=appointment(s,p.appointmentId,"staff");
  var latest=one("offline_appointment",a.id,"id updated_at child_info");
  if (!latest.child_info || typeof latest.child_info!=="object" || Array.isArray(latest.child_info)) fail("请先录入孩子档案");
  if (typeof p.remarks!=="string" || typeof p.previousRemarks!=="string") fail("备注请求格式无效");
  var previous=String(latest.child_info.remarks || "");
  if (p.previousRemarks!==previous) fail("备注已被更新，请重新打开档案后再修改");
  var remarks=text(p.remarks,"备注",2000,false);
  var child=Object.assign({},latest.child_info,{remarks:remarks});
  update("offline_appointment",and(eq("id",a.id),eq("provider_id",s.actor.providerId),eq("updated_at",latest.updated_at,"timestamptz")),{child_info:child});
  result(s,{id:a.id,remarks:remarks});
}
if (op === "GET_APPOINTMENT") {
  var a=appointment(s,p.appointmentId);
  var assigned=!!s.actor.providerId && String(a.provider_id)===String(s.actor.providerId);
  var record=list("offline_consultation_record",and(eq("appointment_id",a.id),assigned ? {} : eq("status","CONFIRMED","text")),RECORD_FIELDS,1)[0] || null;
  var jobs=pageRows("consultation_summary_job",and(eq("appointment_id",a.id),assigned ? {} : eq("requester_id",s.actor.accountId)),JOB_FIELDS,p.summaryCursor,30,p.paginate===true);
  var feedback=pageRows("consultation_feedback",eq("appointment_id",a.id),FEEDBACK_FIELDS,p.feedbackCursor,200,p.paginate===true);
  result(s,{appointment:a,record:record,feedbacks:feedback.items,nextFeedbackCursor:feedback.nextCursor,summaryJobs:jobs.items.map(refreshSummaryJob),nextSummaryCursor:jobs.nextCursor,isStaff:assigned,canAccept:assigned && s.actor.canAccept,canReply:assigned && s.actor.canReply});
}
// AGENT_APPOINTMENTS: build script inserts agent-appointments.js here.
context.setReturn("state",s);
