const zion = require("../../utils/zion");
const chatBadge = require("../../utils/chatBadge");
const { isAnswerLibraryCourse, isPersonalGrowthCourse, isChildPublicCourse, isArchivedCourse } = require("../../utils/courseContent");

Page({
  data: {
    statusBarHeight: 54,
    navHeight: 104,
    navPaddingRight: 180,
    activeCategory: "child",
    publicCourses: [],
    archivedCourses: [],
    childCourses: [],
    personalGrowthCourses: [],
    visibleCourses: [],
    searchKeyword: "",
    loading: true, error: ""
  },

  onLoad() {
    this.setCustomNav();
    this.fetchCourses();
  },

  onShow() {
    chatBadge.refresh();
    wx.showTabBar({ animation: false });
    const requestedCategory = wx.getStorageSync("courseLibraryCategory");
    if (requestedCategory === "child" || requestedCategory === "growth") {
      wx.removeStorageSync("courseLibraryCategory");
      this.selectCategory({currentTarget:{dataset:{category:requestedCategory}}});
    }
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
        this.allCourses=[];this.setData({loading:false,childCourses:[],personalGrowthCourses:[],visibleCourses:[]});
      })
      .catch(() => {
        this.setData({loading:false,error:"课程加载失败，请检查网络后重试。"});
      });
  },

  refreshCourses() {
    const courses = this.allCourses || [];
    const childCourses = courses.filter(isAnswerLibraryCourse);
    const personalGrowthCourses = courses.filter(isPersonalGrowthCourse);
    this.setData({
      publicCourses:courses.filter(isChildPublicCourse),
      archivedCourses:courses.filter(isArchivedCourse),
      childCourses,
      personalGrowthCourses,
      visibleCourses: this.filterCourses(this.data.activeCategory, this.data.searchKeyword, childCourses, personalGrowthCourses)
    });
  },

  filterCourses(category, keyword, childCourses=this.data.childCourses, personalGrowthCourses=this.data.personalGrowthCourses) {
    const courses = category === "growth" ? personalGrowthCourses : childCourses;
    const search = String(keyword || "").trim().toLowerCase();
    return search ? courses.filter(course=>String(course.title || "").toLowerCase().includes(search)) : courses;
  },

  selectCategory(event) {
    const activeCategory = event.currentTarget.dataset.category;
    if (activeCategory !== "growth" && activeCategory !== "child") return;
    this.setData({
      activeCategory,
      searchKeyword: "",
      visibleCourses: this.filterCourses(activeCategory, "")
    });
  },

  onSearchInput(event) {
    const searchKeyword = event.detail.value || "";
    this.setData({searchKeyword,visibleCourses:this.filterCourses(this.data.activeCategory,searchKeyword)});
  },

  clearSearch() {
    this.setData({searchKeyword:"",visibleCourses:this.filterCourses(this.data.activeCategory,"")});
  },

  showArchivedCourse() { wx.showToast({title:"课程已封存，暂未开放",icon:"none"}); },

  openCourse(event) {
    const courseId = event.currentTarget.dataset.id;
    if (!courseId) return;
    wx.navigateTo({ url: `/pages/course-detail/course-detail?id=${courseId}` });
  },

  openEducationBundle() { wx.navigateTo({url:'/pages/education-bundle/education-bundle'}); },

  goHome() {
    wx.switchTab({ url: "/pages/index/index" });
  },

  goSearch() {
    wx.navigateTo({ url: "/pages/search/search?mode=courses" });
  }
});
