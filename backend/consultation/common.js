// Shared by the small, sequential Zion code nodes. All identifiers below are verified schema names.
function fail(message) { throw new Error(message); }
function text(value, label, max, required) {
  var s = String(value == null ? "" : value).trim();
  if ((required && !s) || s.length > max) fail(label + "填写不完整或过长");
  return s;
}
function id(value) { var s = String(value || ""); if (!/^[1-9][0-9]*$/.test(s) || !Number.isSafeInteger(Number(s))) fail("记录编号无效"); return Number(s); }
function eq(column, value, type) { var x = {}; x[(type || "bigint") + "_operand"] = { left_operand: {column: column}, right_operand: {literal: value} }; return {_eq: x}; }
function and() { return {_and: Array.prototype.slice.call(arguments)}; }
function compare(operator, column, value, type) { var w=eq(column,value,type), r={}; r[operator]=operator==='_ilike'?w._eq.text_operand:w._eq; return r; }
function countRows(table, where) {
  assertTable(table,false);
  return Number(gql('query ServiceCount($where: '+table+'_bool_exp!) { rows: '+table+'_aggregate(where:$where) { aggregate { count } } }',{where:where}).rows.aggregate.count);
}
function gql(query, vars) {
  var operation = query.match(/^(?:query|mutation)\s+(\w+)/);
  if (!operation) fail("查询缺少操作名称");
  var r = context.runGql(operation[1], query, vars || {}, {role: "admin"});
  if (typeof r === "string") r = JSON.parse(r);
  if (r.errors) fail("数据保存失败，请重试");
  return r.data || r;
}
var SERVICE_TABLES = ["public_class", "public_class_enrollment", "course_referral", "offline_appointment", "offline_consultation_record", "consultation_feedback", "consultation_feedback_reply", "consultation_summary_job", "service_provider", "consultation_session", "consultation_message", "fz_conversation", "fz_message", "fz_message_content"];
function assertTable(table, write) {
  if (SERVICE_TABLES.indexOf(table) < 0 || (write && ["service_provider", "consultation_session", "consultation_message", "fz_conversation", "fz_message", "fz_message_content"].indexOf(table) >= 0)) fail("不允许访问该数据对象");
}
function list(table, where, fields, limit) {
  assertTable(table, false);
  if (!where || typeof where !== "object") fail("查询缺少范围");
  if (limit && (limit < 1 || limit > 501)) fail("查询数量无效");
  return gql("query ServiceRows($where: " + table + "_bool_exp!) { rows: " + table + "(where: $where, order_by: {id: desc}, limit: " + (limit || 100) + ") { " + fields + " } }", {where: where}).rows || [];
}
// Seek pagination preserves the existing owner/staff scope on every request.
function pageRows(table, where, fields, cursor, size, paginate) {
  if(!paginate)return {items:list(table,where,fields,size),nextCursor:null};
  var limit=20;
  var scoped=cursor ? and(where,compare('_lt','id',id(cursor))) : where;
  var rows=list(table,scoped,fields,limit+1),more=rows.length>limit;
  rows=rows.slice(0,limit);
  return {items:rows,nextCursor:more?String(rows[rows.length-1].id):null};
}
function one(table, value, fields) {
  var r = list(table, eq("id", id(value)), fields, 1)[0];
  if (!r) fail("记录不存在或已不可用");
  return r;
}
function insert(table, object, constraint) {
  assertTable(table, true);
  var conflict = constraint ? ", on_conflict: {constraint: " + constraint + ", update_columns: []}" : "";
  var r = gql("mutation ServiceInsert($object: " + table + "_insert_input!) { saved: insert_" + table + "(objects: [$object]" + conflict + ") { returning { id } affected_rows } }", {object: object}).saved;
  return r.returning && r.returning[0] ? r.returning[0].id : null;
}
function update(table, where, object) {
  assertTable(table, true);
  function containsId(w) { return !!(w && ((w._eq && w._eq.bigint_operand && w._eq.bigint_operand.left_operand.column === "id" && Number(w._eq.bigint_operand.right_operand.literal) > 0) || (w._and && w._and.some(containsId)))); }
  if (!containsId(where)) fail("修改必须限定单条记录");
  var r = gql("mutation ServiceUpdate($where: " + table + "_bool_exp!, $object: " + table + "_set_input!) { saved: update_" + table + "(where: $where, _set: $object) { affected_rows returning { id } } }", {where: where, object: object}).saved;
  if (!r.affected_rows) fail("状态已变化，请刷新后重试");
  return r.returning[0].id;
}
function login(s) { if (!s.actor.accountId) fail("请先微信登录"); }
function staff(s, capability) { login(s); if (!s.actor.providerId || !s.actor[capability || "canReply"]) fail("当前账号没有这项工作人员权限"); }
function requestKey(s, prefix) { return prefix + ":" + s.actor.accountId + ":" + text(s.payload.requestKey, "请求标识", 100, true); }
function phone(v) { var s = String(v || "").trim(); if (!/^1[3-9][0-9]{9}$/.test(s)) fail("请填写有效的11位手机号"); return s; }
function date(v, label) { var d = new Date(v); if (!v || isNaN(d.getTime())) fail(label + "无效"); return d.toISOString(); }
function result(s, data) { s.result = {ok: true, data: data}; }
var CLASS_FIELDS = "id title description starts_at status group_guide signup_url group_qr { id url } organizer_id cover { id url } city contact_phone notice capacity reserved_count revision registration_closes_at checkin_closes_at share_code { id url }";
var ENROLL_FIELDS = "id created_at registrant_name phone status attendance_status group_status verified_at customer_id public_class_id verified_by_id entry_code checkin_method canceled_at public_class { " + CLASS_FIELDS + " }";
var APPOINTMENT_FIELDS = "id created_at requested_time confirmed_at status contact_name phone concerns child_info staff_note completed_at provider_id customer_id enrollment_id provider { id display_name }";
var RECORD_FIELDS = "id appointment_id author_id summary advice status confirmed_at updated_at";
var FEEDBACK_FIELDS = "id created_at appointment_id author_id advice_key content status replies { id content created_at author { display_name } }";
function appointment(s, value, mode) {
  login(s); var a = one("offline_appointment", value, APPOINTMENT_FIELDS);
  var own = String(a.customer_id) === String(s.actor.accountId);
  var assigned = String(a.provider_id) === String(s.actor.providerId) && !!s.actor.providerId;
  if (mode === "owner" ? !own : mode === "staff" ? !assigned : !(own || assigned)) fail("不能访问其他客户的咨询资料");
  return a;
}
function getState() { var s = context.getArg("state"); if (typeof s === "string") s = JSON.parse(s); return s; }
var JOB_FIELDS="id created_at updated_at appointment_id requester_id source status transcript draft error_message recording_id consented_at conversation_ref source_range";
function refreshSummaryJob(job) {
  if(["QUEUED","PROCESSING","AUDIO_PROCESSING"].indexOf(job.status)<0) return job;
  if (job.status==="AUDIO_PROCESSING" && job.conversation_ref) {
    var conv=one("fz_conversation",job.conversation_ref,"id status error_message");
    if(conv.status==="COMPLETED") {
      var messages=list("fz_message",eq("conversation_id",conv.id),"id role",20);
      var answer=messages.filter(function(m){return String(m.role).toLowerCase()==="assistant";})[0];
      if(answer) {
        var parts=list("fz_message_content",eq("message_id",answer.id),"id text type",100).reverse();
        var draft=parts.map(function(c){return c.text||"";}).join("\n").trim();
        if(draft && draft!=="等待录音。") {
          var failed=/无法读取音频|无法读取附件|未收到.*音频/.test(draft);
          update("consultation_summary_job",eq("id",job.id),{status:failed?"FAILED":"READY",draft:failed?null:draft,transcript:failed?null:draft,error_message:failed?"音频未能识别，请重试或由老师手动整理。":null});
          return one("consultation_summary_job",job.id,JOB_FIELDS);
        }
      }
    } else if(conv.error_message || ["FAILED","ERROR","STOPPED"].indexOf(conv.status)>=0) {
      update("consultation_summary_job",eq("id",job.id),{status:"FAILED",error_message:"录音处理未完成，请重试或由老师手动整理。"});return one("consultation_summary_job",job.id,JOB_FIELDS);
    }
  }
  if(Date.now()-new Date(job.updated_at||job.created_at).getTime()>900000) {
    update("consultation_summary_job",eq("id",job.id),{status:"FAILED",error_message:"处理超时，请重试。已有沟通记录仍保留。"});return one("consultation_summary_job",job.id,JOB_FIELDS);
  }
  return job;
}
