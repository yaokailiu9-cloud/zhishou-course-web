const zion = require("./zion");
const payment = require("./payment");
const chatContext = require("./chatContext");

const TEST_CUSTOMER_ACCOUNT_ID = "1000000000000002";
const TEST_CUSTOMER_FALLBACK = {
  nickName: "测试客户小安",
  avatarUrl: "https://api.dicebear.com/7.x/thumbs/png?seed=test-customer-xiaoan"
};
const PREVIEW_ACTIVE_KEY = "testCustomerPreviewActive";
const PREVIEW_BACKUP_KEY = "testCustomerPreviewBackup";

function isActive() {
  return Boolean(wx.getStorageSync(PREVIEW_ACTIVE_KEY));
}

function readBackup() {
  return wx.getStorageSync(PREVIEW_BACKUP_KEY) || null;
}

function snapshotCurrentState() {
  return {
    userInfo: wx.getStorageSync("userInfo") || null,
    customerServiceBinding: wx.getStorageSync("customerServiceBinding") || null,
    consultationSessionId: wx.getStorageSync("consultationSessionId") || "",
    consultationOrderId: wx.getStorageSync("consultationOrderId") || "",
    consultationTopic: wx.getStorageSync("consultationTopic") || "",
    currentChatRole: wx.getStorageSync("currentChatRole") || "",
    chatReturnUrl: wx.getStorageSync("chatReturnUrl") || "",
    chatReturnSource: wx.getStorageSync("chatReturnSource") || "",
    activeServiceProviderId: wx.getStorageSync("activeServiceProviderId") || "",
    activeManagerAccountId: wx.getStorageSync("activeManagerAccountId") || "",
    currentManagerName: wx.getStorageSync("currentManagerName") || "",
    currentManagerAvatarText: wx.getStorageSync("currentManagerAvatarText") || "",
    currentCustomerName: wx.getStorageSync("currentCustomerName") || "",
    currentCustomerAvatarUrl: wx.getStorageSync("currentCustomerAvatarUrl") || "",
    currentCustomerAvatarText: wx.getStorageSync("currentCustomerAvatarText") || "",
    currentSessionExpiresAt: wx.getStorageSync("currentSessionExpiresAt") || "",
    currentSessionExpiresSessionId: wx.getStorageSync("currentSessionExpiresSessionId") || "",
    paidUntil: wx.getStorageSync("paidUntil") || 0
  };
}

function applyBackup(backup) {
  if (!backup) return;

  if (backup.userInfo) {
    wx.setStorageSync("userInfo", backup.userInfo);
  }
  if (backup.customerServiceBinding) {
    wx.setStorageSync("customerServiceBinding", backup.customerServiceBinding);
  } else {
    wx.removeStorageSync("customerServiceBinding");
  }

  const restoreKey = (key, value) => {
    if (value !== undefined && value !== null && value !== "") {
      wx.setStorageSync(key, value);
    } else {
      wx.removeStorageSync(key);
    }
  };

  restoreKey("consultationSessionId", backup.consultationSessionId);
  restoreKey("consultationOrderId", backup.consultationOrderId);
  restoreKey("consultationTopic", backup.consultationTopic);
  restoreKey("currentChatRole", backup.currentChatRole);
  restoreKey("chatReturnUrl", backup.chatReturnUrl);
  restoreKey("chatReturnSource", backup.chatReturnSource);
  restoreKey("activeServiceProviderId", backup.activeServiceProviderId);
  restoreKey("activeManagerAccountId", backup.activeManagerAccountId);
  restoreKey("currentManagerName", backup.currentManagerName);
  restoreKey("currentManagerAvatarText", backup.currentManagerAvatarText);
  restoreKey("currentCustomerName", backup.currentCustomerName);
  restoreKey("currentCustomerAvatarUrl", backup.currentCustomerAvatarUrl);
  restoreKey("currentCustomerAvatarText", backup.currentCustomerAvatarText);
  restoreKey("currentSessionExpiresAt", backup.currentSessionExpiresAt);
  restoreKey("currentSessionExpiresSessionId", backup.currentSessionExpiresSessionId);

  if (backup.paidUntil) {
    payment.markConsultationPaidUntil(Number(backup.paidUntil));
  } else {
    wx.removeStorageSync("paidUntil");
  }
}

function clearManagerContext() {
  wx.setStorageSync("currentChatRole", "customer");
  wx.removeStorageSync("chatReturnUrl");
  wx.removeStorageSync("chatReturnSource");
  wx.removeStorageSync("activeServiceProviderId");
  wx.removeStorageSync("activeManagerAccountId");
}

function enter() {
  if (isActive()) {
    return Promise.resolve({ alreadyActive: true });
  }

  wx.setStorageSync(PREVIEW_BACKUP_KEY, snapshotCurrentState());
  wx.setStorageSync(PREVIEW_ACTIVE_KEY, true);

  return zion.getAccountProfile(TEST_CUSTOMER_ACCOUNT_ID)
    .then((profile) => {
      const user = {
        id: TEST_CUSTOMER_ACCOUNT_ID,
        nickName: (profile && profile.nickName) || TEST_CUSTOMER_FALLBACK.nickName,
        avatarUrl: (profile && profile.avatarUrl) || TEST_CUSTOMER_FALLBACK.avatarUrl,
        role: "customer",
        phone: (profile && profile.phone) || ""
      };
      wx.setStorageSync("userInfo", user);
      wx.setStorageSync("currentCustomerName", user.nickName);
      wx.setStorageSync("currentCustomerAvatarUrl", user.avatarUrl);
      wx.setStorageSync("currentCustomerAvatarText", user.nickName.slice(0, 1));
      clearManagerContext();
      return zion.getCustomerServiceBinding(TEST_CUSTOMER_ACCOUNT_ID);
    })
    .then((binding) => {
      if (binding && binding.advisorId) {
        wx.setStorageSync("customerServiceBinding", binding);
      }
      if (binding && binding.advisorName) {
        wx.setStorageSync("currentManagerName", binding.advisorName);
        wx.setStorageSync("currentManagerAvatarText", binding.advisorName.slice(0, 1));
      }
      return chatContext.resolveCustomerChatContext(
        binding && binding.consultationSessionId
          ? { sessionId: binding.consultationSessionId }
          : {}
      );
    })
    .then((context) => {
      chatContext.switchToCustomerChat({
        ...context,
        managerName: wx.getStorageSync("currentManagerName") || "曜恺",
        managerAvatarText: wx.getStorageSync("currentManagerAvatarText") || "曜"
      });
      return context;
    });
}

function exit() {
  if (!isActive()) {
    return Promise.resolve({ alreadyInactive: true });
  }

  const backup = readBackup();
  applyBackup(backup);
  wx.removeStorageSync(PREVIEW_ACTIVE_KEY);
  wx.removeStorageSync(PREVIEW_BACKUP_KEY);
  return Promise.resolve({ restored: true });
}

module.exports = {
  TEST_CUSTOMER_ACCOUNT_ID,
  TEST_CUSTOMER_FALLBACK,
  isActive,
  enter,
  exit
};
