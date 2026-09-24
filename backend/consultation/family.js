// Included in the classes node. Identity and all dates come from the server.
var CHILD_ISSUES=['学习动力','情绪管理','亲子沟通','手机与网络','同伴关系','作息习惯','自信与自我认同','规则与责任','其他'];
var INTAKE_FIELDS='id customer_id public_class_id status child_name child_gender child_age child_grade child_economic_source child_issues child_description child_daily_behavior guardian_name guardian_phone guardian_consent_at child_submitted_at feedback_status feedback_confirmed_at feedback_available_at feedback_revision feedback_reviewer_id public_class { id title organizer_id }';
function activeReferrer(value) {
  var r=list('service_provider',and(eq('account_id',id(value)),eq('service_status','ACTIVE','text')),'id account_id display_name service_kind can_accept_order',1)[0];
  if(!r||!(r.service_kind==='AGENT'||r.service_kind!=='AGENT'&&r.can_accept_order===true))fail('推荐人暂不具备邀请权限');
  return r;
}
function intake(value, staffOnly) {
  login(s);var r=one('public_class_enrollment',value,INTAKE_FIELDS);
  var owner=String(r.customer_id)===String(s.actor.accountId);
  var reviewer=!!s.actor.canReply&&!!s.actor.providerId&&r.public_class&&String(r.public_class.organizer_id)===String(s.actor.providerId);
  if(staffOnly?!reviewer:!(owner||reviewer))fail('不能访问其他客户的孩子资料');
  return {row:r,owner:owner,reviewer:reviewer};
}
function released(r) {
  var confirmed=new Date(r.feedback_confirmed_at).getTime(),available=new Date(r.feedback_available_at).getTime();
  return r.feedback_status==='CONFIRMED'&&!!r.feedback_confirmed_at&&!!r.feedback_available_at&&isFinite(confirmed)&&isFinite(available)&&available>=confirmed&&Date.now()>=available;
}
function intakeView(access) {
  var r=access.row,v=Object.assign({},r);v.canReview=access.reviewer;v.canViewFeedback=released(r);v.serverNow=new Date().toISOString();
  // Do not even query the feedback body for a waiting customer.
  if(access.reviewer||v.canViewFeedback)v.feedback_content=one('public_class_enrollment',r.id,'id feedback_content').feedback_content||'';
  if(!access.reviewer&&!v.canViewFeedback)delete v.feedback_content;
  delete v.feedback_reviewer_id;return v;
}
if(op==='REFERRAL_CANDIDATE') {
  var candidate=activeReferrer(p.referrerId);result(s,{name:candidate.display_name||'推荐人'});
}
if(op==='GET_QUESTIONNAIRE') {
  var products=list('public_class',and(eq('product_kind','QUESTIONNAIRE','text'),eq('status','PUBLISHED','text')),CLASS_FIELDS,2);
  if(products.length!==1)fail('简易方案梳理暂未开放');
  var product=products[0],own=s.actor.accountId?list('public_class_enrollment',and(eq('public_class_id',product.id),eq('customer_id',s.actor.accountId),eq('status','REGISTERED','text')),INTAKE_FIELDS,1)[0]:null;
  var inviter=null;
  if(!own){if(!p.referrerId)fail('请使用管理或代理发出的问卷二维码进入');inviter=activeReferrer(p.referrerId);}
  result(s,{offer:{id:product.id,title:'简易方案梳理',subtitle:'2026问卷梳理',price:Number(product.registration_fee||0),description:product.description||'',inviterName:inviter&&inviter.display_name||''},enrollment:own?intakeView({row:own,owner:true,reviewer:false}):null,issues:CHILD_ISSUES});
}
if(op==='FAMILY_OVERVIEW') {
  login(s);result(s,{accountId:String(s.actor.accountId),role:s.actor.canAccept?'MANAGER':s.actor.agentId?'AGENT':'CUSTOMER',canInvite:!!s.actor.canInvite,canReview:!!s.actor.canReply,issues:CHILD_ISSUES,binding:list('course_referral',eq('referred_account_id',s.actor.accountId),'id locked_at referrer { id username wechat_nickname }',1)[0]||null,enrollments:paged('public_class_enrollment',eq('customer_id',s.actor.accountId),INTAKE_FIELDS)});
}
if(op==='LIST_AGENTS') {
  staff(s,'canAccept');result(s,paged('service_provider',eq('service_kind','AGENT','text'),'id account_id display_name service_status'));
}
if(op==='SET_AGENT') {
  staff(s,'canAccept');var target=id(p.accountId);
  var account=gql('query CourseReferralAccount($where:account_bool_exp!){rows:account(where:$where,limit:1){id username wechat_nickname}}',{where:eq('id',target)}).rows[0];
  if(!account)fail('账号不存在，请让对方先登录并提供账号编号');
  var current=list('service_provider',eq('account_id',target),'id service_kind',1)[0];
  if(current&&current.service_kind!=='AGENT')fail('工作人员身份不能改为代理');
  if(typeof p.active!=='boolean')fail('代理状态无效');
  var values={account_id:target,display_name:text(account.wechat_nickname||account.username,'代理名称',80,true),service_kind:'AGENT',service_status:p.active?'ACTIVE':'DISABLED',can_reply:false,can_accept_order:false};
  // Dedicated guarded writes: general service table helpers still prohibit provider writes.
  if(current) {
    var changed=gql('mutation UpdateDesignatedAgent($where:service_provider_bool_exp!,$object:service_provider_set_input!){saved: update_service_provider(where:$where,_set:$object){affected_rows returning{id}}}',{where:and(eq('id',current.id),eq('service_kind','AGENT','text')),object:values}).saved;
    if(changed.affected_rows!==1)fail('身份已变化，请刷新');
  } else {
    if(!p.active)fail('该账号尚未成为代理');
    var added=gql('mutation InsertDesignatedAgent($object:service_provider_insert_input!){saved: insert_service_provider(objects:[$object],on_conflict:{constraint:service_provider_account_id_key,update_columns:[]}){affected_rows returning{id}}}',{object:values}).saved;
    if(added.affected_rows!==1)fail('身份已变化，请刷新');
  }
  result(s,{accountId:String(target),active:p.active});
}
if(op==='GET_CHILD_INTAKE')result(s,{intake:intakeView(intake(p.enrollmentId,false)),issues:CHILD_ISSUES});
if(op==='SUBMIT_CHILD_INTAKE') {
  var a=intake(p.enrollmentId,false),r=a.row;
  if(!a.owner)fail('仅家长本人可以提交孩子资料');
  if(r.status!=='REGISTERED')fail('请先完成公开课报名');
  if(r.child_submitted_at)fail('孩子资料已提交，请等待工作人员整理');
  var issues=p.issues;
  if(!Array.isArray(issues)||issues.length!==2||issues[0]===issues[1]||issues.some(function(x){return CHILD_ISSUES.indexOf(x)<0;}))fail('请选择最重要的两个问题');
  var age=Number(p.age);if(p.age==null||p.age===''||!Number.isInteger(age)||age<0||age>100)fail('孩子年龄无效');
  if(['男','女','不便透露'].indexOf(p.gender)<0)fail('请选择孩子性别');
  if(p.consent!==true)fail('请确认监护人同意提交资料');
  var now=new Date().toISOString();
  var values={child_name:text(p.name,'孩子姓名',60,true),child_gender:p.gender,child_age:age,child_grade:text(p.grade,'年级',60,true),child_economic_source:text(p.economicSource,'孩子经济来源',300,true),child_issues:issues,child_description:text(p.description,'问题描述',5000,false),child_daily_behavior:text(p.dailyBehavior,'日常表现',5000,true),guardian_name:text(p.guardianName,'家长姓名',60,true),guardian_phone:phone(p.guardianPhone),guardian_consent_at:now,child_submitted_at:now,feedback_status:'PENDING',feedback_revision:Number(r.feedback_revision||0)+1};
  update('public_class_enrollment',and(eq('id',r.id),eq('customer_id',s.actor.accountId),eq('status','REGISTERED','text'),eq('feedback_revision',Number(r.feedback_revision||0))),values);
  result(s,{intake:intakeView(intake(r.id,false))});
}
if(op==='STAFF_CHILD_INTAKES') {
  staff(s,'canReply');result(s,paged('public_class_enrollment',and({public_class:eq('organizer_id',s.actor.providerId)},{_or:[eq('feedback_status','PENDING','text'),eq('feedback_status','DRAFT','text'),eq('feedback_status','CONFIRMED','text')]}),'id child_name guardian_name child_submitted_at feedback_status feedback_available_at public_class { id title }'));
}
if(op==='SAVE_CHILD_FEEDBACK') {
  var a=intake(p.enrollmentId,true),r=a.row;
  if(!r.child_submitted_at)fail('家长尚未提交资料');
  if(r.feedback_status==='CONFIRMED')fail('回复已确认完成，不能重复确认或覆盖');
  if(p.revision==null||Number(p.revision)!==Number(r.feedback_revision||0))fail('反馈已更新，请刷新后重试');
  var confirmed=p.confirm===true,now=Date.now(),availableAt=null;
  if(confirmed){
    availableAt=new Date(p.availableAt).getTime();
    if(!p.availableAt||!isFinite(availableAt))fail('请选择家长可查看回复的时间');
    if(availableAt<now-300000)fail('家长可查看时间不能早于当前时间');
    if(availableAt>now+31536000000)fail('家长可查看时间不能超过一年');
    availableAt=Math.max(availableAt,now);
  }
  var values={feedback_content:text(p.content,'梳理反馈',20000,confirmed),feedback_status:confirmed?'CONFIRMED':'DRAFT',feedback_revision:Number(r.feedback_revision||0)+1,feedback_reviewer_id:s.actor.providerId};
  if(confirmed){values.feedback_confirmed_at=new Date(now).toISOString();values.feedback_available_at=new Date(availableAt).toISOString();}
  update('public_class_enrollment',and(eq('id',r.id),eq('feedback_revision',Number(r.feedback_revision||0)),eq('feedback_status',r.feedback_status,'text')),values);
  result(s,{intake:intakeView(intake(r.id,true))});
}
// Management may assign an unbound customer directly; existing ownership is immutable.
if(op==='BIND_CUSTOMER') {
  staff(s,'canAccept');var customerId=id(p.customerId),agent=activeReferrer(p.agentAccountId);
  if(agent.service_kind!=='AGENT')fail('请选择管理人员已指定的代理');
  if(String(customerId)===String(agent.account_id))fail('不能把代理自己绑定为客户');
  var customer=gql('query CourseReferralAccount($where:account_bool_exp!){rows:account(where:$where,limit:1){id}}',{where:eq('id',customerId)}).rows[0];
  if(!customer)fail('客户账号不存在，请先让客户登录');
  if(list('service_provider',and(eq('account_id',customerId),eq('service_status','ACTIVE','text')),'id',1).length)fail('只能将客户账号绑定给代理');
  var binding=list('course_referral',eq('referred_account_id',customerId),'id referrer_id referred_account_id locked_at source',1)[0];
  if(binding&&String(binding.referrer_id)!==String(agent.account_id))fail('该客户已有推荐人，不能改绑');
  if(!binding){
    insert('course_referral',{referrer_id:agent.account_id,referred_account_id:customerId,source:'MANAGER_ASSIGNED',locked_at:new Date().toISOString()},'course_referral_referred_account_id_key');
    binding=list('course_referral',eq('referred_account_id',customerId),'id referrer_id referred_account_id locked_at source',1)[0];
    if(!binding||String(binding.referrer_id)!==String(agent.account_id))fail('客户归属已确定，请刷新查看');
  }
  result(s,{binding:binding});
}
if(op==='MANAGED_CUSTOMER_REFERRAL') {
  staff(s,'canAccept');result(s,{binding:list('course_referral',eq('referred_account_id',id(p.customerId)),'id referrer_id referred_account_id locked_at source',1)[0]||null});
}
