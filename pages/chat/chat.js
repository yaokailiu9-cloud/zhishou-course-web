const zion = require("../../utils/zion");
const payment = require("../../utils/payment");
const auth = require("../../utils/auth");
const viewSession = require("../../utils/viewSession");
const chatContext = require("../../utils/chatContext");
const managerUnread = require("../../utils/managerUnread");

let messageId = 1;
let countdownTimer = null;
let managerSessionCountdownTimer = null;
let messagePollTimer = null;
let loadingMessages = false;
let serviceEndNoticeShown = false;
const MANAGER_RECALL_REEDIT_MS = 60 * 1000;

const fallbackReplies = [
  "我听到了。这听起来确实是一份沉重的负担。你愿意多说一点这件事最让你难受的部分吗？",
  "谢谢你跟我分享这些。敞开心扉需要很大的勇气。我们可以先从最困扰你的一个点开始。",
  "我在听。你刚才提到的部分很重要，我们可以一起慢慢梳理，不急着马上做决定。",
  "这件事对你来说应该消耗了不少情绪。你希望我先陪你分析原因，还是先帮你整理该怎么沟通？"
];

function isManagerChatView() {
  return chatContext.isManagerChatEntry();
}

Page({
  goOfflineConsultation() {
    chatContext.enterCustomerView();
    wx.navigateTo({url:"/pages/customer/customer"});
  },
  data: {
    statusBarHeight: 54,
    navHeight: 100,
    navPaddingRight: 190,
    hasAccess: false,
    serviceEnded: false,
    renewing: false,
    canRenew: false,
    managerName: "林静",
    managerAvatarText: "林",
    servicePriceText: "¥200 / 小时",
    customerAvatarUrl: "",
    customerAvatarText: "客",
    chatRole: "customer",
    isManagerView: false,
    chatTitle: "文字聊天",
    chatSubtitle: "¥200 / 60 分钟",
    serviceLabel: "未开通",
    serviceDesc: "在上方查看线下咨询记录",
    systemText: "新咨询请先参加免费公开课，到课核实后申请线下咨询。",
    composerPlaceholder: "暂无历史聊天会话，请前往线下咨询",
    leftAvatarText: "林",
    leftAvatarUrl: "",
    rightAvatarText: "客",
    rightAvatarUrl: "",
    remainingText: "00:00",
    paidUntilText: "",
    input: "",
    sending: false,
    sendError: "",
    failedMessage: "",
    scrollIntoView: "",
    messages: [],
    sessionDrawerVisible: false,
    canOpenSessionDrawer: false,
    managerSessionList: [],
    managerSessionLoading: false,
    managerTotalUnread: 0,
    managerCustomerMessagesBySession: {},
    activeSessionId: "",
    reeditSourceMessageId: "",
    serviceCardCollapsed: false
  },

  onLoad(query = {}) {
    this.unloaded = false;
    this.hidden = false;
    if (query.sessionId) {
      wx.setStorageSync("consultationSessionId", query.sessionId);
    }
    if (query.role) {
      wx.setStorageSync("currentChatRole", query.role);
    }
    this.setCustomNav();
    this.hydrateChatIdentity();
    this.ensureCustomerBoundSession().finally(() => {
      this.syncSessionAccessFromBackend();
      this.loadBackendMessages();
    });
    this.detectManagerDrawerAccess();
  },

  onTabItemTap() {
    if (chatContext.isManagerChatEntry()) {
      chatContext.preserveManagerChatContext();
    } else {
      chatContext.resetCustomerTabContext();
    }
    this.hydrateChatIdentity();
    this.refreshAccess();
    this.loadBackendMessages();
  },

  onShow() {
    this.hidden = false;
    const identity = viewSession.capture();
    if (this.chatIdentity && !viewSession.current(this.chatIdentity)) {
      this.chatDrafts = {};
      this.setData({input:"", messages:[], sendError:"", failedMessage:"", hasAccess:false});
    }
    this.chatIdentity = identity;
    if (!auth.isLoggedIn()) {
      wx.showTabBar({ animation: false });
      auth.requireLogin("登录后才能使用咨询服务。");
      return;
    }
    if (chatContext.isManagerChatEntry()) {
      chatContext.preserveManagerChatContext();
    }
    wx.showTabBar({ animation: false });
    this.hydrateChatIdentity();
    this.ensureCustomerBoundSession().finally(() => {
      if (!viewSession.current(identity) || this.hidden || this.unloaded) return;
      require("../../utils/loginReturn").restore(this,"chat","");
      this.syncSessionAccessFromBackend().finally(() => {
        if (!viewSession.current(identity) || this.hidden || this.unloaded) return;
        this.refreshAccess();
        this.startCountdown();
      });
      this.loadBackendMessages();
    });
    this.startMessagePolling();
    this.detectManagerDrawerAccess().then(() => {
      if (!viewSession.current(identity) || this.hidden || this.unloaded) return;
      if (this.data.canOpenSessionDrawer || this.data.isManagerView || isManagerChatView()) {
        this.loadManagerSessionList({ silent: true });
      }
    });
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

  onHide() {
    this.hidden = true;
    this.viewEpoch = (this.viewEpoch || 0) + 1;
    this.messageRequest = null;
    this.timingRequest = null;
    this.stopCountdown();
    this.stopManagerSessionCountdown();
    this.stopMessagePolling();
    this.setData({ sessionDrawerVisible: false });
    wx.showTabBar({ animation: false });
  },

  onUnload() {
    this.unloaded = true;
    this.chatDrafts = {};
    this.stopCountdown();
    this.stopManagerSessionCountdown();
    this.stopMessagePolling();
  },

  refreshAccess() {
    const userInfo = wx.getStorageSync("userInfo") || {};
    const isManager = isManagerChatView() || this.data.isManagerView;
    const previousEnded = this.data.serviceEnded;
    const sessionClosed = wx.getStorageSync("currentSessionStatus") === "closed";
    const hasPaidSession = !!wx.getStorageSync("consultationSessionId") && !sessionClosed;
    const timerStarted = this.isSessionTimerStarted();
    const activeUntil = timerStarted ? this.resolveActiveUntil() : 0;
    const serviceEnded = timerStarted && activeUntil > 0 && activeUntil <= Date.now();
    const hasAccess = timerStarted ? activeUntil > Date.now() : hasPaidSession;
    const remainingText = timerStarted
      ? (activeUntil ? this.formatRemaining(activeUntil) : "00:00")
      : (hasPaidSession ? "待开始" : "00:00");
    if (!serviceEnded) {
      serviceEndNoticeShown = false;
    }

    if (isManager) {
      const nextData = {
        hasAccess,
        serviceEnded,
        paidUntilText: "",
        remainingText: timerStarted ? remainingText : (hasPaidSession ? "待开始" : "--:--"),
        serviceLabel: serviceEnded ? "已结束" : (timerStarted ? "服务中" : "待开始"),
        serviceDesc: serviceEnded ? "客户续费后可继续聊天" : (timerStarted ? "正在回复客户的咨询消息" : "回复客户后开始 1 小时计时"),
        composerPlaceholder: serviceEnded ? "服务已结束" : "回复客户"
      };
      this.setData(nextData);
      this.notifyServiceEnded(previousEnded, serviceEnded);
      return nextData;
    }

    const paidUntilText = timerStarted && hasAccess ? this.formatTime(activeUntil) : "";
    const nextData = {
      hasAccess,
      serviceEnded,
      paidUntilText,
      remainingText,
      serviceLabel: serviceEnded ? "已结束" : (timerStarted ? "服务中" : (hasPaidSession ? "待开始" : "未开通")),
      serviceDesc: serviceEnded ? "您的服务聊天时间已经结束" : (timerStarted ? "1 小时文字服务正在进行" : (hasPaidSession ? "等待经理回复，回复后开始计时" : "请从上方进入线下咨询")),
      composerPlaceholder: serviceEnded ? "服务已结束" : (hasAccess ? "输入想聊的问题" : "暂无历史会话，请查看线下咨询")
    };
    this.setData(nextData);
    this.notifyServiceEnded(previousEnded, serviceEnded);
    return nextData;
  },

  startCountdown() {
    this.stopCountdown();
    this.refreshAccess();
    countdownTimer = setInterval(() => {
      this.refreshAccess();
      this.refreshRecallReeditVisibility();
      if (this.data.serviceEnded) {
        this.stopCountdown();
      }
    }, 1000);
  },

  canShowRecallReedit(sentAt, recalledAt, replacedByMessageId) {
    if (replacedByMessageId) return false;
    const sentTimestamp = sentAt ? new Date(sentAt).getTime() : 0;
    if (sentTimestamp && !Number.isNaN(sentTimestamp)) {
      return Date.now() - sentTimestamp <= MANAGER_RECALL_REEDIT_MS;
    }
    const recalledTimestamp = recalledAt ? new Date(recalledAt).getTime() : 0;
    if (recalledTimestamp && !Number.isNaN(recalledTimestamp)) {
      return Date.now() - recalledTimestamp <= MANAGER_RECALL_REEDIT_MS;
    }
    return false;
  },

  refreshRecallReeditVisibility() {
    const messages = this.data.messages || [];
    if (!messages.some((item) => item.type === "recall-notice")) {
      return;
    }

    let changed = false;
    const nextMessages = messages.map((item) => {
      if (item.type !== "recall-notice") {
        return item;
      }
      const canReedit = this.canShowRecallReedit(item.sentAt, item.recalledAt, item.replacedByMessageId);
      if (item.canReedit === canReedit) {
        return item;
      }
      changed = true;
      return { ...item, canReedit };
    });

    if (changed) {
      this.setData({ messages: nextMessages });
    }
  },

  isSessionTimerStarted() {
    const sessionId = wx.getStorageSync("consultationSessionId");
    const startedAt = wx.getStorageSync("currentSessionStartedAt");
    const startedSessionId = wx.getStorageSync("currentSessionStartedSessionId");
    if (startedAt) {
      const startedTimestamp = new Date(startedAt).getTime();
      if (!Number.isNaN(startedTimestamp)) {
        const sessionMatches = !sessionId
          || !startedSessionId
          || String(startedSessionId) === String(sessionId);
        if (sessionMatches) {
          return true;
        }
      }
    }

    const sessionIdForList = sessionId || this.data.activeSessionId;
    const sessionItem = (this.data.managerSessionList || []).find(
      (item) => String(item.id) === String(sessionIdForList)
    );
    return !!(sessionItem && sessionItem.startedAt);
  },

  getActiveUntil() {
    if (!this.isSessionTimerStarted()) {
      return 0;
    }

    const sessionId = wx.getStorageSync("consultationSessionId");
    const expiresSessionId = wx.getStorageSync("currentSessionExpiresSessionId");
    const sessionExpiresAt = wx.getStorageSync("currentSessionExpiresAt");
    if (sessionExpiresAt) {
      const sessionTimestamp = new Date(sessionExpiresAt).getTime();
      if (!Number.isNaN(sessionTimestamp)) {
        const sessionMatches = !sessionId
          || !expiresSessionId
          || String(expiresSessionId) === String(sessionId);
        if (sessionMatches) {
          return sessionTimestamp;
        }
      }
    }

    const sessionIdForList = sessionId || this.data.activeSessionId;
    const sessionItem = (this.data.managerSessionList || []).find(
      (item) => String(item.id) === String(sessionIdForList)
    );
    if (sessionItem && sessionItem.expiresTimestamp) {
      return Number(sessionItem.expiresTimestamp);
    }

    return 0;
  },

  resolveActiveUntil() {
    return this.getActiveUntil();
  },

  notifyServiceEnded(previousEnded, serviceEnded) {
    if (!serviceEnded || previousEnded || serviceEndNoticeShown) return;
    serviceEndNoticeShown = true;
    wx.showModal({
      title: "服务已结束",
      content: "您的服务聊天时间已经结束。",
      showCancel: false,
      confirmText: "知道了"
    });
  },

  stopCountdown() {
    if (!countdownTimer) return;
    clearInterval(countdownTimer);
    countdownTimer = null;
  },

  hydrateSessionTiming(force = false) {
    const identity = viewSession.capture();
    const request = {};
    this.timingRequest = request;
    const sessionId = wx.getStorageSync("consultationSessionId");
    const expiresSessionId = wx.getStorageSync("currentSessionExpiresSessionId");
    const startedSessionId = wx.getStorageSync("currentSessionStartedSessionId");
    const hasExpiresAt = !!wx.getStorageSync("currentSessionExpiresAt") && String(expiresSessionId || "") === String(sessionId || "");
    const hasStartedAt = !!wx.getStorageSync("currentSessionStartedAt") && String(startedSessionId || "") === String(sessionId || "");
    if (!sessionId || (!force && hasStartedAt && hasExpiresAt) || !zion.getConsultationSession) {
      return Promise.resolve(false);
    }

    return zion.getConsultationSession(sessionId)
      .then((session) => {
        if (!session || this.unloaded || this.hidden || !viewSession.current(identity, true) || this.timingRequest !== request) return false;

        wx.setStorageSync("currentSessionStatus", session.status || "");

        if (session.startedAt) {
          wx.setStorageSync("currentSessionStartedAt", session.startedAt);
          wx.setStorageSync("currentSessionStartedSessionId", session.id || sessionId);
          const expiresTimestamp = zion.resolveEffectiveSessionExpiry(session);
          if (expiresTimestamp && !Number.isNaN(expiresTimestamp)) {
            wx.setStorageSync("currentSessionExpiresAt", new Date(expiresTimestamp).toISOString());
            wx.setStorageSync("currentSessionExpiresSessionId", session.id || sessionId);
            if (expiresTimestamp > Date.now()) {
              payment.markConsultationPaidUntil(expiresTimestamp);
            }
          }
        } else {
          wx.removeStorageSync("currentSessionStartedAt");
          wx.removeStorageSync("currentSessionStartedSessionId");
          wx.removeStorageSync("currentSessionExpiresAt");
          wx.removeStorageSync("currentSessionExpiresSessionId");
        }

        if (!wx.getStorageSync("currentCustomerName") && session.customerNickname) {
          wx.setStorageSync("currentCustomerName", session.customerNickname);
          wx.setStorageSync("currentCustomerAvatarUrl", session.customerAvatarUrl || "");
          wx.setStorageSync("currentCustomerAvatarText", session.customerAvatarText || "客");
          this.hydrateChatIdentity();
        }
        const access = this.refreshAccess();
        if (access.hasAccess && !access.serviceEnded) {
          this.startCountdown();
        }
        return access.hasAccess && !access.serviceEnded;
      })
      .catch((error) => {
        console.warn("hydrateSessionTiming failed", error);
        return false;
      });
  },

  syncSessionAccessFromBackend() {
    return this.hydrateSessionTiming(true);
  },

  ensureCustomerBoundSession() {
    if (isManagerChatView()) {
      return Promise.resolve(false);
    }
    if (wx.getStorageSync("consultationSessionId")) {
      return Promise.resolve(true);
    }

    const userInfo = wx.getStorageSync("userInfo") || {};
    if (!userInfo.id || !chatContext.resolveCustomerChatContext) {
      return Promise.resolve(false);
    }

    const identity = viewSession.capture();
    return chatContext.resolveCustomerChatContext()
      .then((context) => {
        if (this.unloaded || this.hidden || !viewSession.current(identity, true)) return false;
        chatContext.switchToCustomerChat(context);
        return true;
      })
      .catch(() => false);
  },

  startMessagePolling() {
    this.stopMessagePolling();
    messagePollTimer = setInterval(() => {
      this.loadBackendMessages({ silent: true });
      this.syncSessionAccessFromBackend();
      if (this.data.canOpenSessionDrawer || this.data.isManagerView || isManagerChatView()) {
        this.loadManagerSessionList({ silent: true });
      }
    }, 2500);
  },

  stopMessagePolling() {
    if (!messagePollTimer) return;
    clearInterval(messagePollTimer);
    messagePollTimer = null;
  },

  hydrateChatIdentity() {
    const userInfo = wx.getStorageSync("userInfo") || {};
    const isManagerView = isManagerChatView() || this.data.sessionDrawerVisible;
    const chatRole = isManagerView ? "manager" : (wx.getStorageSync("currentChatRole") || "customer");
    const managerName = wx.getStorageSync("currentManagerName") || this.data.managerName;
    const managerAvatarText = wx.getStorageSync("currentManagerAvatarText") || (managerName ? managerName.slice(0, 1) : this.data.managerAvatarText);
    const servicePrice = Number(wx.getStorageSync("currentServicePrice") || payment.CONSULTATION_PACKAGE.price);
    const customerName = wx.getStorageSync("currentCustomerName") || userInfo.nickName || "客户";
    const customerAvatarUrl = wx.getStorageSync("currentCustomerAvatarUrl") || userInfo.avatarUrl || "";
    const customerAvatarText = wx.getStorageSync("currentCustomerAvatarText") || (customerName ? customerName.slice(0, 1) : "客");
    this.setData({
      chatRole,
      isManagerView,
      canRenew: !isManagerView && !!wx.getStorageSync("consultationSessionId"),
      managerName,
      managerAvatarText,
      chatTitle: isManagerView ? customerName : "文字聊天",
      chatSubtitle: isManagerView ? "服务会话" : "历史文字会话",
      serviceLabel: isManagerView ? "服务会话" : (this.data.hasAccess ? "服务中" : "未开通"),
      serviceDesc: isManagerView ? "正在回复客户的咨询消息" : (this.data.hasAccess ? "1 小时文字服务正在进行" : "请从上方进入线下咨询"),
      systemText: isManagerView ? "你正在以服务人员身份回复客户，消息会实时保存到后端记录。" : (wx.getStorageSync("consultationSessionId") ? "这里保留你的历史文字服务会话。新预约与跟进请查看线下咨询。" : "参加免费公开课并核实到课后，可申请线下咨询。请点击上方入口继续。"),
      composerPlaceholder: isManagerView ? "回复客户" : (this.data.hasAccess ? "输入想聊的问题" : "暂无历史会话，请查看线下咨询"),
      servicePriceText: isManagerView ? "经理回复" : `¥${servicePrice.toLocaleString("en-US")} / 小时`,
      customerAvatarUrl,
      customerAvatarText,
      leftAvatarText: isManagerView ? customerAvatarText : managerAvatarText,
      leftAvatarUrl: isManagerView ? customerAvatarUrl : "",
      rightAvatarText: isManagerView ? managerAvatarText : customerAvatarText,
      rightAvatarUrl: isManagerView ? "" : customerAvatarUrl
    });
    if (isManagerView) {
      this.setData({
        activeSessionId: wx.getStorageSync("consultationSessionId") || this.data.activeSessionId || "",
        canOpenSessionDrawer: true
      });
    }
  },

  preventTouchMove() {},

  detectManagerDrawerAccess() {
    const identity = viewSession.capture();
    if (wx.getStorageSync("clientViewMode") === "customer") {
      this.setData({ canOpenSessionDrawer: false, sessionDrawerVisible: false });
      return Promise.resolve(false);
    }
    const userInfo = wx.getStorageSync("userInfo") || {};
    if (!userInfo.id) {
      this.setData({ canOpenSessionDrawer: false });
      return Promise.resolve(false);
    }

    if (isManagerChatView()) {
      chatContext.preserveManagerChatContext();
      if (!wx.getStorageSync("chatReturnSource")) {
        wx.setStorageSync("chatReturnSource", "manager-serving");
      }
      this.setData({ canOpenSessionDrawer: true });
      return Promise.resolve(true);
    }

    const storedProviderId = wx.getStorageSync("activeServiceProviderId");
    if (storedProviderId) {
      this.setData({ canOpenSessionDrawer: true });
      return Promise.resolve(true);
    }

    return zion.getServiceProviderByAccount(userInfo.id)
      .then((provider) => {
        if (!viewSession.current(identity) || this.hidden || this.unloaded) return false;
        const allowed = !!(provider && provider.id && provider.serviceStatus === "ACTIVE");
        if (allowed) {
          wx.setStorageSync("activeServiceProviderId", provider.id);
          wx.setStorageSync("activeManagerAccountId", provider.accountId || userInfo.id);
        }
        this.setData({ canOpenSessionDrawer: allowed });
        return allowed;
      })
      .catch(() => {
        if (!viewSession.current(identity) || this.hidden || this.unloaded) return false;
        this.setData({ canOpenSessionDrawer: false });
        return false;
      });
  },

  onNavMarkTap() {
    if (!this.data.isManagerView && !this.data.canOpenSessionDrawer && !isManagerChatView()) {
      return;
    }
    this.ensureManagerDrawerReady()
      .then((ready) => {
        if (!ready) return;
        if (this.data.sessionDrawerVisible) {
          this.closeSessionDrawer();
          return;
        }
        this.openSessionDrawer();
      });
  },

  onCustomerAvatarTap() {
    if (!this.data.isManagerView && !this.data.canOpenSessionDrawer && !isManagerChatView()) {
      return;
    }
    this.onNavMarkTap();
  },

  ensureManagerDrawerReady() {
    if (this.data.isManagerView || isManagerChatView()) {
      chatContext.preserveManagerChatContext();
      if (!wx.getStorageSync("chatReturnSource")) {
        wx.setStorageSync("chatReturnSource", "manager-serving");
      }
      if (!this.data.canOpenSessionDrawer) {
        this.setData({ canOpenSessionDrawer: true });
      }
      if (!this.data.isManagerView) {
        this.hydrateChatIdentity();
      }
      return Promise.resolve(true);
    }

    return this.detectManagerDrawerAccess().then((allowed) => {
      if (!allowed) {
        wx.showToast({ title: "仅服务人员可切换客户", icon: "none" });
        return false;
      }
      chatContext.preserveManagerChatContext();
      if (!wx.getStorageSync("chatReturnSource")) {
        wx.setStorageSync("chatReturnSource", "manager-serving");
      }
      if (!this.data.isManagerView) {
        this.hydrateChatIdentity();
      }
      return true;
    });
  },

  openSessionDrawer() {
    chatContext.preserveManagerChatContext();
    if (!wx.getStorageSync("chatReturnSource")) {
      wx.setStorageSync("chatReturnSource", "manager-serving");
    }
    this.setData({
      sessionDrawerVisible: true,
      isManagerView: true,
      chatRole: "manager",
      chatSubtitle: "服务会话"
    }, () => {
      this.hydrateChatIdentity();
      this.loadManagerSessionList();
    });
  },

  closeSessionDrawer() {
    this.setData({ sessionDrawerVisible: false });
  },

  resolveManagerSessionDisplay(session, expiresTimestamp) {
    const now = Date.now();
    const expired = expiresTimestamp > 0 && expiresTimestamp <= now;
    if (session.status === "waiting") {
      return { displayStatus: "waiting", statusLabel: "待接单" };
    }
    if (session.status === "closed" || session.endedAt || expired) {
      return { displayStatus: "ended", statusLabel: "已结束" };
    }
    if (session.status === "active") {
      return { displayStatus: "active", statusLabel: "服务中" };
    }
    return { displayStatus: "waiting", statusLabel: "待接单" };
  },

  mapManagerSessionItem(session, currentSessionId, customerMessages) {
    const expiresTimestamp = zion.resolveEffectiveSessionExpiry({
      status: session.status,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      expiresAt: session.expiresAt,
      durationMinutes: session.durationMinutes,
      chatAvailableUntil: session.chatAvailableUntil
    });
    const remainingText = expiresTimestamp
      ? (expiresTimestamp > Date.now() ? this.formatRemaining(expiresTimestamp) : "00:00")
      : (session.startedAt ? "00:00" : "待开始");
    const { displayStatus, statusLabel } = this.resolveManagerSessionDisplay(session, expiresTimestamp);
    return {
      id: session.id,
      orderId: session.orderId || "",
      name: session.customerNickname || "客户",
      avatarUrl: session.customerAvatarUrl || "",
      avatarText: session.customerAvatarText || "客",
      topic: session.topic || session.issueSummary || "咨询会话",
      status: session.status,
      startedAt: session.startedAt || "",
      displayStatus,
      statusLabel,
      expiresTimestamp,
      expiresAt: expiresTimestamp ? new Date(expiresTimestamp).toISOString() : "",
      remainingText,
      unreadCount: managerUnread.countUnreadCustomerMessages(session.id, customerMessages),
      active: String(session.id) === String(currentSessionId)
    };
  },

  buildManagerSessionList(sessions, messagesBySession, currentSessionId) {
    return (sessions || [])
      .filter((item) => item.status === "active" || item.status === "waiting")
      .sort((left, right) => {
        if (left.status !== right.status) {
          return left.status === "active" ? -1 : 1;
        }
        const leftTime = new Date(left.lastMessageAt || left.startedAt || 0).getTime();
        const rightTime = new Date(right.lastMessageAt || right.startedAt || 0).getTime();
        return rightTime - leftTime;
      })
      .map((item) => this.mapManagerSessionItem(
        item,
        currentSessionId,
        (messagesBySession && messagesBySession[String(item.id)]) || []
      ));
  },

  mergeManagerSessionList(sessions, messagesBySession, currentSessionId) {
    const existingMap = (this.data.managerSessionList || []).reduce((map, item) => {
      map[String(item.id)] = item;
      return map;
    }, {});
    const managerSessionList = this.buildManagerSessionList(sessions, messagesBySession, currentSessionId)
      .map((item) => {
        const existing = existingMap[String(item.id)];
        if (!existing) return item;
        const expiresChanged = Number(existing.expiresTimestamp || 0) !== Number(item.expiresTimestamp || 0);
        if (
          !expiresChanged
          && existing.unreadCount === item.unreadCount
          && existing.active === item.active
          && existing.status === item.status
          && existing.name === item.name
          && existing.topic === item.topic
        ) {
          return existing;
        }
        if (!expiresChanged) {
          return {
            ...existing,
            unreadCount: item.unreadCount,
            active: item.active,
            status: item.status,
            statusLabel: item.statusLabel,
            displayStatus: item.displayStatus,
            name: item.name,
            topic: item.topic,
            avatarUrl: item.avatarUrl,
            avatarText: item.avatarText
          };
        }
        return item;
      });

    const prevList = this.data.managerSessionList || [];
    const unchanged = prevList.length === managerSessionList.length
      && prevList.every((prev, index) => prev === managerSessionList[index]);
    if (unchanged) {
      if (managerSessionList.length && !managerSessionCountdownTimer) {
        this.startManagerSessionCountdown();
      }
      return;
    }

    this.setData({
      managerSessionList,
      managerTotalUnread: managerUnread.sumUnreadCounts(managerSessionList),
      managerCustomerMessagesBySession: messagesBySession || {}
    }, () => {
      if (managerSessionList.length) {
        this.startManagerSessionCountdown();
      }
    });
  },

  applyManagerSessionList(sessions, messagesBySession, currentSessionId) {
    const managerSessionList = this.buildManagerSessionList(sessions, messagesBySession, currentSessionId);
    this.setData({
      managerSessionList,
      managerTotalUnread: managerUnread.sumUnreadCounts(managerSessionList),
      managerCustomerMessagesBySession: messagesBySession || {},
      activeSessionId: currentSessionId
    }, () => {
      this.startManagerSessionCountdown();
    });
  },

  startManagerSessionCountdown() {
    this.stopManagerSessionCountdown();
    if (!this.data.managerSessionList.length) return;
    this.tickManagerSessionRemaining();
    managerSessionCountdownTimer = setInterval(() => {
      this.tickManagerSessionRemaining();
    }, 1000);
  },

  stopManagerSessionCountdown() {
    if (!managerSessionCountdownTimer) return;
    clearInterval(managerSessionCountdownTimer);
    managerSessionCountdownTimer = null;
  },

  tickManagerSessionRemaining() {
    const list = this.data.managerSessionList || [];
    if (!list.length) return;
    const patch = {};
    const now = Date.now();
    list.forEach((item, index) => {
      const expiresTimestamp = Number(item.expiresTimestamp || 0);
      if (!expiresTimestamp) return;
      const expired = expiresTimestamp <= now;
      const remainingText = expired ? "00:00" : this.formatRemaining(expiresTimestamp);
      if (remainingText !== item.remainingText) {
        patch[`managerSessionList[${index}].remainingText`] = remainingText;
      }
      if (expired && item.displayStatus !== "ended" && item.status !== "waiting") {
        patch[`managerSessionList[${index}].displayStatus`] = "ended";
        patch[`managerSessionList[${index}].statusLabel`] = "已结束";
      }
    });
    if (Object.keys(patch).length) {
      this.setData(patch);
    }
  },

  refreshManagerUnreadDisplay() {
    if (!this.data.canOpenSessionDrawer && !this.data.isManagerView && !isManagerChatView()) return;
    const messagesBySession = this.data.managerCustomerMessagesBySession || {};
    const currentSessionId = wx.getStorageSync("consultationSessionId") || this.data.activeSessionId || "";
    const managerSessionList = (this.data.managerSessionList || []).map((item) => ({
      ...item,
      unreadCount: managerUnread.countUnreadCustomerMessages(
        item.id,
        messagesBySession[String(item.id)] || []
      ),
      active: String(item.id) === String(currentSessionId)
    }));
    this.setData({
      managerSessionList,
      managerTotalUnread: managerUnread.sumUnreadCounts(managerSessionList)
    });
  },

  loadManagerSessionList(options = {}) {
    if (!this.data.canOpenSessionDrawer && !this.data.isManagerView && !isManagerChatView()) return Promise.resolve();
    const identity = viewSession.capture();
    const request = this.drawerRequest = {};
    const current = () => this.drawerRequest === request && viewSession.current(identity) && !this.hidden && !this.unloaded;
    const userInfo = wx.getStorageSync("userInfo") || {};
    if (!userInfo.id) return Promise.resolve();

    if (!options.silent) {
      this.setData({ managerSessionLoading: true });
    }

    const storedProviderId = wx.getStorageSync("activeServiceProviderId");
    const storedManagerAccountId = wx.getStorageSync("activeManagerAccountId");

    return zion.getServiceProviderByAccount(userInfo.id)
      .then((provider) => {
        if (!current()) throw new Error("stale drawer request");
        const resolvedProvider = provider && provider.id
          ? provider
          : (storedProviderId ? { id: storedProviderId, accountId: storedManagerAccountId } : null);
        if (!resolvedProvider || !resolvedProvider.id) {
          return { sessions: [] };
        }
        return zion.listManagerSessions({
          status: "",
          serviceProviderId: resolvedProvider.id,
          managerAccountId: resolvedProvider.accountId
        });
      })
      .then((result) => {
        if (!current()) throw new Error("stale drawer request");
        const currentSessionId = wx.getStorageSync("consultationSessionId") || this.data.activeSessionId || "";
        const sessions = (result.sessions || [])
          .filter((item) => item.status === "active" || item.status === "waiting");
        const sessionIds = sessions.map((item) => item.id);
        return zion.listCustomerMessagesForSessions(sessionIds)
          .then((messageResult) => ({
            sessions,
            messagesBySession: messageResult.messagesBySession || {},
            currentSessionId
          }));
      })
      .then(({ sessions, messagesBySession, currentSessionId }) => {
        if (!current()) return;
        currentSessionId = wx.getStorageSync("consultationSessionId") || "";
        if (options.silent) {
          this.mergeManagerSessionList(sessions, messagesBySession, currentSessionId);
        } else {
          this.applyManagerSessionList(sessions, messagesBySession, currentSessionId);
        }
        this.setData({ managerSessionLoading: false });
        this.refreshAccess();
        if (!countdownTimer) {
          this.startCountdown();
        }
      })
      .catch((error) => {
        if (!current()) return;
        console.warn("loadManagerSessionList failed", error);
        this.setData({ managerSessionLoading: false });
      });
  },

  applyManagerSessionContext(sessionItem) {
    const userInfo = wx.getStorageSync("userInfo") || {};
    const managerName = wx.getStorageSync("currentManagerName") || userInfo.nickName || "服务人员";
    wx.setStorageSync("consultationSessionId", sessionItem.id);
    wx.setStorageSync("currentChatRole", "manager");
    wx.setStorageSync("currentManagerName", managerName);
    wx.setStorageSync("currentManagerAvatarText", managerName ? managerName.slice(0, 1) : "师");
    wx.setStorageSync("currentCustomerName", sessionItem.name || "客户");
    wx.setStorageSync("currentCustomerAvatarUrl", sessionItem.avatarUrl || "");
    wx.setStorageSync("currentCustomerAvatarText", sessionItem.avatarText || "客");
    if (sessionItem.orderId) {
      wx.setStorageSync("consultationOrderId", sessionItem.orderId);
    }
    if (sessionItem.topic) {
      wx.setStorageSync("consultationTopic", sessionItem.topic);
    }
    if (sessionItem.startedAt) {
      wx.setStorageSync("currentSessionStartedAt", sessionItem.startedAt);
      wx.setStorageSync("currentSessionStartedSessionId", sessionItem.id);
    } else {
      wx.removeStorageSync("currentSessionStartedAt");
      wx.removeStorageSync("currentSessionStartedSessionId");
    }
    if (sessionItem.expiresAt && sessionItem.expiresTimestamp) {
      wx.setStorageSync("currentSessionExpiresAt", sessionItem.expiresAt);
      wx.setStorageSync("currentSessionExpiresSessionId", sessionItem.id);
    } else {
      wx.removeStorageSync("currentSessionExpiresAt");
      wx.removeStorageSync("currentSessionExpiresSessionId");
    }
    wx.setStorageSync("chatReturnUrl", "/pages/manager/manager?tab=serving");
    wx.setStorageSync("chatReturnSource", "manager-serving");
  },

  switchToManagerSession(event) {
    if (this.data.sending) { wx.showToast({title:"消息发送中，请稍候再切换客户",icon:"none"}); return; }
    const sessionId = event.currentTarget.dataset.id;
    const sessionItem = (this.data.managerSessionList || []).find((item) => String(item.id) === String(sessionId));
    if (!sessionItem) return;

    if (sessionItem.status === "waiting") {
      wx.showToast({ title: "请先在经理台接受订单", icon: "none" });
      return;
    }

    if (String(sessionItem.id) === String(this.data.activeSessionId)) {
      this.closeSessionDrawer();
      return;
    }

    const previous = String(wx.getStorageSync("consultationSessionId") || "");
    this.chatDrafts = this.chatDrafts || {};
    this.chatDrafts[previous] = {input:this.data.input, source:this.data.reeditSourceMessageId, error:this.data.sendError, failedMessage:this.data.failedMessage};
    const draft = this.chatDrafts[String(sessionItem.id)] || {};
    this.messageRequest = null;
    this.timingRequest = null;
    this.applyManagerSessionContext(sessionItem);
    serviceEndNoticeShown = false;
    loadingMessages = false;
    this.setData({
      sessionDrawerVisible: false,
      activeSessionId: sessionItem.id,
      messages: [],
      input: draft.input || "",
      sendError: draft.error || "",
      failedMessage: draft.failedMessage || "",
      reeditSourceMessageId: draft.source || "",
      managerSessionList: (this.data.managerSessionList || []).map((item) => ({
        ...item,
        active: String(item.id) === String(sessionItem.id)
      }))
    });
    this.hydrateChatIdentity();
    this.hydrateSessionTiming(true);
    this.refreshAccess();
    this.startCountdown();
    this.loadBackendMessages();
  },

  toDisplayMessage(item) {
    const senderRole = item.senderRole || item.sender_role || "";
    const isManagerView = this.data.chatRole === "manager" || this.data.isManagerView;
    if (!isManagerView && item.visibleToCustomer === false) {
      return null;
    }

    const content = String(item.content || "").trim();
    const recalledContent = String(item.recalledContent || item.recalled_content || "").trim();
    const isRecalled = !!item.isRecalled
      || !!item.is_recalled
      || !!(item.recalledAt || item.recalled_at)
      || !!recalledContent
      || (isManagerView && senderRole === "manager" && !content && item.visibleToCustomer === false);

    if (isManagerView && senderRole === "manager" && isRecalled) {
      const replacedByMessageId = item.replacedByMessageId || item.replaced_by_message_id || "";
      if (replacedByMessageId) {
        return null;
      }
      const recalledAt = item.recalledAt || item.recalled_at || "";
      const sentAt = item.sentAt || item.sent_at || "";
      return {
        id: item.id || messageId++,
        type: "recall-notice",
        role: "user",
        senderRole,
        recalledContent,
        replacedByMessageId,
        recalledAt,
        canReedit: this.canShowRecallReedit(sentAt, recalledAt, replacedByMessageId),
        sentAt
      };
    }

    if (isManagerView && senderRole === "manager" && !content) {
      return null;
    }

    const isOwnMessage = isManagerView
      ? senderRole === "manager"
      : senderRole !== "manager";
    return {
      id: item.id || messageId++,
      type: "text",
      role: isOwnMessage ? "user" : "assistant",
      senderRole,
      content: item.content,
      sentAt: item.sentAt || item.sent_at || "",
      isRecalled: false
    };
  },

  loadBackendMessages(options = {}) {
    const identity = viewSession.capture();
    const sessionId = identity.sessionId;
    if (!sessionId || this.unloaded || this.hidden) return Promise.resolve();
    if (this.messageRequest && this.messageRequest.sessionId === sessionId) return Promise.resolve();
    const request = {sessionId};
    this.messageRequest = request;
    const isManagerView = this.data.isManagerView || isManagerChatView();
    return zion.getSessionMessages(sessionId, {viewerRole:isManagerView ? "manager" : "customer"})
      .then((result) => {
        if (this.unloaded || this.hidden || !viewSession.current(identity,true) || this.messageRequest !== request) return;
        const rawMessages = result.messages || [];
        if (isManagerView) {
          managerUnread.markSessionReadFromMessages(sessionId, rawMessages);
          this.refreshManagerUnreadDisplay();
        }
        const messages = rawMessages.map(item => this.toDisplayMessage(item)).filter(Boolean);
        if (JSON.stringify(messages) !== JSON.stringify(this.data.messages)) {
          const next = {messages};
          if (messages.length) next.scrollIntoView = `msg-${messages[messages.length-1].id}`;
          this.setData(next);
        }
      })
      .catch(() => {
        if (viewSession.current(identity,true) && !this.unloaded && !this.hidden && !options.silent)
          this.setData({sendError:"聊天记录读取失败，请检查网络后重试。"});
      })
      .finally(() => { if (this.messageRequest === request) this.messageRequest = null; });
  },

  formatTime(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const hour = `${date.getHours()}`.padStart(2, "0");
    const minute = `${date.getMinutes()}`.padStart(2, "0");
    return `${hour}:${minute}`;
  },

  formatRemaining(timestamp) {
    const remainingMs = Math.max(0, Number(timestamp || 0) - Date.now());
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  },

  onInput(event) {
    this.setData({ input: event.detail.value });
  },

  toggleServiceCard() {
    this.setData({ serviceCardCollapsed: !this.data.serviceCardCollapsed });
  },

  onMessageLongPress(event) {
    if (!this.data.isManagerView && !isManagerChatView()) return;

    const messageIdValue = event.currentTarget.dataset.id;
    const message = (this.data.messages || []).find((item) => String(item.id) === String(messageIdValue));
    if (!message || message.type === "recall-notice" || message.role !== "user" || message.senderRole !== "manager" || message.isRecalled) {
      return;
    }
    if (!/^\d+$/.test(String(message.id))) {
      wx.showToast({ title: "消息发送中，请稍后再试", icon: "none" });
      return;
    }

    const sentAt = message.sentAt ? new Date(message.sentAt).getTime() : 0;
    if (!sentAt || Date.now() - sentAt > 60 * 1000) {
      wx.showToast({ title: "超过1分钟无法撤回", icon: "none" });
      return;
    }

    wx.showActionSheet({
      itemList: ["撤回"],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.recallMessage(message);
        }
      }
    });
  },

  recallMessage(message) {
    const userInfo = wx.getStorageSync("userInfo") || {};
    wx.showLoading({ title: "撤回中", mask: true });
    zion.recallManagerMessage(message.id, userInfo.id)
      .then(() => {
        const messages = (this.data.messages || []).map((item) => {
          if (String(item.id) !== String(message.id)) return item;
          const recalledAt = new Date().toISOString();
          return {
            id: item.id,
            type: "recall-notice",
            role: "user",
            senderRole: "manager",
            recalledContent: message.content || item.content || "",
            replacedByMessageId: "",
            recalledAt,
            canReedit: true,
            sentAt: item.sentAt || ""
          };
        });
        this.setData({ messages });
        return this.loadBackendMessages();
      })
      .catch((error) => {
        console.warn("recallManagerMessage failed", error);
        const tip = error && error.message === "recall window expired"
          ? "超过1分钟无法撤回"
          : "撤回失败，请重试";
        wx.showToast({ title: tip, icon: "none" });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  onReeditRecall(event) {
    const messageIdValue = event.currentTarget.dataset.id;
    const message = (this.data.messages || []).find((item) => String(item.id) === String(messageIdValue));
    if (!message || message.type !== "recall-notice" || !message.canReedit) {
      return;
    }
    this.setData({
      input: message.recalledContent || "",
      reeditSourceMessageId: String(message.id)
    });
  },

  goBack() {
    const returnUrl = wx.getStorageSync("chatReturnUrl");
    const returnSource = wx.getStorageSync("chatReturnSource");
    if (returnUrl && (returnSource === "manager-serving" || returnSource === "manager-detail")) {
      wx.removeStorageSync("chatReturnUrl");
      wx.removeStorageSync("chatReturnSource");
      wx.navigateTo({
        url: returnUrl,
        fail: () => {
          wx.reLaunch({ url: returnUrl });
        }
      });
      return;
    }

    wx.navigateBack({
      fail: () => wx.switchTab({ url: "/pages/index/index" })
    });
  },

  usePrompt(event) {
    if (this.data.serviceEnded) {
      this.notifyServiceEnded(false, true);
      return;
    }
    if (!this.data.hasAccess) {
      if (this.data.isManagerView || isManagerChatView()) {
        wx.showToast({ title: "服务已结束", icon: "none" });
        return;
      }
      this.goPay();
      return;
    }
    this.setData({ input: event.currentTarget.dataset.text });
  },

  async sendMessage() {
    if (this.data.sending || !auth.requireLogin("登录后才能发送消息。")) return;
    const content = this.data.input.trim();
    if (!content) return;
    const identity = viewSession.capture();
    const epoch = this.viewEpoch || 0;
    if (!identity.sessionId) { this.goOfflineConsultation(); return; }
    const user = wx.getStorageSync("userInfo") || {};
    const isManager = this.data.chatRole === "manager";
    const replacesMessageId = this.data.reeditSourceMessageId || "";
    const context = {
      sessionId:identity.sessionId, orderId:wx.getStorageSync("consultationOrderId"),
      accountId:identity.accountId, senderRole:isManager ? "manager" : "customer",
      source:"miniapp", topic:wx.getStorageSync("consultationTopic") || content,
      customerNickname:user.nickName || "微信用户", customerAvatarUrl:user.avatarUrl || ""
    };
    this.setData({sending:true,sendError:""});
    try {
      const active = await this.syncSessionAccessFromBackend();
      if (!viewSession.current(identity,true) || this.unloaded || this.hidden || epoch !== (this.viewEpoch || 0)) return;
      if (!active) throw new Error("当前会话暂时无法发送，请检查网络或服务状态。原文已保留。");
      await (isManager ? zion.sendManagerReply({sessionId:identity.sessionId,managerAccountId:identity.accountId,content,replacesMessageId})
        : zion.sendChatMessage(content,context));
      if (!viewSession.current(identity,true) || this.unloaded) return;
      // Clear only the version actually submitted, never a newer draft.
      if (this.data.input.trim() === content) this.setData({input:"",reeditSourceMessageId:""});
      this.setData({sendError:"",failedMessage:""});
      if (!this.hidden) await this.loadBackendMessages({silent:true});
    } catch (error) {
      if (viewSession.current(identity,true) && !this.unloaded) {
        this.setData({failedMessage:content,sendError:"发送未确认，原文已保留。请先查看聊天记录，确认未发送后再重试。"});
      }
    } finally {
      if (!this.unloaded) this.setData({sending:false});
    }
  },

  copyUnsentMessage() {
    const content = this.data.failedMessage || this.data.input;
    if (content) wx.setClipboardData({data:content});
  },

  renewService() {
    if (this.data.isManagerView) {
      wx.showToast({ title: "请等待客户续费", icon: "none" });
      return;
    }
    if (this.data.renewing) return;

    const sessionId = wx.getStorageSync("consultationSessionId");
    if (!sessionId) {
      wx.showToast({ title: "未找到当前会话", icon: "none" });
      return;
    }

    const price = Number(wx.getStorageSync("currentServicePrice") || payment.CONSULTATION_PACKAGE.price);
    wx.showModal({
      title: "继续聊天",
      content: `续费 ¥${price} / 小时后，可以在当前聊天继续沟通，原聊天记录会保留。`,
      confirmText: "续费",
      success: (res) => {
        if (!res.confirm) return;
        this.setData({ renewing: true });
        payment.renewConsultationPayment({
          sessionId,
          minutes: 60,
          price
        })
          .then(() => this.syncSessionAccessFromBackend())
          .then(() => {
            this.setData({
              renewing: false,
              serviceEnded: false,
              input: ""
            });
            serviceEndNoticeShown = false;
            this.refreshAccess();
            this.startCountdown();
            wx.showToast({ title: "已续费", icon: "success" });
          })
          .catch((error) => {
            console.warn("renewConsultationPayment failed", error);
            this.setData({ renewing: false });
            wx.showToast({ title: "续费失败，请重试", icon: "none" });
          });
      }
    });
  },

  createLocalReply(content) {
    if (/吵|争|冷战|沟通|不回|回复/.test(content)) {
      return "我听见你在关系里的委屈和着急了。我们可以先把事情拆开：最近一次让你最难受的沟通，是从哪句话开始的？";
    }
    if (/分手|挽回|复合|前任/.test(content)) {
      return "分开之后还想靠近一个人，会很拉扯。先别急着判断能不能挽回，你们最后一次平静沟通大概是什么时候？";
    }
    if (/焦虑|难受|崩溃|失眠|痛苦/.test(content)) {
      return "这种感受听起来已经压了你一阵子。你可以先把最强烈的那一点说出来，我会陪你一起把它放慢、看清楚。";
    }
    return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
  },

  appendAssistant(content) {
    const assistantMessage = { id: messageId++, role: "assistant", content };
    this.setData({
      messages: this.data.messages.concat(assistantMessage),
      scrollIntoView: `msg-${assistantMessage.id}`
    });
  },

  goPay() {
    wx.showModal({
      title: "请先购买",
      content: `¥200 购买 1 小时文字聊天，支付成功后开放聊天入口。`,
      confirmText: "去购买",
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({ url: "/pages/plaza/plaza" });
        }
      }
    });
  },

  mockUnlock() {
    payment.markConsultationPaid(60);
    this.refreshAccess();
    wx.showToast({ title: "已开通聊天", icon: "success" });
  }
});
