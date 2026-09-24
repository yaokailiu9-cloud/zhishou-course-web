// Runs after authorize.js in the authenticated node. Only this course's assignment grants access.
if (operation.indexOf('CHECKIN_') === 0) {
  login(state);
  SERVICE_TABLES.push('class_checkin_staff');
  var isCheckinManager = actor.serviceKind === 'STAFF' && !!actor.providerId && actor.canReply && actor.canAccept;
  var CHECKIN_CLASS_FIELDS = 'id title starts_at status checkin_closes_at organizer_id';
  var CHECKIN_ENROLL_FIELDS = 'id registrant_name phone status attendance_status verified_at public_class_id checked_in_by_id';
  function checkinScope() {
    return isCheckinManager ? {} : {checkin_assignments:and(eq('staff_account_id',actor.accountId),eq('active',true,'boolean'))};
  }
  function checkinClass(value) {
    var c=list('public_class',and(eq('id',id(value)),checkinScope()),CHECKIN_CLASS_FIELDS,1)[0];
    if(!c)fail('没有本场课程的签到权限，请联系管理人员');
    return c;
  }
  function checkinStats(classId) {
    var scope=and(eq('public_class_id',classId),eq('status','REGISTERED','text'));
    var registered=countRows('public_class_enrollment',scope);
    var attended=countRows('public_class_enrollment',and(scope,eq('attendance_status','ATTENDED','text')));
    return {registered:registered,attended:attended,remaining:Math.max(0,registered-attended)};
  }
  function checkinPerson(e) {
    var phone=String(e.phone||'');
    // Keep phoneMasked during rollout so older check-in clients also display the full number.
    return {id:e.id,name:e.registrant_name,phone:phone,phoneMasked:phone,attendanceStatus:e.attendance_status,verifiedAt:e.verified_at};
  }
  function checkinPage(table,scope,fields) {
    if(payload.cursor)scope=and(scope,compare('_lt','id',id(payload.cursor)));
    var rows=list(table,scope,fields,21);
    return {items:rows.slice(0,20),nextCursor:rows.length>20?String(rows[19].id):null};
  }
  function checkinSearch(scope,columns) {
    var search=text(payload.search,'搜索',60,false);
    if(!search)return scope;
    var pattern='%'+search.replace(/[\\%_]/g,'\\$&')+'%';
    return and(scope,{_or:columns.map(function(column){return compare('_ilike',column,pattern,'text');})});
  }
  if(operation==='CHECKIN_ACCESS') {
    result(state,{allowed:isCheckinManager||list('class_checkin_staff',and(eq('staff_account_id',actor.accountId),eq('active',true,'boolean')),'id',1).length>0,isManager:isCheckinManager});
  }
  if(operation==='CHECKIN_CLASSES') {
    var classes=checkinPage('public_class',checkinSearch(checkinScope(),['title']),CHECKIN_CLASS_FIELDS);
    result(state,{items:classes.items,nextCursor:classes.nextCursor,isManager:isCheckinManager});
  }
  if(operation==='CHECKIN_ROSTER') {
    var c=checkinClass(payload.classId);
    var scope=and(eq('public_class_id',c.id),eq('status','REGISTERED','text'));
    if(payload.filter==='ATTENDED')scope=and(scope,eq('attendance_status','ATTENDED','text'));
    if(payload.filter==='REMAINING')scope=and(scope,{_not:eq('attendance_status','ATTENDED','text')});
    var page=checkinPage('public_class_enrollment',checkinSearch(scope,['registrant_name','phone']),CHECKIN_ENROLL_FIELDS);
    result(state,{classInfo:c,stats:checkinStats(c.id),items:page.items.map(checkinPerson),nextCursor:page.nextCursor,isManager:isCheckinManager});
  }
  if(operation==='CHECKIN_STAFF') {
    requireManager();var c=checkinClass(payload.classId);
    var assignments=list('class_checkin_staff',and(eq('public_class_id',c.id),eq('active',true,'boolean')),'id staff_account_id staff_account { id username wechat_nickname account_profile { user_name } }',500);
    result(state,{items:assignments.map(function(a){return {id:a.id,accountId:a.staff_account_id,name:accountDisplayName(a.staff_account||{id:a.staff_account_id})};})});
  }
  if(operation==='CHECKIN_CANDIDATES') {
    requireManager();
    var search=text(payload.search,'昵称或用户编号',60,true),scope;
    if(/^[1-9][0-9]*$/.test(search)&&Number.isSafeInteger(Number(search)))scope=eq('id',Number(search));
    else {var pattern='%'+search.replace(/[\\%_]/g,'\\$&')+'%';scope={_or:[compare('_ilike','wechat_nickname',pattern,'text'),compare('_ilike','username',pattern,'text'),{account_profile:compare('_ilike','user_name',pattern,'text')}]};}
    if(payload.cursor)scope=and(scope,compare('_lt','id',id(payload.cursor)));
    var candidates=gql('query CheckinCandidates($where:account_bool_exp!){rows:account(where:$where,order_by:{id:desc},limit:21){id username wechat_nickname account_profile{user_name}}}',{where:scope}).rows;
    result(state,{items:candidates.slice(0,20).map(function(a){return {id:a.id,name:accountDisplayName(a)};}),nextCursor:candidates.length>20?String(candidates[19].id):null});
  }
  if(operation==='CHECKIN_SET_STAFF') {
    requireManager();var c=checkinClass(payload.classId),target=id(payload.accountId);
    if(typeof payload.active!=='boolean')fail('请选择启用或取消签到权限');
    var account=gql('query CheckinAccount($id:bigint!){account_by_pk(id:$id){id}}',{id:target}).account_by_pk;
    if(!account)fail('用户不存在，请先让对方登录');
    var saved=gql('mutation SetCheckinStaff($object:class_checkin_staff_insert_input!){insert_class_checkin_staff_one(object:$object,on_conflict:{constraint:class_checkin_staff_class_account_key,update_columns:[active,assigned_by_id]}){id}}',{object:{public_class_id:c.id,staff_account_id:target,assigned_by_id:actor.accountId,active:payload.active}});
    if(!saved.insert_class_checkin_staff_one)fail('签到人员保存失败');
    result(state,{saved:true});
  }
  if(operation==='CHECKIN_LOOKUP'||operation==='CHECKIN_CONFIRM') {
    var c=checkinClass(payload.classId),code=text(payload.entryCode,'入场码',100,true).replace(/^EMPATH-ENTRY:/,'');
    if(!/^[A-Z2-9]{24}$/.test(code))fail('请扫描用户的个人入场二维码');
    var e=list('public_class_enrollment',and(eq('public_class_id',c.id),eq('entry_code',code,'text')),CHECKIN_ENROLL_FIELDS,1)[0];
    if(!e||e.status!=='REGISTERED')fail('入场码无效、已取消或不属于本场课程');
    var repeated=e.attendance_status==='ATTENDED';
    if(operation==='CHECKIN_CONFIRM'&&!repeated) {
      if(c.status==='DRAFT')fail('草稿课程不能签到');
      if(!c.starts_at||new Date(c.starts_at).getTime()-Date.now()>7200000)fail('本场签到在开课前两小时开放');
      if(c.checkin_closes_at&&new Date(c.checkin_closes_at).getTime()<Date.now())fail('本场签到时间已结束');
      if(!c.organizer_id)fail('本场尚未设置课程负责人');
      // Conditional write: simultaneous scans cannot overwrite the first operator or time.
      var written=gql('mutation ConfirmCourseCheckin($where:public_class_enrollment_bool_exp!,$changes:public_class_enrollment_set_input!){saved:update_public_class_enrollment(where:$where,_set:$changes){affected_rows}}',{where:and(eq('id',e.id),eq('status','REGISTERED','text'),{_not:eq('attendance_status','ATTENDED','text')}),changes:{attendance_status:'ATTENDED',verified_at:new Date().toISOString(),verified_by_id:c.organizer_id,checked_in_by_id:actor.accountId,checkin_method:'QR'}}).saved;
      e=one('public_class_enrollment',e.id,CHECKIN_ENROLL_FIELDS);
      if(e.status!=='REGISTERED'||e.attendance_status!=='ATTENDED')fail('报名状态已变化，请重新扫码');
      repeated=!written.affected_rows;
    }
    result(state,{enrollment:checkinPerson(e),alreadyCheckedIn:repeated,stats:checkinStats(c.id)});
  }
  context.setReturn('state',state);
}
