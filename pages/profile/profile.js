const viewSession = require("../../utils/viewSession");
const checkinService = require("../../utils/consultationService");
const chatContext = require("../../utils/chatContext");
const payment = require("../../utils/payment");
const zion = require("../../utils/zion");
const testCustomerPreview = require("../../utils/testCustomerPreview");
const { userPortrait } = require("../../utils/mock");

function formatPaidUntil(timestamp) {
  if (!timestamp) return "暂无有效服务";
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${month}-${day} ${hour}:${minute} 到期`;
}

Page({
  data: {
    statusBarHeight: 54,
    navHeight: 104,
    isLoggedIn: false,
    canCheckin: false,
    userInfo: {},
    defaultPortrait: userPortrait,
    avatarText: "客",
    isServiceProvider: false,
    serviceProvider: null,
    managerAccessLoading: false,
    managerStats: [
      { label: "服务中", value: 0 },
      { label: "已完成", value: 0 }
    ],
    managerMenuItems: [
      { label: "工作台", icon: "工", view: "workbench" },
      { label: "服务中", icon: "服", view: "serving" }
    ],
    loginLoading: false,
    loginTip: "",
    loginForm: {
      nickName: "",
      avatarUrl: ""
    },
    consultationStatus: "未开通",
    paidUntilText: "暂无有效服务",
    orderCards: [
      { label: "待支付", value: 0 },
      { label: "服务中", value: 0 },
      { label: "已完成", value: 0 }
    ],
    accountBalanceText: "0.00",
    testCustomerPreviewActive: false
  },

  onLoad() {
    this.setCustomNav();
    this.hydrateUserFromStorage();
  },

  onShow() {
    wx.showTabBar({ animation: false });
    this.setCustomNav();
    this.setData({ testCustomerPreviewActive: testCustomerPreview.isActive() });
    this.hydrateUserFromStorage();
    this.refreshAccess();
  },

  refreshCustomerSummary(accountId) {
    const identity=viewSession.capture();
    zion.getCustomerAccountSummary(accountId)
      .then((summary) => {
        if (!summary) return;
        if(!viewSession.current(identity))return;
        this.setData({
          accountBalanceText: summary.totalSpentText || "0.00",
          orderCards: summary.orderCards || this.data.orderCards
        });
      })
      .catch((error) => {
        console.warn("refreshCustomerSummary failed", error);
      });
  },

  setCustomNav() {
    try {
      const system = typeof wx.getWindowInfo === "function"
        ? wx.getWindowInfo()
        : wx.getSystemInfoSync();
      const menu = wx.getMenuButtonBoundingClientRect();
      const statusBarHeight = system.statusBarHeight || 54;
      const menuGap = menu.top - statusBarHeight;
      const navHeight = menu.bottom + Math.max(menuGap, 6);
      this.setData({ statusBarHeight, navHeight });
    } catch (error) {
      this.setData({ statusBarHeight: 54, navHeight: 104 });
    }
  },

  clearWechatLoginCache() {
    wx.removeStorageSync("wechatUserInfo");
    wx.removeStorageSync("wechatLoginRecord");
  },

  hydrateUserFromStorage() {
    const storedUser = wx.getStorageSync("userInfo");
    const zionJwt = wx.getStorageSync("zionJwt");
    if (!storedUser || !storedUser.id || !zionJwt) {
      this.setData({
        isLoggedIn: false,
        canCheckin: false,
        userInfo: {},
        avatarText: "客",
        isServiceProvider: false,
        serviceProvider: null,
        managerAccessLoading: false
      });
      return;
    }

    this.setData({
      isLoggedIn: true,
      userInfo: storedUser,
      avatarText: storedUser.nickName ? storedUser.nickName.slice(0, 1) : "客"
    });
    this.refreshBackendUser(storedUser.id);
    this.refreshCustomerSummary(storedUser.id);
    this.loadManagerAccess(storedUser);
    this.loadCheckinAccess();
  },

  async loadCheckinAccess() {
    const identity = viewSession.capture();
    this.setData({ canCheckin: false });
    try {
      const result = await checkinService.call('CHECKIN_ACCESS');
      if (viewSession.current(identity)) this.setData({ canCheckin: !!result.allowed });
    } catch (_) {
      if (viewSession.current(identity)) this.setData({ canCheckin: false });
    }
  },

  goCheckin() { wx.navigateTo({ url: '/pages/checkin/checkin' }); },

  refreshBackendUser(accountId) {
    const identity=viewSession.capture();
    zion.getAccountProfile(accountId)
      .then((backendUser) => {
        if (!backendUser || !backendUser.id) return;
        if(!viewSession.current(identity))return;
        const mergedUser = {
          ...(wx.getStorageSync("userInfo") || {}),
          ...backendUser
        };
        wx.setStorageSync("userInfo", mergedUser);
        this.setData({
          userInfo: mergedUser,
          avatarText: mergedUser.nickName ? mergedUser.nickName.slice(0, 1) : "客"
        });
      })
      .catch((error) => {
        console.warn("refreshBackendUser failed", error);
      });
  },

  loadManagerAccess(userInfo = this.data.userInfo) {
    const identity=viewSession.capture();
    if (!userInfo || !userInfo.id) {
      this.setData({
        isServiceProvider: false,
        serviceProvider: null,
        managerAccessLoading: false
      });
      return Promise.resolve(null);
    }

    this.setData({ managerAccessLoading: true });
    return zion.getServiceProviderByAccount(userInfo.id)
      .then((provider) => {
        if(!viewSession.current(identity))return null;
        const allowed = Boolean(
          provider
          && provider.serviceStatus === "ACTIVE"
          && (provider.canReply || provider.canAcceptOrder)
        );
        if (!allowed) {
          this.setData({
            isServiceProvider: false,
            serviceProvider: null,
            managerAccessLoading: false
          });
          return null;
        }

        return zion.listManagerSessions({
          serviceProviderId: provider.id,
          managerAccountId: provider.accountId
        }).then((result) => {
          if(!viewSession.current(identity))return null;
          const sessions = (result && result.sessions) || [];
          let servingCount = 0;
          let completedCount = 0;
          sessions.forEach((item) => {
            const expiresTimestamp = zion.resolveEffectiveSessionExpiry({
              status: item.status,
              startedAt: item.startedAt,
              endedAt: item.endedAt,
              expiresAt: item.expiresAt,
              durationMinutes: item.durationMinutes,
              chatAvailableUntil: item.chatAvailableUntil
            });
            const expired = expiresTimestamp > 0 && expiresTimestamp <= Date.now();
            const status = String(item.status || "").toLowerCase();
            const completed = Boolean(
              item.endedAt
              || expired
              || status === "closed"
              || status === "completed"
              || status === "finished"
              || status === "ended"
            );
            if (completed) {
              completedCount += 1;
            } else if (status === "active" || status === "waiting") {
              servingCount += 1;
            }
          });

          this.setData({
            isServiceProvider: true,
            serviceProvider: provider,
            managerStats: [
              { label: "服务中", value: servingCount },
              { label: "已完成", value: completedCount }
            ],
            managerAccessLoading: false
          });
          return provider;
        });
      })
      .catch((error) => {
        if(!viewSession.current(identity))return null;
        console.warn("loadManagerAccess failed", error);
        this.setData({
          isServiceProvider: false,
          serviceProvider: null,
          managerAccessLoading: false
        });
        return null;
      });
  },

  refreshAccess() {
    const paidUntil = Number(wx.getStorageSync("paidUntil") || 0);
    const hasActive = payment.hasActiveConsultation();
    this.setData({
      consultationStatus: hasActive ? "服务中" : "未开通",
      paidUntilText: formatPaidUntil(paidUntil)
    });
  },

  onChooseLoginAvatar(event) {
    this.setData({ "loginForm.avatarUrl": event.detail.avatarUrl || "" });
  },

  onLoginNickNameInput(event) {
    this.setData({ "loginForm.nickName": event.detail.value });
  },

  loginByWechat() {
    if (this.data.loginLoading) return;

    const nickName = String(this.data.loginForm.nickName || "").trim();
    const avatarUrl = this.data.loginForm.avatarUrl || "";

    this.setData({ loginLoading: true, loginTip: "正在通过微信确认身份..." });

    zion.loginWithWechatIdentity({ nickName, avatarUrl })
      .then((loginResult) => {
        const backendUser = loginResult && loginResult.user ? loginResult.user : {};
        const syncedUser = {
          id: backendUser.id || "",
          nickName: backendUser.nickName || nickName || "微信用户",
          avatarUrl: backendUser.avatarUrl || avatarUrl || "",
          role: backendUser.role || "customer",
          phone: backendUser.phone || ""
        };

        if (!syncedUser.id) {
          throw new Error("后端未返回账户 ID，不能完成登录。");
        }

        wx.setStorageSync("userInfo", syncedUser);

        this.setData({
          isLoggedIn: true,
          userInfo: syncedUser,
          avatarText: syncedUser.nickName ? syncedUser.nickName.slice(0, 1) : "客",
          loginLoading: false,
          loginForm: {
            nickName: "",
            avatarUrl: ""
          },
          loginTip: loginResult && loginResult.isNewAccount
            ? "已创建账户并登录成功。"
            : "欢迎回来，已恢复你的微信账户。"
        });
        this.refreshCustomerSummary(syncedUser.id);
        this.loadManagerAccess(syncedUser);
        wx.showToast({
          title: loginResult && loginResult.isNewAccount ? "账户已创建" : "欢迎回来",
          icon: "success"
        });
        require("../../utils/loginReturn").clear();
        wx.switchTab({ url: "/pages/index/index" });
      })
      .catch((error) => {
        console.warn("loginWithWechatIdentity failed", error);
        const raw = String(error && error.message || "");
        let message = raw.replace(/^Zion GraphQL request failed:\s*/i, "") || "登录未完成，请稍后重试。";
        if (/用户名已被使用/.test(message)) {
          message = "该用户名已被使用，请换一个用户名。";
        } else if (/请填写用户名|请选择头像/.test(message)) {
          message = raw;
        } else if (/微信登录失败/.test(message)) {
          message = "微信登录失败，请稍后重试。";
        }
        this.setData({
          loginLoading: false,
          loginTip: message
        });
        wx.showToast({ title: "登录失败", icon: "none" });
      });
  },

  goCustomerPortal() {
    chatContext.enterCustomerView();
    wx.navigateTo({ url: "/pages/customer/customer" });
  },

  goPublicClasses() {
    chatContext.enterCustomerView();
    wx.navigateTo({ url: "/pages/public-class/public-class" });
  },

  goOfflineWorkbench() {
    wx.navigateTo({ url: "/pages/service-workbench/service-workbench" });
  },

  goPlaza() {
    wx.switchTab({ url: "/pages/plaza/plaza" });
  },

  goSupport(){wx.navigateTo({url:"/pages/support/support"});},
  goAbout(){wx.navigateTo({url:"/pages/support/support?kind=about"});},

  goPrivacy() {
    wx.navigateTo({ url: "/pages/privacy/privacy" });
  },

  goEditProfile() {
    wx.navigateTo({ url: "/pages/profile-edit/profile-edit" });
  },

  goManagerSection(event) {
    const view = event.currentTarget.dataset.view || "workbench";
    wx.navigateTo({ url: `/pages/manager/manager?tab=${view}` });
  },

  exitTestCustomerPreview() {
    testCustomerPreview.exit()
      .then(() => {
        this.setData({ testCustomerPreviewActive: false });
        this.hydrateUserFromStorage();
        this.refreshAccess();
        wx.showToast({ title: "已回到经理身份", icon: "none" });
        wx.navigateTo({ url: "/pages/manager/manager?tab=workbench" });
      })
      .catch(() => {
        wx.showToast({ title: "恢复失败", icon: "none" });
      });
  },

  logout() {
    require("../../utils/loginReturn").clear();
    this.clearWechatLoginCache();
    wx.removeStorageSync("profileDraft");
    wx.removeStorageSync("userInfo");
    wx.removeStorageSync("zionJwt");
    chatContext.enterCustomerView();
    ["consultationSessionId", "consultationOrderId", "customerServiceBinding", "paidUntil", "testCustomerPreviewActive", "testCustomerPreviewBackup"].forEach((key) => wx.removeStorageSync(key));
    this.setData({
      isLoggedIn: false,
      userInfo: {},
      avatarText: "客",
      isServiceProvider: false,
      serviceProvider: null,
      managerAccessLoading: false,
      managerStats: [
        { label: "服务中", value: 0 },
        { label: "已完成", value: 0 }
      ],
      loginForm: {
        nickName: "",
        avatarUrl: ""
      },
      loginTip: ""
    });
  }
});
