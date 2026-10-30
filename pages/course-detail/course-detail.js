const zion = require("../../utils/zion");
const { courseShare, courseWebLink } = require("../../utils/coursePresentation");
const consultationService = require("../../utils/consultationService");
const auth = require("../../utils/auth");
// Parents see only whether a course is open now; grant periods stay in the manager console.
const VIEW_BLOCKED = {
  PURCHASE_EXPIRED: { title: "观看期已结束", content: "答案库课程系列的1年观看期已结束，可重新购买后继续学习。" },
  LOGIN: { title: "请先登录", content: "登录后才能观看已为你开通的课程。" },
  ENDED: { title: "暂不能观看", content: "本课程观看权限已结束，请联系老师。" },
  NOT_GRANTED: { title: "暂不能观看", content: "本课程需要老师为你开通后才能观看，请联系老师。" }
};
const { courseSections, isAnswerLibraryCourse } = require("../../utils/courseContent");
// Watermark names the viewer (never their phone) so a screen recording can be traced back.
function viewerMark() {
  const user = auth.getLoggedInUser();
  if (!user) return "知守 · 访客观看";
  const name = String(user.nickName || user.wechat_nickname || "学员").slice(0, 10);
  return `知守 · ${name} · ID ${user.id}`;
}

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
    viewerMark: "",
    audioOnly: false,
    showSharePanel: false,
    showShareGuide: false,
    shareReady: false,
    shareError: "",
    sharePreparing: false,
    shareHint: "转发时将附上这门课程的封面",
    viewAccess: { checked: false, canWatch: false, reason: "" }
  },

  onLoad(query = {}) {
    this.courseId = query.id || "";
    this.setCustomNav();
    this.fetchCourse(this.courseId);
  },

  onShow() { if(this.data.course && !this.data.loading)this.loadViewAccess(this.data.course); },

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
      if(!r.course || !r.course.id || !r.course.title || r.course.enabled === false){this.setData({error:"这门课程不存在或已下架。"});return;}
      this.setData({course:r.course,isAnswerLibrary:isAnswerLibraryCourse(r.course),contentSections:courseSections(r.course.description)});wx.setNavigationBarTitle({title:r.course.title});
      if (wx.prepareCourseShare) wx.prepareCourseShare(this);
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
        // Encrypted lessons play from page memory on the web (wx.registerHls); the MP4 address is no longer sent for them.
        const hls = access.canWatch && item.hls && wx.registerHls ? wx.registerHls(item.id, item.hls) : "";
        return { ...chapter, hasVideo: !!item.hasVideo, videoUrl: access.canWatch ? hls || item.videoUrl || "" : "" };
      });
      this.setData({ "course.chapters": chapters, viewAccess: { checked: true, canWatch: !!access.canWatch, reason: access.reason || "", isPublic: !!access.isPublic } });
    }).catch(() => {
      if (this.data.course === course) this.setData({ viewAccess: { checked: false, canWatch: false, reason: "" } });
    });
  },
  onShareAppMessage() { return courseShare(this.data.course); },
  openSharePanel() {
    if (!this.data.course) return;
    this.setData({showSharePanel:true,showShareGuide:false,sharePreparing:false,shareError:'',shareHint:'转发时将附上这门课程的封面'});
    if (!wx.isH5) return;
    if(wx.isWechatBrowser && !wx.isWechatBrowser()){
      this.setData({shareHint:'请在微信内打开后使用微信转发'});
      return;
    }
    const course=this.data.course;
    this.setData({sharePreparing:true,shareHint:'正在准备课程封面卡片…'});
    wx.prepareCourseShare(this).then(ready=>{
      if(this.data.course!==course || !this.data.showSharePanel)return;
      this.setData({sharePreparing:false,shareHint:ready ? '课程封面链接卡片已准备好' : '课程链接可通过微信菜单发送；封面配置未确认'});
    });
  },
  closeSharePanel() { this.setData({showSharePanel:false,showShareGuide:false}); },
  keepSharePanelOpen() {},
  closeShareGuide() { this.setData({showShareGuide:false}); },
  previewCover() {
    const url = this.data.course && this.data.course.coverUrl;
    if (url) wx.previewImage({current:url,urls:[url]});
  },
  openEducationBundle(){wx.navigateTo({url:'/pages/education-bundle/education-bundle'});},
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
    if (!this.data.viewAccess.canWatch || !chapter.videoUrl) {
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
    // Outside WeChat the web build plays only the lesson's audio over its cover; the picture stays inside WeChat.
    const audioOnly = !!wx.isH5 && !(wx.isWechatBrowser && wx.isWechatBrowser());
    if (audioOnly && !(wx.hlsAudioReady && wx.hlsAudioReady(chapter.videoUrl))) {
      const link = courseWebLink(this.data.course);
      wx.showModal({
        title: "请在微信中观看",
        content: "这节课的声音版还在准备中，请复制链接后在微信中打开观看。",
        confirmText: "复制链接",
        success: (res) => { if (res.confirm) wx.setClipboardData({ data: link }); }
      });
      return;
    }

    this.setData({
      activeChapterIndex: index,
      playingVideoUrl: chapter.videoUrl,
      showVideoPlayer: true,
      audioOnly,
      viewerMark: viewerMark()
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
