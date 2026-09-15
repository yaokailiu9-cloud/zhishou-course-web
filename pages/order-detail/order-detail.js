const zion = require("../../utils/zion");
const chatContext = require("../../utils/chatContext");

let detailTimer = null;

Page({
  data: {
    statusBarHeight: 54,
    navHeight: 100,
    navPaddingRight: 190,
    loading: true,
    orderId: "",
    sessionId: "",
    order: null,
    messages: []
  },

  onLoad(query = {}) {
    this.setCustomNav();
    this.setData({
      orderId: query.orderId || "",
      sessionId: query.sessionId || ""
    });
    this.refreshDetail();
  },

  onShow() {
    this.startPolling();
  },

  onHide() {
    this.stopPolling();
  },

  onUnload() {
    this.stopPolling();
  },

  setCustomNav() {
    try {
      const system = typeof wx.getWindowInfo === "function"
        ? wx.getWindowInfo()
        : wx.getSystemInfoSync();
      const menu = wx.getMenuButtonBoundingClientRect();
      const statusBarHeight = system.statusBarHeight || 54;
      const navHeight = menu.bottom + Math.max(menu.top - statusBarHeight, 6) + 14;
      const navPaddingRight = Math.max(system.windowWidth - menu.left + 16, 184);
      this.setData({ statusBarHeight, navHeight, navPaddingRight });
    } catch (error) {
      this.setData({ statusBarHeight: 54, navHeight: 100, navPaddingRight: 190 });
    }
  },

  refreshDetail() {
    return zion.getManagerOrderDetail({
      orderId: this.data.orderId,
      sessionId: this.data.sessionId
    })
      .then((result) => {
        this.setData({
          loading: false,
          order: result.order,
          sessionId: result.sessionId || this.data.sessionId,
          messages: result.messages || []
        });
      })
      .catch((error) => {
        console.warn("getManagerOrderDetail failed", error);
        this.setData({ loading: false });
        wx.showToast({ title: "读取记录失败", icon: "none" });
      });
  },

  startPolling() {
    this.stopPolling();
    detailTimer = setInterval(() => {
      this.refreshDetail();
    }, 3000);
  },

  stopPolling() {
    if (!detailTimer) return;
    clearInterval(detailTimer);
    detailTimer = null;
  },

  openChat() {
    if (!this.data.sessionId) return;
    const order = this.data.order || {};
    wx.setStorageSync("consultationSessionId", this.data.sessionId);
    wx.setStorageSync("currentChatRole", "manager");
    wx.setStorageSync("currentCustomerName", order.name || "客户");
    wx.setStorageSync("currentCustomerAvatarUrl", order.avatarUrl || "");
    wx.setStorageSync("currentCustomerAvatarText", order.avatarText || (order.name ? order.name.slice(0, 1) : "客"));
    wx.setStorageSync("currentSessionExpiresAt", order.expiresAt || "");
    wx.setStorageSync("currentSessionExpiresSessionId", this.data.sessionId);
    wx.setStorageSync("chatReturnUrl", `/pages/order-detail/order-detail?orderId=${this.data.orderId || ""}&sessionId=${this.data.sessionId}`);
    wx.setStorageSync("chatReturnSource", "manager-detail");
    chatContext.openChatPage({ role: "manager" });
  },

  goBack() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: "/pages/manager/manager?tab=serving" })
    });
  }
});
