// Paid follow-up package: after the agent-booked free consultation has produced a child archive,
// the parent buys 5 sessions (public_class.product_kind = CONSULT_PACKAGE, paid through the course
// payment flow) and books each session here. Every booking waits for the supervisor to confirm.
var PACKAGE_SESSIONS=5,PACKAGE_UNIT_PRICE=1000;
function packageProduct(){
  var rows=list('public_class',and(eq('product_kind','CONSULT_PACKAGE','text'),eq('status','PUBLISHED','text')),CLASS_FIELDS,2);
  return rows.length===1?rows[0]:null;
}
// The first consultation has taken place and its archive exists; returns the latest archived appointment.
function archivedConsultation(accountId){
  var held={_or:[eq('status','COMPLETED','text'),and(eq('status','CONFIRMED','text'),compare('_lt','confirmed_at',new Date().toISOString(),'timestamptz'))]};
  return list('offline_appointment',and(eq('customer_id',accountId),held),'id enrollment_id child_info contact_name phone',50).filter(function(a){
    return !!a.enrollment_id&&!!a.child_info&&typeof a.child_info==='object'&&!Array.isArray(a.child_info);
  })[0]||null;
}
function ownedPackage(accountId,product){
  return product?list('public_class_enrollment',and(eq('customer_id',accountId),eq('public_class_id',product.id),eq('status','REGISTERED','text')),'id created_at',1)[0]||null:null;
}
// Each PAID order of the package adds 5 sessions to the same entitlement.
function packageTotal(accountId,product){return PACKAGE_SESSIONS*list('course_registration_order',and(eq('customer_id',accountId),eq('public_class_id',product.id),eq('status','PAID','text')),'id',500).length;}
// Sessions are keyed package:<package enrollment>:<n>; the unique request_key prevents overbooking.
function packageBookings(pkg){return list('offline_appointment',compare('_ilike','request_key','package:'+pkg.id+':%','text'),'id request_key status',501);}
if (op === 'GET_PACKAGE') {
  login(s);var product=packageProduct(),archived=archivedConsultation(s.actor.accountId),pkg=ownedPackage(s.actor.accountId,product);
  var active=pkg?packageBookings(pkg).filter(function(a){return a.status!=='CANCELED';}):[],total=pkg?packageTotal(s.actor.accountId,product):0;
  result(s,{offer:product?{id:product.id,title:product.title,price:Number(product.registration_fee||0),sessions:PACKAGE_SESSIONS,unitPrice:PACKAGE_UNIT_PRICE}:null,eligible:!!archived,
    package:pkg?{id:pkg.id,total:total,used:active.length,remaining:Math.max(0,total-active.length),hasPending:active.some(function(a){return a.status==='PENDING';})}:null,
    defaults:archived?{name:archived.contact_name||'',phone:archived.phone||''}:null});
}
if (op === 'CREATE_APPOINTMENT') {
  login(s);var product=packageProduct(),pkg=ownedPackage(s.actor.accountId,product),total=pkg?packageTotal(s.actor.accountId,product):0;
  if (!pkg||!total) fail('请先购买5次咨询后再预约');
  var archived=archivedConsultation(s.actor.accountId);
  if (!archived) fail('首次咨询建立档案后才能预约后续咨询');
  var booked=packageBookings(pkg),active=booked.filter(function(a){return a.status!=='CANCELED';});
  if (active.some(function(a){return a.status==='PENDING';})) fail('已有待确认的预约，请等咨询主管确认后再预约下一次');
  if (active.length>=total) fail('已购咨询已全部预约，可以再购买5次咨询');
  var slot=0;
  for (var n=1;n<=total&&!slot;n++) if (!active.some(function(a){return a.request_key==='package:'+pkg.id+':'+n;})) slot=n;
  var key='package:'+pkg.id+':'+slot,reuse=booked.filter(function(a){return a.request_key===key;})[0];
  var requested=date(p.requestedTime,'期望咨询时间');
  if (new Date(requested).getTime()<=Date.now()) fail('请选择未来的咨询时间');
  // enrollment_id keeps pointing at the verified public class so the existing confirmation check applies.
  var object={request_key:key,customer_id:s.actor.accountId,enrollment_id:archived.enrollment_id,provider_id:consultationSupervisor().id,requested_time:requested,contact_name:text(p.name||archived.contact_name,'家长姓名',60,true),phone:phone(p.phone||archived.phone),concerns:text(p.concerns,'本次困扰',4000,true),status:'PENDING',child_info:archived.child_info,staff_note:'5次咨询 · 第'+slot+'次',confirmed_at:null,completed_at:null};
  if (reuse) update('offline_appointment',and(eq('id',reuse.id),eq('status','CANCELED','text')),object);
  else insert('offline_appointment',object,'offline_appointment_request_key');
  var saved=list('offline_appointment',eq('request_key',key,'text'),'id status',1)[0];
  if (!saved||saved.status!=='PENDING') fail('预约状态已变化，请刷新后重试');
  result(s,{id:saved.id});
}
