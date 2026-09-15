const zion = require("./zion");

const CONSULTATION_PACKAGE = {
  skuId: "emotion_chat_60min",
  title: "1 小时情感咨询",
  minutes: 60,
  price: 200,
  amountFen: 20000
};
const DEV_SKIP_WECHAT_PAYMENT = false;

function getPaidUntil() {
  return Number(wx.getStorageSync("paidUntil") || 0);
}

function hasActiveConsultation() {
  return getPaidUntil() > Date.now();
}

function markConsultationPaid(minutes = 60) {
  const paidUntil = Date.now() + minutes * 60 * 1000;
  wx.setStorageSync("paidUntil", paidUntil);
  return paidUntil;
}

function markConsultationPaidUntil(timestamp) {
  const paidUntil = Number(timestamp || 0);
  if (paidUntil) {
    wx.setStorageSync("paidUntil", paidUntil);
  }
  return paidUntil;
}

function clearSessionTimerStorage() {
  wx.removeStorageSync("currentSessionExpiresAt");
  wx.removeStorageSync("currentSessionExpiresSessionId");
  wx.removeStorageSync("currentSessionStartedAt");
  wx.removeStorageSync("currentSessionStartedSessionId");
}

function applyPaidSessionStorage(session) {
  clearSessionTimerStorage();
  if (session && session.id) {
    wx.setStorageSync("consultationSessionId", session.id);
  }
}

function applyRenewedSessionStorage(sessionId, session, expiresAt) {
  wx.setStorageSync("consultationSessionId", sessionId);
  const startedAt = session && (session.started_at || session.startedAt);
  if (startedAt && expiresAt) {
    wx.setStorageSync("currentSessionStartedAt", startedAt);
    wx.setStorageSync("currentSessionStartedSessionId", String(sessionId));
    wx.setStorageSync("currentSessionExpiresAt", expiresAt);
    wx.setStorageSync("currentSessionExpiresSessionId", String(sessionId));
    return;
  }
  clearSessionTimerStorage();
  if (sessionId) {
    wx.setStorageSync("consultationSessionId", sessionId);
  }
}

function getConsultationPrice() {
  return Number(wx.getStorageSync("currentServicePrice") || CONSULTATION_PACKAGE.price);
}

function ensureWechatLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => resolve(res.code),
      fail: reject
    });
  });
}

function showBindingBlocked(message, options = {}) {
  wx.showModal({
    title: options.title || "无法预约",
    content: message || "你已绑定专属咨询师，不能预约其他老师。",
    showCancel: false
  });
}

function cacheCustomerBinding(binding) {
  if (binding && binding.advisorId) {
    wx.setStorageSync("customerServiceBinding", binding);
    if (binding.consultationSessionId) {
      wx.setStorageSync("consultationSessionId", binding.consultationSessionId);
    }
  } else {
    wx.removeStorageSync("customerServiceBinding");
  }
}

function startConsultationPayment({ advisorId, advisorName, remark } = {}) {
  const userInfo = wx.getStorageSync("userInfo") || {};
  const args = arguments[0] || {};
  const servicePrice = Number(args.price || wx.getStorageSync("currentServicePrice") || CONSULTATION_PACKAGE.price);
  const serviceMinutes = Number(args.minutes || wx.getStorageSync("currentServiceMinutes") || CONSULTATION_PACKAGE.minutes);
  const packageData = {
    ...CONSULTATION_PACKAGE,
    minutes: serviceMinutes,
    price: servicePrice,
    amountFen: Math.round(servicePrice * 100)
  };

  const prepareBooking = () => zion.assertCanBookAdvisor(userInfo.id, advisorId)
    .then((check) => {
      if (!check.allowed) {
        const error = new Error(check.message);
        error.code = check.reason === "manager" ? "MANAGER_BLOCKED" : "BINDING_BLOCKED";
        throw error;
      }
      return zion.resolveAdvisorServiceProvider(advisorId).then((resolved) => ({
        check,
        resolved
      }));
    });

  const finalizeBinding = (check, resolved, result) => {
    if (check && check.binding && check.binding.advisorId) {
      cacheCustomerBinding(check.binding);
      return result;
    }
    return zion.ensureCustomerServiceBinding({
      customerAccountId: userInfo.id,
      advisorId: resolved.advisorId,
      serviceProviderId: resolved.serviceProviderId
    }).then((binding) => {
      cacheCustomerBinding(binding);
      return result;
    }).catch((error) => {
      if (error && error.code === "BINDING_CONFLICT") {
        showBindingBlocked(error.message);
      }
      return result;
    });
  };

  if (DEV_SKIP_WECHAT_PAYMENT) {
    return prepareBooking()
      .then(({ check, resolved }) => zion.createPaymentOrder({
        ...packageData,
        advisorId: resolved.advisorId,
        advisorName: resolved.advisorName || advisorName,
        remark,
        customerAccountId: userInfo.id,
        problemCategory: "恋爱情感",
        issueSummary: remark,
        source: "miniapp-dev"
      })
        .then((res) => {
          const orderId = res && (res.orderId || (res.data && res.data.orderId));
          return zion.confirmPayment(orderId, {
            customerAccountId: userInfo.id,
            advisorId: resolved.advisorId,
            managerAccountId: resolved.managerAccountId,
            serviceProviderId: resolved.serviceProviderId,
            minutes: serviceMinutes,
            sessionStatus: "waiting",
            topic: remark,
            source: "miniapp-dev",
            customerNickname: userInfo.nickName || "微信用户",
            customerAvatarUrl: userInfo.avatarUrl || ""
          }).then((confirmRes) => {
            const session = confirmRes && confirmRes.session;
            const paidUntil = markConsultationPaid(serviceMinutes);
            wx.setStorageSync("consultationOrderId", orderId);
            applyPaidSessionStorage(session);
            wx.setStorageSync("currentManagerName", resolved.advisorName || advisorName || "");
            const result = { orderId, session, paidUntil, devPayment: true };
            return finalizeBinding(check, resolved, result);
          });
        }))
      .catch((error) => {
        if (error && (error.code === "BINDING_BLOCKED" || error.code === "MANAGER_BLOCKED")) {
          showBindingBlocked(error.message);
          throw error;
        }
        if (error && error.code === "MISSING_SERVICE_PROVIDER") {
          wx.showModal({
            title: "暂时无法预约",
            content: error.message,
            showCancel: false
          });
          throw error;
        }
        console.warn("dev payment backend write failed, continue local flow", error);
        const paidUntil = markConsultationPaid(serviceMinutes);
        const localOrderId = `local_${Date.now()}`;
        wx.setStorageSync("consultationOrderId", localOrderId);
        clearSessionTimerStorage();
        return {
          orderId: localOrderId,
          session: null,
          paidUntil,
          devPayment: true,
          localOnly: true
        };
      });
  }

  return prepareBooking()
    .then(({ check, resolved }) => ensureWechatLogin()
      .then((code) => zion.createPaymentOrder({
        ...packageData,
        advisorId: resolved.advisorId,
        advisorName: resolved.advisorName || advisorName,
        remark,
        loginCode: code
      }))
      .then((res) => {
        const payParams = res && (res.payParams || (res.data && res.data.payParams));
        const orderId = res && (res.orderId || (res.data && res.data.orderId));

        if (!payParams) {
          throw new Error("missing pay params");
        }

        return new Promise((resolve, reject) => {
          wx.requestPayment({
            ...payParams,
            success: () => {
              zion.confirmPayment(orderId, {
                customerAccountId: userInfo.id,
                advisorId: resolved.advisorId,
                managerAccountId: resolved.managerAccountId,
                serviceProviderId: resolved.serviceProviderId,
                minutes: serviceMinutes,
                sessionStatus: "waiting",
                topic: remark,
                source: "miniapp",
                customerNickname: userInfo.nickName || "微信用户",
                customerAvatarUrl: userInfo.avatarUrl || ""
              }).then((confirmRes) => {
                const session = confirmRes && confirmRes.session;
                const paidUntil = markConsultationPaid(serviceMinutes);
                wx.setStorageSync("consultationOrderId", orderId);
                applyPaidSessionStorage(session);
                wx.setStorageSync("currentManagerName", resolved.advisorName || advisorName || "");
                return finalizeBinding(check, resolved, { orderId, session, paidUntil });
              }).then(resolve).catch(reject);
            },
            fail: reject
          });
        });
      }))
    .catch((error) => {
      if (error && (error.code === "BINDING_BLOCKED" || error.code === "MANAGER_BLOCKED")) {
        showBindingBlocked(error.message);
      }
      throw error;
    });
}

function renewConsultationPayment({ sessionId, minutes, price } = {}) {
  const userInfo = wx.getStorageSync("userInfo") || {};
  const activeSessionId = sessionId || wx.getStorageSync("consultationSessionId");
  const servicePrice = Number(price || wx.getStorageSync("currentServicePrice") || CONSULTATION_PACKAGE.price);
  const serviceMinutes = Number(minutes || wx.getStorageSync("currentServiceMinutes") || CONSULTATION_PACKAGE.minutes);
  const packageData = {
    ...CONSULTATION_PACKAGE,
    minutes: serviceMinutes,
    price: servicePrice,
    amountFen: Math.round(servicePrice * 100)
  };

  if (!activeSessionId) {
    return Promise.reject(new Error("missing consultation session"));
  }

  if (DEV_SKIP_WECHAT_PAYMENT) {
    return zion.createPaymentOrder({
      ...packageData,
      customerAccountId: userInfo.id,
      remark: `续费 ${serviceMinutes} 分钟聊天`,
      problemCategory: "续费",
      issueSummary: `续费 ${serviceMinutes} 分钟聊天`,
      source: "miniapp-renewal"
    }).then((res) => {
      const orderId = res && (res.orderId || (res.data && res.data.orderId));
      return zion.confirmSessionRenewal(orderId, {
        sessionId: activeSessionId,
        minutes: serviceMinutes
      }).then((renewRes) => {
        const session = renewRes.session;
        const expiresAt = renewRes.expiresAt || (session && (session.expires_at || session.expiresAt));
        if (expiresAt) {
          markConsultationPaidUntil(new Date(expiresAt).getTime());
        } else {
          clearSessionTimerStorage();
        }
        wx.setStorageSync("consultationOrderId", orderId);
        applyRenewedSessionStorage(activeSessionId, session, expiresAt);
        return {
          orderId,
          sessionId: activeSessionId,
          expiresAt: expiresAt || "",
          paidUntil: expiresAt ? new Date(expiresAt).getTime() : 0,
          devPayment: true,
          renewal: true
        };
      });
    });
  }

  return ensureWechatLogin()
    .then((code) => zion.createPaymentOrder({
      ...packageData,
      customerAccountId: userInfo.id,
      remark: `续费 ${serviceMinutes} 分钟聊天`,
      problemCategory: "续费",
      issueSummary: `续费 ${serviceMinutes} 分钟聊天`,
      source: "miniapp-renewal",
      loginCode: code
    }))
    .then((res) => {
      const payParams = res && (res.payParams || (res.data && res.data.payParams));
      const orderId = res && (res.orderId || (res.data && res.data.orderId));

      if (!payParams) {
        throw new Error("missing pay params");
      }

      return new Promise((resolve, reject) => {
        wx.requestPayment({
          ...payParams,
          success: () => {
            zion.confirmSessionRenewal(orderId, {
              sessionId: activeSessionId,
              minutes: serviceMinutes
            }).then((renewRes) => {
              const session = renewRes.session;
              const expiresAt = renewRes.expiresAt || (session && (session.expires_at || session.expiresAt));
              if (expiresAt) {
                markConsultationPaidUntil(new Date(expiresAt).getTime());
              } else {
                clearSessionTimerStorage();
              }
              wx.setStorageSync("consultationOrderId", orderId);
              applyRenewedSessionStorage(activeSessionId, session, expiresAt);
              resolve({
                orderId,
                sessionId: activeSessionId,
                expiresAt: expiresAt || "",
                paidUntil: expiresAt ? new Date(expiresAt).getTime() : 0,
                renewal: true
              });
            }).catch(reject);
          },
          fail: reject
        });
      });
    });
}

function showPaymentUnavailable() {
  wx.showModal({
    title: "暂未接通微信支付",
    content: "前端已改成先支付后聊天。还需要开通微信支付商户号，并让 Zion 后端创建订单后返回支付参数。",
    showCancel: false
  });
}

module.exports = {
  CONSULTATION_PACKAGE,
  getConsultationPrice,
  getPaidUntil,
  hasActiveConsultation,
  markConsultationPaid,
  markConsultationPaidUntil,
  startConsultationPayment,
  renewConsultationPayment,
  showPaymentUnavailable
};
