const zion = require("../../utils/zion");
const chatContext = require("../../utils/chatContext");
const auth = require("../../utils/auth");

Page({
  goCustomerPortal() {
    chatContext.enterCustomerView();
    wx.navigateTo({ url: "/pages/customer/customer" });
  },
  goPublicClasses() {
    chatContext.enterCustomerView();
    wx.navigateTo({ url: "/pages/public-class/public-class" });
  },
  data: {
    statusBarHeight: 54,
    navHeight: 104,
    navPaddingRight: 180,
    featuredCourses: [],
    loadingCourses: false,
    courseError: "",
    userInfo: {},
    userName: "未登录",
    avatarFailed: false
  },

  onLoad() {
    this.setCustomNav();
    this.fetchFeaturedCourses();
  },

  onShow() {
    wx.showTabBar({ animation: false });
    const userInfo = auth.getLoggedInUser();
    this.setData({
      userInfo: userInfo || {},
      userName: userInfo ? (userInfo.nickName || userInfo.username || "微信用户") : "未登录",
      avatarFailed: false
    });
  },

  onAvatarError() {
    this.setData({avatarFailed:true});
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
      const navPaddingRight = Math.max(system.windowWidth - menu.left + 10, 108);
      this.setData({ statusBarHeight, navHeight, navPaddingRight });
    } catch (error) {
      this.setData({ statusBarHeight: 54, navHeight: 104, navPaddingRight: 180 });
    }
  },

  goPlaza() {
    wx.switchTab({ url: "/pages/plaza/plaza" });
  },

  goSearch() {
    wx.navigateTo({ url: "/pages/search/search?mode=courses" });
  },

  async fetchFeaturedCourses() {
    this.setData({loadingCourses:true,courseError:""});
    try {
      const response = await zion.listCourses({limit:50});
      const list = Array.isArray(response.courses) ? response.courses : [];
      this.setData({featuredCourses:list.filter(course=>course.subtitle==='《答案库》系列课程'||course.badge==='付费')});
    } catch (_) {
      this.setData({featuredCourses:[],courseError:"课程暂时加载失败，请重试。"});
    } finally {
      this.setData({loadingCourses:false});
    }
  },
  openCourse(event) {
    const id = event.currentTarget.dataset.id;
    if (id) wx.navigateTo({url:'/pages/course-detail/course-detail?id='+encodeURIComponent(id)});
  }
});
