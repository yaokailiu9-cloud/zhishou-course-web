const payment = require("./payment");
const zion = require("./zion");

function applyCustomerChatStorage(options = {}) {
  const sessionId = options.sessionId || wx.getStorageSync("consultationSessionId");
  if (!sessionId) {
    throw new Error("missing consultation session id");
  }

  const orderId = options.orderId || wx.getStorageSync("consultationOrderId") || "";
  const expiresAt = options.expiresAt || wx.getStorageSync("currentSessionExpiresAt") || "";
  const startedAt = options.startedAt || wx.getStorageSync("currentSessionStartedAt") || "";

  wx.setStorageSync("currentChatRole", "customer");
  wx.removeStorageSync("chatReturnUrl");
  wx.removeStorageSync("chatReturnSource");
  wx.setStorageSync("consultationSessionId", String(sessionId));
  if (orderId) {
    wx.setStorageSync("consultationOrderId", String(orderId));
  }
  if (options.topic) {
    wx.setStorageSync("consultationTopic", options.topic);
  }
  if (startedAt) {
    wx.setStorageSync("currentSessionStartedAt", startedAt);
    wx.setStorageSync("currentSessionStartedSessionId", String(sessionId));
  } else {
    wx.removeStorageSync("currentSessionStartedAt");
    wx.removeStorageSync("currentSessionStartedSessionId");
  }
  if (expiresAt) {
    wx.setStorageSync("currentSessionExpiresAt", expiresAt);
    wx.setStorageSync("currentSessionExpiresSessionId", String(sessionId));
    payment.markConsultationPaidUntil(new Date(expiresAt).getTime());
  } else {
    wx.removeStorageSync("currentSessionExpiresAt");
    wx.removeStorageSync("currentSessionExpiresSessionId");
  }

  if (options.managerName) {
    wx.setStorageSync("currentManagerName", options.managerName);
    wx.setStorageSync("currentManagerAvatarText", options.managerAvatarText || options.managerName.slice(0, 1));
  }

  const userInfo = wx.getStorageSync("userInfo") || {};
  if (userInfo.nickName) {
    wx.setStorageSync("currentCustomerName", userInfo.nickName);
    wx.setStorageSync("currentCustomerAvatarUrl", userInfo.avatarUrl || "");
    wx.setStorageSync("currentCustomerAvatarText", userInfo.nickName.slice(0, 1));
  }

  return { sessionId, orderId, expiresAt, startedAt };
}

function switchToCustomerChat(options = {}) {
  wx.setStorageSync("clientViewMode", "customer");
  return applyCustomerChatStorage(options);
}

function resolveCustomerChatContext(options = {}) {
  if (options.sessionId) {
    return Promise.resolve({
      sessionId: String(options.sessionId),
      orderId: options.orderId ? String(options.orderId) : "",
      expiresAt: options.expiresAt || "",
      topic: options.topic || "",
      paidUntil: options.paidUntil || 0,
      managerName: options.managerName || "",
      managerAvatarText: options.managerAvatarText || ""
    });
  }

  const storedSessionId = wx.getStorageSync("consultationSessionId");
  if (storedSessionId) {
    return Promise.resolve({
      sessionId: String(storedSessionId),
      orderId: wx.getStorageSync("consultationOrderId") || "",
      expiresAt: wx.getStorageSync("currentSessionExpiresAt") || "",
      topic: wx.getStorageSync("consultationTopic") || "",
      paidUntil: payment.getPaidUntil(),
      managerName: wx.getStorageSync("currentManagerName") || "",
      managerAvatarText: wx.getStorageSync("currentManagerAvatarText") || ""
    });
  }

  const userInfo = wx.getStorageSync("userInfo") || {};
  if (!userInfo.id) {
    return Promise.reject(new Error("not logged in"));
  }

  return zion.getCustomerServiceBinding(userInfo.id)
    .then((binding) => zion.getBoundConsultationSession(userInfo.id, {
      serviceProviderId: binding && binding.serviceProviderId,
      advisorId: binding && binding.advisorId
    }))
    .then((session) => {
      if (!session || !session.id) {
        return Promise.reject(new Error("no bound session"));
      }
      return {
        sessionId: session.id,
        orderId: session.orderId || "",
        expiresAt: session.expiresAt || "",
        startedAt: session.startedAt || "",
        topic: session.topic || "",
        paidUntil: session.effectiveExpiresAt || 0,
        managerName: wx.getStorageSync("currentManagerName") || "",
        managerAvatarText: wx.getStorageSync("currentManagerAvatarText") || ""
      };
    });
}

function isManagerChatContext() {
  return wx.getStorageSync("currentChatRole") === "manager";
}

function isManagerChatEntry() {
  if (wx.getStorageSync("clientViewMode") === "customer") return false;
  const source = wx.getStorageSync("chatReturnSource");
  if (source === "manager-serving" || source === "manager-detail") {
    return true;
  }
  if (wx.getStorageSync("currentChatRole") === "manager") {
    return true;
  }
  if (wx.getStorageSync("activeServiceProviderId")) {
    return true;
  }
  return false;
}

function preserveManagerChatContext() {
  if (!isManagerChatEntry()) return false;
  wx.setStorageSync("currentChatRole", "manager");
  return true;
}

function resetCustomerTabContext() {
  const returnSource = wx.getStorageSync("chatReturnSource");
  if (returnSource === "manager-serving" || returnSource === "manager-detail") {
    return false;
  }
  wx.setStorageSync("currentChatRole", "customer");
  wx.removeStorageSync("chatReturnUrl");
  wx.removeStorageSync("chatReturnSource");
  return true;
}

function openChatPage(options = {}) {
  if (options.role === "manager") {
    wx.setStorageSync("clientViewMode", "manager");
    return wx.switchTab({ url: "/pages/chat/chat" });
  }

  return resolveCustomerChatContext(options)
    .then((context) => {
      switchToCustomerChat(context);
      return wx.switchTab({ url: "/pages/chat/chat" });
    })
    .catch(() => {
      wx.showToast({ title: "请先购买咨询", icon: "none" });
    });
}

function enterCustomerView() {
  const wasManager = isManagerChatEntry();
  wx.setStorageSync("clientViewMode", "customer");
  ["currentChatRole", "chatReturnUrl", "chatReturnSource", "activeServiceProviderId", "activeManagerAccountId"].forEach((key) => wx.removeStorageSync(key));
  if (wasManager) {
    ["consultationSessionId", "consultationOrderId", "consultationTopic", "currentSessionExpiresAt", "currentSessionExpiresSessionId", "currentSessionStartedAt", "currentSessionStartedSessionId", "currentSessionStatus", "currentCustomerName", "currentCustomerAvatarUrl", "currentCustomerAvatarText", "paidUntil"].forEach((key) => wx.removeStorageSync(key));
  }
  wx.setStorageSync("currentChatRole", "customer");
  wx.showTabBar({ animation: false });
}

module.exports = {
  enterCustomerView,
  switchToCustomerChat,
  resolveCustomerChatContext,
  openChatPage,
  isManagerChatContext,
  isManagerChatEntry,
  preserveManagerChatContext,
  resetCustomerTabContext
};
