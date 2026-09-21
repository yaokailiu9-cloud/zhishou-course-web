// Runs inside the transactional Zion action flow. The key is a Secret binding,
// never a payload argument, environment variable, returned value, or source literal.
var PAY_APP='wx6dafecca8d5fd24e',PAY_MERCHANT='1666219884';
var ORDER_FIELDS='id order_no amount amount_paid status registrant_name phone course_title_snapshot customer_id public_class_id transaction_id expires_at source failure_message';
function payKey(){var k=context.getArg('wechat_pay_key');if(typeof k!=='string'||k.length!==32)fail('微信支付安全配置尚未就绪');return k;}
function payMd5(value){var utf8=unescape(encodeURIComponent(value)),bytes=new Uint8Array(utf8.length);for(var i=0;i<utf8.length;i++)bytes[i]=utf8.charCodeAt(i);return wordsToBytes(md5Core(bufferToWords(bytes.buffer))).map(function(n){return ('0'+n.toString(16)).slice(-2);}).join('').toUpperCase();}
function paySign(fields){return payMd5(Object.keys(fields).filter(function(k){return k!=='sign'&&fields[k]!==''&&fields[k]!=null;}).sort().map(function(k){return k+'='+fields[k];}).join('&')+'&key='+payKey());}
function payVerify(v){
  if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length>100)fail('微信支付凭据无效');
  Object.keys(v).forEach(function(k){if(!/^[a-zA-Z0-9_]+$/.test(k)||typeof v[k]!=='string'||v[k].length>4096)fail('微信支付凭据格式无效');});
  if(!/^[A-Fa-f0-9]{32}$/.test(v.sign||'')||(v.sign_type&&v.sign_type!=='MD5'))fail('微信支付签名无效');
  var expected=paySign(v),actual=v.sign.toUpperCase(),diff=0;for(var i=0;i<32;i++)diff|=expected.charCodeAt(i)^actual.charCodeAt(i);
  if(diff||v.appid!==PAY_APP||v.mch_id!==PAY_MERCHANT||v.return_code!=='SUCCESS'||v.result_code!=='SUCCESS')fail('微信支付校验未通过');
}
function payBuyer(accountId){var a=gql('query PaymentBuyer($id:bigint!) { account_by_pk(id:$id) { id username wechat_openid } }',{id:id(accountId)}).account_by_pk;if(!a||!a.wechat_openid||String(a.username).indexOf('wxh5_')!==0)fail('请在微信中打开网页并重新微信登录后缴费');return a;}
function payOwned(value){login(s);var o=one('course_registration_order',value,ORDER_FIELDS);if(String(o.customer_id)!==String(s.actor.accountId))fail('不能访问其他用户的支付订单');return o;}
function payReferrer(value){var r=list('service_provider',and(eq('account_id',id(value)),eq('service_status','ACTIVE','text')),'id account_id service_kind can_accept_order',1)[0];return r&&(r.service_kind==='AGENT'||r.can_accept_order===true)?r:null;}
function payPublic(o){return {id:o.id,orderNo:o.order_no,amount:Number(o.amount),status:o.status,message:o.failure_message||''};}
function payCents(value){var n=Number(value),c=Math.round(n*100);if(!isFinite(n)||c<1||c>99999999||Math.abs(n*100-c)>0.00001)fail('课程报名费用无效');return c;}
function payRequest(o,kind){
  var v={appid:PAY_APP,mch_id:PAY_MERCHANT,nonce_str:entryCode(),out_trade_no:o.order_no};
  if(kind==='unifiedorder'){
    var buyer=payBuyer(o.customer_id);
    v.body='知守课程报名';v.total_fee=String(payCents(o.amount));v.spbill_create_ip='127.0.0.1';
    v.notify_url='https://www.apply.tianqiwushu.cn/api/wechat-pay-notify';v.trade_type='JSAPI';v.openid=buyer.wechat_openid;
    // Stable expiry for retries of the same order. WeChat requires >= 5 minutes.
    var d=new Date(new Date(o.expires_at).getTime()+8*3600000);v.time_expire=d.toISOString().replace(/[-:T]/g,'').slice(0,14);
  }
  v.sign=paySign(v);return v;
}
if(op==='PREPARE_COURSE_PAYMENT'){
  login(s);payKey();payBuyer(s.actor.accountId);
  var c=one('public_class',p.classId,CLASS_FIELDS),scope=and(eq('customer_id',s.actor.accountId),eq('public_class_id',c.id));
  var enrollment=list('public_class_enrollment',scope,ENROLL_FIELDS,1)[0];
  if(enrollment&&enrollment.status==='REGISTERED')result(s,{enrollment:enrollment});
  else {
    var pending=list('course_registration_order',and(scope,eq('status','PENDING','text')),ORDER_FIELDS,1)[0];
    if(pending)result(s,{order:payPublic(pending),resume:true});
    else {
      var view=classView(c,false);if(!view.canEnroll||!c.organizer_id)fail(view.closedReason||'课程未开放报名');
      var cents=payCents(c.registration_fee),deadline=new Date(c.registration_closes_at||c.starts_at).getTime();
      if(deadline-Date.now()<6*60000)fail('距离报名截止不足六分钟，请联系工作人员');
      var expires=new Date(Math.min(Date.now()+30*60000,deadline)).toISOString();
      var candidate=p.referrerId&&String(p.referrerId)!==String(s.actor.accountId)?payReferrer(p.referrerId):null;
      var values={order_no:'ZS'+Date.now()+entryCode().slice(0,16),amount:cents/100,status:'PENDING',customer_id:s.actor.accountId,public_class_id:c.id,registrant_name:text(p.name,'姓名',60,true),phone:phone(p.phone),course_title_snapshot:c.title,payment_channel:'WECHAT_JSAPI',request_key:'WX_COURSE:'+s.actor.accountId+':'+c.id,expires_at:expires,source:JSON.stringify({referrerId:candidate?candidate.account_id:null})};
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
  if(order.status!=='PENDING'||v.trade_type!=='JSAPI'||!/^\w{10,128}$/.test(v.prepay_id||''))fail('微信预支付凭据无效');
  var payment={appId:PAY_APP,timeStamp:String(Math.floor(Date.now()/1000)),nonceStr:entryCode(),package:'prepay_id='+v.prepay_id,signType:'MD5'};
  payment.paySign=paySign(payment);result(s,{order:payPublic(order),payment:payment});
}
if(op==='QUERY_COURSE_PAYMENT'){
  var order=payOwned(p.orderId),enrollment=order.status==='PAID'?list('public_class_enrollment',and(eq('customer_id',order.customer_id),eq('public_class_id',order.public_class_id)),ENROLL_FIELDS,1)[0]:null;
  result(s,{order:payPublic(order),enrollment:enrollment||null,request:order.status==='PENDING'?payRequest(order,'orderquery'):null,closeRequest:order.status==='PENDING'&&new Date(order.expires_at).getTime()<=Date.now()?payRequest(order,'closeorder'):null});
}
if(op==='CLOSE_UNPAID_COURSE_ORDER'){
  var order=payOwned(p.orderId),v=p.gateway;payVerify(v);
  if(v.out_trade_no!==order.order_no||v.trade_state!=='CLOSED')fail('微信尚未确认关闭订单');
  if(order.status==='PENDING')update('course_registration_order',and(eq('id',order.id),eq('status','PENDING','text')),{status:'CLOSED',request_key:null,closed_at:new Date().toISOString()});
  result(s,{closed:true});
}
if(op==='CONFIRM_COURSE_PAYMENT'){
  // Anonymous notification callers have no authority until all gateway proof is checked.
  var v=p.gateway;payVerify(v);
  if(v.trade_state&&v.trade_state!=='SUCCESS')fail('微信尚未确认支付成功');
  if(v.trade_type!=='JSAPI'||!/^\d{10,64}$/.test(v.transaction_id||''))fail('微信交易凭据无效');
  var order=list('course_registration_order',eq('order_no',text(v.out_trade_no,'订单号',32,true),'text'),ORDER_FIELDS,1)[0];
  if(!order||!/^[0-9]+$/.test(v.total_fee)||Number(v.total_fee)!==payCents(order.amount)||(v.fee_type&&v.fee_type!=='CNY')||v.openid!==payBuyer(order.customer_id).wechat_openid)fail('微信支付金额或付款账号与订单不符');
  if(order.status==='PAID'||order.status==='PAID_REVIEW'){
    if(order.transaction_id!==v.transaction_id)fail('订单交易号不匹配');result(s,{confirmed:true});
  }else{
    if(order.status!=='PENDING')fail('订单已关闭，请联系工作人员核对');
    var c=one('public_class',order.public_class_id,CLASS_FIELDS),scope=and(eq('customer_id',order.customer_id),eq('public_class_id',c.id));
    var existing=list('public_class_enrollment',scope,ENROLL_FIELDS,1)[0],firstEnrollment=!list('public_class_enrollment',eq('customer_id',order.customer_id),'id',1).length;
    // Never lose an actual payment if the final seat was taken during checkout.
    var review=!!(existing&&existing.status==='REGISTERED')||!classView(c,false).canEnroll;
    lockClass(c,review?{}:{reserved_count:Number(c.reserved_count||0)+1});
    update('course_registration_order',and(eq('id',order.id),eq('status','PENDING','text')),{status:review?'PAID_REVIEW':'PAID',amount_paid:Number(order.amount),transaction_id:v.transaction_id,paid_at:new Date().toISOString(),request_key:null,failure_message:review?'已收到款项，课程状态已变化，请联系工作人员安排课程或退款。':null});
    if(!review){
      var values={customer_id:order.customer_id,public_class_id:c.id,payment_order_id:order.id,registrant_name:order.registrant_name,phone:order.phone,status:'REGISTERED',attendance_status:'PENDING',group_status:'PENDING',entry_code:entryCode(),canceled_at:null,verified_at:null,verified_by_id:null,checkin_method:null};
      if(existing)update('public_class_enrollment',and(eq('id',existing.id),eq('status','CANCELED','text')),values);
      else if(!insert('public_class_enrollment',values,'public_class_enrollment_customer_class_key'))fail('报名状态已变化，请重试');
      var source={};try{source=JSON.parse(order.source||'{}');}catch(_){}
      var candidate=firstEnrollment&&source.referrerId?payReferrer(source.referrerId):null;
      if(candidate)insert('course_referral',{referrer_id:candidate.account_id,referred_account_id:order.customer_id,locked_at:new Date().toISOString(),source:'FIRST_PAID_ENROLLMENT'},'course_referral_referred_account_id_key');
    }
    result(s,{confirmed:true});
  }
}
