# 聊天底部组件 UI 检查

- source visual truth path: `/var/folders/v2/r7prvv054l16hc_s9l6kx6700000gp/T/TemporaryItems/NSIRD_screencaptureui_7IQ746/截屏2026-09-18 19.35.11.png`
- implementation screenshot path: `.codex-work/chat-ui/after-390.png`、`.codex-work/chat-ui/after-320.png`
- implementation: `http://localhost:3000/web/#/pages/chat/chat`
- viewport: 390×844、320×700 CSS px，DPR 1；截图分别同尺寸。
- source dimensions: 846×254 像素局部裁图；原图没有视口/DPR元数据，不假定像素密度相同。按底部组件相对比例对照，无整页像素级还原结论。
- state: 未登录、无历史会话，登录提示关闭。
- full-view evidence: 390和320截图包含完整聊天页、底部状态卡及导航；修改仅限网页适配层的底部组件。
- focused evidence: 已在同一工具输出中展示用户底部裁图与390宽实拍。源图是需要改善的现状，状态卡替换是本次明确说明的改进方向，不是逐像素复刻。

## Findings / comparison history

- [P2，已修复] 无会话却展示大块禁用文本框、灰色发送键，缺少就近可操作入口。改为两级状态文案与“查看咨询”按钮，已点击验证进入客户服务记录页。
- [P2，已修复] 原网页文本框显示原生拖拽角，提示粗重。无会话状态不再渲染输入控件；可输入状态采用14px常规字重、44px起始高度、144px上限、禁用手动拖拽。
- Typography: 沿用系统中文字体，状态标题14px/500，说明12px/19px，底部提示11px/18px。320宽说明自然折两行，未截断。
- Layout: 白色卡片18px圆角、14/16px内边距；按钮44px高；320与390均无横向溢出，底部导航完整可见。
- Colors: 沿用暖白和墨绿，按钮浅绿底，文案层级清晰，无新增装饰图像。
- Assets: 该组件无图片素材需求；其他页面资产未改。
- Copy: 保留服务范围提示，将操作指引移到可点击按钮。
- Console: 浏览器本次error日志为空。
- Checks: web-replica现有测试5/5通过，构建24页完成，原小程序源码未改动。
- Limit: 真实有权限会话未进行发送消息实测，本次不变更发送或后台权限逻辑。

final result: passed
