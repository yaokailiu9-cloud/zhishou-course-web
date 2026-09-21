// A narrow, keyless relay. Signing and all payment/enrollment decisions live in Zion.
const LIMIT=32768;
function xml(fields){return '<xml>'+Object.entries(fields).map(([key,value])=>{
  if(!/^[a-zA-Z0-9_]+$/.test(key))throw new Error('微信支付字段无效');
  return `<${key}>${String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}</${key}>`;
}).join('')+'</xml>';}
function parseXml(raw){
  if(typeof raw!=='string'||Buffer.byteLength(raw)>LIMIT||/<!DOCTYPE|<!ENTITY|<\?/i.test(raw))throw new Error('微信支付响应格式无效');
  const root=raw.trim().match(/^<xml>([\s\S]*)<\/xml>$/);if(!root)throw new Error('微信支付响应格式无效');
  const fields=Object.create(null),re=/\s*<([a-zA-Z0-9_]+)>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]*))<\/\1>\s*/gy;let at=0,m;
  while((m=re.exec(root[1]))){
    const key=m[1];if(Object.hasOwn(fields,key)||['__proto__','constructor','prototype'].includes(key))throw new Error('微信支付响应字段重复');
    let value=m[2];if(value===undefined){value=m[3];if(/&(?!(?:amp|lt|gt|quot|apos);)/.test(value))throw new Error('微信支付响应转义无效');value=value.replace(/&(amp|lt|gt|quot|apos);/g,(_,name)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"})[name]);}
    fields[key]=value;at=re.lastIndex;
  }
  if(at!==root[1].length||!Object.keys(fields).length)throw new Error('微信支付响应格式无效');return fields;
}
async function rawBody(stream){let size=0,parts=[];for await(const chunk of stream){const b=Buffer.from(chunk);size+=b.length;if(size>LIMIT)throw new Error('微信支付请求过长');parts.push(b);}return Buffer.concat(parts).toString('utf8');}
async function gateway(kind,fields){
  if(!['unifiedorder','orderquery','closeorder'].includes(kind))throw new Error('微信支付请求无效');
  const response=await fetch('https://api.mch.weixin.qq.com/pay/'+kind,{method:'POST',headers:{'content-type':'text/xml; charset=utf-8'},body:xml(fields),signal:AbortSignal.timeout(15000),redirect:'error'});
  if(!response.ok)throw new Error('微信支付服务暂不可用，请查询订单后重试');
  return parseXml(await rawBody(response.body));
}
async function status(invoke,jwt,orderId,relay=gateway){
  let current=await invoke(jwt,'QUERY_COURSE_PAYMENT',{orderId});
  if(current.request){
    let proof=await relay('orderquery',current.request);
    if(current.closeRequest&&proof.trade_state==='NOTPAY'){
      await relay('closeorder',current.closeRequest);
      proof=await relay('orderquery',current.request);
    }
    if(proof.return_code==='SUCCESS'&&proof.result_code==='SUCCESS'){
      if(proof.trade_state==='SUCCESS')await invoke(jwt,'CONFIRM_COURSE_PAYMENT',{gateway:proof});
      else if(proof.trade_state==='CLOSED')await invoke(jwt,'CLOSE_UNPAID_COURSE_ORDER',{orderId,gateway:proof});
      current=await invoke(jwt,'QUERY_COURSE_PAYMENT',{orderId});
    }
  }
  return {order:current.order,enrollment:current.enrollment||null};
}
async function prepare(invoke,jwt,input,relay=gateway){
  let prepared=await invoke(jwt,'PREPARE_COURSE_PAYMENT',input);
  if(prepared.enrollment)return {enrollment:prepared.enrollment};
  if(prepared.resume){
    const previous=await status(invoke,jwt,prepared.order.id,relay);
    if(previous.order.status==='CLOSED')return prepare(invoke,jwt,input,relay);
    if(previous.enrollment||previous.order.status!=='PENDING')return previous;
    // Existing order amount remains immutable; client re-confirms it if the fee changed.
    prepared=await invoke(jwt,'RETRY_COURSE_PAYMENT',{orderId:prepared.order.id});
  }
  const proof=await relay('unifiedorder',prepared.request);
  if(proof.return_code!=='SUCCESS'||proof.result_code!=='SUCCESS'){
    // Don't reflect arbitrary gateway errors or signed request contents into the browser.
    if(proof.err_code==='ORDERPAID')return status(invoke,jwt,prepared.order.id,relay);
    throw new Error('微信下单暂未成功，请稍后重新查询并缴费；未确认到账不会报名成功');
  }
  return invoke(jwt,'SIGN_COURSE_PREPAY',{orderId:prepared.order.id,gateway:proof});
}
async function notify(req,res,invoke){
  let ok=false;
  try{
    if(req.method!=='POST')throw new Error('method');
    const proof=parseXml(await rawBody(req));
    const result=await invoke(null,'CONFIRM_COURSE_PAYMENT',{gateway:proof});ok=result.confirmed===true;
  }catch(_){/* Do not log raw requests, signatures, or customer details. WeChat retries failures. */}
  res.statusCode=req.method==='POST'?200:405;res.setHeader('Content-Type','text/xml; charset=utf-8');res.setHeader('Cache-Control','no-store');
  res.end(xml({return_code:ok?'SUCCESS':'FAIL',return_msg:ok?'OK':'Payment not confirmed'}));
}
module.exports={xml,parseXml,rawBody,gateway,status,prepare,notify};
