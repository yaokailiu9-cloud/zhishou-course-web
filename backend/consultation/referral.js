// Included after authorize.js; never trust client-supplied roles or account IDs.
var referralState = state, referralActor = referralState.actor, referralPayload = referralState.payload;
function referralManager() { return !!(referralActor.providerId && referralActor.serviceKind === 'STAFF' && referralActor.canReply && referralActor.canAccept); }
function referralName(account) { return account ? ((account.account_profile || {}).user_name || account.wechat_nickname || account.username || ('用户' + account.id)) : '未记录推荐人'; }
var REFERRAL_ACCOUNT_FIELDS = 'id username wechat_nickname account_profile { user_name }';
if (referralState.operation === 'REFERRAL_OVERVIEW') {
  var binding = referralActor.accountId ? list('course_referral', eq('referred_account_id', referralActor.accountId), 'id referrer_id referrer { ' + REFERRAL_ACCOUNT_FIELDS + ' }', 1)[0] : null;
  var candidate = null;
  if (!binding && referralPayload.referrerId && String(referralPayload.referrerId) !== String(referralActor.accountId)) {
    var inviter = list('service_provider', and(eq('account_id', id(referralPayload.referrerId)), eq('service_status', 'ACTIVE', 'text')), 'id account_id display_name service_kind can_accept_order', 1)[0];
    if (inviter && (inviter.service_kind === 'AGENT' || inviter.can_accept_order === true)) candidate = {name:inviter.display_name || '推荐人'};
  }
  var hasEnrollment = referralActor.accountId ? list('public_class_enrollment', eq('customer_id', referralActor.accountId), 'id', 1).length > 0 : false;
  result(referralState, {canInvite:!!referralActor.canInvite, isManager:referralManager(), binding:binding ? {name:referralName(binding.referrer)} : null, candidate:!hasEnrollment ? candidate : null, hasEnrollment:hasEnrollment});
}
if (referralState.operation === 'REFERRAL_CLIENTS') {
  login(referralState);
  if (!referralActor.canInvite) fail('当前账号没有查看推荐客户的权限');
  if (referralPayload.scope === 'all' && !referralManager()) fail('只有管理人员可以查看全部推荐客户');
  var scope = referralPayload.scope === 'all' ? {} : eq('referrer_id', referralActor.accountId);
  var total = countRows('course_referral', scope);
  var page = pageRows('course_referral', scope, 'id locked_at source referrer { ' + REFERRAL_ACCOUNT_FIELDS + ' } referred_account { ' + REFERRAL_ACCOUNT_FIELDS + ' public_class_enrollments(order_by:{id:desc},limit:20) { id registrant_name status attendance_status child_submitted_at public_class { id title product_kind } } }', referralPayload.cursor, 20, true);
  result(referralState, {total:total, nextCursor:page.nextCursor, items:page.items.map(function(row) {
    var customer = row.referred_account || {};
    return {id:row.id, customerName:referralName(customer), referrerName:referralName(row.referrer), lockedAt:row.locked_at, enrollments:(customer.public_class_enrollments || []).map(function(e) { return {id:e.id, name:e.registrant_name || referralName(customer), courseTitle:(e.public_class || {}).title || '课程', productKind:(e.public_class || {}).product_kind||'COURSE', submittedAt:e.child_submitted_at||null, status:e.status, attendanceStatus:e.attendance_status}; })};
  })});
}
context.setReturn('state', referralState);
