// Agent booking uses the verified referral relation and existing appointment workflow.
if (op === 'GET_AGENT_APPOINTMENT' || op === 'CREATE_AGENT_APPOINTMENT') {
  login(s);
  if (!s.actor.canInvite || (!s.actor.agentId && !s.actor.canAccept)) fail('当前账号没有代理预约权限');
  var referral=one('course_referral',p.referralId,'id referrer_id referred_account_id');
  if (String(referral.referrer_id)!==String(s.actor.accountId)) fail('只能为自己推荐的客户预约');
  if (String(referral.referred_account_id)===String(s.actor.accountId)) fail('不能为自己预约免费咨询');
  var enrollment=one('public_class_enrollment',p.enrollmentId,ENROLL_FIELDS);
  if (String(enrollment.customer_id)!==String(referral.referred_account_id)) fail('报名记录不属于该客户');
  if (enrollment.status!=='REGISTERED' || enrollment.attendance_status!=='ATTENDED' || !enrollment.verified_at || !enrollment.verified_by_id || isQuestionnaire(enrollment.public_class)) fail('请先由工作人员核实客户参加公开课');
  var teacher=one('service_provider',enrollment.public_class.organizer_id,'id service_kind service_status can_accept_order');
  if (teacher.service_status!=='ACTIVE' || teacher.service_kind==='AGENT' || !teacher.can_accept_order) fail('负责老师暂未开放预约，请联系工作人员');
  var bookingFields='id requested_time confirmed_at status contact_name phone concerns';
  var firstKey='agent-first:'+referral.referred_account_id;
  var first=list('offline_appointment',eq('request_key',firstKey,'text'),bookingFields,1)[0];
  var history=list('offline_appointment',and(eq('customer_id',referral.referred_account_id),{_not:eq('status','CANCELED','text')}),'id',1);
  if (history.length && (!first || String(history[0].id)!==String(first.id))) fail('该客户已有咨询记录，不能再次预约首次免费咨询');
  if (op==='GET_AGENT_APPOINTMENT') result(s,{appointment:first || null,name:enrollment.registrant_name,phone:enrollment.phone});
  else if (first && first.status!=='CANCELED') result(s,{id:first.id,appointment:first});
  else {
    var requested=date(p.requestedTime,'期望咨询时间');
    if (new Date(requested).getTime()<=Date.now()) fail('请选择未来的咨询时间');
    var object={request_key:firstKey,customer_id:referral.referred_account_id,enrollment_id:enrollment.id,provider_id:teacher.id,requested_time:requested,contact_name:text(p.name || enrollment.registrant_name,'家长姓名',60,true),phone:phone(p.phone || enrollment.phone),concerns:text(p.concerns,'本次困扰',4000,true),status:'PENDING',staff_note:'代理代约 · 首次免费咨询'};
    if(first)update('offline_appointment',and(eq('id',first.id),eq('status','CANCELED','text')),object);
    else insert('offline_appointment',object,'offline_appointment_request_key');
    var saved=list('offline_appointment',eq('request_key',firstKey,'text'),bookingFields,1)[0];
    result(s,{id:saved.id,appointment:saved});
  }
}
