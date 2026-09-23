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
function pay(payload){return payment.enroll(payload,'￥19.90',{action:'questionnaire-pay',noun:'简易方案梳理',confirmTitle:'填写前缴费'});}
function submit(payload){return service.call('SUBMIT_CHILD_INTAKE',payload);}
module.exports={context,pay,submit};
