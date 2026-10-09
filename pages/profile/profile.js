const viewSession = require("../../utils/viewSession");
const checkinService = require("../../utils/consultationService");
const chatContext = require("../../utils/chatContext");
const zion = require("../../utils/zion");
const testCustomerPreview = require("../../utils/testCustomerPreview");
const { userPortrait } = require("../../utils/mock");

Page({
  data: {
    statusBarHeight: 54,
    navHeight: 104,
    isLoggedIn: false,
    canCheckin: false,
    canInvite: false,
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
    testCustomerPreviewActive: false
  },

  onLoad() {
    this.setCustomNav();
  },

  onShow() {
    wx.showTabBar({ animation: false });
    this.setCustomNav();
    this.setData({ testCustomerPreviewActive: testCustomerPreview.isActive() });
    this.hydrateUserFromStorage();
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
      this.accessGeneration = (this.accessGeneration || 0) + 1;
      this.setData({
        isLoggedIn: false,
        canCheckin: false,
        canInvite: false,
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
    this.loadManagerAccess(storedUser);
  },

  goMyPlan() {
    chatContext.enterCustomerView();
    wx.navigateTo({url:'/pages/customer/customer?plans=1'});
  },

  goReferrals(){wx.navigateTo({url:'/pages/referrals/referrals'});},
  goQuestionnaireShare(){wx.navigateTo({url:'/pages/questionnaire-share/questionnaire-share'});},
  goCheckin(){wx.navigateTo({url:'/pages/checkin/checkin'});},

  onUnload() { this.accessGeneration = (this.accessGeneration || 0) + 1; },

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

  async loadManagerAccess(userInfo = this.data.userInfo) {
    const identity = viewSession.capture();
    const generation = this.accessGeneration = (this.accessGeneration || 0) + 1;
    const current = () => generation === this.accessGeneration && viewSession.current(identity);
    // No cached role or referral response may expose staff/agent menus.
    this.setData({canInvite:false,canCheckin:false,isServiceProvider:false,serviceProvider:null,managerAccessLoading:!!(userInfo && userInfo.id)});
    if (!userInfo || !userInfo.id || String(userInfo.id) !== identity.accountId) return null;
    try {
      const provider = await zion.getServiceProviderByAccount(userInfo.id);
      if (!current()) return null;
      const active = !!(provider && String(provider.accountId) === String(userInfo.id) && provider.serviceStatus === 'ACTIVE');
      const manager = active && zion.isManagerProvider(provider);
      const agent = active && provider.serviceKind === 'AGENT';
      this.setData({canInvite:agent || manager,isServiceProvider:manager,serviceProvider:manager ? provider : null,managerAccessLoading:false});
      // Ordinary users have exactly two business entries and make no staff requests.
      if (!manager) return null;
      const [checkin, sessionsResult] = await Promise.allSettled([
        checkinService.call('CHECKIN_ACCESS'),
        zion.listManagerSessions({serviceProviderId:provider.id,managerAccountId:provider.accountId})
      ]);
      if (!current()) return null;
      let servingCount = 0, completedCount = 0;
      const sessions = sessionsResult.status === 'fulfilled' ? sessionsResult.value && sessionsResult.value.sessions || [] : [];
      sessions.forEach(item => {
        const expiry = zion.resolveEffectiveSessionExpiry(item);
        const status = String(item.status || '').toLowerCase();
        if (item.endedAt || expiry > 0 && expiry <= Date.now() || ['closed','completed','finished','ended'].includes(status)) completedCount++;
        else if (status === 'active' || status === 'waiting') servingCount++;
      });
      this.setData({canCheckin:checkin.status === 'fulfilled' && checkin.value.allowed === true,managerStats:[{label:'服务中',value:servingCount},{label:'已完成',value:completedCount}]});
      return provider;
    } catch (error) {
      if (!current()) return null;
      console.warn('loadManagerAccess failed', error);
      this.setData({canInvite:false,canCheckin:false,isServiceProvider:false,serviceProvider:null,managerAccessLoading:false});
      return null;
    }
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
    this.accessGeneration = (this.accessGeneration || 0) + 1;
    chatContext.enterCustomerView();
    ["consultationSessionId", "consultationOrderId", "customerServiceBinding", "paidUntil", "testCustomerPreviewActive", "testCustomerPreviewBackup"].forEach((key) => wx.removeStorageSync(key));
    this.setData({
      isLoggedIn: false,
      canInvite: false,
      canCheckin: false,
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
