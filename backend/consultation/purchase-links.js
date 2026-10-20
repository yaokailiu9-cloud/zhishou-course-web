// Only the two verified management accounts may issue a private, recipient-bound 7-day link.
var PURCHASE_LINK_TTL=7*24*3600000;
function internalLinkIssuer(accountId){
 if(['1000000000000019','1000000000000021'].indexOf(String(accountId))<0)return null;
 var p=list('service_provider',and(eq('account_id',accountId),eq('service_kind','STAFF','text'),eq('service_status','ACTIVE','text')),'id account_id display_name can_reply can_accept_order',1)[0];
 return p&&p.can_reply===true&&p.can_accept_order===true?p:null;
}
function purchaseLinkKey(){return linkHmac(payKey(),'zhishou/internal-consultation-purchase-link/key/v1');}
function purchaseLinkOffer(c){return {id:c.id,title:c.title,price:Number(c.registration_fee||0),sessions:5,unitPrice:1000};}
function purchaseLinkProduct(){var rows=list('public_class',and(eq('product_kind','CONSULT_PACKAGE','text'),eq('status','PUBLISHED','text')),CLASS_FIELDS,2);if(rows.length!==1)fail('咨询套餐暂未开放缴费');return rows[0];}
function purchaseLinkAgent(value){
 return list('service_provider',and(eq('account_id',id(value)),eq('service_kind','AGENT','text'),eq('service_status','ACTIVE','text')),'id account_id display_name',1)[0]||null;
}
function purchaseLinkAgentView(agent){return agent?{accountId:String(agent.account_id),name:agent.display_name||('代理'+agent.account_id)}:null;}
function purchaseLinkCustomer(value){
 var a=gql('query PurchaseLinkCustomer($id:bigint!){account_by_pk(id:$id){id username wechat_nickname fz_deleted account_profile{user_name}}}',{id:id(value)}).account_by_pk;
 if(!a||a.fz_deleted===true||String(a.username||'').indexOf('wxh5_')!==0)fail('请选择已使用微信登录的收款对象');
 return a;
}
function purchaseLinkCustomerView(a){var bound=list('course_referral',eq('referred_account_id',a.id),'id referrer_id',1)[0];return {accountId:String(a.id),name:(a.account_profile||{}).user_name||a.wechat_nickname||('用户'+a.id),agentAccountId:bound?String(bound.referrer_id):''};}
function purchaseLinkBinding(customerId,grant){
 if(!grant)return;
 if(String(grant.customerAccountId)!==String(customerId))fail('此链接仅限指定微信账号使用，请使用收款对象的微信登录');
 purchaseLinkCustomer(customerId);
 if(String(customerId)===String(grant.agentAccountId))fail('不能通过缴费链接将自己绑定为自己的上级代理');
 var existing=list('course_referral',eq('referred_account_id',customerId),'id referrer_id',1)[0];
 if(existing&&String(existing.referrer_id)!==String(grant.agentAccountId))fail('该账号已有其他上级代理，请联系发链接的管理人员核对');
}
function purchaseLinkGrant(token,product){
 if(typeof token!=='string'||token.length>240)fail('缴费链接无效，请联系老师重新获取');
 var m=token.match(/^v2\.([1-9][0-9]*)\.([1-9][0-9]*)\.([1-9][0-9]*)\.([1-9][0-9]*)\.([1-9][0-9]*)\.([1-9][0-9]*)\.([0-9a-f]{64})$/);
 if(!m)fail('缴费链接已更新，请联系老师重新生成指定账号链接');
 var issued=Number(m[5]),expires=Number(m[6]),signature=m[7],now=Date.now(),message=token.slice(0,token.lastIndexOf('.'));
 if(!Number.isSafeInteger(issued)||!Number.isSafeInteger(expires)||expires-issued!==PURCHASE_LINK_TTL||issued>now+1000||!linkEqual(linkHmac(purchaseLinkKey(),message),signature))fail('缴费链接无效，请联系老师重新获取');
 if(expires<=now)fail('缴费链接已过期，请联系老师获取新链接');
 var issuer=internalLinkIssuer(m[1]);if(!issuer)fail('此缴费链接已停止使用，请联系老师');
 if(!product||product.product_kind!=='CONSULT_PACKAGE'||String(product.id)!==m[2])fail('缴费链接与咨询套餐不匹配');
 var agent=purchaseLinkAgent(m[3]);if(!agent)fail('链接指定的上级代理已停用，请联系发链接的管理人员');
 var grant={kind:'CONSULTATION_PURCHASE_LINK_V2',customerAccountId:m[4],issuerAccountId:String(issuer.account_id),issuerProviderId:issuer.id,productId:product.id,issuedAt:new Date(issued).toISOString(),expiresAt:new Date(expires).toISOString()};
 if(agent){grant.agentAccountId=String(agent.account_id);grant.agentProviderId=agent.id;grant.agentName=agent.display_name||('代理'+agent.account_id);}
 return grant;
}
if(op==='INTERNAL_PURCHASE_ACCESS'){login(s);result(s,{allowed:!!internalLinkIssuer(s.actor.accountId)});}
if(op==='PURCHASE_LINK_AGENTS'){
 login(s);if(!internalLinkIssuer(s.actor.accountId))fail('当前账号没有发放咨询缴费链接的权限');
 var agents=list('service_provider',and(eq('service_kind','AGENT','text'),eq('service_status','ACTIVE','text')),'id account_id display_name',501);
 result(s,{items:agents.map(purchaseLinkAgentView)});
}
if(op==='PURCHASE_LINK_CUSTOMERS'){
 login(s);if(!internalLinkIssuer(s.actor.accountId))fail('当前账号没有发放咨询缴费链接的权限');
 var search=text(p.search,'搜索内容',80,true),scope;
 if(/^[1-9][0-9]*$/.test(search))scope=eq('id',id(search));
 else {if(search.length<2)fail('请至少输入两个字或完整账号ID');var pattern='%'+search.replace(/[\\%_]/g,'\\$&')+'%';scope={_or:[compare('_ilike','wechat_nickname',pattern,'text'),{account_profile:compare('_ilike','user_name',pattern,'text')}]};}
 scope=and(scope,eq('fz_deleted',false,'boolean'),compare('_ilike','username','wxh5%' ,'text'));
 var rows=gql('query PurchaseLinkCustomers($where:account_bool_exp!){rows: account(where:$where,order_by:{id:desc},limit:21){id username wechat_nickname account_profile{user_name}}}',{where:scope}).rows||[];
 result(s,{items:rows.filter(function(a){return String(a.username||'').indexOf('wxh5_')===0;}).slice(0,20).map(purchaseLinkCustomerView),more:rows.length>20});
}
if(op==='CREATE_PURCHASE_LINK'){
 login(s);var issuer=internalLinkIssuer(s.actor.accountId);if(!issuer)fail('当前账号没有发放咨询缴费链接的权限');
 if(!p.customerAccountId)fail('请先选择指定微信收款对象');var customer=purchaseLinkCustomer(p.customerAccountId);
 if(!p.agentAccountId)fail('请先选择上级代理');var agent=purchaseLinkAgent(p.agentAccountId);if(!agent)fail('请选择启用中的上级代理');
 purchaseLinkBinding(customer.id,{customerAccountId:String(customer.id),agentAccountId:String(agent.account_id)});
 var c=purchaseLinkProduct(),issued=Date.now(),expires=issued+PURCHASE_LINK_TTL;
 var message=['v2',String(s.actor.accountId),String(c.id),String(agent.account_id),String(customer.id),String(issued),String(expires)].join('.'),token=message+'.'+linkHmac(purchaseLinkKey(),message);
 result(s,{token:token,customer:purchaseLinkCustomerView(customer),agent:purchaseLinkAgentView(agent),offer:purchaseLinkOffer(c),expiresAt:new Date(expires).toISOString(),url:'https://www.apply.tianqiwushu.cn/web/#/pages/customer/customer?paymentLinkToken='+token});
}
if(op==='GET_LINK_PACKAGE'){
 login(s);var c=purchaseLinkProduct(),grant=purchaseLinkGrant(p.paymentLinkToken,c);purchaseLinkBinding(s.actor.accountId,grant);
 result(s,{offer:purchaseLinkOffer(c),expiresAt:grant.expiresAt,agent:grant.agentAccountId?{accountId:grant.agentAccountId,name:grant.agentName}:null});
}
