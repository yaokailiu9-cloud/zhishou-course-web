var accountId = context.getArg("account_id");
var operation = text(context.getArg("operation"), "操作", 60, true);
var payload = context.getArg("payload") || {};
if (typeof payload === "string") payload = JSON.parse(payload);
if (!payload || Array.isArray(payload) || typeof payload !== "object" || JSON.stringify(payload).length > 100000) fail("请求格式无效");
var actor = {accountId: accountId ? id(accountId) : null, providerId: null, serviceKind: "", canReply: false, canAccept: false};
if (actor.accountId) {
  var provider = list("service_provider", and(eq("account_id", actor.accountId), eq("service_status", "ACTIVE", "text")), "id service_kind can_reply can_accept_order", 1)[0];
  if (provider) { actor.providerId = provider.id; actor.serviceKind = provider.service_kind || "STAFF"; actor.canReply = provider.can_reply === true; actor.canAccept = provider.can_accept_order === true; }
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
function requireManager() {
  login(state);
  if (!actor.providerId || actor.serviceKind !== "STAFF" || !actor.canReply || !actor.canAccept) fail("只有管理人员可以修改身份");
}
function businessIdentity(item) {
  var linked = item && item.service_provider;
  if (!linked || linked.service_status !== "ACTIVE") return "USER";
  return linked.service_kind === "AGENT" ? "AGENT" : "MANAGER";
}
function accountDisplayName(item) {
  var profile = item.account_profile || {};
  return profile.user_name || item.wechat_nickname || item.username || ("用户" + item.id);
}
if (operation === "LIST_ACCOUNT_IDENTITIES") {
  requireManager();
  var accounts = gql("query ListAccountIdentities { accounts: account(where:{fz_deleted:{_eq:false}},order_by:{id:desc},limit:100){id username wechat_nickname wechat_avatar_url user_type account_profile{user_name avatar_url avatar_image{id url}} service_provider{id service_kind service_status can_reply can_accept_order}}}", {}).accounts || [];
  result(state, {items:accounts.map(function(item){
    var profile=item.account_profile||{}, image=profile.avatar_image||{};
    return {id:item.id,name:accountDisplayName(item),avatarUrl:image.url||profile.avatar_url||item.wechat_avatar_url||"",identity:businessIdentity(item),isSelf:String(item.id)===String(actor.accountId)};
  })});
}
if (operation === "SET_ACCOUNT_IDENTITY") {
  requireManager();
  var targetId=id(payload.targetAccountId), next=text(payload.identity,"身份",20,true).toUpperCase();
  if (["MANAGER","AGENT","USER"].indexOf(next)<0) fail("身份选项无效");
  if (String(targetId)===String(actor.accountId)) fail("不能在此处修改自己的管理身份");
  var target=(gql("query IdentityTarget($id:bigint!){account_by_pk(id:$id){id username wechat_nickname user_type account_profile{user_name} service_provider{id service_kind service_status}}}",{id:targetId}).account_by_pk);
  if(!target)fail("目标用户不存在");
  var previous=businessIdentity(target);
  if(previous===next){result(state,{id:target.id,name:accountDisplayName(target),identity:next,unchanged:true});}
  else {
    var accountData={user_type:next==="MANAGER"?"manager":next==="AGENT"?"agent":"customer"};
    var providerData={service_status:next==="USER"?"INACTIVE":"ACTIVE",service_kind:next==="AGENT"?"AGENT":"STAFF",can_reply:next==="MANAGER",can_accept_order:next==="MANAGER"};
    if(next!=="USER")providerData.verified=true;
    var log={old_identity:previous,new_identity:next,change_note:text(payload.note,"变更备注",300,false),operator_account_id:actor.accountId,target_account_id:targetId};
    var saved;
    if(target.service_provider){
      saved=gql("mutation ChangeExistingIdentity($accountId:bigint!,$providerId:bigint!,$accountData:account_set_input!,$providerData:service_provider_set_input!,$log:identity_change_log_insert_input!){account:update_account_by_pk(pk_columns:{id:$accountId},_set:$accountData){id} provider:update_service_provider_by_pk(pk_columns:{id:$providerId},_set:$providerData){id} audit:insert_identity_change_log_one(object:$log){id created_at}}",{accountId:targetId,providerId:target.service_provider.id,accountData:accountData,providerData:providerData,log:log});
    } else {
      providerData.account_id=targetId;providerData.display_name=accountDisplayName(target);providerData.title=next==="MANAGER"?"情感咨询经理":"课程代理";providerData.online_status="offline";providerData.rating=0;providerData.price_per_hour=0;providerData.service_minutes=60;providerData.today_waiting_count=0;providerData.active_session_count=0;providerData.today_income=0;providerData.total_income=0;
      saved=gql("mutation CreateIdentity($accountId:bigint!,$accountData:account_set_input!,$providerData:service_provider_insert_input!,$log:identity_change_log_insert_input!){account:update_account_by_pk(pk_columns:{id:$accountId},_set:$accountData){id} provider:insert_service_provider_one(object:$providerData){id} audit:insert_identity_change_log_one(object:$log){id created_at}}",{accountId:targetId,accountData:accountData,providerData:providerData,log:log});
    }
    if(!saved.account||!saved.provider||!saved.audit)fail("身份保存失败，请重试");
    result(state,{id:target.id,name:accountDisplayName(target),identity:next,unchanged:false});
  }
}
context.setReturn("state", state);
