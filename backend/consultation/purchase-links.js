// Only the two verified management accounts may issue a private, reusable 7-day link.
var PURCHASE_LINK_TTL=7*24*3600000;
function internalLinkIssuer(accountId){
 if(['1000000000000019','1000000000000021'].indexOf(String(accountId))<0)return null;
 var p=list('service_provider',and(eq('account_id',accountId),eq('service_kind','STAFF','text'),eq('service_status','ACTIVE','text')),'id account_id display_name can_reply can_accept_order',1)[0];
 return p&&p.can_reply===true&&p.can_accept_order===true?p:null;
}
function purchaseLinkKey(){return linkHmac(payKey(),'zhishou/internal-consultation-purchase-link/key/v1');}
function purchaseLinkOffer(c){return {id:c.id,title:c.title,price:Number(c.registration_fee||0),sessions:5,unitPrice:1000};}
function purchaseLinkProduct(){var rows=list('public_class',and(eq('product_kind','CONSULT_PACKAGE','text'),eq('status','PUBLISHED','text')),CLASS_FIELDS,2);if(rows.length!==1)fail('咨询套餐暂未开放缴费');return rows[0];}
function purchaseLinkGrant(token,product){
 if(typeof token!=='string'||token.length>240)fail('缴费链接无效，请联系老师重新获取');
 var m=token.match(/^([1-9][0-9]*)\.([1-9][0-9]*)\.([1-9][0-9]*)\.([1-9][0-9]*)\.([0-9a-f]{64})$/);
 if(!m)fail('缴费链接无效，请联系老师重新获取');
 var issued=Number(m[3]),expires=Number(m[4]),now=Date.now(),message=m.slice(1,5).join('.');
 if(!Number.isSafeInteger(issued)||!Number.isSafeInteger(expires)||expires-issued!==PURCHASE_LINK_TTL||issued>now+1000||!linkEqual(linkHmac(purchaseLinkKey(),message),m[5]))fail('缴费链接无效，请联系老师重新获取');
 if(expires<=now)fail('缴费链接已过期，请联系老师获取新链接');
 var issuer=internalLinkIssuer(m[1]);if(!issuer)fail('此缴费链接已停止使用，请联系老师');
 if(!product||product.product_kind!=='CONSULT_PACKAGE'||String(product.id)!==m[2])fail('缴费链接与咨询套餐不匹配');
 return {kind:'CONSULTATION_PURCHASE_LINK_V1',issuerAccountId:String(issuer.account_id),issuerProviderId:issuer.id,productId:product.id,issuedAt:new Date(issued).toISOString(),expiresAt:new Date(expires).toISOString()};
}
if(op==='INTERNAL_PURCHASE_ACCESS'){login(s);result(s,{allowed:!!internalLinkIssuer(s.actor.accountId)});}
if(op==='CREATE_PURCHASE_LINK'){
 login(s);var issuer=internalLinkIssuer(s.actor.accountId);if(!issuer)fail('当前账号没有发放咨询缴费链接的权限');
 var c=purchaseLinkProduct(),issued=Date.now(),expires=issued+PURCHASE_LINK_TTL;
 var message=[String(s.actor.accountId),String(c.id),String(issued),String(expires)].join('.'),token=message+'.'+linkHmac(purchaseLinkKey(),message);
 result(s,{token:token,offer:purchaseLinkOffer(c),expiresAt:new Date(expires).toISOString(),url:'https://www.apply.tianqiwushu.cn/web/#/pages/customer/customer?paymentLinkToken='+token});
}
if(op==='GET_LINK_PACKAGE'){
 login(s);var c=purchaseLinkProduct(),grant=purchaseLinkGrant(p.paymentLinkToken,c);
 result(s,{offer:purchaseLinkOffer(c),expiresAt:grant.expiresAt});
}
