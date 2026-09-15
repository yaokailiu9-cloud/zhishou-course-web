# 知守课程 H5

网页入口是 `/web/`，课程与报名继续调用 Zion 主动作流。微信内点击登录后，服务端使用公众号网页授权取得微信身份，再创建或恢复对应的 Zion 账号。

部署环境必须配置：

- `WECHAT_OA_APP_ID`：已认证公众号的 AppID。
- `WECHAT_OA_APP_SECRET`：公众号 AppSecret，只放在服务端环境变量。
- `SESSION_SECRET`：至少 32 位随机字符串，用于签名登录会话、OAuth state 和推荐链接。
- `PUBLIC_ORIGIN`：正式 HTTPS 域名，例如 `https://course.example.com`。
- `ZION_GRAPHQL_URL`：可省略，默认使用项目 `JmAxbl1MMe4` 的正式 GraphQL 地址。

公众号后台需要把 `PUBLIC_ORIGIN` 的域名配置为网页授权域名。回调地址固定为 `/api/wechat-oauth-callback`。

推荐链接的 `ref` 参数是服务端签名值。用户首次通过推荐链接完成微信登录时写入推荐关系；后端唯一约束确保一名用户只能锁定一个推荐人。用户只能经动作流读取自己发出的直属推荐关系。
