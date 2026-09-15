// 统一登录门槛：所有业务操作（预约、聊天、支付等）必须先登录。
function getLoggedInUser() {
  const userInfo = wx.getStorageSync("userInfo") || {};
  const jwt = wx.getStorageSync("zionJwt") || "";
  if (userInfo.id && jwt) {
    return userInfo;
  }
  return null;
}

function isLoggedIn() {
  return Boolean(getLoggedInUser());
}

// 未登录时弹窗引导去登录页，返回是否已登录。
let prompting = false;
function requireLogin(message, options = {}) {
  if (isLoggedIn()) {
    return true;
  }

  if (prompting) return false;
  prompting = true;
  const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
  const returnPage = pages[pages.length - 1];
  wx.showModal({
    title: "请先登录",
    content: message || "登录后报名公开课、查看预约和咨询记录。",
    confirmText: "去登录",
    cancelText: "暂不登录",
    complete() { prompting = false; },
    success(res) {
      prompting = false;
      if (res.confirm) {
        require("./loginReturn").remember(returnPage, options);
        wx.switchTab({ url: "/pages/profile/profile" });
      } else {
        require("./loginReturn").clear();
      }
    }
  });
  return false;
}

function isAuthError(status, message) {
  return status === 401 || /unauthorized|unauthenticated|jwt|token.*expired|not authenticated|登录已过期|请先微信登录/i.test(String(message || ""));
}
function expire(token) {
  if(!token || wx.getStorageSync("zionJwt") !== token)return;
  const pages=typeof getCurrentPages === "function"?getCurrentPages():[];
  const page=pages[pages.length-1],user=wx.getStorageSync("userInfo") || {};
  const continuation=require("./loginReturn");
  continuation.remember(page,{accountId:user.id,preserveForm:true});
  ["zionJwt","userInfo","profileDraft","paidUntil","consultationSessionId","consultationOrderId","customerServiceBinding","currentChatRole","activeServiceProviderId","activeManagerAccountId","currentCustomerName","currentCustomerAvatarUrl","currentCustomerAvatarText"].forEach(k=>wx.removeStorageSync(k));
  for(const p of pages){
    if(p.route==='pages/profile/profile')p.setData({isLoggedIn:false,userInfo:{},serviceProvider:null,isServiceProvider:false,managerAccessLoading:false,accountBalanceText:'0.00'});
    if(p.route==='pages/chat/chat')p.setData({hasAccess:false,messages:[],input:'',failedMessage:'',sendError:'登录已过期，请重新登录。',sessionDrawerVisible:false,managerSessionList:[]});
  }
  if(!prompting && typeof wx.showModal==='function'){
    prompting=true;
    wx.showModal({title:'登录已过期',content:'请重新微信登录后继续，本页未提交的表单会为当前账号临时保留。',confirmText:'重新登录',cancelText:'稍后再说',
      success:r=>{prompting=false;if(r.confirm)wx.switchTab({url:'/pages/profile/profile'});},complete:()=>{prompting=false;}});
  }
}
module.exports = {getLoggedInUser,isLoggedIn,requireLogin,isAuthError,expire};
