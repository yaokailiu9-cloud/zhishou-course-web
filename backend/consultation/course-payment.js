// Runs inside the transactional Zion action flow. The key is a Secret binding,
// never a payload argument, environment variable, returned value, or source literal.
var PAY_APP='wx8daa76a8eb887e47',PAY_MERCHANT='1119085869';
var PAYMENT_OAUTH_API='y7saxhv2m';
var LEGACY_PAY_APP='wx6dafecca8d5fd24e',LEGACY_PAY_MERCHANT='1666219884';
var ORDER_FIELDS='id order_no amount amount_paid status registrant_name phone course_title_snapshot customer_id public_class_id transaction_id expires_at source failure_message';
function payKey(){var k=context.getArg('wechat_pay_key');if(typeof k!=='string'||k.length!==32)fail('微信支付安全配置尚未就绪');return k;}
function merchantKey(merchant){if(merchant===LEGACY_PAY_MERCHANT)return payKey();if(merchant!==PAY_MERCHANT)fail('微信支付商户不匹配');var k=context.getArg('guanzhishou_pay_key');if(typeof k!=='string'||k.length!==32)fail('新商户微信支付安全配置尚未就绪');return k;}
function paySource(o){var v;try{v=JSON.parse(o.source||'{}').payment;}catch(_){}if(!v)return {appId:LEGACY_PAY_APP,merchantId:LEGACY_PAY_MERCHANT,openid:payBuyer(o.customer_id).wechat_openid};if(v.appId!==PAY_APP||v.merchantId!==PAY_MERCHANT||!/^[-\w]{10,128}$/.test(v.openid||''))fail('微信支付订单身份无效');return v;}
function paymentTicketKey(){return linkHmac(merchantKey(PAY_MERCHANT),'zhishou/payment-identity/v1');}
function paymentIdentity(ticket){var m=typeof ticket==='string'&&ticket.length<=320&&ticket.match(/^v1\.([1-9][0-9]*)\.([-\w]{10,128})\.([0-9]{10})\.([0-9a-f]{64})$/);if(!m||String(s.actor.accountId)!==m[1]||Number(m[3])<=Math.floor(Date.now()/1000)||Number(m[3])>Math.floor(Date.now()/1000)+7200||!linkEqual(linkHmac(paymentTicketKey(),ticket.slice(0,ticket.lastIndexOf('.'))),m[4]))fail('请重新授权新服务号后继续微信支付');return m[2];}
if(op==='PAYMENT_CONFIGURATION'){var configuredKey=context.getArg('guanzhishou_pay_key'),configuredSecret=context.getArg('guanzhishou_app_secret');result(s,{appId:PAY_APP,merchantId:PAY_MERCHANT,ready:typeof configuredKey==='string'&&configuredKey.length===32&&typeof configuredSecret==='string'&&configuredSecret.length===32,merchantKeyReady:typeof configuredKey==='string'&&configuredKey.length===32,serviceAccountReady:typeof configuredSecret==='string'&&configuredSecret.length===32});}
if(op==='PAYMENT_ACCESS'){login(s);merchantKey(PAY_MERCHANT);if(!context.getArg('guanzhishou_app_secret'))fail('新服务号微信支付授权配置尚未就绪');result(s,{appId:PAY_APP,merchantId:PAY_MERCHANT});}
if(op==='AUTHORIZE_PAYMENT'){
  login(s);merchantKey(PAY_MERCHANT);
  var secret=context.getArg('guanzhishou_app_secret');if(typeof secret!=='string'||!secret)fail('新服务号微信支付授权配置尚未就绪');
  var authorization;try{authorization=context.callThirdPartyApi(PAYMENT_OAUTH_API,{r903ewe97:text(p.code,'微信授权码',256,true),hbkcrei47:secret});}catch(_){fail('微信支付授权暂不可用，请联系工作人员');}
  if(typeof authorization==='string')authorization=JSON.parse(authorization);
  var identity=authorization.data;if(authorization.code!==200||!identity||identity.errcode||!/^[-\w]{10,128}$/.test(identity.openid||''))fail('微信支付授权已失效，请重新授权');
  var expiry=Math.floor(Date.now()/1000)+7200,message=['v1',s.actor.accountId,identity.openid,expiry].join('.');
  result(s,{appId:PAY_APP,merchantId:PAY_MERCHANT,ticket:message+'.'+linkHmac(paymentTicketKey(),message),expiresAt:expiry});
}
function payMd5(value){var utf8=unescape(encodeURIComponent(value)),bytes=new Uint8Array(utf8.length);for(var i=0;i<utf8.length;i++)bytes[i]=utf8.charCodeAt(i);return wordsToBytes(md5Core(bufferToWords(bytes.buffer))).map(function(n){return ('0'+n.toString(16)).slice(-2);}).join('').toUpperCase();}
function paySign(fields,merchant){return payMd5(Object.keys(fields).filter(function(k){return k!=='sign'&&fields[k]!==''&&fields[k]!=null;}).sort().map(function(k){return k+'='+fields[k];}).join('&')+'&key='+merchantKey(merchant||fields.mch_id));}
function payVerify(v){
  if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length>100)fail('微信支付凭据无效');
  Object.keys(v).forEach(function(k){if(!/^[a-zA-Z0-9_]+$/.test(k)||typeof v[k]!=='string'||v[k].length>4096)fail('微信支付凭据格式无效');});
  if(!/^[A-Fa-f0-9]{32}$/.test(v.sign||'')||(v.sign_type&&v.sign_type!=='MD5'))fail('微信支付签名无效');
  if(!((v.appid===PAY_APP&&v.mch_id===PAY_MERCHANT)||(v.appid===LEGACY_PAY_APP&&v.mch_id===LEGACY_PAY_MERCHANT)))fail('微信支付校验未通过');
  var expected=paySign(v),actual=v.sign.toUpperCase(),diff=0;for(var i=0;i<32;i++)diff|=expected.charCodeAt(i)^actual.charCodeAt(i);
  if(diff||v.return_code!=='SUCCESS'||v.result_code!=='SUCCESS')fail('微信支付校验未通过');
}
function payBuyer(accountId){var a=gql('query PaymentBuyer($id:bigint!) { account_by_pk(id:$id) { id username wechat_openid } }',{id:id(accountId)}).account_by_pk;if(!a||!a.wechat_openid||String(a.username).indexOf('wxh5_')!==0)fail('请在微信中打开网页并重新微信登录后缴费');return a;}
function payOwned(value){login(s);var o=one('course_registration_order',value,ORDER_FIELDS);if(String(o.customer_id)!==String(s.actor.accountId))fail('不能访问其他用户的支付订单');return o;}
function payReferrer(value){var r=list('service_provider',and(eq('account_id',id(value)),eq('service_status','ACTIVE','text')),'id account_id service_kind can_accept_order',1)[0];return r&&(r.service_kind==='AGENT'||r.can_accept_order===true)?r:null;}
function payPublic(o){var identity=paySource(o);return {id:o.id,orderNo:o.order_no,amount:Number(o.amount),status:o.status,message:o.failure_message||'',appId:identity.appId,merchantId:identity.merchantId};}
function payCents(value){var n=Number(value),c=Math.round(n*100);if(!isFinite(n)||c<1||c>99999999||Math.abs(n*100-c)>0.00001)fail('支付费用无效');return c;}
function payRequest(o,kind){
  var identity=paySource(o),v={appid:identity.appId,mch_id:identity.merchantId,nonce_str:entryCode(),out_trade_no:o.order_no};
  if(kind==='unifiedorder'){
    v.body=('知守-'+String(o.course_title_snapshot||'服务支付')).slice(0,120);v.total_fee=String(payCents(o.amount));v.spbill_create_ip='127.0.0.1';
    v.notify_url='https://www.apply.tianqiwushu.cn/api/wechat-pay-notify';v.trade_type='JSAPI';v.openid=identity.openid;
    // Stable expiry for retries of the same order. WeChat requires >= 5 minutes.
    var d=new Date(new Date(o.expires_at).getTime()+8*3600000);v.time_expire=d.toISOString().replace(/[-:T]/g,'').slice(0,14);
  }
  v.sign=paySign(v);return v;
}
// PURCHASE_LINK_HANDLERS: build inserts link-signature.js and purchase-links.js here.
if(op==='PREPARE_COURSE_PAYMENT'){
  login(s);merchantKey(PAY_MERCHANT);payBuyer(s.actor.accountId);
  var c=one('public_class',p.classId,CLASS_FIELDS),linkGrant=p.paymentLinkToken?purchaseLinkGrant(p.paymentLinkToken,c):null,scope=and(eq('customer_id',s.actor.accountId),eq('public_class_id',c.id));
  var educationBundle=c.product_kind===EDUCATION_BUNDLE_KIND,educationContents=educationBundle?educationCourses(c):null;
  if(educationBundle&&!educationContents.length)fail('课程包目录尚未配置完成');
  purchaseLinkBinding(s.actor.accountId,linkGrant);
  var enrollment=list('public_class_enrollment',scope,ENROLL_FIELDS,1)[0];
  // The 5-session package can be bought repeatedly; each paid order adds sessions.
  if(educationBundle&&enrollment&&enrollment.status==='REGISTERED'&&!educationPaid(s.actor.accountId))fail('课程包付款记录待核实，请联系工作人员');
  if(enrollment&&enrollment.status==='REGISTERED'&&c.product_kind!=='CONSULT_PACKAGE')result(s,{enrollment:enrollment});
  else {
    var pending=list('course_registration_order',and(scope,eq('status','PENDING','text')),ORDER_FIELDS,1)[0];
    if(pending){
      if(linkGrant){var previousSource={};try{previousSource=JSON.parse(pending.source||'{}')||{};}catch(_){}
        var previousGrant=previousSource.linkPurchase;
        if(previousGrant&&previousGrant.agentAccountId&&String(previousGrant.agentAccountId)!==String(linkGrant.agentAccountId))fail('已有另一上级代理的待支付订单，请先完成原订单或联系管理人员处理');
        if(!previousGrant||(!previousGrant.customerAccountId&&linkGrant.customerAccountId)){previousSource.linkPurchase=linkGrant;if(linkGrant.agentAccountId)previousSource.referrerId=linkGrant.agentAccountId;update('course_registration_order',and(eq('id',pending.id),eq('status','PENDING','text')),{source:JSON.stringify(previousSource)});}
      }
      result(s,{order:payPublic(pending),resume:true});
    }
    else {
      var view=classView(c,false);if(!view.canEnroll||!c.organizer_id)fail(view.closedReason||'课程未开放报名');
      if(c.product_kind==='CONSULT_PACKAGE'&&!linkGrant&&!paidLinkConsultationSource(s.actor.accountId)&&!list('offline_appointment',and(eq('customer_id',s.actor.accountId),{_or:[eq('status','COMPLETED','text'),and(eq('status','CONFIRMED','text'),compare('_lt','confirmed_at',new Date().toISOString(),'timestamptz'))]}),'id child_info',50).some(function(a){return !!a.child_info&&typeof a.child_info==='object'&&!Array.isArray(a.child_info);}))fail('首次咨询建立档案后才能购买5次咨询');
      var candidate=linkGrant&&linkGrant.agentAccountId?purchaseLinkAgent(linkGrant.agentAccountId):(p.referrerId&&String(p.referrerId)!==String(s.actor.accountId)?payReferrer(p.referrerId):null);
      if(c.product_kind==='QUESTIONNAIRE'&&!candidate)fail('请使用管理或代理发出的问卷二维码进入');
      var cents=payCents(c.registration_fee),deadline=educationBundle?Date.now()+30*60000:new Date(c.registration_closes_at||c.starts_at).getTime();
      if(deadline-Date.now()<6*60000)fail('距离报名截止不足六分钟，请联系工作人员');
      var expires=new Date(Math.min(Date.now()+30*60000,deadline)).toISOString();
      var values={order_no:'ZS'+Date.now()+entryCode().slice(0,16),amount:cents/100,status:'PENDING',customer_id:s.actor.accountId,public_class_id:c.id,registrant_name:educationBundle?null:text(p.name,'姓名',60,true),phone:educationBundle?null:phone(p.phone),course_title_snapshot:c.title,payment_channel:'WECHAT_JSAPI',request_key:'WX_COURSE:'+s.actor.accountId+':'+c.id,expires_at:expires,source:JSON.stringify({educationBundle:educationBundle?{version:1,courseIds:educationContents.map(function(item){return String(item.id);})}:undefined,referrerId:candidate?candidate.account_id:null,linkPurchase:linkGrant||undefined,payment:{appId:PAY_APP,merchantId:PAY_MERCHANT,openid:paymentIdentity(p.paymentIdentity)}})};
      lockClass(c,{});
      var orderId=insert('course_registration_order',values,'course_registration_order_request_key_key');if(!orderId)fail('已有待支付订单，请重试');
      var order=one('course_registration_order',orderId,ORDER_FIELDS);result(s,{order:payPublic(order),request:payRequest(order,'unifiedorder')});
    }
  }
}
if(op==='RETRY_COURSE_PAYMENT'){
  var order=payOwned(p.orderId),c=one('public_class',order.public_class_id,CLASS_FIELDS);
  if(order.status!=='PENDING')fail('订单状态已变化，请刷新');
  if(new Date(order.expires_at).getTime()-Date.now()<5*60000)fail('订单即将过期，请稍后查询支付结果或联系工作人员');
  if(!classView(c,false).canEnroll)fail('课程已停止报名，请查询支付结果或联系工作人员');
  result(s,{order:payPublic(order),request:payRequest(order,'unifiedorder')});
}
if(op==='SIGN_COURSE_PREPAY'){
  var order=payOwned(p.orderId),v=p.gateway;payVerify(v);
  var identity=paySource(order);
  if(v.appid!==identity.appId||v.mch_id!==identity.merchantId||order.status!=='PENDING'||v.trade_type!=='JSAPI'||!/^\w{10,128}$/.test(v.prepay_id||''))fail('微信预支付凭据无效');
  var payment={appId:identity.appId,timeStamp:String(Math.floor(Date.now()/1000)),nonceStr:entryCode(),package:'prepay_id='+v.prepay_id,signType:'MD5'};
  payment.paySign=paySign(payment,identity.merchantId);result(s,{order:payPublic(order),payment:payment});
}
if(op==='QUERY_COURSE_PAYMENT'){
  var order=payOwned(p.orderId),enrollment=order.status==='PAID'?list('public_class_enrollment',and(eq('customer_id',order.customer_id),eq('public_class_id',order.public_class_id)),ENROLL_FIELDS,1)[0]:null;
  result(s,{order:payPublic(order),enrollment:enrollment||null,request:order.status==='PENDING'?payRequest(order,'orderquery'):null,closeRequest:order.status==='PENDING'&&(new Date(order.expires_at).getTime()<=Date.now()||paySource(order).merchantId!==PAY_MERCHANT)?payRequest(order,'closeorder'):null});
}
if(op==='CLOSE_UNPAID_COURSE_ORDER'){
  var order=payOwned(p.orderId),v=p.gateway;payVerify(v);
  if(v.appid!==paySource(order).appId||v.mch_id!==paySource(order).merchantId||v.out_trade_no!==order.order_no||v.trade_state!=='CLOSED')fail('微信尚未确认关闭订单');
  if(order.status==='PENDING')update('course_registration_order',and(eq('id',order.id),eq('status','PENDING','text')),{status:'CLOSED',request_key:null,closed_at:new Date().toISOString()});
  result(s,{closed:true});
}
if(op==='CONFIRM_COURSE_PAYMENT'){
  // Anonymous notification callers have no authority until all gateway proof is checked.
  var v=p.gateway;payVerify(v);
  if(v.trade_state&&v.trade_state!=='SUCCESS')fail('微信尚未确认支付成功');
  if(v.trade_type!=='JSAPI'||!/^\d{10,64}$/.test(v.transaction_id||''))fail('微信交易凭据无效');
  var order=list('course_registration_order',eq('order_no',text(v.out_trade_no,'订单号',32,true),'text'),ORDER_FIELDS,1)[0];
  if(!order||!/^[0-9]+$/.test(v.total_fee)||Number(v.total_fee)!==payCents(order.amount)||(v.fee_type&&v.fee_type!=='CNY')||v.appid!==paySource(order).appId||v.mch_id!==paySource(order).merchantId||v.openid!==paySource(order).openid)fail('微信支付金额或付款账号与订单不符');
  if(order.status==='PAID'||order.status==='PAID_REVIEW'){
    if(order.transaction_id!==v.transaction_id)fail('订单交易号不匹配');result(s,{confirmed:true});
  }else{
    if(order.status!=='PENDING')fail('订单已关闭，请联系工作人员核对');
    var c=one('public_class',order.public_class_id,CLASS_FIELDS),scope=and(eq('customer_id',order.customer_id),eq('public_class_id',c.id));
    var existing=list('public_class_enrollment',scope,ENROLL_FIELDS,1)[0],firstEnrollment=!list('public_class_enrollment',eq('customer_id',order.customer_id),'id',1).length;
    // Never lose an actual payment if the final seat was taken during checkout.
    var repeat=(c.product_kind==='CONSULT_PACKAGE'||c.product_kind===EDUCATION_BUNDLE_KIND)&&!!existing&&existing.status==='REGISTERED';
    var review=(!!(existing&&existing.status==='REGISTERED')&&!repeat)||(c.product_kind!==EDUCATION_BUNDLE_KIND&&!classView(c,false).canEnroll);
    // An issued digital-course order keeps its purchased contents even if sales close during checkout.
    var source={};try{source=JSON.parse(order.source||'{}')||{};}catch(_){}
    var selectedGrant=source.linkPurchase,selectedAgent=selectedGrant&&selectedGrant.kind==='CONSULTATION_PURCHASE_LINK_V2'&&selectedGrant.agentAccountId?selectedGrant.agentAccountId:null;
    var referralReview=false;
    if(!review&&selectedAgent){
      var targetAgent=purchaseLinkAgent(selectedAgent),bound=list('course_referral',eq('referred_account_id',order.customer_id),'id referrer_id',1)[0];
      if(String(selectedGrant.customerAccountId)!==String(order.customer_id)||!targetAgent||String(selectedAgent)===String(order.customer_id)||(bound&&String(bound.referrer_id)!==String(selectedAgent)))referralReview=true;
      else {
        if(!bound)insert('course_referral',{referrer_id:targetAgent.account_id,referred_account_id:order.customer_id,locked_at:new Date().toISOString(),source:'CONSULTATION_PAYMENT_LINK'},'course_referral_referred_account_id_key');
        var verifiedBinding=list('course_referral',eq('referred_account_id',order.customer_id),'id referrer_id',1)[0];
        referralReview=!verifiedBinding||String(verifiedBinding.referrer_id)!==String(selectedAgent);
      }
      if(referralReview)review=true;
    }
    lockClass(c,review?{}:{reserved_count:Number(c.reserved_count||0)+1});
    update('course_registration_order',and(eq('id',order.id),eq('status','PENDING','text')),{status:review?'PAID_REVIEW':'PAID',amount_paid:Number(order.amount),transaction_id:v.transaction_id,paid_at:new Date().toISOString(),request_key:null,failure_message:referralReview?'已收到款项，上级代理归属发生变化，请联系发链接的管理人员核对，请勿重复缴费。':review?'已收到款项，课程状态已变化，请联系工作人员安排课程或退款。':null});
    if(!review&&!repeat){
      var values={customer_id:order.customer_id,public_class_id:c.id,payment_order_id:order.id,registrant_name:order.registrant_name,phone:order.phone,status:'REGISTERED',attendance_status:'PENDING',group_status:'PENDING',entry_code:entryCode(),canceled_at:null,verified_at:null,verified_by_id:null,checkin_method:null};
      if(existing)update('public_class_enrollment',and(eq('id',existing.id),eq('status','CANCELED','text')),values);
      else if(!insert('public_class_enrollment',values,'public_class_enrollment_customer_class_key'))fail('报名状态已变化，请重试');
      var candidate=!selectedAgent&&firstEnrollment&&source.referrerId?payReferrer(source.referrerId):null;
      if(candidate)insert('course_referral',{referrer_id:candidate.account_id,referred_account_id:order.customer_id,locked_at:new Date().toISOString(),source:'FIRST_PAID_ENROLLMENT'},'course_referral_referred_account_id_key');
    }
    result(s,{confirmed:true});
  }
}
