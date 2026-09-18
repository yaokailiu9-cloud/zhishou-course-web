## 2026-09-18 小程序完整网页复刻

`/web/` 现在使用原小程序的 24 个页面、样式和业务模块；微信开发者工具中的小程序源码保留。原简化网页保留于 `/web/legacy/`。

```sh
npm ci
npm run build:web
npm test
npm start
```

托管环境直接 `npm start`；网页产物已提交，无需现场构建。功能边界、公众号配置及协作说明见 [复刻交付说明](docs/小程序网页复刻交付-20260918.md)。

# 知守课程网页

这是“知守”课程与报名网页项目。当前网页版本保留首页、课程详情、微信内登录、报名记录和直属推荐关系功能；页面不展示咨询师或人物素材。

## 网页入口与访问方式

- 网页文件：`web/index.html`、`web/app.css`、`web/app.js`
- 服务端接口：`api/h5.js`、`api/wechat-oauth-callback.js`
- 核心服务：`server/h5/index.js`
- 正式环境通过受保护的分享链接访问，源码仓库保持私有。
- 微信登录需要在托管平台配置公众号 AppID、公众号 AppSecret、会话密钥和正式域名；这些值不得提交到 GitHub。

## 当前主课程

《透过现象·直击本质》二阶线上共修营·03期，属于自愿参与的付费进阶课程。建档家长 ¥680，未建档家长 ¥1680，具体开营时间和报名入口待完善。

## 验证

```bash
npm test
```

下文保留原生微信小程序及 Zion 后端的开发说明。

---

# Empath 咨询小程序前端

## 2026-09-08 客户入口与线下咨询调整（待正式同步）

- 客户入口位于首页、个人页和经理工作台；切回客户端清理经理会话缓存并保留真实登录身份。
- 新增免费公开课报名、进群/到课核实、预约确认、孩子基础信息、老师记录、留言/反馈/回复。
- 后端以实际到课为申请门槛，内部付费课程暂缓；新预约不创建支付订单。
- 文字总结仅覆盖本次预约页面的留言、执行反馈和老师回复。音频代码包含参与者同意、私有上传、异步转写、失败重试，均待真实 AI 联调。
- 新的表和动作流已保存至 Zion 编辑草稿，结构验证通过；**没有同步正式后端，没有发布小程序**。
- 已获工作人员/AI 权限收紧及正式 Zion 联调授权。两类默认角色对 service_provider 的写权限、登录用户对四张 AI 系统表的读取/统计权限已在草稿关闭。合成账号实测发现跨账号读取/修改可行；账号隔离变更另被自动审批拦截，待该项确认，当前 Mac 锁屏也阻止编辑器操作。正式同步尚未执行。
- 个人资料保存不再直接更新 service_provider；显示名称/头像优先读取关联 account，人员身份与能力由后台维护。
- 原 `docs/design-tokens.wxss` 已移至 `styles/design-tokens.wxss`，共享咨询样式在 `styles/consultation-components.wxss`。
- 完整表关系见根目录《数据库结构与关联关系说明.md》；本次实现、验证和待办见 `docs/咨询服务交付状态.md`。


这是一个原生微信小程序前端骨架，包含首页、答主广场、答主详情、AI 助手和个人中心。

## 最新业务要求（2026-09-08）

当前改造要求见 [免费公开课与线下咨询服务流程](docs/公开课到咨询服务流程.md)：免费公开课报名并核实实际参加后，才能申请线下咨询；工作人员确认预约后填写孩子基础信息，咨询后由老师整理记录、家长反馈执行情况、老师回复。总结同时覆盖文字聊天和线下面谈录音。内部付费课程暂缓。这是已整理的需求，尚未实施上线；下文及旧设计文档中的直接付费文字咨询描述属于现有版本。

## 使用方式

1. 打开微信开发者工具。
2. 选择“导入项目”。
3. 项目目录选择当前文件夹：`/Users/nidie/Documents/（情感对话）`。
4. AppID 可以先使用测试号或替换为你自己的小程序 AppID。

## Zion 后端配置

后端入口集中在：

```text
utils/zion.js
```

当前已配置：

```text
APPID = wx35d600312d9c89f3
PROJECT_ID = JmAxbl1MMe4
ZION_WEB_URL = https://zion.functorz.com/tool/JmAxbl1MMe4/WECHAT
ZION_GRAPHQL_URL = https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2
```

`ZION_WEB_URL` 是 Zion 的网页入口。小程序前端实际读取数据使用 `ZION_GRAPHQL_URL`，后端数据模型已通过 `zion-mcp` 同步到项目 `JmAxbl1MMe4`。

## 微信公众平台服务器域名

本地原生小程序使用 Zion 后端时，需要在微信公众平台配置服务器域名：

路径：`微信公众平台 → 开发管理 → 开发设置 → 服务器域名`

当前代码实际请求的是 Zion GraphQL 后端：

```text
https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2
```

微信后台按域名填写，不要带 `/zero/...` 路径：

```text
request 合法域名：
https://zion-app.functorz.com
https://cdn.functorz.com
https://fz-zion-static.functorz.com
https://fz-zion.oss-cn-shanghai.aliyuncs.com

socket 合法域名：
wss://zion-app.functorz.com

uploadFile 合法域名：
https://fz-zion.oss-cn-shanghai.aliyuncs.com

downloadFile 合法域名：
https://cdn.functorz.com
https://fz-zion-static.functorz.com
https://fz-zion.oss-cn-shanghai.aliyuncs.com
```

当前代码只必须依赖 `request 合法域名` 里的 `https://zion-app.functorz.com`。其余域名是 Zion 小程序资源、订阅、文件和图片能力的推荐配置，提前加上能减少真机发布后的资源加载问题。

## 真实微信登录

本地原生小程序不能把 `AppSecret` 放进前端代码，所以真实微信登录需要一个安全后端桥接接口。

这个小程序账号已经授权给 Zion 第三方平台使用云开发资源，微信开发者工具会返回：

```text
该小程序账号已授权服务商使用云开发资源，因此无法使用云开发资源
```

所以当前不能用自己的 `wx.cloud.callFunction` 部署微信云函数。真实登录走独立 HTTPS 桥接服务。

桥接代码已放在：

```text
server/wechat-login
```

这个接口会：

1. 接收小程序传来的 `wx.login` code 和 `getPhoneNumber` 返回的手机号临时 `phone_code`。
2. 服务端用 `appid + appsecret` 调微信官方接口换 `openid` 和手机号。
3. 服务端用 Zion GraphQL 写入/更新 `account` 表。
4. 返回真实 `account_id`、`wechat_openid`、`phone_number`。

注意：`phone_code` 不是 `wx.login` 的 code。它来自：

```xml
<button open-type="getPhoneNumber" bindgetphonenumber="loginByWechat">
  微信一键登录
</button>
```

用户同意后，回调里的 `event.detail.code` 才是手机号临时 code，有效期约 5 分钟且只能使用一次。

部署时把这些值配置成环境变量，不要写进前端：

```text
WECHAT_APP_ID=wx35d600312d9c89f3
WECHAT_APP_SECRET=微信公众平台 AppSecret
ZION_GRAPHQL_URL=https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2
ZION_ADMIN_TOKEN=Zion Connect Backend Admin Bearer Token
```

部署完成后，再把线上 HTTPS 地址填到：

```text
utils/zion.js
WECHAT_LOGIN_BRIDGE_URL = "https://你的后端域名/wechat-login"
```

然后在微信公众平台把这个后端域名也加入 `request 合法域名`。

### Vercel 部署

仓库里已经加了 Vercel serverless 入口：

```text
api/wechat-login.js
vercel.json
```

部署到 Vercel 后，接口地址会是：

```text
https://你的项目域名.vercel.app/wechat-login
```

在 Vercel 项目环境变量里填写：

```text
WECHAT_APP_ID=wx35d600312d9c89f3
WECHAT_APP_SECRET=微信公众平台 AppSecret
ZION_GRAPHQL_URL=https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2
ZION_ADMIN_TOKEN=Zion Connect Backend Admin Bearer Token
```

然后把这个线上地址写回 `utils/zion.js` 的 `WECHAT_LOGIN_BRIDGE_URL`。不要把小程序前端指向本地端口；真机和微信开发者工具都应走线上 HTTPS 服务或 Zion 用户事件。

### 微信后台必须确认

真实手机号授权要求小程序后台已开通手机号能力：

```text
微信公众平台 → 开发管理 → 接口设置 → 手机号快速验证 / 手机号实时验证
```

正式版还需要把部署后的域名加入：

```text
微信公众平台 → 开发管理 → 开发设置 → 服务器域名 → request 合法域名
```

## 当前页面

- `pages/index/index`：首页入口
- `pages/plaza/plaza`：答主广场
- `pages/advisor/advisor`：答主详情和提问弹窗
- `pages/chat/chat`：AI 倾听助手
- `pages/profile/profile`：个人中心

当前页面有 mock 数据兜底，所以 Zion 接口没通时也能先看完整前端。
