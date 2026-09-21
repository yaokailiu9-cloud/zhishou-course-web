const auth = require('./auth');
const { readableError } = require('./serviceError');
const { ZION_GRAPHQL_URL } = require('./zion');
const ACTION_FLOW_ID = '9f60a0be-4628-4268-a769-661264846cf4';
const labels = {QUEUED:'排队中',AUDIO_PROCESSING:'正在转写与总结',PENDING:'待确认',REGISTERED:'已报名',ATTENDED:'已参加',ABSENT:'未到课',INVITED:'已邀请',JOINED:'已进群',CONFIRMED:'已确认',COMPLETED:'已完成',CANCELED:'已取消',DRAFT:'草稿',PUBLISHED:'报名中',CLOSED:'已结束',REPLIED:'已回复',UPLOADING:'待上传',PROCESSING:'正在总结',FAILED:'生成失败',READY:'待老师确认'};
function call(operation, payload = {}) {
  const token = wx.getStorageSync('zionJwt');
  if (!['LIST_CLASSES','GET_CLASS'].includes(operation) && !auth.isLoggedIn()) return Promise.reject(new Error('请先微信登录'));
  // The H5 server verifies the signed invitation and retains it across WeChat login.
  if (wx.isH5 && operation === 'ENROLL') return new Promise((resolve,reject) => wx.request({
    url:'/api/h5?action=enroll', method:'POST', timeout:30000, header:{'content-type':'application/json'},
    data:{classId:payload.classId,name:payload.name,phone:payload.phone,ref:wx.getReferralToken ? wx.getReferralToken() : ''},
    success(r){
      if(wx.getStorageSync('zionJwt')!==token){reject(new Error('登录身份已变化，请重试'));return;}
      if(r.statusCode===200&&r.data&&r.data.ok)resolve(r.data.data);
      else {if(r.statusCode===401)auth.expire(token);reject(new Error(readableError(r.data&&r.data.message)));}
    },fail:()=>reject(new Error('网络连接失败，请检查网络后重试'))
  }));
  return new Promise((resolve,reject) => wx.request({
    url: ZION_GRAPHQL_URL, method:'POST', timeout:30000,
    header: {'content-type':'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {})},
    data: {query:'mutation ConsultationService($args: Json!) { fz_invoke_action_flow(actionFlowId: "'+ACTION_FLOW_ID+'", versionId: 1, args: $args) }',variables:{args:{operation,payload}}},
    success(response) {
      if(token && wx.getStorageSync('zionJwt')!==token){reject(new Error('登录身份已变化，请重试'));return;}
      const body = response.data && typeof response.data === 'object' ? response.data : {};
      if (response.statusCode<200 || response.statusCode>=300 || body.errors) {
        const errors = body.errors;
        const message = errors && errors[0] && errors[0].message;
        if(auth.isAuthError(response.statusCode,message))auth.expire(token);
        reject(new Error(readableError(message))); return;
      }
      let output=body.data && body.data.fz_invoke_action_flow;
      if (typeof output==='string') { try {output=JSON.parse(output);} catch (_) {} }
      let result=output && (output.result || output);
      if (typeof result==='string') { try {result=JSON.parse(result);} catch (_) {} }
      if (!result || result.ok!==true) {if(auth.isAuthError(0,result && result.message))auth.expire(token);reject(new Error(readableError(result && result.message)));return;}
      resolve(result.data);
    }, fail: () => reject(new Error('网络连接失败，请检查网络后重试'))
  }));
}
function requestKey() { return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12); }
function formatTime(value) { if (!value) return '待安排'; const d=new Date(value); return isNaN(d.getTime()) ? value : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function decorate(item) { return {...item,statusText:labels[item.status]||item.status,attendanceText: item.attendance_status==='PENDING'?'待参加/待核实':labels[item.attendance_status],groupText:item.group_status==='PENDING'?'待联系':labels[item.group_status],timeText:formatTime(item.confirmed_at||item.starts_at),createdText:formatTime(item.created_at)}; }
function error(page, e) { page.setData({error:readableError(e && e.message)}); if(wx.pageScrollTo)wx.pageScrollTo({scrollTop:0,duration:200}); }
module.exports={call,requestKey,formatTime,decorate,labels,error};
