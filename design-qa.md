# 网页课程卡组设计核验

- Source visual truth: `/var/folders/v2/r7prvv054l16hc_s9l6kx6700000gp/T/codex-clipboard-b9e54263-3e69-444e-b67d-78b476914b7f.png`
- Implementation capture: `/tmp/zhishou-implementation-20260916.png`
- Combined comparison: `/tmp/zhishou-design-compare-20260916.png`
- Source dimensions: 1364 × 648 px.
- Implementation dimensions: 1280 × 720 px, desktop browser with the responsive course shell centered at its designed maximum width.
- State: anonymous home page; no published backend course exists, so the free-course card group shows its intentional empty state.

## Comparison history

The original cards had larger artwork, looser vertical spacing, and 16 px corner radii. The implementation now uses compact 112 px featured artwork, 12–14 px card radii, reduced section padding, and the same deep green, warm gold, paper-white visual tokens as the reference.

## Findings

- No actionable P0, P1, or P2 visual issues in the requested scope.
- The source is a desktop hero reference, while the changed scope is the smaller rounded card system and manager controls below it. The responsive shell intentionally remains narrower than the full-width reference so it reads as a phone-first course page on desktop.

## Required fidelity surfaces

- Fonts and typography: Song-style display headings remain reserved for course hierarchy; compact UI labels use the existing system Chinese font stack.
- Spacing and layout rhythm: section spacing, card padding, artwork height, and radii were reduced to make the card group denser without reducing control touch targets.
- Colors and tokens: forest green, warm gold, muted gray, and paper-white are preserved from the reference palette.
- Image quality and asset fidelity: this scope has no artwork asset replacement; course cards use backend course data and remain image-free until a real course cover is added.
- Copy and content: free public-course participation and the manager workflow match the current product requirements.

## Interaction checks

- Bottom navigation remains visible and the active item is identifiable by label, background, and `aria-current`.
- Anonymous users can read published courses; protected management API access returns `401 请先微信登录` without a session.
- The management form, roster view, and publish operation are only exposed after the backend `STAFF_CLASSES` authorization succeeds.
- Browser console check: no errors on the local home page.

final result: passed

## 2026-09-18 小程序网页复刻验收

final result: passed

范围：本次授权的页面与内容复刻；公众号真机登录和登录后写入、网页支付与录音不在此视觉通过结论内。

参考：用户提供的 `截屏2026-09-18 12.25.19.png`（784×1678，包含手机外框及原生状态栏）；网页截图：`outputs/replica-backup-20260918/web-home-390.png`（390×844 CSS 手机视口）。两张图片在同一比较输入中检查。比较原生屏幕内部内容，排除设备边框、状态栏、微信胶囊和底部系统条；网页当前为未登录状态，不复制原图用户身份或个人头像。

- 字体：复用原宋体标题和系统正文字体变量，标题层级、行高和换行保留。
- 间距：复用原 750rpx 设计尺寸换算，保留首页边距、深绿主卡、两列入口、搜索框与课程卡片排列。修复嵌套样式导入产生的重复 `#page` 选择器，恢复全部设计变量。
- 配色：复用深绿、香槟金、暖白及灰色边框原样式。
- 图片：沿用原后端课程封面；真实缺图时保持原“封面待更新”，未编造课程或用户图片。
- 内容：全部 24 页源码编译，实时读取原课程列表与介绍；首页与参考文案一致。旧 H5 的推荐页面另行保留。
- 交互：浏览器验证首页、免费公开课列表/详情、已截止报名的禁用态、课程搜索输入与筛选、课程介绍及空目录、聊天登录门槛、网页微信登录引导。
- 页面脚本：浏览器核验无 error/warn；自动测试覆盖全部页面加载、选择器、输入、循环和条件状态。

保留差异：浏览器不绘制假的 iPhone 状态栏、微信胶囊；未登录头像显示“知”。桌面以最大430px宽居中展示原移动界面。网页支付、录音和定位能力边界见交付说明。
