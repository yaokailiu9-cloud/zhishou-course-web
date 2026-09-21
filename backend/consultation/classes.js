var s = getState(), p = s.payload, op = s.operation;
function ownedClass(value) {
  staff(s, 'canAccept'); var c = one('public_class',value,CLASS_FIELDS);
  if (String(c.organizer_id)!==String(s.actor.providerId)) fail('只能管理本人负责的公开课');
  return c;
}
function ownedEnrollment(value) {
  login(s); var e=one('public_class_enrollment',value,ENROLL_FIELDS);
  if (String(e.customer_id)!==String(s.actor.accountId)) fail('不能访问其他客户的报名');
  return e;
}
function classView(c, privateView) {
  var v=Object.assign({},c);
  if(!privateView){delete v.group_guide;delete v.group_qr;delete v.revision;delete v.organizer_id;}
  var deadline=c.registration_closes_at||c.starts_at;
  v.canEnroll=c.status==='PUBLISHED' && !!c.starts_at && new Date(c.starts_at).getTime()>Date.now() && (!deadline||new Date(deadline).getTime()>Date.now()) && (!Number(c.capacity)||Number(c.reserved_count||0)<Number(c.capacity));
  v.remaining=Number(c.capacity)?Math.max(0,Number(c.capacity)-Number(c.reserved_count||0)):null;
  v.closedReason=c.status!=='PUBLISHED'?'本场暂未开放报名':(!c.starts_at||new Date(c.starts_at).getTime()<=Date.now())?'本场课程已开始':deadline&&new Date(deadline).getTime()<=Date.now()?'本场报名已截止':v.remaining===0?'本场名额已满':'';
  return v;
}
function lockClass(c, values) {
  var revision=Number(c.revision||0);
  update('public_class',and(eq('id',c.id),eq('revision',revision)),Object.assign({},values,{revision:revision+1}));
}
// An opaque lookup reference, not a bearer credential. Every read and check-in is independently authorized.
function entryCode() {
  var alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',value='';
  for(var i=0;i<24;i++) value+=alphabet.charAt(Math.floor(Math.random()*alphabet.length));
  return value;
}
function paged(table, scope, fields) {
  var where=p.cursor?and(scope,compare('_lt','id',id(p.cursor))):scope;
  var rows=list(table,where,fields,21),more=rows.length>20;
  return {items:rows.slice(0,20),nextCursor:more?String(rows[19].id):null};
}
function filterSearch(scope, columns) {
  var q=text(p.search,'搜索内容',60,false);
  if(!q)return scope;
  var pattern='%'+q.replace(/[\\%_]/g,'\\$&')+'%';
  return and(scope,{_or:columns.map(function(c){return compare('_ilike',c,pattern,'text');})});
}
if(op==='LIST_CLASSES'||op==='STAFF_CLASSES') {
  if(op==='STAFF_CLASSES')staff(s,'canAccept');
  var scope=op==='STAFF_CLASSES'?eq('organizer_id',s.actor.providerId):and(eq('status','PUBLISHED','text'),compare('_gt','starts_at',new Date().toISOString(),'timestamptz'));
  var page=paged('public_class',filterSearch(scope,['title','city']),CLASS_FIELDS);
  result(s,{classes:page.items.map(function(c){return classView(c,op==='STAFF_CLASSES');}),nextCursor:page.nextCursor});
}
if(op==='GET_CLASS') {
  var c=one('public_class',p.classId,CLASS_FIELDS),own=s.actor.accountId?list('public_class_enrollment',and(eq('public_class_id',c.id),eq('customer_id',s.actor.accountId)),ENROLL_FIELDS,1)[0]:null;
  if(c.status!=='PUBLISHED' && c.status!=='CLOSED' && !(s.actor.providerId&&String(c.organizer_id)===String(s.actor.providerId)))fail('本场课程暂未开放');
  result(s,{classInfo:classView(c,!!own&&own.status==='REGISTERED'),enrollment:own||null,canManage:!!s.actor.canAccept&&String(c.organizer_id)===String(s.actor.providerId)});
}
if(op==='GET_STAFF_CLASS') result(s,{classInfo:ownedClass(p.classId)});
if(op==='GENERATE_CLASS_SHARE_CODE') {
  var c=ownedClass(p.classId);
  if(c.status==='DRAFT')fail('请先发布本场课程，再生成报名小程序码');
  if(c.share_code&&c.share_code.id&&c.share_code.url)result(s,{image:c.share_code});
  else {
    var qr=gql('query GenerateCourseMiniCode($input:WechatMiniAppQrCodeCreationInputInput!) { wechatQRcodeWithParams(input:$input) { type image { id url } } }',{input:{page:'pages/public-class-detail/public-class-detail',args:{id:String(c.id)},qrCodeWidth:430}}).wechatQRcodeWithParams;
    if(!qr||qr.type!=='SUCCESS'||!qr.image||!qr.image.id||!qr.image.url)fail('报名码暂未生成，请确认微信正式版已包含课程详情页。当前仍可直接发送课程给朋友。');
    lockClass(c,{share_code_id:id(qr.image.id)});result(s,{image:qr.image});
  }
}
if(op==='SAVE_CLASS') {
  staff(s,'canAccept');var previous=p.id?ownedClass(p.id):null;
  var status=p.status;
  if(['PUBLISHED','CLOSED','DRAFT'].indexOf(status)<0)fail('课程状态无效');
  var capacity=Number(p.capacity||0);
  if(!Number.isSafeInteger(capacity)||capacity<0||capacity>10000)fail('名额请输入0至10000的整数，0表示不限');
  var feeText=String(p.registrationFee==null?'0':p.registrationFee).trim()||'0';
  if(!/^(0|[1-9][0-9]{0,5})(\.[0-9]{1,2})?$/.test(feeText))fail('报名费用请填写0至999999.99元，最多两位小数');
  var registrationFee=Number(feeText);
  if(previous&&capacity&&capacity<Number(previous.reserved_count||0))fail('名额不能少于已报名人数');
  if(previous&&Number(previous.reserved_count)>0&&status==='DRAFT')fail('已有报名的课程请结束报名，不能改回草稿');
  var values={title:text(p.title,'课程名称',120,true),description:text(p.description,'课程说明',4000,false),group_guide:text(p.groupGuide,'进群指引',2000,status==='PUBLISHED'),signup_url:text(p.signupUrl,'报名链接',1500,false),status:status,organizer_id:s.actor.providerId,capacity:capacity,registration_fee:registrationFee,city:text(p.city,'开课城市',60,false),contact_phone:p.contactPhone?phone(p.contactPhone):null,notice:text(p.notice,'参课须知',2000,false)};
  if(values.signup_url&&!/^https:\/\//.test(values.signup_url))fail('报名链接须使用https地址');
  values.starts_at=p.startsAt?date(p.startsAt,'开课时间'):null;
  values.registration_closes_at=p.registrationClosesAt?date(p.registrationClosesAt,'报名截止时间'):null;
  values.checkin_closes_at=p.checkinClosesAt?date(p.checkinClosesAt,'签到截止时间'):null;
  if(status==='PUBLISHED'&&!values.starts_at)fail('发布前请填写开课时间');
  if(values.registration_closes_at&&(!values.starts_at||values.registration_closes_at>values.starts_at))fail('报名截止时间不能晚于开课时间');
  if(values.checkin_closes_at&&(!values.starts_at||values.checkin_closes_at<values.starts_at))fail('签到截止时间不能早于开课时间');
  if(status==='PUBLISHED'&&(!previous||previous.status!=='PUBLISHED')&&new Date(values.starts_at).getTime()<=Date.now())fail('请选择未来的开课时间再发布');
  [['coverId','cover_id'],['groupQrId','group_qr_id'],['shareCodeId','share_code_id']].forEach(function(pair){if(Object.prototype.hasOwnProperty.call(p,pair[0]))values[pair[1]]=p[pair[0]]?id(p[pair[0]]):null;});
  if(previous){
    if(p.revision!=null&&Number(p.revision)!==Number(previous.revision||0))fail('课程已被更新，请刷新后再修改');
    lockClass(previous,values);result(s,{id:previous.id});
  }else result(s,{id:insert('public_class',Object.assign(values,{revision:0,reserved_count:0}))});
}
if(op==='ENROLL') {
  login(s);var c=one('public_class',p.classId,CLASS_FIELDS);
  var key=and(eq('customer_id',s.actor.accountId),eq('public_class_id',c.id));
  var existing=list('public_class_enrollment',key,ENROLL_FIELDS,1)[0];
  if(existing&&existing.status==='REGISTERED')result(s,{enrollment:existing});
  else {
    var view=classView(c,false);if(!view.canEnroll||!c.organizer_id)fail(view.closedReason||'本场尚未开放报名');
    if(Number(c.registration_fee||0)>0)fail('本场报名费为￥'+Number(c.registration_fee).toFixed(2)+'，需先完成缴费，支付成功后才会报名成功');
    var values={customer_id:s.actor.accountId,public_class_id:c.id,registrant_name:text(p.name,'姓名',60,true),phone:phone(p.phone),status:'REGISTERED',attendance_status:'PENDING',group_status:'PENDING',entry_code:entryCode(),canceled_at:null,verified_at:null,verified_by_id:null,checkin_method:null};
    lockClass(c,{reserved_count:Number(c.reserved_count||0)+1});
    if(existing)update('public_class_enrollment',and(eq('id',existing.id),eq('status','CANCELED','text')),values);
    else if(!insert('public_class_enrollment',values,'public_class_enrollment_customer_class_key'))fail('报名状态已变化，请刷新查看');
    result(s,{enrollment:list('public_class_enrollment',key,ENROLL_FIELDS,1)[0]});
  }
}
if(op==='MY_ENROLLMENTS') {
  login(s);var scope=eq('customer_id',s.actor.accountId);
  if(p.filter==='CANCELED')scope=and(scope,eq('status','CANCELED','text'));
  if(p.filter==='PENDING')scope=and(scope,eq('status','REGISTERED','text'),eq('attendance_status','PENDING','text'));
  if(p.filter==='ATTENDED')scope=and(scope,eq('status','REGISTERED','text'),eq('attendance_status','ATTENDED','text'));
  result(s,paged('public_class_enrollment',scope,ENROLL_FIELDS));
}
if(op==='LOCK_REFERRER') {
  login(s);
  var referrerId=id(p.referrerId);
  if(String(referrerId)===String(s.actor.accountId))fail('不能把自己设为推荐人');
  var existingReferral=list('course_referral',eq('referred_account_id',s.actor.accountId),'id created_at locked_at source referrer_id referred_account_id referrer { id username wechat_nickname wechat_avatar_url }',1)[0];
  if(existingReferral)result(s,{binding:existingReferral,locked:false});
  else {
    var referrer=gql('query CourseReferralAccount($where:account_bool_exp!){rows:account(where:$where,limit:1){id username wechat_nickname wechat_avatar_url}}',{where:eq('id',referrerId)}).rows[0];
    if(!referrer)fail('推荐链接已失效');
    insert('course_referral',{referrer_id:referrerId,referred_account_id:s.actor.accountId,locked_at:new Date().toISOString(),source:'WECHAT_H5'},'course_referral_referred_account_id_key');
    existingReferral=list('course_referral',eq('referred_account_id',s.actor.accountId),'id created_at locked_at source referrer_id referred_account_id referrer { id username wechat_nickname wechat_avatar_url }',1)[0];
    result(s,{binding:existingReferral,locked:true});
  }
}
if(op==='MY_REFERRAL_STATUS') {
  login(s);
  result(s,{binding:list('course_referral',eq('referred_account_id',s.actor.accountId),'id created_at locked_at source referrer_id referred_account_id referrer { id username wechat_nickname wechat_avatar_url }',1)[0]||null});
}
if(op==='MY_REFERRALS') {
  login(s);
  var referralPage=paged('course_referral',eq('referrer_id',s.actor.accountId),'id created_at locked_at source referrer_id referred_account_id referred_account { id username wechat_nickname wechat_avatar_url public_class_enrollments { id created_at status attendance_status public_class_id public_class { id title starts_at status } } }');
  result(s,referralPage);
}
if(op==='GET_ENROLLMENT') {
  var e=ownedEnrollment(p.enrollmentId);
  if(e.status==='REGISTERED'&&!e.entry_code){
    update('public_class_enrollment',and(eq('id',e.id),eq('status','REGISTERED','text'),{_is_null:{text_operand:{column:'entry_code'}}}),{entry_code:entryCode()});
    e=ownedEnrollment(e.id);
  }
  if(e.status!=='REGISTERED')e.entry_code=null;
  result(s,{enrollment:e});
}
if(op==='CANCEL_ENROLLMENT') {
  var e=ownedEnrollment(p.enrollmentId);
  if(e.status==='CANCELED')result(s,{id:e.id});
  else {
    if(e.attendance_status==='ATTENDED')fail('已到课的报名不能取消');
    var c=e.public_class;
    if(!c||!c.starts_at||new Date(c.starts_at).getTime()<=Date.now())fail('课程开始后请联系工作人员处理');
    lockClass(c,{reserved_count:Math.max(0,Number(c.reserved_count||0)-1)});
    update('public_class_enrollment',and(eq('id',e.id),eq('status','REGISTERED','text')),{status:'CANCELED',entry_code:null,canceled_at:new Date().toISOString()});
    result(s,{id:e.id});
  }
}
if(op==='COURSE_ROSTER') {
  var c=ownedClass(p.classId),scope=eq('public_class_id',c.id),active=and(scope,eq('status','REGISTERED','text'));
  var stats={registered:countRows('public_class_enrollment',active),attended:countRows('public_class_enrollment',and(active,eq('attendance_status','ATTENDED','text'))),pending:countRows('public_class_enrollment',and(active,eq('attendance_status','PENDING','text')))};
  if(p.filter==='CANCELED')scope=and(scope,eq('status','CANCELED','text'));else scope=active;
  if(['PENDING','ATTENDED','ABSENT'].indexOf(p.filter)>=0)scope=and(scope,eq('attendance_status',p.filter,'text'));
  if(['INVITED','JOINED'].indexOf(p.filter)>=0)scope=and(scope,eq('group_status',p.filter,'text'));
  if(p.filter==='CONTACT')scope=and(scope,eq('group_status','PENDING','text'));
  var page=paged('public_class_enrollment',filterSearch(scope,['registrant_name','phone']),ENROLL_FIELDS);
  result(s,{classInfo:c,items:page.items,nextCursor:page.nextCursor,stats:stats});
}
if(op==='LOOKUP_ENTRY'||op==='CHECK_IN') {
  var c=ownedClass(p.classId),code=text(p.entryCode,'入场码',100,true);
  if(code.indexOf('EMPATH-ENTRY:')===0)code=code.slice(13);
  if(!/^[A-Z2-9]{24}$/.test(code))fail('请扫描本小程序的个人入场码');
  var e=list('public_class_enrollment',and(eq('public_class_id',c.id),eq('entry_code',code,'text')),ENROLL_FIELDS,1)[0];
  if(!e||e.status!=='REGISTERED')fail('入场码无效、已取消或不属于本场课程');
  if(op==='LOOKUP_ENTRY')result(s,{enrollment:e});
  else {p.enrollmentId=e.id;p.attendanceStatus='ATTENDED';op='VERIFY_ENROLLMENT';}
}
if(op==='VERIFY_ENROLLMENT') {
  staff(s,'canAccept');var e=one('public_class_enrollment',p.enrollmentId,ENROLL_FIELDS);
  if(!e.public_class||String(e.public_class.organizer_id)!==String(s.actor.providerId))fail('只能核实本人公开课的报名');
  if(p.classId&&String(p.classId)!==String(e.public_class_id))fail('报名不属于本场课程');
  if(e.status!=='REGISTERED')fail('该报名已取消');
  var changes={},repeated=false;
  if(p.groupStatus){if(['PENDING','INVITED','JOINED'].indexOf(p.groupStatus)<0)fail('进群状态无效');changes.group_status=p.groupStatus;}
  if(p.attendanceStatus){
    if(['ATTENDED','ABSENT'].indexOf(p.attendanceStatus)<0)fail('到课状态无效');
    if(e.attendance_status==='ATTENDED'){
      if(p.attendanceStatus!=='ATTENDED')fail('已核实到课，不能改为未到课');
      repeated=true;
    }else{
      if(e.public_class.status==='DRAFT')fail('草稿课程不能签到');
      if(!e.public_class.starts_at||new Date(e.public_class.starts_at).getTime()>Date.now())fail('课程开始后才能核实到课情况');
      if(e.public_class.checkin_closes_at&&new Date(e.public_class.checkin_closes_at).getTime()<Date.now())fail('本场签到时间已结束');
      changes.attendance_status=p.attendanceStatus;changes.verified_at=new Date().toISOString();changes.verified_by_id=s.actor.providerId;changes.checkin_method=s.operation==='CHECK_IN'?'QR':'MANUAL';
    }
  }
  if(!Object.keys(changes).length&&!repeated)fail('请选择要更新的状态');
  if(Object.keys(changes).length)update('public_class_enrollment',and(eq('id',e.id),eq('status','REGISTERED','text'),eq('attendance_status',e.attendance_status,'text')),changes);
  result(s,{id:e.id,alreadyCheckedIn:repeated,enrollment:one('public_class_enrollment',e.id,ENROLL_FIELDS)});
}
if(op==='MY_OVERVIEW') {
  login(s);var enrollments=list('public_class_enrollment',eq('customer_id',s.actor.accountId),ENROLL_FIELDS,100);
  var qualified=list('public_class_enrollment',and(eq('customer_id',s.actor.accountId),eq('status','REGISTERED','text'),eq('attendance_status','ATTENDED','text')),'id verified_at verified_by_id',100);
  var history=pageRows('offline_appointment',eq('customer_id',s.actor.accountId),APPOINTMENT_FIELDS,p.appointmentCursor,100,p.paginate===true);
  result(s,{enrollments:enrollments,eligible:qualified.some(function(e){return !!e.verified_at&&!!e.verified_by_id;}),appointments:history.items,nextAppointmentCursor:history.nextCursor,isStaff:!!s.actor.providerId});
}
if(op==='STAFF_OVERVIEW') {
  staff(s,s.actor.canAccept?'canAccept':'canReply');
  var history=pageRows('offline_appointment',eq('provider_id',s.actor.providerId),APPOINTMENT_FIELDS,p.appointmentCursor,200,p.paginate===true);
  result(s,{classes:list('public_class',eq('organizer_id',s.actor.providerId),CLASS_FIELDS,100),enrollments:s.actor.canAccept?list('public_class_enrollment',{public_class:eq('organizer_id',s.actor.providerId)},ENROLL_FIELDS,200):[],appointments:history.items,nextAppointmentCursor:history.nextCursor,canAccept:s.actor.canAccept,canReply:s.actor.canReply});
}
context.setReturn('state',s);
