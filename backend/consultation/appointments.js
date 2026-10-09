var s=getState(), p=s.payload, op=s.operation;
// PACKAGE_APPOINTMENTS: build script inserts package.js here.
if (op === "CONFIRM_APPOINTMENT") {
  staff(s,"canAccept"); var a=appointment(s,p.appointmentId,"staff");
  var confirmed=date(p.confirmedAt,"咨询时间");
  if (new Date(confirmed).getTime()<=Date.now()) fail("请选择未来的咨询时间");
  var e=one("public_class_enrollment",a.enrollment_id,"id attendance_status status verified_at");
  if (e.attendance_status!=="ATTENDED" || e.status!=="REGISTERED" || !e.verified_at) fail("请先核实该客户实际参加公开课");
  update("offline_appointment",and(eq("id",a.id),eq("status","PENDING","text")),{status:"CONFIRMED",confirmed_at:confirmed,provider_id:s.actor.providerId,staff_note:text(p.note,"预约说明",2000,false)}); result(s,{id:a.id});
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
  // The archive lives in the verified child_info JSONB column. Accept only paper-form keys.
  // Preserve these keys when an older client saves the original eight-field form.
  var previous=a.child_info && typeof a.child_info==="object" ? a.child_info : {};
  var plain={gender:20,wechatNickname:60,filledAt:10,fatherName:120,fatherOccupation:120,motherName:120,motherOccupation:120,familyMembers:2000,fatherDisrespectResponse:2000,motherDisrespectResponse:2000,paternalAttitude:2000,maternalAttitude:2000,otherFactors:2000,hobbies:2000,personality:2000,specificProblems:4000,influences:4000,opposeTeacherMethod:120,opposeParentsMethod:120,opposeRelativesMethod:120,fightingMethod:120,moneyAmount:30,moneySource:2000,signatureName:120,signatureDate:10,remarks:2000};
  var choices={parentsDivorced:["是","否"],fatherCognition:["不管","控制","配合","自我"],motherCognition:["不管","控制","配合","自我"],fatherPlanSupport:["反对","无所谓","赞同"],fatherDiscipline:["严格","可共情","时严时松"],motherPlanSupport:["反对","无所谓","赞同"],motherDiscipline:["严格","可共情","时严时松"],paternalNearby:["是","否"],paternalInterference:["从不","偶尔","经常"],maternalNearby:["是","否"],maternalInterference:["从不","偶尔","经常"],obedience:["听话","一般","不听话"],ruleAwareness:["强","一般","弱"],socialAbility:["强","一般","弱"],runsAway:["是","否"],badFriends:["是","否"],overnightAbsent:["是","否"],opposeTeacher:["是","否"],opposeTeacherDegree:["轻微","一般","严重"],opposeParents:["是","否"],opposeParentsDegree:["轻微","一般","严重"],opposeRelatives:["是","否"],opposeRelativesDegree:["轻微","一般","严重"],fighting:["是","否"],fightingDegree:["轻微","一般","严重"]};
  var multi={dailyTraits:["虚荣心强","好静乖巧","花钱无度","不乱花钱","义气忠义","敏感胆小","争强好胜","特善交际","积极阳光","圆润可爱","毅力不足","心思灵活","嫉妒心强","不爱学习","自觉性强","朋友特多","善良重情","疑心甚重"],readConfirmed:["基本纲要","郑重声明","特训营","天性辨别"],issues:["拖沓","扯皮","焦躁","日夜颠倒","辍学","无情","挑食","消极","厌学","撒泼摆烂","自残","抑郁","推诿","贪玩","胡乱花钱","爱讲公平","暴力","自我封闭","懒惰","马虎","爱讲道理","对抗","沉默","沉迷游戏"]};
  Object.keys(plain).forEach(function(key){var v=Object.prototype.hasOwnProperty.call(c,key)?c[key]:previous[key];child[key]=text(v,key,plain[key],false);});
  Object.keys(choices).forEach(function(key){var v=Object.prototype.hasOwnProperty.call(c,key)?c[key]:previous[key];if(v==null||v==="")child[key]="";else {if(typeof v!=="string"||choices[key].indexOf(v)<0) fail("档案选项无效："+key);child[key]=v;}});
  Object.keys(multi).forEach(function(key){var v=Object.prototype.hasOwnProperty.call(c,key)?c[key]:previous[key];if(v==null||v==="")v=[];if(!Array.isArray(v)||v.length>multi[key].length||v.some(function(item){return typeof item!=="string"||multi[key].indexOf(item)<0;})||new Set(v).size!==v.length) fail("档案多选项无效："+key);child[key]=v;});
  if(child.gender && ["男","女","其他"].indexOf(child.gender)<0) fail("性别选项无效");
  ["filledAt","signatureDate"].forEach(function(key){if(child[key]&&!/^\d{4}-\d{2}-\d{2}$/.test(child[key])) fail("请按年-月-日填写日期");});
  update("offline_appointment",and(eq("id",a.id),eq("status","CONFIRMED","text")),{child_info:child});result(s,{id:a.id});
}
if (op === "SAVE_CHILD_ARCHIVE") {
  staff(s,"canReply"); var a=appointment(s,p.appointmentId,"staff");
  if (!a.child_info || typeof a.child_info!=="object" || Array.isArray(a.child_info)) fail("请先录入孩子档案");
  if (typeof p.previousUpdatedAt!=="string" || p.previousUpdatedAt!==a.updated_at) fail("档案已被更新，请重新打开后再修改");
  // Older cached forms may send childInfo; only remarks are accepted from it.
  var value=typeof p.remarks==="string" ? p.remarks : p.childInfo && p.childInfo.remarks;
  if (typeof value!=="string") fail("备注请求格式无效");
  var child=Object.assign({},a.child_info,{remarks:text(value,"备注",2000,false)});
  update("offline_appointment",and(eq("id",a.id),eq("updated_at",a.updated_at,"timestamptz")),{child_info:child});
  result(s,{id:a.id,updatedAt:one("offline_appointment",a.id,"id updated_at").updated_at});
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
  update("offline_appointment",and(eq("id",a.id),eq("updated_at",latest.updated_at,"timestamptz")),{child_info:child});
  result(s,{id:a.id,remarks:remarks});
}
if (op === "GET_APPOINTMENT") {
  var a=appointment(s,p.appointmentId);
  var assigned=!!s.actor.providerId && (String(a.provider_id)===String(s.actor.providerId) || (s.actor.serviceKind==="STAFF" && !!s.actor.canAccept));
  var record=list("offline_consultation_record",and(eq("appointment_id",a.id),assigned ? {} : eq("status","CONFIRMED","text")),RECORD_FIELDS,1)[0] || null;
  var jobs=pageRows("consultation_summary_job",and(eq("appointment_id",a.id),assigned ? {} : eq("requester_id",s.actor.accountId)),JOB_FIELDS,p.summaryCursor,30,p.paginate===true);
  var feedback=pageRows("consultation_feedback",and(eq("appointment_id",a.id),{_or:[{_not:eq("advice_key","__consultation_dialogue__","text")},isNull("advice_key","text")]}),FEEDBACK_FIELDS,p.feedbackCursor,200,p.paginate===true);
  var canTalk=["PENDING","CONFIRMED","COMPLETED","孩子档案"].indexOf(a.status)>=0 && !!a.customer_id && !!a.provider_id && (String(a.customer_id)===String(s.actor.accountId) || (String(a.provider_id)===String(s.actor.providerId) && !!s.actor.providerId && s.actor.canReply));
  result(s,{appointment:a,record:record,feedbacks:feedback.items,nextFeedbackCursor:feedback.nextCursor,summaryJobs:jobs.items.map(refreshSummaryJob),nextSummaryCursor:jobs.nextCursor,isStaff:assigned,canAccept:assigned && s.actor.canAccept,canReply:assigned && s.actor.canReply,canTalk:canTalk});
}
// AGENT_APPOINTMENTS: build script inserts agent-appointments.js here.
context.setReturn("state",s);
