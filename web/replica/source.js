/* Generated from original mini-program sources; run npm run build:web. */
window.MiniSource={config:{"pages": ["pages/index/index", "pages/plaza/plaza", "pages/course-detail/course-detail", "pages/chat/chat", "pages/profile/profile", "pages/manager/manager", "pages/order-detail/order-detail", "pages/profile-edit/profile-edit", "pages/privacy/privacy", "pages/advisor/advisor", "pages/search/search", "pages/customer/customer", "pages/public-class/public-class", "pages/consultation-detail/consultation-detail", "pages/service-workbench/service-workbench", "pages/public-class-detail/public-class-detail", "pages/class-enroll/class-enroll", "pages/my-enrollments/my-enrollments", "pages/class-ticket/class-ticket", "pages/course-manage/course-manage", "pages/course-edit/course-edit", "pages/course-roster/course-roster", "pages/checkin/checkin", "pages/referrals/referrals", "pages/invite-login/invite-login", "pages/course-poster/course-poster", "pages/support/support"], "window": {"navigationBarTitleText": "知守", "navigationBarBackgroundColor": "#FBF9F8", "navigationBarTextStyle": "black", "backgroundColor": "#FBF9F8"}, "permission": {"scope.userLocation": {"desc": "用于在编辑个人资料时获取当前所在地区"}}, "requiredPrivateInfos": ["chooseLocation"], "tabBar": {"color": "#717878", "selectedColor": "#002727", "backgroundColor": "#FFFFFF", "borderStyle": "white", "list": [{"pagePath": "pages/index/index", "text": "首页"}, {"pagePath": "pages/plaza/plaza", "text": "课程"}, {"pagePath": "pages/chat/chat", "text": "聊天"}, {"pagePath": "pages/profile/profile", "text": "我的"}]}, "style": "v2", "sitemapLocation": "sitemap.json"},pages:{"pages/index/index": {"tree": [{"tag": "view", "attrs": {"class": ["home-page safe-bottom"]}, "children": [{"tag": "view", "attrs": {"class": ["custom-nav"], "style": ["height: ", {"e": 0}, "px; padding-top: ", {"e": 1}, "px; padding-right: ", {"e": 2}, "px;"]}, "children": [{"tag": "view", "attrs": {"class": ["nav-left"]}, "children": [{"tag": "view", "attrs": {"class": ["nav-avatar nav-brand"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 3}], "class": ["nav-avatar-img"], "src": [{"e": 4}], "mode": ["aspectFill"], "binderror": ["onAvatarError"]}, "children": []}, {"tag": "text", "attrs": {"wx:else": []}, "children": [{"text": ["知"]}]}]}, {"tag": "view", "attrs": {"class": ["nav-copy"]}, "children": [{"tag": "text", "attrs": {"class": ["nav-title"]}, "children": [{"text": [{"e": 5}]}]}, {"tag": "text", "attrs": {"class": ["nav-greeting"]}, "children": [{"text": ["知守"]}]}]}]}]}, {"tag": "view", "attrs": {"class": ["public-class-entry"]}, "children": [{"tag": "view", "attrs": {"class": ["hero-arch"]}, "children": []}, {"tag": "text", "attrs": {"class": ["public-class-kicker"]}, "children": [{"text": ["知守 · 公开课堂"]}]}, {"tag": "text", "attrs": {"class": ["public-class-title"]}, "children": [{"text": ["透过现象看本质，\n父母有道，孩子有路。"]}]}, {"tag": "text", "attrs": {"class": ["public-class-desc"]}, "children": [{"text": ["从一堂课开始学习与沟通。\n报名费用以各场次页面显示为准。"]}]}, {"tag": "view", "attrs": {"class": ["public-class-actions"]}, "children": [{"tag": "button", "attrs": {"class": ["join-button"], "bindtap": ["goPublicClasses"]}, "children": [{"text": ["课程报名 "]}, {"tag": "text", "attrs": {}, "children": [{"text": ["↗"]}]}]}]}]}, {"tag": "view", "attrs": {"class": ["home-paths"]}, "children": [{"tag": "button", "attrs": {"class": ["home-path"], "bindtap": ["goPlaza"]}, "children": [{"tag": "text", "attrs": {"class": ["path-number"]}, "children": [{"text": ["01 / 学习"]}]}, {"tag": "text", "attrs": {"class": ["path-title"]}, "children": [{"text": ["课程学习 "]}, {"tag": "text", "attrs": {}, "children": [{"text": ["↗"]}]}]}, {"tag": "text", "attrs": {"class": ["path-desc"]}, "children": [{"text": ["关系沟通 · 情绪成长"]}]}]}]}, {"tag": "view", "attrs": {"class": ["search-box"], "bindtap": ["goSearch"]}, "children": [{"tag": "view", "attrs": {"class": ["search-lens"]}, "children": []}, {"tag": "text", "attrs": {"class": ["search-text"]}, "children": [{"text": ["搜索共修课程与学习主题"]}]}]}, {"tag": "view", "attrs": {"class": ["section-head"]}, "children": [{"tag": "view", "attrs": {}, "children": [{"tag": "text", "attrs": {"class": ["section-kicker"]}, "children": [{"text": ["父母学习 · 同伴共修"]}]}, {"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["《答案库》系列课程"]}]}]}, {"tag": "text", "attrs": {"class": ["section-note"]}, "children": [{"text": ["自愿参与 · 持续践行"]}]}]}, {"tag": "view", "attrs": {"class": ["home-course-list"]}, "children": [{"tag": "view", "attrs": {"wx:if": [{"e": 6}], "class": ["loading-notice"]}, "children": [{"text": ["正在加载课程…"]}]}, {"tag": "view", "attrs": {"wx:elif": [{"e": 7}], "class": ["loading-notice"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 7}]}]}, {"tag": "button", "attrs": {"class": ["retry-button"], "bindtap": ["fetchFeaturedCourses"]}, "children": [{"text": ["重新加载"]}]}]}, {"tag": "view", "attrs": {"wx:elif": [{"e": 8}], "class": ["loading-notice"]}, "children": [{"text": ["共修课程准备中，可先查看最新课程场次。"]}]}, {"tag": "navigator", "attrs": {"wx:else": [], "class": ["home-course-card series-entry"], "url": ["/pages/plaza/plaza"], "open-type": ["switchTab"], "aria-label": ["查看答案库系列课程"]}, "children": [{"tag": "view", "attrs": {"class": ["home-course-cover"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 9}], "class": ["home-course-image"], "src": [{"e": 9}], "mode": ["aspectFill"]}, "children": []}, {"tag": "view", "attrs": {"wx:else": [], "class": ["course-cover-placeholder"]}, "children": [{"tag": "text", "attrs": {"class": ["cover-message"]}, "children": [{"text": ["答案库"]}]}]}]}, {"tag": "view", "attrs": {"class": ["home-course-body"]}, "children": [{"tag": "text", "attrs": {"class": ["series-entry-kicker"]}, "children": [{"text": ["认知改变世界"]}]}, {"tag": "text", "attrs": {"class": ["home-course-title"]}, "children": [{"text": ["答案库"]}]}, {"tag": "view", "attrs": {"class": ["series-entry-footer"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["系列课程 · ", {"e": 10}, " 门"]}]}, {"tag": "text", "attrs": {"class": ["series-entry-action"]}, "children": [{"text": ["查看系列课程"]}]}]}]}]}]}]}], "config": {"navigationStyle": "custom", "navigationBarTitleText": "知守"}}, "pages/plaza/plaza": {"tree": [{"tag": "view", "attrs": {"class": ["course-page"]}, "children": [{"tag": "view", "attrs": {"class": ["course-nav"], "style": ["height: ", {"e": 0}, "px; padding-top: ", {"e": 1}, "px;"]}, "children": [{"tag": "button", "attrs": {"class": ["library-back"], "bindtap": ["goHome"]}, "children": [{"text": ["返回首页"]}]}, {"tag": "text", "attrs": {"class": ["nav-title"]}, "children": [{"text": ["答案库"]}]}]}, {"tag": "view", "attrs": {"class": ["course-body"]}, "children": [{"tag": "view", "attrs": {"class": ["library-intro"]}, "children": [{"tag": "text", "attrs": {"class": ["library-kicker"]}, "children": [{"text": ["认知改变世界"]}]}, {"tag": "view", "attrs": {"class": ["library-heading"]}, "children": [{"tag": "text", "attrs": {"class": ["library-title"]}, "children": [{"text": ["系列课程"]}]}, {"tag": "text", "attrs": {"class": ["section-count"]}, "children": [{"text": [{"e": 11}, " 门课程"]}]}]}]}, {"tag": "view", "attrs": {"class": ["course-grid"]}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 12}], "wx:key": ["id"], "class": ["course-card"], "data-id": [{"e": 13}], "bindtap": ["openCourse"], "aria-label": ["查看", {"e": 14}]}, "children": [{"tag": "view", "attrs": {"class": ["card-cover-wrap"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 15}], "class": ["card-cover"], "src": [{"e": 15}], "mode": ["aspectFill"]}, "children": []}, {"tag": "view", "attrs": {"wx:else": [], "class": ["card-cover-fallback"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 14}]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 16}], "class": ["card-duration"]}, "children": [{"text": [{"e": 16}]}]}]}, {"tag": "view", "attrs": {"class": ["card-body"]}, "children": [{"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 14}]}]}, {"tag": "view", "attrs": {"class": ["card-meta"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["课程 ", {"e": 17}]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["查看目录"]}]}]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 18}], "class": ["empty-state"]}, "children": [{"text": ["正在加载课程…"]}]}, {"tag": "view", "attrs": {"wx:elif": [{"e": 19}], "class": ["empty-state"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"class": ["retry-button"], "bindtap": ["fetchCourses"]}, "children": [{"text": ["重新加载"]}]}]}, {"tag": "view", "attrs": {"wx:elif": [{"e": 20}], "class": ["empty-state"]}, "children": [{"text": ["系列课程准备中"]}]}]}]}], "config": {"navigationStyle": "custom", "navigationBarTitleText": "课程"}}, "pages/course-detail/course-detail": {"tree": [{"tag": "view", "attrs": {"class": ["detail-page"]}, "children": [{"tag": "view", "attrs": {"class": ["detail-nav"], "style": ["height: ", {"e": 0}, "px; padding-top: ", {"e": 1}, "px; padding-right: ", {"e": 2}, "px;"]}, "children": [{"tag": "button", "attrs": {"class": ["nav-back"], "bindtap": ["goBack"]}, "children": [{"text": ["‹"]}]}, {"tag": "text", "attrs": {"class": ["nav-title"]}, "children": [{"text": [{"e": 21}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 22}], "class": ["detail-state"], "style": ["padding-top: ", {"e": 23}, "px;"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 24}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 19}], "class": ["retry-button"], "bindtap": ["retryCourse"]}, "children": [{"text": ["重新加载"]}]}, {"tag": "button", "attrs": {"class": ["retry-button"], "bindtap": ["goBack"]}, "children": [{"text": ["返回课程列表"]}]}]}, {"tag": "scroll-view", "attrs": {"wx:elif": [{"e": 25}], "class": ["detail-scroll"], "scroll-y": [], "style": ["padding-top: ", {"e": 0}, "px;"]}, "children": [{"tag": "view", "attrs": {"class": ["video-hero"]}, "children": [{"tag": "video", "attrs": {"wx:if": [{"e": 26}], "id": ["courseVideo"], "class": ["course-video"], "src": [{"e": 27}], "poster": [{"e": 28}], "controls": [], "show-center-play-btn": [], "enable-play-gesture": [], "object-fit": ["contain"], "binderror": ["onVideoError"]}, "children": []}, {"tag": "block", "attrs": {"wx:else": []}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 28}], "class": ["hero-cover"], "src": [{"e": 28}], "mode": ["aspectFill"]}, "children": []}, {"tag": "view", "attrs": {"wx:else": [], "class": ["course-cover-placeholder"]}, "children": [{"tag": "text", "attrs": {"class": ["cover-label"]}, "children": [{"text": ["知守 · 共修课堂"]}]}, {"tag": "text", "attrs": {"class": ["cover-message"]}, "children": [{"text": ["封面待更新"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 28}], "class": ["hero-mask"]}, "children": []}, {"tag": "view", "attrs": {"wx:if": [{"e": 29}], "class": ["play-button"], "bindtap": ["previewCourse"]}, "children": [{"tag": "view", "attrs": {"class": ["play-triangle"]}, "children": []}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 30}], "class": ["detail-course-badge"]}, "children": [{"text": [{"e": 30}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 31}], "class": ["hero-duration"]}, "children": [{"text": [{"e": 31}]}]}]}, {"tag": "view", "attrs": {"class": ["detail-main"]}, "children": [{"tag": "view", "attrs": {"class": ["title-block"]}, "children": [{"tag": "text", "attrs": {"class": ["course-title"]}, "children": [{"text": [{"e": 32}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 33}], "class": ["course-subtitle"]}, "children": [{"text": [{"e": 33}]}]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 34}], "wx:key": ["title"], "class": ["course-info-section"]}, "children": [{"tag": "text", "attrs": {"class": ["course-info-title"]}, "children": [{"text": [{"e": 14}]}]}, {"tag": "text", "attrs": {"class": ["course-info-body"]}, "children": [{"text": [{"e": 35}]}]}]}, {"tag": "view", "attrs": {"class": ["catalog-head"]}, "children": [{"tag": "text", "attrs": {"class": ["catalog-title"]}, "children": [{"text": ["课程目录"]}]}, {"tag": "text", "attrs": {"class": ["catalog-count"]}, "children": [{"text": [{"e": 36}, " 节"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 36}], "class": ["catalog-panel"]}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 37}], "wx:key": ["id"], "class": ["chapter-row ", {"e": 38}], "data-index": [{"e": 39}], "bindtap": ["openChapter"]}, "children": [{"tag": "view", "attrs": {"class": ["chapter-index"]}, "children": [{"text": [{"e": 17}]}]}, {"tag": "view", "attrs": {"class": ["chapter-copy"]}, "children": [{"tag": "text", "attrs": {"class": ["chapter-title"]}, "children": [{"text": [{"e": 14}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 40}], "class": ["chapter-duration"]}, "children": [{"text": [{"e": 40}]}]}]}, {"tag": "text", "attrs": {"class": ["chapter-play-tag"]}, "children": [{"text": [{"e": 41}]}]}]}]}, {"tag": "view", "attrs": {"wx:else": [], "class": ["catalog-empty"]}, "children": [{"tag": "text", "attrs": {"class": ["catalog-empty-title"]}, "children": [{"text": ["目录准备中"]}]}, {"tag": "text", "attrs": {"class": ["catalog-empty-desc"]}, "children": [{"text": ["课时上传后会显示在这里"]}]}]}]}]}]}], "config": {"navigationStyle": "custom", "navigationBarTitleText": "课程详情"}}, "pages/chat/chat": {"tree": [{"tag": "view", "attrs": {"class": ["chat-page"]}, "children": [{"tag": "view", "attrs": {"class": ["chat-nav"], "style": ["height: ", {"e": 0}, "px; padding-top: ", {"e": 1}, "px; padding-right: ", {"e": 2}, "px;"]}, "children": [{"tag": "button", "attrs": {"aria-label": ["返回"], "class": ["nav-back"], "bindtap": ["goBack"]}, "children": [{"text": ["‹"]}]}, {"tag": "view", "attrs": {"class": ["nav-title"]}, "children": [{"tag": "view", "attrs": {"class": ["nav-mark ", {"e": 42}, " ", {"e": 43}], "catchtap": ["onNavMarkTap"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 44}], "class": ["nav-mark-avatar-image"], "src": [{"e": 45}], "mode": ["aspectFill"]}, "children": []}, {"tag": "text", "attrs": {"wx:elif": [{"e": 46}], "class": ["nav-mark-avatar-text"]}, "children": [{"text": [{"e": 47}]}]}, {"tag": "text", "attrs": {"wx:elif": [{"e": 48}], "class": ["nav-mark-list-icon"]}, "children": [{"text": ["☰"]}]}, {"tag": "text", "attrs": {"wx:else": []}, "children": [{"text": ["✦"]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 49}], "class": ["nav-mark-badge"]}, "children": [{"text": [{"e": 50}]}]}]}, {"tag": "view", "attrs": {"class": [{"e": 51}], "catchtap": ["onNavMarkTap"]}, "children": [{"tag": "text", "attrs": {"class": ["title-name"]}, "children": [{"text": [{"e": 52}]}]}, {"tag": "text", "attrs": {"class": ["title-sub"]}, "children": [{"text": [{"e": 53}]}]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 54}], "class": ["service-card ", {"e": 55}]}, "children": [{"tag": "view", "attrs": {"class": ["service-card-handle"], "catchtap": ["toggleServiceCard"]}, "children": [{"tag": "view", "attrs": {"class": ["service-handle-arrow ", {"e": 56}]}, "children": []}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 57}]}, "children": [{"tag": "view", "attrs": {"class": ["service-time service-time-only"]}, "children": [{"tag": "text", "attrs": {"class": ["time-value"]}, "children": [{"text": [{"e": 58}]}]}, {"tag": "text", "attrs": {"class": ["time-label"]}, "children": [{"text": ["剩余"]}]}]}]}, {"tag": "block", "attrs": {"wx:else": []}, "children": [{"tag": "view", "attrs": {}, "children": [{"tag": "text", "attrs": {"class": ["service-label"]}, "children": [{"text": [{"e": 59}]}]}, {"tag": "text", "attrs": {"class": ["service-desc"]}, "children": [{"text": [{"e": 60}]}]}]}, {"tag": "view", "attrs": {"class": ["service-time"]}, "children": [{"tag": "text", "attrs": {"class": ["time-label"]}, "children": [{"text": ["剩余"]}]}, {"tag": "text", "attrs": {"class": ["time-value"]}, "children": [{"text": [{"e": 58}]}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 61}], "class": ["renew-action"], "loading": [{"e": 62}], "disabled": [{"e": 62}], "bindtap": ["renewService"]}, "children": [{"text": ["\n        续费 ¥200/小时\n      "]}]}]}]}, {"tag": "scroll-view", "attrs": {"class": ["chat-scroll"], "scroll-y": [], "scroll-with-animation": [], "scroll-into-view": [{"e": 63}]}, "children": [{"tag": "view", "attrs": {"wx:if": [{"e": 64}], "class": ["chat-empty"]}, "children": [{"tag": "view", "attrs": {"class": ["chat-empty-mark"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["知"]}]}]}, {"tag": "text", "attrs": {"class": ["chat-empty-title"]}, "children": [{"text": ["暂时还没有创建相应的聊天。"]}]}]}, {"tag": "view", "attrs": {"wx:else": [], "class": ["system-card"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 65}]}]}]}, {"tag": "view", "attrs": {"class": ["messages"]}, "children": [{"tag": "block", "attrs": {"wx:for": [{"e": 66}], "wx:key": ["id"]}, "children": [{"tag": "view", "attrs": {"wx:if": [{"e": 67}], "id": ["msg-", {"e": 13}], "class": ["message-row recall-row"]}, "children": [{"tag": "view", "attrs": {"class": ["recall-notice"]}, "children": [{"tag": "text", "attrs": {"class": ["recall-notice-text"]}, "children": [{"text": ["你撤回了一条消息"]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 68}], "class": ["recall-reedit"], "data-id": [{"e": 13}], "catchtap": ["onReeditRecall"]}, "children": [{"text": ["重新编辑"]}]}]}]}, {"tag": "view", "attrs": {"wx:elif": [{"e": 69}], "id": ["msg-", {"e": 13}], "class": ["message-row ", {"e": 70}]}, "children": [{"tag": "view", "attrs": {"wx:if": [{"e": 71}], "class": ["message-avatar ", {"e": 72}], "catchtap": ["onCustomerAvatarTap"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 73}], "class": ["chat-avatar-image"], "src": [{"e": 73}], "mode": ["aspectFill"]}, "children": []}, {"tag": "text", "attrs": {"wx:else": []}, "children": [{"text": [{"e": 74}]}]}]}, {"tag": "view", "attrs": {"class": ["bubble"], "catchlongpress": [{"e": 75}], "data-id": [{"e": 13}]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 69}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 76}], "class": ["user-message-avatar"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 77}], "class": ["chat-avatar-image"], "src": [{"e": 77}], "mode": ["aspectFill"]}, "children": []}, {"tag": "text", "attrs": {"wx:else": []}, "children": [{"text": [{"e": 78}]}]}]}]}]}]}]}, {"tag": "view", "attrs": {"class": ["chat-footer"]}, "children": [{"tag": "view", "attrs": {"wx:if": [{"e": 79}], "class": ["send-error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 79}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 80}], "class": ["failed-message"], "selectable": []}, "children": [{"text": [{"e": 80}]}]}, {"tag": "view", "attrs": {"class": ["send-recovery"]}, "children": [{"tag": "button", "attrs": {"bindtap": ["loadBackendMessages"]}, "children": [{"text": ["刷新记录"]}]}, {"tag": "button", "attrs": {"bindtap": ["copyUnsentMessage"]}, "children": [{"text": ["复制原文"]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 81}], "class": ["chat-composer"]}, "children": [{"tag": "textarea", "attrs": {"auto-height": [], "maxlength": ["4000"], "class": ["composer-input"], "placeholder": [{"e": 82}], "value": [{"e": 83}], "confirm-type": ["send"], "disabled": [{"e": 84}], "bindinput": ["onInput"], "bindconfirm": ["sendMessage"]}, "children": []}, {"tag": "button", "attrs": {"aria-label": ["发送消息"], "loading": [{"e": 85}], "class": ["composer-send ", {"e": 86}], "disabled": [{"e": 87}], "bindtap": ["sendMessage"]}, "children": [{"text": ["↑"]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 88}], "class": ["session-drawer-root"]}, "children": [{"tag": "view", "attrs": {"class": ["session-drawer-mask"], "bindtap": ["closeSessionDrawer"], "catchtouchmove": ["preventTouchMove"]}, "children": []}, {"tag": "view", "attrs": {"class": ["session-drawer session-drawer-open"], "catchtouchmove": ["preventTouchMove"]}, "children": [{"tag": "view", "attrs": {"class": ["session-drawer-header"]}, "children": [{"tag": "view", "attrs": {}, "children": [{"tag": "text", "attrs": {"class": ["session-drawer-title"]}, "children": [{"text": ["我的客户"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 89}], "class": ["session-drawer-count"]}, "children": [{"text": [{"e": 50}]}]}]}, {"tag": "scroll-view", "attrs": {"scroll-y": [], "class": ["session-drawer-list"], "show-scrollbar": [{"e": 90}]}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 91}], "wx:key": ["id"], "class": ["session-drawer-item ", {"e": 92}], "data-id": [{"e": 13}], "bindtap": ["switchToManagerSession"]}, "children": [{"tag": "view", "attrs": {"class": ["session-drawer-avatar"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 93}], "class": ["session-drawer-avatar-image"], "src": [{"e": 93}], "mode": ["aspectFill"]}, "children": []}, {"tag": "text", "attrs": {"wx:else": []}, "children": [{"text": [{"e": 94}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 95}], "class": ["session-drawer-unread"]}, "children": [{"text": [{"e": 96}]}]}]}, {"tag": "view", "attrs": {"class": ["session-drawer-body"]}, "children": [{"tag": "view", "attrs": {"class": ["session-drawer-row"]}, "children": [{"tag": "text", "attrs": {"class": ["session-drawer-name"]}, "children": [{"text": [{"e": 97}]}]}, {"tag": "text", "attrs": {"class": ["session-drawer-time"]}, "children": [{"text": [{"e": 98}]}]}]}, {"tag": "text", "attrs": {"class": ["session-drawer-preview"]}, "children": [{"text": [{"e": 99}]}]}, {"tag": "view", "attrs": {"class": ["session-drawer-meta"]}, "children": [{"tag": "text", "attrs": {"class": ["session-drawer-status ", {"e": 100}]}, "children": [{"text": [{"e": 101}]}]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 102}], "class": ["session-drawer-empty"]}, "children": [{"text": ["\n          暂无进行中的客户会话\n        "]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 103}], "class": ["session-drawer-empty"]}, "children": [{"text": ["加载中..."]}]}]}]}]}]}], "config": {"navigationStyle": "custom", "navigationBarTitleText": "文字聊天"}}, "pages/profile/profile": {"tree": [{"tag": "view", "attrs": {"class": ["profile-page safe-bottom"]}, "children": [{"tag": "view", "attrs": {"class": ["custom-nav"], "style": ["height: ", {"e": 0}, "px; padding-top: ", {"e": 1}, "px;"]}, "children": [{"tag": "text", "attrs": {"class": ["nav-brand"]}, "children": [{"text": ["知守"]}]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 104}]}, "children": [{"tag": "view", "attrs": {"class": ["login-screen"]}, "children": [{"tag": "view", "attrs": {"class": ["login-brand"]}, "children": [{"tag": "view", "attrs": {"class": ["login-avatar-shell"]}, "children": [{"tag": "button", "attrs": {"class": ["login-avatar-picker"], "open-type": ["chooseAvatar"], "bindchooseavatar": ["onChooseLoginAvatar"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 105}], "class": ["login-avatar-img"], "src": [{"e": 105}], "mode": ["aspectFill"]}, "children": []}, {"tag": "image", "attrs": {"wx:else": [], "class": ["login-avatar-img"], "src": [{"e": 106}], "mode": ["aspectFill"]}, "children": []}]}, {"tag": "view", "attrs": {"class": ["login-avatar-badge"]}, "children": [{"text": ["头像"]}]}]}, {"tag": "text", "attrs": {"class": ["login-title"]}, "children": [{"text": ["欢迎来到知守"]}]}, {"tag": "text", "attrs": {"class": ["login-subtitle"]}, "children": [{"text": ["使用微信身份登录，一个微信仅对应一个账户"]}]}]}, {"tag": "view", "attrs": {"class": ["login-card"]}, "children": [{"tag": "view", "attrs": {"class": ["login-field"]}, "children": [{"tag": "text", "attrs": {"class": ["login-prefix"]}, "children": [{"text": ["名"]}]}, {"tag": "input", "attrs": {"class": ["login-input"], "type": ["nickname"], "maxlength": ["20"], "placeholder": ["设置你的唯一用户名"], "placeholder-class": ["login-placeholder"], "value": [{"e": 107}], "bindinput": ["onLoginNickNameInput"]}, "children": []}]}]}, {"tag": "button", "attrs": {"class": ["login-button ", {"e": 108}], "loading": [{"e": 109}], "disabled": [{"e": 109}], "bindtap": ["loginByWechat"]}, "children": [{"text": ["微信登录"]}]}, {"tag": "text", "attrs": {"class": ["login-status"]}, "children": [{"text": [{"e": 110}]}]}, {"tag": "view", "attrs": {"class": ["login-benefits"]}, "children": [{"tag": "view", "attrs": {"class": ["login-benefit-item"]}, "children": [{"tag": "view", "attrs": {"class": ["benefit-dot"]}, "children": []}, {"tag": "text", "attrs": {}, "children": [{"text": ["首次登录需设置头像和唯一用户名"]}]}]}, {"tag": "view", "attrs": {"class": ["login-benefit-item"]}, "children": [{"tag": "view", "attrs": {"class": ["benefit-dot"]}, "children": []}, {"tag": "text", "attrs": {}, "children": [{"text": ["再次登录时，同一微信将自动进入原账户"]}]}]}]}, {"tag": "view", "attrs": {"class": ["login-agreement"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["登录即代表你已阅读并同意"]}]}, {"tag": "text", "attrs": {"class": ["agreement-link"], "bindtap": ["goPrivacy"]}, "children": [{"text": ["《隐私与安全说明》"]}]}]}]}]}, {"tag": "block", "attrs": {"wx:else": []}, "children": [{"tag": "view", "attrs": {"class": ["member-hero"]}, "children": [{"tag": "view", "attrs": {"class": ["profile-photo"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 4}], "class": ["profile-photo-img"], "src": [{"e": 4}], "mode": ["aspectFill"]}, "children": []}, {"tag": "image", "attrs": {"wx:else": [], "class": ["profile-photo-img"], "src": [{"e": 106}], "mode": ["aspectFill"]}, "children": []}, {"tag": "view", "attrs": {"class": ["photo-accent"]}, "children": []}]}, {"tag": "text", "attrs": {"class": ["profile-name"]}, "children": [{"text": [{"e": 111}]}]}, {"tag": "text", "attrs": {"class": ["profile-badge"]}, "children": [{"text": [{"e": 112}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 113}], "class": ["profile-quote"]}, "children": [{"text": ["你的工作身份已启用，可进入工作台查看会话。"]}]}, {"tag": "button", "attrs": {"class": ["edit-button"], "bindtap": ["goEditProfile"]}, "children": [{"text": ["编辑个人资料"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 113}], "class": ["manager-panel"]}, "children": [{"tag": "view", "attrs": {"class": ["manager-panel-head"]}, "children": [{"tag": "text", "attrs": {"class": ["manager-title"]}, "children": [{"text": ["工作台"]}]}, {"tag": "view", "attrs": {"class": ["manager-state"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 114}]}]}]}]}, {"tag": "view", "attrs": {"class": ["manager-stats"]}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 115}], "wx:key": ["label"], "class": ["manager-stat"]}, "children": [{"tag": "text", "attrs": {"class": ["manager-stat-value"]}, "children": [{"text": [{"e": 116}]}]}, {"tag": "text", "attrs": {"class": ["manager-stat-label"]}, "children": [{"text": [{"e": 117}]}]}]}]}, {"tag": "button", "attrs": {"class": ["manager-button"], "data-view": ["workbench"], "bindtap": ["goManagerSection"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["进入工作台"]}]}, {"tag": "text", "attrs": {"class": ["manager-button-arrow"]}, "children": [{"text": ["›"]}]}]}]}, {"tag": "view", "attrs": {"wx:else": [], "class": ["wealth-grid"]}, "children": [{"tag": "view", "attrs": {"class": ["wealth-card net-worth"]}, "children": [{"tag": "view", "attrs": {}, "children": [{"tag": "text", "attrs": {"class": ["wealth-label"]}, "children": [{"text": ["累计消费"]}]}, {"tag": "view", "attrs": {"class": ["wealth-value"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["¥"]}]}, {"text": [{"e": 118}]}]}]}, {"tag": "view", "attrs": {"class": ["wallet-ghost"]}, "children": [{"text": ["▣"]}]}]}]}, {"tag": "view", "attrs": {"class": ["settings-section"]}, "children": [{"tag": "text", "attrs": {"class": ["settings-caption"]}, "children": [{"text": ["客户服务"]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 119}], "class": ["settings-row"], "bindtap": ["goReferrals"]}, "children": [{"tag": "view", "attrs": {"class": ["settings-copy"]}, "children": [{"tag": "text", "attrs": {"class": ["settings-title"]}, "children": [{"text": ["推荐客户"]}]}, {"tag": "text", "attrs": {"class": ["settings-desc"]}, "children": [{"text": ["我的推荐报名码 · 客户来源 · 报名与到课状态"]}]}]}, {"tag": "text", "attrs": {"class": ["settings-arrow"]}, "children": [{"text": ["›"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 120}], "class": ["settings-row"], "bindtap": ["goCheckin"]}, "children": [{"tag": "view", "attrs": {"class": ["settings-copy"]}, "children": [{"tag": "text", "attrs": {"class": ["settings-title"]}, "children": [{"text": ["扫码进场"]}]}, {"tag": "text", "attrs": {"class": ["settings-desc"]}, "children": [{"text": ["课程签到 · 已到与未到人数 · 签到人员安排"]}]}]}, {"tag": "text", "attrs": {"class": ["settings-arrow"]}, "children": [{"text": ["›"]}]}]}, {"tag": "view", "attrs": {"class": ["settings-row"], "bindtap": ["goCustomerPortal"]}, "children": [{"tag": "view", "attrs": {"class": ["settings-copy"]}, "children": [{"tag": "text", "attrs": {"class": ["settings-title"]}, "children": [{"text": ["进入客户端"]}]}, {"tag": "text", "attrs": {"class": ["settings-desc"]}, "children": [{"text": ["我的报名、线下预约、孩子基础信息与执行反馈"]}]}]}, {"tag": "text", "attrs": {"class": ["settings-arrow"]}, "children": [{"text": ["›"]}]}]}, {"tag": "view", "attrs": {"class": ["settings-row"], "bindtap": ["goPublicClasses"]}, "children": [{"tag": "view", "attrs": {"class": ["settings-copy"]}, "children": [{"tag": "text", "attrs": {"class": ["settings-title"]}, "children": [{"text": ["公开课"]}]}]}, {"tag": "text", "attrs": {"class": ["settings-arrow"]}, "children": [{"text": ["›"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 113}], "class": ["settings-row"], "bindtap": ["goOfflineWorkbench"]}, "children": [{"tag": "view", "attrs": {"class": ["settings-copy"]}, "children": [{"tag": "text", "attrs": {"class": ["settings-title"]}, "children": [{"text": ["公开课与线下咨询管理"]}]}, {"tag": "text", "attrs": {"class": ["settings-desc"]}, "children": [{"text": ["报名、到课核实、预约确认与反馈回复"]}]}]}, {"tag": "text", "attrs": {"class": ["settings-arrow"]}, "children": [{"text": ["›"]}]}]}]}, {"tag": "view", "attrs": {"class": ["settings-section"]}, "children": [{"tag": "text", "attrs": {"class": ["settings-caption"]}, "children": [{"text": ["系统与偏好"]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 121}], "class": ["settings-row test-preview-row"], "bindtap": ["exitTestCustomerPreview"]}, "children": [{"tag": "view", "attrs": {"class": ["settings-copy"]}, "children": [{"tag": "text", "attrs": {"class": ["settings-title"]}, "children": [{"text": ["退出客户端测试"]}]}, {"tag": "text", "attrs": {"class": ["settings-desc"]}, "children": [{"text": ["当前为测试客户小安，点此恢复经理身份"]}]}]}, {"tag": "text", "attrs": {"class": ["settings-arrow"]}, "children": [{"text": ["›"]}]}]}, {"tag": "view", "attrs": {"class": ["settings-row"], "bindtap": ["goPrivacy"]}, "children": [{"tag": "view", "attrs": {"class": ["settings-copy"]}, "children": [{"tag": "text", "attrs": {"class": ["settings-title"]}, "children": [{"text": ["隐私与安全"]}]}, {"tag": "text", "attrs": {"class": ["settings-desc"]}, "children": [{"text": ["管理登录、手机号与隐私授权"]}]}]}, {"tag": "text", "attrs": {"class": ["settings-arrow"]}, "children": [{"text": ["›"]}]}]}, {"tag": "view", "attrs": {"class": ["settings-row"], "bindtap": ["goSupport"]}, "children": [{"tag": "view", "attrs": {"class": ["settings-copy"]}, "children": [{"tag": "text", "attrs": {"class": ["settings-title"]}, "children": [{"text": ["帮助与支持"]}]}, {"tag": "text", "attrs": {"class": ["settings-desc"]}, "children": [{"text": ["报名、咨询与资料管理帮助"]}]}]}, {"tag": "text", "attrs": {"class": ["settings-arrow"]}, "children": [{"text": ["›"]}]}]}, {"tag": "view", "attrs": {"class": ["settings-row"], "bindtap": ["goAbout"]}, "children": [{"tag": "view", "attrs": {"class": ["settings-copy"]}, "children": [{"tag": "text", "attrs": {"class": ["settings-title"]}, "children": [{"text": ["关于 知守"]}]}, {"tag": "text", "attrs": {"class": ["settings-desc"]}, "children": [{"text": ["了解服务与当前版本"]}]}]}, {"tag": "text", "attrs": {"class": ["settings-arrow"]}, "children": [{"text": ["›"]}]}]}, {"tag": "view", "attrs": {"class": ["logout-row"], "bindtap": ["logout"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["退出当前账号"]}]}]}]}]}]}], "config": {"navigationStyle": "custom", "navigationBarTitleText": "我的"}}, "pages/manager/manager": {"tree": [{"tag": "view", "attrs": {"class": ["manager-page safe-bottom"]}, "children": [{"tag": "view", "attrs": {"class": ["manager-topbar"], "style": ["height: ", {"e": 0}, "px; padding-top: ", {"e": 1}, "px;"]}, "children": [{"tag": "view", "attrs": {"class": ["icon-button"], "bindtap": ["returnToProfile"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["‹"]}]}]}]}, {"tag": "view", "attrs": {"class": ["view-tabs"]}, "children": [{"tag": "button", "attrs": {"class": ["view-tab ", {"e": 122}], "data-view": ["workbench"], "bindtap": ["switchView"]}, "children": [{"text": ["工作台"]}]}, {"tag": "button", "attrs": {"class": ["view-tab ", {"e": 123}], "data-view": ["serving"], "bindtap": ["switchView"]}, "children": [{"text": ["服务中"]}]}, {"tag": "button", "attrs": {"class": ["view-tab ", {"e": 124}], "data-view": ["identities"], "bindtap": ["switchView"]}, "children": [{"text": ["身份管理"]}]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 125}]}, "children": [{"tag": "view", "attrs": {"class": ["hero-line"]}, "children": [{"tag": "text", "attrs": {"class": ["hero-title"]}, "children": [{"text": ["早上好，主管。"]}]}, {"tag": "text", "attrs": {"class": ["hero-copy"]}, "children": [{"text": ["当前绑定客户的服务状态如下。"]}]}]}, {"tag": "view", "attrs": {"class": ["stats-grid stats-grid-compact"]}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 126}], "wx:key": ["label"], "class": ["stat-card"]}, "children": [{"tag": "text", "attrs": {"class": ["stat-value"]}, "children": [{"text": [{"e": 116}]}]}, {"tag": "text", "attrs": {"class": ["stat-label"]}, "children": [{"text": [{"e": 117}]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 127}], "class": ["workbench-tip"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["有 ", {"e": 128}, " 位客户正在服务中，可前往「服务中」查看会话。"]}]}, {"tag": "button", "attrs": {"class": ["ghost-action workbench-link"], "data-view": ["serving"], "bindtap": ["switchView"]}, "children": [{"text": ["进入服务中"]}]}]}, {"tag": "view", "attrs": {"wx:elif": [{"e": 129}], "class": ["workbench-tip"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["当前没有进行中的会话，已有 ", {"e": 130}, " 位客户完成服务。"]}]}]}, {"tag": "view", "attrs": {"wx:else": [], "class": ["empty-card"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["暂无绑定客户会话"]}]}]}]}, {"tag": "block", "attrs": {"wx:elif": [{"e": 131}]}, "children": [{"tag": "view", "attrs": {"class": ["hero-line compact"]}, "children": [{"tag": "text", "attrs": {"class": ["hero-title"]}, "children": [{"text": ["正在进行的会话"]}]}, {"tag": "text", "attrs": {"class": ["hero-copy"]}, "children": [{"text": ["保持温和、清晰，并记录关键进展。"]}]}]}, {"tag": "view", "attrs": {"class": ["session-list"]}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 132}], "wx:key": ["id"], "class": ["session-card"]}, "children": [{"tag": "view", "attrs": {"class": ["request-head"]}, "children": [{"tag": "view", "attrs": {"class": ["client-avatar"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 93}], "class": ["avatar-image"], "src": [{"e": 93}], "mode": ["aspectFill"]}, "children": []}, {"tag": "text", "attrs": {"wx:else": []}, "children": [{"text": [{"e": 133}]}]}]}, {"tag": "view", "attrs": {"class": ["client-main"]}, "children": [{"tag": "view", "attrs": {"class": ["client-line"]}, "children": [{"tag": "text", "attrs": {"class": ["client-name"]}, "children": [{"text": [{"e": 97}]}]}, {"tag": "text", "attrs": {"class": ["tag-pill gold"]}, "children": [{"text": [{"e": 134}]}]}]}, {"tag": "text", "attrs": {"class": ["request-time"]}, "children": [{"text": ["开始时间 ", {"e": 135}]}]}]}, {"tag": "text", "attrs": {"class": ["timer-pill"]}, "children": [{"text": [{"e": 136}]}]}]}, {"tag": "text", "attrs": {"class": ["request-title"]}, "children": [{"text": [{"e": 99}]}]}, {"tag": "view", "attrs": {"class": ["progress-row"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["已进行 ", {"e": 137}, " 分钟"]}]}, {"tag": "view", "attrs": {"class": ["progress-track"]}, "children": [{"tag": "view", "attrs": {"class": ["progress-fill"], "style": ["width: ", {"e": 138}, "%;"]}, "children": []}]}, {"tag": "text", "attrs": {}, "children": [{"text": [{"e": 139}, " 分钟"]}]}]}, {"tag": "view", "attrs": {"class": ["session-footer"]}, "children": [{"tag": "text", "attrs": {"class": ["session-price"]}, "children": [{"text": ["¥", {"e": 140}]}]}, {"tag": "view", "attrs": {"class": ["session-actions"]}, "children": [{"tag": "button", "attrs": {"class": ["ghost-action session-action-btn"], "data-order-id": [{"e": 141}], "data-session-id": [{"e": 13}], "catchtap": ["openOrderDetail"]}, "children": [{"text": ["查看记录"]}]}, {"tag": "button", "attrs": {"class": ["primary-action session-action-btn"], "data-id": [{"e": 13}], "bindtap": ["enterChat"]}, "children": [{"text": ["进入会话"]}]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 142}], "class": ["empty-card"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["暂无进行中的会话"]}]}]}]}]}, {"tag": "block", "attrs": {"wx:elif": [{"e": 143}]}, "children": [{"tag": "view", "attrs": {"class": ["hero-line compact"]}, "children": [{"tag": "text", "attrs": {"class": ["hero-title"]}, "children": [{"text": ["身份管理"]}]}, {"tag": "text", "attrs": {"class": ["hero-copy"]}, "children": [{"text": ["为已登录用户设置管理、代理或用户身份。每次变更都会写入后台审计记录。"]}]}]}, {"tag": "view", "attrs": {"class": ["identity-search-wrap"]}, "children": [{"tag": "input", "attrs": {"class": ["identity-search"], "value": [{"e": 144}], "placeholder": ["搜索昵称或用户编号"], "bindinput": ["onIdentitySearch"]}, "children": []}]}, {"tag": "view", "attrs": {"class": ["identity-list"]}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 145}], "wx:key": ["id"], "class": ["identity-card"]}, "children": [{"tag": "view", "attrs": {"class": ["identity-avatar"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 93}], "class": ["avatar-image"], "src": [{"e": 93}], "mode": ["aspectFill"]}, "children": []}, {"tag": "text", "attrs": {"wx:else": []}, "children": [{"text": [{"e": 94}]}]}]}, {"tag": "view", "attrs": {"class": ["identity-main"]}, "children": [{"tag": "view", "attrs": {"class": ["identity-name-row"]}, "children": [{"tag": "text", "attrs": {"class": ["identity-name"]}, "children": [{"text": [{"e": 97}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 146}], "class": ["identity-self"]}, "children": [{"text": ["当前账号"]}]}]}, {"tag": "text", "attrs": {"class": ["identity-account-id"]}, "children": [{"text": ["用户编号 ", {"e": 13}]}]}]}, {"tag": "picker", "attrs": {"mode": ["selector"], "range": [{"e": 147}], "range-key": ["label"], "value": [{"e": 148}], "data-id": [{"e": 13}], "disabled": [{"e": 149}], "bindchange": ["onIdentityChange"]}, "children": [{"tag": "view", "attrs": {"class": ["identity-picker ", {"e": 150}]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 151}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 152}], "class": ["identity-picker-arrow"]}, "children": [{"text": ["⌄"]}]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 153}], "class": ["empty-card"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["正在加载用户身份…"]}]}]}, {"tag": "view", "attrs": {"wx:elif": [{"e": 154}], "class": ["empty-card"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["没有找到匹配的用户"]}]}]}]}]}, {"tag": "view", "attrs": {"class": ["customer-service-panel"]}, "children": [{"tag": "view", "attrs": {"class": ["customer-service-copy"]}, "children": [{"tag": "text", "attrs": {"class": ["customer-service-title"]}, "children": [{"text": ["客户服务"]}]}, {"tag": "text", "attrs": {"class": ["customer-service-desc"]}, "children": [{"text": ["公开课报名、线下预约与咨询跟进"]}]}]}, {"tag": "view", "attrs": {"class": ["customer-service-actions"]}, "children": [{"tag": "button", "attrs": {"class": ["primary-action"], "bindtap": ["goOfflineWorkbench"]}, "children": [{"text": ["服务管理"]}]}, {"tag": "button", "attrs": {"class": ["ghost-action"], "bindtap": ["goCustomerPortal"]}, "children": [{"text": ["进入客户端"]}]}]}]}]}], "config": {"navigationStyle": "custom"}}, "pages/order-detail/order-detail": {"tree": [{"tag": "view", "attrs": {"class": ["detail-page safe-bottom"]}, "children": [{"tag": "view", "attrs": {"class": ["detail-nav"], "style": ["height: ", {"e": 0}, "px; padding-top: ", {"e": 1}, "px; padding-right: ", {"e": 2}, "px;"]}, "children": [{"tag": "button", "attrs": {"class": ["nav-back"], "bindtap": ["goBack"]}, "children": [{"text": ["‹"]}]}, {"tag": "text", "attrs": {"class": ["nav-title"]}, "children": [{"text": ["订单详情"]}]}]}, {"tag": "view", "attrs": {"class": ["detail-body"], "style": ["padding-top: ", {"e": 0}, "px;"]}, "children": [{"tag": "view", "attrs": {"wx:if": [{"e": 18}], "class": ["state-card"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["正在读取记录..."]}]}]}, {"tag": "block", "attrs": {"wx:elif": [{"e": 155}]}, "children": [{"tag": "view", "attrs": {"class": ["detail-hero"]}, "children": [{"tag": "view", "attrs": {"class": ["client-avatar"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 156}], "class": ["avatar-image"], "src": [{"e": 156}], "mode": ["aspectFill"]}, "children": []}, {"tag": "text", "attrs": {"wx:else": []}, "children": [{"text": [{"e": 157}]}]}]}, {"tag": "view", "attrs": {"class": ["hero-main"]}, "children": [{"tag": "view", "attrs": {"class": ["client-line"]}, "children": [{"tag": "text", "attrs": {"class": ["client-name"]}, "children": [{"text": [{"e": 158}]}]}, {"tag": "text", "attrs": {"class": ["tag-pill"]}, "children": [{"text": [{"e": 159}]}]}]}, {"tag": "text", "attrs": {"class": ["order-title"]}, "children": [{"text": [{"e": 160}]}]}]}, {"tag": "text", "attrs": {"class": ["status-pill ", {"e": 161}]}, "children": [{"text": [{"e": 162}]}]}]}, {"tag": "view", "attrs": {"class": ["info-grid"]}, "children": [{"tag": "view", "attrs": {"class": ["info-item"]}, "children": [{"tag": "text", "attrs": {"class": ["info-label"]}, "children": [{"text": ["服务时长"]}]}, {"tag": "text", "attrs": {"class": ["info-value"]}, "children": [{"text": [{"e": 163}, "分钟"]}]}]}, {"tag": "view", "attrs": {"class": ["info-item"]}, "children": [{"tag": "text", "attrs": {"class": ["info-label"]}, "children": [{"text": ["金额"]}]}, {"tag": "text", "attrs": {"class": ["info-value"]}, "children": [{"text": ["¥", {"e": 164}]}]}]}, {"tag": "view", "attrs": {"class": ["info-item wide"]}, "children": [{"tag": "text", "attrs": {"class": ["info-label"]}, "children": [{"text": ["提交时间"]}]}, {"tag": "text", "attrs": {"class": ["info-value"]}, "children": [{"text": [{"e": 165}]}]}]}, {"tag": "view", "attrs": {"class": ["info-item wide"]}, "children": [{"tag": "text", "attrs": {"class": ["info-label"]}, "children": [{"text": ["会话编号"]}]}, {"tag": "text", "attrs": {"class": ["info-value"]}, "children": [{"text": [{"e": 166}]}]}]}]}, {"tag": "view", "attrs": {"class": ["message-list"]}, "children": [{"tag": "view", "attrs": {"class": ["records-head"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["聊天记录"]}]}, {"tag": "view", "attrs": {"class": ["text-action"], "bindtap": ["refreshDetail"]}, "children": [{"text": ["刷新"]}]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 66}], "wx:key": ["id"], "class": ["message-row ", {"e": 70}]}, "children": [{"tag": "view", "attrs": {"wx:if": [{"e": 71}], "class": ["message-avatar"]}, "children": [{"text": ["师"]}]}, {"tag": "view", "attrs": {"class": ["bubble"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 69}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 76}], "class": ["message-avatar user"]}, "children": [{"text": [{"e": 157}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 64}], "class": ["state-card compact"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["暂无聊天记录"]}]}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 167}], "class": ["primary-action fixed-action"], "bindtap": ["openChat"]}, "children": [{"text": ["\n      ", {"e": 168}, "\n    "]}]}]}, {"tag": "view", "attrs": {"wx:else": [], "class": ["state-card"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["没有找到这条订单记录"]}]}, {"tag": "button", "attrs": {"class": ["primary-action"], "bindtap": ["goBack"]}, "children": [{"text": ["返回"]}]}]}]}]}], "config": {"navigationStyle": "custom", "usingComponents": {}}}, "pages/profile-edit/profile-edit": {"tree": [{"tag": "view", "attrs": {"class": ["edit-page safe-bottom"]}, "children": [{"tag": "view", "attrs": {"class": ["edit-hero"]}, "children": [{"tag": "view", "attrs": {"class": ["avatar-shell"]}, "children": [{"tag": "button", "attrs": {"disabled": [{"e": 169}], "class": ["avatar-picker"], "open-type": ["chooseAvatar"], "bindchooseavatar": ["onChooseAvatar"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 170}], "class": ["avatar-image"], "src": [{"e": 170}], "mode": ["aspectFill"]}, "children": []}, {"tag": "image", "attrs": {"wx:else": [], "class": ["avatar-image"], "src": [{"e": 106}], "mode": ["aspectFill"]}, "children": []}]}, {"tag": "view", "attrs": {"class": ["avatar-badge"]}, "children": [{"text": ["改"]}]}]}, {"tag": "text", "attrs": {"class": ["edit-title"]}, "children": [{"text": ["编辑个人资料"]}]}, {"tag": "text", "attrs": {"class": ["edit-subtitle"]}, "children": [{"text": ["完善你的资料，方便报名和咨询联系。"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["form-notice"]}, "children": [{"text": ["正在读取资料…"]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["form-error"]}, "children": [{"text": [{"e": 19}]}]}, {"tag": "view", "attrs": {"class": ["form-section"]}, "children": [{"tag": "text", "attrs": {"class": ["section-caption"]}, "children": [{"text": ["基础信息"]}]}, {"tag": "view", "attrs": {"class": ["form-card"]}, "children": [{"tag": "view", "attrs": {"class": ["form-row"]}, "children": [{"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["用户名"]}]}, {"tag": "input", "attrs": {"class": ["field-input"], "type": ["nickname"], "placeholder": ["填写用户名"], "value": [{"e": 5}], "bindinput": ["onUserNameInput"], "maxlength": ["80"], "disabled": [{"e": 169}]}, "children": []}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 171}], "class": ["form-error"]}, "children": [{"text": [{"e": 171}]}]}, {"tag": "view", "attrs": {"class": ["form-row"]}, "children": [{"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["所在地区（选填）"]}]}, {"tag": "input", "attrs": {"class": ["field-input"], "placeholder": ["填写省、市、区"], "value": [{"e": 172}], "maxlength": ["100"], "bindinput": ["onRegionInput"], "disabled": [{"e": 169}]}, "children": []}]}, {"tag": "view", "attrs": {"class": ["form-row"]}, "children": [{"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["详细地址（选填）"]}]}, {"tag": "input", "attrs": {"class": ["field-input"], "placeholder": ["街道、门牌号"], "value": [{"e": 173}], "maxlength": ["300"], "bindinput": ["onAddressInput"], "disabled": [{"e": 169}]}, "children": []}]}, {"tag": "button", "attrs": {"class": ["location-button"], "bindtap": ["chooseRegion"], "disabled": [{"e": 169}]}, "children": [{"text": ["使用定位辅助填写"]}]}, {"tag": "picker", "attrs": {"disabled": [{"e": 169}], "mode": ["selector"], "range": [{"e": 174}], "value": [{"e": 175}], "bindchange": ["onGenderChange"]}, "children": [{"tag": "view", "attrs": {"class": ["form-row"]}, "children": [{"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["性别"]}]}, {"tag": "text", "attrs": {"class": ["field-static strong"]}, "children": [{"text": [{"e": 176}]}]}]}]}, {"tag": "view", "attrs": {"class": ["form-row"]}, "children": [{"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["已绑定手机号"]}]}, {"tag": "view", "attrs": {"class": ["field-link"]}, "children": [{"tag": "text", "attrs": {"class": ["field-static strong"]}, "children": [{"text": [{"e": 177}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 178}], "class": ["phone-verified-badge"]}, "children": [{"text": ["已验证"]}]}]}]}, {"tag": "picker", "attrs": {"disabled": [{"e": 169}], "end": [{"e": 179}], "mode": ["date"], "value": [{"e": 180}], "bindchange": ["onBirthdayChange"]}, "children": [{"tag": "view", "attrs": {"class": ["form-row"]}, "children": [{"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["生日"]}]}, {"tag": "text", "attrs": {"class": ["field-static strong"]}, "children": [{"text": [{"e": 181}]}]}]}]}, {"tag": "view", "attrs": {"class": ["form-row"]}, "children": [{"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["ID"]}]}, {"tag": "text", "attrs": {"class": ["field-static"]}, "children": [{"text": [{"e": 182}]}]}]}]}]}, {"tag": "button", "attrs": {"class": ["save-button"], "loading": [{"e": 169}], "disabled": [{"e": 183}], "bindtap": ["saveProfile"]}, "children": [{"text": ["保存资料"]}]}]}], "config": {"navigationBarTitleText": "编辑个人资料", "navigationBarBackgroundColor": "#FBF9F8", "navigationBarTextStyle": "black"}}, "pages/privacy/privacy": {"tree": [{"tag": "view", "attrs": {"class": ["privacy-page"]}, "children": [{"tag": "view", "attrs": {"class": ["privacy-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["privacy-kicker"]}, "children": [{"text": ["知守 隐私与安全"]}]}, {"tag": "text", "attrs": {"class": ["privacy-title"]}, "children": [{"text": ["让敏感关系问题，只为服务本身被使用"]}]}, {"tag": "text", "attrs": {"class": ["privacy-lede"]}, "children": [{"text": ["本协议依据个人信息、数据安全、网络安全及微信小程序隐私保护要求制定，并结合本项目的登录、预约、支付、咨询和经理接单流程适配。"]}]}, {"tag": "view", "attrs": {"class": ["privacy-meta"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["更新日期：", {"e": 184}]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["适用范围：知守咨询小程序"]}]}]}]}, {"tag": "view", "attrs": {"class": ["basis-band"]}, "children": [{"tag": "text", "attrs": {"class": ["band-title"]}, "children": [{"text": ["参考依据"]}]}, {"tag": "view", "attrs": {"class": ["basis-list"]}, "children": [{"tag": "text", "attrs": {"wx:for": [{"e": 185}], "wx:key": ["*this"], "class": ["basis-chip"]}, "children": [{"text": [{"e": 186}]}]}]}]}, {"tag": "view", "attrs": {"class": ["promise-grid"]}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 187}], "wx:key": ["label"], "class": ["promise-item"]}, "children": [{"tag": "text", "attrs": {"class": ["promise-label"]}, "children": [{"text": [{"e": 117}]}]}, {"tag": "text", "attrs": {"class": ["promise-value"]}, "children": [{"text": [{"e": 116}]}]}]}]}, {"tag": "view", "attrs": {"class": ["privacy-section"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["信息清单"]}]}, {"tag": "text", "attrs": {"class": ["section-desc"]}, "children": [{"text": ["以下内容来自当前项目规划和已实现的数据流，用于说明我们在什么场景处理哪些信息。"]}]}, {"tag": "view", "attrs": {"class": ["data-group"], "wx:for": [{"e": 188}], "wx:key": ["title"]}, "children": [{"tag": "view", "attrs": {"class": ["data-head"]}, "children": [{"tag": "text", "attrs": {"class": ["data-title"]}, "children": [{"text": [{"e": 14}]}]}, {"tag": "text", "attrs": {"class": ["data-tag"]}, "children": [{"text": [{"e": 189}]}]}]}, {"tag": "view", "attrs": {"class": ["data-list"]}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 190}], "wx:for-item": ["dataItem"], "wx:key": ["*this"], "class": ["data-line"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 191}]}]}]}]}, {"tag": "text", "attrs": {"class": ["data-purpose"]}, "children": [{"text": [{"e": 192}]}]}]}]}, {"tag": "view", "attrs": {"class": ["privacy-section"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["完整协议"]}]}, {"tag": "view", "attrs": {"class": ["policy-block"], "wx:for": [{"e": 193}], "wx:key": ["title"]}, "children": [{"tag": "text", "attrs": {"class": ["policy-title"]}, "children": [{"text": [{"e": 14}]}]}, {"tag": "text", "attrs": {"wx:for": [{"e": 194}], "wx:for-item": ["paragraph"], "wx:key": ["*this"], "class": ["policy-copy"]}, "children": [{"text": [{"e": 195}]}]}]}]}, {"tag": "view", "attrs": {"class": ["privacy-section"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["你的隐私权利"]}]}, {"tag": "view", "attrs": {"class": ["rights-grid"]}, "children": [{"tag": "text", "attrs": {"wx:for": [{"e": 196}], "wx:key": ["*this"], "class": ["right-pill"]}, "children": [{"text": [{"e": 186}]}]}]}]}]}], "config": {"navigationBarTitleText": "隐私与安全", "navigationBarBackgroundColor": "#FBF9F8", "navigationBarTextStyle": "black"}}, "pages/advisor/advisor": {"tree": [{"tag": "view", "attrs": {"wx:if": [{"e": 197}], "class": ["advisor-state"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 198}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 199}], "class": ["retry-button"], "bindtap": ["refresh"]}, "children": [{"text": ["重新加载"]}]}, {"tag": "button", "attrs": {"class": ["retry-button"], "bindtap": ["goBack"]}, "children": [{"text": ["返回"]}]}]}, {"tag": "view", "attrs": {"class": ["advisor-page safe-bottom"], "wx:if": [{"e": 200}]}, "children": [{"tag": "view", "attrs": {"class": ["advisor-hero"]}, "children": [{"tag": "view", "attrs": {"class": ["hero-avatar"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 201}], "src": [{"e": 201}], "mode": ["aspectFill"]}, "children": []}, {"tag": "text", "attrs": {"wx:else": []}, "children": [{"text": [{"e": 202}]}]}]}, {"tag": "view", "attrs": {"class": ["hero-copy"]}, "children": [{"tag": "text", "attrs": {"class": ["advisor-name"]}, "children": [{"text": [{"e": 203}]}]}, {"tag": "text", "attrs": {"class": ["advisor-title"]}, "children": [{"text": [{"e": 204}]}]}, {"tag": "view", "attrs": {"class": ["score-line"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["★ ", {"e": 205}]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["·"]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["已帮助 ", {"e": 206}, " 人"]}]}]}]}]}, {"tag": "text", "attrs": {"class": ["advisor-quote"]}, "children": [{"text": ["“", {"e": 207}, "”"]}]}, {"tag": "scroll-view", "attrs": {"class": ["tag-scroll"], "scroll-x": [], "enable-flex": [], "show-scrollbar": [{"e": 90}]}, "children": [{"tag": "view", "attrs": {"class": ["tag-row"]}, "children": [{"tag": "text", "attrs": {"wx:for": [{"e": 208}], "wx:key": ["*this"], "class": ["tag"]}, "children": [{"text": [{"e": 186}]}]}]}]}, {"tag": "view", "attrs": {"class": ["service-card"]}, "children": [{"tag": "view", "attrs": {"class": ["service-head"]}, "children": [{"tag": "text", "attrs": {"class": ["service-title"]}, "children": [{"text": ["服务说明"]}]}, {"tag": "text", "attrs": {"class": ["service-price"]}, "children": [{"text": ["到课后可申请"]}]}]}, {"tag": "view", "attrs": {"class": ["service-grid"]}, "children": [{"tag": "view", "attrs": {}, "children": [{"tag": "text", "attrs": {"class": ["service-label"]}, "children": [{"text": ["咨询形式"]}]}, {"tag": "text", "attrs": {"class": ["service-value"]}, "children": [{"text": ["线下沟通"]}]}]}, {"tag": "view", "attrs": {}, "children": [{"tag": "text", "attrs": {"class": ["service-label"]}, "children": [{"text": ["预约方式"]}]}, {"tag": "text", "attrs": {"class": ["service-value"]}, "children": [{"text": ["老师确认安排"]}]}]}]}]}, {"tag": "view", "attrs": {"class": ["flow-card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["服务流程"]}]}, {"tag": "view", "attrs": {"class": ["flow-list"]}, "children": [{"tag": "view", "attrs": {"class": ["flow-item"]}, "children": [{"tag": "text", "attrs": {"class": ["flow-num"]}, "children": [{"text": ["01"]}]}, {"tag": "view", "attrs": {}, "children": [{"tag": "text", "attrs": {"class": ["flow-title"]}, "children": [{"text": ["参加公开课"]}]}, {"tag": "text", "attrs": {"class": ["flow-desc"]}, "children": [{"text": ["报名留下姓名和手机号，参加课程后由工作人员核实。"]}]}]}]}, {"tag": "view", "attrs": {"class": ["flow-item"]}, "children": [{"tag": "text", "attrs": {"class": ["flow-num"]}, "children": [{"text": ["02"]}]}, {"tag": "view", "attrs": {}, "children": [{"tag": "text", "attrs": {"class": ["flow-title"]}, "children": [{"text": ["申请与确认预约"]}]}, {"tag": "text", "attrs": {"class": ["flow-desc"]}, "children": [{"text": ["提交申请后，工作人员确认具体咨询时间。"]}]}]}]}, {"tag": "view", "attrs": {"class": ["flow-item"]}, "children": [{"tag": "text", "attrs": {"class": ["flow-num"]}, "children": [{"text": ["03"]}]}, {"tag": "view", "attrs": {}, "children": [{"tag": "text", "attrs": {"class": ["flow-title"]}, "children": [{"text": ["到店沟通与跟进"]}]}, {"tag": "text", "attrs": {"class": ["flow-desc"]}, "children": [{"text": ["预约确认后填写孩子基础信息；沟通后查看建议、反馈执行情况。"]}]}]}]}]}]}, {"tag": "view", "attrs": {"class": ["notice-card"]}, "children": [{"tag": "view", "attrs": {"class": ["notice-row"]}, "children": [{"tag": "text", "attrs": {"class": ["notice-icon"]}, "children": [{"text": ["隐"]}]}, {"tag": "view", "attrs": {}, "children": [{"tag": "text", "attrs": {"class": ["notice-title"]}, "children": [{"text": ["隐私保护"]}]}, {"tag": "text", "attrs": {"class": ["notice-desc"]}, "children": [{"text": ["咨询内容会被严格保护，请避免提交敏感身份信息。"]}]}]}]}, {"tag": "view", "attrs": {"class": ["notice-row"]}, "children": [{"tag": "text", "attrs": {"class": ["notice-icon"]}, "children": [{"text": ["界"]}]}, {"tag": "view", "attrs": {}, "children": [{"tag": "text", "attrs": {"class": ["notice-title"]}, "children": [{"text": ["服务边界"]}]}, {"tag": "text", "attrs": {"class": ["notice-desc"]}, "children": [{"text": ["本服务为情感问答，不包含医疗诊断。"]}]}]}]}]}, {"tag": "view", "attrs": {"class": ["sticky-pay"]}, "children": [{"tag": "view", "attrs": {}, "children": [{"tag": "text", "attrs": {"class": ["pay-label"]}, "children": [{"text": ["线下咨询"]}]}, {"tag": "view", "attrs": {}, "children": [{"tag": "text", "attrs": {"class": ["pay-price"]}, "children": [{"text": ["参加公开课后申请"]}]}]}]}, {"tag": "button", "attrs": {"class": ["pay-button"], "bindtap": ["confirmAndPay"], "disabled": [{"e": 209}]}, "children": [{"text": [{"e": 210}]}]}]}]}], "config": {"navigationBarTitleText": "答主详情"}}, "pages/search/search": {"tree": [{"tag": "view", "attrs": {"class": ["search-page safe-bottom"]}, "children": [{"tag": "view", "attrs": {"class": ["search-bar"]}, "children": [{"tag": "view", "attrs": {"class": ["search-field"]}, "children": [{"tag": "view", "attrs": {"class": ["search-lens"]}, "children": []}, {"tag": "input", "attrs": {"class": ["search-input"], "placeholder": [{"e": 211}], "value": [{"e": 212}], "focus": [{"e": 213}], "confirm-type": ["search"], "maxlength": ["80"], "bindinput": ["onKeywordInput"]}, "children": []}, {"tag": "button", "attrs": {"wx:if": [{"e": 212}], "class": ["search-clear"], "aria-label": ["清空搜索"], "bindtap": ["clearKeyword"]}, "children": [{"text": ["×"]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 18}], "class": ["search-hint"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["正在加载搜索内容…"]}]}]}, {"tag": "view", "attrs": {"wx:elif": [{"e": 19}], "class": ["search-empty"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"class": ["retry-button"], "bindtap": ["refresh"]}, "children": [{"text": ["重新加载"]}]}]}, {"tag": "view", "attrs": {"wx:elif": [{"e": 214}], "class": ["search-hint"]}, "children": [{"tag": "text", "attrs": {"class": ["hint-desc"]}, "children": [{"text": [{"e": 215}]}]}]}, {"tag": "view", "attrs": {"wx:elif": [{"e": 216}], "class": ["search-empty"]}, "children": [{"tag": "text", "attrs": {"class": ["empty-title"]}, "children": [{"text": [{"e": 217}]}]}, {"tag": "text", "attrs": {"class": ["empty-desc"]}, "children": [{"text": ["换个关键词试试。"]}]}]}, {"tag": "view", "attrs": {"wx:else": [], "class": ["result-list"]}, "children": [{"tag": "navigator", "attrs": {"wx:for": [{"e": 218}], "wx:key": ["id"], "class": ["result-card"], "url": [{"e": 219}]}, "children": [{"tag": "view", "attrs": {"class": ["result-avatar"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 220}], "src": [{"e": 220}], "mode": ["aspectFill"]}, "children": []}, {"tag": "view", "attrs": {"wx:else": [], "class": ["course-cover-placeholder"]}, "children": [{"tag": "text", "attrs": {"class": ["cover-message"]}, "children": [{"text": [{"e": 221}]}]}]}]}, {"tag": "view", "attrs": {"class": ["result-body"]}, "children": [{"tag": "text", "attrs": {"class": ["result-name"]}, "children": [{"text": [{"e": 222}]}]}, {"tag": "text", "attrs": {"class": ["result-role"]}, "children": [{"text": [{"e": 223}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 224}], "class": ["result-tags"]}, "children": [{"tag": "text", "attrs": {"wx:for": [{"e": 225}], "wx:for-item": ["tag"], "wx:key": ["*this"], "class": ["result-tag"]}, "children": [{"text": [{"e": 226}]}]}]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["›"]}]}]}]}]}], "config": {"navigationBarTitleText": "搜索"}}, "pages/customer/customer": {"tree": [{"tag": "view", "attrs": {"class": ["service-page"]}, "children": [{"tag": "view", "attrs": {"class": ["service-hero member-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["客户中心"]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": ["每一步，都有人陪你"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["从课堂相见，到沟通后的每一次改变。"]}]}, {"tag": "view", "attrs": {"class": ["journey"]}, "children": [{"tag": "view", "attrs": {"class": ["journey-step"]}, "children": [{"tag": "text", "attrs": {"class": ["journey-number"]}, "children": [{"text": ["01"]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["公开课报名"]}]}]}, {"tag": "view", "attrs": {"class": ["journey-step"]}, "children": [{"tag": "text", "attrs": {"class": ["journey-number"]}, "children": [{"text": ["02"]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["线下咨询"]}]}]}, {"tag": "view", "attrs": {"class": ["journey-step"]}, "children": [{"tag": "text", "attrs": {"class": ["journey-number"]}, "children": [{"text": ["03"]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["执行与反馈"]}]}]}]}]}, {"tag": "view", "attrs": {"class": ["entry-grid"]}, "children": [{"tag": "button", "attrs": {"class": ["primary"], "bindtap": ["goClasses"]}, "children": [{"text": ["公开课"]}]}, {"tag": "button", "attrs": {"class": ["secondary"], "bindtap": ["apply"]}, "children": [{"text": [{"e": 227}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"]}, "children": [{"text": ["重试"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 228}], "class": ["card form-card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["申请线下咨询"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["提交后等待工作人员确认，请填写方便沟通的时间。"]}]}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["家长姓名"]}]}, {"tag": "input", "attrs": {"placeholder": ["家长姓名"], "value": [{"e": 229}], "data-key": ["name"], "bindinput": ["input"], "maxlength": ["60"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["联系电话"]}]}, {"tag": "input", "attrs": {"placeholder": ["手机号"], "type": ["number"], "maxlength": ["11"], "value": [{"e": 230}], "data-key": ["phone"], "bindinput": ["input"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["方便沟通的时间"]}]}, {"tag": "input", "attrs": {"placeholder": ["期望时间，如周六下午"], "value": [{"e": 231}], "data-key": ["requestedTime"], "bindinput": ["input"], "maxlength": ["160"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["本次咨询的主要困扰"]}]}, {"tag": "textarea", "attrs": {"placeholder": ["希望本次沟通解决什么问题"], "value": [{"e": 232}], "data-key": ["concerns"], "bindinput": ["input"], "maxlength": ["4000"]}, "children": []}, {"tag": "button", "attrs": {"class": ["primary"], "loading": [{"e": 233}], "disabled": [{"e": 233}], "bindtap": ["submit"]}, "children": [{"text": ["提交申请，等待确认"]}]}, {"tag": "button", "attrs": {"class": ["text-button"], "disabled": [{"e": 233}], "bindtap": ["closeForm"]}, "children": [{"text": ["暂不申请"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 104}], "class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["登录后查看你的服务记录"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["报名、预约和反馈会保存在你的微信账号下。"]}]}, {"tag": "button", "attrs": {"class": ["primary"], "bindtap": ["login"]}, "children": [{"text": ["微信登录"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在加载你的记录…"]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 234}]}, "children": [{"tag": "view", "attrs": {"class": ["notice"]}, "children": [{"text": [{"e": 235}]}]}, {"tag": "view", "attrs": {"class": ["row"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["我的公开课报名"]}]}, {"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["goMine"]}, "children": [{"text": ["全部报名 ›"]}]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 236}], "wx:key": ["id"], "class": ["card"], "data-id": [{"e": 13}], "bindtap": ["openClass"]}, "children": [{"tag": "view", "attrs": {"class": ["row"]}, "children": [{"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 237}]}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 238}, " · ", {"e": 239}, " · ", {"e": 240}]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 241}]}]}, {"tag": "text", "attrs": {"class": ["link"]}, "children": [{"text": ["查看入场凭证与进群指引 ›"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 242}], "class": ["empty"]}, "children": [{"text": ["还没有报名，先从一堂公开课开始。"]}]}, {"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["我的线下咨询"]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 243}], "wx:key": ["id"], "class": ["card"], "data-id": [{"e": 13}], "bindtap": ["openAppointment"]}, "children": [{"tag": "view", "attrs": {"class": ["row"]}, "children": [{"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 244}]}]}, {"tag": "text", "attrs": {"class": ["pill"]}, "children": [{"text": [{"e": 238}]}]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 245}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 246}]}]}, {"tag": "text", "attrs": {"class": ["link"]}, "children": [{"text": [{"e": 247}, " ›"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 248}], "class": ["empty"]}, "children": [{"text": ["预约确认后，在这里填写基础信息、查看老师建议并反馈执行情况。"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 249}], "class": ["muted"]}, "children": [{"text": [{"e": 250}, " ", {"e": 249}, " 条咨询记录"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 251}], "class": ["secondary"], "loading": [{"e": 252}], "disabled": [{"e": 253}], "bindtap": ["moreAppointments"]}, "children": [{"text": ["查看更多咨询记录"]}]}, {"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["goHome"]}, "children": [{"text": ["返回客户首页"]}]}]}], "config": {"navigationBarTitleText": "客户端", "enablePullDownRefresh": false}}, "pages/public-class/public-class": {"tree": [{"tag": "view", "attrs": {"class": ["service-page course-page"]}, "children": [{"tag": "view", "attrs": {"class": ["course-topline"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["一起学习 · 课程报名"]}]}, {"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["goMine"]}, "children": [{"text": ["我的报名 ›"]}]}]}, {"tag": "view", "attrs": {"class": ["course-intro"]}, "children": [{"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": ["让理解发生，\n从一堂课开始。"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["走进课堂，一起练习倾听与沟通。"]}]}, {"tag": "view", "attrs": {"class": ["journey"]}, "children": [{"tag": "view", "attrs": {"class": ["journey-step"]}, "children": [{"tag": "text", "attrs": {"class": ["journey-number"]}, "children": [{"text": ["01"]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["确认费用"]}]}, {"tag": "text", "attrs": {"class": ["journey-note"]}, "children": [{"text": ["费用以当场课程为准"]}]}]}, {"tag": "view", "attrs": {"class": ["journey-step"]}, "children": [{"tag": "text", "attrs": {"class": ["journey-number"]}, "children": [{"text": ["02"]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["报名进群"]}]}, {"tag": "text", "attrs": {"class": ["journey-note"]}, "children": [{"text": ["群内查看开课地址"]}]}]}, {"tag": "view", "attrs": {"class": ["journey-step"]}, "children": [{"tag": "text", "attrs": {"class": ["journey-number"]}, "children": [{"text": ["03"]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["到场学习"]}]}, {"tag": "text", "attrs": {"class": ["journey-note"]}, "children": [{"text": ["按课程安排参加"]}]}]}]}]}, {"tag": "view", "attrs": {"class": ["course-search"]}, "children": [{"tag": "input", "attrs": {"placeholder": ["搜索课程名称或城市"], "value": [{"e": 254}], "bindinput": ["searchInput"], "bindconfirm": ["refresh"], "confirm-type": ["search"], "maxlength": ["60"]}, "children": []}, {"tag": "button", "attrs": {"class": ["secondary"], "bindtap": ["refresh"], "disabled": [{"e": 18}]}, "children": [{"text": ["搜索"]}]}]}, {"tag": "view", "attrs": {"class": ["course-section-head"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["课程报名"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["费用以各场次显示为准"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"]}, "children": [{"text": ["重新加载"]}]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 255}], "wx:key": ["id"], "class": ["card course-card"], "data-id": [{"e": 13}], "bindtap": ["choose"]}, "children": [{"tag": "view", "attrs": {"class": ["course-card-content"]}, "children": [{"tag": "view", "attrs": {"class": ["row"]}, "children": [{"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 14}]}]}, {"tag": "text", "attrs": {"class": ["pill"]}, "children": [{"text": [{"e": 256}]}]}]}, {"tag": "text", "attrs": {"class": ["course-meta"]}, "children": [{"text": [{"e": 257}]}]}, {"tag": "text", "attrs": {"class": ["course-meta"]}, "children": [{"text": [{"e": 258}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 259}], "class": ["body"]}, "children": [{"text": [{"e": 259}]}]}, {"tag": "view", "attrs": {"class": ["course-card-bottom"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 260}]}]}, {"tag": "text", "attrs": {"class": ["link"]}, "children": [{"text": ["查看详情 ›"]}]}]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在加载课程…"]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 261}], "class": ["empty"]}, "children": [{"text": [{"e": 262}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 263}], "class": ["secondary"], "bindtap": ["loadMore"], "disabled": [{"e": 18}]}, "children": [{"text": ["查看更多课程"]}]}, {"tag": "view", "attrs": {"class": ["notice"]}, "children": [{"text": ["报名费由后台按场次设置；付费课程只有缴费成功后才会生成报名凭证。"]}]}, {"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["goCustomer"]}, "children": [{"text": ["我的报名与咨询"]}]}]}], "config": {"navigationBarTitleText": "公开课", "enablePullDownRefresh": false}}, "pages/consultation-detail/consultation-detail": {"tree": [{"tag": "view", "attrs": {"class": ["service-page"]}, "children": [{"tag": "view", "attrs": {"class": ["error"], "wx:if": [{"e": 19}]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"]}, "children": [{"text": ["重新加载"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在加载咨询资料…"]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 264}]}, "children": [{"tag": "view", "attrs": {"class": ["service-hero member-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["线下咨询 · ", {"e": 265}]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": [{"e": 266}, "的沟通记录"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["负责老师：", {"e": 267}]}]}]}, {"tag": "view", "attrs": {"class": ["card record-section"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["预约安排"]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 268}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 269}]}]}, {"tag": "text", "attrs": {"class": ["body"], "wx:if": [{"e": 270}]}, "children": [{"text": [{"e": 270}]}]}, {"tag": "text", "attrs": {"class": ["notice"], "wx:if": [{"e": 271}]}, "children": [{"text": ["申请已提交，工作人员确认时间后才算预约成功。"]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 272}]}, "children": [{"tag": "picker", "attrs": {"mode": ["date"], "bindchange": ["dateChange"]}, "children": [{"tag": "view", "attrs": {"class": ["picker-field"]}, "children": [{"text": [{"e": 273}]}]}]}, {"tag": "picker", "attrs": {"mode": ["time"], "bindchange": ["timeChange"]}, "children": [{"tag": "view", "attrs": {"class": ["picker-field"]}, "children": [{"text": [{"e": 274}]}]}]}, {"tag": "textarea", "attrs": {"placeholder": ["预约说明、到店指引"], "value": [{"e": 275}], "bindinput": ["noteChange"], "maxlength": ["2000"]}, "children": []}, {"tag": "button", "attrs": {"class": ["primary"], "disabled": [{"e": 233}], "bindtap": ["confirmAppointment"]}, "children": [{"text": ["确认预约时间"]}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 276}], "class": ["text-button"], "disabled": [{"e": 233}], "bindtap": ["cancelAppointment"]}, "children": [{"text": ["取消本次预约"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 277}], "class": ["card record-section"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["孩子基础信息"]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 278}]}, "children": [{"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["请在到店前填写。本次信息与本次预约关联保存。"]}]}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["孩子姓名或称呼"]}]}, {"tag": "input", "attrs": {"placeholder": ["孩子姓名或称呼"], "value": [{"e": 279}], "data-key": ["name"], "bindinput": ["inputChild"], "maxlength": ["60"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["年龄（0–30岁）"]}]}, {"tag": "input", "attrs": {"placeholder": ["年龄"], "type": ["number"], "value": [{"e": 280}], "data-key": ["age"], "bindinput": ["inputChild"], "maxlength": ["2"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["年级（选填）"]}]}, {"tag": "input", "attrs": {"placeholder": ["年级（选填）"], "value": [{"e": 281}], "data-key": ["grade"], "bindinput": ["inputChild"], "maxlength": ["60"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["家长姓名"]}]}, {"tag": "input", "attrs": {"placeholder": ["家长姓名"], "value": [{"e": 282}], "data-key": ["guardian"], "bindinput": ["inputChild"], "maxlength": ["60"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["与孩子关系"]}]}, {"tag": "input", "attrs": {"placeholder": ["与孩子关系"], "value": [{"e": 283}], "data-key": ["relationship"], "bindinput": ["inputChild"], "maxlength": ["60"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["联系电话"]}]}, {"tag": "input", "attrs": {"placeholder": ["联系电话"], "type": ["number"], "value": [{"e": 284}], "data-key": ["phone"], "bindinput": ["inputChild"], "maxlength": ["11"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["当前主要困扰"]}]}, {"tag": "textarea", "attrs": {"placeholder": ["当前主要困扰"], "value": [{"e": 285}], "data-key": ["concerns"], "bindinput": ["inputChild"], "maxlength": ["4000"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["希望本次沟通解决的问题（选填）"]}]}, {"tag": "textarea", "attrs": {"placeholder": ["希望本次沟通解决的问题（选填）"], "value": [{"e": 286}], "data-key": ["goals"], "bindinput": ["inputChild"], "maxlength": ["2000"]}, "children": []}, {"tag": "button", "attrs": {"class": ["primary"], "loading": [{"e": 233}], "disabled": [{"e": 233}], "bindtap": ["saveChild"]}, "children": [{"text": ["保存基础信息"]}]}]}, {"tag": "block", "attrs": {"wx:elif": [{"e": 287}]}, "children": [{"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 288}, " · ", {"e": 289}, "岁 · ", {"e": 290}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 291}, "（", {"e": 292}, "） · ", {"e": 293}]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 294}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["沟通期待：", {"e": 295}]}]}]}, {"tag": "text", "attrs": {"wx:else": [], "class": ["muted"]}, "children": [{"text": ["等待家长填写基础信息。"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 296}], "class": ["card record-section"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["沟通总结"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["本页本次咨询的留言、反馈与老师回复可生成文字草稿，也支持经同意录制面谈。由老师检查确认后形成正式记录。"]}]}, {"tag": "button", "attrs": {"class": ["secondary"], "disabled": [{"e": 297}], "loading": [{"e": 298}], "bindtap": ["summarizeText"]}, "children": [{"text": ["总结本次文字沟通"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 299}], "class": ["secondary"], "disabled": [{"e": 298}], "bindtap": ["startRecording"]}, "children": [{"text": ["经同意录制面谈"]}]}, {"tag": "button", "attrs": {"wx:else": [], "class": ["primary"], "bindtap": ["stopRecording"]}, "children": [{"text": ["录音中 ", {"e": 300}, " 秒 · 停止并总结"]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 301}], "class": ["muted"]}, "children": [{"text": ["单段最长10分钟，可分段录制。离开页面会停止录音。"]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 302}], "wx:key": ["id"], "class": ["task"]}, "children": [{"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 303}, " · ", {"e": 238}, " · ", {"e": 304}]}]}, {"tag": "text", "attrs": {"class": ["body"], "wx:if": [{"e": 305}]}, "children": [{"text": [{"e": 305}]}]}, {"tag": "text", "attrs": {"class": ["error"], "wx:if": [{"e": 306}]}, "children": [{"text": [{"e": 306}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 307}], "class": ["text-button"], "data-id": [{"e": 13}], "bindtap": ["retrySummary"], "disabled": [{"e": 233}]}, "children": [{"text": ["重新生成"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 308}], "class": ["text-button"], "data-id": [{"e": 13}], "bindtap": ["processRecording"], "disabled": [{"e": 233}]}, "children": [{"text": ["处理已上传录音"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 309}], "class": ["text-button"], "data-id": [{"e": 13}], "bindtap": ["useSummary"]}, "children": [{"text": ["填入老师记录，继续编辑"]}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 310}], "class": ["text-button"], "bindtap": ["refreshSummary"]}, "children": [{"text": ["刷新总结进度"]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 310}], "class": ["muted"]}, "children": [{"text": [{"e": 311}, " ", {"e": 310}, " 条总结"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 312}], "class": ["secondary"], "data-kind": ["summary"], "bindtap": ["moreHistory"], "disabled": [{"e": 253}]}, "children": [{"text": ["查看更多总结"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 313}], "class": ["card record-section"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["本次沟通与执行建议"]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 314}]}, "children": [{"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["今天沟通的主要内容"]}]}, {"tag": "textarea", "attrs": {"placeholder": ["今天沟通的主要内容"], "value": [{"e": 315}], "data-key": ["summary"], "bindinput": ["inputRecord"], "maxlength": ["16000"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["给家长的具体执行建议，每行一条"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["最多30条，每条最多2000字。"]}]}, {"tag": "textarea", "attrs": {"placeholder": ["给家长的具体执行建议，每行一条"], "value": [{"e": 316}], "data-key": ["advice"], "bindinput": ["inputRecord"], "maxlength": ["16000"]}, "children": []}, {"tag": "button", "attrs": {"class": ["secondary"], "data-confirm": ["false"], "disabled": [{"e": 233}], "bindtap": ["saveRecord"]}, "children": [{"text": ["保存草稿"]}]}, {"tag": "button", "attrs": {"class": ["primary"], "data-confirm": ["true"], "disabled": [{"e": 233}], "bindtap": ["saveRecord"]}, "children": [{"text": ["确认记录并给家长查看"]}]}]}, {"tag": "block", "attrs": {"wx:elif": [{"e": 317}]}, "children": [{"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 318}]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 319}], "wx:key": ["key"], "class": ["task"]}, "children": [{"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 17}, ". ", {"e": 69}]}]}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 320}], "class": ["primary"], "disabled": [{"e": 233}], "bindtap": ["complete"]}, "children": [{"text": ["确认本次咨询已完成"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 321}], "class": ["card record-section"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["反馈执行情况"]}]}, {"tag": "picker", "attrs": {"range": [{"e": 319}], "range-key": ["content"], "value": [{"e": 322}], "bindchange": ["chooseAdvice"]}, "children": [{"tag": "view", "attrs": {"class": ["picker-field"]}, "children": [{"text": [{"e": 323}]}]}]}, {"tag": "textarea", "attrs": {"placeholder": ["我是怎么做的？孩子有什么反应？遇到了什么困难？"], "value": [{"e": 324}], "bindinput": ["inputFeedback"], "maxlength": ["6000"]}, "children": []}, {"tag": "button", "attrs": {"class": ["primary"], "disabled": [{"e": 233}], "bindtap": ["sendFeedback"]}, "children": [{"text": ["提交本次反馈"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 325}], "class": ["card record-section"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["本次咨询留言"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["补充想和老师沟通的情况，老师可在下方回复。"]}]}, {"tag": "textarea", "attrs": {"placeholder": ["想补充的情况或问题"], "value": [{"e": 326}], "bindinput": ["inputNote"], "maxlength": ["6000"]}, "children": []}, {"tag": "button", "attrs": {"class": ["secondary"], "disabled": [{"e": 233}], "bindtap": ["sendNote"]}, "children": [{"text": ["发送留言"]}]}]}, {"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["沟通、执行反馈与老师回复"]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 327}], "wx:key": ["id"], "class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 304}, " · ", {"e": 328}]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 69}]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 329}], "wx:for-item": ["reply"], "wx:key": ["id"], "class": ["reply"]}, "children": [{"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 330}, "回复"]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 331}]}]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 332}]}, "children": [{"tag": "textarea", "attrs": {"placeholder": ["回复这条执行反馈"], "data-id": [{"e": 13}], "value": [{"e": 333}], "bindinput": ["inputReply"], "maxlength": ["6000"]}, "children": []}, {"tag": "button", "attrs": {"class": ["secondary"], "disabled": [{"e": 233}], "data-id": [{"e": 13}], "bindtap": ["sendReply"]}, "children": [{"text": ["回复家长"]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 334}], "class": ["empty"]}, "children": [{"text": ["还没有沟通记录。预约确认后可留言，老师确认建议后可持续反馈。"]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 335}], "class": ["muted"]}, "children": [{"text": [{"e": 336}, " ", {"e": 335}, " 条沟通记录"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 337}], "class": ["secondary"], "data-kind": ["feedback"], "bindtap": ["moreHistory"], "disabled": [{"e": 253}]}, "children": [{"text": ["查看更多沟通记录"]}]}]}, {"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["backToCustomer"]}, "children": [{"text": ["返回"]}]}]}], "config": {"navigationBarTitleText": "我的线下咨询", "enablePullDownRefresh": false}}, "pages/service-workbench/service-workbench": {"tree": [{"tag": "view", "attrs": {"class": ["service-page"]}, "children": [{"tag": "view", "attrs": {"class": ["service-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["工作人员"]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": ["公开课与线下咨询"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["核实参加、确认预约，持续回应每一次反馈。"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"]}, "children": [{"text": ["重新连接"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在核实工作身份…"]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 338}]}, "children": [{"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["goCustomer"]}, "children": [{"text": ["进入客户端"]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 339}], "class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["公开课管理"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["发布课程、分享报名、查看名单和进群情况，扫码核实实际到课。"]}]}, {"tag": "button", "attrs": {"class": ["primary"], "bindtap": ["manageCourses"]}, "children": [{"text": ["进入课程工作台"]}]}]}, {"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["线下咨询与反馈"]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 243}], "wx:key": ["id"], "class": ["card"], "data-id": [{"e": 13}], "bindtap": ["openAppointment"]}, "children": [{"tag": "view", "attrs": {"class": ["row"]}, "children": [{"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 340}, " · ", {"e": 341}]}]}, {"tag": "text", "attrs": {"class": ["pill"]}, "children": [{"text": [{"e": 238}]}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 246}]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 245}]}]}, {"tag": "text", "attrs": {"class": ["link"]}, "children": [{"text": [{"e": 342}, " ›"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 343}], "class": ["empty"]}, "children": [{"text": ["暂无分配给你的线下咨询。"]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 249}], "class": ["muted"]}, "children": [{"text": [{"e": 250}, " ", {"e": 249}, " 条咨询记录"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 251}], "class": ["secondary"], "loading": [{"e": 252}], "disabled": [{"e": 253}], "bindtap": ["moreAppointments"]}, "children": [{"text": ["查看更多咨询记录"]}]}]}]}], "config": {"navigationBarTitleText": "公开课与咨询管理", "enablePullDownRefresh": false}}, "pages/public-class-detail/public-class-detail": {"tree": [{"tag": "view", "attrs": {"class": ["service-page course-page has-course-footer"]}, "children": [{"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"]}, "children": [{"text": ["重试"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在加载课程详情…"]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 344}]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 345}], "class": ["course-cover"], "src": [{"e": 345}], "mode": ["aspectFill"]}, "children": []}, {"tag": "view", "attrs": {"wx:else": [], "class": ["course-cover-fallback"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["知守 · 课程报名"]}]}, {"tag": "text", "attrs": {"class": ["cover-word"]}, "children": [{"text": ["让理解发生"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["在学习中找到新的沟通方式"]}]}]}, {"tag": "view", "attrs": {"class": ["service-hero detail-heading"]}, "children": [{"tag": "text", "attrs": {"class": ["pill"]}, "children": [{"text": [{"e": 346}]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": [{"e": 347}]}]}, {"tag": "view", "attrs": {"class": ["course-facts"]}, "children": [{"tag": "view", "attrs": {"class": ["course-fact"]}, "children": [{"tag": "text", "attrs": {"class": ["fact-label"]}, "children": [{"text": ["开课时间"]}]}, {"tag": "text", "attrs": {"class": ["fact-value"]}, "children": [{"text": [{"e": 348}]}]}]}, {"tag": "view", "attrs": {"class": ["course-fact"]}, "children": [{"tag": "text", "attrs": {"class": ["fact-label"]}, "children": [{"text": ["开课地点"]}]}, {"tag": "text", "attrs": {"class": ["fact-value"]}, "children": [{"text": [{"e": 349}]}]}]}, {"tag": "view", "attrs": {"class": ["course-fact"]}, "children": [{"tag": "text", "attrs": {"class": ["fact-label"]}, "children": [{"text": ["报名费用"]}]}, {"tag": "text", "attrs": {"class": ["fact-value"]}, "children": [{"text": [{"e": 350}]}]}]}, {"tag": "view", "attrs": {"class": ["course-fact"]}, "children": [{"tag": "text", "attrs": {"class": ["fact-label"]}, "children": [{"text": ["报名截止"]}]}, {"tag": "text", "attrs": {"class": ["fact-value"]}, "children": [{"text": [{"e": 351}]}]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 352}], "class": ["state-note"]}, "children": [{"text": [{"e": 353}, "。已报名的家长可在“我的报名”查看凭证。"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 119}], "class": ["secondary"], "bindtap": ["referralCode"]}, "children": [{"text": ["我的推荐报名码 · 查看推荐客户"]}]}, {"tag": "view", "attrs": {"class": ["card detail-reading"]}, "children": [{"tag": "text", "attrs": {"class": ["panel-caption"]}, "children": [{"text": ["01 / 课程内容"]}]}, {"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["这堂课，我们一起学习"]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 354}]}]}]}, {"tag": "view", "attrs": {"class": ["card detail-reading"]}, "children": [{"tag": "text", "attrs": {"class": ["panel-caption"]}, "children": [{"text": ["02 / 课堂安排"]}]}, {"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["参加须知"]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 355}]}]}, {"tag": "view", "attrs": {"class": ["progress-line"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["1 ", {"e": 356}]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["2 报名成功"]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["3 联系进群"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 357}], "class": ["muted"]}, "children": [{"text": ["需支付本场报名费后才会生成成功报名和入场凭证。"]}]}, {"tag": "text", "attrs": {"wx:else": [], "class": ["muted"]}, "children": [{"text": ["提交报名后会生成入场凭证。"]}]}]}, {"tag": "view", "attrs": {"class": ["course-footer"]}, "children": [{"tag": "button", "attrs": {"class": ["secondary"], "open-type": ["share"]}, "children": [{"text": ["分享报名码"]}]}, {"tag": "button", "attrs": {"class": ["primary"], "disabled": [{"e": 358}], "bindtap": ["enroll"]}, "children": [{"text": [{"e": 359}]}]}]}]}]}], "config": {"navigationBarTitleText": "课程详情", "enablePullDownRefresh": false}}, "pages/class-enroll/class-enroll": {"tree": [{"tag": "view", "attrs": {"class": ["service-page course-page"]}, "children": [{"tag": "view", "attrs": {"class": ["service-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["确认报名"]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": ["期待和你课堂见"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 360}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"], "disabled": [{"e": 233}]}, "children": [{"text": ["刷新课程状态"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在确认场次…"]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 344}]}, "children": [{"tag": "view", "attrs": {"class": ["card enrollment-summary"]}, "children": [{"tag": "text", "attrs": {"class": ["panel-caption"]}, "children": [{"text": ["本次报名课程"]}]}, {"tag": "view", "attrs": {"class": ["row"]}, "children": [{"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 347}]}]}, {"tag": "text", "attrs": {"class": ["pill"]}, "children": [{"text": [{"e": 350}]}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 348}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 349}]}]}]}, {"tag": "view", "attrs": {"class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["panel-caption"]}, "children": [{"text": ["01 / 报名资料"]}]}, {"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["报名人信息"]}]}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["姓名 "]}, {"tag": "text", "attrs": {"class": ["required"]}, "children": [{"text": ["必填"]}]}]}, {"tag": "input", "attrs": {"placeholder": ["请输入报名人姓名"], "value": [{"e": 229}], "data-key": ["name"], "bindinput": ["input"], "maxlength": ["60"], "disabled": [{"e": 233}]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["手机号 "]}, {"tag": "text", "attrs": {"class": ["required"]}, "children": [{"text": ["必填"]}]}]}, {"tag": "input", "attrs": {"placeholder": ["便于工作人员联系你进群"], "value": [{"e": 230}], "data-key": ["phone"], "bindinput": ["input"], "type": ["number"], "maxlength": ["11"], "disabled": [{"e": 233}]}, "children": []}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["每个账号每场课程保留一份本人报名。"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 361}], "class": ["notice"]}, "children": [{"text": ["推荐人：", {"e": 361}, " · ", {"e": 362}]}]}, {"tag": "view", "attrs": {"class": ["notice"]}, "children": [{"text": [{"e": 363}]}]}, {"tag": "button", "attrs": {"class": ["primary"], "loading": [{"e": 233}], "disabled": [{"e": 364}], "bindtap": ["submit"]}, "children": [{"text": [{"e": 365}]}]}]}]}], "config": {"navigationBarTitleText": "确认报名", "enablePullDownRefresh": false}}, "pages/my-enrollments/my-enrollments": {"tree": [{"tag": "view", "attrs": {"class": ["service-page course-page"]}, "children": [{"tag": "view", "attrs": {"class": ["course-topline"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["我的公开课"]}]}, {"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["classes"]}, "children": [{"text": ["发现课程 ›"]}]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": ["每一次相见，都值得期待"]}]}, {"tag": "scroll-view", "attrs": {"class": ["course-tabs"], "scroll-x": []}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 366}], "wx:key": ["key"], "class": ["course-tab ", {"e": 367}], "data-key": [{"e": 368}], "bindtap": ["selectFilter"]}, "children": [{"text": [{"e": 117}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 369}], "class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": ["登录后查看报名、进群指引和入场凭证。"]}]}, {"tag": "button", "attrs": {"class": ["primary"], "bindtap": ["login"]}, "children": [{"text": ["微信登录"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"]}, "children": [{"text": ["重试"]}]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 370}], "wx:key": ["id"], "class": ["card"], "data-id": [{"e": 13}], "bindtap": ["open"]}, "children": [{"tag": "view", "attrs": {"class": ["row"]}, "children": [{"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 237}]}]}, {"tag": "text", "attrs": {"class": ["pill"]}, "children": [{"text": [{"e": 371}]}]}]}, {"tag": "text", "attrs": {"class": ["course-meta"]}, "children": [{"text": [{"e": 372}]}]}, {"tag": "text", "attrs": {"class": ["course-meta"]}, "children": [{"text": [{"e": 373}, " · ", {"e": 374}]}]}, {"tag": "view", "attrs": {"class": ["course-card-bottom"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 240}]}]}, {"tag": "text", "attrs": {"class": ["link"]}, "children": [{"text": [{"e": 375}, " ›"]}]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在加载报名记录…"]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 376}], "class": ["empty"]}, "children": [{"text": ["暂无此类报名记录。"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 263}], "class": ["secondary"], "bindtap": ["loadMore"], "disabled": [{"e": 18}]}, "children": [{"text": ["查看更多"]}]}]}], "config": {"navigationBarTitleText": "我的报名", "enablePullDownRefresh": false}}, "pages/class-ticket/class-ticket": {"tree": [{"tag": "view", "attrs": {"class": ["service-page course-page"]}, "children": [{"tag": "view", "attrs": {"wx:if": [{"e": 377}], "class": ["service-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["success-mark"]}, "children": [{"text": ["✓"]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": ["报名成功，课堂见"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["下一步：查看进群指引，留意工作人员联系。"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"]}, "children": [{"text": ["重新加载凭证"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在读取你的报名…"]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 378}], "class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["登录后查看你的报名"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["个人入场凭证仅对报名本人可见。"]}]}, {"tag": "button", "attrs": {"class": ["primary"], "bindtap": ["refresh"]}, "children": [{"text": ["微信登录"]}]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 379}]}, "children": [{"tag": "view", "attrs": {"class": ["ticket"]}, "children": [{"tag": "view", "attrs": {"class": ["ticket-head"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["公开课 · 个人凭证"]}]}, {"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 380}]}]}, {"tag": "text", "attrs": {"class": ["course-meta"]}, "children": [{"text": [{"e": 381}]}]}, {"tag": "text", "attrs": {"class": ["course-meta"]}, "children": [{"text": [{"e": 382}]}]}]}, {"tag": "view", "attrs": {"class": ["ticket-body"]}, "children": [{"tag": "text", "attrs": {"class": ["ticket-status"]}, "children": [{"text": [{"e": 383}]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 384}, " · ", {"e": 385}]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 386}]}, "children": [{"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["到场后出示此码，由工作人员核实入场"]}]}, {"tag": "canvas", "attrs": {"wx:if": [{"e": 387}], "canvas-id": ["entry-code"], "class": ["ticket-canvas"]}, "children": []}, {"tag": "text", "attrs": {"class": ["ticket-code"]}, "children": [{"text": [{"e": 388}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 389}], "class": ["muted"]}, "children": [{"text": [{"e": 389}]}]}]}, {"tag": "text", "attrs": {"wx:elif": [{"e": 390}], "class": ["success"]}, "children": [{"text": ["已核实到课 · ", {"e": 391}]}]}, {"tag": "text", "attrs": {"wx:else": [], "class": ["muted"]}, "children": [{"text": ["本次报名已取消，入场码已失效。"]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 392}], "class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["进群与开课指引"]}]}, {"tag": "text", "attrs": {"class": ["pill"]}, "children": [{"text": [{"e": 393}]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 394}]}]}, {"tag": "image", "attrs": {"wx:if": [{"e": 395}], "class": ["qr-image"], "src": [{"e": 395}], "mode": ["aspectFit"], "bindtap": ["groupQr"]}, "children": []}, {"tag": "button", "attrs": {"wx:if": [{"e": 396}], "class": ["secondary"], "bindtap": ["callTeacher"]}, "children": [{"text": ["联系课程工作人员"]}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 390}], "class": ["primary"], "bindtap": ["consultation"]}, "children": [{"text": ["申请线下咨询"]}]}, {"tag": "view", "attrs": {"wx:elif": [{"e": 392}], "class": ["notice"]}, "children": [{"text": ["实际参加公开课并经工作人员核实后，可申请线下咨询。"]}]}, {"tag": "button", "attrs": {"class": ["secondary"], "bindtap": ["viewClass"]}, "children": [{"text": ["查看课程详情"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 397}], "class": ["text-button"], "disabled": [{"e": 233}], "bindtap": ["cancel"]}, "children": [{"text": ["取消本场报名"]}]}]}]}], "config": {"navigationBarTitleText": "报名与入场凭证", "enablePullDownRefresh": false}}, "pages/course-manage/course-manage": {"tree": [{"tag": "view", "attrs": {"class": ["service-page course-page"]}, "children": [{"tag": "view", "attrs": {"class": ["service-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["课程工作台"]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": ["把一堂课，准备好"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["发布场次、邀请报名、联系进群，再核实实际到课。"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"]}, "children": [{"text": ["重试"]}]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 338}]}, "children": [{"tag": "button", "attrs": {"class": ["primary"], "bindtap": ["create"]}, "children": [{"text": ["＋ 新建公开课"]}]}, {"tag": "input", "attrs": {"value": [{"e": 254}], "placeholder": ["搜索课程名称或城市"], "bindinput": ["inputSearch"], "bindconfirm": ["refresh"], "confirm-type": ["search"]}, "children": []}, {"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["refresh"]}, "children": [{"text": ["搜索"]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 255}], "wx:key": ["id"], "class": ["card course-card"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 15}], "class": ["course-cover"], "src": [{"e": 15}], "mode": ["aspectFill"]}, "children": []}, {"tag": "view", "attrs": {"class": ["course-card-content"]}, "children": [{"tag": "view", "attrs": {"class": ["row"]}, "children": [{"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 14}]}]}, {"tag": "text", "attrs": {"class": ["pill"]}, "children": [{"text": [{"e": 238}]}]}]}, {"tag": "text", "attrs": {"class": ["course-meta"]}, "children": [{"text": [{"e": 257}, " · ", {"e": 398}]}]}, {"tag": "text", "attrs": {"class": ["course-meta"]}, "children": [{"text": [{"e": 399}, " 人已报名 · ", {"e": 400}]}]}, {"tag": "view", "attrs": {"class": ["entry-grid"]}, "children": [{"tag": "button", "attrs": {"class": ["secondary"], "data-id": [{"e": 13}], "bindtap": ["edit"]}, "children": [{"text": ["编辑课程"]}]}, {"tag": "button", "attrs": {"class": ["primary"], "data-id": [{"e": 13}], "bindtap": ["roster"]}, "children": [{"text": ["名单与扫码入场"]}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 401}], "class": ["text-button"], "data-id": [{"e": 13}], "open-type": ["share"]}, "children": [{"text": ["微信分享课程"]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 402}], "class": ["empty"]}, "children": [{"text": ["还没有匹配的课程。新建场次后，保存草稿或发布到首页公开课入口。"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 263}], "class": ["secondary"], "bindtap": ["more"], "disabled": [{"e": 18}]}, "children": [{"text": ["加载更多"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在加载课程…"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 403}], "class": ["primary"], "bindtap": ["refresh"]}, "children": [{"text": ["登录并核实工作人员身份"]}]}]}], "config": {"navigationBarTitleText": "课程管理", "enablePullDownRefresh": false}}, "pages/course-edit/course-edit": {"tree": [{"tag": "view", "attrs": {"class": ["service-page course-page"]}, "children": [{"tag": "view", "attrs": {"class": ["service-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["课程维护"]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": ["准备一次相遇"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["填写课程名称和开课时间即可发布；进群方式可以稍后补充。发布后可微信分享，家长也能从首页报名。"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"], "disabled": [{"e": 233}]}, "children": [{"text": ["重新读取"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在读取课程…"]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 404}], "class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": [{"e": 404}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 405}], "class": ["primary"], "open-type": ["share"]}, "children": [{"text": ["微信分享课程"]}]}]}, {"tag": "form", "attrs": {"wx:if": [{"e": 338}], "bindsubmit": ["publish"]}, "children": [{"tag": "view", "attrs": {"class": ["card course-form-card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["课程信息"]}]}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["课程名称 "]}, {"tag": "text", "attrs": {"class": ["required"]}, "children": [{"text": ["必填"]}]}]}, {"tag": "input", "attrs": {"class": ["course-form-input"], "value": [{"e": 406}], "name": ["title"], "data-key": ["title"], "bindinput": ["input"], "maxlength": ["120"], "placeholder": ["例如：读懂孩子的情绪"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["课程封面"]}]}, {"tag": "text", "attrs": {"class": ["muted cover-size-hint"]}, "children": [{"text": ["建议使用 2.2:1 横图（如 1100 × 500 px），超出部分会居中裁切。"]}]}, {"tag": "image", "attrs": {"wx:if": [{"e": 407}], "class": ["course-cover course-edit-cover"], "src": [{"e": 407}], "mode": ["aspectFill"]}, "children": []}, {"tag": "button", "attrs": {"class": ["secondary"], "data-kind": ["cover"], "bindtap": ["upload"], "disabled": [{"e": 408}]}, "children": [{"text": [{"e": 409}]}]}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["课程介绍"]}]}, {"tag": "textarea", "attrs": {"class": ["course-form-textarea course-description-input"], "value": [{"e": 410}], "name": ["description"], "data-key": ["description"], "bindinput": ["input"], "maxlength": ["4000"], "placeholder": ["适合谁参加，本次会谈些什么"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["开课城市"]}]}, {"tag": "input", "attrs": {"class": ["course-form-input"], "value": [{"e": 411}], "name": ["city"], "data-key": ["city"], "bindinput": ["input"], "maxlength": ["60"], "placeholder": ["例如：成都（支持中文）"]}, "children": []}, {"tag": "text", "attrs": {"class": ["muted form-help"]}, "children": [{"text": ["详细地址在课程群内通知。"]}]}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["开课时间 "]}, {"tag": "text", "attrs": {"class": ["required"]}, "children": [{"text": ["发布必填"]}]}]}, {"tag": "view", "attrs": {"class": ["entry-grid"]}, "children": [{"tag": "picker", "attrs": {"mode": ["date"], "value": [{"e": 412}], "name": ["date"], "data-key": ["date"], "bindchange": ["input"]}, "children": [{"tag": "view", "attrs": {"class": ["picker-field"]}, "children": [{"text": [{"e": 413}]}]}]}, {"tag": "picker", "attrs": {"mode": ["time"], "value": [{"e": 414}], "name": ["time"], "data-key": ["time"], "bindchange": ["input"]}, "children": [{"tag": "view", "attrs": {"class": ["picker-field"]}, "children": [{"text": [{"e": 415}]}]}]}]}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["名额上限"]}]}, {"tag": "input", "attrs": {"class": ["course-form-input"], "type": ["number"], "value": [{"e": 416}], "name": ["capacity"], "data-key": ["capacity"], "bindinput": ["input"], "maxlength": ["5"], "placeholder": ["0 表示不限"]}, "children": []}, {"tag": "text", "attrs": {"class": ["muted form-help"]}, "children": [{"text": ["0 表示不限名额，不能小于已报名人数。"]}]}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["报名费用（元）"]}]}, {"tag": "input", "attrs": {"class": ["course-form-input"], "type": ["digit"], "value": [{"e": 417}], "name": ["registrationFee"], "data-key": ["registrationFee"], "bindinput": ["input"], "maxlength": ["9"], "placeholder": ["例如 100"]}, "children": []}, {"tag": "text", "attrs": {"class": ["muted form-help"]}, "children": [{"text": ["页面会实时读取这个金额；填 0 表示报名。"]}]}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["报名截止（选填）"]}]}, {"tag": "view", "attrs": {"class": ["entry-grid"]}, "children": [{"tag": "picker", "attrs": {"mode": ["date"], "value": [{"e": 418}], "name": ["closeDate"], "data-key": ["closeDate"], "bindchange": ["input"]}, "children": [{"tag": "view", "attrs": {"class": ["picker-field"]}, "children": [{"text": [{"e": 419}]}]}]}, {"tag": "picker", "attrs": {"mode": ["time"], "value": [{"e": 420}], "name": ["closeTime"], "data-key": ["closeTime"], "bindchange": ["input"]}, "children": [{"tag": "view", "attrs": {"class": ["picker-field"]}, "children": [{"text": [{"e": 421}]}]}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 422}], "class": ["text-button"], "data-kind": ["registration"], "bindtap": ["clearDeadline"]}, "children": [{"text": ["清除报名截止设置"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["未填时，在开课时间停止报名。"]}]}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["签到截止（选填）"]}]}, {"tag": "view", "attrs": {"class": ["entry-grid"]}, "children": [{"tag": "picker", "attrs": {"mode": ["date"], "value": [{"e": 423}], "name": ["checkinDate"], "data-key": ["checkinDate"], "bindchange": ["input"]}, "children": [{"tag": "view", "attrs": {"class": ["picker-field"]}, "children": [{"text": [{"e": 424}]}]}]}, {"tag": "picker", "attrs": {"mode": ["time"], "value": [{"e": 425}], "name": ["checkinTime"], "data-key": ["checkinTime"], "bindchange": ["input"]}, "children": [{"tag": "view", "attrs": {"class": ["picker-field"]}, "children": [{"text": [{"e": 426}]}]}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 427}], "class": ["text-button"], "data-kind": ["checkin"], "bindtap": ["clearDeadline"]}, "children": [{"text": ["清除签到截止设置"]}]}]}, {"tag": "view", "attrs": {"class": ["card course-form-card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["报名后的联系说明"]}]}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["进群方式（选填）"]}]}, {"tag": "textarea", "attrs": {"class": ["course-form-textarea"], "value": [{"e": 428}], "name": ["groupGuide"], "data-key": ["groupGuide"], "bindinput": ["input"], "maxlength": ["2000"], "placeholder": ["可填写工作人员联系方式或进群说明"]}, "children": []}, {"tag": "text", "attrs": {"class": ["muted form-help"]}, "children": [{"text": ["未填写时，可在报名后由工作人员另行联系。"]}]}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["课程群二维码（选填）"]}]}, {"tag": "image", "attrs": {"wx:if": [{"e": 429}], "class": ["media-preview"], "src": [{"e": 429}], "mode": ["aspectFit"]}, "children": []}, {"tag": "button", "attrs": {"class": ["secondary"], "data-kind": ["groupQr"], "bindtap": ["upload"], "disabled": [{"e": 408}]}, "children": [{"text": [{"e": 430}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 429}], "class": ["text-button"], "data-kind": ["groupQr"], "bindtap": ["removeImage"]}, "children": [{"text": ["移除群二维码"]}]}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["联系手机号（选填）"]}]}, {"tag": "input", "attrs": {"class": ["course-form-input"], "type": ["number"], "maxlength": ["11"], "value": [{"e": 431}], "name": ["contactPhone"], "data-key": ["contactPhone"], "bindinput": ["input"], "placeholder": ["可留空"]}, "children": []}, {"tag": "text", "attrs": {"class": ["field-label"]}, "children": [{"text": ["参课须知"]}]}, {"tag": "textarea", "attrs": {"class": ["course-form-textarea"], "value": [{"e": 432}], "name": ["notice"], "data-key": ["notice"], "bindinput": ["input"], "maxlength": ["2000"], "placeholder": ["如签到要求、携带物品、联系方式等"]}, "children": []}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 433}], "class": ["muted"]}, "children": [{"text": ["图片上传中，请稍候…"]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 434}], "class": ["error"], "role": ["alert"]}, "children": [{"text": [{"e": 434}]}]}, {"tag": "button", "attrs": {"class": ["primary"], "form-type": ["submit"], "loading": [{"e": 233}], "disabled": [{"e": 435}]}, "children": [{"text": [{"e": 436}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 437}], "class": ["secondary"], "bindtap": ["saveDraft"], "disabled": [{"e": 435}]}, "children": [{"text": ["保存草稿"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 438}], "class": ["secondary"], "data-status": ["CLOSED"], "bindtap": ["save"], "disabled": [{"e": 435}]}, "children": [{"text": ["结束本场报名"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 439}], "class": ["secondary"], "open-type": ["share"], "disabled": [{"e": 233}]}, "children": [{"text": ["微信分享已保存课程"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 440}], "class": ["text-button"], "bindtap": ["preview"], "disabled": [{"e": 233}]}, "children": [{"text": ["查看已保存的课程"]}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 403}], "class": ["primary"], "bindtap": ["refresh"]}, "children": [{"text": ["登录并核实工作人员身份"]}]}]}], "config": {"navigationBarTitleText": "维护公开课", "enablePullDownRefresh": false}}, "pages/course-roster/course-roster": {"tree": [{"tag": "view", "attrs": {"class": ["service-page course-page"]}, "children": [{"tag": "view", "attrs": {"class": ["service-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["报名名单 · 扫码入场"]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": [{"e": 441}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 348}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"]}, "children": [{"text": ["重试"]}]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 338}]}, "children": [{"tag": "view", "attrs": {"class": ["course-stats"]}, "children": [{"tag": "view", "attrs": {"class": ["course-stat"]}, "children": [{"tag": "text", "attrs": {"class": ["number"]}, "children": [{"text": [{"e": 442}]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["有效报名"]}]}]}, {"tag": "view", "attrs": {"class": ["course-stat"]}, "children": [{"tag": "text", "attrs": {"class": ["number"]}, "children": [{"text": [{"e": 443}]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["已到课"]}]}]}, {"tag": "view", "attrs": {"class": ["course-stat"]}, "children": [{"tag": "text", "attrs": {"class": ["number"]}, "children": [{"text": [{"e": 444}]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["待核实"]}]}]}]}, {"tag": "button", "attrs": {"class": ["primary"], "bindtap": ["scan"], "disabled": [{"e": 233}]}, "children": [{"text": ["扫码核对入场凭证"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["扫描后先核对报名人，再确认实际到课。报名和进群本身不会开通咨询资格。"]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 445}], "class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["请核对报名人"]}]}, {"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 446}]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 447}, " · ", {"e": 448}]}]}, {"tag": "text", "attrs": {"class": ["pill"]}, "children": [{"text": [{"e": 449}]}]}, {"tag": "button", "attrs": {"class": ["primary"], "bindtap": ["confirmScan"], "disabled": [{"e": 450}]}, "children": [{"text": [{"e": 451}]}]}, {"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["closeScan"], "disabled": [{"e": 233}]}, "children": [{"text": ["收起"]}]}]}, {"tag": "input", "attrs": {"value": [{"e": 254}], "placeholder": ["搜索姓名或手机号"], "bindinput": ["inputSearch"], "bindconfirm": ["refresh"], "confirm-type": ["search"]}, "children": []}, {"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["refresh"]}, "children": [{"text": ["搜索名单"]}]}, {"tag": "scroll-view", "attrs": {"scroll-x": [], "class": ["course-tabs"]}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 452}], "wx:key": ["key"], "class": ["course-tab ", {"e": 367}], "data-key": [{"e": 368}], "bindtap": ["filter"]}, "children": [{"text": [{"e": 117}]}]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 370}], "wx:key": ["id"], "class": ["card"]}, "children": [{"tag": "view", "attrs": {"class": ["row"]}, "children": [{"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 373}]}]}, {"tag": "text", "attrs": {"class": ["pill"]}, "children": [{"text": [{"e": 371}]}]}]}, {"tag": "text", "attrs": {"class": ["link"], "data-phone": [{"e": 453}], "bindtap": ["call"]}, "children": [{"text": [{"e": 453}, " · 联系报名人"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 240}, " · 报名于 ", {"e": 304}]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 454}]}, "children": [{"tag": "view", "attrs": {"class": ["entry-grid"]}, "children": [{"tag": "button", "attrs": {"class": ["secondary"], "disabled": [{"e": 455}], "data-id": [{"e": 13}], "data-field": ["groupStatus"], "data-value": ["INVITED"], "bindtap": ["verify"]}, "children": [{"text": ["已邀请进群"]}]}, {"tag": "button", "attrs": {"class": ["secondary"], "disabled": [{"e": 456}], "data-id": [{"e": 13}], "data-field": ["groupStatus"], "data-value": ["JOINED"], "bindtap": ["verify"]}, "children": [{"text": ["已加入群聊"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 457}], "class": ["entry-grid"]}, "children": [{"tag": "button", "attrs": {"class": ["primary"], "disabled": [{"e": 233}], "data-id": [{"e": 13}], "data-field": ["attendanceStatus"], "data-value": ["ATTENDED"], "bindtap": ["verify"]}, "children": [{"text": ["人工核实到课"]}]}, {"tag": "button", "attrs": {"class": ["text-button"], "disabled": [{"e": 233}], "data-id": [{"e": 13}], "data-field": ["attendanceStatus"], "data-value": ["ABSENT"], "bindtap": ["verify"]}, "children": [{"text": ["标记未到课"]}]}]}, {"tag": "text", "attrs": {"wx:else": [], "class": ["muted"]}, "children": [{"text": ["已核销 · ", {"e": 458}]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 459}], "class": ["empty"]}, "children": [{"text": ["当前条件下暂无报名记录。"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 263}], "class": ["secondary"], "bindtap": ["more"], "disabled": [{"e": 18}]}, "children": [{"text": ["加载更多"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在读取名单…"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 403}], "class": ["primary"], "bindtap": ["refresh"]}, "children": [{"text": ["登录并核实工作人员身份"]}]}]}], "config": {"navigationBarTitleText": "名单与签到", "enablePullDownRefresh": false}}, "pages/checkin/checkin": {"tree": [{"tag": "view", "attrs": {"class": ["service-page course-page"]}, "children": [{"tag": "view", "attrs": {"class": ["service-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["现场签到 · 扫码进场"]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": [{"e": 460}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 461}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"], "disabled": [{"e": 233}]}, "children": [{"text": ["重新核实权限"]}]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 338}]}, "children": [{"tag": "block", "attrs": {"wx:if": [{"e": 462}]}, "children": [{"tag": "view", "attrs": {"class": ["course-stats"]}, "children": [{"tag": "view", "attrs": {"class": ["course-stat"]}, "children": [{"tag": "text", "attrs": {"class": ["number"]}, "children": [{"text": [{"e": 442}]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["报名总数"]}]}]}, {"tag": "view", "attrs": {"class": ["course-stat"]}, "children": [{"tag": "text", "attrs": {"class": ["number"]}, "children": [{"text": [{"e": 443}]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["已签到"]}]}]}, {"tag": "view", "attrs": {"class": ["course-stat"]}, "children": [{"tag": "text", "attrs": {"class": ["number"]}, "children": [{"text": [{"e": 463}]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["未签到"]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 464}], "class": ["card checkin-result"]}, "children": [{"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 465}, " · ", {"e": 466}]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": ["已签到 ", {"e": 443}, " 人，还剩 ", {"e": 463}, " 人未签到"]}]}]}, {"tag": "button", "attrs": {"class": ["primary"], "bindtap": ["scan"], "disabled": [{"e": 467}]}, "children": [{"text": [{"e": 468}]}]}, {"tag": "text", "attrs": {"class": ["muted checkin-help"]}, "children": [{"text": ["请扫描用户「我的报名」里的个人入场二维码，并核对本人。开课前两小时开放签到；仅统计有效报名，已取消不计入。人数以本次扫码或刷新时为准。"]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 469}], "class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["核对入场人员"]}]}, {"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 470}]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 471}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 472}]}]}, {"tag": "button", "attrs": {"class": ["primary"], "bindtap": ["confirmScan"], "disabled": [{"e": 233}]}, "children": [{"text": [{"e": 473}]}]}, {"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["closeScan"], "disabled": [{"e": 233}]}, "children": [{"text": ["取消"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 474}], "class": ["card checkin-staff"]}, "children": [{"tag": "button", "attrs": {"class": ["secondary"], "bindtap": ["toggleStaff"], "disabled": [{"e": 233}]}, "children": [{"text": [{"e": 475}]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 476}]}, "children": [{"tag": "text", "attrs": {"class": ["muted checkin-help"]}, "children": [{"text": ["管理可查看所有场次。被指定的人员仅能查看本场签到名单和扫码入场，不会获得管理权限。"]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 477}], "class": ["error"]}, "children": [{"text": [{"e": 477}]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 478}], "wx:key": ["id"], "class": ["row"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 97}, " · 用户 ", {"e": 479}]}]}, {"tag": "button", "attrs": {"class": ["text-button"], "data-id": [{"e": 479}], "data-name": [{"e": 97}], "data-active": ["false"], "bindtap": ["setStaff"], "disabled": [{"e": 233}]}, "children": [{"text": ["取消权限"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 480}], "class": ["muted"]}, "children": [{"text": ["暂未指定签到人员，管理仍可签到。"]}]}, {"tag": "input", "attrs": {"value": [{"e": 481}], "placeholder": ["输入昵称或用户编号"], "maxlength": ["60"], "bindinput": ["inputStaffSearch"], "bindconfirm": ["searchStaff"]}, "children": []}, {"tag": "button", "attrs": {"class": ["secondary"], "bindtap": ["searchStaff"], "disabled": [{"e": 482}]}, "children": [{"text": ["查找已登录用户"]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 483}], "wx:key": ["id"], "class": ["row"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 97}, " · 用户 ", {"e": 13}]}]}, {"tag": "button", "attrs": {"class": ["secondary"], "data-id": [{"e": 13}], "data-name": [{"e": 97}], "data-active": ["true"], "bindtap": ["setStaff"], "disabled": [{"e": 233}]}, "children": [{"text": ["设为本场签到人员"]}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 484}], "class": ["text-button"], "bindtap": ["moreStaff"], "disabled": [{"e": 482}]}, "children": [{"text": ["更多用户"]}]}]}]}]}, {"tag": "input", "attrs": {"value": [{"e": 254}], "placeholder": [{"e": 485}], "maxlength": ["60"], "bindinput": ["inputSearch"], "bindconfirm": ["refresh"]}, "children": []}, {"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["refresh"], "disabled": [{"e": 233}]}, "children": [{"text": ["搜索 / 刷新人数"]}]}, {"tag": "scroll-view", "attrs": {"wx:if": [{"e": 462}], "scroll-x": [], "class": ["course-tabs"]}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 452}], "wx:key": ["key"], "class": ["course-tab ", {"e": 367}], "data-key": [{"e": 368}], "bindtap": ["filter"]}, "children": [{"text": [{"e": 117}]}]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 462}]}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 370}], "wx:key": ["id"], "class": ["card"]}, "children": [{"tag": "view", "attrs": {"class": ["row"]}, "children": [{"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 97}]}]}, {"tag": "text", "attrs": {"class": ["pill"]}, "children": [{"text": [{"e": 486}]}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 374}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 487}], "class": ["muted"]}, "children": [{"text": ["签到时间 ", {"e": 458}]}]}]}]}, {"tag": "block", "attrs": {"wx:else": []}, "children": [{"tag": "view", "attrs": {"wx:for": [{"e": 370}], "wx:key": ["id"], "class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 14}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 257}]}]}, {"tag": "button", "attrs": {"class": ["primary"], "data-id": [{"e": 13}], "bindtap": ["openClass"]}, "children": [{"text": [{"e": 488}]}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 459}], "class": ["empty"]}, "children": [{"text": [{"e": 489}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 263}], "class": ["secondary"], "bindtap": ["more"], "disabled": [{"e": 490}]}, "children": [{"text": ["加载更多"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在读取签到信息…"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 403}], "class": ["primary"], "bindtap": ["refresh"]}, "children": [{"text": ["登录并核实签到权限"]}]}]}], "config": {"navigationBarTitleText": "扫码进场", "enablePullDownRefresh": false}}, "pages/referrals/referrals": {"tree": [{"tag": "view", "attrs": {"class": ["service-page course-page"]}, "children": [{"tag": "view", "attrs": {"class": ["service-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["分享课程 · 推荐归属"]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": ["推荐客户"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["谁推荐、报名哪一场、是否到课，都在这里查看。"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"]}, "children": [{"text": ["重试"]}]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 338}]}, "children": [{"tag": "view", "attrs": {"class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["我的推荐报名码"]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 491}]}]}, {"tag": "canvas", "attrs": {"wx:if": [{"e": 492}], "class": ["referral-code"], "canvas-id": ["referral-code"], "style": ["width:256px;height:256px;"]}, "children": []}, {"tag": "text", "attrs": {"wx:if": [{"e": 389}], "class": ["error"]}, "children": [{"text": ["二维码暂未显示，请点击下方按钮重新生成。"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 493}], "class": ["primary"], "bindtap": ["shareCode"]}, "children": [{"text": ["生成图片 · 转发报名二维码"]}]}, {"tag": "text", "attrs": {"wx:else": [], "class": ["muted"]}, "children": [{"text": ["请在课程网页中打开此页面，获取专属报名二维码。"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["图片内已包含推荐信息，无需复制链接。对方在微信内扫码后先登录，登录及刷新后推荐来源仍会保留。新客户首次成功报名后记录归属，已有推荐人不变。"]}]}, {"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["courses"]}, "children": [{"text": ["选择课程，生成该场报名码"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 474}], "class": ["course-tabs"]}, "children": [{"tag": "view", "attrs": {"class": ["course-tab ", {"e": 494}], "data-scope": ["own"], "bindtap": ["changeScope"]}, "children": [{"text": ["我推荐的"]}]}, {"tag": "view", "attrs": {"class": ["course-tab ", {"e": 495}], "data-scope": ["all"], "bindtap": ["changeScope"]}, "children": [{"text": ["全部推荐客户"]}]}]}, {"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": [{"e": 496}, " · ", {"e": 497}, " 人"]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 370}], "wx:key": ["id"], "class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 498}]}]}, {"tag": "text", "attrs": {"class": ["referral-source"]}, "children": [{"text": ["推荐人：", {"e": 499}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["记录时间 ", {"e": 257}]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 500}], "wx:for-item": ["enrollment"], "wx:key": ["id"], "class": ["referral-course"]}, "children": [{"tag": "view", "attrs": {"class": ["row"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 501}]}]}, {"tag": "text", "attrs": {"class": ["pill"]}, "children": [{"text": [{"e": 502}]}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["报名人：", {"e": 503}]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 504}], "class": ["muted"]}, "children": [{"text": ["已记录推荐关系，暂无课程报名。"]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 505}], "class": ["muted"]}, "children": [{"text": ["展示最近 20 条报名。"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 459}], "class": ["empty"]}, "children": [{"text": ["暂无推荐客户。分享上方报名二维码，新客户完成首次报名后会显示在这里。历史未记录的推荐来源不会自动补认。"]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 263}], "class": ["secondary"], "bindtap": ["more"], "disabled": [{"e": 18}]}, "children": [{"text": ["加载更多客户"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在读取推荐信息…"]}]}]}], "config": {"navigationBarTitleText": "推荐客户"}}, "pages/invite-login/invite-login": {"tree": [{"tag": "view", "attrs": {"class": ["service-page course-page"]}, "children": [{"tag": "view", "attrs": {"class": ["service-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["知守 · 课程邀请"]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": ["登录后继续报名"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["我们会保留这次邀请的推荐信息，登录后回到你扫码进入的课程。"]}]}]}, {"tag": "view", "attrs": {"class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": [{"e": 506}]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 507}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在确认推荐信息…"]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"class": ["primary"], "bindtap": ["login"], "disabled": [{"e": 18}]}, "children": [{"text": [{"e": 508}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["请在微信内打开，或用微信扫一扫 / 长按识别收到的报名二维码。"]}]}]}]}], "config": {"navigationBarTitleText": "课程邀请"}}, "pages/course-poster/course-poster": {"tree": [{"tag": "view", "attrs": {"class": ["service-page course-page"]}, "children": [{"tag": "view", "attrs": {"class": ["service-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["知守 · 课程邀请"]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": ["把这堂课，分享给在乎的人"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["发送到微信聊天或群，朋友点开课程卡片即可报名。"]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 19}], "class": ["error"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": [{"e": 19}]}]}, {"tag": "button", "attrs": {"bindtap": ["refresh"]}, "children": [{"text": ["重新加载"]}]}]}, {"tag": "text", "attrs": {"wx:if": [{"e": 18}], "class": ["muted"]}, "children": [{"text": ["正在读取课程…"]}]}, {"tag": "block", "attrs": {"wx:if": [{"e": 344}]}, "children": [{"tag": "view", "attrs": {"class": ["card course-card"]}, "children": [{"tag": "image", "attrs": {"wx:if": [{"e": 345}], "class": ["course-cover"], "src": [{"e": 345}], "mode": ["aspectFill"]}, "children": []}, {"tag": "view", "attrs": {"class": ["course-card-content"]}, "children": [{"tag": "text", "attrs": {"class": ["pill"]}, "children": [{"text": ["公开课"]}]}, {"tag": "text", "attrs": {"class": ["card-title"]}, "children": [{"text": [{"e": 347}]}]}, {"tag": "text", "attrs": {"class": ["course-meta"]}, "children": [{"text": [{"e": 348}]}]}, {"tag": "text", "attrs": {"class": ["course-meta"]}, "children": [{"text": [{"e": 349}]}]}]}]}, {"tag": "button", "attrs": {"wx:if": [{"e": 509}], "class": ["primary"], "open-type": ["share"]}, "children": [{"text": ["微信分享给朋友或群"]}]}, {"tag": "text", "attrs": {"wx:else": [], "class": ["state-note"]}, "children": [{"text": ["本场课程为草稿，请发布后再邀请报名。"]}]}, {"tag": "button", "attrs": {"class": ["secondary"], "bindtap": ["detail"]}, "children": [{"text": ["查看课程详情"]}]}, {"tag": "view", "attrs": {"class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["一起参加，很简单"]}]}, {"tag": "view", "attrs": {"class": ["progress-line"]}, "children": [{"tag": "text", "attrs": {}, "children": [{"text": ["1 微信分享"]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["2 报名"]}]}, {"tag": "text", "attrs": {}, "children": [{"text": ["3 联系进群"]}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["朋友填写姓名和手机号后，工作人员联系进群，开课地址及参课安排在群内通知。"]}]}]}]}]}], "config": {"navigationBarTitleText": "微信分享课程", "enablePullDownRefresh": false}}, "pages/support/support": {"tree": [{"tag": "view", "attrs": {"class": ["service-page"]}, "children": [{"tag": "view", "attrs": {"class": ["service-hero"]}, "children": [{"tag": "text", "attrs": {"class": ["eyebrow"]}, "children": [{"text": ["知守"]}]}, {"tag": "text", "attrs": {"class": ["page-title"]}, "children": [{"text": [{"e": 510}]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": [{"e": 511}]}]}]}, {"tag": "view", "attrs": {"wx:if": [{"e": 512}], "class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": ["学习与持续沟通"]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": ["公开课、线下咨询预约与执行反馈，让每一次沟通都有回应。"]}]}, {"tag": "text", "attrs": {"class": ["muted"]}, "children": [{"text": ["当前版本：", {"e": 513}]}]}]}, {"tag": "view", "attrs": {"wx:for": [{"e": 514}], "wx:key": ["title"], "class": ["card"]}, "children": [{"tag": "text", "attrs": {"class": ["section-title"]}, "children": [{"text": [{"e": 14}]}]}, {"tag": "text", "attrs": {"class": ["body"]}, "children": [{"text": [{"e": 515}]}]}]}, {"tag": "button", "attrs": {"class": ["secondary"], "bindtap": ["classes"]}, "children": [{"text": ["查看公开课"]}]}, {"tag": "button", "attrs": {"class": ["text-button"], "bindtap": ["privacy"]}, "children": [{"text": ["隐私与安全说明"]}]}]}], "config": {"navigationBarTitleText": "帮助与支持"}}},expressions:[
function(scope){with(scope){try{return (navHeight)}catch(_){return undefined}}},
function(scope){with(scope){try{return (statusBarHeight)}catch(_){return undefined}}},
function(scope){with(scope){try{return (navPaddingRight)}catch(_){return undefined}}},
function(scope){with(scope){try{return (userInfo.avatarUrl && !avatarFailed)}catch(_){return undefined}}},
function(scope){with(scope){try{return (userInfo.avatarUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (userName)}catch(_){return undefined}}},
function(scope){with(scope){try{return (loadingCourses)}catch(_){return undefined}}},
function(scope){with(scope){try{return (courseError)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!featuredCourses.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (featuredCourses[0].coverUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (featuredCourses.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (visibleCourses.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (visibleCourses)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.id)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.title)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.coverUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.durationText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (index + 1)}catch(_){return undefined}}},
function(scope){with(scope){try{return (loading)}catch(_){return undefined}}},
function(scope){with(scope){try{return (error)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!visibleCourses.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (course.title || '课程详情')}catch(_){return undefined}}},
function(scope){with(scope){try{return (loading || error)}catch(_){return undefined}}},
function(scope){with(scope){try{return (navHeight + 40)}catch(_){return undefined}}},
function(scope){with(scope){try{return (loading ? '正在加载课程…' : error)}catch(_){return undefined}}},
function(scope){with(scope){try{return (course)}catch(_){return undefined}}},
function(scope){with(scope){try{return (showVideoPlayer && playingVideoUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (playingVideoUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (course.coverUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (course.chapters[0].videoUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (course.subtitle === '《答案库》系列课程' ? course.title : course.badge)}catch(_){return undefined}}},
function(scope){with(scope){try{return (course.durationText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (course.title)}catch(_){return undefined}}},
function(scope){with(scope){try{return (course.subtitle)}catch(_){return undefined}}},
function(scope){with(scope){try{return (contentSections)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.body)}catch(_){return undefined}}},
function(scope){with(scope){try{return (course.chapters.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (course.chapters)}catch(_){return undefined}}},
function(scope){with(scope){try{return (activeChapterIndex === index ? 'active' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (index)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.duration)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.videoUrl ? '可播放' : '准备中')}catch(_){return undefined}}},
function(scope){with(scope){try{return (canOpenSessionDrawer ? 'nav-mark-button nav-mark-avatar-wrap' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (sessionDrawerVisible ? 'nav-mark-active' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (isManagerView && customerAvatarUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (customerAvatarUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (isManagerView)}catch(_){return undefined}}},
function(scope){with(scope){try{return (customerAvatarText || '客')}catch(_){return undefined}}},
function(scope){with(scope){try{return (canOpenSessionDrawer)}catch(_){return undefined}}},
function(scope){with(scope){try{return (canOpenSessionDrawer && managerTotalUnread > 0)}catch(_){return undefined}}},
function(scope){with(scope){try{return (managerTotalUnread > 99 ? '99+' : managerTotalUnread)}catch(_){return undefined}}},
function(scope){with(scope){try{return (canOpenSessionDrawer ? 'nav-title-copy-button' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (chatTitle)}catch(_){return undefined}}},
function(scope){with(scope){try{return (chatSubtitle)}catch(_){return undefined}}},
function(scope){with(scope){try{return (isManagerView || hasAccess || serviceEnded || messages.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (serviceCardCollapsed ? 'is-collapsed' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (serviceCardCollapsed ? 'is-down' : 'is-up')}catch(_){return undefined}}},
function(scope){with(scope){try{return (serviceCardCollapsed)}catch(_){return undefined}}},
function(scope){with(scope){try{return (remainingText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (serviceLabel)}catch(_){return undefined}}},
function(scope){with(scope){try{return (serviceDesc)}catch(_){return undefined}}},
function(scope){with(scope){try{return (serviceEnded && canRenew)}catch(_){return undefined}}},
function(scope){with(scope){try{return (renewing)}catch(_){return undefined}}},
function(scope){with(scope){try{return (scrollIntoView)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!messages.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (systemText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (messages)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.type === 'recall-notice')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.canReedit)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.content)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.role)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.role === 'assistant')}catch(_){return undefined}}},
function(scope){with(scope){try{return (canOpenSessionDrawer ? 'message-avatar-button' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (leftAvatarUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (leftAvatarText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (isManagerView && item.role === 'user' && item.senderRole === 'manager' && !item.isRecalled ? 'onMessageLongPress' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.role === 'user')}catch(_){return undefined}}},
function(scope){with(scope){try{return (rightAvatarUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (rightAvatarText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (sendError)}catch(_){return undefined}}},
function(scope){with(scope){try{return (failedMessage)}catch(_){return undefined}}},
function(scope){with(scope){try{return (hasAccess && !serviceEnded)}catch(_){return undefined}}},
function(scope){with(scope){try{return (composerPlaceholder)}catch(_){return undefined}}},
function(scope){with(scope){try{return (input)}catch(_){return undefined}}},
function(scope){with(scope){try{return (sending || !hasAccess || serviceEnded)}catch(_){return undefined}}},
function(scope){with(scope){try{return (sending)}catch(_){return undefined}}},
function(scope){with(scope){try{return (serviceEnded || !hasAccess ? 'disabled' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (sending || !hasAccess || serviceEnded || !input)}catch(_){return undefined}}},
function(scope){with(scope){try{return (sessionDrawerVisible)}catch(_){return undefined}}},
function(scope){with(scope){try{return (managerTotalUnread > 0)}catch(_){return undefined}}},
function(scope){with(scope){try{return (false)}catch(_){return undefined}}},
function(scope){with(scope){try{return (managerSessionList)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.active ? 'active' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.avatarUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.avatarText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.unreadCount > 0)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.unreadCount > 99 ? '99+' : item.unreadCount)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.remainingText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.topic)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.displayStatus)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.statusLabel)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!managerSessionList.length && !managerSessionLoading)}catch(_){return undefined}}},
function(scope){with(scope){try{return (managerSessionLoading)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!isLoggedIn)}catch(_){return undefined}}},
function(scope){with(scope){try{return (loginForm.avatarUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (defaultPortrait)}catch(_){return undefined}}},
function(scope){with(scope){try{return (loginForm.nickName)}catch(_){return undefined}}},
function(scope){with(scope){try{return (loginLoading ? 'is-loading' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (loginLoading)}catch(_){return undefined}}},
function(scope){with(scope){try{return (loginTip)}catch(_){return undefined}}},
function(scope){with(scope){try{return (userInfo.nickName || serviceProvider.displayName || '微信用户')}catch(_){return undefined}}},
function(scope){with(scope){try{return (isServiceProvider ? '已认证 · 在线服务' : '客户中心')}catch(_){return undefined}}},
function(scope){with(scope){try{return (isServiceProvider)}catch(_){return undefined}}},
function(scope){with(scope){try{return (serviceProvider.onlineStatus === 'online' ? '在线' : '离线')}catch(_){return undefined}}},
function(scope){with(scope){try{return (managerStats)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.value)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.label)}catch(_){return undefined}}},
function(scope){with(scope){try{return (accountBalanceText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (canInvite)}catch(_){return undefined}}},
function(scope){with(scope){try{return (canCheckin)}catch(_){return undefined}}},
function(scope){with(scope){try{return (testCustomerPreviewActive)}catch(_){return undefined}}},
function(scope){with(scope){try{return (activeView === 'workbench' ? 'active' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (activeView === 'serving' ? 'active' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (activeView === 'identities' ? 'active' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (activeView === 'workbench')}catch(_){return undefined}}},
function(scope){with(scope){try{return (stats)}catch(_){return undefined}}},
function(scope){with(scope){try{return (servingCount > 0)}catch(_){return undefined}}},
function(scope){with(scope){try{return (servingCount)}catch(_){return undefined}}},
function(scope){with(scope){try{return (completedCount > 0)}catch(_){return undefined}}},
function(scope){with(scope){try{return (completedCount)}catch(_){return undefined}}},
function(scope){with(scope){try{return (activeView === 'serving')}catch(_){return undefined}}},
function(scope){with(scope){try{return (servingSessions)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.avatarText || '客')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.tag)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.startAt)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.startedAt ? '剩余 ' + item.left : '待开始')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.elapsed)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.progress)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.durationMinutes)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.price)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.orderId)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!servingSessions.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (activeView === 'identities')}catch(_){return undefined}}},
function(scope){with(scope){try{return (identitySearch)}catch(_){return undefined}}},
function(scope){with(scope){try{return (identityUsers)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.isSelf)}catch(_){return undefined}}},
function(scope){with(scope){try{return (identityOptions)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.identityIndex)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.isSelf || changingAccountId === item.id)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.isSelf ? 'disabled' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.identityLabel)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!item.isSelf)}catch(_){return undefined}}},
function(scope){with(scope){try{return (identityLoading)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!identityUsers.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (order)}catch(_){return undefined}}},
function(scope){with(scope){try{return (order.avatarUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (order.avatarText || '客')}catch(_){return undefined}}},
function(scope){with(scope){try{return (order.name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (order.tag)}catch(_){return undefined}}},
function(scope){with(scope){try{return (order.title)}catch(_){return undefined}}},
function(scope){with(scope){try{return (order.statusTone)}catch(_){return undefined}}},
function(scope){with(scope){try{return (order.status)}catch(_){return undefined}}},
function(scope){with(scope){try{return (order.durationMinutes)}catch(_){return undefined}}},
function(scope){with(scope){try{return (order.amount)}catch(_){return undefined}}},
function(scope){with(scope){try{return (order.time)}catch(_){return undefined}}},
function(scope){with(scope){try{return (sessionId || '暂无会话')}catch(_){return undefined}}},
function(scope){with(scope){try{return (sessionId)}catch(_){return undefined}}},
function(scope){with(scope){try{return (order.status === '已完成' ? '查看聊天' : '进入聊天')}catch(_){return undefined}}},
function(scope){with(scope){try{return (saving)}catch(_){return undefined}}},
function(scope){with(scope){try{return (avatarUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (usernameError)}catch(_){return undefined}}},
function(scope){with(scope){try{return (region)}catch(_){return undefined}}},
function(scope){with(scope){try{return (detailAddress)}catch(_){return undefined}}},
function(scope){with(scope){try{return (genderOptions)}catch(_){return undefined}}},
function(scope){with(scope){try{return (genderIndex)}catch(_){return undefined}}},
function(scope){with(scope){try{return (gender || '未设置')}catch(_){return undefined}}},
function(scope){with(scope){try{return (phone || '暂未绑定')}catch(_){return undefined}}},
function(scope){with(scope){try{return (phone)}catch(_){return undefined}}},
function(scope){with(scope){try{return (today)}catch(_){return undefined}}},
function(scope){with(scope){try{return (birthday)}catch(_){return undefined}}},
function(scope){with(scope){try{return (birthday || '未设置')}catch(_){return undefined}}},
function(scope){with(scope){try{return (accountId || '暂未生成')}catch(_){return undefined}}},
function(scope){with(scope){try{return (saving || loading)}catch(_){return undefined}}},
function(scope){with(scope){try{return (updatedAt)}catch(_){return undefined}}},
function(scope){with(scope){try{return (basisItems)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item)}catch(_){return undefined}}},
function(scope){with(scope){try{return (promiseItems)}catch(_){return undefined}}},
function(scope){with(scope){try{return (dataGroups)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.tag || '必要')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.items)}catch(_){return undefined}}},
function(scope){with(scope){try{return (dataItem)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.purpose)}catch(_){return undefined}}},
function(scope){with(scope){try{return (sections)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.paragraphs)}catch(_){return undefined}}},
function(scope){with(scope){try{return (paragraph)}catch(_){return undefined}}},
function(scope){with(scope){try{return (rights)}catch(_){return undefined}}},
function(scope){with(scope){try{return (loading || error || !advisor)}catch(_){return undefined}}},
function(scope){with(scope){try{return (loading ? '正在加载专家介绍…' : error || '该专家介绍不存在。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (!loading)}catch(_){return undefined}}},
function(scope){with(scope){try{return (advisor && !loading && !error)}catch(_){return undefined}}},
function(scope){with(scope){try{return (advisor.imageUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (advisor.avatarText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (advisor.name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (advisor.title)}catch(_){return undefined}}},
function(scope){with(scope){try{return (advisor.rating)}catch(_){return undefined}}},
function(scope){with(scope){try{return (advisor.helped)}catch(_){return undefined}}},
function(scope){with(scope){try{return (advisor.bio)}catch(_){return undefined}}},
function(scope){with(scope){try{return (advisor.tags)}catch(_){return undefined}}},
function(scope){with(scope){try{return (paying || bookingBlocked)}catch(_){return undefined}}},
function(scope){with(scope){try{return (bookingButtonText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (mode === 'courses' ? '搜索课程名称或主题' : '搜索专家姓名或擅长方向')}catch(_){return undefined}}},
function(scope){with(scope){try{return (keyword)}catch(_){return undefined}}},
function(scope){with(scope){try{return (true)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!searched)}catch(_){return undefined}}},
function(scope){with(scope){try{return (mode === 'courses' ? '输入课程名称或主题。' : '输入专家姓名、擅长方向或你正在困扰的问题。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (!results.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (mode === 'courses' ? '没有找到相关课程' : '没有找到相关专家')}catch(_){return undefined}}},
function(scope){with(scope){try{return (results)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.detailUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (mode === 'courses' ? item.coverUrl : item.imageUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (mode === 'courses' ? '课程' : '知守')}catch(_){return undefined}}},
function(scope){with(scope){try{return (mode === 'courses' ? item.title : item.name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (mode === 'courses' ? item.subtitle : item.title)}catch(_){return undefined}}},
function(scope){with(scope){try{return (mode !== 'courses')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.displayTags)}catch(_){return undefined}}},
function(scope){with(scope){try{return (tag)}catch(_){return undefined}}},
function(scope){with(scope){try{return (eligible ? '申请线下咨询' : '查看预约条件')}catch(_){return undefined}}},
function(scope){with(scope){try{return (showForm)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.phone)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.requestedTime)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.concerns)}catch(_){return undefined}}},
function(scope){with(scope){try{return (busy)}catch(_){return undefined}}},
function(scope){with(scope){try{return (isLoggedIn)}catch(_){return undefined}}},
function(scope){with(scope){try{return (eligible ? '已核实参加公开课，可以提交线下咨询申请；具体时间由工作人员确认。' : '参加公开课后，由工作人员核实到课情况，再开放咨询申请。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollments)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.public_class.title)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.statusText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.attendanceText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.groupText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.public_class.group_guide || '工作人员将联系你进群，课程地址在群内通知。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (!loading && !enrollments.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointments)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.child_info.name || '线下沟通预约')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.concerns)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.status === 'PENDING' ? '期望时间：' + item.requested_time : item.timeText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.status === 'CONFIRMED' && !item.child_info ? '填写孩子基础信息' : '查看记录与执行反馈')}catch(_){return undefined}}},
function(scope){with(scope){try{return (!loading && !appointments.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointments.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (nextAppointmentCursor ? '已加载' : '共')}catch(_){return undefined}}},
function(scope){with(scope){try{return (nextAppointmentCursor)}catch(_){return undefined}}},
function(scope){with(scope){try{return (moreLoading)}catch(_){return undefined}}},
function(scope){with(scope){try{return (moreLoading || loading)}catch(_){return undefined}}},
function(scope){with(scope){try{return (search)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classes)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.feeText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.timeText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.placeText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.description)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.canEnroll ? '报名开放' : item.closedReason)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!loading && !error && !classes.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (search ? '没有找到相关课程，试试其他关键词。' : '新一期公开课正在安排，发布后会在这里开放报名。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (nextCursor)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.statusText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.child_info.name || appointment.contact_name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.provider.display_name || '待安排')}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.status === 'PENDING' ? '期望时间：' + appointment.requested_time : '咨询时间：' + appointment.timeText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.concerns)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.staff_note)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.status === 'PENDING')}catch(_){return undefined}}},
function(scope){with(scope){try{return (canAccept && appointment.status === 'PENDING')}catch(_){return undefined}}},
function(scope){with(scope){try{return (confirmDate || '选择确认日期')}catch(_){return undefined}}},
function(scope){with(scope){try{return (confirmTime || '选择确认时间')}catch(_){return undefined}}},
function(scope){with(scope){try{return (staffNote)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.status === 'CONFIRMED' || appointment.child_info)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!isStaff && appointment.status === 'CONFIRMED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (childForm.name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (childForm.age)}catch(_){return undefined}}},
function(scope){with(scope){try{return (childForm.grade)}catch(_){return undefined}}},
function(scope){with(scope){try{return (childForm.guardian)}catch(_){return undefined}}},
function(scope){with(scope){try{return (childForm.relationship)}catch(_){return undefined}}},
function(scope){with(scope){try{return (childForm.phone)}catch(_){return undefined}}},
function(scope){with(scope){try{return (childForm.concerns)}catch(_){return undefined}}},
function(scope){with(scope){try{return (childForm.goals)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.child_info)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.child_info.name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.child_info.age)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.child_info.grade)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.child_info.guardian)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.child_info.relationship)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.child_info.phone)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.child_info.concerns)}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.child_info.goals || '未填写')}catch(_){return undefined}}},
function(scope){with(scope){try{return (appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (summaryBusy || recording)}catch(_){return undefined}}},
function(scope){with(scope){try{return (summaryBusy)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!recording)}catch(_){return undefined}}},
function(scope){with(scope){try{return (recordingSeconds)}catch(_){return undefined}}},
function(scope){with(scope){try{return (recording)}catch(_){return undefined}}},
function(scope){with(scope){try{return (summaryJobs)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.source === 'AUDIO' ? '面谈录音' : '文字聊天')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.createdText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.draft)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.error_message)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.status === 'FAILED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.status === 'UPLOADING')}catch(_){return undefined}}},
function(scope){with(scope){try{return (canReply && item.draft && (!record || record.status !== 'CONFIRMED'))}catch(_){return undefined}}},
function(scope){with(scope){try{return (summaryJobs.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (nextSummaryCursor ? '已加载' : '共')}catch(_){return undefined}}},
function(scope){with(scope){try{return (nextSummaryCursor)}catch(_){return undefined}}},
function(scope){with(scope){try{return (record || canReply)}catch(_){return undefined}}},
function(scope){with(scope){try{return (canReply && (!record || record.status !== 'CONFIRMED') && (appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED'))}catch(_){return undefined}}},
function(scope){with(scope){try{return (recordForm.summary)}catch(_){return undefined}}},
function(scope){with(scope){try{return (recordForm.advice)}catch(_){return undefined}}},
function(scope){with(scope){try{return (record)}catch(_){return undefined}}},
function(scope){with(scope){try{return (record.summary)}catch(_){return undefined}}},
function(scope){with(scope){try{return (record.advice)}catch(_){return undefined}}},
function(scope){with(scope){try{return (canReply && record.status === 'CONFIRMED' && appointment.status === 'CONFIRMED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (!isStaff && record.status === 'CONFIRMED' && (appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED'))}catch(_){return undefined}}},
function(scope){with(scope){try{return (adviceIndex)}catch(_){return undefined}}},
function(scope){with(scope){try{return (record.advice[adviceIndex].content || '选择执行建议')}catch(_){return undefined}}},
function(scope){with(scope){try{return (feedbackContent)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!isStaff && (appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED'))}catch(_){return undefined}}},
function(scope){with(scope){try{return (noteContent)}catch(_){return undefined}}},
function(scope){with(scope){try{return (feedbacks)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.statusText === '待确认' ? '待回复' : item.statusText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.replies)}catch(_){return undefined}}},
function(scope){with(scope){try{return (reply.author.display_name || '老师')}catch(_){return undefined}}},
function(scope){with(scope){try{return (reply.content)}catch(_){return undefined}}},
function(scope){with(scope){try{return (canReply)}catch(_){return undefined}}},
function(scope){with(scope){try{return (replyContents[item.id])}catch(_){return undefined}}},
function(scope){with(scope){try{return (!feedbacks.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (feedbacks.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (nextFeedbackCursor ? '已加载' : '共')}catch(_){return undefined}}},
function(scope){with(scope){try{return (nextFeedbackCursor)}catch(_){return undefined}}},
function(scope){with(scope){try{return (allowed)}catch(_){return undefined}}},
function(scope){with(scope){try{return (canAccept)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.contact_name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.child_info.name || '待填写孩子信息')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.status === 'PENDING' ? '确认预约' : '查看资料、记录与反馈')}catch(_){return undefined}}},
function(scope){with(scope){try{return (!appointments.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.coverUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.isPaid ? classInfo.feeText + ' 报名' : '参加')}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.title)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.timeText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.placeText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.feeText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.deadlineText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!classInfo.canEnroll)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.closedReason)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.description || '课程详细介绍正在准备，请以工作人员的课程说明为准。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.notice || '报名后请留意工作人员联系，进群查看开课地址及参课安排。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.isPaid ? '完成缴费' : '提交报名')}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.isPaid)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!classInfo.canEnroll && (!enrollment || enrollment.status !== 'REGISTERED'))}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment && enrollment.status === 'REGISTERED' ? '查看我的报名' : classInfo.isPaid ? classInfo.feeText + ' 缴费报名' : '报名')}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo && classInfo.isPaid ? '完成缴费后才会报名成功。' : '本场，报名信息用于课程联系。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (referralName)}catch(_){return undefined}}},
function(scope){with(scope){try{return (referralBound ? '已记录推荐归属，不会被新链接覆盖' : '首次成功报名后记录推荐归属')}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.isPaid ? '点击下方按钮会先确认本场费用。支付成功后才可在“我的报名”查看入场凭证。' : '提交后可在“我的报名”查看进群指引及入场凭证。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (busy || loading || !classInfo.canEnroll)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.canEnroll ? classInfo.isPaid ? classInfo.feeText + ' 立即缴费报名' : '确认报名' : classInfo.closedReason)}catch(_){return undefined}}},
function(scope){with(scope){try{return (filters)}catch(_){return undefined}}},
function(scope){with(scope){try{return (filter === item.key ? 'active' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.key)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!loggedIn)}catch(_){return undefined}}},
function(scope){with(scope){try{return (items)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.stateText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.public_class.timeText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.registrant_name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.phoneMasked)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.stateText === '已取消' ? '查看记录' : '查看报名与入场凭证')}catch(_){return undefined}}},
function(scope){with(scope){try{return (loggedIn && !loading && !error && !items.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (success)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!loading && !loggedIn)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.public_class.title)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.public_class.timeText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.public_class.placeText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.stateText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.registrant_name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.phoneMasked)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.status === 'REGISTERED' && enrollment.attendance_status !== 'ATTENDED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.entryPayload)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.entry_code)}catch(_){return undefined}}},
function(scope){with(scope){try{return (qrError)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.attendance_status === 'ATTENDED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.verifiedText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.status === 'REGISTERED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.groupText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.public_class.group_guide || '工作人员将通过报名手机号联系你进群，课程地址在群内通知。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.public_class.group_qr.url)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.public_class.contact_phone)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.canCancel)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.city || '城市待补充')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.reserved_count || 0)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.capacity ? item.capacity + ' 个名额' : '不限名额')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.status !== 'DRAFT')}catch(_){return undefined}}},
function(scope){with(scope){try{return (!loading && !classes.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!loading && !allowed && !error)}catch(_){return undefined}}},
function(scope){with(scope){try{return (saveNotice)}catch(_){return undefined}}},
function(scope){with(scope){try{return (savedClass.status === 'PUBLISHED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.title)}catch(_){return undefined}}},
function(scope){with(scope){try{return (coverUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (uploading || busy)}catch(_){return undefined}}},
function(scope){with(scope){try{return (coverUrl ? '更换封面' : '上传封面')}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.description)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.city)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.date)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.date || '选择日期')}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.time)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.time || '选择时间')}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.capacity)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.registrationFee)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.closeDate)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.closeDate || '选择日期')}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.closeTime)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.closeTime || '选择时间')}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.closeDate || form.closeTime)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.checkinDate)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.checkinDate || '选择日期')}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.checkinTime)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.checkinTime || '选择时间')}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.checkinDate || form.checkinTime)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.groupGuide)}catch(_){return undefined}}},
function(scope){with(scope){try{return (groupQrUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (groupQrUrl ? '更换群二维码' : '上传群二维码')}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.contactPhone)}catch(_){return undefined}}},
function(scope){with(scope){try{return (form.notice)}catch(_){return undefined}}},
function(scope){with(scope){try{return (uploading)}catch(_){return undefined}}},
function(scope){with(scope){try{return (publishError)}catch(_){return undefined}}},
function(scope){with(scope){try{return (busy || uploading || loading)}catch(_){return undefined}}},
function(scope){with(scope){try{return (busy ? '正在保存课程…' : status === 'PUBLISHED' ? '保存已发布课程' : '发布课程')}catch(_){return undefined}}},
function(scope){with(scope){try{return (status === 'DRAFT')}catch(_){return undefined}}},
function(scope){with(scope){try{return (status !== 'DRAFT')}catch(_){return undefined}}},
function(scope){with(scope){try{return (hasSavedClass && !saveNotice && status !== 'DRAFT')}catch(_){return undefined}}},
function(scope){with(scope){try{return (hasSavedClass)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.title || '本场报名')}catch(_){return undefined}}},
function(scope){with(scope){try{return (stats.registered)}catch(_){return undefined}}},
function(scope){with(scope){try{return (stats.attended)}catch(_){return undefined}}},
function(scope){with(scope){try{return (stats.pending)}catch(_){return undefined}}},
function(scope){with(scope){try{return (scanCandidate)}catch(_){return undefined}}},
function(scope){with(scope){try{return (scanCandidate.registrant_name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (scanCandidate.phoneMasked)}catch(_){return undefined}}},
function(scope){with(scope){try{return (scanCandidate.public_class.title)}catch(_){return undefined}}},
function(scope){with(scope){try{return (scanCandidate.stateText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (busy || scanCandidate.attendance_status === 'ATTENDED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (scanCandidate.attendance_status === 'ATTENDED' ? '已核销，无需重复' : '确认实际到课')}catch(_){return undefined}}},
function(scope){with(scope){try{return (tabs)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.phone)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.status === 'REGISTERED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (busy || item.group_status === 'JOINED' || item.group_status === 'INVITED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (busy || item.group_status === 'JOINED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.attendance_status !== 'ATTENDED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.verifiedText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!loading && !items.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.title || '扫码进场')}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo ? classInfo.timeText : '选择课程，查看到场人数与入场名单')}catch(_){return undefined}}},
function(scope){with(scope){try{return (classId)}catch(_){return undefined}}},
function(scope){with(scope){try{return (stats.remaining)}catch(_){return undefined}}},
function(scope){with(scope){try{return (scanResult)}catch(_){return undefined}}},
function(scope){with(scope){try{return (scanResult.title)}catch(_){return undefined}}},
function(scope){with(scope){try{return (scanResult.name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (busy || loading)}catch(_){return undefined}}},
function(scope){with(scope){try{return (busy ? '正在处理…' : '扫码进场')}catch(_){return undefined}}},
function(scope){with(scope){try{return (candidate)}catch(_){return undefined}}},
function(scope){with(scope){try{return (candidate.name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (candidate.phoneMasked)}catch(_){return undefined}}},
function(scope){with(scope){try{return (candidate.attendanceStatus === 'ATTENDED' ? '此人已签到，重复扫码不会增加人数。' : '确认本人到场后，将登记到课并开放线下咨询申请资格。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (candidate.attendanceStatus === 'ATTENDED' ? '确认并查看最新人数' : '确认本人到场')}catch(_){return undefined}}},
function(scope){with(scope){try{return (isManager)}catch(_){return undefined}}},
function(scope){with(scope){try{return (staffOpen ? '收起签到人员设置' : '设置签到人员')}catch(_){return undefined}}},
function(scope){with(scope){try{return (staffOpen)}catch(_){return undefined}}},
function(scope){with(scope){try{return (staffError)}catch(_){return undefined}}},
function(scope){with(scope){try{return (staff)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.accountId)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!staff.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (staffSearch)}catch(_){return undefined}}},
function(scope){with(scope){try{return (staffLoading || busy)}catch(_){return undefined}}},
function(scope){with(scope){try{return (candidates)}catch(_){return undefined}}},
function(scope){with(scope){try{return (candidateCursor)}catch(_){return undefined}}},
function(scope){with(scope){try{return (classId ? '搜索报名人姓名' : '搜索课程名称')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.attendanceStatus === 'ATTENDED' ? '已签到' : '未签到')}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.attendanceStatus === 'ATTENDED')}catch(_){return undefined}}},
function(scope){with(scope){try{return (isManager ? '查看签到 / 设置人员' : '扫码进场')}catch(_){return undefined}}},
function(scope){with(scope){try{return (classId ? '当前条件下暂无报名记录。' : '暂无可签到的课程，请联系管理设置本场签到权限。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (loading || busy)}catch(_){return undefined}}},
function(scope){with(scope){try{return (courseTitle || '扫码后选择课程报名')}catch(_){return undefined}}},
function(scope){with(scope){try{return (shareUrl && !qrError)}catch(_){return undefined}}},
function(scope){with(scope){try{return (shareUrl)}catch(_){return undefined}}},
function(scope){with(scope){try{return (scope === 'own' ? 'active' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (scope === 'all' ? 'active' : '')}catch(_){return undefined}}},
function(scope){with(scope){try{return (scope === 'all' ? '全部推荐客户' : '我的推荐客户')}catch(_){return undefined}}},
function(scope){with(scope){try{return (total)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.customerName)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.referrerName)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.enrollments)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.courseTitle)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.statusText)}catch(_){return undefined}}},
function(scope){with(scope){try{return (enrollment.name)}catch(_){return undefined}}},
function(scope){with(scope){try{return (!item.enrollments.length)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.enrollments.length === 20)}catch(_){return undefined}}},
function(scope){with(scope){try{return (referrerName ? '推荐人：' + referrerName : '课程报名邀请')}catch(_){return undefined}}},
function(scope){with(scope){try{return (bound ? '已有推荐归属会继续保留，不会被新链接覆盖。' : '登录与刷新不会清除本次推荐来源，首次成功报名后确认归属。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (error ? '重新加载邀请' : '微信登录，继续报名')}catch(_){return undefined}}},
function(scope){with(scope){try{return (classInfo.status !== 'DRAFT')}catch(_){return undefined}}},
function(scope){with(scope){try{return (about ? '关于知守' : '帮助与支持')}catch(_){return undefined}}},
function(scope){with(scope){try{return (about ? '从理解开始，让关系慢慢变好。' : '找到报名、咨询和资料管理的帮助。')}catch(_){return undefined}}},
function(scope){with(scope){try{return (about)}catch(_){return undefined}}},
function(scope){with(scope){try{return (version)}catch(_){return undefined}}},
function(scope){with(scope){try{return (questions)}catch(_){return undefined}}},
function(scope){with(scope){try{return (item.answer)}catch(_){return undefined}}},
],modules:{
"utils/auth":function(require,module,exports,Page,wx,getApp,getCurrentPages){
// 统一登录门槛：所有业务操作（预约、聊天、支付等）必须先登录。
function getLoggedInUser() {
  const userInfo = wx.getStorageSync("userInfo") || {};
  const jwt = wx.getStorageSync("zionJwt") || "";
  if (userInfo.id && jwt) {
    return userInfo;
  }
  return null;
}

function isLoggedIn() {
  return Boolean(getLoggedInUser());
}

// 未登录时弹窗引导去登录页，返回是否已登录。
let prompting = false;
function requireLogin(message, options = {}) {
  if (isLoggedIn()) {
    return true;
  }

  if (prompting) return false;
  prompting = true;
  const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
  const returnPage = pages[pages.length - 1];
  wx.showModal({
    title: "请先登录",
    content: message || "登录后报名公开课、查看预约和咨询记录。",
    confirmText: "去登录",
    cancelText: "暂不登录",
    complete() { prompting = false; },
    success(res) {
      prompting = false;
      if (res.confirm) {
        require("./loginReturn").remember(returnPage, options);
        wx.switchTab({ url: "/pages/profile/profile" });
      } else {
        require("./loginReturn").clear();
      }
    }
  });
  return false;
}

function isAuthError(status, message) {
  return status === 401 || /unauthorized|unauthenticated|jwt|token.*expired|not authenticated|登录已过期|请先微信登录/i.test(String(message || ""));
}
function expire(token) {
  if(!token || wx.getStorageSync("zionJwt") !== token)return;
  const pages=typeof getCurrentPages === "function"?getCurrentPages():[];
  const page=pages[pages.length-1],user=wx.getStorageSync("userInfo") || {};
  const continuation=require("./loginReturn");
  continuation.remember(page,{accountId:user.id,preserveForm:true});
  ["zionJwt","userInfo","profileDraft","paidUntil","consultationSessionId","consultationOrderId","customerServiceBinding","currentChatRole","activeServiceProviderId","activeManagerAccountId","currentCustomerName","currentCustomerAvatarUrl","currentCustomerAvatarText"].forEach(k=>wx.removeStorageSync(k));
  for(const p of pages){
    if(p.route==='pages/profile/profile')p.setData({isLoggedIn:false,userInfo:{},serviceProvider:null,isServiceProvider:false,managerAccessLoading:false,accountBalanceText:'0.00'});
    if(p.route==='pages/chat/chat')p.setData({hasAccess:false,messages:[],input:'',failedMessage:'',sendError:'登录已过期，请重新登录。',sessionDrawerVisible:false,managerSessionList:[]});
  }
  if(!prompting && typeof wx.showModal==='function'){
    prompting=true;
    wx.showModal({title:'登录已过期',content:'请重新微信登录后继续，本页未提交的表单会为当前账号临时保留。',confirmText:'重新登录',cancelText:'稍后再说',
      success:r=>{prompting=false;if(r.confirm)wx.switchTab({url:'/pages/profile/profile'});},complete:()=>{prompting=false;}});
  }
}
module.exports = {getLoggedInUser,isLoggedIn,requireLogin,isAuthError,expire};

},
"utils/chatContext":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const payment = require("./payment");
const zion = require("./zion");

function applyCustomerChatStorage(options = {}) {
  const sessionId = options.sessionId || wx.getStorageSync("consultationSessionId");
  if (!sessionId) {
    throw new Error("missing consultation session id");
  }

  const orderId = options.orderId || wx.getStorageSync("consultationOrderId") || "";
  const expiresAt = options.expiresAt || wx.getStorageSync("currentSessionExpiresAt") || "";
  const startedAt = options.startedAt || wx.getStorageSync("currentSessionStartedAt") || "";

  wx.setStorageSync("currentChatRole", "customer");
  wx.removeStorageSync("chatReturnUrl");
  wx.removeStorageSync("chatReturnSource");
  wx.setStorageSync("consultationSessionId", String(sessionId));
  if (orderId) {
    wx.setStorageSync("consultationOrderId", String(orderId));
  }
  if (options.topic) {
    wx.setStorageSync("consultationTopic", options.topic);
  }
  if (startedAt) {
    wx.setStorageSync("currentSessionStartedAt", startedAt);
    wx.setStorageSync("currentSessionStartedSessionId", String(sessionId));
  } else {
    wx.removeStorageSync("currentSessionStartedAt");
    wx.removeStorageSync("currentSessionStartedSessionId");
  }
  if (expiresAt) {
    wx.setStorageSync("currentSessionExpiresAt", expiresAt);
    wx.setStorageSync("currentSessionExpiresSessionId", String(sessionId));
    payment.markConsultationPaidUntil(new Date(expiresAt).getTime());
  } else {
    wx.removeStorageSync("currentSessionExpiresAt");
    wx.removeStorageSync("currentSessionExpiresSessionId");
  }

  if (options.managerName) {
    wx.setStorageSync("currentManagerName", options.managerName);
    wx.setStorageSync("currentManagerAvatarText", options.managerAvatarText || options.managerName.slice(0, 1));
  }

  const userInfo = wx.getStorageSync("userInfo") || {};
  if (userInfo.nickName) {
    wx.setStorageSync("currentCustomerName", userInfo.nickName);
    wx.setStorageSync("currentCustomerAvatarUrl", userInfo.avatarUrl || "");
    wx.setStorageSync("currentCustomerAvatarText", userInfo.nickName.slice(0, 1));
  }

  return { sessionId, orderId, expiresAt, startedAt };
}

function switchToCustomerChat(options = {}) {
  wx.setStorageSync("clientViewMode", "customer");
  return applyCustomerChatStorage(options);
}

function resolveCustomerChatContext(options = {}) {
  if (options.sessionId) {
    return Promise.resolve({
      sessionId: String(options.sessionId),
      orderId: options.orderId ? String(options.orderId) : "",
      expiresAt: options.expiresAt || "",
      topic: options.topic || "",
      paidUntil: options.paidUntil || 0,
      managerName: options.managerName || "",
      managerAvatarText: options.managerAvatarText || ""
    });
  }

  const storedSessionId = wx.getStorageSync("consultationSessionId");
  if (storedSessionId) {
    return Promise.resolve({
      sessionId: String(storedSessionId),
      orderId: wx.getStorageSync("consultationOrderId") || "",
      expiresAt: wx.getStorageSync("currentSessionExpiresAt") || "",
      topic: wx.getStorageSync("consultationTopic") || "",
      paidUntil: payment.getPaidUntil(),
      managerName: wx.getStorageSync("currentManagerName") || "",
      managerAvatarText: wx.getStorageSync("currentManagerAvatarText") || ""
    });
  }

  const userInfo = wx.getStorageSync("userInfo") || {};
  if (!userInfo.id) {
    return Promise.reject(new Error("not logged in"));
  }

  return zion.getCustomerServiceBinding(userInfo.id)
    .then((binding) => zion.getBoundConsultationSession(userInfo.id, {
      serviceProviderId: binding && binding.serviceProviderId,
      advisorId: binding && binding.advisorId
    }))
    .then((session) => {
      if (!session || !session.id) {
        return Promise.reject(new Error("no bound session"));
      }
      return {
        sessionId: session.id,
        orderId: session.orderId || "",
        expiresAt: session.expiresAt || "",
        startedAt: session.startedAt || "",
        topic: session.topic || "",
        paidUntil: session.effectiveExpiresAt || 0,
        managerName: wx.getStorageSync("currentManagerName") || "",
        managerAvatarText: wx.getStorageSync("currentManagerAvatarText") || ""
      };
    });
}

function isManagerChatContext() {
  return wx.getStorageSync("currentChatRole") === "manager";
}

function isManagerChatEntry() {
  if (wx.getStorageSync("clientViewMode") === "customer") return false;
  const source = wx.getStorageSync("chatReturnSource");
  if (source === "manager-serving" || source === "manager-detail") {
    return true;
  }
  if (wx.getStorageSync("currentChatRole") === "manager") {
    return true;
  }
  if (wx.getStorageSync("activeServiceProviderId")) {
    return true;
  }
  return false;
}

function preserveManagerChatContext() {
  if (!isManagerChatEntry()) return false;
  wx.setStorageSync("currentChatRole", "manager");
  return true;
}

function resetCustomerTabContext() {
  const returnSource = wx.getStorageSync("chatReturnSource");
  if (returnSource === "manager-serving" || returnSource === "manager-detail") {
    return false;
  }
  wx.setStorageSync("currentChatRole", "customer");
  wx.removeStorageSync("chatReturnUrl");
  wx.removeStorageSync("chatReturnSource");
  return true;
}

function openChatPage(options = {}) {
  if (options.role === "manager") {
    wx.setStorageSync("clientViewMode", "manager");
    return wx.switchTab({ url: "/pages/chat/chat" });
  }

  return resolveCustomerChatContext(options)
    .then((context) => {
      switchToCustomerChat(context);
      return wx.switchTab({ url: "/pages/chat/chat" });
    })
    .catch(() => {
      wx.showToast({ title: "请先购买咨询", icon: "none" });
    });
}

function enterCustomerView() {
  const wasManager = isManagerChatEntry();
  wx.setStorageSync("clientViewMode", "customer");
  ["currentChatRole", "chatReturnUrl", "chatReturnSource", "activeServiceProviderId", "activeManagerAccountId"].forEach((key) => wx.removeStorageSync(key));
  if (wasManager) {
    ["consultationSessionId", "consultationOrderId", "consultationTopic", "currentSessionExpiresAt", "currentSessionExpiresSessionId", "currentSessionStartedAt", "currentSessionStartedSessionId", "currentSessionStatus", "currentCustomerName", "currentCustomerAvatarUrl", "currentCustomerAvatarText", "paidUntil"].forEach((key) => wx.removeStorageSync(key));
  }
  wx.setStorageSync("currentChatRole", "customer");
  wx.showTabBar({ animation: false });
}

module.exports = {
  enterCustomerView,
  switchToCustomerChat,
  resolveCustomerChatContext,
  openChatPage,
  isManagerChatContext,
  isManagerChatEntry,
  preserveManagerChatContext,
  resetCustomerTabContext
};

},
"utils/consultationRecording":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('./consultationService');
const {md5Base64}=require('./md5');
async function uploadAndSummarize(filePath,appointmentId,consentedAt){
 const bytes=await new Promise((resolve,reject)=>wx.getFileSystemManager().readFile({filePath,success:r=>resolve(r.data),fail:()=>reject(new Error('录音文件读取失败，请重新录制'))}));
 if(!bytes.byteLength||bytes.byteLength>10000000)throw new Error('录音应在10MB以内，请分段录制');
 const job=await service.call('PREPARE_RECORDING',{appointmentId,consentedAt,sizeBytes:bytes.byteLength,md5Base64:md5Base64(bytes),requestKey:service.requestKey()});
 const upload=job.upload;
 if(!upload||!/^https:\/\//.test(upload.uploadUrl))throw new Error('录音上传暂不可用');
 await new Promise((resolve,reject)=>wx.request({url:upload.uploadUrl,method:'PUT',data:bytes,timeout:120000,header:{'content-type':upload.contentType,...(upload.uploadHeaders||{})},success:r=>r.statusCode>=200&&r.statusCode<300?resolve():reject(new Error('录音上传失败，请重新录制')),fail:()=>reject(new Error('录音上传失败，请检查网络后重新录制'))}));
 try{return await service.call('PROCESS_RECORDING',{appointmentId,jobId:job.id});}catch(e){throw new Error('录音已上传，提交处理未完成。请刷新后点击“处理已上传录音”。');}
}
module.exports={uploadAndSummarize};

},
"utils/consultationService":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const auth = require('./auth');
const { readableError } = require('./serviceError');
const { ZION_GRAPHQL_URL } = require('./zion');
const ACTION_FLOW_ID = '9f60a0be-4628-4268-a769-661264846cf4';
const labels = {QUEUED:'排队中',AUDIO_PROCESSING:'正在转写与总结',PENDING:'待确认',REGISTERED:'已报名',ATTENDED:'已参加',ABSENT:'未到课',INVITED:'已邀请',JOINED:'已进群',CONFIRMED:'已确认',COMPLETED:'已完成',CANCELED:'已取消',DRAFT:'草稿',PUBLISHED:'报名中',CLOSED:'已结束',REPLIED:'已回复',UPLOADING:'待上传',PROCESSING:'正在总结',FAILED:'生成失败',READY:'待老师确认'};
function call(operation, payload = {}) {
  const token = wx.getStorageSync('zionJwt');
  if (!['LIST_CLASSES','GET_CLASS'].includes(operation) && !auth.isLoggedIn()) return Promise.reject(new Error('请先微信登录'));
  // The H5 server verifies the signed invitation and retains it across WeChat login.
  if (wx.isH5 && operation === 'ENROLL') return new Promise((resolve,reject) => wx.request({
    url:'/api/h5?action=enroll', method:'POST', timeout:30000, header:{'content-type':'application/json'},
    data:{classId:payload.classId,name:payload.name,phone:payload.phone,ref:wx.getReferralToken ? wx.getReferralToken() : ''},
    success(r){
      if(wx.getStorageSync('zionJwt')!==token){reject(new Error('登录身份已变化，请重试'));return;}
      if(r.statusCode===200&&r.data&&r.data.ok)resolve(r.data.data);
      else {if(r.statusCode===401)auth.expire(token);reject(new Error(readableError(r.data&&r.data.message)));}
    },fail:()=>reject(new Error('网络连接失败，请检查网络后重试'))
  }));
  return new Promise((resolve,reject) => wx.request({
    url: ZION_GRAPHQL_URL, method:'POST', timeout:30000,
    header: {'content-type':'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {})},
    data: {query:'mutation ConsultationService($args: Json!) { fz_invoke_action_flow(actionFlowId: "'+ACTION_FLOW_ID+'", versionId: 1, args: $args) }',variables:{args:{operation,payload}}},
    success(response) {
      if(token && wx.getStorageSync('zionJwt')!==token){reject(new Error('登录身份已变化，请重试'));return;}
      const body = response.data && typeof response.data === 'object' ? response.data : {};
      if (response.statusCode<200 || response.statusCode>=300 || body.errors) {
        const errors = body.errors;
        const message = errors && errors[0] && errors[0].message;
        if(auth.isAuthError(response.statusCode,message))auth.expire(token);
        reject(new Error(readableError(message))); return;
      }
      let output=body.data && body.data.fz_invoke_action_flow;
      if (typeof output==='string') { try {output=JSON.parse(output);} catch (_) {} }
      let result=output && (output.result || output);
      if (typeof result==='string') { try {result=JSON.parse(result);} catch (_) {} }
      if (!result || result.ok!==true) {if(auth.isAuthError(0,result && result.message))auth.expire(token);reject(new Error(readableError(result && result.message)));return;}
      resolve(result.data);
    }, fail: () => reject(new Error('网络连接失败，请检查网络后重试'))
  }));
}
function requestKey() { return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12); }
function formatTime(value) { if (!value) return '待安排'; const d=new Date(value); return isNaN(d.getTime()) ? value : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function decorate(item) { return {...item,statusText:labels[item.status]||item.status,attendanceText: item.attendance_status==='PENDING'?'待参加/待核实':labels[item.attendance_status],groupText:item.group_status==='PENDING'?'待联系':labels[item.group_status],timeText:formatTime(item.confirmed_at||item.starts_at),createdText:formatTime(item.created_at)}; }
function error(page, e) { page.setData({error:readableError(e && e.message)}); if(wx.pageScrollTo)wx.pageScrollTo({scrollTop:0,duration:200}); }
module.exports={call,requestKey,formatTime,decorate,labels,error};

},
"utils/courseContent":function(require,module,exports,Page,wx,getApp,getCurrentPages){
// Render the backend's plain-text course introduction without injecting HTML.
function courseSections(description) {
  const sections=[];
  let title='课程介绍', lines=[];
  function flush() {
    const body=lines.join('\n').trim();
    if(body)sections.push({title,body});
  }
  for(const line of String(description||'').split(/\r?\n/)) {
    const heading=line.match(/^##\s+(.+)$/);
    if(heading){flush();title=heading[1].trim();lines=[];}
    else lines.push(line);
  }
  flush();
  return sections;
}
module.exports={courseSections};

},
"utils/coursePayment":function(require,module,exports,Page,wx,getApp,getCurrentPages){
function request(action,data){return new Promise((resolve,reject)=>wx.request({url:'/api/h5?action='+action,method:'POST',data,timeout:60000,header:{'content-type':'application/json'},success:r=>r.statusCode===200&&r.data&&r.data.ok?resolve(r.data.data):reject(new Error(r.data&&r.data.message||'支付结果暂未确认，请稍后重试')),fail:()=>reject(new Error('网络异常，请稍后重新查询支付结果，不要重复付款'))}));}
function confirm(content){return new Promise(resolve=>wx.showModal({title:'确认缴费报名',content,confirmText:'去缴费',success:r=>resolve(!!r.confirm),fail:()=>resolve(false)}));}
async function enroll(payload,feeText){
  if(!wx.isH5||!wx.canUseCoursePayment||!wx.canUseCoursePayment())throw new Error('请在微信内打开课程网页完成缴费报名；如已在微信中，请刷新后重试');
  if(!await confirm(`本场课程报名费为 ${feeText}。完成支付并确认到账后才会报名成功。`))return null;
  const prepared=await request('course-pay',{...payload,ref:wx.getReferralToken?wx.getReferralToken():''});
  if(prepared.enrollment)return prepared;
  const order=prepared.order;
  if(!prepared.payment){if(order&&order.status==='PAID_REVIEW')throw new Error(order.message);throw new Error('订单已结束，请刷新页面后重新报名');}
  if('￥'+Number(order.amount).toFixed(2)!==feeText&&!await confirm(`当前待支付订单金额为 ￥${Number(order.amount).toFixed(2)}。是否继续支付？`))return null;
  let canceled=false;
  try{await new Promise((resolve,reject)=>wx.requestPayment({...prepared.payment,success:resolve,fail:reject}));}catch(e){canceled=/cancel/i.test(e.errMsg||e.message||'');}
  for(let i=0;i<(canceled?1:5);i++){
    const checked=await request('course-pay-status',{orderId:order.id});
    if(checked.enrollment&&checked.order.status==='PAID')return checked;
    if(checked.order.status==='PAID_REVIEW')throw new Error(checked.order.message);
    if(checked.order.status==='CLOSED')throw new Error('订单已关闭，请重新报名');
    if(!canceled)await new Promise(resolve=>setTimeout(resolve,2000));
  }
  throw new Error(canceled?'已取消支付，尚未报名；再次点击可继续缴费。':'支付结果正在确认。请稍后刷新或再次点击报名查询原订单，不要重复付款。');
}
module.exports={enroll,request};

},
"utils/coursePresentation":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const { decorate, formatTime } = require('./consultationService');

function classCard(value) {
  const c=decorate(value || {});
  const registrationFee=Math.max(0,Number(c.registration_fee||0));
  return {...c,registrationFee,feeText:registrationFee>0?`￥${registrationFee.toFixed(2)}`:'',isPaid:registrationFee>0, placeText:c.city ? c.city+' · 详细地址群内通知' : '详细地址将在课程群内通知',
    deadlineText:formatTime(c.registration_closes_at || c.starts_at),
    coverUrl:c.cover && c.cover.url || '', shareCodeUrl:c.share_code && c.share_code.url || ''};
}
function isUpcomingClass(value, now) {
  const startsAt=new Date(value && value.starts_at).getTime();
  return !!value && value.status==='PUBLISHED' && Number.isFinite(startsAt) && startsAt>(now == null ? Date.now() : now);
}
function enrollmentCard(value) {
  const e=decorate(value), active=e.status==='REGISTERED';
  const state=!active?'已取消':e.attendance_status==='ATTENDED'?'已参加':e.attendance_status==='ABSENT'?'未到课':'待参加';
  return {...e,public_class:classCard(e.public_class),stateText:state,
    phoneMasked:String(e.phone||'').replace(/^(\d{3})\d{4}(\d{4})$/,'$1****$2'),
    canCancel:active && e.attendance_status!=='ATTENDED' && new Date(e.public_class && e.public_class.starts_at).getTime()>Date.now(),
    entryPayload:active && e.entry_code ? 'EMPATH-ENTRY:'+e.entry_code : '',
    verifiedText:formatTime(e.verified_at)};
}
function dateParts(value) {
  if(!value)return {date:'',time:''};
  const parts=formatTime(value).split(' ');return {date:parts[0],time:parts[1]||''};
}
function iso(date,time) { return date&&time?`${date}T${time}:00+08:00`:null; }
// Share only saved, visible classes; an unloaded page or draft falls back to the course list.
function classShare(c) {
  if (!c || !c.id || !['PUBLISHED','CLOSED'].includes(c.status))
    return {title:'知守 · 公开课',path:'/pages/public-class/public-class'};
  const share={title:c.title || '知守 · 公开课',path:'/pages/public-class-detail/public-class-detail?id='+encodeURIComponent(String(c.id))};
  const cover=c.coverUrl || (c.cover && c.cover.url);
  if(cover)share.imageUrl=cover;
  return share;
}
module.exports={classCard,isUpcomingClass,enrollmentCard,dateParts,iso,classShare};

},
"utils/courseQr":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const qrcode=require('./vendor/qrcode');
function matrix(value) {
  const qr=qrcode(0,'M');qr.addData(value);qr.make();
  return Array.from({length:qr.getModuleCount()},(_,y)=>Array.from({length:qr.getModuleCount()},(_,x)=>qr.isDark(y,x)));
}
function draw(page,canvasId,value,size=256) {
  const cells=matrix(value), ctx=wx.createCanvasContext(canvasId,page),unit=size/(cells.length+8);
  ctx.setFillStyle('#ffffff');ctx.fillRect(0,0,size,size);ctx.setFillStyle('#183b35');
  cells.forEach((row,y)=>row.forEach((dark,x)=>{if(dark){const left=Math.round((x+4)*unit),top=Math.round((y+4)*unit);ctx.fillRect(left,top,Math.round((x+5)*unit)-left,Math.round((y+5)*unit)-top);}}));
  return new Promise(resolve=>ctx.draw(false,resolve));
}
module.exports={matrix,draw};

},
"utils/loginReturn":function(require,module,exports,Page,wx,getApp,getCurrentPages){
// One login continuation per app session. Personal form values are never persisted to storage.
const ALLOWED = new Set(['customer','public-class','public-class-detail','class-enroll','my-enrollments','class-ticket','course-manage','course-edit','course-roster','service-workbench','consultation-detail','advisor','profile-edit','chat']);
const MAX_AGE = 30 * 60 * 1000;
let pending = null;
let enrollmentDraft = null;
let restoredDraft = null;
function remember(page, options = {}) {
  pending = null;
  enrollmentDraft = null;
  restoredDraft = null;
  const route = page && page.route || '';
  const name = route.split('/')[1];
  if (!ALLOWED.has(name) || route !== `pages/${name}/${name}`) return;
  const id = page.options && page.options.id;
  if (id != null && !/^[1-9][0-9]*$/.test(String(id))) return;
  const url = '/' + route + (id ? '?id=' + encodeURIComponent(id) : '');
  pending = { url, name, id: String(id || ''), createdAt: Date.now() };
  if(options.preserveForm && options.accountId && page.data){
    const keys={chat:['input','failedMessage','sendError'],customer:['form','showForm'], 'class-enroll':['form'], 'course-edit':['form','coverUrl','groupQrUrl'],
      'consultation-detail':['childForm','recordForm','noteContent','feedbackContent','replyContents','confirmDate','confirmTime','staffNote'],
      'profile-edit':['avatarUrl','avatarImageId','userName','region','detailAddress','locationInfo','gender','genderIndex','birthday']}[name] || [];
    pending.accountId=String(options.accountId);
    if(name==='chat')pending.sessionId=String(wx.getStorageSync("consultationSessionId") || "");
    pending.draft=JSON.parse(JSON.stringify(Object.fromEntries(keys.filter(k=>page.data[k]!==undefined).map(k=>[k,page.data[k]]))));
  }
  if (name === 'class-enroll' && options.enrollmentForm) {
    pending.form = { name: String(options.enrollmentForm.name || '').slice(0,60), phone: String(options.enrollmentForm.phone || '').slice(0,11) };
  }
}
function resume() {
  const next = pending;
  pending = null;
  if (!next || Date.now() - next.createdAt > MAX_AGE) return false;
  const user=typeof wx.getStorageSync==='function'?(wx.getStorageSync('userInfo') || {}):{};
  if(next.draft && next.accountId===String(user.id || ''))restoredDraft={...next};
  const navigate=next.name==='chat'?wx.switchTab:wx.navigateTo;
  if (next.form) enrollmentDraft = { id: next.id, form: next.form, createdAt: Date.now() };
  navigate({url: next.url, fail: () => {
    enrollmentDraft = null;
    wx.showToast({title:'登录成功，请从首页重新进入课程',icon:'none'});
  }});
  return true;
}
function takeEnrollmentForm(id) {
  const draft = enrollmentDraft;
  enrollmentDraft = null;
  return draft && draft.id === String(id) && Date.now()-draft.createdAt <= MAX_AGE ? draft.form : null;
}
function restore(page,name,id) {
  const d=restoredDraft;
  if(!d || d.name!==name || d.id!==String(id || ''))return false;
  restoredDraft=null;
  const user=wx.getStorageSync('userInfo') || {};
  if(d.accountId!==String(user.id || '') || Date.now()-d.createdAt>MAX_AGE)return false;
  if(name==='chat' && d.sessionId!==String(wx.getStorageSync("consultationSessionId") || ""))return false;
  page.setData(d.draft);
  return true;
}
function clear() { pending = null; enrollmentDraft = null; restoredDraft = null; }
module.exports = { remember, resume, takeEnrollmentForm, restore, clear };

},
"utils/managerUnread":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const STORAGE_KEY = "managerSessionReadCursor";

function getReadCursors() {
  const stored = wx.getStorageSync(STORAGE_KEY);
  return stored && typeof stored === "object" ? stored : {};
}

function getReadCursor(sessionId) {
  return Number(getReadCursors()[String(sessionId)] || 0);
}

function markSessionRead(sessionId, lastMessageId) {
  if (!sessionId || !lastMessageId) return;
  const nextId = Number(lastMessageId);
  if (!nextId || Number.isNaN(nextId)) return;
  const cursors = getReadCursors();
  const prevId = Number(cursors[String(sessionId)] || 0);
  if (nextId <= prevId) return;
  cursors[String(sessionId)] = String(nextId);
  wx.setStorageSync(STORAGE_KEY, cursors);
}

function markSessionReadFromMessages(sessionId, messages) {
  if (!sessionId || !Array.isArray(messages) || !messages.length) return;
  const maxId = messages.reduce((max, item) => {
    const id = Number(item.id);
    return id > max ? id : max;
  }, 0);
  if (maxId) {
    markSessionRead(sessionId, maxId);
  }
}

function countUnreadCustomerMessages(sessionId, customerMessages) {
  const cursor = getReadCursor(sessionId);
  return (customerMessages || []).filter((item) => Number(item.id) > cursor).length;
}

function sumUnreadCounts(items) {
  return (items || []).reduce((total, item) => total + Number(item.unreadCount || 0), 0);
}

module.exports = {
  STORAGE_KEY,
  getReadCursors,
  getReadCursor,
  markSessionRead,
  markSessionReadFromMessages,
  countUnreadCustomerMessages,
  sumUnreadCounts
};

},
"utils/md5":function(require,module,exports,Page,wx,getApp,getCurrentPages){
/**
 * MD5 over an ArrayBuffer, returning the raw 16-byte digest Base64-encoded.
 * Zion 的 imagePresignedUrl 上传接口要求提供文件内容的 MD5（Base64 形式）。
 * 纯 JS 实现，无任何依赖，可直接在微信小程序环境运行。
 */

function safeAdd(x, y) {
  const lsw = (x & 0xffff) + (y & 0xffff);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xffff);
}

function rol(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

function cmn(q, a, b, x, s, t) {
  return safeAdd(rol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}

function ff(a, b, c, d, x, s, t) {
  return cmn((b & c) | (~b & d), a, b, x, s, t);
}

function gg(a, b, c, d, x, s, t) {
  return cmn((b & d) | (c & ~d), a, b, x, s, t);
}

function hh(a, b, c, d, x, s, t) {
  return cmn(b ^ c ^ d, a, b, x, s, t);
}

function ii(a, b, c, d, x, s, t) {
  return cmn(c ^ (b | ~d), a, b, x, s, t);
}

function bufferToWords(buffer) {
  const bytes = new Uint8Array(buffer);
  const bitLength = bytes.length * 8;
  const words = new Array(((bytes.length + 72) >> 6) * 16).fill(0);
  for (let i = 0; i < bytes.length; i += 1) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  words[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
  words[words.length - 2] = bitLength;
  return words;
}

function md5Core(words) {
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < words.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = ff(a, b, c, d, words[i + 0], 7, -680876936);
    d = ff(d, a, b, c, words[i + 1], 12, -389564586);
    c = ff(c, d, a, b, words[i + 2], 17, 606105819);
    b = ff(b, c, d, a, words[i + 3], 22, -1044525330);
    a = ff(a, b, c, d, words[i + 4], 7, -176418897);
    d = ff(d, a, b, c, words[i + 5], 12, 1200080426);
    c = ff(c, d, a, b, words[i + 6], 17, -1473231341);
    b = ff(b, c, d, a, words[i + 7], 22, -45705983);
    a = ff(a, b, c, d, words[i + 8], 7, 1770035416);
    d = ff(d, a, b, c, words[i + 9], 12, -1958414417);
    c = ff(c, d, a, b, words[i + 10], 17, -42063);
    b = ff(b, c, d, a, words[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, words[i + 12], 7, 1804603682);
    d = ff(d, a, b, c, words[i + 13], 12, -40341101);
    c = ff(c, d, a, b, words[i + 14], 17, -1502002290);
    b = ff(b, c, d, a, words[i + 15], 22, 1236535329);

    a = gg(a, b, c, d, words[i + 1], 5, -165796510);
    d = gg(d, a, b, c, words[i + 6], 9, -1069501632);
    c = gg(c, d, a, b, words[i + 11], 14, 643717713);
    b = gg(b, c, d, a, words[i + 0], 20, -373897302);
    a = gg(a, b, c, d, words[i + 5], 5, -701558691);
    d = gg(d, a, b, c, words[i + 10], 9, 38016083);
    c = gg(c, d, a, b, words[i + 15], 14, -660478335);
    b = gg(b, c, d, a, words[i + 4], 20, -405537848);
    a = gg(a, b, c, d, words[i + 9], 5, 568446438);
    d = gg(d, a, b, c, words[i + 14], 9, -1019803690);
    c = gg(c, d, a, b, words[i + 3], 14, -187363961);
    b = gg(b, c, d, a, words[i + 8], 20, 1163531501);
    a = gg(a, b, c, d, words[i + 13], 5, -1444681467);
    d = gg(d, a, b, c, words[i + 2], 9, -51403784);
    c = gg(c, d, a, b, words[i + 7], 14, 1735328473);
    b = gg(b, c, d, a, words[i + 12], 20, -1926607734);

    a = hh(a, b, c, d, words[i + 5], 4, -378558);
    d = hh(d, a, b, c, words[i + 8], 11, -2022574463);
    c = hh(c, d, a, b, words[i + 11], 16, 1839030562);
    b = hh(b, c, d, a, words[i + 14], 23, -35309556);
    a = hh(a, b, c, d, words[i + 1], 4, -1530992060);
    d = hh(d, a, b, c, words[i + 4], 11, 1272893353);
    c = hh(c, d, a, b, words[i + 7], 16, -155497632);
    b = hh(b, c, d, a, words[i + 10], 23, -1094730640);
    a = hh(a, b, c, d, words[i + 13], 4, 681279174);
    d = hh(d, a, b, c, words[i + 0], 11, -358537222);
    c = hh(c, d, a, b, words[i + 3], 16, -722521979);
    b = hh(b, c, d, a, words[i + 6], 23, 76029189);
    a = hh(a, b, c, d, words[i + 9], 4, -640364487);
    d = hh(d, a, b, c, words[i + 12], 11, -421815835);
    c = hh(c, d, a, b, words[i + 15], 16, 530742520);
    b = hh(b, c, d, a, words[i + 2], 23, -995338651);

    a = ii(a, b, c, d, words[i + 0], 6, -198630844);
    d = ii(d, a, b, c, words[i + 7], 10, 1126891415);
    c = ii(c, d, a, b, words[i + 14], 15, -1416354905);
    b = ii(b, c, d, a, words[i + 5], 21, -57434055);
    a = ii(a, b, c, d, words[i + 12], 6, 1700485571);
    d = ii(d, a, b, c, words[i + 3], 10, -1894986606);
    c = ii(c, d, a, b, words[i + 10], 15, -1051523);
    b = ii(b, c, d, a, words[i + 1], 21, -2054922799);
    a = ii(a, b, c, d, words[i + 8], 6, 1873313359);
    d = ii(d, a, b, c, words[i + 15], 10, -30611744);
    c = ii(c, d, a, b, words[i + 6], 15, -1560198380);
    b = ii(b, c, d, a, words[i + 13], 21, 1309151649);
    a = ii(a, b, c, d, words[i + 4], 6, -145523070);
    d = ii(d, a, b, c, words[i + 11], 10, -1120210379);
    c = ii(c, d, a, b, words[i + 2], 15, 718787259);
    b = ii(b, c, d, a, words[i + 9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return [a, b, c, d];
}

function wordsToBytes(words) {
  const bytes = [];
  for (let i = 0; i < words.length; i += 1) {
    for (let j = 0; j < 4; j += 1) {
      bytes.push((words[i] >>> (j * 8)) & 0xff);
    }
  }
  return bytes;
}

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function bytesToBase64(bytes) {
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    result += BASE64_CHARS[b0 >> 2];
    result += BASE64_CHARS[((b0 & 3) << 4) | (b1 >> 4)];
    result += i + 1 < bytes.length ? BASE64_CHARS[((b1 & 15) << 2) | (b2 >> 6)] : "=";
    result += i + 2 < bytes.length ? BASE64_CHARS[b2 & 63] : "=";
  }
  return result;
}

function md5Base64(arrayBuffer) {
  return bytesToBase64(wordsToBytes(md5Core(bufferToWords(arrayBuffer))));
}

module.exports = { md5Base64 };

},
"utils/mock":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const serenityImages = ["", "", ""];

const userPortrait = "https://lh3.googleusercontent.com/aida-public/AB6AXuB8wRsE4wfy7XQ6BGzxDX24neIKACENyIK4s7Hwrg50eFd8sRUBFcC1JeICM134ePoHG7M7H5a3vbL6h6RUcoZpNUL7KZ3f7mcRbtlfoEadVCPzByjxIEREAxf6Y_Wo4M_5plCmvhB7JpFekpkQiUIq62XH4PV80fBddutRqV1-SkVW7n0x47DGnzNAAVjaJb_OR1SpZ8FDr2FI7ybeczB40WZEIv3zA1MYsau91oBubehguHY6WsVm";

const advisors = [
  {
    id: "adv-001",
    name: "叶闻",
    title: "情感关系咨询师",
    company: "长期关系修复与沟通陪伴",
    avatarText: "叶",
    imageUrl: serenityImages[0],
    badge: "答主",
    tags: ["情感修复", "沟通分析", "长期关系"],
    topics: ["关系冷淡后如何重新沟通", "伴侣频繁争吵后的修复方式"],
    helped: 10,
    rating: 7.3,
    price: 200,
    bio: "擅长帮助来访者梳理关系矛盾、沟通误区和情绪需求，找到更稳定的相处方式。"
  },
  {
    id: "adv-002",
    name: "刘丽平",
    title: "亲密关系陪伴师",
    company: "婚恋关系与情绪支持",
    avatarText: "刘",
    imageUrl: serenityImages[1],
    badge: "答主",
    tags: ["婚恋关系", "情绪压力", "分手复盘"],
    topics: ["分手后是否还有修复空间", "恋爱中的安全感与边界感"],
    helped: 133,
    rating: 9.5,
    price: 200,
    bio: "长期陪伴婚恋与亲密关系议题，适合做情绪安抚、关系复盘和下一步沟通策略。"
  },
  {
    id: "adv-003",
    name: "星星老师",
    title: "情绪疗愈咨询师",
    company: "自我成长与依恋关系",
    avatarText: "星",
    imageUrl: serenityImages[2],
    badge: "答主",
    tags: ["情绪陪伴", "依恋模式", "自我成长"],
    topics: ["为什么总在关系里患得患失", "如何从内耗里慢慢走出来"],
    helped: 5,
    rating: 10,
    price: 200,
    bio: "风格温和，擅长陪你看见情绪背后的真实需求，减少内耗和关系中的反复拉扯。"
  },
  {
    id: "adv-004",
    name: "宋富强",
    title: "关系沟通咨询师",
    company: "冲突沟通与复合策略",
    avatarText: "宋",
    imageUrl: serenityImages[0],
    badge: "答主",
    tags: ["复合策略", "冲突沟通", "关系判断"],
    topics: ["对方突然冷淡该不该主动", "如何判断一段关系是否值得继续"],
    helped: 86,
    rating: 9.2,
    price: 200,
    bio: "擅长把复杂关系问题拆成可行动的沟通步骤，帮助你判断节奏、降低冲突。"
  }
];

const quickPrompts = [
  "我和对方最近越来越冷淡",
  "分手后我还想挽回怎么办？",
  "我总是在关系里没有安全感",
  "我们总是吵架，该怎么沟通？"
];

const courses = [
  {
    id: "course-001",
    title: "亲密关系沟通基础课",
    subtitle: "从冷战到有效对话的 7 天重建练习",
    coverUrl: serenityImages[0],
    durationText: "6小时32分",
    badge: "热门",
    chapters: [
      { id: "c1-1", title: "第一课：识别关系中的沟通陷阱", duration: "18:20" },
      { id: "c1-2", title: "第二课：从指责到表达的转换", duration: "24:05" },
      { id: "c1-3", title: "第三课：倾听与共情的练习", duration: "21:40" },
      { id: "c1-4", title: "第四课：冲突后的修复对话", duration: "28:15" }
    ]
  },
  {
    id: "course-002",
    title: "情绪内耗自救指南",
    subtitle: "减少反复想、睡不着、情绪起伏大的日常训练",
    coverUrl: serenityImages[2],
    durationText: "4小时18分",
    badge: "推荐",
    chapters: [
      { id: "c2-1", title: "第一课：什么是情绪内耗", duration: "12:30" },
      { id: "c2-2", title: "第二课：情绪命名的力量", duration: "16:45" },
      { id: "c2-3", title: "第三课：睡前放松三步法", duration: "19:20" }
    ]
  },
  {
    id: "course-003",
    title: "分手后关系复盘课",
    subtitle: "理性看待分手，找到下一段关系的起点",
    coverUrl: serenityImages[1],
    durationText: "5小时06分",
    badge: "",
    chapters: [
      { id: "c3-1", title: "第一课：分手后的情绪周期", duration: "15:10" },
      { id: "c3-2", title: "第二课：复盘不是翻旧账", duration: "22:35" }
    ]
  },
  {
    id: "course-004",
    title: "婚恋关系安全感建立",
    subtitle: "减少控制与试探，建立稳定信任",
    coverUrl: serenityImages[0],
    durationText: "7小时12分",
    badge: "新课",
    chapters: [
      { id: "c4-1", title: "第一课：你的依恋风格是什么", duration: "20:00" },
      { id: "c4-2", title: "第二课：焦虑型依恋的调节", duration: "26:40" }
    ]
  },
  {
    id: "course-005",
    title: "职场压力与情绪边界",
    subtitle: "工作再累，也不把情绪全部带回家",
    coverUrl: serenityImages[2],
    durationText: "3小时45分",
    badge: "",
    chapters: [
      { id: "c5-1", title: "第一课：情绪边界是什么", duration: "14:20" },
      { id: "c5-2", title: "第二课：下班前的 5 分钟切换", duration: "11:55" }
    ]
  },
  {
    id: "course-006",
    title: "父母沟通与家庭关系",
    subtitle: "减少代际冲突，建立成年子女边界",
    coverUrl: serenityImages[1],
    durationText: "4小时50分",
    badge: "",
    chapters: [
      { id: "c6-1", title: "第一课：为什么越长大越难沟通", duration: "17:30" },
      { id: "c6-2", title: "第二课：温和拒绝的练习", duration: "19:15" }
    ]
  }
];

const courseCategories = [];

module.exports = {
  advisors,
  courses,
  courseCategories,
  quickPrompts,
  serenityImages,
  userPortrait
};

},
"utils/payment":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const zion = require("./zion");

const CONSULTATION_PACKAGE = {
  skuId: "emotion_chat_60min",
  title: "1 小时情感咨询",
  minutes: 60,
  price: 200,
  amountFen: 20000
};
const DEV_SKIP_WECHAT_PAYMENT = false;

function getPaidUntil() {
  return Number(wx.getStorageSync("paidUntil") || 0);
}

function hasActiveConsultation() {
  return getPaidUntil() > Date.now();
}

function markConsultationPaid(minutes = 60) {
  const paidUntil = Date.now() + minutes * 60 * 1000;
  wx.setStorageSync("paidUntil", paidUntil);
  return paidUntil;
}

function markConsultationPaidUntil(timestamp) {
  const paidUntil = Number(timestamp || 0);
  if (paidUntil) {
    wx.setStorageSync("paidUntil", paidUntil);
  }
  return paidUntil;
}

function clearSessionTimerStorage() {
  wx.removeStorageSync("currentSessionExpiresAt");
  wx.removeStorageSync("currentSessionExpiresSessionId");
  wx.removeStorageSync("currentSessionStartedAt");
  wx.removeStorageSync("currentSessionStartedSessionId");
}

function applyPaidSessionStorage(session) {
  clearSessionTimerStorage();
  if (session && session.id) {
    wx.setStorageSync("consultationSessionId", session.id);
  }
}

function applyRenewedSessionStorage(sessionId, session, expiresAt) {
  wx.setStorageSync("consultationSessionId", sessionId);
  const startedAt = session && (session.started_at || session.startedAt);
  if (startedAt && expiresAt) {
    wx.setStorageSync("currentSessionStartedAt", startedAt);
    wx.setStorageSync("currentSessionStartedSessionId", String(sessionId));
    wx.setStorageSync("currentSessionExpiresAt", expiresAt);
    wx.setStorageSync("currentSessionExpiresSessionId", String(sessionId));
    return;
  }
  clearSessionTimerStorage();
  if (sessionId) {
    wx.setStorageSync("consultationSessionId", sessionId);
  }
}

function getConsultationPrice() {
  return Number(wx.getStorageSync("currentServicePrice") || CONSULTATION_PACKAGE.price);
}

function ensureWechatLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => resolve(res.code),
      fail: reject
    });
  });
}

function showBindingBlocked(message, options = {}) {
  wx.showModal({
    title: options.title || "无法预约",
    content: message || "你已绑定专属咨询师，不能预约其他老师。",
    showCancel: false
  });
}

function cacheCustomerBinding(binding) {
  if (binding && binding.advisorId) {
    wx.setStorageSync("customerServiceBinding", binding);
    if (binding.consultationSessionId) {
      wx.setStorageSync("consultationSessionId", binding.consultationSessionId);
    }
  } else {
    wx.removeStorageSync("customerServiceBinding");
  }
}

function startConsultationPayment({ advisorId, advisorName, remark } = {}) {
  const userInfo = wx.getStorageSync("userInfo") || {};
  const args = arguments[0] || {};
  const servicePrice = Number(args.price || wx.getStorageSync("currentServicePrice") || CONSULTATION_PACKAGE.price);
  const serviceMinutes = Number(args.minutes || wx.getStorageSync("currentServiceMinutes") || CONSULTATION_PACKAGE.minutes);
  const packageData = {
    ...CONSULTATION_PACKAGE,
    minutes: serviceMinutes,
    price: servicePrice,
    amountFen: Math.round(servicePrice * 100)
  };

  const prepareBooking = () => zion.assertCanBookAdvisor(userInfo.id, advisorId)
    .then((check) => {
      if (!check.allowed) {
        const error = new Error(check.message);
        error.code = check.reason === "manager" ? "MANAGER_BLOCKED" : "BINDING_BLOCKED";
        throw error;
      }
      return zion.resolveAdvisorServiceProvider(advisorId).then((resolved) => ({
        check,
        resolved
      }));
    });

  const finalizeBinding = (check, resolved, result) => {
    if (check && check.binding && check.binding.advisorId) {
      cacheCustomerBinding(check.binding);
      return result;
    }
    return zion.ensureCustomerServiceBinding({
      customerAccountId: userInfo.id,
      advisorId: resolved.advisorId,
      serviceProviderId: resolved.serviceProviderId
    }).then((binding) => {
      cacheCustomerBinding(binding);
      return result;
    }).catch((error) => {
      if (error && error.code === "BINDING_CONFLICT") {
        showBindingBlocked(error.message);
      }
      return result;
    });
  };

  if (DEV_SKIP_WECHAT_PAYMENT) {
    return prepareBooking()
      .then(({ check, resolved }) => zion.createPaymentOrder({
        ...packageData,
        advisorId: resolved.advisorId,
        advisorName: resolved.advisorName || advisorName,
        remark,
        customerAccountId: userInfo.id,
        problemCategory: "恋爱情感",
        issueSummary: remark,
        source: "miniapp-dev"
      })
        .then((res) => {
          const orderId = res && (res.orderId || (res.data && res.data.orderId));
          return zion.confirmPayment(orderId, {
            customerAccountId: userInfo.id,
            advisorId: resolved.advisorId,
            managerAccountId: resolved.managerAccountId,
            serviceProviderId: resolved.serviceProviderId,
            minutes: serviceMinutes,
            sessionStatus: "waiting",
            topic: remark,
            source: "miniapp-dev",
            customerNickname: userInfo.nickName || "微信用户",
            customerAvatarUrl: userInfo.avatarUrl || ""
          }).then((confirmRes) => {
            const session = confirmRes && confirmRes.session;
            const paidUntil = markConsultationPaid(serviceMinutes);
            wx.setStorageSync("consultationOrderId", orderId);
            applyPaidSessionStorage(session);
            wx.setStorageSync("currentManagerName", resolved.advisorName || advisorName || "");
            const result = { orderId, session, paidUntil, devPayment: true };
            return finalizeBinding(check, resolved, result);
          });
        }))
      .catch((error) => {
        if (error && (error.code === "BINDING_BLOCKED" || error.code === "MANAGER_BLOCKED")) {
          showBindingBlocked(error.message);
          throw error;
        }
        if (error && error.code === "MISSING_SERVICE_PROVIDER") {
          wx.showModal({
            title: "暂时无法预约",
            content: error.message,
            showCancel: false
          });
          throw error;
        }
        console.warn("dev payment backend write failed, continue local flow", error);
        const paidUntil = markConsultationPaid(serviceMinutes);
        const localOrderId = `local_${Date.now()}`;
        wx.setStorageSync("consultationOrderId", localOrderId);
        clearSessionTimerStorage();
        return {
          orderId: localOrderId,
          session: null,
          paidUntil,
          devPayment: true,
          localOnly: true
        };
      });
  }

  return prepareBooking()
    .then(({ check, resolved }) => ensureWechatLogin()
      .then((code) => zion.createPaymentOrder({
        ...packageData,
        advisorId: resolved.advisorId,
        advisorName: resolved.advisorName || advisorName,
        remark,
        loginCode: code
      }))
      .then((res) => {
        const payParams = res && (res.payParams || (res.data && res.data.payParams));
        const orderId = res && (res.orderId || (res.data && res.data.orderId));

        if (!payParams) {
          throw new Error("missing pay params");
        }

        return new Promise((resolve, reject) => {
          wx.requestPayment({
            ...payParams,
            success: () => {
              zion.confirmPayment(orderId, {
                customerAccountId: userInfo.id,
                advisorId: resolved.advisorId,
                managerAccountId: resolved.managerAccountId,
                serviceProviderId: resolved.serviceProviderId,
                minutes: serviceMinutes,
                sessionStatus: "waiting",
                topic: remark,
                source: "miniapp",
                customerNickname: userInfo.nickName || "微信用户",
                customerAvatarUrl: userInfo.avatarUrl || ""
              }).then((confirmRes) => {
                const session = confirmRes && confirmRes.session;
                const paidUntil = markConsultationPaid(serviceMinutes);
                wx.setStorageSync("consultationOrderId", orderId);
                applyPaidSessionStorage(session);
                wx.setStorageSync("currentManagerName", resolved.advisorName || advisorName || "");
                return finalizeBinding(check, resolved, { orderId, session, paidUntil });
              }).then(resolve).catch(reject);
            },
            fail: reject
          });
        });
      }))
    .catch((error) => {
      if (error && (error.code === "BINDING_BLOCKED" || error.code === "MANAGER_BLOCKED")) {
        showBindingBlocked(error.message);
      }
      throw error;
    });
}

function renewConsultationPayment({ sessionId, minutes, price } = {}) {
  const userInfo = wx.getStorageSync("userInfo") || {};
  const activeSessionId = sessionId || wx.getStorageSync("consultationSessionId");
  const servicePrice = Number(price || wx.getStorageSync("currentServicePrice") || CONSULTATION_PACKAGE.price);
  const serviceMinutes = Number(minutes || wx.getStorageSync("currentServiceMinutes") || CONSULTATION_PACKAGE.minutes);
  const packageData = {
    ...CONSULTATION_PACKAGE,
    minutes: serviceMinutes,
    price: servicePrice,
    amountFen: Math.round(servicePrice * 100)
  };

  if (!activeSessionId) {
    return Promise.reject(new Error("missing consultation session"));
  }

  if (DEV_SKIP_WECHAT_PAYMENT) {
    return zion.createPaymentOrder({
      ...packageData,
      customerAccountId: userInfo.id,
      remark: `续费 ${serviceMinutes} 分钟聊天`,
      problemCategory: "续费",
      issueSummary: `续费 ${serviceMinutes} 分钟聊天`,
      source: "miniapp-renewal"
    }).then((res) => {
      const orderId = res && (res.orderId || (res.data && res.data.orderId));
      return zion.confirmSessionRenewal(orderId, {
        sessionId: activeSessionId,
        minutes: serviceMinutes
      }).then((renewRes) => {
        const session = renewRes.session;
        const expiresAt = renewRes.expiresAt || (session && (session.expires_at || session.expiresAt));
        if (expiresAt) {
          markConsultationPaidUntil(new Date(expiresAt).getTime());
        } else {
          clearSessionTimerStorage();
        }
        wx.setStorageSync("consultationOrderId", orderId);
        applyRenewedSessionStorage(activeSessionId, session, expiresAt);
        return {
          orderId,
          sessionId: activeSessionId,
          expiresAt: expiresAt || "",
          paidUntil: expiresAt ? new Date(expiresAt).getTime() : 0,
          devPayment: true,
          renewal: true
        };
      });
    });
  }

  return ensureWechatLogin()
    .then((code) => zion.createPaymentOrder({
      ...packageData,
      customerAccountId: userInfo.id,
      remark: `续费 ${serviceMinutes} 分钟聊天`,
      problemCategory: "续费",
      issueSummary: `续费 ${serviceMinutes} 分钟聊天`,
      source: "miniapp-renewal",
      loginCode: code
    }))
    .then((res) => {
      const payParams = res && (res.payParams || (res.data && res.data.payParams));
      const orderId = res && (res.orderId || (res.data && res.data.orderId));

      if (!payParams) {
        throw new Error("missing pay params");
      }

      return new Promise((resolve, reject) => {
        wx.requestPayment({
          ...payParams,
          success: () => {
            zion.confirmSessionRenewal(orderId, {
              sessionId: activeSessionId,
              minutes: serviceMinutes
            }).then((renewRes) => {
              const session = renewRes.session;
              const expiresAt = renewRes.expiresAt || (session && (session.expires_at || session.expiresAt));
              if (expiresAt) {
                markConsultationPaidUntil(new Date(expiresAt).getTime());
              } else {
                clearSessionTimerStorage();
              }
              wx.setStorageSync("consultationOrderId", orderId);
              applyRenewedSessionStorage(activeSessionId, session, expiresAt);
              resolve({
                orderId,
                sessionId: activeSessionId,
                expiresAt: expiresAt || "",
                paidUntil: expiresAt ? new Date(expiresAt).getTime() : 0,
                renewal: true
              });
            }).catch(reject);
          },
          fail: reject
        });
      });
    });
}

function showPaymentUnavailable() {
  wx.showModal({
    title: "暂未接通微信支付",
    content: "前端已改成先支付后聊天。还需要开通微信支付商户号，并让 Zion 后端创建订单后返回支付参数。",
    showCancel: false
  });
}

module.exports = {
  CONSULTATION_PACKAGE,
  getConsultationPrice,
  getPaidUntil,
  hasActiveConsultation,
  markConsultationPaid,
  markConsultationPaidUntil,
  startConsultationPayment,
  renewConsultationPayment,
  showPaymentUnavailable
};

},
"utils/referral":function(require,module,exports,Page,wx,getApp,getCurrentPages){
function context(classId) {
  if (wx.getReferralContext) return wx.getReferralContext(classId);
  return require('./consultationService').call('REFERRAL_OVERVIEW');
}
module.exports = {context};

},
"utils/referralPoster":function(require,module,exports,Page,wx,getApp,getCurrentPages){
// Deterministic, self-contained PNG: the link is encoded in the QR, never printed.
const {matrix}=require('./courseQr');
function poster(canvas,{url,title='知守课程报名',name=''}) {
 canvas.width=750;canvas.height=1060;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('二维码图片生成失败，请刷新后重试');
 ctx.fillStyle='#fbf9f8';ctx.fillRect(0,0,750,1060);
 ctx.fillStyle='#123b35';ctx.font='bold 32px sans-serif';ctx.fillText('知守 · 课程邀请',60,78);
 ctx.font='bold 38px sans-serif';
 const chars=Array.from(String(title).slice(0,80));let lines=[''];
 for(const char of chars){let index=lines.length-1;if(ctx.measureText(lines[index]+char).width>620){if(lines.length===2){lines[1]=lines[1].slice(0,-1)+'…';break;}lines.push(char);}else lines[index]+=char;}
 lines.forEach((line,i)=>ctx.fillText(line,60,146+i*54));
 const cells=matrix(url),size=570,offsetX=90,offsetY=235,unit=size/(cells.length+8);
 ctx.fillStyle='#fff';ctx.fillRect(offsetX,offsetY,size,size);ctx.fillStyle='#123b35';
 cells.forEach((row,y)=>row.forEach((dark,x)=>{if(dark){const left=Math.round((x+4)*unit),top=Math.round((y+4)*unit);ctx.fillRect(offsetX+left,offsetY+top,Math.round((x+5)*unit)-left,Math.round((y+5)*unit)-top);}}));
 ctx.textAlign='center';ctx.font='bold 30px sans-serif';ctx.fillText('微信扫一扫 / 长按识别二维码',375,865);
 ctx.font='25px sans-serif';ctx.fillText(/[?&]ref=/.test(url)?'登录后进入课程，推荐信息自动保留':'微信内打开课程，查看详情并报名',375,914);
 if(name){ctx.font='24px sans-serif';ctx.fillText('分享人：'+Array.from(String(name)).slice(0,18).join(''),375,966);}
 return canvas.toDataURL('image/png');
}
module.exports={poster};

},
"utils/serviceError":function(require,module,exports,Page,wx,getApp,getCurrentPages){
// Translate infrastructure failures without exposing server internals to families.
function readableError(value) {
  const raw = String(value || '').trim();
  // Zion wraps deliberate validation failures in a Java exception. Only unwrap
  // known course/auth messages; infrastructure details must remain hidden.
  const wrapped = raw.match(/^(?:org\.graalvm\.polyglot\.)?PolyglotException:\s*Error:\s*([^\r\n]+)(?:[\r\n][\s\S]*)?$/);
  const known = new Set(['请先微信登录','当前账号没有这项工作人员权限','只能管理本人负责的公开课','课程状态无效','名额请输入0至10000的整数，0表示不限','名额不能少于已报名人数','已有报名的课程请结束报名，不能改回草稿','报名链接须使用https地址','发布前请填写开课时间','报名截止时间不能晚于开课时间','签到截止时间不能早于开课时间','请选择未来的开课时间再发布','课程已被更新，请刷新后再修改','请填写有效的11位手机号','状态已变化，请刷新后重试','记录不存在或已不可用','数据保存失败，请重试']);
  const safeCourseField = /^(课程名称|课程说明|进群指引|报名链接|开课城市|参课须知)填写不完整或过长$|^(开课时间|报名截止时间|签到截止时间)无效$|^报名费用请填写0至999999\.99元，最多两位小数$|^本场报名费为￥\d+(?:\.\d{2})，需先完成缴费，支付成功后才会报名成功$/;
  const business = wrapped && wrapped[1].trim();
  const message = business && (known.has(business) || safeCourseField.test(business)) ? business : raw;
  if (/action\s*flow\s*not\s*found/i.test(message)) {
    return '报名与咨询服务暂未开放，请稍后再试。';
  }
  if (/timeout|timed\s*out/i.test(message)) return '连接超时，请稍后重试。';
  if (/unauthorized|jwt|token.*expired|not authenticated/i.test(message)) {
    return '登录已过期，请重新微信登录。';
  }
  if (/forbidden|permission denied|no permission/i.test(message)) {
    return '当前账号暂时无法使用这项服务，请联系工作人员。';
  }
  if (!message || /graphql|sql|exception|stack|actionflow|internal.server|\bat\s+\S+\.js/i.test(message)
      || !/[\u4e00-\u9fff]/.test(message)) {
    return '服务暂时无法连接，请稍后重试。';
  }
  return message.slice(0, 250);
}
module.exports = { readableError };

},
"utils/testCustomerPreview":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const zion = require("./zion");
const payment = require("./payment");
const chatContext = require("./chatContext");

const TEST_CUSTOMER_ACCOUNT_ID = "1000000000000002";
const TEST_CUSTOMER_FALLBACK = {
  nickName: "测试客户小安",
  avatarUrl: "https://api.dicebear.com/7.x/thumbs/png?seed=test-customer-xiaoan"
};
const PREVIEW_ACTIVE_KEY = "testCustomerPreviewActive";
const PREVIEW_BACKUP_KEY = "testCustomerPreviewBackup";

function isActive() {
  return Boolean(wx.getStorageSync(PREVIEW_ACTIVE_KEY));
}

function readBackup() {
  return wx.getStorageSync(PREVIEW_BACKUP_KEY) || null;
}

function snapshotCurrentState() {
  return {
    userInfo: wx.getStorageSync("userInfo") || null,
    customerServiceBinding: wx.getStorageSync("customerServiceBinding") || null,
    consultationSessionId: wx.getStorageSync("consultationSessionId") || "",
    consultationOrderId: wx.getStorageSync("consultationOrderId") || "",
    consultationTopic: wx.getStorageSync("consultationTopic") || "",
    currentChatRole: wx.getStorageSync("currentChatRole") || "",
    chatReturnUrl: wx.getStorageSync("chatReturnUrl") || "",
    chatReturnSource: wx.getStorageSync("chatReturnSource") || "",
    activeServiceProviderId: wx.getStorageSync("activeServiceProviderId") || "",
    activeManagerAccountId: wx.getStorageSync("activeManagerAccountId") || "",
    currentManagerName: wx.getStorageSync("currentManagerName") || "",
    currentManagerAvatarText: wx.getStorageSync("currentManagerAvatarText") || "",
    currentCustomerName: wx.getStorageSync("currentCustomerName") || "",
    currentCustomerAvatarUrl: wx.getStorageSync("currentCustomerAvatarUrl") || "",
    currentCustomerAvatarText: wx.getStorageSync("currentCustomerAvatarText") || "",
    currentSessionExpiresAt: wx.getStorageSync("currentSessionExpiresAt") || "",
    currentSessionExpiresSessionId: wx.getStorageSync("currentSessionExpiresSessionId") || "",
    paidUntil: wx.getStorageSync("paidUntil") || 0
  };
}

function applyBackup(backup) {
  if (!backup) return;

  if (backup.userInfo) {
    wx.setStorageSync("userInfo", backup.userInfo);
  }
  if (backup.customerServiceBinding) {
    wx.setStorageSync("customerServiceBinding", backup.customerServiceBinding);
  } else {
    wx.removeStorageSync("customerServiceBinding");
  }

  const restoreKey = (key, value) => {
    if (value !== undefined && value !== null && value !== "") {
      wx.setStorageSync(key, value);
    } else {
      wx.removeStorageSync(key);
    }
  };

  restoreKey("consultationSessionId", backup.consultationSessionId);
  restoreKey("consultationOrderId", backup.consultationOrderId);
  restoreKey("consultationTopic", backup.consultationTopic);
  restoreKey("currentChatRole", backup.currentChatRole);
  restoreKey("chatReturnUrl", backup.chatReturnUrl);
  restoreKey("chatReturnSource", backup.chatReturnSource);
  restoreKey("activeServiceProviderId", backup.activeServiceProviderId);
  restoreKey("activeManagerAccountId", backup.activeManagerAccountId);
  restoreKey("currentManagerName", backup.currentManagerName);
  restoreKey("currentManagerAvatarText", backup.currentManagerAvatarText);
  restoreKey("currentCustomerName", backup.currentCustomerName);
  restoreKey("currentCustomerAvatarUrl", backup.currentCustomerAvatarUrl);
  restoreKey("currentCustomerAvatarText", backup.currentCustomerAvatarText);
  restoreKey("currentSessionExpiresAt", backup.currentSessionExpiresAt);
  restoreKey("currentSessionExpiresSessionId", backup.currentSessionExpiresSessionId);

  if (backup.paidUntil) {
    payment.markConsultationPaidUntil(Number(backup.paidUntil));
  } else {
    wx.removeStorageSync("paidUntil");
  }
}

function clearManagerContext() {
  wx.setStorageSync("currentChatRole", "customer");
  wx.removeStorageSync("chatReturnUrl");
  wx.removeStorageSync("chatReturnSource");
  wx.removeStorageSync("activeServiceProviderId");
  wx.removeStorageSync("activeManagerAccountId");
}

function enter() {
  if (isActive()) {
    return Promise.resolve({ alreadyActive: true });
  }

  wx.setStorageSync(PREVIEW_BACKUP_KEY, snapshotCurrentState());
  wx.setStorageSync(PREVIEW_ACTIVE_KEY, true);

  return zion.getAccountProfile(TEST_CUSTOMER_ACCOUNT_ID)
    .then((profile) => {
      const user = {
        id: TEST_CUSTOMER_ACCOUNT_ID,
        nickName: (profile && profile.nickName) || TEST_CUSTOMER_FALLBACK.nickName,
        avatarUrl: (profile && profile.avatarUrl) || TEST_CUSTOMER_FALLBACK.avatarUrl,
        role: "customer",
        phone: (profile && profile.phone) || ""
      };
      wx.setStorageSync("userInfo", user);
      wx.setStorageSync("currentCustomerName", user.nickName);
      wx.setStorageSync("currentCustomerAvatarUrl", user.avatarUrl);
      wx.setStorageSync("currentCustomerAvatarText", user.nickName.slice(0, 1));
      clearManagerContext();
      return zion.getCustomerServiceBinding(TEST_CUSTOMER_ACCOUNT_ID);
    })
    .then((binding) => {
      if (binding && binding.advisorId) {
        wx.setStorageSync("customerServiceBinding", binding);
      }
      if (binding && binding.advisorName) {
        wx.setStorageSync("currentManagerName", binding.advisorName);
        wx.setStorageSync("currentManagerAvatarText", binding.advisorName.slice(0, 1));
      }
      return chatContext.resolveCustomerChatContext(
        binding && binding.consultationSessionId
          ? { sessionId: binding.consultationSessionId }
          : {}
      );
    })
    .then((context) => {
      chatContext.switchToCustomerChat({
        ...context,
        managerName: wx.getStorageSync("currentManagerName") || "曜恺",
        managerAvatarText: wx.getStorageSync("currentManagerAvatarText") || "曜"
      });
      return context;
    });
}

function exit() {
  if (!isActive()) {
    return Promise.resolve({ alreadyInactive: true });
  }

  const backup = readBackup();
  applyBackup(backup);
  wx.removeStorageSync(PREVIEW_ACTIVE_KEY);
  wx.removeStorageSync(PREVIEW_BACKUP_KEY);
  return Promise.resolve({ restored: true });
}

module.exports = {
  TEST_CUSTOMER_ACCOUNT_ID,
  TEST_CUSTOMER_FALLBACK,
  isActive,
  enter,
  exit
};

},
"utils/vendor/qrcode":function(require,module,exports,Page,wx,getApp,getCurrentPages){
//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (typeof define === 'function' && define.amd) {
      define([], factory);
  } else if (typeof exports === 'object') {
      module.exports = factory();
  }
}(function () {
    return qrcode;
}));

},
"utils/viewSession":function(require,module,exports,Page,wx,getApp,getCurrentPages){
// Bind asynchronous UI work to the identity and conversation that started it.
function capture() {
  const user = wx.getStorageSync('userInfo') || {};
  return {
    accountId: String(user.id || ''),
    token: wx.getStorageSync('zionJwt') || '',
    sessionId: String(wx.getStorageSync('consultationSessionId') || ''),
    role: wx.getStorageSync('currentChatRole') || 'customer'
  };
}
function current(snapshot, conversation = false) {
  const now = capture();
  return !!snapshot && snapshot.accountId === now.accountId && snapshot.token === now.token
    && (!conversation || (snapshot.sessionId === now.sessionId && snapshot.role === now.role));
}
module.exports = { capture, current };

},
"utils/zion":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const PROJECT_ID = "JmAxbl1MMe4";
const WECHAT_APP_ID = "wx35d600312d9c89f3";
const ZION_WEB_URL = "https://zion.functorz.com/tool/JmAxbl1MMe4/WECHAT";
const ZION_GRAPHQL_URL = "https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2";
const WECHAT_LOGIN_CLOUD_FUNCTION = "wechatLogin";
const WECHAT_LOGIN_BRIDGE_URL = "";
const WECHAT_LOGIN_ACTION_FLOW_ID = "4e0d236b-9a2c-4510-9c73-8cdade71e9e3";
const WECHAT_LOGIN_ACTION_FLOW_VERSION = 1;
const CHAT_SESSION_STORAGE_KEY = "consultationSessionId";
const APP_VERSION = "1";
const DEFAULT_MANAGER_ACCOUNT_ID = "1000000000000010";
const DEFAULT_MANAGER_SERVICE_PROVIDER_ID = "1";
const ACCOUNT_PROFILE_KEY = "account_profile";
const LEGACY_ACCOUNT_PROFILE_KEY = "serenity_profile";
const DEFAULT_MANAGER_IDENTITY = {
  user: {
    id: DEFAULT_MANAGER_ACCOUNT_ID,
    nickName: "刘曜恺",
    avatarUrl: "",
    role: "manager",
    phone: "",
    username: "刘曜恺"
  },
  serviceProvider: {
    id: DEFAULT_MANAGER_SERVICE_PROVIDER_ID,
    accountId: DEFAULT_MANAGER_ACCOUNT_ID,
    displayName: "刘曜恺",
    title: "情感咨询经理",
    avatarUrl: "https://api.dicebear.com/7.x/thumbs/png?seed=manager-linjing",
    bio: "",
    specialties: [],
    serviceStatus: "ACTIVE",
    verified: true,
    canReply: true,
    canAcceptOrder: true,
    onlineStatus: "online",
    rating: "4.9",
    pricePerHour: 200,
    serviceMinutes: 60,
    todayWaitingCount: 0,
    activeSessionCount: 0,
    todayIncome: 0,
    totalIncome: 12800
  }
};

function cloneDefaultManagerIdentity() {
  return JSON.parse(JSON.stringify(DEFAULT_MANAGER_IDENTITY));
}

function isDefaultManagerAccount(accountId) {
  return String(accountId || "") === DEFAULT_MANAGER_ACCOUNT_ID;
}

function makeClientMessageId() {
  return `miniapp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

const MANAGER_RECALL_WINDOW_MS = 60 * 1000;

const CONSULTATION_MESSAGE_FIELDS = `
        id
        session_id
        sender_account_id
        sender_role
        content
        content_type
        sent_at
        is_recalled
        recalled_at
        recalled_by_account_id
        recalled_content
        visible_to_customer
        replaces_message_id
        replaced_by_message_id
`;

function isSchemaCompatibilityError(error) {
  return /field|column|validation|unknown|not found|does not exist|unexpected/i.test(String(error && error.message || error));
}

function getGraphQLOperationName(query) {
  const match = String(query || "").match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)/);
  return match ? match[1] : "AnonymousOperation";
}

function toDatabaseId(value) {
  const text = String(value === undefined || value === null ? "" : value).trim();
  if (!/^\d+$/.test(text)) return null;
  const parsed = Number(text);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function graphql(query, variables = {}, options = {}) {
  return new Promise((resolve, reject) => {
    const operationName = getGraphQLOperationName(query);
    const token = options.auth === false ? "" : wx.getStorageSync("zionJwt");
    const header = {
      "content-type": "application/json"
    };
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }

    wx.request({
      url: ZION_GRAPHQL_URL,
      method: "POST",
      data: { query, variables },
      header,
      success(res) {
        if(token && wx.getStorageSync("zionJwt")!==token){reject(new Error("登录身份已变化，请重试"));return;}
        const auth = require("./auth");
        if(auth.isAuthError(res.statusCode,JSON.stringify(res.data && res.data.errors || '')))auth.expire(token);
        if (res.statusCode >= 200 && res.statusCode < 300 && !res.data.errors) {
          resolve(res.data);
          return;
        }
        const detail = res.data && res.data.errors
          ? JSON.stringify(res.data.errors)
          : JSON.stringify(res.data || {});
        reject(new Error(`Zion GraphQL request failed: ${res.statusCode} [${operationName}] ${detail}`));
      },
      fail(error) {
        reject(new Error(`Zion GraphQL network failed [${operationName}]: ${error && error.errMsg ? error.errMsg : "unknown error"}`));
      }
    });
  });
}

const IMAGE_SUFFIX_MAP = {
  jpg: "JPG",
  jpeg: "JPEG",
  png: "PNG",
  gif: "GIF",
  webp: "WEBP"
};

function readFileAsArrayBuffer(filePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      success: (res) => resolve(res.data),
      fail: reject
    });
  });
}

function putBinary(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: "PUT",
      data,
      header: headers,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res);
          return;
        }
        reject(new Error(`image upload failed: ${res.statusCode}`));
      },
      fail: reject
    });
  });
}

/**
 * 把本地图片文件上传到 Zion 图片资产库。
 * 返回 { imageId, url }：imageId 用于写入 *_image_id 字段（持久），
 * url 是当次的签名地址（会过期，仅作即时展示，不要落库为文本）。
 */
function uploadImage(filePath) {
  const { md5Base64 } = require("./md5");
  const extMatch = String(filePath || "").match(/\.(\w+)$/);
  const suffix = IMAGE_SUFFIX_MAP[extMatch ? extMatch[1].toLowerCase() : ""] || "JPEG";

  const presignQuery = `
    mutation GetImageUploadUrl($md5: String!, $suffix: MediaFormat!, $acl: CannedAccessControlList) {
      imagePresignedUrl(imgMd5Base64: $md5, imageSuffix: $suffix, acl: $acl) {
        imageId
        uploadUrl
        uploadHeaders
      }
    }
  `;
  const urlQuery = `
    query GetImageById($id: bigint) {
      getImageById(imageId: $id) {
        id
        url
      }
    }
  `;

  return readFileAsArrayBuffer(filePath).then((buffer) => {
    const md5 = md5Base64(buffer);
    return graphql(presignQuery, { md5, suffix, acl: "PUBLIC_READ" }).then((res) => {
      const info = res.data.imagePresignedUrl || {};
      if (!info.uploadUrl || !info.imageId) {
        throw new Error("presigned upload url missing");
      }
      let headers = info.uploadHeaders || {};
      if (typeof headers === "string") {
        try {
          headers = JSON.parse(headers);
        } catch (error) {
          headers = {};
        }
      }
      return putBinary(info.uploadUrl, buffer, headers).then(() => info.imageId);
    });
  }).then((imageId) => graphql(urlQuery, { id: imageId }).then((res) => ({
    imageId,
    url: (res.data.getImageById && res.data.getImageById.url) || ""
  })));
}

function requestWechatLoginActionFlow(args, loginPayload) {
  const query = `
    mutation InvokeWechatLoginAction($args: Json!) {
      fz_invoke_action_flow(
        actionFlowId: "${WECHAT_LOGIN_ACTION_FLOW_ID}",
        versionId: ${WECHAT_LOGIN_ACTION_FLOW_VERSION},
        args: $args
      )
    }
  `;

  return graphql(query, { args }).then((res) => {
    const raw = res.data && res.data.fz_invoke_action_flow;
    const body = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
    if (!body.success) {
      throw new Error(body.message || "微信登录后端尚未完成手机号换取配置。");
    }

    return {
      actionFlowResult: body,
      user: {
        id: body.account_id ? String(body.account_id) : "",
        nickName: args.nick_name || "微信用户",
        avatarUrl: args.avatar_url || "",
        openid: body.wechat_openid || "",
        role: "customer",
        phone: body.phone_number || ""
      },
      payload: loginPayload
    };
  });
}

// Zion 原生微信小程序登录（微信行为登录）。
// 后端用 wx.login 的 code 调微信 code2session，自动创建/复用 account 并写入 wechat_openid。
function requestZionWechatMiniAppLogin(loginCode) {
  const query = `
    mutation LoginWithWechatMiniApp($code: String!) {
      loginWithWechatMiniApp(code: $code, createIfNotExists: true) {
        account {
          id
          username
          phoneNumber
          profileImageUrl
          permissionRoles
        }
        jwt {
          token
        }
      }
    }
  `;

  return graphql(query, { code: loginCode }, { auth: false }).then((res) => {
    const result = res.data && res.data.loginWithWechatMiniApp;
    if (!result || !result.account || !result.account.id) {
      throw new Error("Zion 微信登录未返回账户，请检查小程序 AppSecret 配置。");
    }
    if (result.jwt && result.jwt.token) {
      wx.setStorageSync("zionJwt", result.jwt.token);
    }
    return result;
  });
}

// 把登录后采集到的微信昵称/头像同步到 account 表（已验证字段）。
function syncWechatProfileToAccount(accountId, profile = {}) {
  const data = {};
  if (profile.nickName) {
    data.wechat_nickname = profile.nickName;
  }
  if (profile.avatarUrl) {
    data.wechat_avatar_url = profile.avatarUrl;
  }
  if (!Object.keys(data).length) {
    return Promise.resolve(null);
  }

  const query = `
    mutation SyncWechatProfile($id: bigint!, $data: account_set_input!) {
      update_account_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        wechat_nickname
        wechat_avatar_url
      }
    }
  `;

  return graphql(query, { id: Number(accountId), data })
    .then((res) => res.data.update_account_by_pk)
    .catch((error) => {
      console.warn("syncWechatProfileToAccount failed", error);
      return null;
    });
}

// 发送手机号绑定短信验证码（Zion 内置能力，不依赖微信付费手机号组件）。
function sendPhoneVerificationCode(telephone) {
  const phone = String(telephone || "").trim();
  if (!/^1\d{10}$/.test(phone)) {
    return Promise.reject(new Error("请输入 11 位大陆手机号。"));
  }

  const query = `
    mutation SendBindPhoneCode($telephone: String!) {
      sendVerificationCodeToPhone(telephone: $telephone, verificationEnumType: BIND)
    }
  `;

  return graphql(query, { telephone: phone }).then((res) => {
    if (!res.data || res.data.sendVerificationCodeToPhone !== true) {
      throw new Error("短信验证码发送失败，请稍后重试。");
    }
    return true;
  });
}

function isPhoneRegistered(telephone) {
  const phone = String(telephone || "").trim();
  if (!/^1\d{10}$/.test(phone)) {
    return Promise.resolve(false);
  }
  const query = `
    query PhoneRegistered($phone: String!) {
      account(where: { fz_phone_number: { _eq: $phone } }, limit: 1) {
        id
      }
    }
  `;
  return graphql(query, { phone }).then((res) => {
    const list = res.data && res.data.account;
    return Array.isArray(list) && list.length > 0;
  }).catch(() => false);
}

// 发送手机号登录验证码。
// Zion 的验证码分类型：已注册手机号必须用 LOGIN 类型，新手机号用 SIGN_UP 类型，
// 且登录时 authenticateWithPhoneNumber 的 register 参数必须与发码类型一致。
// 注意：未注册手机号用 LOGIN 类型也能发码成功，但登录时 register:false 会校验失败，
// 因此必须先查 account 表决定发码类型，不能「先 LOGIN 失败再回退 SIGN_UP」。
// 返回 { mode: "LOGIN" | "SIGN_UP" }，页面需要保存 mode 并在登录时传回。
function sendLoginVerificationCode(telephone) {
  const phone = String(telephone || "").trim();
  if (!/^1\d{10}$/.test(phone)) {
    return Promise.reject(new Error("请输入 11 位大陆手机号。"));
  }

  const buildQuery = (enumType) => `
    mutation SendLoginPhoneCode($telephone: String!) {
      sendVerificationCodeToPhone(telephone: $telephone, verificationEnumType: ${enumType})
    }
  `;
  const send = (enumType) => graphql(buildQuery(enumType), { telephone: phone }).then((res) => {
    if (!res.data || res.data.sendVerificationCodeToPhone !== true) {
      throw new Error("短信验证码发送失败，请稍后重试。");
    }
    return { mode: enumType };
  }).catch((error) => {
    const raw = String(error && error.message || "");
    if (/INSUFFICIENT_SMS_AMOUNT|短信数量超限/i.test(raw)) {
      throw new Error("短信额度已用完，请联系管理员在 Zion 后台充值后再试。");
    }
    throw error;
  });

  return isPhoneRegistered(phone).then((registered) => send(registered ? "LOGIN" : "SIGN_UP"));
}

// 手机号 + 短信验证码登录（Zion 内置）。
// codeMode 必须与发码时的类型一致：
// - "LOGIN"：已注册手机号，直接匹配 Zion 后端已有账户登录（register: false）。
// - "SIGN_UP"：新手机号，验证通过后自动创建账户（register: true）。
function loginWithPhoneNumber(telephone, verificationCode, profile = {}, codeMode = "LOGIN") {
  const phone = String(telephone || "").trim();
  const code = String(verificationCode || "").trim();
  if (!/^1\d{10}$/.test(phone)) {
    return Promise.reject(new Error("请输入 11 位大陆手机号。"));
  }
  if (!code) {
    return Promise.reject(new Error("请输入短信验证码。"));
  }

  const register = codeMode === "SIGN_UP";
  const query = `
    mutation LoginWithPhoneNumber($telephone: String!, $verificationCode: String!, $register: Boolean!) {
      authenticateWithPhoneNumber(
        telephone: $telephone,
        verificationCode: $verificationCode,
        register: $register
      ) {
        account {
          id
          username
          phoneNumber
          profileImageUrl
          permissionRoles
        }
        jwt {
          token
        }
      }
    }
  `;

  return graphql(query, { telephone: phone, verificationCode: code, register }, { auth: false }).then((res) => {
    const result = res.data && res.data.authenticateWithPhoneNumber;
    if (!result || !result.account || !result.account.id) {
      throw new Error("Zion 未返回账户，登录失败。");
    }
    const token = result.jwt && result.jwt.token ? result.jwt.token : "";
    if (token) {
      wx.setStorageSync("zionJwt", token);
    }

    const accountId = String(result.account.id);
    return getAccountProfile(accountId).catch(() => null).then((backendUser) => {
      // 老账户直接沿用后端已有昵称/头像；只有后端缺失时才用本次填写的资料补齐。
      const missingProfile = {};
      if (profile.nickName && !(backendUser && backendUser.nickName && backendUser.nickName !== "微信用户")) {
        missingProfile.nickName = profile.nickName;
      }
      if (profile.avatarUrl && !(backendUser && backendUser.avatarUrl)) {
        missingProfile.avatarUrl = profile.avatarUrl;
      }

      const syncPromise = Object.keys(missingProfile).length
        ? syncWechatProfileToAccount(accountId, missingProfile).then(() => getAccountProfile(accountId).catch(() => backendUser))
        : Promise.resolve(backendUser);

      return syncPromise.then((finalUser) => ({
        token,
        isNewAccount: register,
        user: finalUser && finalUser.id ? finalUser : {
          id: accountId,
          nickName: profile.nickName || result.account.username || `用户${phone.slice(-4)}`,
          avatarUrl: profile.avatarUrl || result.account.profileImageUrl || "",
          role: "customer",
          phone: result.account.phoneNumber || phone
        }
      }));
    });
  });
}

// 用短信验证码把真实手机号绑定到当前登录的 Zion 账户（写入 account.fz_phone_number）。
function bindPhoneNumberByCode(telephone, verificationCode) {
  const phone = String(telephone || "").trim();
  const code = String(verificationCode || "").trim();
  if (!/^1\d{10}$/.test(phone)) {
    return Promise.reject(new Error("请输入 11 位大陆手机号。"));
  }
  if (!code) {
    return Promise.reject(new Error("请输入短信验证码。"));
  }
  if (!wx.getStorageSync("zionJwt")) {
    return Promise.reject(new Error("请先完成微信登录，再绑定手机号。"));
  }

  const query = `
    mutation BindPhoneByCode($telephone: String!, $verificationCode: String!) {
      bindPhoneNumberByVerificationCode(telephone: $telephone, verificationCode: $verificationCode)
    }
  `;

  return graphql(query, { telephone: phone, verificationCode: code }).then((res) => {
    if (!res.data || res.data.bindPhoneNumberByVerificationCode !== true) {
      throw new Error("手机号绑定失败，请核对验证码后重试。");
    }
    return true;
  });
}

function normalizeCourseLesson(item = {}) {
  const videoAssetUrl = item.video && item.video.url ? item.video.url : "";
  return {
    id: String(item.id),
    title: item.title || "",
    duration: item.duration_text || "",
    sortOrder: Number(item.sort_order || 0),
    videoUrl: videoAssetUrl || item.video_url || ""
  };
}

function normalizeCourse(item = {}) {
  const coverImageUrl = item.cover_image && item.cover_image.url ? item.cover_image.url : "";
  const lessons = Array.isArray(item.course_lesson) ? item.course_lesson : [];
  const chapters = lessons
    .map(normalizeCourseLesson)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: String(item.id),
    zionId: item.id,
    title: item.title || "",
    subtitle: item.subtitle || "",
    description: item.description || "",
    coverUrl: coverImageUrl || item.cover_url || "",
    durationText: item.duration_text || "",
    badge: item.badge || "",
    sortOrder: Number(item.sort_order || 0),
    enabled: item.enabled !== false,
    chapters
  };
}

function normalizeAdvisor(item = {}) {
  const tags = Array.isArray(item.tags_json)
    ? item.tags_json
    : String(item.specialties || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

  const avatarImageUrl = item.avatar_image && item.avatar_image.url ? item.avatar_image.url : "";

  return {
    id: String(item.id),
    zionId: item.id,
    name: item.name,
    title: item.title,
    avatarUrl: avatarImageUrl || item.avatar_url,
    imageUrl: avatarImageUrl || item.avatar_url,
    avatarText: item.name ? item.name.slice(0, 1) : "心",
    bio: item.bio,
    tags,
    topics: tags,
    helped: item.consult_count || 0,
    rating: item.rating || "5.0",
    displayPrice: item.price_per_hour || 200,
    pricePerHour: item.price_per_hour || 200,
    status: item.status
  };
}

function normalizeServiceProvider(item = {}) {
  const specialties = Array.isArray(item.specialties_json)
    ? item.specialties_json
    : String(item.specialties || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  const account = item.account || {};
  const displayName = account.wechat_nickname || account.username || item.display_name || item.name || "服务人员";
  const avatarUrl = account.wechat_avatar_url || item.avatar_url || "";

  return {
    id: String(item.id),
    accountId: item.account_id ? String(item.account_id) : "",
    displayName,
    title: item.title || "情感咨询经理",
    avatarUrl,
    bio: item.bio || "",
    specialties,
    serviceStatus: item.service_status || "PENDING_REVIEW",
    serviceKind: item.service_kind || "STAFF",
    verified: !!item.verified,
    canReply: !!item.can_reply,
    canAcceptOrder: !!item.can_accept_order,
    onlineStatus: item.online_status || "offline",
    rating: item.rating || "0",
    pricePerHour: item.price_per_hour || 200,
    serviceMinutes: item.service_minutes || 60,
    todayWaitingCount: item.today_waiting_count || 0,
    activeSessionCount: item.active_session_count || 0,
    todayIncome: item.today_income || 0,
    totalIncome: item.total_income || 0
  };
}

function normalizeManagerSession(item = {}, accountsById = {}, ordersById = {}) {
  const customerAccount = accountsById[String(item.customer_account_id || "")] || {};
  const customerProfile = customerAccount.account_profile || {};
  const order = ordersById[String(item.order_id || "")] || {};
  const customerNickname = item.customer_nickname
    || customerProfile.user_name
    || customerAccount.wechat_nickname
    || customerAccount.username
    || "微信用户";
  const customerAvatarUrl = item.customer_avatar_url
    || customerProfile.avatar_url
    || customerAccount.wechat_avatar_url
    || "";
  return {
    id: String(item.id),
    orderId: item.order_id ? String(item.order_id) : "",
    customerAccountId: item.customer_account_id ? String(item.customer_account_id) : "",
    advisorId: item.advisor_id ? String(item.advisor_id) : "",
    managerAccountId: item.manager_account_id ? String(item.manager_account_id) : "",
    serviceProviderId: item.service_provider_id ? String(item.service_provider_id) : "",
    status: item.status,
    startedAt: item.started_at,
    expiresAt: item.expires_at,
    lastMessageAt: item.last_message_at,
    topic: item.topic || order.issue_summary || item.issue_summary || "",
    customerNickname,
    customerAvatarUrl,
    customerAvatarText: customerNickname ? customerNickname.slice(0, 1) : "客",
    problemCategory: order.problem_category || item.problem_category || item.category || "情感问答",
    issueSummary: order.issue_summary || item.issue_summary || "",
    amount: order.amount || item.amount || 200,
    durationMinutes: order.duration_minutes || item.duration_minutes || 60,
    chatAvailableUntil: order.chat_available_until || item.chat_available_until || ""
  };
}

function normalizeConsultationStatus(order = {}, session = {}) {
  const sessionStatus = String(session.status || "").toLowerCase();
  const orderStatus = String(order.status || "").toLowerCase();
  if (["active", "serving", "in_service"].includes(sessionStatus)) return "服务中";
  if (["completed", "finished", "ended", "closed"].includes(sessionStatus) || ["completed", "finished"].includes(orderStatus)) return "已完成";
  if (["waiting", "paid", "pending"].includes(sessionStatus) || ["paid", "created", "pending"].includes(orderStatus)) return "待接单";
  return orderStatus || sessionStatus ? (order.status || session.status) : "待接单";
}

function formatDisplayAmount(value) {
  if (value === null || value === undefined || value === "") return 0;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
}

function formatMoneyText(value) {
  const numeric = Number(formatDisplayAmount(value));
  const fixed = numeric.toFixed(2);
  const parts = fixed.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function getCustomerAccountSummary(accountId) {
  if (!accountId) {
    return Promise.resolve({
      totalSpent: 0,
      totalSpentText: "0.00",
      orderCards: [
        { label: "待支付", value: 0 },
        { label: "服务中", value: 0 },
        { label: "已完成", value: 0 }
      ]
    });
  }

  const query = `
    query GetCustomerAccountSummary($accountId: bigint!) {
      consultation_order(
        where: { customer_account_id: { _eq: $accountId } }
        order_by: { created_at: desc }
        limit: 200
      ) {
        id
        amount
        status
        paid_at
      }
      consultation_session(
        where: { customer_account_id: { _eq: $accountId } }
        order_by: { last_message_at: desc }
        limit: 200
      ) {
        id
        status
      }
    }
  `;

  return graphql(query, { accountId: Number(accountId) }).then((res) => {
    const orders = res.data.consultation_order || [];
    const sessions = res.data.consultation_session || [];
    let totalSpent = 0;
    let pendingCount = 0;
    let servingCount = 0;
    let completedCount = 0;

    orders.forEach((order) => {
      const status = String(order.status || "").toLowerCase();
      if (status === "pending" || status === "created") {
        pendingCount += 1;
        return;
      }
      if (order.paid_at) {
        totalSpent += Number(formatDisplayAmount(order.amount));
      }
      if (status === "completed" || status === "finished") {
        completedCount += 1;
      }
    });

    sessions.forEach((session) => {
      const status = String(session.status || "").toLowerCase();
      if (["active", "serving", "in_service"].includes(status)) {
        servingCount += 1;
      }
    });

    return {
      totalSpent,
      totalSpentText: formatMoneyText(totalSpent),
      orderCards: [
        { label: "待支付", value: pendingCount },
        { label: "服务中", value: servingCount },
        { label: "已完成", value: completedCount }
      ]
    };
  });
}

function normalizeManagerOrder(order = {}, session = {}, accountsById = {}) {
  const customerAccount = accountsById[String(order.customer_account_id || session.customer_account_id || "")] || {};
  const customerProfile = customerAccount.account_profile || {};
  const customerName = session.customer_nickname
    || customerProfile.user_name
    || customerAccount.wechat_nickname
    || customerAccount.username
    || "匿名用户";
  const customerAvatarUrl = session.customer_avatar_url
    || customerProfile.avatar_url
    || customerAccount.wechat_avatar_url
    || "";
  const status = normalizeConsultationStatus(order, session);
  const amount = formatDisplayAmount(order.amount || session.amount || 0);
  const durationMinutes = Number(order.duration_minutes || session.duration_minutes || 60);
  const startedAt = session.started_at ? new Date(session.started_at).getTime() : 0;
  const expiresAt = session.expires_at ? new Date(session.expires_at).getTime() : 0;
  const elapsedMinutes = startedAt ? Math.max(0, Math.floor((Date.now() - startedAt) / 60000)) : 0;
  const progress = startedAt && expiresAt
    ? Math.min(100, Math.max(0, Math.round(((Date.now() - startedAt) / (expiresAt - startedAt)) * 100)))
    : 0;

  return {
    id: String(session.id || order.id || ""),
    orderId: order.id ? String(order.id) : "",
    sessionId: session.id ? String(session.id) : "",
    orderNo: order.order_no || "",
    name: customerName,
    avatarUrl: customerAvatarUrl,
    avatarText: customerName ? customerName.slice(0, 1) : "客",
    tag: order.problem_category || session.problemCategory || "情感问答",
    title: order.issue_summary || order.remark || session.topic || "用户提交了新的咨询问题......",
    status,
    statusTone: status === "待接单" ? "orange" : (status === "服务中" ? "blue" : "gray"),
    metaLeft: status === "服务中"
      ? `已服务：${Math.min(elapsedMinutes, durationMinutes)}分钟 / ${durationMinutes}分钟`
      : `${status === "已完成" ? "服务时长" : "预约时长"}：${durationMinutes}分钟`,
    metaRight: `${status === "已完成" ? "收入" : "价格"}：¥${amount}`,
    time: status === "已完成"
      ? `完成时间：${session.ended_at ? formatShortDate(session.ended_at) : "未记录"}`
      : `提交时间：${formatRelativeTime(order.created_at || session.created_at)}`,
    amount,
    durationMinutes,
    progress,
    createdAt: order.created_at || session.created_at || "",
    startedAt: session.started_at || "",
    endedAt: session.ended_at || "",
    expiresAt: session.expires_at || order.chat_available_until || "",
    customerAccountId: order.customer_account_id || session.customer_account_id || "",
    managerAccountId: session.manager_account_id || "",
    serviceProviderId: session.service_provider_id || "",
    rawOrder: order,
    rawSession: session
  };
}

function formatRelativeTime(value) {
  if (!value) return "刚刚";
  const timestamp = new Date(value).getTime();
  if (!timestamp) return "刚刚";
  const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (diffMinutes < 1) return "刚刚";
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}小时前`;
  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? "昨天" : `${diffDays}天前`;
}

function formatShortDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (isSameDay) return "今天";
  if (date.toDateString() === yesterday.toDateString()) return "昨天";
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function normalizeAccount(item = {}) {
  const infoMap = item.oauth2_user_info_map && typeof item.oauth2_user_info_map === "object"
    ? item.oauth2_user_info_map
    : {};
  const linkedProfile = item.account_profile && typeof item.account_profile === "object"
    ? item.account_profile
    : {};
  const accountProfile = {
    ...getStoredAccountProfile(infoMap),
    ...linkedProfile
  };
  // 头像优先取 avatar_image（Zion 图片资产，URL 每次查询都会重新签名），
  // avatar_url 文本仅作为老数据兜底。
  const avatarImageUrl = accountProfile.avatar_image && accountProfile.avatar_image.url
    ? accountProfile.avatar_image.url
    : "";

  return {
    id: item.id ? String(item.id) : "",
    profileId: item.account_profile_id ? String(item.account_profile_id) : (accountProfile.id ? String(accountProfile.id) : ""),
    nickName: accountProfile.user_name || item.wechat_nickname || item.username || "微信用户",
    avatarUrl: avatarImageUrl || accountProfile.avatar_url || item.wechat_avatar_url || "",
    avatarImageId: accountProfile.avatar_image && accountProfile.avatar_image.id ? String(accountProfile.avatar_image.id) : "",
    role: item.user_type || "customer",
    phone: item.fz_phone_number || "",
    username: /^wxh5_[a-f0-9]{36}$/.test(item.username || "")
      ? (accountProfile.user_name || item.wechat_nickname || "微信用户") : (item.username || ""),
    region: accountProfile.region || accountProfile.city || "",
    locationInfo: accountProfile.location_info || null,
    address: accountProfile.address || (accountProfile.location_info && accountProfile.location_info.address) || "",
    gender: accountProfile.gender || "",
    birthday: accountProfile.birthday || ""
  };
}

function getStoredAccountProfile(infoMap = {}) {
  if (infoMap[ACCOUNT_PROFILE_KEY] && typeof infoMap[ACCOUNT_PROFILE_KEY] === "object") {
    return infoMap[ACCOUNT_PROFILE_KEY];
  }
  if (infoMap[LEGACY_ACCOUNT_PROFILE_KEY] && typeof infoMap[LEGACY_ACCOUNT_PROFILE_KEY] === "object") {
    return infoMap[LEGACY_ACCOUNT_PROFILE_KEY];
  }
  return {};
}

function getDefaultManagerIdentity() {
  const query = `
    query GetDefaultManagerIdentity {
      service_provider(limit: 20) {
        id
        account_id
        display_name
        title
        avatar_url
        service_status
        verified
        can_reply
        can_accept_order
        online_status
        rating
        price_per_hour
        service_minutes
        today_waiting_count
        active_session_count
        today_income
        total_income
        account {
          username
          wechat_nickname
          wechat_avatar_url
        }
      }
      account(limit: 100) {
        id
        username
        oauth2_user_info_map
        wechat_nickname
        wechat_avatar_url
        fz_phone_number
        user_type
        account_profile_id
        account_profile {
          id
          user_name
          avatar_url
          avatar_image {
            id
            url
          }
          city
          address
          gender
          birthday
          phone
          wechat_avatar_url
          location_info
        }
      }
    }
  `;

  return graphql(query).then((res) => {
    const providers = (res.data.service_provider || []).map(normalizeServiceProvider);
    const provider = providers.find((item) => item.serviceStatus === "ACTIVE" && (item.canReply || item.canAcceptOrder))
      || providers[0];
    if (!provider) {
      return cloneDefaultManagerIdentity();
    }
    const account = (res.data.account || []).find((item) => String(item.id) === String(provider.accountId));
    const user = account
      ? normalizeAccount(account)
      : {
        id: provider.accountId,
        nickName: provider.displayName,
        avatarUrl: provider.avatarUrl,
        role: "manager",
        phone: ""
      };
    return {
      user: {
        ...user,
        id: provider.accountId || user.id,
        nickName: provider.displayName || user.nickName,
        avatarUrl: provider.avatarUrl || user.avatarUrl,
        role: "manager"
      },
      serviceProvider: provider
    };
  }).catch((error) => {
    console.warn("getDefaultManagerIdentity fallback", error);
    return cloneDefaultManagerIdentity();
  });
}

function listCourses(filters = {}) {
  const query = `
    query ListCourses($limit: Int) {
      course(
        where: { enabled: { _eq: true } }
        order_by: { sort_order: asc }
        limit: $limit
      ) {
        id
        title
        subtitle
        cover_url
        cover_image {
          id
          url
        }
        duration_text
        badge
        sort_order
        enabled
      }
    }
  `;

  return graphql(query, { limit: filters.limit || 50 }).then((res) => ({
    courses: (res.data.course || []).map(normalizeCourse)
  }));
}

function getCourse(id) {
  const courseId = toDatabaseId(id);
  if (!courseId) {
    return Promise.resolve({ course: null });
  }

  const query = `
    query GetCourse($id: bigint!) {
      course_by_pk(id: $id) {
        id
        title
        subtitle
        description
        cover_url
        cover_image {
          id
          url
        }
        duration_text
        badge
        sort_order
        enabled
        course_lesson(order_by: { sort_order: asc }) {
          id
          title
          duration_text
          sort_order
          video_url
          video {
            id
            url
          }
        }
      }
    }
  `;

  return graphql(query, { id: courseId }).then((res) => ({
    course: normalizeCourse(res.data.course_by_pk || {})
  }));
}

function listAdvisors(filters = {}) {
  const query = `
    query ListAdvisors($limit: Int) {
      advisor(limit: $limit, order_by: { id: asc }) {
        id
        name
        title
        avatar_url
        avatar_image {
          id
          url
        }
        bio
        specialties
        tags_json
        price_per_hour
        rating
        consult_count
        status
      }
    }
  `;

  return graphql(query, { limit: filters.limit || 20 }).then((res) => ({
    advisors: (res.data.advisor || []).map(normalizeAdvisor)
  }));
}

function listServiceProviders(filters = {}) {
  const query = `
    query ListServiceProviders {
      service_provider(limit: 50) {
        id
        account_id
        display_name
        title
        avatar_url
        bio
        specialties_json
        service_status
        service_kind
        verified
        can_reply
        can_accept_order
        online_status
        rating
        price_per_hour
        service_minutes
        today_waiting_count
        active_session_count
        today_income
        total_income
        account {
          username
          wechat_nickname
          wechat_avatar_url
        }
      }
    }
  `;

  return graphql(query).then((res) => {
    const providers = (res.data.service_provider || []).map(normalizeServiceProvider);
    return {
      serviceProviders: filters.status
        ? providers.filter((item) => item.serviceStatus === filters.status)
        : providers
    };
  });
}

function getServiceProviderByAccount(accountId) {
  if (!accountId) return Promise.resolve(null);

  const query = `
    query GetServiceProviderByAccount($accountId: bigint!) {
      service_provider(where: { _eq: { bigint_operand: { left_operand: { column: account_id }, right_operand: { literal: $accountId } } } }, limit: 1) {
        id
        account_id
        display_name
        title
        avatar_url
        bio
        specialties_json
        service_status
        service_kind
        verified
        can_reply
        can_accept_order
        online_status
        rating
        price_per_hour
        service_minutes
        today_waiting_count
        active_session_count
        today_income
        total_income
        account {
          username
          wechat_nickname
          wechat_avatar_url
        }
      }
    }
  `;

  return graphql(query, { accountId: Number(accountId) }).then((res) => {
    const provider = (res.data.service_provider || [])[0];
    return provider ? normalizeServiceProvider(provider) : null;
  });
}

function createServiceProviderProfile(data = {}) {
  const query = `
    mutation CreateServiceProviderProfile($object: service_provider_insert_input!) {
      insert_service_provider_one(object: $object) {
        id
        account_id
        display_name
        title
        avatar_url
        service_status
        verified
        can_reply
        can_accept_order
      }
    }
  `;
  const object = {
    display_name: data.displayName || data.name || "服务人员",
    title: data.title || "情感咨询经理",
    avatar_url: data.avatarUrl || "",
    bio: data.bio || "",
    specialties_json: data.specialties || [],
    service_status: data.serviceStatus || "PENDING_REVIEW",
    verified: !!data.verified,
    can_reply: !!data.canReply,
    can_accept_order: !!data.canAcceptOrder,
    online_status: data.onlineStatus || "offline",
    rating: data.rating || 0,
    price_per_hour: data.pricePerHour || 200,
    service_minutes: data.serviceMinutes || 60
  };

  if (data.accountId) {
    object.account_id = Number(data.accountId);
  }

  return graphql(query, { object }).then((res) => normalizeServiceProvider(res.data.insert_service_provider_one));
}

function getAdvisor(id) {
  const advisorId = toDatabaseId(id);
  if (!advisorId) {
    return Promise.resolve({ advisor: null });
  }

  const query = `
    query GetAdvisor($id: bigint!) {
      advisor_by_pk(id: $id) {
        id
        name
        title
        avatar_url
        avatar_image {
          id
          url
        }
        bio
        specialties
        tags_json
        price_per_hour
        rating
        consult_count
        status
        service_provider {
          id
          account_id
          display_name
          service_status
        }
      }
    }
  `;

  return graphql(query, { id: advisorId }).then((res) => ({
    advisor: normalizeAdvisor(res.data.advisor_by_pk)
  }));
}

const ACTIVE_CUSTOMER_BINDING_STATUS = "ACTIVE";

function normalizeCustomerServiceBinding(item = {}) {
  const advisor = item.advisor || {};
  const provider = item.service_provider || {};
  const session = item.consultation_session || null;

  return {
    id: item.id ? String(item.id) : "",
    status: item.binding_status || ACTIVE_CUSTOMER_BINDING_STATUS,
    boundAt: item.bound_at || "",
    customerAccountId: item.customer_account_id ? String(item.customer_account_id) : "",
    advisorId: item.advisor_id ? String(item.advisor_id) : "",
    serviceProviderId: item.service_provider_id ? String(item.service_provider_id) : "",
    managerAccountId: provider.account_id ? String(provider.account_id) : "",
    advisorName: advisor.name || provider.display_name || "",
    advisorTitle: advisor.title || provider.title || "",
    transferNote: item.transfer_note || "",
    lastTransferredAt: item.last_transferred_at || "",
    consultationSessionId: session && session.id ? String(session.id) : ""
  };
}

function getCustomerServiceBinding(customerAccountId) {
  const accountId = toDatabaseId(customerAccountId);
  if (!accountId) return Promise.resolve(null);

  const query = `
    query GetCustomerServiceBinding($accountId: bigint!) {
      customer_service_binding(
        limit: 1,
        where: {
          customer_account_id: { _eq: $accountId },
          binding_status: { _eq: "ACTIVE" }
        }
      ) {
        id
        binding_status
        bound_at
        transfer_note
        last_transferred_at
        customer_account_id
        advisor_id
        service_provider_id
        advisor {
          id
          name
          title
        }
        service_provider {
          id
          account_id
          display_name
          title
        }
        consultation_session {
          id
          order_id
          customer_account_id
          advisor_id
          manager_account_id
          service_provider_id
          status
          started_at
          ended_at
          expires_at
          last_message_at
          topic
          customer_nickname
          customer_avatar_url
        }
      }
    }
  `;

  return graphql(query, { accountId })
    .then((res) => {
      const row = (res.data.customer_service_binding || [])[0];
      return row ? normalizeCustomerServiceBinding(row) : null;
    })
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) return null;
      throw error;
    });
}

function resolveAdvisorServiceProvider(advisorId) {
  const resolvedAdvisorId = toDatabaseId(advisorId);
  if (!resolvedAdvisorId) {
    return Promise.reject(new Error("missing advisor id"));
  }

  const query = `
    query ResolveAdvisorServiceProvider($id: bigint!) {
      advisor_by_pk(id: $id) {
        id
        name
        service_provider {
          id
          account_id
          display_name
          service_status
        }
      }
      service_provider(
        limit: 1,
        where: {
          advisor_id: { _eq: $id },
          service_status: { _eq: "ACTIVE" }
        }
      ) {
        id
        account_id
        display_name
        service_status
      }
    }
  `;

  return graphql(query, { id: resolvedAdvisorId })
    .then((res) => {
      const advisor = res.data.advisor_by_pk || {};
      const provider = advisor.service_provider || (res.data.service_provider || [])[0] || null;
      if (!provider || !provider.id) {
        const error = new Error("该咨询师暂未关联服务人员，暂时无法预约。");
        error.code = "MISSING_SERVICE_PROVIDER";
        throw error;
      }
      return {
        advisorId: String(advisor.id || advisorId),
        advisorName: advisor.name || provider.display_name || "",
        serviceProviderId: String(provider.id),
        managerAccountId: provider.account_id ? String(provider.account_id) : ""
      };
    });
}

function isActiveServiceProvider(provider) {
  return Boolean(
    provider
    && provider.serviceStatus === "ACTIVE"
    && (provider.canReply || provider.canAcceptOrder)
  );
}

function assertCanBookAdvisor(customerAccountId, advisorId) {
  return getServiceProviderByAccount(customerAccountId)
    .then((provider) => {
      if (isActiveServiceProvider(provider)) {
        return {
          allowed: false,
          binding: null,
          reason: "manager",
          message: "服务人员账号不能预约咨询，请前往「我的」进入工作台处理客户订单。"
        };
      }
      return getCustomerServiceBinding(customerAccountId).then((binding) => {
        if (!binding || !binding.advisorId) {
          return { allowed: true, binding: null };
        }
        if (String(binding.advisorId) === String(advisorId)) {
          return { allowed: true, binding };
        }
        return {
          allowed: false,
          binding,
          reason: "binding",
          message: `你已绑定咨询师 ${binding.advisorName || "专属咨询师"}，不能预约其他老师。后续服务都会由 TA 回复。`
        };
      });
    });
}

function createCustomerServiceBinding(data = {}) {
  const query = `
    mutation CreateCustomerServiceBinding($object: customer_service_binding_insert_input!) {
      insert_customer_service_binding_one(object: $object) {
        id
        binding_status
        bound_at
        customer_account_id
        advisor_id
        service_provider_id
      }
    }
  `;
  const boundAt = new Date().toISOString();

  return graphql(query, {
    object: {
      customer_account_id: Number(data.customerAccountId),
      advisor_id: Number(data.advisorId),
      service_provider_id: Number(data.serviceProviderId),
      binding_status: ACTIVE_CUSTOMER_BINDING_STATUS,
      bound_at: boundAt
    }
  }).then((res) => normalizeCustomerServiceBinding(res.data.insert_customer_service_binding_one));
}

function ensureCustomerServiceBinding(data = {}) {
  return getCustomerServiceBinding(data.customerAccountId).then((existing) => {
    if (existing && existing.advisorId) {
      if (String(existing.advisorId) !== String(data.advisorId)) {
        const error = new Error("customer already bound to another advisor");
        error.code = "BINDING_CONFLICT";
        throw error;
      }
      return existing;
    }
    return createCustomerServiceBinding(data);
  });
}

function canTransferCustomerBinding(account) {
  const role = account && (account.user_type || account.role);
  return role === "admin" || role === "super_admin";
}

function transferCustomerServiceBinding(data = {}) {
  const query = `
    query GetAccountRole($id: bigint!) {
      account_by_pk(id: $id) {
        id
        user_type
      }
    }
  `;
  const updateQuery = `
    mutation TransferCustomerServiceBinding($id: bigint!, $data: customer_service_binding_set_input!) {
      update_customer_service_binding_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        binding_status
        bound_at
        transfer_note
        last_transferred_at
        customer_account_id
        advisor_id
        service_provider_id
      }
    }
  `;
  const transferredAt = new Date().toISOString();

  return graphql(query, { id: Number(data.operatorAccountId) })
    .then((res) => {
      const account = res.data.account_by_pk;
      if (!canTransferCustomerBinding(account)) {
        const error = new Error("仅更高权限人员可以移交客户绑定关系。");
        error.code = "TRANSFER_FORBIDDEN";
        throw error;
      }
      return resolveAdvisorServiceProvider(data.advisorId);
    })
    .then((resolved) => graphql(updateQuery, {
      id: Number(data.bindingId),
      data: {
        advisor_id: Number(resolved.advisorId),
        service_provider_id: Number(resolved.serviceProviderId),
        binding_status: ACTIVE_CUSTOMER_BINDING_STATUS,
        transfer_note: data.transferNote || "",
        last_transferred_at: transferredAt
      }
    }).then((updateRes) => normalizeCustomerServiceBinding(updateRes.data.update_customer_service_binding_by_pk)));
}

function createQuestion(data) {
  return createPaymentOrder({
    advisorId: data.advisorId,
    remark: data.content || data.question || ""
  });
}

function normalizeConsultationSessionRow(session) {
  if (!session) return null;
  const order = session.consultation_order || {};
  const durationMinutes = Number(order.duration_minutes || session.duration_minutes || 60);
  const chatAvailableUntil = order.chat_available_until || session.chat_available_until || "";
  const expiryInput = {
    status: session.status,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    expiresAt: session.expires_at,
    durationMinutes,
    chatAvailableUntil
  };
  return {
    id: String(session.id),
    orderId: session.order_id ? String(session.order_id) : "",
    customerAccountId: session.customer_account_id ? String(session.customer_account_id) : "",
    advisorId: session.advisor_id ? String(session.advisor_id) : "",
    managerAccountId: session.manager_account_id ? String(session.manager_account_id) : "",
    serviceProviderId: session.service_provider_id ? String(session.service_provider_id) : "",
    status: session.status,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    expiresAt: session.expires_at,
    durationMinutes,
    chatAvailableUntil,
    effectiveExpiresAt: resolveEffectiveSessionExpiry(expiryInput),
    lastMessageAt: session.last_message_at,
    topic: session.topic || "",
    customerNickname: session.customer_nickname || "客户",
    customerAvatarUrl: session.customer_avatar_url || "",
    customerAvatarText: session.customer_nickname ? session.customer_nickname.slice(0, 1) : "客"
  };
}

function getBoundConsultationSession(customerAccountId, options = {}) {
  const accountId = toDatabaseId(customerAccountId);
  if (!accountId) return Promise.resolve(null);

  const bindingQuery = `
    query GetBoundSessionFromBinding($accountId: bigint!) {
      customer_service_binding(
        limit: 1,
        where: {
          customer_account_id: { _eq: $accountId },
          binding_status: { _eq: "ACTIVE" }
        }
      ) {
        id
        advisor_id
        service_provider_id
        consultation_session {
          id
          order_id
          customer_account_id
          advisor_id
          manager_account_id
          service_provider_id
          status
          started_at
          ended_at
          expires_at
          last_message_at
          topic
          customer_nickname
          customer_avatar_url
        }
      }
    }
  `;

  const legacyQuery = `
    query GetBoundConsultationSession($where: consultation_session_bool_exp!) {
      consultation_session(
        where: $where,
        order_by: { id: asc },
        limit: 1
      ) {
        id
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        service_provider_id
        status
        started_at
        ended_at
        expires_at
        last_message_at
        topic
        customer_nickname
        customer_avatar_url
      }
    }
  `;

  return graphql(bindingQuery, { accountId })
    .then((res) => {
      const binding = (res.data.customer_service_binding || [])[0];
      if (!binding) return null;
      if (
        options.serviceProviderId
        && String(binding.service_provider_id) !== String(options.serviceProviderId)
      ) {
        return null;
      }
      if (
        options.advisorId
        && String(binding.advisor_id) !== String(options.advisorId)
      ) {
        return null;
      }
      return normalizeConsultationSessionRow(binding.consultation_session);
    })
    .catch((error) => {
      if (!isSchemaCompatibilityError(error)) throw error;
      const where = {
        customer_account_id: { _eq: accountId }
      };
      if (options.serviceProviderId) {
        where.service_provider_id = { _eq: Number(options.serviceProviderId) };
      } else if (options.advisorId) {
        where.advisor_id = { _eq: Number(options.advisorId) };
      }
      return graphql(legacyQuery, { where })
        .then((legacyRes) => normalizeConsultationSessionRow((legacyRes.data.consultation_session || [])[0]));
    });
}

function updateConsultationSession(sessionId, data = {}) {
  const resolvedSessionId = toDatabaseId(sessionId);
  if (!resolvedSessionId) {
    return Promise.reject(new Error("missing session id"));
  }

  const query = `
    mutation UpdateConsultationSession($id: bigint!, $data: consultation_session_set_input!) {
      update_consultation_session_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        service_provider_id
        status
        started_at
        ended_at
        expires_at
        last_message_at
        topic
        customer_nickname
        customer_avatar_url
      }
    }
  `;
  const payload = {};
  if (data.orderId !== undefined) payload.order_id = data.orderId ? Number(data.orderId) : null;
  if (data.customerAccountId !== undefined) payload.customer_account_id = data.customerAccountId ? Number(data.customerAccountId) : null;
  if (data.advisorId !== undefined) payload.advisor_id = data.advisorId ? Number(data.advisorId) : null;
  if (data.managerAccountId !== undefined) payload.manager_account_id = data.managerAccountId ? Number(data.managerAccountId) : null;
  if (data.serviceProviderId !== undefined) payload.service_provider_id = data.serviceProviderId ? Number(data.serviceProviderId) : null;
  if (data.status !== undefined) payload.status = data.status;
  if (data.startedAt !== undefined) payload.started_at = data.startedAt ? new Date(data.startedAt).toISOString() : null;
  if (data.endedAt !== undefined) payload.ended_at = data.endedAt ? new Date(data.endedAt).toISOString() : null;
  if (data.expiresAt !== undefined) payload.expires_at = data.expiresAt ? new Date(data.expiresAt).toISOString() : null;
  if (data.lastMessageAt !== undefined) payload.last_message_at = data.lastMessageAt ? new Date(data.lastMessageAt).toISOString() : null;
  if (data.topic !== undefined) payload.topic = data.topic || "";
  if (data.customerNickname !== undefined) payload.customer_nickname = data.customerNickname || "";
  if (data.customerAvatarUrl !== undefined) payload.customer_avatar_url = data.customerAvatarUrl || "";
  if (data.customerServiceBindingId !== undefined) {
    payload.customer_service_binding_id = data.customerServiceBindingId
      ? Number(data.customerServiceBindingId)
      : null;
  }

  return graphql(query, { id: resolvedSessionId, data: payload })
    .then((res) => normalizeConsultationSessionRow(res.data.update_consultation_session_by_pk))
    .then((session) => {
      if (session && session.id) {
        wx.setStorageSync(CHAT_SESSION_STORAGE_KEY, session.id);
      }
      return session;
    });
}

function reuseOrCreateConsultationSession(data = {}) {
  const customerAccountId = data.customerAccountId;
  const bindingPromise = data.customerServiceBindingId
    ? Promise.resolve({ id: String(data.customerServiceBindingId) })
    : (customerAccountId
      ? ensureCustomerServiceBinding({
        customerAccountId,
        advisorId: data.advisorId,
        serviceProviderId: data.serviceProviderId
      })
      : Promise.resolve(null));

  return bindingPromise.then((binding) => {
    const bindingId = binding && binding.id;
    const lookup = customerAccountId
      ? getBoundConsultationSession(customerAccountId, {
        serviceProviderId: data.serviceProviderId,
        advisorId: data.advisorId
      })
      : Promise.resolve(null);

    return lookup.then((existing) => {
      if (existing && existing.id) {
        const updateData = {
          orderId: data.orderId,
          advisorId: data.advisorId,
          managerAccountId: data.managerAccountId,
          serviceProviderId: data.serviceProviderId,
          customerServiceBindingId: bindingId,
          status: data.status || data.sessionStatus || "waiting",
          endedAt: null,
          lastMessageAt: new Date().toISOString(),
          topic: data.topic || data.remark || existing.topic,
          customerNickname: data.customerNickname || existing.customerNickname,
          customerAvatarUrl: data.customerAvatarUrl || existing.customerAvatarUrl
        };
        if (isServiceTimerActive(existing)) {
          const durationMinutes = Number(data.minutes || data.durationMinutes || existing.durationMinutes || 60);
          const currentExpiresAt = existing.expiresAt ? new Date(existing.expiresAt).getTime() : 0;
          const baseTime = Math.max(Date.now(), currentExpiresAt || 0);
          updateData.status = "active";
          updateData.expiresAt = new Date(baseTime + durationMinutes * 60 * 1000);
        } else {
          updateData.startedAt = null;
          updateData.expiresAt = null;
        }
        return updateConsultationSession(existing.id, updateData);
      }
      return createConsultationSession({
        ...data,
        customerServiceBindingId: bindingId
      });
    });
  });
}

function createConsultationSession(data = {}) {
  const query = `
    mutation CreateConsultationSession($object: consultation_session_insert_input!) {
      insert_consultation_session_one(object: $object) {
        id
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        service_provider_id
        status
        started_at
        expires_at
        last_message_at
        topic
        session_source
        customer_nickname
        customer_avatar_url
      }
    }
  `;
  const legacyQuery = `
    mutation CreateConsultationSession($object: consultation_session_insert_input!) {
      insert_consultation_session_one(object: $object) {
        id
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        status
        started_at
        expires_at
        last_message_at
      }
    }
  `;
  const nowIso = new Date().toISOString();
  const object = {
    order_id: data.orderId ? Number(data.orderId) : null,
    customer_account_id: data.customerAccountId ? Number(data.customerAccountId) : null,
    advisor_id: data.advisorId ? Number(data.advisorId) : null,
    manager_account_id: data.managerAccountId ? Number(data.managerAccountId) : null,
    service_provider_id: data.serviceProviderId ? Number(data.serviceProviderId) : null,
    status: data.status || "waiting",
    last_message_at: nowIso,
    topic: data.topic || data.remark || "",
    session_source: data.source || "miniapp",
    customer_nickname: data.customerNickname || "",
    customer_avatar_url: data.customerAvatarUrl || ""
  };
  if (data.startedAt) {
    object.started_at = new Date(data.startedAt).toISOString();
  }
  if (data.expiresAt) {
    object.expires_at = new Date(data.expiresAt).toISOString();
  }
  if (data.customerServiceBindingId) {
    object.customer_service_binding_id = Number(data.customerServiceBindingId);
  }
  const legacyObject = {
    order_id: object.order_id,
    customer_account_id: object.customer_account_id,
    advisor_id: object.advisor_id,
    manager_account_id: object.manager_account_id,
    status: object.status,
    last_message_at: object.last_message_at
  };
  if (object.started_at) {
    legacyObject.started_at = object.started_at;
  }
  if (object.expires_at) {
    legacyObject.expires_at = object.expires_at;
  }

  return graphql(query, { object })
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) {
        return graphql(legacyQuery, { object: legacyObject });
      }
      throw error;
    })
    .then((res) => res.data.insert_consultation_session_one)
    .then((session) => {
      if (session && session.id) {
        wx.setStorageSync(CHAT_SESSION_STORAGE_KEY, session.id);
      }
      return session;
    });
}

function ensureConsultationSession(context = {}) {
  const sessionId = context.sessionId || wx.getStorageSync(CHAT_SESSION_STORAGE_KEY);
  if (sessionId) {
    wx.setStorageSync(CHAT_SESSION_STORAGE_KEY, sessionId);
    return getConsultationSession(sessionId).then((session) => {
      if (!session) {
        return Promise.reject(new Error("bound session not found"));
      }
      return session;
    });
  }

  const customerAccountId = context.accountId || context.customerAccountId;
  if (customerAccountId) {
    return getBoundConsultationSession(customerAccountId, {
      serviceProviderId: context.serviceProviderId,
      advisorId: context.advisorId
    }).then((session) => {
      if (session && session.id) {
        wx.setStorageSync(CHAT_SESSION_STORAGE_KEY, session.id);
        if (session.orderId) {
          wx.setStorageSync("consultationOrderId", session.orderId);
        }
        return session;
      }
      return Promise.reject(new Error("missing bound consultation session"));
    });
  }

  return Promise.reject(new Error("missing bound consultation session"));
}

function updateConsultationSessionLastMessage(sessionId, sentAt) {
  if (!sessionId) return Promise.resolve(null);

  const query = `
    mutation UpdateConsultationSessionLastMessage($id: bigint!, $data: consultation_session_set_input!) {
      update_consultation_session_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        last_message_at
      }
    }
  `;

  return graphql(query, {
    id: Number(sessionId),
    data: {
      last_message_at: sentAt
    }
  }).then((res) => res.data.update_consultation_session_by_pk);
}

function insertConsultationMessage(message, context = {}) {
  const query = `
    mutation InsertMessage($object: consultation_message_insert_input!) {
      insert_consultation_message_one(object: $object) {
        id
        session_id
        content
        sender_role
        content_type
        client_message_id
        message_source
        delivery_status
        sent_at
      }
    }
  `;
  const legacyQuery = `
    mutation InsertMessage($object: consultation_message_insert_input!) {
      insert_consultation_message_one(object: $object) {
        id
        session_id
        content
        sender_role
        content_type
        sent_at
      }
    }
  `;
  const sentAt = new Date().toISOString();
  const object = {
    session_id: context.sessionId ? Number(context.sessionId) : null,
    sender_account_id: context.accountId ? Number(context.accountId) : null,
    sender_role: context.senderRole || "customer",
    content: message,
    content_type: context.contentType || "text",
    client_message_id: context.clientMessageId || makeClientMessageId(),
    message_source: context.source || "miniapp",
    delivery_status: "saved",
    sent_at: sentAt
  };
  if (context.replacesMessageId) {
    object.replaces_message_id = Number(context.replacesMessageId);
  }
  const legacyObject = {
    session_id: object.session_id,
    sender_account_id: object.sender_account_id,
    sender_role: object.sender_role,
    content: object.content,
    content_type: object.content_type,
    sent_at: object.sent_at
  };

  return graphql(query, { object })
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) {
        return graphql(legacyQuery, { object: legacyObject });
      }
      throw error;
    })
    .then((res) => res.data.insert_consultation_message_one)
    .then((savedMessage) => updateConsultationSessionLastMessage(savedMessage.session_id, sentAt)
      .catch(() => null)
      .then(() => savedMessage));
}

function sendChatMessage(message, context = {}) {
  const sessionId = context.sessionId || wx.getStorageSync("consultationSessionId");
  return getConsultationSession(sessionId)
    .then((session) => {
      if (!session) {
        throw new Error("session not found");
      }
      if (session.status === "closed") {
        throw new Error("session expired");
      }
      if (isServiceTimerActive(session)) {
        const expiresAt = resolveEffectiveSessionExpiry(session);
        if (!expiresAt || expiresAt <= Date.now()) {
          throw new Error("session expired");
        }
      } else if (isServiceTimerStarted(session)) {
        throw new Error("session expired");
      }
      const userInfo = wx.getStorageSync("userInfo") || {};
      const senderRole = context.senderRole || "customer";
      if (
        senderRole === "customer"
        && session.customerAccountId
        && userInfo.id
        && String(session.customerAccountId) !== String(userInfo.id)
      ) {
        throw new Error("session mismatch");
      }
      return session;
    })
    .then((session) => {
      const senderRole = context.senderRole || "customer";
      if (senderRole === "manager" && !isServiceTimerActive(session)) {
        return startConsultationServiceTimer(session);
      }
      return session;
    })
    .then((session) => insertConsultationMessage(message, {
      ...context,
      sessionId: session.id
    }))
    .then((savedMessage) => ({
      ...savedMessage,
      sessionId: savedMessage.session_id
    }));
}

function isUsernameAvailable(userName) {
  const name = String(userName || "").trim();
  if (!name || name.length > 80) return Promise.resolve(false);
  if (!wx.getStorageSync("zionJwt")) return Promise.reject(new Error("请先微信登录"));
  // The backend checks globally and returns only a boolean; account RLS stays self-only.
  const query = `mutation CheckUsername($args: Json!) {
    fz_invoke_action_flow(actionFlowId: "9f60a0be-4628-4268-a769-661264846cf4", versionId: 1, args: $args)
  }`;
  return graphql(query, {args:{operation:"CHECK_USERNAME",payload:{name}}}).then((response) => {
    let output = response.data && response.data.fz_invoke_action_flow;
    if (typeof output === "string") output = JSON.parse(output);
    let result = output && (output.result || output);
    if (typeof result === "string") result = JSON.parse(result);
    if (!result || result.ok !== true || !result.data || typeof result.data.available !== "boolean") {
      throw new Error("用户名校验暂不可用，请稍后重试");
    }
    return result.data.available;
  });
}

// 微信身份登录：wx.login → Zion 按 openid 创建/复用唯一账户 → 用户名+头像写入后端。
// 一个微信只对应一个 account；用户名在全局唯一。
function loginWithWechatIdentity(profile = {}) {
  const wxLogin = () => new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve(res.code);
          return;
        }
        reject(new Error("微信登录失败，请重试"));
      },
      fail: () => reject(new Error("微信登录失败，请重试"))
    });
  });

  return wxLogin()
    .then((code) => requestZionWechatMiniAppLogin(code))
    .then((loginResult) => {
      const accountId = String(loginResult.account.id);
      return getAccountProfile(accountId).then((backendUser) => ({ backendUser, accountId }));
    })
    .then(({ backendUser, accountId }) => {
      const nickNameInput = String(profile.nickName || "").trim();
      const avatarInput = profile.avatarUrl || "";
      const existingName = String(backendUser.username || backendUser.nickName || "").trim();
      const hasValidAvatar = (url) => Boolean(url) && !/^wxfile:\/\//.test(url);
      const hasEstablishedProfile = Boolean(
        existingName && existingName !== "微信用户" && hasValidAvatar(backendUser.avatarUrl)
      );

      if (!hasEstablishedProfile) {
        if (!nickNameInput) {
          return Promise.reject(new Error("请填写用户名"));
        }
        if (!avatarInput && !backendUser.avatarUrl) {
          return Promise.reject(new Error("请选择头像"));
        }
      }

      const shouldUpdate = Boolean(nickNameInput || avatarInput);
      if (hasEstablishedProfile && !shouldUpdate) {
        return Promise.resolve({
          isNewAccount: false,
          user: backendUser,
          token: wx.getStorageSync("zionJwt")
        });
      }

      const finalName = nickNameInput || existingName;
      const finalAvatar = avatarInput || backendUser.avatarUrl || "";

      return isUsernameAvailable(finalName, accountId).then((available) => {
        const keepingOwnUsername = Boolean(existingName && finalName === existingName);
        if (!available && !keepingOwnUsername) {
          return Promise.reject(new Error("该用户名已被使用，请换一个"));
        }

        const uploadPromise = avatarInput && !/^https:\/\//.test(avatarInput)
          ? uploadImage(avatarInput)
          : Promise.resolve({
            url: finalAvatar,
            imageId: backendUser.avatarImageId || ""
          });

        return uploadPromise.then((uploaded) => saveAccountProfile({
          accountId,
          userName: finalName,
          avatarUrl: uploaded.url || finalAvatar,
          avatarImageId: uploaded.imageId ? String(uploaded.imageId) : "",
          role: backendUser.role || "customer",
          phone: backendUser.phone || ""
        })).then(() => getAccountProfile(accountId)).then((finalUser) => ({
          isNewAccount: !hasEstablishedProfile,
          user: finalUser,
          token: wx.getStorageSync("zionJwt")
        }));
      });
    });
}

function loginWithWechat(code, profile = {}) {
  if (!code) {
    return Promise.reject(new Error("缺少微信登录 code，请重新点击登录。"));
  }

  const loginPayload = {
    code,
    appid: WECHAT_APP_ID,
    profile: {
      nickName: profile.nickName || "",
      avatarUrl: profile.avatarUrl || "",
      loginAt: profile.loginAt || Date.now(),
      source: profile.source || "wechat-miniapp"
    },
    phoneCode: profile.phoneCode || "",
    phoneAuthAt: profile.phoneAuthAt || 0
  };

  return requestZionWechatMiniAppLogin(code).then((loginResult) => {
    const accountId = String(loginResult.account.id);
    const token = loginResult.jwt && loginResult.jwt.token ? loginResult.jwt.token : "";

    // 可选增强：如果拿到了微信手机号授权 code（付费能力开通后），走 Action Flow 换取真实手机号。
    const phoneExchange = profile.phoneCode
      ? requestWechatLoginActionFlow({
        login_code: code,
        phone_code: profile.phoneCode,
        nick_name: profile.nickName || "",
        avatar_url: profile.avatarUrl || "",
        raw_profile_json: { ...loginPayload, submittedAt: new Date().toISOString() }
      }, loginPayload).catch((error) => {
        console.warn("wechat phone code exchange failed", error);
        return null;
      })
      : Promise.resolve(null);

    return syncWechatProfileToAccount(accountId, profile)
      .then(() => phoneExchange)
      .then(() => getAccountProfile(accountId).catch(() => null))
      .then((backendUser) => ({
        actionFlowResult: null,
        token,
        user: backendUser && backendUser.id ? backendUser : {
          id: accountId,
          nickName: profile.nickName || loginResult.account.username || "微信用户",
          avatarUrl: profile.avatarUrl || loginResult.account.profileImageUrl || "",
          role: "customer",
          phone: loginResult.account.phoneNumber || ""
        },
        payload: loginPayload
      }));
  });
}

function getAccountProfile(accountId) {
  const resolvedAccountId = toDatabaseId(accountId);
  if (!resolvedAccountId) {
    return Promise.reject(new Error("missing account id"));
  }

  const query = `
    query GetAccountProfile($id: bigint!) {
      account_by_pk(id: $id) {
        id
        username
        oauth2_user_info_map
        wechat_nickname
        wechat_avatar_url
        fz_phone_number
        user_type
        account_profile_id
        account_profile {
          id
          user_name
          avatar_url
          avatar_image {
            id
            url
          }
          city
          address
          gender
          birthday
          phone
          wechat_avatar_url
          location_info
        }
      }
    }
  `;

  return graphql(query, { id: resolvedAccountId }).then((res) => normalizeAccount(res.data.account_by_pk));
}

function saveAccountProfile(profile = {}) {
  if (!profile.accountId) {
    return Promise.reject(new Error("missing account id"));
  }

  const getQuery = `
    query GetAccountProfile($id: bigint!) {
      account_by_pk(id: $id) {
        id
        username
        oauth2_user_info_map
        wechat_nickname
        wechat_avatar_url
        fz_phone_number
        user_type
        account_profile_id
        account_profile {
          id
          user_name
          avatar_url
          avatar_image {
            id
            url
          }
          city
          address
          gender
          birthday
          phone
          wechat_avatar_url
          location_info
        }
      }
    }
  `;
  const updateAccountQuery = `
    mutation SaveAccountProfile($id: bigint!, $data: account_set_input!) {
      update_account_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        username
        oauth2_user_info_map
        wechat_nickname
        wechat_avatar_url
        fz_phone_number
        user_type
        account_profile_id
        account_profile {
          id
          user_name
          avatar_url
          avatar_image {
            id
            url
          }
          city
          address
          gender
          birthday
          phone
          wechat_avatar_url
          location_info
        }
      }
    }
  `;
  const insertProfileQuery = `
    mutation InsertAccountProfile($object: account_profile_insert_input!) {
      insert_account_profile_one(object: $object) {
        id
        user_name
        avatar_url
        avatar_image {
          id
          url
        }
        city
        address
        gender
        birthday
        phone
        wechat_avatar_url
        location_info
      }
    }
  `;
  const updateProfileQuery = `
    mutation UpdateAccountProfile($id: bigint!, $data: account_profile_set_input!) {
      update_account_profile_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        user_name
        avatar_url
        avatar_image {
          id
          url
        }
        city
        address
        gender
        birthday
        phone
        wechat_avatar_url
        location_info
      }
    }
  `;


  return graphql(getQuery, { id: Number(profile.accountId) }).then((accountRes) => {
    const currentAccount = accountRes.data.account_by_pk || {};
    const linkedProfile = currentAccount.account_profile && typeof currentAccount.account_profile === "object"
      ? currentAccount.account_profile
      : {};
    const currentProfile = {
      ...getStoredAccountProfile(
        currentAccount.oauth2_user_info_map && typeof currentAccount.oauth2_user_info_map === "object"
          ? currentAccount.oauth2_user_info_map
          : {}
      ),
      ...linkedProfile
    };
    const profileRecord = {
      ...currentProfile,
      user_name: profile.userName || "",
      avatar_url: profile.avatarUrl || "",
      region: profile.region || "",
      city: profile.region || "",
      address: profile.address || (profile.locationInfo && profile.locationInfo.address) || "",
      location_name: profile.locationName || (profile.locationInfo && profile.locationInfo.name) || "",
      latitude: profile.locationInfo && profile.locationInfo.latitude,
      longitude: profile.locationInfo && profile.locationInfo.longitude,
      location_info: profile.locationInfo || null,
      gender: profile.gender || "",
      birthday: profile.birthday || "",
      updated_at: new Date().toISOString()
    };
    const profileData = {
      user_name: profileRecord.user_name,
      avatar_url: profileRecord.avatar_url,
      city: profileRecord.city,
      address: profileRecord.address,
      gender: profileRecord.gender,
      birthday: profileRecord.birthday || null,
      phone: profile.phone || currentAccount.fz_phone_number || "",
      wechat_avatar_url: profileRecord.avatar_url,
      location_info: profileRecord.location_info
    };
    if (profile.avatarImageId) {
      profileData.avatar_image_id = Number(profile.avatarImageId);
    }
    const saveProfilePromise = currentAccount.account_profile_id
      ? graphql(updateProfileQuery, {
        id: Number(currentAccount.account_profile_id),
        data: profileData
      }).then((profileRes) => profileRes.data.update_account_profile_by_pk)
      : graphql(insertProfileQuery, { object: profileData }).then((profileRes) => profileRes.data.insert_account_profile_one);

    return saveProfilePromise.then((savedProfile) => {
      const nextRole = currentAccount.user_type === "manager"
        ? "manager"
        : (profile.role || currentAccount.user_type || "customer");
      const data = {
        // H5 OAuth uses this stable identifier to recover the same account.
        username: /^wxh5_[a-f0-9]{36}$/.test(currentAccount.username || "")
          ? currentAccount.username : (profile.userName || ""),
        wechat_nickname: profile.userName || "",
        wechat_avatar_url: profile.avatarUrl || "",
        user_type: nextRole,
        account_profile_id: savedProfile && savedProfile.id ? Number(savedProfile.id) : currentAccount.account_profile_id
      };

      return graphql(updateAccountQuery, {
        id: Number(profile.accountId),
        data
      });
    });
  }).then((res) => {
    const savedAccount = normalizeAccount(res.data.update_account_by_pk);
    // Staff capabilities and identity are maintained by the backend only.
    // Display names/avatars are read from the related account after profile save.
    return savedAccount;
  });
}

function createPaymentOrder(data = {}) {
  const query = `
    mutation CreateConsultationOrder($object: consultation_order_insert_input!) {
      insert_consultation_order_one(object: $object) {
        id
        order_no
        advisor_id
        amount
        duration_minutes
        status
        customer_account_id
        remark
        problem_category
        issue_summary
        booking_source
      }
    }
  `;
  const legacyQuery = `
    mutation CreateConsultationOrder($object: consultation_order_insert_input!) {
      insert_consultation_order_one(object: $object) {
        id
        order_no
        advisor_id
        amount
        duration_minutes
        status
      }
    }
  `;
  const orderNo = `EM${Date.now()}`;
  const object = {
    order_no: orderNo,
    advisor_id: data.advisorId ? Number(data.advisorId) : null,
    customer_account_id: data.customerAccountId ? Number(data.customerAccountId) : null,
    amount: data.price || data.amount || 200,
    duration_minutes: data.minutes || data.durationMinutes || 60,
    status: "created",
    payment_provider: "wechat",
    remark: data.remark || "",
    problem_category: data.problemCategory || data.category || "情感问答",
    issue_summary: data.issueSummary || data.remark || "",
    booking_source: data.source || "miniapp"
  };
  const legacyObject = {
    order_no: object.order_no,
    advisor_id: object.advisor_id,
    amount: object.amount,
    duration_minutes: object.duration_minutes,
    status: object.status,
    payment_provider: object.payment_provider,
    remark: object.remark
  };

  return graphql(query, {
    object
  }).catch((error) => {
    if (isSchemaCompatibilityError(error)) {
      return graphql(legacyQuery, { object: legacyObject });
    }
    throw error;
  }).then((res) => ({
    orderId: res.data.insert_consultation_order_one.id,
    orderNo,
    payParams: null
  }));
}

function confirmPayment(orderId) {
  const options = arguments[1] || {};
  const query = `
    mutation ConfirmPayment($id: bigint!, $data: consultation_order_set_input!) {
      update_consultation_order_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        status
        paid_at
        chat_available_until
      }
    }
  `;
  const paidAt = new Date();
  const durationMinutes = options.minutes || options.durationMinutes || 60;
  const chatAvailableUntil = new Date(paidAt.getTime() + durationMinutes * 60 * 1000);

  return graphql(query, {
    id: Number(orderId),
    data: {
      status: "paid",
      paid_at: paidAt.toISOString(),
      chat_available_until: chatAvailableUntil.toISOString()
    }
  }).then((res) => reuseOrCreateConsultationSession({
    orderId,
    customerAccountId: options.customerAccountId,
    advisorId: options.advisorId,
    managerAccountId: options.managerAccountId,
    serviceProviderId: options.serviceProviderId,
    status: options.sessionStatus || "waiting",
    sessionStatus: options.sessionStatus || "waiting",
    minutes: durationMinutes,
    topic: options.topic,
    source: options.source || "miniapp",
    customerNickname: options.customerNickname,
    customerAvatarUrl: options.customerAvatarUrl
  }).catch(() => null).then((session) => ({
    ...res,
    session
  })));
}

function confirmSessionRenewal(orderId, options = {}) {
  const sessionId = options.sessionId || options.conversationId;
  if (!orderId || !sessionId) {
    return Promise.reject(new Error("missing order or session id"));
  }

  const paidAt = new Date();
  const durationMinutes = options.minutes || options.durationMinutes || 60;
  const updateOrderQuery = `
    mutation ConfirmRenewalOrder($id: bigint!, $data: consultation_order_set_input!) {
      update_consultation_order_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        status
        paid_at
        chat_available_until
      }
    }
  `;
  const updateSessionQuery = `
    mutation RenewConsultationSession($id: bigint!, $data: consultation_session_set_input!) {
      update_consultation_session_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        order_id
        status
        started_at
        ended_at
        expires_at
        last_message_at
      }
    }
  `;

  return getConsultationSession(sessionId).then(() => {
    const chatAvailableUntil = new Date(paidAt.getTime() + durationMinutes * 60 * 1000);
    const renewalData = {
      status: "paid",
      paid_at: paidAt.toISOString(),
      chat_available_until: chatAvailableUntil.toISOString()
    };
    const sessionData = {
      order_id: Number(orderId),
      started_at: null,
      expires_at: null,
      ended_at: null,
      status: "waiting"
    };

    return graphql(updateOrderQuery, {
      id: Number(orderId),
      data: renewalData
    }).then((orderRes) => graphql(updateSessionQuery, {
      id: Number(sessionId),
      data: sessionData
    }).then((sessionRes) => ({
      order: orderRes.data.update_consultation_order_by_pk,
      session: sessionRes.data.update_consultation_session_by_pk,
      expiresAt: ""
    })));
  });
}

function listCustomerMessagesForSessions(sessionIds = []) {
  const ids = (sessionIds || [])
    .map((id) => Number(id))
    .filter((id) => id && !Number.isNaN(id));
  if (!ids.length) {
    return Promise.resolve({ messagesBySession: {} });
  }

  const query = `
    query ListCustomerMessagesForSessions($sessionIds: [bigint!]!) {
      consultation_message(
        where: {
          session_id: { _in: $sessionIds },
          sender_role: { _eq: "customer" }
        }
        order_by: { id: asc }
        limit: 2000
      ) {
        id
        session_id
        sender_role
        sent_at
      }
    }
  `;

  return graphql(query, { sessionIds: ids }).then((res) => {
    const messagesBySession = {};
    (res.data.consultation_message || []).forEach((item) => {
      const sessionId = String(item.session_id);
      if (!messagesBySession[sessionId]) {
        messagesBySession[sessionId] = [];
      }
      messagesBySession[sessionId].push({
        id: String(item.id),
        sessionId,
        senderRole: item.sender_role,
        sentAt: item.sent_at
      });
    });
    return { messagesBySession };
  });
}

function normalizeConsultationMessage(item = {}) {
  return {
    id: String(item.id),
    sessionId: item.session_id ? String(item.session_id) : "",
    accountId: item.sender_account_id ? String(item.sender_account_id) : "",
    senderRole: item.sender_role || "",
    role: item.sender_role === "manager" ? "assistant" : "user",
    content: item.content || "",
    contentType: item.content_type || "text",
    sentAt: item.sent_at || "",
    isRecalled: !!item.is_recalled,
    recalledAt: item.recalled_at || "",
    recalledByAccountId: item.recalled_by_account_id ? String(item.recalled_by_account_id) : "",
    recalledContent: item.recalled_content || "",
    visibleToCustomer: item.visible_to_customer !== false,
    replacesMessageId: item.replaces_message_id ? String(item.replaces_message_id) : "",
    replacedByMessageId: item.replaced_by_message_id ? String(item.replaced_by_message_id) : ""
  };
}

function getConsultationMessageById(messageId) {
  if (!messageId) return Promise.resolve(null);

  const query = `
    query GetConsultationMessageById($id: bigint!) {
      consultation_message_by_pk(id: $id) {
        ${CONSULTATION_MESSAGE_FIELDS}
      }
    }
  `;

  return graphql(query, { id: Number(messageId) })
    .then((res) => {
      const row = res.data.consultation_message_by_pk;
      if (!row) return null;
      return normalizeConsultationMessage(row);
    })
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) {
        const legacyQuery = `
          query GetConsultationMessageById($id: bigint!) {
            consultation_message_by_pk(id: $id) {
              id
              session_id
              sender_account_id
              sender_role
              content
              content_type
              sent_at
            }
          }
        `;
        return graphql(legacyQuery, { id: Number(messageId) })
          .then((legacyRes) => {
            const row = legacyRes.data.consultation_message_by_pk;
            if (!row) return null;
            return normalizeConsultationMessage(row);
          });
      }
      throw error;
    });
}

function recallManagerMessage(messageId, managerAccountId) {
  return getConsultationMessageById(messageId)
    .then((message) => {
      if (!message || !message.id) {
        throw new Error("message not found");
      }
      if (message.senderRole !== "manager") {
        throw new Error("only manager messages can be recalled");
      }
      if (message.isRecalled) {
        throw new Error("already recalled");
      }
      const sentAt = message.sentAt ? new Date(message.sentAt).getTime() : 0;
      if (!sentAt || Date.now() - sentAt > MANAGER_RECALL_WINDOW_MS) {
        throw new Error("recall window expired");
      }
      if (
        managerAccountId
        && message.accountId
        && String(message.accountId) !== String(managerAccountId)
      ) {
        throw new Error("only sender can recall");
      }

      const recalledAt = new Date().toISOString();
      const query = `
        mutation RecallManagerMessage($id: bigint!, $data: consultation_message_set_input!) {
          update_consultation_message_by_pk(pk_columns: { id: $id }, _set: $data) {
            id
            is_recalled
            recalled_at
            recalled_by_account_id
            recalled_content
            visible_to_customer
            replaced_by_message_id
          }
        }
      `;

      return graphql(query, {
        id: Number(messageId),
        data: {
          is_recalled: true,
          recalled_at: recalledAt,
          recalled_by_account_id: managerAccountId ? Number(managerAccountId) : null,
          recalled_content: message.content || "",
          visible_to_customer: false,
          content: ""
        }
      }).then((res) => normalizeConsultationMessage(res.data.update_consultation_message_by_pk || {}));
    });
}

function resendRecalledManagerMessage(data = {}) {
  const replacesMessageId = data.replacesMessageId || data.replaceMessageId;
  if (!replacesMessageId) {
    return sendChatMessage(data.content, {
      sessionId: data.sessionId || data.conversationId,
      accountId: data.managerAccountId,
      senderRole: "manager",
      source: "manager-miniapp"
    });
  }

  return getConsultationMessageById(replacesMessageId)
    .then((original) => {
      if (!original || !original.id) {
        throw new Error("recall target not found");
      }
      if (!original.isRecalled) {
        throw new Error("message not recalled");
      }
      if (
        data.managerAccountId
        && original.recalledByAccountId
        && String(original.recalledByAccountId) !== String(data.managerAccountId)
      ) {
        throw new Error("recall owner mismatch");
      }

      const sessionId = data.sessionId || data.conversationId || original.sessionId;
      return getConsultationSession(sessionId)
        .then((session) => {
          if (!session) {
            throw new Error("session not found");
          }
          if (session.status === "closed") {
            throw new Error("session expired");
          }
          if (isServiceTimerActive(session)) {
            return session;
          }
          if (isServiceTimerStarted(session)) {
            throw new Error("session expired");
          }
          return startConsultationServiceTimer(session);
        })
        .then((session) => insertConsultationMessage(data.content, {
          sessionId: session.id,
          accountId: data.managerAccountId,
          senderRole: "manager",
          source: "manager-miniapp-reedit",
          replacesMessageId
        }).then((savedMessage) => {
        const query = `
          mutation LinkRecalledManagerMessage($id: bigint!, $data: consultation_message_set_input!) {
            update_consultation_message_by_pk(pk_columns: { id: $id }, _set: $data) {
              id
              replaced_by_message_id
            }
          }
        `;
        return graphql(query, {
          id: Number(replacesMessageId),
          data: {
            replaced_by_message_id: Number(savedMessage.id)
          }
        })
          .catch((error) => {
            if (isSchemaCompatibilityError(error)) {
              return null;
            }
            throw error;
          })
          .then(() => ({
            ...savedMessage,
            replacesMessageId: String(replacesMessageId)
          }));
        }));
    });
}

function getSessionMessages(sessionId, options = {}) {
  const resolvedSessionId = toDatabaseId(sessionId);
  if (!resolvedSessionId) return Promise.resolve({ messages: [] });
  const viewerRole = options.viewerRole || "customer";
  const where = { session_id: { _eq: resolvedSessionId } };
  if (viewerRole === "customer") {
    where.visible_to_customer = { _eq: true };
  }

  const query = `
    query GetSessionMessages($where: consultation_message_bool_exp!) {
      consultation_message(
        where: $where
        order_by: { sent_at: asc }
        limit: 500
      ) {
        ${CONSULTATION_MESSAGE_FIELDS}
      }
    }
  `;

  const legacyQuery = `
    query GetSessionMessages($sessionId: bigint!) {
      consultation_message(
        where: { session_id: { _eq: $sessionId } }
        order_by: { sent_at: asc }
        limit: 500
      ) {
        id
        session_id
        sender_account_id
        sender_role
        content
        content_type
        sent_at
      }
    }
  `;

  return graphql(query, { where })
    .then((res) => ({
      messages: (res.data.consultation_message || []).map((item) => normalizeConsultationMessage(item))
    }))
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) {
        return graphql(legacyQuery, { sessionId: resolvedSessionId }).then((legacyRes) => ({
          messages: (legacyRes.data.consultation_message || []).map((item) => normalizeConsultationMessage(item))
        }));
      }
      throw error;
    });
}

function isServiceTimerStarted(session = {}) {
  const startedAt = session.startedAt ? new Date(session.startedAt).getTime() : 0;
  return !!(startedAt && !Number.isNaN(startedAt));
}

function isServiceTimerActive(session = {}) {
  if (!isServiceTimerStarted(session)) {
    return false;
  }
  const expiresAt = resolveEffectiveSessionExpiry(session);
  return expiresAt > Date.now();
}

function startConsultationServiceTimer(session = {}) {
  if (!session || !session.id) {
    return Promise.reject(new Error("missing session"));
  }
  if (isServiceTimerActive(session)) {
    return Promise.resolve(session);
  }
  const durationMinutes = Number(session.durationMinutes || 60);
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
  return updateConsultationSession(session.id, {
    status: "active",
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastMessageAt: startedAt.toISOString()
  });
}

function resolveEffectiveSessionExpiry(session = {}) {
  if (!session) return 0;
  if (session.status === "closed" || session.endedAt) {
    const endedAt = session.endedAt ? new Date(session.endedAt).getTime() : 0;
    const expiresAt = session.expiresAt ? new Date(session.expiresAt).getTime() : 0;
    return endedAt || expiresAt || Date.now() - 1;
  }

  if (!isServiceTimerStarted(session)) {
    return 0;
  }

  const durationMinutes = Number(session.durationMinutes || 60);
  const durationMs = durationMinutes * 60 * 1000;
  const expiresAt = session.expiresAt ? new Date(session.expiresAt).getTime() : 0;
  const orderUntil = session.chatAvailableUntil ? new Date(session.chatAvailableUntil).getTime() : 0;
  const startedAt = session.startedAt ? new Date(session.startedAt).getTime() : 0;

  let effective = 0;
  if (expiresAt && orderUntil) {
    effective = Math.min(expiresAt, orderUntil);
  } else {
    effective = expiresAt || orderUntil || 0;
  }

  if (startedAt && durationMs) {
    const startedBased = startedAt + durationMs;
    if (!effective || Number.isNaN(effective) || effective < startedAt) {
      effective = startedBased;
    }
  }

  return effective && !Number.isNaN(effective) ? effective : 0;
}

function getConsultationSession(sessionId) {
  if (!sessionId) return Promise.resolve(null);
  const query = `
    query GetConsultationSession($id: bigint!) {
      consultation_session_by_pk(id: $id) {
        id
        order_id
        customer_account_id
        manager_account_id
        service_provider_id
        status
        started_at
        ended_at
        expires_at
        last_message_at
        topic
        customer_nickname
        customer_avatar_url
      }
    }
  `;

  return graphql(query, { id: Number(sessionId) }).then((res) => {
    const session = res.data.consultation_session_by_pk;
    if (!session) return null;
    if (!session.order_id) {
      return normalizeConsultationSessionRow(session);
    }

    const orderQuery = `
      query GetConsultationOrderForSession($id: bigint!) {
        consultation_order_by_pk(id: $id) {
          duration_minutes
          chat_available_until
        }
      }
    `;

    return graphql(orderQuery, { id: Number(session.order_id) })
      .then((orderRes) => normalizeConsultationSessionRow({
        ...session,
        consultation_order: orderRes.data.consultation_order_by_pk
      }))
      .catch(() => normalizeConsultationSessionRow(session));
  });
}

function listManagerOrders(options = {}) {
  const query = `
    query ListManagerOrders {
      consultation_order(limit: 100, order_by: { created_at: desc }) {
        id
        created_at
        order_no
        customer_account_id
        advisor_id
        amount
        duration_minutes
        status
        paid_at
        chat_available_until
        remark
        problem_category
        issue_summary
        booking_source
      }
      consultation_session(limit: 100, order_by: { last_message_at: desc }) {
        id
        created_at
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        service_provider_id
        status
        started_at
        ended_at
        expires_at
        last_message_at
        topic
        customer_nickname
        customer_avatar_url
      }
      account(limit: 100) {
        id
        username
        wechat_nickname
        wechat_avatar_url
        account_profile {
          user_name
          avatar_url
        }
      }
    }
  `;

  return graphql(query).then((res) => {
    const accountsById = (res.data.account || []).reduce((map, account) => {
      map[String(account.id)] = account;
      return map;
    }, {});
    const sessions = res.data.consultation_session || [];
    const sessionsByOrderId = sessions.reduce((map, session) => {
      if (session.order_id && !map[String(session.order_id)]) {
        map[String(session.order_id)] = session;
      }
      return map;
    }, {});
    const orders = (res.data.consultation_order || []).map((order) => (
      normalizeManagerOrder(order, sessionsByOrderId[String(order.id)] || {}, accountsById)
    ));
    const sessionOnlyOrders = sessions
      .filter((session) => !session.order_id)
      .map((session) => normalizeManagerOrder({}, session, accountsById));
    const records = orders.concat(sessionOnlyOrders);

    return { orders: records };
  });
}

function getManagerOrderDetail(params = {}) {
  const orderId = params.orderId ? String(params.orderId) : "";
  const sessionId = params.sessionId ? String(params.sessionId) : "";
  return listManagerOrders({}).then((result) => {
    const order = (result.orders || []).find((item) => (
      (orderId && item.orderId === orderId) || (sessionId && item.sessionId === sessionId)
    ));
    const resolvedSessionId = sessionId || (order && order.sessionId);
    return getSessionMessages(resolvedSessionId).then((messagesResult) => ({
      order: order || null,
      sessionId: resolvedSessionId,
      messages: messagesResult.messages || []
    }));
  });
}

function listManagerSessions(options = "waiting") {
  const filters = typeof options === "string" ? { status: options } : (options || {});
  const query = `
    query ListSessions {
      consultation_session(limit: 50) {
        id
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        service_provider_id
        status
        started_at
        expires_at
        last_message_at
        topic
        customer_nickname
        customer_avatar_url
      }
      consultation_order(limit: 100, order_by: { created_at: desc }) {
        id
        problem_category
        issue_summary
        amount
        duration_minutes
        chat_available_until
      }
      account(limit: 100) {
        id
        username
        wechat_nickname
        wechat_avatar_url
        account_profile {
          user_name
          avatar_url
        }
      }
    }
  `;
  const legacyQuery = `
    query ListSessions {
      consultation_session(limit: 50) {
        id
        order_id
        customer_account_id
        advisor_id
        manager_account_id
        status
        started_at
        expires_at
        last_message_at
        topic
        customer_nickname
      }
      account(limit: 100) {
        id
        username
        wechat_nickname
        wechat_avatar_url
        account_profile {
          user_name
          avatar_url
        }
      }
    }
  `;

  return graphql(query)
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) {
        return graphql(legacyQuery);
      }
      throw error;
    })
    .then((res) => {
      const accountsById = (res.data.account || []).reduce((map, account) => {
        map[String(account.id)] = account;
        return map;
      }, {});
      const ordersById = (res.data.consultation_order || []).reduce((map, order) => {
        map[String(order.id)] = order;
        return map;
      }, {});
      const sessions = (res.data.consultation_session || [])
        .map((item) => normalizeManagerSession(item, accountsById, ordersById))
        .filter((item) => {
          if (filters.serviceProviderId && item.serviceProviderId === String(filters.serviceProviderId)) {
            return true;
          }
          if (filters.managerAccountId && item.managerAccountId === String(filters.managerAccountId)) {
            return true;
          }
          return !filters.serviceProviderId && !filters.managerAccountId;
        });
      return { sessions };
    });
}

function acceptConsultationOrder(data = {}) {
  const sessionId = data.sessionId || data.conversationId || data.id;
  if (!sessionId || Number.isNaN(Number(sessionId))) {
    return Promise.resolve({ id: sessionId || "", status: "active", localOnly: true });
  }

  const acceptedAt = new Date();
  const query = `
    mutation AcceptConsultationSession($id: bigint!, $data: consultation_session_set_input!) {
      update_consultation_session_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        status
        service_provider_id
        manager_account_id
        started_at
        last_message_at
        expires_at
      }
    }
  `;
  const legacyQuery = `
    mutation AcceptConsultationSession($id: bigint!, $data: consultation_session_set_input!) {
      update_consultation_session_by_pk(pk_columns: { id: $id }, _set: $data) {
        id
        status
        manager_account_id
        started_at
        last_message_at
        expires_at
      }
    }
  `;
  const object = {
    status: "active",
    last_message_at: acceptedAt.toISOString()
  };

  if (data.serviceProviderId) {
    object.service_provider_id = Number(data.serviceProviderId);
  }
  if (data.managerAccountId) {
    object.manager_account_id = Number(data.managerAccountId);
  }

  const legacyObject = {
    status: object.status,
    last_message_at: object.last_message_at
  };
  if (object.manager_account_id) {
    legacyObject.manager_account_id = object.manager_account_id;
  }

  return graphql(query, { id: Number(sessionId), data: object })
    .catch((error) => {
      if (isSchemaCompatibilityError(error)) {
        return graphql(legacyQuery, { id: Number(sessionId), data: legacyObject });
      }
      throw error;
    })
    .then((res) => res.data.update_consultation_session_by_pk);
}

function sendManagerReply(data) {
  if (data.replacesMessageId || data.replaceMessageId) {
    return resendRecalledManagerMessage(data);
  }
  return sendChatMessage(data.content, {
    sessionId: data.sessionId || data.conversationId,
    accountId: data.managerAccountId,
    senderRole: "manager",
    source: "manager-miniapp"
  });
}

module.exports = {
  PROJECT_ID,
  WECHAT_APP_ID,
  ZION_WEB_URL,
  ZION_GRAPHQL_URL,
  WECHAT_LOGIN_CLOUD_FUNCTION,
  WECHAT_LOGIN_BRIDGE_URL,
  CHAT_SESSION_STORAGE_KEY,
  graphql,
  listCourses,
  getCourse,
  listAdvisors,
  getAdvisor,
  getCustomerServiceBinding,
  resolveAdvisorServiceProvider,
  assertCanBookAdvisor,
  createCustomerServiceBinding,
  ensureCustomerServiceBinding,
  transferCustomerServiceBinding,
  listServiceProviders,
  getServiceProviderByAccount,
  createServiceProviderProfile,
  getDefaultManagerIdentity,
  createQuestion,
  getBoundConsultationSession,
  updateConsultationSession,
  reuseOrCreateConsultationSession,
  createConsultationSession,
  ensureConsultationSession,
  insertConsultationMessage,
  sendChatMessage,
  getSessionMessages,
  getConsultationMessageById,
  recallManagerMessage,
  resendRecalledManagerMessage,
  listCustomerMessagesForSessions,
  getConsultationSession,
  resolveEffectiveSessionExpiry,
  isServiceTimerStarted,
  startConsultationServiceTimer,
  listManagerOrders,
  getManagerOrderDetail,
  loginWithWechat,
  loginWithWechatIdentity,
  isUsernameAvailable,
  loginWithPhoneNumber,
  sendLoginVerificationCode,
  sendPhoneVerificationCode,
  bindPhoneNumberByCode,
  getAccountProfile,
  getCustomerAccountSummary,
  saveAccountProfile,
  uploadImage,
  createPaymentOrder,
  confirmPayment,
  confirmSessionRenewal,
  listManagerSessions,
  acceptConsultationOrder,
  sendManagerReply
};

},
"pages/index/index":function(require,module,exports,Page,wx,getApp,getCurrentPages){
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

},
"pages/plaza/plaza":function(require,module,exports,Page,wx,getApp,getCurrentPages){
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

},
"pages/course-detail/course-detail":function(require,module,exports,Page,wx,getApp,getCurrentPages){
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

},
"pages/chat/chat":function(require,module,exports,Page,wx,getApp,getCurrentPages){
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
    serviceDesc: "聊天服务尚未创建",
    systemText: "暂时还没有创建相应的聊天。",
    composerPlaceholder: "暂时还没有创建相应的聊天",
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
      serviceDesc: serviceEnded ? "您的服务聊天时间已经结束" : (timerStarted ? "1 小时文字服务正在进行" : (hasPaidSession ? "等待经理回复，回复后开始计时" : "聊天服务尚未创建")),
      composerPlaceholder: serviceEnded ? "服务已结束" : (hasAccess ? "输入想聊的问题" : "暂时还没有创建相应的聊天")
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
      serviceDesc: isManagerView ? "正在回复客户的咨询消息" : (this.data.hasAccess ? "1 小时文字服务正在进行" : "聊天服务尚未创建"),
      systemText: isManagerView ? "你正在以服务人员身份回复客户，消息会实时保存到后端记录。" : (wx.getStorageSync("consultationSessionId") ? "这里保留你的历史文字服务会话。" : "暂时还没有创建相应的聊天。"),
      composerPlaceholder: isManagerView ? "回复客户" : (this.data.hasAccess ? "输入想聊的问题" : "暂时还没有创建相应的聊天"),
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

},
"pages/profile/profile":function(require,module,exports,Page,wx,getApp,getCurrentPages){
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
    this.refreshCustomerSummary(storedUser.id);
    this.loadManagerAccess(storedUser);
    this.loadCheckinAccess();
    this.loadReferralAccess();
  },

  async loadReferralAccess() {
    const identity=viewSession.capture();this.setData({canInvite:false});
    try{const r=await require('../../utils/referral').context();if(viewSession.current(identity))this.setData({canInvite:!!r.canInvite});}catch(_){/* Keep privileged entry hidden on failure. */}
  },
  goReferrals(){wx.navigateTo({url:'/pages/referrals/referrals'});},

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

},
"pages/manager/manager":function(require,module,exports,Page,wx,getApp,getCurrentPages){
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

},
"pages/order-detail/order-detail":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const zion = require("../../utils/zion");
const chatContext = require("../../utils/chatContext");

let detailTimer = null;

Page({
  data: {
    statusBarHeight: 54,
    navHeight: 100,
    navPaddingRight: 190,
    loading: true,
    orderId: "",
    sessionId: "",
    order: null,
    messages: []
  },

  onLoad(query = {}) {
    this.setCustomNav();
    this.setData({
      orderId: query.orderId || "",
      sessionId: query.sessionId || ""
    });
    this.refreshDetail();
  },

  onShow() {
    this.startPolling();
  },

  onHide() {
    this.stopPolling();
  },

  onUnload() {
    this.stopPolling();
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

  refreshDetail() {
    return zion.getManagerOrderDetail({
      orderId: this.data.orderId,
      sessionId: this.data.sessionId
    })
      .then((result) => {
        this.setData({
          loading: false,
          order: result.order,
          sessionId: result.sessionId || this.data.sessionId,
          messages: result.messages || []
        });
      })
      .catch((error) => {
        console.warn("getManagerOrderDetail failed", error);
        this.setData({ loading: false });
        wx.showToast({ title: "读取记录失败", icon: "none" });
      });
  },

  startPolling() {
    this.stopPolling();
    detailTimer = setInterval(() => {
      this.refreshDetail();
    }, 3000);
  },

  stopPolling() {
    if (!detailTimer) return;
    clearInterval(detailTimer);
    detailTimer = null;
  },

  openChat() {
    if (!this.data.sessionId) return;
    const order = this.data.order || {};
    wx.setStorageSync("consultationSessionId", this.data.sessionId);
    wx.setStorageSync("currentChatRole", "manager");
    wx.setStorageSync("currentCustomerName", order.name || "客户");
    wx.setStorageSync("currentCustomerAvatarUrl", order.avatarUrl || "");
    wx.setStorageSync("currentCustomerAvatarText", order.avatarText || (order.name ? order.name.slice(0, 1) : "客"));
    wx.setStorageSync("currentSessionExpiresAt", order.expiresAt || "");
    wx.setStorageSync("currentSessionExpiresSessionId", this.data.sessionId);
    wx.setStorageSync("chatReturnUrl", `/pages/order-detail/order-detail?orderId=${this.data.orderId || ""}&sessionId=${this.data.sessionId}`);
    wx.setStorageSync("chatReturnSource", "manager-detail");
    chatContext.openChatPage({ role: "manager" });
  },

  goBack() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: "/pages/manager/manager?tab=serving" })
    });
  }
});

},
"pages/profile-edit/profile-edit":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const { userPortrait } = require("../../utils/mock");
const zion = require("../../utils/zion");

function extractCityName(location = {}) {
  const address = `${location.address || ""}`;
  const name = `${location.name || ""}`;
  const combined = `${address} ${name}`;
  const cityMatch = combined.match(/([^省市自治区特别行政区\s]{1,12}(?:市|盟|地区|自治州))/);
  if (cityMatch) return cityMatch[1];
  const directCityMatch = combined.match(/(北京|上海|天津|重庆|香港|澳门)/);
  if (directCityMatch) return `${directCityMatch[1]}${/香港|澳门/.test(directCityMatch[1]) ? "特别行政区" : "市"}`;
  return name || address || "";
}

const viewSession = require("../../utils/viewSession");
const auth = require("../../utils/auth");
const {readableError} = require("../../utils/serviceError");
Page({
  data: {defaultPortrait:userPortrait,avatarUrl:"",avatarImageId:"",userName:"",region:"",detailAddress:"",locationInfo:null,
    gender:"",genderOptions:["未设置","女","男","其他"],genderIndex:0,phone:"",birthday:"",accountId:"",
    loading:false,saving:false,error:"",usernameError:"",today:new Date().toISOString().slice(0,10)},
  onLoad() { this.unloaded=false;this.dirtyFields={};this.loadProfile();if(require("../../utils/loginReturn").restore(this,"profile-edit","")){Object.keys(this.data).forEach(k=>this.dirtyFields[k]=true);this.editVersion=1;} },
  onUnload() { this.unloaded=true; },
  active() { return !this.unloaded && viewSession.current(this.identity); },
  loadProfile() {
    if(!auth.requireLogin("登录后编辑自己的资料。"))return;
    this.identity=viewSession.capture();
    wx.removeStorageSync("profileDraft");
    const user=wx.getStorageSync("userInfo") || {};
    this.applyUser(user);
    return this.loadBackendProfile(user.id);
  },
  applyUser(user) {
    const gender=user.gender || "";
    const values={avatarUrl:user.avatarUrl || "",avatarImageId:user.avatarImageId || "",userName:user.username || user.nickName || "",
      region:user.region || "",detailAddress:user.address || "",locationInfo:user.locationInfo || null,
      gender,genderIndex:Math.max(0,this.data.genderOptions.indexOf(gender || "未设置")),phone:user.phone || "",birthday:user.birthday || "",accountId:user.id || ""};
    for(const key of Object.keys(values))if(this.dirtyFields && this.dirtyFields[key])delete values[key];
    this.setData(values);
  },
  async loadBackendProfile(accountId) {
    const identity=this.identity;this.setData({loading:true,error:""});
    try {
      const user=await zion.getAccountProfile(accountId);
      if(!this.active() || identity!==this.identity || !user || String(user.id)!==String(accountId))return;
      wx.setStorageSync("userInfo",{...(wx.getStorageSync("userInfo") || {}),...user});
      this.applyUser(user);
    } catch(e) { if(this.active())this.setData({error:readableError(e.message)}); }
    finally { if(this.active())this.setData({loading:false}); }
  },
  change(values) {
    this.dirtyFields=this.dirtyFields || {};
    Object.keys(values).forEach(k=>this.dirtyFields[k]=true);
    this.editVersion=(this.editVersion || 0)+1;
    this.setData({...values,error:"",usernameError:""});
    if(wx.enableAlertBeforeUnload)wx.enableAlertBeforeUnload({message:"资料尚未保存，确定离开吗？"});
  },
  onChooseAvatar(e) { if(!this.data.saving)this.change({avatarUrl:e.detail.avatarUrl || "",avatarImageId:""}); },
  isLocalAvatar(url) { return Boolean(url) && !/^https:\/\//.test(url); },
  onUserNameInput(e) { this.change({userName:e.detail.value}); },
  onRegionInput(e) { this.change({region:e.detail.value,locationInfo:null}); },
  onAddressInput(e) { this.change({detailAddress:e.detail.value,locationInfo:null}); },
  chooseRegion() {
    if(this.data.saving)return;
    if(typeof wx.chooseLocation!=="function"){this.setData({error:"当前无法定位，请手动填写地区和地址。"});return;}
    wx.chooseLocation({success:r=>{if(this.active())this.change({region:extractCityName(r),detailAddress:r.address || r.name || "",locationInfo:{name:r.name || "",address:r.address || "",latitude:r.latitude,longitude:r.longitude}});},
      fail:e=>{if(!/cancel/i.test(e.errMsg || ""))this.setData({error:"定位未完成，可直接手动填写地区和地址。"});}});
  },
  onGenderChange(e) {const genderIndex=Number(e.detail.value || 0);this.change({genderIndex,gender:genderIndex?this.data.genderOptions[genderIndex]:""});},
  onBirthdayChange(e) {this.change({birthday:e.detail.value});},
  async saveProfile() {
    if(this.data.saving || this.data.loading)return;
    if(!auth.requireLogin("登录后保存个人资料。") || !this.active())return;
    const form=JSON.parse(JSON.stringify(this.data)),version=this.editVersion || 0,identity=this.identity;
    const name=form.userName.trim();
    if(!name || name.length>80){this.setData({usernameError:"请填写1至80字的用户名"});return;}
    if(form.birthday && form.birthday>this.data.today){this.setData({error:"生日不能晚于今天"});return;}
    this.setData({saving:true,error:"",usernameError:""});
    try {
      if(!await zion.isUsernameAvailable(name,identity.accountId)){this.setData({usernameError:"该用户名已被使用，请换一个"});return;}
      if(!this.active())return;
      const avatar=this.isLocalAvatar(form.avatarUrl)?await zion.uploadImage(form.avatarUrl):{url:form.avatarUrl,imageId:form.avatarImageId};
      if(!this.active())return;
      const user=await zion.saveAccountProfile({accountId:identity.accountId,userName:name,avatarUrl:avatar.url || "",avatarImageId:avatar.imageId || "",
        region:form.region.trim(),address:form.detailAddress.trim(),locationInfo:form.locationInfo,gender:form.gender,birthday:form.birthday});
      if(!this.active() || identity!==this.identity)return;
      wx.setStorageSync("userInfo",{...(wx.getStorageSync("userInfo") || {}),...user});
      if((this.editVersion || 0)===version){
        this.dirtyFields={};this.applyUser(user);
        if(wx.disableAlertBeforeUnload)wx.disableAlertBeforeUnload();
        wx.showToast({title:"资料已保存",icon:"success"});
      }else wx.showToast({title:"已保存，新增修改仍待保存",icon:"none"});
    } catch(e) {if(this.active())this.setData({error:readableError(e.message)});}
    finally {if(!this.unloaded)this.setData({saving:false});}
  }
});

},
"pages/privacy/privacy":function(require,module,exports,Page,wx,getApp,getCurrentPages){
Page({
  data: {
    updatedAt: "2026年9月8日",
    basisItems: [
      "全国人大常委会法律文本",
      "中国政府网法规公开信息",
      "《中华人民共和国个人信息保护法》",
      "《中华人民共和国数据安全法》",
      "《中华人民共和国网络安全法》",
      "微信开放平台隐私保护要求"
    ],
    promiseItems: [
      { label: "最小必要", value: "只为登录、预约、支付、咨询和安全风控处理必要信息" },
      { label: "敏感保护", value: "问题描述和聊天内容仅用于履约、客服和争议处理" },
      { label: "权利可达", value: "可申请访问、更正、删除、撤回授权和注销账号" }
    ],
    dataGroups: [
      {
        title: "公开课与线下咨询",
        items: ["报名姓名、手机号、进群和到课核实记录", "预约时间、孩子称呼/年龄/年级、监护人与主要困扰", "老师沟通记录、执行建议、家长留言与执行反馈"],
        purpose: "用于报名联系、核实参加资格、安排咨询及持续跟进。请由监护人填写孩子信息。"
      },
      {
        title: "可选的沟通总结与录音",
        tag: "可选",
        items: ["主动提交的本次咨询文字沟通", "参与者同意后手动录制的面谈音频及同意时间", "转写文本、AI 总结草稿、老师检查后的记录"],
        purpose: "用于生成可供老师检查的沟通摘要。通过 Zion 配置的 AI 服务处理所选内容；不选择录音或总结也可以使用手动咨询记录与反馈。录音最长单段10分钟，可随时停止。"
      },
      {
        title: "账号与登录",
        items: [
          "微信昵称、头像、登录 code",
          "openid/unionid、Zion account id",
          "手机号授权 code 及后端换取后的手机号"
        ],
        purpose: "用于创建或识别账号、绑定手机号、展示个人资料和保障账号安全。"
      },
      {
        title: "预约与订单",
        items: [
          "咨询师、预约时间、服务时长",
          "订单号、金额、支付状态",
          "问题分类、问题摘要、服务来源"
        ],
        purpose: "用于创建 ¥200/小时的一对一文字咨询订单、安排服务、处理支付与售后。"
      },
      {
        title: "咨询会话",
        items: [
          "会话状态、开始和到期时间",
          "文字消息、发送者角色、发送时间",
          "客户昵称和头像、经理接单记录"
        ],
        purpose: "用于提供一对一文字问答、保存服务记录、处理客服和服务质量复核。"
      },
      {
        title: "服务人员权限",
        items: [
          "service_provider 身份",
          "可接单、可回复等权限状态",
          "服务统计和会话状态"
        ],
        purpose: "用于确认经理端访问权限，防止普通用户进入服务人员工作台。"
      }
    ],
    sections: [
      {
        title: "一、我们如何收集信息",
        paragraphs: [
          "当你使用微信登录、授权手机号、预约咨询、支付订单、进入文字咨询或联系服务人员时，我们会根据服务所必需的范围收集信息。我们不会因为你浏览页面而要求提供与当前功能无关的信息。",
          "情感问题描述、咨询聊天内容、关系状态等信息可能反映你的个人生活和情绪状态，属于需要更谨慎保护的信息。我们仅在提供咨询服务、客服支持、争议处理、安全审计和法律法规要求的范围内使用。"
        ]
      },
      {
        title: "二、我们如何使用信息",
        paragraphs: [
          "我们使用账号信息完成登录识别、手机号绑定和个人中心展示；使用预约和订单信息完成服务购买、支付确认、会话开通和售后处理；使用聊天信息完成一对一文字问答、经理接单、消息保存和服务复盘。",
          "本项目定位为情感问答服务，不提供医疗诊断、心理治疗、处方建议或疗效保证。我们不会将你的咨询内容公开展示，也不会将其用于与服务无关的营销画像。"
        ]
      },
      {
        title: "三、委托处理与第三方",
        paragraphs: [
          "为实现小程序能力，我们会使用微信提供的登录、手机号授权和支付能力；为实现后端数据存储、GraphQL 接口、会话和订单管理，我们会使用 Zion/Functorz 后端服务。",
          "服务人员仅能在后端确认其服务身份和权限后访问与其接单、回复和服务履约相关的信息。我们不会向无关第三方出售、出租或公开你的个人信息。"
        ]
      },
      {
        title: "四、安全措施",
        paragraphs: [
          "我们通过 HTTPS 接口传输数据，并将账号、订单、会话和消息写入后端数据库。项目规则要求不在小程序前端硬编码后台管理 Token，经理端入口也必须由后端身份和权限确认，而不是只依赖前端页面隐藏。",
          "我们会按最小权限原则限制信息访问。涉及咨询内容的记录会被视为高敏感服务数据，优先用于履约、客服、纠纷处理和合规留存。"
        ]
      },
      {
        title: "五、你的权利",
        paragraphs: [
          "你可以申请访问、复制、更正、补充或删除你的个人信息，也可以撤回部分授权、注销账号或要求我们解释个人信息处理规则。撤回授权或删除必要信息后，部分服务可能无法继续使用。",
          "你可以在微信授权管理中关闭头像、昵称、手机号等授权。"
        ]
      },
      {
        title: "六、未成年人保护",
        paragraphs: [
          "本服务主要面向具备独立判断能力的成年人。如果未满十四周岁的未成年人需要使用，应由监护人阅读并同意本协议。我们不会主动面向儿童收集与情感咨询服务无关的信息。"
        ]
      },
      {
        title: "七、协议更新",
        paragraphs: [
          "当服务功能、后端处理方式、第三方服务或法律要求发生重大变化时，我们会更新本协议，并通过页面提示或必要的授权流程告知你。若变更涉及敏感个人信息或处理目的变化，我们会按要求重新取得同意。"
        ]
      }
    ],
    rights: [
      "访问和复制个人信息",
      "更正或补充不准确资料",
      "删除非必要或超期信息",
      "撤回授权或注销账号",
      "解释说明处理规则",
      "投诉、反馈和联系客服"
    ]
  }
});

},
"pages/advisor/advisor":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const zion = require("../../utils/zion");
const auth = require("../../utils/auth");
const service = require("../../utils/consultationService");
Page({
  data: {advisor:null, loading:true, error:"", bookingButtonText:"查看线下咨询资格", bookingBlocked:false, paying:false},
  onLoad(query={}) {this.advisorId=query.id;this.refresh();},
  async refresh(){this.setData({loading:true,error:""});try{const r=await zion.getAdvisor(this.advisorId);this.setData({advisor:r.advisor || null,error:r.advisor?'':'该专家介绍不存在或暂不可用。'});}catch(e){this.setData({error:'专家介绍加载失败，请检查网络后重试。'});}finally{this.setData({loading:false});}},
  goBack(){wx.navigateBack({fail:()=>wx.switchTab({url:'/pages/index/index'})});},
  confirmAndPay() {
    if (!auth.requireLogin("登录后查看公开课参加情况及咨询预约资格。") || this.data.paying) return;
    this.setData({paying:true});
    service.call("MY_OVERVIEW").then(r=>wx.navigateTo({url:r.eligible?"/pages/customer/customer":"/pages/public-class/public-class"})).catch(e=>wx.showModal({title:"暂时无法读取预约资格",content:e.message,showCancel:false})).finally(()=>this.setData({paying:false}));
  }
});

},
"pages/search/search":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const zion=require('../../utils/zion');
Page({
 data:{mode:'advisors',keyword:'',items:[],results:[],searched:false,loading:false,error:''},
 onLoad(q={}){this.setData({mode:q.mode==='courses'?'courses':'advisors'});this.refresh();},
 async refresh(){this.setData({loading:true,error:''});try{
   const courses=this.data.mode==='courses';
   const r=await (courses?zion.listCourses({limit:50}):zion.listAdvisors({limit:50}));
   const items=(courses?r.courses:r.advisors)||[];
   this.setData({items:items.map(i=>({...i,displayTags:(i.tags||[]).slice(0,3),detailUrl:(courses?'/pages/course-detail/course-detail?id=':'/pages/advisor/advisor?id=')+encodeURIComponent(i.id)}))});this.runSearch(this.data.keyword);
  }catch(e){this.setData({items:[],results:[],error:'搜索内容暂时加载失败，请重试。'});}finally{this.setData({loading:false});}},
 onKeywordInput(e){this.setData({keyword:e.detail.value});this.runSearch(e.detail.value);},
 clearKeyword(){this.setData({keyword:'',results:[],searched:false});},
 runSearch(value){const keyword=String(value||'').trim().toLowerCase();this.setData({searched:!!keyword,results:keyword?this.data.items.filter(i=>[i.name,i.title,i.subtitle,i.bio,i.company,(i.tags||[]).join(' '),(i.topics||[]).join(' ')].some(v=>String(v||'').toLowerCase().includes(keyword))):[]});},
});

},
"pages/customer/customer":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('../../utils/consultationService');
const auth=require('../../utils/auth');
const chatContext=require('../../utils/chatContext');
Page({
 data:{loading:false,busy:false,error:'',isLoggedIn:false,eligible:false,enrollments:[],appointments:[],nextAppointmentCursor:null,moreLoading:false,showForm:false,form:{name:'',phone:'',requestedTime:'',concerns:''}},
 onLoad(){if(require("../../utils/loginReturn").restore(this,"customer",""))this.bookingKey=service.requestKey();},
 onShow(){chatContext.enterCustomerView();this.refresh();},
 refresh(){const generation=this.listGeneration=(this.listGeneration||0)+1;this.setData({moreLoading:false});
  const user=auth.getLoggedInUser();this.setData({isLoggedIn:!!user,error:''});if(!user){this.setData({enrollments:[],appointments:[],eligible:false});return;}
  this.setData({loading:true});
  service.call('MY_OVERVIEW',{paginate:true}).then(data=>generation===this.listGeneration && this.setData({eligible:data.eligible,enrollments:(data.enrollments||[]).map(service.decorate),appointments:(data.appointments||[]).map(service.decorate),nextAppointmentCursor:data.nextAppointmentCursor||null})).catch(e=>{if(generation===this.listGeneration)service.error(this,e);}).finally(()=>{if(generation===this.listGeneration)this.setData({loading:false});});
 },
 async moreAppointments(){if(this.data.loading||this.data.moreLoading||!this.data.nextAppointmentCursor)return;const generation=this.listGeneration||0;this.setData({moreLoading:true});try{const r=await service.call('MY_OVERVIEW',{paginate:true,appointmentCursor:this.data.nextAppointmentCursor});if(generation!==(this.listGeneration||0))return;this.setData({appointments:this.data.appointments.concat((r.appointments||[]).map(service.decorate)),nextAppointmentCursor:r.nextAppointmentCursor||null});}catch(e){if(generation===(this.listGeneration||0))service.error(this,e);}finally{if(generation===(this.listGeneration||0))this.setData({moreLoading:false});}},
 login(){auth.requireLogin('登录后查看自己的报名、预约和咨询记录。');},
 goClasses(){wx.navigateTo({url:'/pages/public-class/public-class'});},
 goMine(){wx.navigateTo({url:'/pages/my-enrollments/my-enrollments'});},
 openClass(e){wx.navigateTo({url:'/pages/class-ticket/class-ticket?id='+e.currentTarget.dataset.id});},
 openAppointment(e){wx.navigateTo({url:'/pages/consultation-detail/consultation-detail?id='+e.currentTarget.dataset.id});},
 apply(){if(!auth.requireLogin())return;if(this.data.showForm)return;if(!this.data.eligible){this.goClasses();return;}const e=this.data.enrollments.find(i=>i.attendance_status==='ATTENDED')||{};this.bookingKey=service.requestKey();this.setData({showForm:true,error:'',form:{name:e.registrant_name||'',phone:e.phone||'',requestedTime:'',concerns:''}});},
 input(e){const key=e.currentTarget.dataset.key;if(['name','phone','requestedTime','concerns'].includes(key))this.setData({['form.'+key]:e.detail.value});},
 closeForm(){if(!this.data.busy)this.setData({showForm:false});},
 submit(){if(this.data.busy)return;const f=this.data.form;if(!f.name.trim()||!/^1[3-9]\d{9}$/.test(f.phone)||!f.requestedTime.trim()||!f.concerns.trim()){service.error(this,new Error('请填写姓名、有效手机号、期望时间和本次困扰'));return;}this.setData({busy:true,error:''});service.call('CREATE_APPOINTMENT',{...this.data.form,requestKey:this.bookingKey}).then(r=>{this.setData({showForm:false});wx.navigateTo({url:'/pages/consultation-detail/consultation-detail?id='+r.id});}).catch(e=>service.error(this,e)).finally(()=>this.setData({busy:false}));},
 goHome(){wx.switchTab({url:'/pages/index/index'});}
});

},
"pages/public-class/public-class":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('../../utils/consultationService');
const {classCard,isUpcomingClass}=require('../../utils/coursePresentation');
Page({
 data:{loading:false,error:'',classes:[],search:'',nextCursor:null},
 onLoad(query={}){if(query.id){this.redirected=true;wx.redirectTo({url:'/pages/public-class-detail/public-class-detail?id='+encodeURIComponent(query.id)});}},
 onShow(){if(!this.redirected)this.refresh();},
 searchInput(e){this.setData({search:e.detail.value});},
 refresh(){return this.load(false);},
 loadMore(){return this.load(true);},
 async load(more){if(more && this.appliedSearch!==this.data.search)more=false;
  if(this.data.loading){if(!more)this.pendingSearch=true;return;}this.setData({loading:true,error:''});
  try{const search=this.data.search;const r=await service.call('LIST_CLASSES',{search:search,cursor:more?this.data.nextCursor:null});this.appliedSearch=search;this.setData({classes:(more?this.data.classes:[]).concat((r.classes||[]).filter(isUpcomingClass).map(classCard)),nextCursor:r.nextCursor});}
  catch(e){service.error(this,e);}finally{this.setData({loading:false});if(this.pendingSearch){this.pendingSearch=false;this.refresh();}}
 },
 choose(e){wx.navigateTo({url:'/pages/public-class-detail/public-class-detail?id='+e.currentTarget.dataset.id});},
 goMine(){wx.navigateTo({url:'/pages/my-enrollments/my-enrollments'});},
 goCustomer(){wx.navigateTo({url:'/pages/customer/customer'});},
 onShareAppMessage(){return {title:'知守课程 · 一起学习如何更好地沟通',path:'/pages/public-class/public-class'};}
});

},
"pages/consultation-detail/consultation-detail":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('../../utils/consultationService');const auth=require('../../utils/auth');
Page({
 data:{loading:true,busy:false,error:'',appointment:null,record:null,feedbacks:[],summaryJobs:[],nextFeedbackCursor:null,nextSummaryCursor:null,moreLoading:false,isStaff:false,canAccept:false,canReply:false,childForm:{name:'',age:'',grade:'',guardian:'',relationship:'',phone:'',concerns:'',goals:''},recordForm:{summary:'',advice:''},noteContent:'',feedbackContent:'',adviceIndex:0,replyContents:{},confirmDate:'',confirmTime:'',staffNote:'',recording:false,recordingSeconds:0,summaryBusy:false},
 onLoad(query={}){this.unloaded=false;this.appointmentId=query.id;this.feedbackKey=service.requestKey();this.replyKeys={};if(require("../../utils/loginReturn").restore(this,"consultation-detail",this.appointmentId)){this.dirtyChild=true;this.dirtyRecord=true;}},
 onShow(){this.refresh();},
 onHide(){this.stopRecording();},onUnload(){this.unloaded=true;this.stopRecording();if(!this.recordingActive)this.detachRecorder();clearInterval(this.recordingTimer);},
 refresh(){const generation=this.listGeneration=(this.listGeneration||0)+1;this.setData({moreLoading:false});if(!auth.requireLogin('登录后查看本人的咨询资料。')){this.setData({loading:false});return;}this.setData({loading:true,error:''});return service.call('GET_APPOINTMENT',{paginate:true,appointmentId:this.appointmentId}).then(r=>{if(generation!==this.listGeneration||this.unloaded)return;const a=r.appointment;this.setData({appointment:service.decorate(a),record:r.record,feedbacks:(r.feedbacks||[]).map(item=>({...service.decorate(item),replies:(item.replies||[]).slice().sort((a,b)=>Number(a.id)-Number(b.id))})),summaryJobs:(r.summaryJobs||[]).map(service.decorate),nextFeedbackCursor:r.nextFeedbackCursor||null,nextSummaryCursor:r.nextSummaryCursor||null,isStaff:r.isStaff,canAccept:r.canAccept,canReply:r.canReply,childForm:this.dirtyChild?this.data.childForm:a.child_info||{name:'',age:'',grade:'',guardian:a.contact_name||'',relationship:'',phone:a.phone||'',concerns:a.concerns||'',goals:''},recordForm:this.dirtyRecord?this.data.recordForm:{summary:r.record&&r.record.summary||'',advice:r.record&&Array.isArray(r.record.advice)?r.record.advice.map(i=>i.content).join('\n'):''}});}).catch(e=>{if(generation===this.listGeneration&&!this.unloaded)service.error(this,e);}).finally(()=>{if(generation===this.listGeneration&&!this.unloaded)this.setData({loading:false});});},
 inputChild(e){const key=e.currentTarget.dataset.key;if(['name','age','grade','guardian','relationship','phone','concerns','goals'].includes(key)){this.dirtyChild=true;this.childEditVersion=(this.childEditVersion||0)+1;this.setData({['childForm.'+key]:e.detail.value});}},
 inputRecord(e){const key=e.currentTarget.dataset.key;if(['summary','advice'].includes(key)){this.dirtyRecord=true;this.recordEditVersion=(this.recordEditVersion||0)+1;this.setData({['recordForm.'+key]:e.detail.value});}},
 inputNote(e){this.setData({noteContent:e.detail.value});},
 async sendNote(){const content=this.data.noteContent;if(!content.trim()){this.formError('请填写留言内容');return;}if(await this.run('SEND_NOTE',{content,requestKey:this.noteKey||(this.noteKey=service.requestKey())})){this.noteKey=null;if(this.data.noteContent===content)this.setData({noteContent:''});}},
 async retrySummary(e){await this.run('RETRY_SUMMARY',{jobId:e.currentTarget.dataset.id});},
 async processRecording(e){await this.run('PROCESS_RECORDING',{jobId:e.currentTarget.dataset.id});},
 inputFeedback(e){this.setData({feedbackContent:e.detail.value});},chooseAdvice(e){this.setData({adviceIndex:Number(e.detail.value)});},
 inputReply(e){this.setData({['replyContents.'+e.currentTarget.dataset.id]:e.detail.value});},
 dateChange(e){this.setData({confirmDate:e.detail.value});},timeChange(e){this.setData({confirmTime:e.detail.value});},noteChange(e){this.setData({staffNote:e.detail.value});},
 async run(operation,payload={}){if(this.data.busy)return false;const childVersion=this.childEditVersion||0,recordVersion=this.recordEditVersion||0;this.setData({busy:true,error:''});try{await service.call(operation,{appointmentId:this.appointmentId,...payload});if(operation==='SAVE_CHILD_INFO'&&(this.childEditVersion||0)===childVersion)this.dirtyChild=false;if(operation==='SAVE_RECORD'&&(this.recordEditVersion||0)===recordVersion)this.dirtyRecord=false;wx.showToast({title:'已保存',icon:'success'});await this.refresh();return true;}catch(e){service.error(this,e);return false;}finally{this.setData({busy:false});}},
 formError(message){this.setData({error:message});if(wx.pageScrollTo)wx.pageScrollTo({scrollTop:0,duration:200});},
 saveChild(){const c=this.data.childForm;for(const [key,label] of [['name','孩子姓名或称呼'],['guardian','家长姓名'],['relationship','与孩子关系'],['concerns','当前主要困扰']])if(!String(c[key] || '').trim()){this.formError('请填写'+label);return;}if(!String(c.age).trim()||!Number.isInteger(Number(c.age))||Number(c.age)<0||Number(c.age)>30){this.formError('孩子年龄请填写0至30的整数');return;}if(!/^1[3-9]\d{9}$/.test(c.phone || '')){this.formError('请填写有效的11位联系电话');return;}this.run('SAVE_CHILD_INFO',{childInfo:JSON.parse(JSON.stringify(c))});},
 confirmAppointment(){if(!this.data.confirmDate||!this.data.confirmTime){this.formError('请填写确认日期和时间');return;}this.run('CONFIRM_APPOINTMENT',{confirmedAt:this.data.confirmDate+'T'+this.data.confirmTime+':00+08:00',note:this.data.staffNote});},
 cancelAppointment(){wx.showModal({title:'取消本次预约',content:'取消后如需咨询，可以重新提交申请。',success:r=>{if(r.confirm)this.run('CANCEL_APPOINTMENT');}});},
 saveRecord(e){const confirm=e.currentTarget.dataset.confirm===true||e.currentTarget.dataset.confirm==='true';const lines=this.data.recordForm.advice.split('\n').map(v=>v.trim()).filter(Boolean);if(lines.length>30||lines.some(v=>v.length>2000)){this.formError('执行建议最多30条，每条最多2000字');return;}if(confirm&&(!this.data.recordForm.summary.trim()||!lines.length)){this.formError('请填写沟通记录及至少一条执行建议');return;}const submit=()=>this.run('SAVE_RECORD',{summary:this.data.recordForm.summary,advice:this.data.recordForm.advice.split('\n').map(s=>s.trim()).filter(Boolean).map((content,i)=>({key:'step-'+(i+1),content})),confirm});if(confirm)wx.showModal({title:'确认沟通记录',content:'确认后家长可以查看记录与建议；后续补充将通过反馈回复保留。',success:r=>{if(r.confirm)submit();}});else submit();},
 complete(){wx.showModal({title:'确认咨询已完成',content:'请在实际沟通结束且记录完善后确认，之后仍可持续反馈与回复。',success:r=>{if(r.confirm)this.run('COMPLETE_APPOINTMENT');}});},
 async sendFeedback(){const advice=this.data.record&&this.data.record.advice||[];const item=advice[this.data.adviceIndex];if(!item){this.formError('请先选择老师的执行建议');return;}const content=this.data.feedbackContent;if(!content.trim()){this.formError('请填写执行反馈');return;}if(await this.run('SEND_FEEDBACK',{adviceKey:item.key,content,requestKey:this.feedbackKey})){this.feedbackKey=service.requestKey();if(this.data.feedbackContent===content)this.setData({feedbackContent:''});}},
 async sendReply(e){const id=e.currentTarget.dataset.id,content=this.data.replyContents[id] || '';if(!content.trim()){this.formError('请填写回复内容');return;}this.replyKeys[id]=this.replyKeys[id]||service.requestKey();if(await this.run('REPLY_FEEDBACK',{feedbackId:id,content,requestKey:this.replyKeys[id]})){delete this.replyKeys[id];if(this.data.replyContents[id]===content)this.setData({['replyContents.'+id]:''});}},
 async summarizeText(){if(this.data.summaryBusy)return;this.setData({summaryBusy:true,error:''});try{await service.call('SUMMARIZE_TEXT',{appointmentId:this.appointmentId,requestKey:service.requestKey()});this.refresh();}catch(e){service.error(this,e);}finally{this.setData({summaryBusy:false});}},
 useSummary(e){const job=this.data.summaryJobs.find(i=>String(i.id)===String(e.currentTarget.dataset.id));if(job&&job.draft){this.dirtyRecord=true;this.recordEditVersion=(this.recordEditVersion||0)+1;const apply=()=>this.setData({'recordForm.summary':job.draft});if(this.data.recordForm.summary.trim())wx.showModal({title:'替换老师记录？',content:'当前已有手工内容，使用此草稿会替换正文。请先确认需要保留的内容。',success:r=>{if(r.confirm)apply();}});else apply();}},
 startRecording(){
  if(this.data.recording||this.data.summaryBusy||this.unloaded)return;
  wx.showModal({title:'面谈录音与总结',content:'请确认所有参与者同意录音，并同意将录音上传至本咨询服务用于转写与总结。录音由你手动开始、停止。',confirmText:'已同意，开始',success:r=>{
   if(!r.confirm||this.unloaded)return;
   this.recordingConsentAt=new Date().toISOString();
   if(!this.recorder){
    this.recorder=wx.getRecorderManager();
    this.recorderStopHandler=data=>{
     this.recordingActive=false;this.stoppingRecording=false;clearInterval(this.recordingTimer);
     if(!this.unloaded)this.setData({recording:false});
     if(this.unloaded)this.detachRecorder();
     if(data.tempFilePath)this.uploadRecording(data.tempFilePath);
    };
    this.recorderErrorHandler=()=>{
     this.recordingActive=false;this.stoppingRecording=false;clearInterval(this.recordingTimer);
     if(!this.unloaded)this.setData({recording:false,error:'录音未能完成，请检查微信麦克风授权后重试。'});
     else{this.detachRecorder();wx.showToast({title:'录音未能完成，请重新录制',icon:'none'});}
    };
    this.recorder.onStop(this.recorderStopHandler);this.recorder.onError(this.recorderErrorHandler);
   }
   this.recordingActive=true;this.stoppingRecording=false;this.setData({recording:true,recordingSeconds:0});
   this.recordingTimer=setInterval(()=>{if(!this.unloaded)this.setData({recordingSeconds:this.data.recordingSeconds+1});},1000);
   try{this.recorder.start({duration:600000,sampleRate:16000,numberOfChannels:1,encodeBitRate:48000,format:'mp3'});}catch(e){this.recorderErrorHandler();}
  }});
 },
 detachRecorder(){if(!this.recorder)return;if(this.recorderStopHandler)this.recorder.offStop(this.recorderStopHandler);if(this.recorderErrorHandler)this.recorder.offError(this.recorderErrorHandler);},
 stopRecording(){if(this.recordingActive&&this.recorder&&!this.stoppingRecording){this.stoppingRecording=true;this.recorder.stop();}},
 async uploadRecording(path){if(!this.unloaded)this.setData({summaryBusy:true,error:''});try{const upload=require('../../utils/consultationRecording');await upload.uploadAndSummarize(path,this.appointmentId,this.recordingConsentAt);if(!this.unloaded)this.refresh();}catch(e){if(!this.unloaded)service.error(this,e);else wx.showToast({title:'录音处理未完成，请返回咨询页检查',icon:'none'});}finally{if(!this.unloaded)this.setData({summaryBusy:false});}},
 async moreHistory(e){const kind=e.currentTarget.dataset.kind,feedback=kind==='feedback',cursor=feedback?this.data.nextFeedbackCursor:this.data.nextSummaryCursor;if(this.data.loading||this.data.moreLoading||!cursor)return;const generation=this.listGeneration||0;this.setData({moreLoading:true});try{const r=await service.call('GET_APPOINTMENT',{paginate:true,appointmentId:this.appointmentId,[feedback?'feedbackCursor':'summaryCursor']:cursor});if(generation!==(this.listGeneration||0)||this.unloaded)return;if(feedback)this.setData({feedbacks:this.data.feedbacks.concat((r.feedbacks||[]).map(service.decorate)),nextFeedbackCursor:r.nextFeedbackCursor||null});else this.setData({summaryJobs:this.data.summaryJobs.concat((r.summaryJobs||[]).map(service.decorate)),nextSummaryCursor:r.nextSummaryCursor||null});}catch(e){if(generation===(this.listGeneration||0)&&!this.unloaded)service.error(this,e);}finally{if(generation===(this.listGeneration||0)&&!this.unloaded)this.setData({moreLoading:false});}},
 refreshSummary(){this.refresh();},
 backToCustomer(){wx.navigateBack({fail:()=>wx.navigateTo({url:'/pages/customer/customer'})});}
});

},
"pages/service-workbench/service-workbench":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('../../utils/consultationService');const auth=require('../../utils/auth');
Page({data:{loading:true,busy:false,error:'',allowed:false,canAccept:false,canReply:false,classes:[],enrollments:[],appointments:[],nextAppointmentCursor:null,moreLoading:false},
 onShow(){this.refresh();},
 refresh(){const generation=this.listGeneration=(this.listGeneration||0)+1;this.setData({moreLoading:false});if(!auth.requireLogin('请登录负责公开课和咨询的工作人员账号。')){this.setData({loading:false});return;}this.setData({loading:true,error:'',allowed:false});service.call('STAFF_OVERVIEW',{paginate:true}).then(r=>generation===this.listGeneration && this.setData({allowed:true,canAccept:r.canAccept,canReply:r.canReply,classes:(r.classes||[]).map(service.decorate),enrollments:(r.enrollments||[]).map(service.decorate),appointments:(r.appointments||[]).map(service.decorate),nextAppointmentCursor:r.nextAppointmentCursor||null})).catch(e=>{if(generation===this.listGeneration)service.error(this,e);}).finally(()=>{if(generation===this.listGeneration)this.setData({loading:false});});},
 async moreAppointments(){if(this.data.loading||this.data.moreLoading||!this.data.nextAppointmentCursor)return;const generation=this.listGeneration||0;this.setData({moreLoading:true});try{const r=await service.call('STAFF_OVERVIEW',{paginate:true,appointmentCursor:this.data.nextAppointmentCursor});if(generation!==(this.listGeneration||0))return;this.setData({appointments:this.data.appointments.concat((r.appointments||[]).map(service.decorate)),nextAppointmentCursor:r.nextAppointmentCursor||null});}catch(e){if(generation===(this.listGeneration||0))service.error(this,e);}finally{if(generation===(this.listGeneration||0))this.setData({moreLoading:false});}},
 manageCourses(){wx.navigateTo({url:'/pages/course-manage/course-manage'});},
 openAppointment(e){wx.navigateTo({url:'/pages/consultation-detail/consultation-detail?id='+e.currentTarget.dataset.id});},
 callCustomer(e){const n=e.currentTarget.dataset.phone;if(n)wx.makePhoneCall({phoneNumber:n});},
 shareClass(e){wx.navigateTo({url:'/pages/public-class/public-class?id='+e.currentTarget.dataset.id});},
 goCustomer(){require('../../utils/chatContext').enterCustomerView();wx.navigateTo({url:'/pages/customer/customer'});}
});

},
"pages/public-class-detail/public-class-detail":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('../../utils/consultationService');
const {classCard,classShare}=require('../../utils/coursePresentation');
Page({
 data:{loading:true,error:'',classInfo:null,enrollment:null,canInvite:false},
 onLoad(q={}){this.classId=q.id||'';if(!this.classId&&q.scene){try{this.classId=decodeURIComponent(q.scene);}catch(_){this.classId='';}}},
 async onShow(){await Promise.all([this.refresh(),this.loadReferral()]);if(wx.prepareCourseShare)wx.prepareCourseShare(this);},
 async loadReferral(){const v=require('../../utils/viewSession'),identity=v.capture();this.setData({canInvite:false});try{const r=await require('../../utils/referral').context(this.classId);if(v.current(identity))this.setData({canInvite:!!r.canInvite});}catch(_){}},
 referralCode(){wx.navigateTo({url:'/pages/referrals/referrals?id='+this.classId});},
 async refresh(){this.setData({loading:true,error:'',classInfo:null});try{const r=await service.call('GET_CLASS',{classId:this.classId});this.setData({classInfo:classCard(r.classInfo),enrollment:r.enrollment});}catch(e){service.error(this,e);}finally{this.setData({loading:false});}},
 enroll(){if(this.data.enrollment && this.data.enrollment.status==='REGISTERED'){wx.navigateTo({url:'/pages/class-ticket/class-ticket?id='+this.data.enrollment.id});return;}wx.navigateTo({url:'/pages/class-enroll/class-enroll?id='+this.classId});},
 onShareAppMessage(){return classShare(this.data.classInfo);}
});

},
"pages/class-enroll/class-enroll":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('../../utils/consultationService');
const auth=require('../../utils/auth');
const {classCard}=require('../../utils/coursePresentation');
Page({data:{loading:true,busy:false,error:'',classInfo:null,referralName:'',referralBound:false,form:{name:'',phone:''}},
 onLoad(q={}){this.classId=q.id||'';const form=require('../../utils/loginReturn').takeEnrollmentForm(this.classId);if(form)this.setData({form});require("../../utils/loginReturn").restore(this,"class-enroll",this.classId);},
 onShow(){this.refresh();this.loadReferral();},
 async loadReferral(){const v=require('../../utils/viewSession'),identity=v.capture();this.setData({referralName:'',referralBound:false});try{const r=await require('../../utils/referral').context();if(v.current(identity))this.setData({referralName:(r.binding||r.candidate||{}).name||'',referralBound:!!r.binding});}catch(_){}},
 async refresh(){this.setData({loading:true,error:''});try{const r=await service.call('GET_CLASS',{classId:this.classId});if(r.enrollment&&r.enrollment.status==='REGISTERED'){wx.redirectTo({url:'/pages/class-ticket/class-ticket?id='+r.enrollment.id});return;}this.setData({classInfo:classCard(r.classInfo)});}catch(e){service.error(this,e);}finally{this.setData({loading:false});}},
 input(e){const k=e.currentTarget.dataset.key;if(['name','phone'].includes(k))this.setData({['form.'+k]:e.detail.value});},
 async submit(){
  if(this.data.busy||!this.data.classInfo)return;
  if(!auth.requireLogin('登录后保存你的课程报名和入场凭证。',{enrollmentForm:this.data.form}))return;
  const name=this.data.form.name.trim(),phone=this.data.form.phone.trim();
  if(!name||!/^1[3-9]\d{9}$/.test(phone)){this.setData({error:'请填写姓名和有效的11位手机号。'});return;}
  this.setData({busy:true,error:''});try{
   const payload={classId:this.classId,name,phone};
   const r=this.data.classInfo.isPaid?await require('../../utils/coursePayment').enroll(payload,this.data.classInfo.feeText):await service.call('ENROLL',payload);
   if(r&&r.enrollment)wx.redirectTo({url:'/pages/class-ticket/class-ticket?id='+r.enrollment.id+'&success=1'});
  }catch(e){service.error(this,e);}finally{this.setData({busy:false});}
 }
});

},
"pages/my-enrollments/my-enrollments":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('../../utils/consultationService');const auth=require('../../utils/auth');
const {enrollmentCard}=require('../../utils/coursePresentation');
Page({data:{loading:false,error:'',loggedIn:false,items:[],nextCursor:null,filter:'ALL',filters:[{key:'ALL',label:'全部'},{key:'PENDING',label:'待参加'},{key:'ATTENDED',label:'已参加'},{key:'CANCELED',label:'已取消'}]},
 onShow(){this.refresh();},
 login(){auth.requireLogin('登录后查看你的公开课报名。');},
 selectFilter(e){if(this.data.loading)return;this.setData({filter:e.currentTarget.dataset.key});this.refresh();},
 refresh(){return this.load(false);},loadMore(){return this.load(true);},
 async load(more){if(this.data.loading)return;const loggedIn=auth.isLoggedIn();this.setData({loggedIn});if(!loggedIn){this.setData({items:[],nextCursor:null});return;}this.setData({loading:true,error:''});try{const r=await service.call('MY_ENROLLMENTS',{filter:this.data.filter,cursor:more?this.data.nextCursor:null});this.setData({items:(more?this.data.items:[]).concat((r.items||[]).map(enrollmentCard)),nextCursor:r.nextCursor});}catch(e){service.error(this,e);}finally{this.setData({loading:false});}},
 open(e){wx.navigateTo({url:'/pages/class-ticket/class-ticket?id='+e.currentTarget.dataset.id});},
 classes(){wx.navigateTo({url:'/pages/public-class/public-class'});}
});

},
"pages/class-ticket/class-ticket":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('../../utils/consultationService');const auth=require('../../utils/auth');
const {enrollmentCard}=require('../../utils/coursePresentation');const qr=require('../../utils/courseQr');
Page({data:{loggedIn:false,loading:true,busy:false,error:'',qrError:'',enrollment:null,success:false},
 onLoad(q={}){this.enrollmentId=q.id||'';this.setData({success:q.success==='1'});},
 onShow(){this.refresh();},
 async refresh(){if(!auth.requireLogin('登录后查看本人的报名和入场凭证。')){this.setData({loggedIn:false,loading:false,enrollment:null});return;}this.setData({loggedIn:true,loading:true,error:'',qrError:'',enrollment:null});try{const r=await service.call('GET_ENROLLMENT',{enrollmentId:this.enrollmentId});const e=enrollmentCard(r.enrollment);this.setData({enrollment:e},()=>{if(e.entryPayload&&e.attendance_status!=='ATTENDED')qr.draw(this,'entry-code',e.entryPayload).catch(()=>this.setData({qrError:'二维码暂未显示，可向工作人员出示报名信息人工核实。'}));});}catch(e){service.error(this,e);}finally{this.setData({loading:false});}},
 groupQr(){const q=this.data.enrollment.public_class.group_qr;if(q&&q.url)wx.previewImage({urls:[q.url]});},
 callTeacher(){const phone=this.data.enrollment.public_class.contact_phone;if(phone)wx.makePhoneCall({phoneNumber:phone});},
 consultation(){wx.navigateTo({url:'/pages/customer/customer'});},
 viewClass(){wx.navigateTo({url:'/pages/public-class-detail/public-class-detail?id='+this.data.enrollment.public_class_id});},
 cancel(){if(this.data.busy)return;wx.showModal({title:'取消本场报名',content:'取消后释放名额，当前入场码将失效。报名截止前有名额时可以重新报名。',success:async r=>{if(!r.confirm)return;this.setData({busy:true,error:''});try{await service.call('CANCEL_ENROLLMENT',{enrollmentId:this.enrollmentId});this.setData({success:false});await this.refresh();}catch(e){service.error(this,e);}finally{this.setData({busy:false});}}});}
});

},
"pages/course-manage/course-manage":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('../../utils/consultationService');const auth=require('../../utils/auth');const {classCard,classShare}=require('../../utils/coursePresentation');
Page({data:{loading:true,error:'',allowed:false,classes:[],search:'',nextCursor:null},
 onShow(){this.refresh();}, inputSearch(e){this.setData({search:e.detail.value});},
 refresh(){return this.load(false);},more(){return this.load(true);},
 async load(more){if(more && this.appliedSearch!==this.data.search)more=false;if(this.fetching){if(!more)this.pendingSearch=true;return;}if(!auth.requireLogin('请登录课程工作人员账号。')){this.setData({loading:false,allowed:false});return;}this.fetching=true;this.setData({loading:true,error:''});try{const search=this.data.search;const r=await service.call('STAFF_CLASSES',{search:search,cursor:more?this.data.nextCursor:null});this.appliedSearch=search;this.setData({allowed:true,classes:(more?this.data.classes:[]).concat((r.classes||[]).map(classCard)),nextCursor:r.nextCursor});}catch(e){if(!more)this.setData({allowed:false,classes:[]});service.error(this,e);}finally{this.fetching=false;this.setData({loading:false});if(this.pendingSearch){this.pendingSearch=false;this.refresh();}}},
 create(){wx.navigateTo({url:'/pages/course-edit/course-edit'});},
 edit(e){wx.navigateTo({url:'/pages/course-edit/course-edit?id='+e.currentTarget.dataset.id});},
 roster(e){wx.navigateTo({url:'/pages/course-roster/course-roster?id='+e.currentTarget.dataset.id});},
 onShareAppMessage(e={}){const id=e.target && e.target.dataset && e.target.dataset.id;return classShare(this.data.classes.find(c=>String(c.id)===String(id)));}
});

},
"pages/course-edit/course-edit":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('../../utils/consultationService');const auth=require('../../utils/auth');const zion=require('../../utils/zion');const {dateParts,iso,classShare}=require('../../utils/coursePresentation');
const empty=()=>({title:'',description:'',date:'',time:'',closeDate:'',closeTime:'',checkinDate:'',checkinTime:'',city:'',capacity:'0',registrationFee:'100',groupGuide:'',contactPhone:'',notice:'',signupUrl:'',coverId:null,groupQrId:null,shareCodeId:null});
Page({data:{loading:true,busy:false,uploading:false,error:'',allowed:false,hasSavedClass:false,form:empty(),coverUrl:'',groupQrUrl:'',shareCodeUrl:'',savedClass:null,saveNotice:'',publishError:'',status:'DRAFT'},
 onLoad(q={}){this.classId=q.id||null;this.editVersion=0;this.savedVersion=0;this.refresh();if(require("../../utils/loginReturn").restore(this,"course-edit",this.classId)){this.markEdited();}},
 async refresh(options={}){const version=this.editVersion || 0;const preserve=options.preserve===true || (options.preserve!==false && version!==(this.savedVersion||0));if(!auth.requireLogin('请登录负责课程的工作人员账号。')){this.setData({loading:false});return;}this.setData({loading:true,error:'',allowed:false});try{if(this.classId){const r=await service.call('GET_STAFF_CLASS',{classId:this.classId}),c=r.classInfo,t=dateParts(c.starts_at),d=dateParts(c.registration_closes_at),k=dateParts(c.checkin_closes_at);this.revision=c.revision;this.setData({allowed:true,hasSavedClass:true,savedClass:c,status:c.status,form:{title:c.title||'',description:c.description||'',date:t.date,time:t.time,closeDate:d.date,closeTime:d.time,checkinDate:k.date,checkinTime:k.time,city:c.city||'',capacity:String(c.capacity||0),registrationFee:String(c.registration_fee||0),groupGuide:c.group_guide||'',contactPhone:c.contact_phone||'',notice:c.notice||'',signupUrl:c.signup_url||'',coverId:c.cover&&c.cover.id||null,groupQrId:c.group_qr&&c.group_qr.id||null,shareCodeId:c.share_code&&c.share_code.id||null},coverUrl:c.cover&&c.cover.url||'',groupQrUrl:c.group_qr&&c.group_qr.url||'',shareCodeUrl:c.share_code&&c.share_code.url||'',...((preserve || (this.editVersion || 0)!==version)?{form:this.data.form,coverUrl:this.data.coverUrl,groupQrUrl:this.data.groupQrUrl,shareCodeUrl:this.data.shareCodeUrl}: {})});}else{await service.call('STAFF_CLASSES');this.setData({allowed:true});}}catch(e){service.error(this,e);}finally{this.setData({loading:false});}},
 markEdited(){this.editVersion=(this.editVersion||0)+1;if(wx.enableAlertBeforeUnload)wx.enableAlertBeforeUnload({message:'课程内容尚未保存，确定离开吗？'});},
 clearDeadline(e){this.markEdited();const kind=e.currentTarget.dataset.kind;if(kind==='registration')this.setData({'form.closeDate':'','form.closeTime':''});if(kind==='checkin')this.setData({'form.checkinDate':'','form.checkinTime':''});},
 input(e){this.markEdited();const k=e.currentTarget.dataset.key;if(Object.keys(empty()).includes(k))this.setData({['form.'+k]:e.detail.value,saveNotice:'',publishError:''});},
 upload(e){if(this.data.uploading||this.data.busy)return;const kind=e.currentTarget.dataset.kind;if(!['cover','groupQr'].includes(kind))return;wx.chooseMedia({count:1,mediaType:['image'],success:async r=>{this.setData({uploading:true,error:''});try{const image=await zion.uploadImage(r.tempFiles[0].tempFilePath);this.markEdited();this.setData({['form.'+kind+'Id']:image.imageId,[kind+'Url']:image.url});}catch(e){service.error(this,e);}finally{this.setData({uploading:false});}}});},
 removeImage(e){this.markEdited();const k=e.currentTarget.dataset.kind;if(['cover','groupQr'].includes(k))this.setData({['form.'+k+'Id']:null,[k+'Url']:''});},
 save(e){if(this.data.busy||this.data.uploading)return;const status=e.currentTarget.dataset.status;if(status==='CLOSED'){wx.showModal({title:'结束本场报名',content:'结束后停止接收新报名，已有报名和入场凭证保留。',success:r=>{if(r.confirm)this.submit(status);}});}else this.submit(status);},
 publish(e={}){if(this.data.busy||this.data.uploading||this.data.loading||!this.data.allowed)return;const values=e.detail&&e.detail.value;if(values){const fields={};for(const key of ['title','description','city','date','time','capacity','closeDate','closeTime','checkinDate','checkinTime','groupGuide','contactPhone','notice'])if(Object.prototype.hasOwnProperty.call(values,key))fields[key]=String(values[key]);if(Object.keys(fields).some(key=>fields[key]!==this.data.form[key]))this.markEdited();this.setData({form:{...this.data.form,...fields}});}return this.submit('PUBLISHED');},
 saveDraft(){return this.submit('DRAFT');},
 showFormError(message){this.setData({error:message,publishError:message});if(wx.pageScrollTo)wx.pageScrollTo({scrollTop:0,duration:200});},
 async submit(status){
  if(this.data.busy||this.data.uploading||this.data.loading||!this.data.allowed)return;
  const f=JSON.parse(JSON.stringify(this.data.form)),version=this.editVersion||0;
  if(!f.title.trim()){this.showFormError('请填写课程名称');return;}
  for(const [d,t] of [['date','time'],['closeDate','closeTime'],['checkinDate','checkinTime']])if(Boolean(f[d])!==Boolean(f[t])){this.showFormError('请将所选日期和时间填写完整');return;}
  if(status==='PUBLISHED'&&(!f.date||!f.time)){this.showFormError('发布前请选择开课日期和时间');return;}
  if(!Number.isSafeInteger(Number(f.capacity||0))||Number(f.capacity)<0||Number(f.capacity)>10000){this.showFormError('名额请输入0至10000的整数，0表示不限');return;}
  if(!/^(0|[1-9]\d{0,5})(\.\d{1,2})?$/.test(String(f.registrationFee||'0').trim())){this.showFormError('报名费用请填写0至999999.99元，最多两位小数');return;}
  const start=iso(f.date,f.time),registration=iso(f.closeDate,f.closeTime),checkin=iso(f.checkinDate,f.checkinTime);
  if(start&&!Number.isFinite(Date.parse(start))){this.showFormError('开课时间无效，请重新选择');return;}
  if(status==='PUBLISHED'&&this.data.status!=='PUBLISHED'&&Date.parse(start)<=Date.now()){this.showFormError('请选择未来的开课时间再发布');return;}
  if(registration&&(!start||!Number.isFinite(Date.parse(registration))||Date.parse(registration)>Date.parse(start))){this.showFormError('报名截止时间不能晚于开课时间');return;}
  if(checkin&&(!start||!Number.isFinite(Date.parse(checkin))||Date.parse(checkin)<Date.parse(start))){this.showFormError('签到截止时间不能早于开课时间');return;}
  if(f.contactPhone.trim()&&!/^1[3-9]\d{9}$/.test(f.contactPhone.trim())){this.showFormError('联系手机号请填写有效的11位号码，或留空');return;}
  if(Number(f.capacity)>0&&Number(f.capacity)<Number(this.data.savedClass&&this.data.savedClass.reserved_count||0)){this.showFormError('名额不能少于已报名人数');return;}
  this.setData({busy:true,error:'',publishError:'',saveNotice:''});
  try{
   const r=await service.call('SAVE_CLASS',{...f,id:this.classId,revision:this.revision,status,startsAt:iso(f.date,f.time),registrationClosesAt:iso(f.closeDate,f.closeTime),checkinClosesAt:iso(f.checkinDate,f.checkinTime)});
   this.classId=r.id;
   // Preserve the committed result even if the follow-up read fails; do not suggest creating it again.
   this.setData({hasSavedClass:true,status,savedClass:{id:r.id,title:f.title,status,coverUrl:this.data.coverUrl},saveNotice:status==='PUBLISHED'?'课程已发布，可直接微信分享给朋友或群。':status==='DRAFT'?'草稿已保存，发布后即可邀请报名。':'已结束本场报名。'});
   wx.showToast({title:status==='PUBLISHED'?'已发布':'已保存',icon:'success'});
   this.savedVersion=version;
   await this.refresh({preserve:(this.editVersion||0)!==version});
   if((this.editVersion||0)!==version)this.setData({saveNotice:'已保存提交时的版本，新增修改仍待保存。'});
   else if(wx.disableAlertBeforeUnload)wx.disableAlertBeforeUnload();
   if(this.data.error)this.setData({error:'课程已保存，但重新读取失败。请重试读取，不必重复新建。'});
   if(wx.pageScrollTo)wx.pageScrollTo({scrollTop:0,duration:200});
  }catch(e){service.error(this,e);this.showFormError(this.data.error);if(wx.showModal)wx.showModal({title:'课程未发布或保存',content:this.data.error,showCancel:false,confirmText:'返回修改'});}finally{this.setData({busy:false});}
 },
 onShareAppMessage(){return classShare(this.data.savedClass);},
 preview(){if(this.classId)wx.navigateTo({url:'/pages/public-class-detail/public-class-detail?id='+this.classId});}
});

},
"pages/course-roster/course-roster":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('../../utils/consultationService');const auth=require('../../utils/auth');const {enrollmentCard,classCard}=require('../../utils/coursePresentation');
Page({data:{loading:true,busy:false,error:'',allowed:false,classInfo:null,items:[],stats:{},search:'',filter:'ALL',nextCursor:null,scanCandidate:null,tabs:[{key:'ALL',label:'全部报名'},{key:'CONTACT',label:'待联系'},{key:'JOINED',label:'已进群'},{key:'PENDING',label:'待到课'},{key:'ATTENDED',label:'已到课'},{key:'ABSENT',label:'未到课'},{key:'CANCELED',label:'已取消'}]},
 onLoad(q={}){this.classId=q.id||'';},onShow(){this.refresh();},refresh(){return this.load(false);},more(){return this.load(true);},inputSearch(e){this.setData({search:e.detail.value});},filter(e){if(this.fetching)return;this.setData({filter:e.currentTarget.dataset.key});this.refresh();},
 async load(more){if(more && this.appliedSearch!==this.data.search)more=false;if(this.fetching){if(!more)this.pendingSearch=true;return;}if(!auth.requireLogin('请登录本场课程的工作人员账号。')){this.setData({loading:false,allowed:false});return;}this.fetching=true;this.setData({loading:true,error:''});try{const search=this.data.search;const r=await service.call('COURSE_ROSTER',{classId:this.classId,search:search,filter:this.data.filter,cursor:more?this.data.nextCursor:null});this.appliedSearch=search;this.setData({allowed:true,classInfo:classCard(r.classInfo),stats:r.stats,items:(more?this.data.items:[]).concat((r.items||[]).map(enrollmentCard)),nextCursor:r.nextCursor});}catch(e){if(!more)this.setData({allowed:false,items:[]});service.error(this,e);}finally{this.fetching=false;this.setData({loading:false});if(this.pendingSearch){this.pendingSearch=false;this.refresh();}}},
 scan(){if(this.data.busy)return;wx.scanCode({onlyFromCamera:true,scanType:['qrCode'],success:async r=>{this.setData({busy:true,error:'',scanCandidate:null});try{const out=await service.call('LOOKUP_ENTRY',{classId:this.classId,entryCode:r.result});this.scanValue=r.result;this.setData({scanCandidate:enrollmentCard(out.enrollment)});}catch(e){service.error(this,e);}finally{this.setData({busy:false});}},fail:e=>{if(!/cancel/.test(e.errMsg||''))this.setData({error:'无法扫码，请允许相机权限或在名单中人工核实。'});}});},
 closeScan(){this.scanValue=null;this.setData({scanCandidate:null});},
 confirmScan(){if(this.data.busy||!this.scanValue)return;const code=this.scanValue;wx.showModal({title:'确认实际到课',content:'请核对报名人确实参加本场公开课。确认后将开放线下咨询申请资格。',success:r=>{if(r.confirm)this.perform('CHECK_IN',{entryCode:code});}});},
 verify(e){if(this.data.busy)return;const {id,field,value}=e.currentTarget.dataset;if(field==='attendanceStatus'){wx.showModal({title:'核实参加情况',content:value==='ATTENDED'?'确认此人实际参加了本场公开课？确认后可申请线下咨询。':'确认此人未到课？',success:r=>{if(r.confirm)this.perform('VERIFY_ENROLLMENT',{enrollmentId:id,[field]:value});}});}else this.perform('VERIFY_ENROLLMENT',{enrollmentId:id,[field]:value});},
 async perform(op,p){this.setData({busy:true,error:''});try{const r=await service.call(op,{...p,classId:this.classId});this.closeScan();wx.showToast({title:r.alreadyCheckedIn?'已核销，无需重复':'已更新',icon:'success'});await this.refresh();}catch(e){service.error(this,e);}finally{this.setData({busy:false});}},
 call(e){wx.makePhoneCall({phoneNumber:e.currentTarget.dataset.phone});}
});

},
"pages/checkin/checkin":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service = require('../../utils/consultationService');
const auth = require('../../utils/auth');
const session = require('../../utils/viewSession');

Page({
  data: {loading:false,busy:false,error:'',allowed:false,isManager:false,classId:'',classInfo:null,items:[],stats:{registered:0,attended:0,remaining:0},search:'',filter:'ALL',nextCursor:null,candidate:null,scanResult:null,staffOpen:false,staff:[],staffLoading:false,staffSearch:'',candidates:[],candidateCursor:null,staffError:'',tabs:[{key:'ALL',label:'全部报名'},{key:'REMAINING',label:'未签到'},{key:'ATTENDED',label:'已签到'}]},
  onLoad(q={}) { this.setData({classId:q.id||''}); },
  onShow() { this.scanValue=null;this.setData({allowed:false,isManager:false,items:[],classInfo:null,candidate:null,scanResult:null,staffOpen:false,staff:[],candidates:[]});return this.refresh(); },
  onHide() { this.generation=(this.generation||0)+1;this.scanValue=null;this.setData({candidate:null,busy:false,staff:[],candidates:[]}); },
  onUnload() { this.onHide(); },
  refresh() { return this.load(false); },
  more() { return this.load(true); },
  inputSearch(e) { this.setData({search:e.detail.value}); },
  filter(e) { if(this.data.busy)return;this.setData({filter:e.currentTarget.dataset.key});return this.refresh(); },
  openClass(e) { wx.navigateTo({url:'/pages/checkin/checkin?id='+encodeURIComponent(e.currentTarget.dataset.id)}); },
  async load(more) {
    const generation=this.generation=(this.generation||0)+1, identity=session.capture();
    if(!auth.requireLogin('请登录管理或被指定的签到人员账号。')) { this.setData({loading:false,allowed:false,isManager:false,items:[],staff:[],candidates:[],classInfo:null});return; }
    if(more && this.appliedSearch!==this.data.search)more=false;
    const search=this.data.search;
    this.setData({loading:true,error:''});
    try {
      const r=await service.call(this.data.classId?'CHECKIN_ROSTER':'CHECKIN_CLASSES',{classId:this.data.classId,search,filter:this.data.filter,cursor:more?this.data.nextCursor:null});
      if(generation!==this.generation||!session.current(identity))return;
      this.appliedSearch=search;
      this.setData({allowed:true,isManager:r.isManager,items:(more?this.data.items:[]).concat((r.items||[]).map(item=>({...item,timeText:service.formatTime(item.starts_at),verifiedText:service.formatTime(item.verifiedAt)}))),nextCursor:r.nextCursor,classInfo:r.classInfo?{...r.classInfo,timeText:service.formatTime(r.classInfo.starts_at)}:null,stats:r.stats||this.data.stats});
    } catch(e) {
      if(generation!==this.generation||!session.current(identity))return;
      this.scanValue=null;this.setData({allowed:false,isManager:false,items:[],staff:[],candidates:[],classInfo:null,candidate:null,scanResult:null});service.error(this,e);
    } finally { if(generation===this.generation&&session.current(identity))this.setData({loading:false}); }
  },
  scan() {
    if(this.data.busy||!this.data.allowed)return;
    const identity=session.capture(),generation=this.generation;
    this.setData({busy:true,error:'',candidate:null,scanResult:null});this.scanValue=null;
    wx.scanCode({onlyFromCamera:true,scanType:['qrCode'],success:async r=>{
      if(!session.current(identity)||generation!==this.generation)return;
      try {
        const out=await service.call('CHECKIN_LOOKUP',{classId:this.data.classId,entryCode:r.result});
        if(!session.current(identity)||generation!==this.generation)return;
        this.scanValue=r.result;this.setData({candidate:out.enrollment,stats:out.stats});
      } catch(e) { if(session.current(identity)&&generation===this.generation)service.error(this,e); }
      finally { if(session.current(identity)&&generation===this.generation)this.setData({busy:false}); }
    },fail:e=>{if(!session.current(identity)||generation!==this.generation)return;this.setData({busy:false,error:/cancel/i.test(e.errMsg||'')?'':'无法扫码，请允许相机权限后重试。'});}});
  },
  closeScan() {this.scanValue=null;this.setData({candidate:null});},
  async confirmScan() {
    if(this.data.busy||!this.scanValue)return;
    const identity=session.capture(),generation=this.generation;
    this.setData({busy:true,error:''});
    try {
      const out=await service.call('CHECKIN_CONFIRM',{classId:this.data.classId,entryCode:this.scanValue});
      if(!session.current(identity)||generation!==this.generation)return;
      this.closeScan();this.setData({stats:out.stats,scanResult:{name:out.enrollment.name,title:out.alreadyCheckedIn?'已签到，无需重复':'签到成功'}});
      await this.refresh();
    } catch(e) {if(session.current(identity)&&generation===this.generation)service.error(this,e);}
    finally {if(session.current(identity))this.setData({busy:false});}
  },
  async toggleStaff() {this.setData({staffOpen:!this.data.staffOpen});if(this.data.staffOpen)await this.loadStaff();},
  async loadStaff() {
    const identity=session.capture();
    try {const r=await service.call('CHECKIN_STAFF',{classId:this.data.classId});if(session.current(identity))this.setData({staff:r.items,staffError:''});}
    catch(e) {if(session.current(identity))this.setData({staff:[],staffError:e.message});}
  },
  inputStaffSearch(e) {this.setData({staffSearch:e.detail.value});},
  searchStaff() {return this.findStaff(false);},
  moreStaff() {return this.findStaff(true);},
  async findStaff(more) {
    if(this.data.staffLoading)return;
    if(more&&this.appliedStaffSearch!==this.data.staffSearch)more=false;
    const identity=session.capture(),search=this.data.staffSearch.trim();
    if(!search){this.setData({staffError:'请输入对方的昵称或用户编号',candidates:[],candidateCursor:null});return;}
    this.setData({staffLoading:true,staffError:''});
    try {const r=await service.call('CHECKIN_CANDIDATES',{search,cursor:more?this.data.candidateCursor:null});if(!session.current(identity))return;this.appliedStaffSearch=search;this.setData({candidates:(more?this.data.candidates:[]).concat(r.items),candidateCursor:r.nextCursor,staffError:r.items.length?'':'没有找到用户，请先让对方登录。'});}
    catch(e) {if(session.current(identity))this.setData({staffError:e.message,candidates:[]});}
    finally {if(session.current(identity))this.setData({staffLoading:false});}
  },
  setStaff(e) {
    if(this.data.busy)return;
    const {id,name,active}=e.currentTarget.dataset,enabled=active===true||active==='true';
    wx.showModal({title:enabled?'设置签到人员':'取消签到权限',content:enabled?`允许 ${name}（用户 ${id}）查看本场名单并扫码签到？不会改变其管理、代理或用户身份。`:`取消 ${name} 在本场的签到权限？`,success:r=>{if(r.confirm)this.saveStaff(id,enabled);}});
  },
  async saveStaff(accountId,active) {
    const identity=session.capture();this.setData({busy:true,staffError:''});
    try {await service.call('CHECKIN_SET_STAFF',{classId:this.data.classId,accountId,active});if(!session.current(identity))return;await this.loadStaff();wx.showToast({title:active?'已设置签到人员':'已取消签到权限',icon:'success'});}
    catch(e) {if(session.current(identity))this.setData({staffError:e.message});}
    finally {if(session.current(identity))this.setData({busy:false});}
  }
});

},
"pages/referrals/referrals":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('../../utils/consultationService');
const auth=require('../../utils/auth');
const referral=require('../../utils/referral');
const viewSession=require('../../utils/viewSession');
const qr=require('../../utils/courseQr');
Page({
 data:{loading:false,error:'',qrError:'',allowed:false,isManager:false,shareUrl:'',scope:'own',items:[],nextCursor:null,total:0,courseTitle:''},
 onLoad(q={}){this.classId=q.id||'';},
 onShow(){this.refresh();},
 onHide(){this.requestId=(this.requestId||0)+1;},
 async refresh(){
  const requestId=this.requestId=(this.requestId||0)+1,identity=viewSession.capture();
  this.setData({allowed:false,isManager:false,shareUrl:'',items:[],nextCursor:null,total:0,error:'',qrError:'',loading:false});
  if(!auth.requireLogin('登录后查看你的推荐报名码和推荐客户。'))return;
  this.setData({loading:true});
  try{
   const r=await referral.context(this.classId);
   if(requestId!==this.requestId||!viewSession.current(identity))return;
   if(!r.canInvite)throw new Error('当前账号没有推荐权限，请联系管理人员设置代理身份。');
   this.setData({allowed:true,isManager:!!r.isManager,shareUrl:r.shareUrl||'',scope:r.isManager?this.data.scope:'own'},()=>{
    if(r.shareUrl)qr.draw(this,'referral-code',r.shareUrl).catch(()=>this.setData({qrError:'二维码生成失败，可复制下方推荐链接。'}));
   });
   if(this.classId){const c=await service.call('GET_CLASS',{classId:this.classId});if(requestId!==this.requestId||!viewSession.current(identity))return;this.setData({courseTitle:c.classInfo.title});}
   await this.load(false,requestId,identity);
  }catch(e){if(requestId===this.requestId&&viewSession.current(identity))service.error(this,e);}
  finally{if(requestId===this.requestId&&viewSession.current(identity))this.setData({loading:false});}
 },
 async load(more,requestId=this.requestId,identity=viewSession.capture()){
  const r=await service.call('REFERRAL_CLIENTS',{scope:this.data.scope,cursor:more?this.data.nextCursor:null});
  if(requestId!==this.requestId||!viewSession.current(identity))return;
  const items=(r.items||[]).map(row=>({...row,timeText:service.formatTime(row.lockedAt),enrollments:(row.enrollments||[]).map(e=>({...e,statusText:e.status==='CANCELED'?'已取消':e.attendanceStatus==='ATTENDED'?'已到课':e.attendanceStatus==='ABSENT'?'未到课':'已报名 · 待到课'}))}));
  this.setData({items:more?this.data.items.concat(items):items,nextCursor:r.nextCursor,total:r.total});
 },
 async more(){if(this.data.loading||!this.data.nextCursor)return;this.setData({loading:true,error:''});const identity=viewSession.capture(),requestId=this.requestId;try{await this.load(true,requestId,identity);}catch(e){if(requestId===this.requestId&&viewSession.current(identity))service.error(this,e);}finally{if(requestId===this.requestId&&viewSession.current(identity))this.setData({loading:false});}},
 changeScope(e){if(this.data.loading)return;this.setData({scope:e.currentTarget.dataset.scope==='all'&&this.data.isManager?'all':'own'});this.refresh();},
 async shareCode(){try{const r=await referral.context(this.classId);if(!r.canInvite||!r.shareUrl)throw new Error('请重新核实代理身份后生成报名码');if(wx.showReferralPoster)wx.showReferralPoster({url:r.shareUrl,title:this.data.courseTitle||'知守课程报名',name:(wx.getStorageSync('userInfo')||{}).nickName||''});else wx.showToast({title:'请截图保存报名二维码发送给朋友',icon:'none'});}catch(e){service.error(this,e);}},
 courses(){wx.switchTab({url:'/pages/plaza/plaza'});}
});

},
"pages/invite-login/invite-login":function(require,module,exports,Page,wx,getApp,getCurrentPages){
Page({
 data:{loading:true,error:'',referrerName:'',bound:false},
 onShow(){this.refresh();},
 async refresh(){
  this.setData({loading:true,error:''});
  try{if(wx.getInvitationError&&wx.getInvitationError())throw new Error(wx.getInvitationError());const r=await require('../../utils/referral').context();this.setData({referrerName:(r.binding||r.candidate||{}).name||'',bound:!!r.binding});}
  catch(e){this.setData({error:e.message||'推荐信息暂未加载，请重试'});}
  finally{this.setData({loading:false});}
 },
 login(){if(this.data.error){if(wx.retryInvitation)wx.retryInvitation();return;}wx.login({});}
});

},
"pages/course-poster/course-poster":function(require,module,exports,Page,wx,getApp,getCurrentPages){
const service=require('../../utils/consultationService');
const {classCard,classShare}=require('../../utils/coursePresentation');
// Keep this registered route available for older navigation paths.
Page({
 data:{loading:true,error:'',classInfo:null},
 onLoad(q={}){this.classId=q.id||'';},
 onShow(){this.refresh();},
 async refresh(){this.setData({loading:true,error:'',classInfo:null});try{const r=await service.call('GET_CLASS',{classId:this.classId});this.setData({classInfo:classCard(r.classInfo)});}catch(e){service.error(this,e);}finally{this.setData({loading:false});}},
 onShareAppMessage(){return classShare(this.data.classInfo);},
 detail(){if(this.data.classInfo)wx.navigateTo({url:'/pages/public-class-detail/public-class-detail?id='+encodeURIComponent(String(this.data.classInfo.id))});}
});

},
"pages/support/support":function(require,module,exports,Page,wx,getApp,getCurrentPages){
Page({
 data:{about:false,version:'体验版',questions:[{title:'如何申请线下咨询？',answer:'先报名公开课，实际到课并由工作人员核实后，在“我的报名与咨询”中提交申请。工作人员确认时间后即可填写孩子基础信息。'},{title:'报名后如何联系老师？',answer:'进入“我的报名”，打开对应场次的入场凭证，查看进群指引；课程提供电话时，可直接联系工作人员。'},{title:'发送或保存失败怎么办？',answer:'先检查网络和登录状态。聊天发送未确认时，先查看记录是否已出现该消息，再使用保留的原文重试。'}]},
 onLoad(q={}){let version='体验版';try{const a=wx.getAccountInfoSync();version=a.miniProgram.version || (a.miniProgram.envVersion==='develop'?'开发版':'体验版');}catch(_){}this.setData({about:q.kind==='about',version});wx.setNavigationBarTitle({title:q.kind==='about'?'关于知守':'帮助与支持'});},
 classes(){wx.navigateTo({url:'/pages/public-class/public-class'});},
 privacy(){wx.navigateTo({url:'/pages/privacy/privacy'});}
});

},
}};