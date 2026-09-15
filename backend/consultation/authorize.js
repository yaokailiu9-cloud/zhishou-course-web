var accountId = context.getArg("account_id");
var operation = text(context.getArg("operation"), "操作", 60, true);
var payload = context.getArg("payload") || {};
if (typeof payload === "string") payload = JSON.parse(payload);
if (!payload || Array.isArray(payload) || typeof payload !== "object" || JSON.stringify(payload).length > 100000) fail("请求格式无效");
var actor = {accountId: accountId ? id(accountId) : null, providerId: null, canReply: false, canAccept: false};
if (actor.accountId) {
  var provider = list("service_provider", and(eq("account_id", actor.accountId), eq("service_status", "ACTIVE", "text")), "id can_reply can_accept_order", 1)[0];
  if (provider) { actor.providerId = provider.id; actor.canReply = provider.can_reply === true; actor.canAccept = provider.can_accept_order === true; }
}
var state = {operation:operation, payload:payload, actor:actor, result:null};
if (operation === "CHECK_USERNAME") {
  login(state);
  var name = text(payload.name, "用户名", 80, true);
  // Exclude only the authenticated actor, never an account supplied by the client.
  var where = and({_not:eq("id", actor.accountId)}, {_or:[eq("username",name,"text"), {account_profile:eq("user_name",name,"text")}]});
  var matches = gql("query CheckServiceUsername($where:account_bool_exp!){matches:account(where:$where,limit:1){id}}", {where:where}).matches;
  if (!Array.isArray(matches)) fail("用户名校验失败，请重试");
  result(state, {available:matches.length === 0});
}
context.setReturn("state", state);
