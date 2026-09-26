# 知守课程 H5

网页入口是 `/web/`，课程与报名继续调用 Zion 主动作流。微信内点击登录后，网页取得公众号一次性授权 `code`。部署环境配置了公众号 AppSecret 时，服务端直接向微信换取真实用户身份，再创建或恢复对应的 Zion 账号；未配置时保留 Zion `loginWithWechat` 兼容路径。AppSecret 只保存在本地或部署平台的加密环境变量中，不进入 GitHub。

## Zeabur 部署

Zeabur 使用仓库根目录部署时，选择 Node.js 服务并设置：

- Start Command：`npm start`
- Health Check Path：`/healthz`
- 网页入口：`/web/`

`/healthz` 会返回当前正式发布标识；`release: 2026.09.24.2` 对应扫码进场名单显示完整联系电话的协作仓库版本，可用于确认正式服务是否已切换到本次构建。

根目录 `index.js` 会同时提供网页静态资源、`/api/h5`、`/api/wechat-oauth-callback` 和健康检查。不要使用 Zeabur 默认的 `node /src/index.js`，该路径不在本项目中。

Vercel 发布时执行根目录 `build-vercel-public.js`，把同一份 `web/` 复制到构建产物 `public/web/`；API 继续由 `api/h5.js` 和 `api/wechat-oauth-callback.js` 提供。生成目录只用于部署，不提交到 GitHub。

部署环境必须配置：

- `WECHAT_OA_APP_ID`：已认证公众号的 AppID；本项目默认使用 `wx6dafecca8d5fd24e`，可由环境变量覆盖。
- `WECHAT_OA_APP_SECRET`：公众号 AppSecret；在 Vercel/Zeabur 中按 Secret 类型保存，禁止提交到仓库。旧部署若已使用 `WECHAT_APP_SECRET`，服务端会兼容读取。
- `SESSION_SECRET`：至少 32 位随机字符串，用于签名登录会话、OAuth state 和推荐链接；旧部署若已使用 `SECRET`，服务端会兼容读取。Zeabur 未显式设置时可使用平台自动提供的 `PASSWORD` 特殊变量。
- `PUBLIC_ORIGIN`：正式 HTTPS 域名，例如 `https://course.example.com`。
- `ZION_GRAPHQL_URL`：可省略，默认使用项目 `JmAxbl1MMe4` 的正式 GraphQL 地址。

公众号后台需要把 `PUBLIC_ORIGIN` 的域名配置为网页授权域名。回调地址固定为 `/api/wechat-oauth-callback`。生产环境通过服务器端 OAuth 使用公众号 AppID 与 AppSecret，Zion 继续保存账号、报名与推荐关系。

签到页在微信内调用扫一扫前，还需要公众号的 JS-SDK 签名。正式域名必须另行配置为公众号的「JS 接口安全域名」，部署服务也必须能用该公众号的 AppID / AppSecret 获取 `access_token` 和 `jsapi_ticket`。可用 `GET /api/h5?action=share-signature&url=https%3A%2F%2Fwww.apply.tianqiwushu.cn%2Fweb%2F` 核对签名接口：应返回 `ok:true`；若返回 500，先根据响应中的缺失配置或微信错误码核查公众号凭据及接口调用权限。签名接口正常但微信仍拒绝配置时，再核查 JS 接口安全域名。签到页保留拍照识码及手输报名凭证下方入场码的入口。

推荐链接的 `ref` 参数是服务端签名值。用户首次通过推荐链接完成微信登录时写入推荐关系；后端唯一约束确保一名用户只能锁定一个推荐人。用户只能经动作流读取自己发出的直属推荐关系。
