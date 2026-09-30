const service=require('./consultationService');
const payment=require('./coursePayment');

function request(action,data={},method='GET'){
  const suffix=method==='GET'?'&'+Object.keys(data).map(key=>encodeURIComponent(key)+'='+encodeURIComponent(data[key]||'')).join('&'):'';
  return new Promise((resolve,reject)=>wx.request({
    url:'/api/h5?action='+action+suffix,method,data:method==='GET'?undefined:data,timeout:60000,header:{'content-type':'application/json'},
    success:r=>r.statusCode===200&&r.data&&r.data.ok?resolve(r.data.data):reject(new Error(r.data&&r.data.message||'问卷暂时无法打开，请稍后重试')),
    fail:()=>reject(new Error('网络连接失败，请稍后重试'))
  }));
}
function context(){return request('questionnaire-context',{ref:wx.getReferralToken?wx.getReferralToken():''});}
function pay(payload, price){
  const cents=Math.round(Number(price)*100);
  if(!Number.isSafeInteger(cents)||cents<1||Math.abs(Number(price)*100-cents)>0.00001)throw new Error('问卷价格暂时无效，请刷新后重试');
  return payment.enroll(payload,'￥'+(cents/100).toFixed(2),{action:'questionnaire-pay',noun:'简易方案梳理',confirmTitle:'填写前缴费'});
}
function submit(payload){return service.call('SUBMIT_CHILD_INTAKE',payload);}
module.exports={context,pay,submit};
