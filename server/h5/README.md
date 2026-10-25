# 知守课程 H5

网页入口是 `/web/`，课程与报名继续调用 Zion 主动作流。网页登录和新订单付款授权统一使用服务号 `wx8daa76a8eb887e47`。网页登录回调由 Zion 的 `WEBSITE_WECHAT_LOGIN` 操作携带 `GUANZHISHOU_PAYMENT_APP_SECRET` 换取真实微信身份，并按微信返回的 UnionID 恢复原账号；匹配不到时才创建新账号。AppSecret 与微信 access_token 不进入网页、GitHub 或浏览器会话。

已匹配的老账号继续使用原账号编号、用户名和原 OpenID 认证，课程、档案、工作人员与推荐关系不迁移；不能因换公众号而覆盖旧 OpenID。新旧服务号须接入同一微信开放平台并返回同一 UnionID；缺少 UnionID、重复匹配或凭据不一致时拒绝登录，不凭昵称、手机号、客户端账号编号进行合并。

## Zeabur 部署

Zeabur 使用仓库根目录部署时，选择 Node.js 服务并设置：

- Start Command：`npm start`
- Health Check Path：`/healthz`
- 网页入口：`/web/`

`/healthz` 会返回当前正式发布标识；`release: 2026.09.24.2` 对应扫码进场名单显示完整联系电话的协作仓库版本，可用于确认正式服务是否已切换到本次构建。

根目录 `index.js` 会同时提供网页静态资源、`/api/h5`、`/api/wechat-oauth-callback` 和健康检查。不要使用 Zeabur 默认的 `node /src/index.js`，该路径不在本项目中。

Vercel 发布时执行根目录 `build-vercel-public.js`，把同一份 `web/` 复制到构建产物 `public/web/`；API 继续由 `api/h5.js` 和 `api/wechat-oauth-callback.js` 提供。生成目录只用于部署，不提交到 GitHub。

部署环境必须配置：

- `WECHAT_OA_APP_ID`：现有分享／扫一扫的公众号 AppID，默认 `wx6dafecca8d5fd24e`；不再决定网页登录的 AppID。网页登录固定采用支付模块的 `wx8daa76a8eb887e47`，避免旧部署变量覆盖本次切换。
- `WECHAT_OA_APP_SECRET`：现有分享／扫一扫的公众号 AppSecret；在 Vercel/Zeabur 中按 Secret 类型保存，禁止提交到仓库。旧部署若已使用 `WECHAT_APP_SECRET`，服务端会兼容读取。
- `SESSION_SECRET`：至少 32 位随机字符串，用于签名登录会话、OAuth state 和推荐链接；旧部署若已使用 `SECRET`，服务端会兼容读取。Zeabur 未显式设置时可使用平台自动提供的 `PASSWORD` 特殊变量。
- `PUBLIC_ORIGIN`：正式 HTTPS 域名，例如 `https://course.example.com`。
- `ZION_GRAPHQL_URL`：可省略，默认使用项目 `JmAxbl1MMe4` 的正式 GraphQL 地址。

公众号后台需要把 `PUBLIC_ORIGIN` 的域名配置为网页授权域名。回调地址固定为 `/api/wechat-oauth-callback`。网页登录由 Zion 配置的微信接口 `rvhgukwrr` / `txlbvb2a7` 在服务端使用新服务号 Secret；网页登录不会回退旧 AppSecret 或旧公众号的 `loginWithWechat`。Zion 继续保存账号、报名与推荐关系。

签到页在微信内调用扫一扫前，还需要公众号的 JS-SDK 签名。正式域名必须另行配置为公众号的「JS 接口安全域名」，部署服务也必须能用该公众号的 AppID / AppSecret 获取 `access_token` 和 `jsapi_ticket`。可用 `GET /api/h5?action=share-signature&url=https%3A%2F%2Fwww.apply.tianqiwushu.cn%2Fweb%2F` 核对签名接口：应返回 `ok:true`；若返回 500，先根据响应中的缺失配置或微信错误码核查公众号凭据及接口调用权限。错误码 `40164` 时，响应只提取微信返回的出口 IPv4 地址；该地址须在公众号后台的接口 IP 白名单配置，GitHub 仓库变量或 Zeabur 入站白名单不能替代。签名接口正常但手机返回 `scanQRCode:the permission value is offline verifying` 时，要核对同一 AppID 的 JS 接口安全域名和微信 `wx.config` 权限校验；网页已把 `scanQRCode` 放进 `jsApiList`，会重新配置后重试一次，仍被拒绝时尝试网页实时相机，再退回拍照或手输入场码。微信支付的可用性不能替代扫一扫的 JS-SDK 权限验证。

推荐链接的 `ref` 参数是服务端签名值。用户首次通过推荐链接完成微信登录时写入推荐关系；后端唯一约束确保一名用户只能锁定一个推荐人。用户只能经动作流读取自己发出的直属推荐关系。


## 课程报名二维码有效期与入口恢复（2026-10-12）

- 课程专属推荐码签名中包含课程 ID，扫码、发起登录及授权回调使用已核验的 `GET_CLASS` 读取实时课程状态与报名截止时间，不按二维码生成日起的固定天数失效。有效截止为 `registration_closes_at` 与 `starts_at` 中较早者，未设置报名截止时使用开课时间，与现有后台报名规则一致。调整截止时间后原二维码继续按最新配置判断。
- 旧二维码只在原签名真实、明确进入具体课程且该课程仍开放报名时兼容其旧时间戳；篡改签名、修改专属课程 ID、非课程过期推荐码仍拒绝。登录会话、OAuth state 和问卷链接的原有有效期保持。签名密钥已变化的旧码无法恢复，须重新生成。
- 入口重试重新请求保存邀请，恢复后发起微信授权或回到原课程；地址栏保留课程位置，刷新不会丢失。邀请页不依赖可选推荐展示查询，明确显示实际网络错误、登录过期或报名截止原因。后端登录过期时先保留邀请，再要求重新微信授权。
- 报名满额、截止、工作人员身份、既有推荐归属与换号隔离仍由现有后端判断。本次无数据结构、权限或客户业务记录修改。


## 2026-10-25 微信登录 state 参数修复

- 用户反馈新服务号切换后微信只弹出“微信登录失败”。正式登录请求的 `state` 实测为238字节，超过微信要求的128字节；已查到的该时间段Zion错误日志不包含 `WEBSITE_WECHAT_LOGIN` 换码错误。AppID跳转正确不足以代表完整授权可用。
- 网页授权现在仅发送48位十六进制随机nonce。完整邀请、原账号及返回信息保存在10分钟有效、带服务端签名的 `zhishou_h5_oauth` Cookie（HttpOnly、SameSite=Lax；生产环境Secure）中；不把完整签名JSON放进微信state。
- 回调校验Cookie签名、过期时间、同一服务号及nonce一致性后才换码，并清除待登录Cookie。缺失／篡改／跨窗口或过期状态拒绝；原来的超长state不再接受，须重新点击微信登录。课程截止恢复、邀请归属和新旧账号匹配逻辑保留。
- 本次只改网页登录服务及验证，不更改Zion表、权限、公众号凭据或收款商户。登录、跨窗口拒绝、会话恢复、邀请连续性和付款相关164项测试通过，网页及静态产物构建通过；仍需微信客户端实际授权验收。
