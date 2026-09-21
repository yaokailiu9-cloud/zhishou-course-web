const zion = require("../../utils/zion");
const chatContext = require("../../utils/chatContext");
const service = require("../../utils/consultationService");

const identityOptions = [
  { value: "MANAGER", label: "管理" },
  { value: "AGENT", label: "代理" },
  { value: "USER", label: "用户" }
];

const emptyStats = [
  { label: "服务中", value: "0", tone: "blue" },
  { label: "已完成", value: "0", tone: "gray" }
];

function buildStatsFromCounts(servingCount, completedCount) {
  return [
    { label: "服务中", value: String(servingCount), tone: "blue" },
    { label: "已完成", value: String(completedCount), tone: "gray" }
  ];
}

function getSessionExpiryInput(item = {}) {
  return {
    status: item.status,
    startedAt: item.startedAt,
    endedAt: item.endedAt,
    expiresAt: item.expiresAt,
    durationMinutes: item.durationMinutes,
    chatAvailableUntil: item.chatAvailableUntil
  };
}

function isCompletedSession(item = {}) {
  const expiresTimestamp = zion.resolveEffectiveSessionExpiry(getSessionExpiryInput(item));
  const expired = expiresTimestamp > 0 && expiresTimestamp <= Date.now();
  const status = String(item.status || "").toLowerCase();
  return Boolean(
    item.endedAt
    || expired
    || status === "closed"
    || status === "completed"
    || status === "finished"
    || status === "ended"
  );
}

function isServingSession(item = {}) {
  if (isCompletedSession(item)) return false;
  const status = String(item.status || "").toLowerCase();
  return status === "active" || status === "waiting";
}

function formatSessionStartAt(startedAt) {
  if (!startedAt) return "待开始";
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) return "刚开始";
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${hour}:${minute}`;
}

function formatRemainingLeft(expiresTimestamp) {
  const remainingMs = Math.max(0, Number(expiresTimestamp || 0) - Date.now());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function mapActiveSession(item) {
  const expiresTimestamp = zion.resolveEffectiveSessionExpiry(getSessionExpiryInput(item));
  const startedAtMs = item.startedAt ? new Date(item.startedAt).getTime() : 0;
  const durationMinutes = Number(item.durationMinutes || 60);
  const elapsed = startedAtMs
    ? Math.max(0, Math.floor((Date.now() - startedAtMs) / 60000))
    : 0;
  const progress = startedAtMs && durationMinutes
    ? Math.min(100, Math.max(0, Math.round((elapsed / durationMinutes) * 100)))
    : 0;

  return {
    id: item.id,
    orderId: item.orderId || "",
    name: item.customerNickname || "微信用户",
    avatarUrl: item.customerAvatarUrl || "",
    avatarText: item.customerAvatarText || (item.customerNickname ? item.customerNickname.slice(0, 1) : "客"),
    tag: item.problemCategory || "情感问答",
    tone: "red",
    topic: item.topic || "用户正在等待回复......",
    elapsed,
    durationMinutes,
    progress,
    left: expiresTimestamp
      ? formatRemainingLeft(expiresTimestamp)
      : (item.startedAt ? "00:00" : "待开始"),
    startAt: formatSessionStartAt(item.startedAt),
    startedAt: item.startedAt || "",
    price: item.amount || 200,
    expiresAt: expiresTimestamp ? new Date(expiresTimestamp).toISOString() : (item.expiresAt || "")
  };
}

function partitionManagerSessions(sessions = []) {
  let servingCount = 0;
  let completedCount = 0;
  const servingSessions = [];

  sessions.forEach((item) => {
    if (isCompletedSession(item)) {
      completedCount += 1;
      return;
    }
    if (isServingSession(item)) {
      servingCount += 1;
      servingSessions.push(mapActiveSession(item));
    }
  });

  return {
    servingCount,
    completedCount,
    servingSessions,
    stats: buildStatsFromCounts(servingCount, completedCount)
  };
}

Page({
  data: {
    statusBarHeight: 54,
    navHeight: 100,
    activeView: "workbench",
    pageTitle: "经理工作台",
    titleMap: {
      workbench: "经理工作台",
      serving: "服务中",
      identities: "身份管理"
    },
    stats: emptyStats,
    servingCount: 0,
    completedCount: 0,
    accessChecked: false,
    servingSessions: [],
    activeServiceProviderId: "",
    activeManagerAccountId: "",
    identityOptions,
    identityUsers: [],
    identitySearch: "",
    identityLoading: false,
    changingAccountId: "",
    manager: {
      name: "服务人员",
      avatar: "",
      rating: "0",
      verified: false
    },
  },

  onLoad(query = {}) {
    this.updateNavigationMetrics();
    this.resetSessionLists();
    if (query.tab) {
      this.switchViewByName(query.tab === "orders" ? "serving" : query.tab);
    }
    this.verifyManagerAccess()
      .then(() => this.fetchManagerData())
      .catch(() => {});
  },

  onShow() {
    this.updateNavigationMetrics();
    this.verifyManagerAccess()
      .then(() => this.fetchManagerData())
      .catch(() => {});
  },

  resetSessionLists() {
    this.setData({
      servingSessions: [],
      servingCount: 0,
      completedCount: 0,
      stats: emptyStats
    });
  },

  updateNavigationMetrics() {
    try {
      const system = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      const statusBarHeight = system.statusBarHeight || 24;
      const menu = wx.getMenuButtonBoundingClientRect();
      const validMenu = menu && menu.height > 0 && menu.top >= statusBarHeight;
      const navHeight = validMenu
        ? menu.bottom + Math.max(menu.top - statusBarHeight, 4)
        : statusBarHeight + 48;
      this.setData({ statusBarHeight, navHeight });
    } catch (_) {
      this.setData({ statusBarHeight: 54, navHeight: 100 });
    }
  },

  goCustomerPortal() {
    chatContext.enterCustomerView();
    wx.switchTab({ url: "/pages/profile/profile" });
  },

  goOfflineWorkbench() {
    wx.navigateTo({ url: "/pages/service-workbench/service-workbench" });
  },

  returnToProfile() {
    wx.removeStorageSync("currentChatRole");
    wx.switchTab({
      url: "/pages/profile/profile",
      fail: () => {
        wx.reLaunch({ url: "/pages/profile/profile" });
      }
    });
  },

  verifyManagerAccess() {
    const userInfo = wx.getStorageSync("userInfo");
    if (!userInfo || !userInfo.id || !wx.getStorageSync("zionJwt")) {
      this.setData({ accessChecked: false });
      wx.switchTab({ url: "/pages/profile/profile" });
      return Promise.reject(new Error("请先登录工作人员账号"));
    }

    return zion.getServiceProviderByAccount(userInfo.id)
      .then((provider) => {
        const allowed = Boolean(
          provider
          && provider.serviceStatus === "ACTIVE"
          && provider.serviceKind === "STAFF"
          && provider.canReply
          && provider.canAcceptOrder
        );
        if (!allowed) {
          wx.showToast({ title: "仅服务人员可进入", icon: "none" });
          wx.switchTab({ url: "/pages/profile/profile" });
          throw new Error("not service provider");
        }

        return this.applyServiceProvider(provider);
      })
      .catch((error) => {
        console.warn("verifyManagerAccess failed", error);
        throw error;
      });
  },

  applyServiceProvider(provider) {
    wx.setStorageSync("clientViewMode", "manager");
    wx.setStorageSync("activeServiceProviderId", provider.id || "");
    wx.setStorageSync("activeManagerAccountId", provider.accountId || "");
    this.setData({
      accessChecked: true,
      activeServiceProviderId: provider.id,
      activeManagerAccountId: provider.accountId,
      manager: {
        name: provider.displayName,
        avatar: provider.avatarUrl,
        rating: provider.rating || "0",
        verified: provider.verified
      }
    });
    return provider;
  },

  fetchSessions() {
    if (!this.data.activeServiceProviderId && !this.data.activeManagerAccountId) {
      this.resetSessionLists();
      return Promise.resolve();
    }

    return zion.listManagerSessions({
      status: "",
      serviceProviderId: this.data.activeServiceProviderId,
      managerAccountId: this.data.activeManagerAccountId
    })
      .then((result) => {
        const sessions = (result && result.sessions) || [];
        const partitioned = partitionManagerSessions(sessions);
        this.setData({
          stats: partitioned.stats,
          servingCount: partitioned.servingCount,
          completedCount: partitioned.completedCount,
          servingSessions: partitioned.servingSessions
        });
      })
      .catch((error) => {
        console.warn("manager backend sync failed", error);
        this.resetSessionLists();
      });
  },

  fetchManagerData() {
    return this.data.activeView === "identities"
      ? this.loadIdentityUsers()
      : this.fetchSessions();
  },

  switchView(event) {
    this.switchViewByName(event.currentTarget.dataset.view);
  },

  switchViewByName(view) {
    const allowed = ["workbench", "serving", "identities"];
    if (!allowed.includes(view)) return;
    const nextData = {
      activeView: view,
      pageTitle: this.data.titleMap[view] || "经理工作台"
    };
    this.setData(nextData);
    this.fetchManagerData();
  },

  decorateIdentityUser(item = {}) {
    const index = Math.max(0, identityOptions.findIndex((option) => option.value === item.identity));
    return {
      ...item,
      id: String(item.id || ""),
      avatarText: item.name ? item.name.slice(0, 1) : "用",
      identityIndex: index,
      identityLabel: identityOptions[index].label
    };
  },

  applyIdentityFilter(keyword = this.data.identitySearch) {
    const query = String(keyword || "").trim().toLowerCase();
    const rows = (this.allIdentityUsers || []).filter((item) => (
      !query
      || String(item.name || "").toLowerCase().includes(query)
      || String(item.id || "").includes(query)
    ));
    this.setData({ identityUsers: rows, identitySearch: keyword });
  },

  loadIdentityUsers() {
    this.setData({ identityLoading: true });
    return service.call("LIST_ACCOUNT_IDENTITIES")
      .then((result) => {
        this.allIdentityUsers = (result.items || []).map((item) => this.decorateIdentityUser(item));
        this.applyIdentityFilter();
      })
      .catch((error) => {
        wx.showToast({ title: error.message || "身份列表加载失败", icon: "none" });
        throw error;
      })
      .finally(() => this.setData({ identityLoading: false }));
  },

  onIdentitySearch(event) {
    this.applyIdentityFilter(event.detail.value || "");
  },

  onIdentityChange(event) {
    const dataset = event.currentTarget.dataset || {};
    const target = (this.allIdentityUsers || []).find((item) => String(item.id) === String(dataset.id));
    const option = identityOptions[Number(event.detail.value)];
    if (!target || !option || target.isSelf || target.identity === option.value) return;
    wx.showModal({
      title: "确认修改身份",
      content: `将“${target.name}”从${target.identityLabel}改为${option.label}？`,
      confirmText: "确认修改",
      success: (choice) => {
        if (!choice.confirm) return;
        this.setData({ changingAccountId: target.id });
        service.call("SET_ACCOUNT_IDENTITY", {
          targetAccountId: target.id,
          identity: option.value,
          note: "由管理页面调整"
        }).then(() => {
          wx.showToast({ title: "身份已更新", icon: "success" });
          return this.loadIdentityUsers();
        }).catch((error) => {
          wx.showToast({ title: error.message || "身份修改失败", icon: "none" });
        }).finally(() => this.setData({ changingAccountId: "" }));
      }
    });
  },

  enterChat(event) {
    const sessionId = event.currentTarget.dataset.id;
    if (sessionId) {
      const session = (this.data.servingSessions || []).find((item) => String(item.id) === String(sessionId)) || {};
      wx.setStorageSync("consultationSessionId", sessionId);
      wx.setStorageSync("currentChatRole", "manager");
      wx.setStorageSync("activeServiceProviderId", this.data.activeServiceProviderId || "");
      wx.setStorageSync("activeManagerAccountId", this.data.activeManagerAccountId || "");
      wx.setStorageSync("currentManagerName", this.data.manager.name || "服务人员");
      wx.setStorageSync("currentManagerAvatarText", this.data.manager.name ? this.data.manager.name.slice(0, 1) : "师");
      wx.setStorageSync("currentCustomerName", session.name || "客户");
      wx.setStorageSync("currentCustomerAvatarUrl", session.avatarUrl || "");
      wx.setStorageSync("currentCustomerAvatarText", session.avatarText || (session.name ? session.name.slice(0, 1) : "客"));
      if (session.startedAt) {
        wx.setStorageSync("currentSessionStartedAt", session.startedAt);
        wx.setStorageSync("currentSessionStartedSessionId", sessionId);
      } else {
        wx.removeStorageSync("currentSessionStartedAt");
        wx.removeStorageSync("currentSessionStartedSessionId");
      }
      if (session.expiresAt) {
        wx.setStorageSync("currentSessionExpiresAt", session.expiresAt);
        wx.setStorageSync("currentSessionExpiresSessionId", sessionId);
      } else {
        wx.removeStorageSync("currentSessionExpiresAt");
        wx.removeStorageSync("currentSessionExpiresSessionId");
      }
      wx.setStorageSync("chatReturnUrl", "/pages/manager/manager?tab=serving");
      wx.setStorageSync("chatReturnSource", "manager-serving");
    }
    chatContext.openChatPage({ role: "manager" });
  },

  openOrderDetail(event) {
    const dataset = event.currentTarget.dataset || {};
    const orderId = dataset.orderId || "";
    const sessionId = dataset.sessionId || dataset.id || "";
    const params = [];
    if (orderId) params.push(`orderId=${encodeURIComponent(orderId)}`);
    if (sessionId) params.push(`sessionId=${encodeURIComponent(sessionId)}`);
    wx.navigateTo({
      url: `/pages/order-detail/order-detail${params.length ? `?${params.join("&")}` : ""}`
    });
  },

});
