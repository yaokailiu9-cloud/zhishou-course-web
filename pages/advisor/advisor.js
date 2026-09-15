const zion = require("../../utils/zion");
const auth = require("../../utils/auth");
const service = require("../../utils/consultationService");
Page({
  data: {advisor:null, loading:true, error:"", bookingButtonText:"查看线下咨询资格", bookingBlocked:false, paying:false},
  onLoad(query={}) {this.advisorId=query.id;this.refresh();},
  async refresh(){this.setData({loading:true,error:""});try{const r=await zion.getAdvisor(this.advisorId);this.setData({advisor:r.advisor || null,error:r.advisor?'':'该专家介绍不存在或暂不可用。'});}catch(e){this.setData({error:'专家介绍加载失败，请检查网络后重试。'});}finally{this.setData({loading:false});}},
  goBack(){wx.navigateBack({fail:()=>wx.switchTab({url:'/pages/index/index'})});},
  confirmAndPay() {
    if (!auth.requireLogin("登录后查看公开课参加情况及咨询预约资格。") || this.data.paying) return;
    this.setData({paying:true});
    service.call("MY_OVERVIEW").then(r=>wx.navigateTo({url:r.eligible?"/pages/customer/customer":"/pages/public-class/public-class"})).catch(e=>wx.showModal({title:"暂时无法读取预约资格",content:e.message,showCancel:false})).finally(()=>this.setData({paying:false}));
  }
});
