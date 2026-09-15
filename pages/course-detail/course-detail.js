const zion = require("../../utils/zion");
const { courseSections } = require("../../utils/courseContent");

Page({
  data: {
    statusBarHeight: 54,
    navHeight: 104,
    navPaddingRight: 180,
    course: null,
    contentSections: [],
    error: "",
    loading: true,
    activeChapterIndex: -1,
    playingVideoUrl: "",
    showVideoPlayer: false
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
    this.setData({loading:true,error:"",course:null});
    return zion.getCourse(courseId).then(r=>{
      if(!r.course || !r.course.id || !r.course.title){this.setData({error:"这门课程不存在或已下架。"});return;}
      this.setData({course:r.course,contentSections:courseSections(r.course.description)});wx.setNavigationBarTitle({title:r.course.title});
    }).catch(()=>this.setData({error:"课程加载失败，请检查网络后重试。"})).finally(()=>this.setData({loading:false}));
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
    if (!chapter.videoUrl) {
      wx.showToast({ title: "该课时视频准备中", icon: "none" });
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
