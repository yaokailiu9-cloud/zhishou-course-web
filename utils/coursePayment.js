function request(action,data){return new Promise((resolve,reject)=>wx.request({url:'/api/h5?action='+action,method:'POST',data,timeout:60000,header:{'content-type':'application/json'},success:r=>r.statusCode===200&&r.data&&r.data.ok?resolve(r.data.data):reject(new Error(r.data&&r.data.message||'支付结果暂未确认，请稍后重试')),fail:()=>reject(new Error('网络异常，请稍后重新查询支付结果，不要重复付款'))}));}
function confirm(content,title='确认缴费'){return new Promise(resolve=>wx.showModal({title,content,confirmText:'去缴费',success:r=>resolve(!!r.confirm),fail:()=>resolve(false)}));}
async function enroll(payload,feeText,options={}){
  const noun=options.noun||'课程报名';
  if(!wx.isH5||!wx.canUseCoursePayment||!wx.canUseCoursePayment())throw new Error(`请在微信内打开网页完成${noun}缴费；如已在微信中，请刷新后重试`);
  if(!await confirm(`${noun}费用为 ${feeText}。完成支付并确认到账后才可继续。`,options.confirmTitle||'确认缴费'))return null;
  const prepared=await request(options.action||'course-pay',{...payload,ref:wx.getReferralToken?wx.getReferralToken():''});
  if(prepared.enrollment)return prepared;
  const order=prepared.order;
  if(!prepared.payment){if(order&&order.status==='PAID_REVIEW')throw new Error(order.message);throw new Error('订单已结束，请刷新页面后重试');}
  if('￥'+Number(order.amount).toFixed(2)!==feeText&&!await confirm(`当前待支付订单金额为 ￥${Number(order.amount).toFixed(2)}。是否继续支付？`))return null;
  let canceled=false;
  try{await new Promise((resolve,reject)=>wx.requestPayment({...prepared.payment,success:resolve,fail:reject}));}catch(e){canceled=/cancel/i.test(e.errMsg||e.message||'');}
  for(let i=0;i<(canceled?1:5);i++){
    const checked=await request('course-pay-status',{orderId:order.id});
    if(checked.enrollment&&checked.order.status==='PAID')return checked;
    if(checked.order.status==='PAID_REVIEW')throw new Error(checked.order.message);
    if(checked.order.status==='CLOSED')throw new Error('订单已关闭，请重新发起支付');
    if(!canceled)await new Promise(resolve=>setTimeout(resolve,2000));
  }
  throw new Error(canceled?'已取消支付，尚未报名；再次点击可继续缴费。':'支付结果正在确认。请稍后刷新或再次点击报名查询原订单，不要重复付款。');
}
module.exports={enroll,request};
