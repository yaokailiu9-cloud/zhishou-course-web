// Course viewing grants: a manager opens one course to one account for 24 or 48 hours, timed from the grant.
// Parents only learn whether they can watch now; grant and expiry times are returned to managers only.
if (op.indexOf('COURSE_VIEW_') === 0) {
  SERVICE_TABLES.push('course_view_grant');
  var viewManager = !!(s.actor.providerId && s.actor.serviceKind === 'STAFF' && s.actor.canReply && s.actor.canAccept);
  var viewStaff = !!s.actor.providerId;
  var VIEW_ACCOUNT_FIELDS = 'id username wechat_nickname account_profile { user_name }';
  var VIEW_GRANT_FIELDS = 'id created_at duration_hours expires_at revoked_at course_id viewer_id course { id title } viewer { ' + VIEW_ACCOUNT_FIELDS + ' } granted_by { ' + VIEW_ACCOUNT_FIELDS + ' }';
  function viewName(a) { return a ? ((a.account_profile || {}).user_name || a.wechat_nickname || a.username || ('用户' + a.id)) : ''; }
  function viewActive(g) { return !g.revoked_at && new Date(g.expires_at).getTime() > Date.now(); }
  function viewRequireManager() { login(s); if (!viewManager) fail('只有管理人员可以开通课程观看'); }
  function viewCourse(value) {
    var c = gql('query CourseViewCourse($id:bigint!){course_by_pk(id:$id){id title enabled}}', {id:id(value)}).course_by_pk;
    if (!c) fail('课程不存在或已下架');
    return c;
  }
  function viewGrantView(g) {
    return {id:g.id, courseId:String(g.course_id), courseTitle:(g.course || {}).title || '课程', viewerId:String(g.viewer_id), viewerName:viewName(g.viewer), grantedByName:viewName(g.granted_by), durationHours:g.duration_hours, grantedAt:g.created_at, expiresAt:g.expires_at, revokedAt:g.revoked_at || null, status:g.revoked_at ? 'REVOKED' : viewActive(g) ? 'ACTIVE' : 'EXPIRED'};
  }
  if (op === 'COURSE_VIEW_ACCESS') {
    var course = viewCourse(p.courseId);
    var lessons = gql('query CourseViewLessons($where:course_lesson_bool_exp!){rows:course_lesson(where:$where,order_by:{sort_order:asc},limit:100){id video_url video{id url}}}', {where:eq('course_id', course.id)}).rows || [];
    var canWatch = viewStaff, reason = '';
    if (!s.actor.accountId) reason = 'LOGIN';
    else if (!viewStaff) {
      var grants = list('course_view_grant', and(eq('viewer_id', s.actor.accountId), eq('course_id', course.id)), 'id expires_at revoked_at', 50);
      canWatch = grants.some(viewActive);
      reason = canWatch ? '' : grants.length ? 'ENDED' : 'NOT_GRANTED';
    }
    result(s, {canWatch:canWatch, reason:reason, lessons:lessons.map(function(l) {
      var url = (l.video && l.video.url) || l.video_url || '';
      return {id:String(l.id), hasVideo:!!url, videoUrl:canWatch ? url : ''};
    })});
  }
  if (op === 'COURSE_VIEW_ADMIN') {
    viewRequireManager();
    var courses = gql('query CourseViewCourses{rows:course(order_by:{sort_order:asc},limit:200){id title enabled course_lesson(limit:100){id video_url video{id}}}}', {}).rows || [];
    var page = pageRows('course_view_grant', {}, VIEW_GRANT_FIELDS, p.cursor, 20, true);
    result(s, {courses:courses.map(function(c) { return {id:String(c.id), title:c.title, enabled:c.enabled !== false, hasVideo:(c.course_lesson || []).some(function(l) { return !!(l.video || l.video_url); })}; }), grants:page.items.map(viewGrantView), nextCursor:page.nextCursor});
  }
  if (op === 'COURSE_VIEW_CANDIDATES') {
    viewRequireManager();
    var keyword = text(p.keyword, '搜索内容', 40, false).replace(/[%_\\]/g, '');
    var where = eq('fz_deleted', false, 'boolean');
    if (keyword) {
      var like = function(column) { return compare('_ilike', column, '%' + keyword + '%', 'text'); };
      where = and(where, {_or:[like('username'), like('wechat_nickname'), like('fz_phone_number'), {account_profile:like('user_name')}, {account_profile:like('phone')}]});
    }
    var accounts = gql('query CourseViewCandidates($where:account_bool_exp!){rows:account(where:$where,order_by:{id:desc},limit:30){' + VIEW_ACCOUNT_FIELDS + ' fz_phone_number account_profile { phone } service_provider { service_status service_kind }}}', {where:where}).rows || [];
    result(s, {items:accounts.map(function(a) {
      var phoneText = String(a.fz_phone_number || (a.account_profile || {}).phone || '');
      var provider = a.service_provider && a.service_provider.service_status === 'ACTIVE' ? a.service_provider : null;
      return {id:String(a.id), name:viewName(a), phoneTail:phoneText.length >= 4 ? phoneText.slice(-4) : '', staff:!!provider};
    })});
  }
  if (op === 'COURSE_VIEW_GRANT') {
    viewRequireManager();
    var hours = Number(p.hours);
    if ([24, 48].indexOf(hours) < 0) fail('观看时长只能选择1天或2天');
    var target = gql('query CourseViewTarget($id:bigint!){account_by_pk(id:$id){id fz_deleted}}', {id:id(p.viewerAccountId)}).account_by_pk;
    if (!target || target.fz_deleted) fail('家长账号不存在或已停用');
    var grantCourse = viewCourse(p.courseId), key = requestKey(s, 'course-view');
    insert('course_view_grant', {viewer_id:target.id, course_id:grantCourse.id, granted_by_id:s.actor.accountId, duration_hours:hours, expires_at:new Date(Date.now() + hours * 3600000).toISOString(), request_key:key}, 'course_view_grant_request_key_key');
    var saved = list('course_view_grant', eq('request_key', key, 'text'), VIEW_GRANT_FIELDS, 1)[0];
    if (!saved) fail('开通未完成，请重试');
    result(s, {grant:viewGrantView(saved)});
  }
  if (op === 'COURSE_VIEW_REVOKE') {
    viewRequireManager();
    var grant = one('course_view_grant', p.grantId, VIEW_GRANT_FIELDS);
    if (!grant.revoked_at) { update('course_view_grant', eq('id', grant.id), {revoked_at:new Date().toISOString()}); grant = one('course_view_grant', grant.id, VIEW_GRANT_FIELDS); }
    result(s, {grant:viewGrantView(grant)});
  }
}
