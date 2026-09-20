const zion = require("../../utils/zion");

Page({
  data: {
    statusBarHeight: 54,
    navHeight: 104,
    navPaddingRight: 180,
    featuredCourse: null,
    visibleCourses: [],
    loading: true, error: ""
  },

  onLoad() {
    this.setCustomNav();
    this.fetchCourses();
  },

  onShow() {
    wx.showTabBar({ animation: false });
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

  fetchCourses() {
    this.setData({ loading: true, error:"" });
    zion.listCourses({ limit: 50 })
      .then((res) => {
        const list = res && Array.isArray(res.courses) ? res.courses : [];
        if (list.length) {
          this.allCourses = list;
          this.setData({ loading: false }, () => this.refreshCourses());
          return;
        }
        this.allCourses=[];this.setData({loading:false,visibleCourses:[],featuredCourse:null});
      })
      .catch(() => {
        this.setData({loading:false,error:"课程加载失败，请检查网络后重试。"});
      });
  },

  refreshCourses() {
    const visibleCourses = (this.allCourses || []).filter(item => item.subtitle === '《答案库》系列课程');
    const featuredCourse = visibleCourses.find((item) => item.badge) || visibleCourses[0] || null;
    this.setData({ visibleCourses, featuredCourse });
  },

  openCourse(event) {
    const courseId = event.currentTarget.dataset.id;
    if (!courseId) return;
    wx.navigateTo({ url: `/pages/course-detail/course-detail?id=${courseId}` });
  },

  goHome() {
    wx.switchTab({ url: "/pages/index/index" });
  },

  goSearch() {
    wx.navigateTo({ url: "/pages/search/search?mode=courses" });
  }
});
