const zion = require("../../utils/zion");
const consultationService = require("../../utils/consultationService");
// Parents see only whether a course is open now; grant periods stay in the manager console.
const VIEW_BLOCKED = {
  LOGIN: { title: "请先登录", content: "登录后才能观看已为你开通的课程。" },
  ENDED: { title: "暂不能观看", content: "本课程观看权限已结束，请联系老师。" },
  NOT_GRANTED: { title: "暂不能观看", content: "本课程需要老师为你开通后才能观看，请联系老师。" }
};
const { courseSections, isAnswerLibraryCourse } = require("../../utils/courseContent");

Page({
  data: {
    statusBarHeight: 54,
    navHeight: 104,
    navPaddingRight: 180,
    course: null,
    isAnswerLibrary: false,
    contentSections: [],
    error: "",
    loading: true,
    activeChapterIndex: -1,
    playingVideoUrl: "",
    showVideoPlayer: false,
    viewAccess: { checked: false, canWatch: false, reason: "" }
  },

  onLoad(query = {}) {
    this.courseId = query.id || "";
    this.setCustomNav();
    this.fetchCourse(this.courseId);
  },

  onUnload() {
    this.stopVideo();
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

  fetchCourse(courseId=this.courseId) {
    this.setData({loading:true,error:"",course:null,isAnswerLibrary:false,viewAccess:{checked:false,canWatch:false,reason:""}});
    return zion.getCourse(courseId).then(r=>{
      if(!r.course || !r.course.id || !r.course.title){this.setData({error:"这门课程不存在或已下架。"});return;}
      this.setData({course:r.course,isAnswerLibrary:isAnswerLibraryCourse(r.course),contentSections:courseSections(r.course.description)});wx.setNavigationBarTitle({title:r.course.title});
      return this.loadViewAccess(r.course);
    }).catch(()=>this.setData({error:"课程加载失败，请检查网络后重试。"})).finally(()=>this.setData({loading:false}));
  },
  loadViewAccess(course) {
    const token = wx.getStorageSync("zionJwt");
    return consultationService.call("COURSE_VIEW_ACCESS", { courseId: course.id }).then((access) => {
      if (this.data.course !== course || wx.getStorageSync("zionJwt") !== token) return;
      const lessons = {};
      (access.lessons || []).forEach((item) => { lessons[String(item.id)] = item; });
      const chapters = course.chapters.map((chapter) => {
        const item = lessons[chapter.id] || {};
        return { ...chapter, hasVideo: !!item.hasVideo, videoUrl: access.canWatch ? item.videoUrl || "" : "" };
      });
      this.setData({ "course.chapters": chapters, viewAccess: { checked: true, canWatch: !!access.canWatch, reason: access.reason || "" } });
    }).catch(() => {
      if (this.data.course === course) this.setData({ viewAccess: { checked: false, canWatch: false, reason: "" } });
    });
  },
  retryCourse(){this.fetchCourse();},
  goBack() {
    this.stopVideo();
    wx.navigateBack({
      fail: () => wx.switchTab({ url: "/pages/plaza/plaza" })
    });
  },

  stopVideo() {
    if (this.videoContext) {
      try {
        this.videoContext.stop();
      } catch (error) {
        // ignore
      }
    }
    this.setData({
      playingVideoUrl: "",
      showVideoPlayer: false,
      activeChapterIndex: -1
    });
  },

  playChapterAtIndex(index) {
    const chapters = (this.data.course && this.data.course.chapters) || [];
    const chapter = chapters[index];
    if (!chapter) {
      wx.showToast({ title: "课程目录准备中", icon: "none" });
      return;
    }
    if (!this.data.viewAccess.checked) {
      wx.showToast({ title: "正在确认观看权限，请稍后重试", icon: "none" });
      this.loadViewAccess(this.data.course);
      return;
    }
    if (!chapter.hasVideo) {
      wx.showToast({ title: "该课时视频准备中", icon: "none" });
      return;
    }
    if (!chapter.videoUrl) {
      const blocked = VIEW_BLOCKED[this.data.viewAccess.reason] || VIEW_BLOCKED.NOT_GRANTED;
      wx.showModal({
        title: blocked.title,
        content: blocked.content,
        showCancel: this.data.viewAccess.reason === "LOGIN",
        confirmText: this.data.viewAccess.reason === "LOGIN" ? "去登录" : "知道了",
        success: (res) => { if (res.confirm && this.data.viewAccess.reason === "LOGIN") wx.switchTab({ url: "/pages/profile/profile" }); }
      });
      return;
    }

    this.setData({
      activeChapterIndex: index,
      playingVideoUrl: chapter.videoUrl,
      showVideoPlayer: true
    }, () => {
      if (!this.videoContext) {
        this.videoContext = wx.createVideoContext("courseVideo", this);
      }
      this.videoContext.play();
    });
  },

  previewCourse() {
    this.playChapterAtIndex(0);
  },

  openChapter(event) {
    const index = Number(event.currentTarget.dataset.index || 0);
    this.playChapterAtIndex(index);
  },

  onVideoError() {
    wx.showToast({ title: "视频播放失败，请稍后重试", icon: "none" });
  }
});
