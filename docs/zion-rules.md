# Zion Rules For This Project

## 当前状态（2026-09-23 正式核对）

- 目标 `JmAxbl1MMe4`，当前部署 schema `B9K5XJZMvlq`；简易方案梳理商品分类、问卷入口及既有服务动作流已正式同步。
- 用户明确授权账号仅本人读写、默认角色关闭直接 AI/课程表访问。权限实测通过，工作人员身份和能力仍由后台维护。
- 免费课程姓名/手机报名 → 进群指引 → 工作人员核实实际到课 → 咨询申请及确认 → 孩子信息 → 老师记录 → 反馈回复。内部付费课程暂缓。
- 真实合成账号完成核心流程、并发最后一席、取消/重新报名、资料保存、查重及直接访问拒绝测试。文字和私有合成录音均生成 READY 草稿。
- `isUsernameAvailable` 使用主动作流的 `CHECK_USERNAME`，不再依赖客户端全局读取账号。
- 咨询总结 Agent `a3iok6bmd` 的 `maxRound=2`；录音第二轮附件提交需要这一设置。
- 合成业务记录和工作人员身份已清理；平台保护的合成 AI 会话、凭证账号及测试资产保留并记录。
- 70 项本地测试、23 WXML / 27 WXSS 官方编译通过。浏览器布局仅为间接证据；原生模拟器、真实微信登录/分享/相机/相册与小程序发布仍待验收。
- 9 月 10 日已按用户明确授权开启微信开发者工具服务端口并完成 Codex MCP 接入；官方连接检查通过。原生模拟器已恢复，首页公开课和客户入口已核对。现无待确认的接入权限，其他权限和正式同步无需再次申请。
- 详细交付与限制见 `docs/功能落实自查清单.md`。


Project: `JmAxbl1MMe4`

GraphQL endpoint:
- HTTP: `https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2`
- Subscription: `wss://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-subscription`

Admin Bearer Token:
- The token from Zion "Connect Backend" is for local/server-side debugging only.
- Never commit it.
- Never hardcode it in mini program frontend code.
- If a frontend feature needs privileged work, create a Zion user event/action flow or a trusted backend call instead.

Sources read:
- Zion Headless BaaS docs: https://docs.functorz.com/docs/developers/headless_vibe_coding
- Zion user events docs: https://docs.functorz.com/docs/actions/reference/user_event_collection
- Zion permissions docs: https://docs.functorz.com/docs/publish_operate/permissions
- Zion data model docs: https://docs.functorz.com/docs/data/guide/database_configuration
- Live project schema from Zion MCP for project `JmAxbl1MMe4`

## 简易方案梳理问卷工单（2026-09-23）

- 2026-09-23 通过 Zion CLI 重新加载正式项目并核对“公开课报名”表。正式部署 schema 为 `B9K5XJZMvlq`；本次不新增表或字段，继续使用已部署的数据结构。
- 一份问卷对应一条 `public_class_enrollment` 记录。工单状态保存在 `feedback_status`：`PENDING`（待处理）、`DRAFT`（处理中）、`CONFIRMED`（已完成）。管理员列表和详情必须继续通过主服务动作 `STAFF_CHILD_INTAKES` / `GET_CHILD_INTAKE` 读取，不能在前端直接放宽表权限。
- 管理员回复写入 `feedback_content`，保存草稿或发布统一调用 `SAVE_CHILD_FEEDBACK`。写入必须携带 `feedback_revision` 做并发校验；发布后记录 `feedback_reviewer_id`、`feedback_confirmed_at` 和 `feedback_available_at`，已发布正文不可覆盖。
- 家长只能读取自己报名记录。`DRAFT` 阶段以及确认后的等待期不返回 `feedback_content`；到达服务器生成的 `feedback_available_at` 后，`GET_QUESTIONNAIRE` 才返回正文并设置 `canViewFeedback=true`。客户端时间和客户端传入的开放时间均不能决定可见性。
- 网页 UI：二维码发放页只保留“问卷工单”入口；二级工单页按待处理、处理中、已完成筛选；工单详情负责保存和发布；家长问卷页负责显示进度与最终回复。

## Hard Rules

1. Always verify the live Zion schema before writing frontend calls.
   - Use Zion MCP `set_current_project`, then `get_project_schema`, `schema_table`, or `supportservice_graphql`.
   - Never guess table names, field names, action flow ids, or return shapes.
   - New mutable product data must be backend-first: create or verify the Zion table/field/actionflow, validate and sync backend, then wire the frontend to the verified API.
   - Do not ship new editable data as `utils/mock.js`, local storage, or hardcoded constants except as a clearly marked offline fallback.
   - If Zion schema editing is unavailable, stop and report the blocker instead of claiming the database was created.

2. Prefer Zion account/user-event semantics for login.
   - Zion docs say mini program login should use silent login to create or reuse `account`.
   - Avatar/nickname acquisition should update the account data.
   - Phone binding is an account binding/user-event concern; frontend cannot decrypt a phone number.

3. The frontend must not pretend to have a real phone number.
   - WeChat `getPhoneNumber` returns `code` in modern base libraries, or legacy encrypted payload.
   - The backend must exchange the phone `code` with WeChat and write the real number.
   - Store raw phone codes only for debugging when explicitly needed; do not display them as real phone numbers.

4. Use the actual project tables confirmed from schema.
   - `account`: has `wechat_nickname`, `wechat_avatar_url`, `wechat_openid`, `wechat_unionid`, `fz_phone_number`, `last_login_at`.
   - `wechat_login_record`: has `account_id`, `wechat_nickname`, `wechat_avatar_url`, `wechat_openid`, `login_at`, `raw_profile_json`.
   - `consultation_order`, `consultation_session`, and `consultation_message` are the chat/payment domain tables.

5. Distinguish test logging from real login.
   - `wechat_login_record` is suitable as an audit/debug record.
   - A real logged-in user should be represented by `account`, with openid/unionid and phone handled by Zion/WeChat backend logic.

6. GraphQL rules.
   - Use the deployed GraphQL endpoint only with fields verified from schema.
   - The HTTP endpoint for this project is `https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2`.
   - The subscription endpoint for this project is `wss://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-subscription`.
   - Do not place the Admin Bearer Token in `utils/zion.js`, page JS, WXML, checked-in docs, or any shipped client asset.
   - For hand-written where filters, use Zion's operator-first grammar.
   - Do not use unverified camelCase fields such as `phoneNumber` or `profileImageUrl`; this project uses names like `fz_phone_number` and `wechat_avatar_url`.
   - Frontend changes that alter user/profile/order/service-provider data must write through verified backend fields. After a successful backend write, local storage may only mirror the backend response for UI responsiveness.

7. Permission rules.
   - Zion permissions are RBAC + ABAC.
   - In mini programs, users are normally silently logged in; do not assume an anonymous role model.
   - Zion Plugin 2.7.7 supports permission changes through GET_TABLE_PERMISSION and UPDATE_ROLE_TABLE_PERMISSION. Read each role first, apply changes through the official tools, sync, then verify runtime access. Earlier editor-only guidance applies to the old plugin.
   - After schema or permission changes in Zion, backend sync/deploy is required.

8. Schema-edit rules.
   - Load schema first.
   - Inspect current table/field names.
   - Apply schema edits only through Zion MCP schema tools.
   - Validate, then sync backend.
   - Do not manually add foreign-key id fields when a Zion relation is the right model.

## Profile Storage

Status on 2026-07-05:

- Created and synced a real visible profile table in Zion.
- Table display name: `账户资料`
- API name: `account_profile`
- Zion generated a one-to-one relation from `account` to `account_profile` through `account.account_profile_id`.
- Current editable profile fields:
  - `user_name` TEXT
  - `avatar_url` TEXT
  - `city` TEXT
  - `address` TEXT
  - `gender` TEXT
  - `birthday` DATE
  - `phone` TEXT
  - `wechat_avatar_url` TEXT
  - `location_info` JSONB
- Runtime profile save must write `account_profile` first, then set `account.account_profile_id`.
- Keep `account.username`, `account.wechat_nickname`, and `service_provider.display_name` in sync for app-wide display.
- Do **not** write `account_profile` into `account.oauth2_user_info_map`. That field is Zion OAuth internals (`WECHAT` only); polluting it breaks `loginWithWechatMiniApp`.
- `account.oauth2_user_info_map.account_profile` was a legacy compatibility mirror and must not be updated anymore.

Runtime rule for the edit-profile page:

- Read and write `account_profile` as the source of truth.
- Also keep `account.username`, `account.wechat_nickname`, `account.wechat_avatar_url`, and `service_provider.display_name` in sync for app-wide display.
- Local storage may mirror the backend response for responsiveness, but must not be treated as persistent truth.

## Login Direction For This App

The current mini program code should move toward:

1. `wx.login` obtains a temporary login code.
2. Backend/Zion user-event or action flow exchanges code for `openid`.
3. Zion creates or updates `account`.
4. Avatar/nickname update `account.wechat_nickname` and `account.wechat_avatar_url`.
5. Phone authorization sends WeChat phone `code` to backend.
6. Backend exchanges phone code and writes `account.fz_phone_number`.
7. Frontend displays logged-in UI only after the backend returns the confirmed account data.

Until the real Zion user-event/action flow exists, `wechat_login_record` may be used only as a temporary audit record, not as proof that a real account login is complete.

## H5 WeChat OAuth Login (2026-09-19)

- 网页端使用天启无书公众号 AppID `wx6dafecca8d5fd24e` 构造 `oauth2/authorize` 地址；该 AppID 是公开标识，可由部署环境 `WECHAT_OA_APP_ID` 覆盖。
- 微信回调的一次性 `code` 由服务端携带部署平台中的 `WECHAT_OA_APP_SECRET` 向微信换取用户资料；随后按公众号 AppID 与 openid 生成稳定 Zion 用户名，先用 `authenticateWithUsername(register:false)` 登录，仅在 `ACCOUNT_DOES_NOT_EXIST` 时用 `register:true` 注册，并回写 `account.wechat_*` 字段。2026-09-20 运行时确认：已有账号使用 `register:true` 会返回 `USERNAME_ALREADY_EXISTS`，不能用于恢复登录。
- 网页微信账号的 `wxh5_` + 36 位十六进制用户名是稳定认证标识，保存个人资料时必须保留；可编辑昵称保存在 `account_profile.user_name` 和 `account.wechat_nickname`。
- 公众号 AppSecret 只配置在本地 `.env` 或 Vercel/Zeabur 的加密环境变量中，不得进入 GitHub。Zion JWT 只放入 HttpOnly 签名会话。
- 未配置 `WECHAT_OA_APP_SECRET` 时保留 Zion `loginWithWechat` 兼容路径；2026-09-19 运行时探测确认该 mutation 存在，但当前项目尚未设置 Zion 网页应用凭据，因此生产路径使用服务端公众号 OAuth。
- 公众号后台网页授权域名为 `www.apply.tianqiwushu.cn`，网页回调路径为 `/api/wechat-oauth-callback`。

## Manager / Service Provider Direction

经理端不是普通用户 UI 的一个隐藏页面，必须有后端身份和权限支撑。

Required data model:

- `service_provider`: service staff profile bound to `account` through a Zion relation.

Current business identity model（2026-09-21）:

- 已登录用户只使用三种业务身份：`管理`、`代理`、`用户`，不再增加第四种前台业务身份。
- `管理`：存在 `service_provider.service_kind = STAFF` 且 `service_status = ACTIVE` 的关联记录；实际能力继续由 `can_reply`、`can_accept_order` 等后端字段控制。
- `代理`：存在 `service_provider.service_kind = AGENT` 且 `service_status = ACTIVE` 的关联记录；代理身份不能因共用 `service_provider` 表而获得管理接单或回复能力。
- `用户`：没有启用中的 `STAFF` / `AGENT` 关联记录。`account.user_type` 只作兼容展示，不可单独作为授权依据。
- 正式启用账号只保留三个：刘曜恺 `account.id = 1000000000000019`（管理）、周流君騰 `account.id = 1000000000000020`（用户）、程思琦 `account.id = 1000000000000021`（管理）。刘曜恺网页账号关联 `service_provider.id = 14`，并承接原工作人员的 `advisor.id = 5` 与历史课程关系。

Status on 2026-09-21（身份管理）:

- 管理工作台新增“身份管理”，只允许启用中的 `STAFF` 且同时具备 `can_reply` / `can_accept_order` 的当前登录账号调用。
- `LIST_ACCOUNT_IDENTITIES` 与 `SET_ACCOUNT_IDENTITY` 都在主服务动作流内重新核验当前账号；客户端传入的角色、昵称或缓存不作为授权依据。
- 管理只能修改其他用户，不能在该页面降低自己的管理身份，避免误操作导致系统无可用管理账号。
- 身份变更同时更新 `account.user_type` 兼容显示和 `service_provider` 真实业务身份；改成“用户”时保留历史服务人员记录但将其设为 `INACTIVE`，避免破坏已有咨询关系。
- 新增 `identity_change_log`（身份变更记录），通过两个显式账户关系记录操作人与目标用户，并保存原身份、新身份和备注。Anonymous User 与 Logged-in User 对该表的直接查询、写入、修改、删除和统计均关闭，只有动作流服务端写入。
- `LIST_ACCOUNT_IDENTITIES` 必须固定使用 `account.fz_deleted = false`；Zion 官方注销接口会保留不可登录的系统墓碑记录，管理页不得把注销账号当成可管理用户返回。
- 清理未绑定的旧表：`wechat_login_record`（0 条）、`advisor_favorite`（0 条）、`recommendation`（4 条早期占位数据）、`ud_banbenshenhe_ebcabf`（1 条早期占位数据）。线下预约、记录、反馈、总结等空表仍被正式流程引用，全部保留。

Status on 2026-07-04:

- Created and synced `service_provider`.
- Added Zion relations:
  - `account` one-to-one `service_provider`, generating `service_provider.account_id` with unique constraint `service_provider_account_id_key`.
  - `service_provider` one-to-many consultation sessions.
- Added `consultation_session.service_provider_id` through the Zion relation.
- The project is still `pre_type_system_refactor`, so status-like fields were created as `TEXT` instead of enum types.
- 权限修改需通过当前官方 Zion CLI 的权限工具执行并在同步前回读 Anonymous User 与 Logged-in User；编辑器仍可用于人工复核。
- Historical note: the earlier CLI could not configure permissions. Since Zion Plugin 2.7.7, the official CLI supports role/table permissions and row-condition binding tools.

Status on 2026-07-04 later（历史记录，经理身份已在 2026-08-16 校正）:

- Added `consultation_session.customer_avatar_url` so manager pages can show the customer's real login avatar instead of an anonymous placeholder.
- 测试客户仍为 `account.id = 1000000000000002`（“测试客户小安”）。
- 当前真实经理身份为 `account.id = 1000000000000010`（“刘曜恺”）。旧的 `1000000000000003 / 林静经理` 记录不再作为前端默认经理。
- 当前 `service_provider.id = 1` 绑定 `account.id = 1000000000000010` 和 `advisor.id = 5`，`service_status = ACTIVE`、`can_reply = true`、`can_accept_order = true`。
- Frontend temporarily exposes a manager workbench entry that reads the backend-created active `service_provider` identity directly. Remove or protect this direct entry before production release.
- Verified an end-to-end test in Zion: customer paid order → waiting session with `customer_nickname` and `customer_avatar_url` → manager accepted session → customer and manager messages were both saved.
- Removed old/unused backend tables on 2026-07-04: `manager_profile`, `service_provider_wallet_log`, `service_provider_withdrawal`, and `service_quick_reply_template`.

Status on 2026-07-09:

- Removed manager personal withdrawal UI and `service_provider` fields `can_withdraw`, `completed_order_count`, `withdrawable_income` (synced to Zion backend). Managers no longer see order count or withdrawable amount on profile.
- Added `consultation_message` recall audit fields: `is_recalled`, `recalled_at`, `recalled_by_account_id`, `recalled_content`, `visible_to_customer`, `replaces_message_id`, `replaced_by_message_id`.
- Manager chat: long-press own message within 60s to recall; manager-only recall notice with re-edit; customer queries filter `visible_to_customer = true`.

Permission source of truth:

- Frontend may hide manager pages for user experience, but it is not security.
- The manager UI must be entered from customer `profile` only after backend confirms `service_provider`; do not expose it as a normal public tab or public menu.
- The manager page itself must re-check backend `service_provider` access and redirect ordinary users back to `profile`.
- The real permission must be in Zion Permission Management.
- A user can reply only when their related `service_provider` has:
  - `service_status = ACTIVE`
  - `can_reply = true`
- A user can accept orders only when:
  - `service_status = ACTIVE`
  - `can_accept_order = true`

Do not implement manager access by only checking local storage, nicknames, or frontend route names. Use backend relation and row-level permission filters.

## WeChat Login Action Flow

Action Flow:
- Display name: `小程序微信登录`
- Name: `miniapp_wechat_login`
- ID: `4e0d236b-9a2c-4510-9c73-8cdade71e9e3`
- Runtime version used by GraphQL: `1`

Inputs:
- `login_code` TEXT
- `phone_code` TEXT
- `nick_name` TEXT
- `avatar_url` TEXT
- `raw_profile_json` JSONB

Outputs:
- `success` BOOLEAN
- `account_id` BIGINT
- `wechat_openid` TEXT
- `phone_number` TEXT
- `message` TEXT

Status on 2026-07-03:
- The Action Flow was created, validated, and synced to Zion backend.
- A direct GraphQL invocation succeeded with `versionId: 1`.
- Current output intentionally returns `success: false` until the WeChat backend exchange is configured.
- Frontend `utils/zion.js` must call `fz_invoke_action_flow`; do not restore direct writes to `wechat_login_record` for login.

GraphQL invocation shape:

```graphql
mutation InvokeWechatLoginAction($args: Json!) {
  fz_invoke_action_flow(
    actionFlowId: "4e0d236b-9a2c-4510-9c73-8cdade71e9e3",
    versionId: 1,
    args: $args
  )
}
```

## Login Status 2026-07-05

Verified against the live runtime GraphQL schema (introspection on `graphql-v2`):

- Zion 内置微信登录可用：`loginWithWechatMiniApp(code: String!, createIfNotExists: Boolean) -> LoginResult { account { id username phoneNumber profileImageUrl permissionRoles } jwt { token } }`。
  后端用小程序 `wx.login` code 调微信 code2session（项目已配置 AppSecret），自动创建/复用 `account` 并写入 openid。这是被 Zion 微信行为识别的真实登录。
- 手机号（微信付费组件不可用期间的替代路径，均为 Zion 内置 mutation）：
  - `sendVerificationCodeToPhone(telephone: String!, verificationEnumType: BIND) -> Boolean`
  - `bindPhoneNumberByVerificationCode(telephone: String!, verificationCode: String!) -> Boolean`（需携带登录 JWT，绑定后写入 `account.fz_phone_number`）
- 前端实现：
  - `utils/zion.js`：`loginWithWechat` 现在先走 `loginWithWechatMiniApp` 真实登录并保存 JWT，再同步 `wechat_nickname` / `wechat_avatar_url`，最后读回 `account` 确认；`sendPhoneVerificationCode` / `bindPhoneNumberByCode` 提供短信绑定。
  - `pages/profile`：登录按钮改为微信一键登录（不再被 getPhoneNumber 阻塞）；登录后如 `fz_phone_number` 为空，展示手机号短信绑定面板。
- 保留 `miniapp_wechat_login` Action Flow 调用路径：一旦微信手机号快速验证组件购买开通，`getPhoneNumber` 的 `phone_code` 仍会走该 Action Flow 换取手机号。
- 2026-07-05 已实测：短信验证码可以正常发送并完成绑定（真机验证通过，`fz_phone_number` 已写入）。

Update 2026-07-06 later（登录改为微信身份）:

- 登录方式改为 **微信身份登录**（不再使用手机号短信验证码）：
  - `loginWithWechatIdentity({ nickName, avatarUrl })`：`wx.login` → `loginWithWechatMiniApp` 按 `wechat_openid` 创建/复用唯一 `account`（一个微信一个账户）→ 首次登录必须设置唯一用户名 + 头像并写入 `account_profile` / `account.username`。
  - `isUsernameAvailable(userName, excludeAccountId)`：检查 `account.username` 与 `account_profile.user_name` 全局唯一。
  - 老用户再次登录：若后端已有用户名和头像，可直接点「微信登录」恢复账户，无需重复填写。
  - 头像本地临时文件会先 `uploadImage` 上传到 Zion 图片资产库再绑定 `avatar_image_id`。
- 手机号短信登录代码（`sendLoginVerificationCode` / `loginWithPhoneNumber`）保留在 `utils/zion.js` 但 profile 页已不再使用。

Update 2026-07-05 later（按产品要求调整）:

- 登录方式改为手机号 + 短信验证码直接登录：
  - `sendLoginVerificationCode`：先查 `account.fz_phone_number` 是否已有账户，已注册发 `LOGIN` 码，未注册直接发 `SIGN_UP` 码并返回 `mode`。**不能**先尝试 `LOGIN` 再回退 `SIGN_UP`——未注册手机号用 `LOGIN` 类型也能发码成功，但登录时 `register:false` 会报 `bad verification code`。
  - `loginWithPhoneNumber(telephone, code, profile, codeMode)`：调 `authenticateWithPhoneNumber`，`register` 参数必须与发码类型一致（`LOGIN` → `register:false` 匹配原账户直接登录；`SIGN_UP` → `register:true` 自动建账户）。
  - 关键坑（2026-07-05 真机踩过）：验证码类型与 `register` 不一致时返回 `VERIFICATION_CODE_AUTHENTICATION_FAILED (bad verification code)`。已注册手机号发的是 LOGIN 码，却带 `register:true` 去登录就会失败。前端必须保存发码时的 `mode` 并原样传回。
  - 关键坑（2026-07-06）：未注册手机号若误发 LOGIN 码，表现与「验证码错误」完全相同；2026-07-06 已改为发码前先查 account 表决定类型。
  - 老账户重登时不覆盖后端已有昵称/头像，只在后端缺失时补写。
- 「已绑定手机号」展示从 profile 页挪到 profile-edit（编辑个人资料）页，带「已验证」标记，只读。
- 微信一键登录（`loginWithWechatMiniApp`）与短信绑定（`bindPhoneNumberByCode`）代码保留在 `utils/zion.js`，未来可作为微信账号关联能力使用。

## Avatar Upload Status 2026-07-06

个人资料头像已改为真实上传绑定后端：

- `account_profile` 表新增 `avatar_image` IMAGE 列（生成 `avatar_image_id`），已通过 MCP `schema_table` 添加并 `sync_backend` 部署。
- 历史坑：旧代码把微信 `chooseAvatar` 返回的本地临时路径（`wxfile://tmp_...`）直接存进了 `avatar_url` TEXT 字段，换设备/重启后全部失效。修复后保存资料时若头像仍是本地文件，先走 `imagePresignedUrl` 上传到 Zion 图片资产库，再把 `avatar_image_id` 写入 `account_profile`。
- 前端新增 `utils/md5.js`（上传需文件 MD5 Base64）与 `utils/zion.js` 的 `uploadImage(filePath)`。
- `normalizeAccount` 头像优先级：`avatar_image.url`（每次查询重新签名，永不过期）> `avatar_url` 文本（老数据兜底）> `account.wechat_avatar_url`。
- 匿名角色已验证可读 `account_profile.avatar_image { url }`；`account_profile_set_input` 含 `avatar_image_id`。
- 遗留：`service_provider.avatar_url` 仍是 TEXT，保存资料时同步进去的签名 URL 会过期；后续应同样迁移为 IMAGE 列。

## Advisor Table Status 2026-07-06

首页/搜索页的专家数据已改为后端优先：

- `advisor` 表（显示名「答主」）新增 `avatar_image` IMAGE 列（生成 `avatar_image_id`），已通过 Zion MCP `schema_table ADD_FIELDS_RELATIONS` 添加并 `sync_backend` 部署。
- 三张原 Google 托管的专家图片已上传到 Zion 图片资产库（PUBLIC_READ），imageId：`1020000000000001` / `1020000000000002` / `1020000000000003`。
- 已插入 6 条 advisor 记录（id 5–10）。2026-08-16 核对线上数据时发现 5/6 重名且 7–10 姓名为空，现已恢复为：刘曜恺、曜恺、郝婉彤、梅朵、白智杰、周流君腾；全部 `status = ACTIVE`、`price_per_hour = 200`、`rating = 4.9`。当前 id 9 尚未绑定 `avatar_image`，其余记录保留现有图片资产。
- 图片静态 URL 是带签名的（篡改日期前缀返回 403），因此不要把 URL 落库到 TEXT 字段；前端必须每次查询 `avatar_image { url }`，由 Zion 返回新鲜的签名 URL。`avatar_url` TEXT 列保留为空作兼容。
- 匿名（未登录）角色可以读取 `advisor` 表和 `avatar_image.url`，真机未登录时首页也能出图。
- 前端：`utils/zion.js` 的 `listAdvisors` / `getAdvisor` 已加查 `avatar_image { id url }`，`normalizeAdvisor` 优先使用 `avatar_image.url`；首页与搜索页默认后端数据，`utils/mock.js` 仅作为后端不可达时的离线兜底。
- 换头像/名字直接在 Zion 数据可视化里改 advisor 行即可，前端会自动同步。
- 微信小程序后台需把 `zion-app.functorz.com`（request）和 `fz-zion-static.functorz.com`（downloadFile）加入合法域名，否则真机不出图。

## Course Table Status 2026-07-08

课程页已改为后端优先，可在 Zion 数据可视化里直接维护课程与课时。

### `course` 表（显示名「课程」）保留字段

- `title` TEXT — 课程标题
- `subtitle` TEXT — 副标题
- `cover_url` TEXT — 封面 URL（兼容兜底）
- `cover_image` IMAGE — 封面图片（推荐，生成 `cover_image_id`）
- `duration_text` TEXT — 时长展示（如「6小时32分」）
- `badge` TEXT — 角标（如「热门」「新课」）
- `sort_order` BIGINT — 排序（越小越靠前）
- `enabled` BOOLEAN — 是否上架（前端只展示 `true`）

### 已删除字段（与前端已移除 UI 同步，2026-07-08）

- `description` / `category` / `tags_json` / `highlights_json`
- `instructor_name` / `instructor_title` / `instructor_avatar_url` / `instructor_avatar`
- `lesson_count` / `student_count` / `rating`
- `price` / `original_price`

### `course_lesson` 表（显示名「课程课时」）保留字段

- `title` TEXT — 课时标题
- `duration_text` TEXT — 时长（如「18:20」）
- `sort_order` BIGINT — 排序
- `video_url` TEXT — 视频 URL（兼容兜底）
- `video` VIDEO — 视频资产（推荐）
- 关系：`course` 1-N `course_lesson`，课程侧 `course_lesson`，课时侧 `course_id`

### 已删除字段

- `is_free`（试看/付费逻辑已移除）

### 运维说明

- 已通过 Zion MCP `DELETE_FIELDS_AND_RELATIONS` + `project sync-backend` 部署。
- 前端：`utils/zion.js` 的 `listCourses` / `getCourse` 只查询上述保留字段；`utils/mock.js` 离线数据已同步精简。
- 上传课程：在「课程」表新增行并设 `enabled = true`；课时在「课程课时」表新增并关联课程。
- 已用 `scripts/seed_courses.py` 将 `utils/mock.js` 中 6 门预览课程写入后端（course id 1–6，共 15 条课时）；匿名可读，课程页默认走后端数据。

## Consultation Chat Status 2026-07-08

聊天消息与订单「问题方面」的 join 链路：

- `consultation_message.session_id` → `consultation_session.order_id` → `consultation_order.problem_category` / `issue_summary`
- 2026-07-08 已清空全量 `consultation_message`（10 条历史消息），并重新 seed 测试会话：
  - order id `17`，`problem_category=恋爱情感`，`issue_summary=我和男朋友最近总是吵架...`
  - session id `13`（active，已绑定 order/service_provider）
  - 5 条测试消息（3 客户 + 2 经理），join 验证脚本 `scripts/verify_consultation_messages.py 13` 全部通过
- 前端修复：
  - `utils/zion.js` 的 `getSessionMessages()` 改为 GraphQL `where: { session_id }` 过滤
  - `listManagerSessions()` 额外查询 `consultation_order`，`normalizeManagerSession()` 从订单取 `problemCategory` / `issueSummary`
  - **咨询会话 ID 绑定**：`customer_service_binding` 与 `consultation_session` 建立 **1:1 关系**（`consultation_session.customer_service_binding_id` 唯一）；支付/续费只更新该会话，不再新建；发消息时只解析已绑定会话
  - **服务计时**：支付成功或客户首条消息**不**启动倒计时；仅经理发出首条回复时写入 `started_at` / `expires_at` 并开始 1 小时倒计时（`startConsultationServiceTimer` / `resolveEffectiveSessionExpiry`）。**续费后一律清空计时字段**，等经理再次回复后重新计时。
- 测试脚本：`scripts/seed_consultation_test.py`（创建订单+会话+示例消息）、`scripts/verify_consultation_messages.py`（验证 join）
- 实机测试：profile 页微信登录 → advisor 支付 → chat 发消息；经理端 profile 进工作台接单 session `13` 后回复

## Customer Service Binding Status 2026-07-08

客户与经理/答主为一次性绑定关系：客户首次成功预约并支付后写入绑定，此后不能预约其他答主；经理被动接单；仅 `user_type` 为 `admin` / `super_admin` 的账户可调用 `transferCustomerServiceBinding` 做移交。

### `customer_service_binding` 表（显示名「客户服务绑定」）

- `binding_status` TEXT — 默认 `ACTIVE`
- `bound_at` TIMESTAMPTZ — 首次绑定时间
- `transfer_note` TEXT — 移交备注
- `last_transferred_at` TIMESTAMPTZ — 最近移交时间
- 关系（Zion 自动生成 FK）：
  - `customer_account_id` → `account`（**唯一约束**：一位客户仅一条绑定）
  - `advisor_id` → `advisor`（答主）
  - `service_provider_id` → `service_provider`（服务人员）
  - **`consultation_session` one_to_one `customer_service_binding`**（2026-07-09）：绑定表与咨询会话表 1:1；`consultation_session.customer_service_binding_id` 有唯一约束，同一位客户的会话 ID 固定不变，续费/再次支付只更新该会话字段
- 答主 ↔ 服务人员：`advisor` 与 `service_provider` 已建立 1:1 关系（`service_provider.advisor_id`）

### 前端行为

- `utils/zion.js`：`getCustomerServiceBinding` / `assertCanBookAdvisor` / `resolveAdvisorServiceProvider` / `ensureCustomerServiceBinding` / `transferCustomerServiceBinding`；`getBoundConsultationSession()` 优先从 `customer_service_binding.consultation_session` 关系读取固定会话
- `utils/payment.js`：支付前校验绑定；首次支付成功后落库绑定并创建/关联唯一会话；续费延长同一会话
- `pages/advisor` / `pages/index` / `pages/search`：已绑定客户访问其他答主时拦截并提示

### 运维

- 已通过 MCP 创建表并 `sync-backend` 部署
- `scripts/seed_customer_service_binding.py`：将 `service_provider.id=1` 关联到 `advisor.id=5`（可按脚本内常量调整）
- `scripts/link_binding_consultation_session.py`：为已有绑定补写 `consultation_session.customer_service_binding_id`，并关闭重复会话
- `scripts/seed_test_customer_provider1.py`：一键 seed **测试客户小安**（account `1000000000000002`）+ `service_provider` id `1`（刘曜恺）+ 绑定/订单/会话/示例消息

## Test Result 2026-07-03

Tested via Zion MCP `supportservice_graphql`:

- `insert_wechat_login_record_one` works with verified fields:
  - `wechat_nickname`
  - `wechat_avatar_url`
  - `login_at`
  - `raw_profile_json`
- The test inserted a mock avatar URL successfully.
- The inserted mock record returned `wechat_openid: null`.
- The mock record was deleted after verification.

Conclusion: current frontend GraphQL can write a login audit record, but it does not perform real WeChat login. Real login still requires a Zion user-event/action-flow/backend step that exchanges `wx.login` code for `openid` and exchanges `getPhoneNumber` code for `fz_phone_number`, then updates `account`.


### 2026-09-09 权限确认后续

用户已明确确认账号仅本人读取/修改、游客与登录用户直接 AI 调用关闭，并授权同步。编辑器已保存账号主表及账户资料的归属过滤，游客账号查询/修改/统计和账户资料访问已关闭；两类角色的 AI 允许列表均为空。用户名查重改用主服务动作 `CHECK_USERNAME`，只返回布尔值，排除账号取自服务端登录身份；70 项本地测试通过。新增课程字段被 Zion 自动赋予了默认角色直接权限，该项额外收紧仍等待自动审批要求的明确确认。以上仍为草稿，正式联调尚未完成。

### 2026-09-10 正式联调状态更新

上述 9 月 9 日草稿状态已被后续授权与正式部署取代：正式版本 `vDAB57E4rEM` 已回读确认，核心流程、名额并发、账号归属权限、直接访问拒绝及文字/录音总结联调通过。详见 `docs/咨询服务交付状态.md` 和 `.codex-work/course-reference/deployed-final-state.json`。117 文件小程序纯源码包经用户授权发送至微信官方预览服务，二维码已成功生成；尚未发布正式小程序，手机设备能力仍待验收。


### 2026-09-11 最新交付状态

正式 schema 已更新并回读为 `B9K5XJZMbDB`，课程/工作人员预约分页已同步。小程序 UI 与课程发布交互修复共 109 项本地测试通过，24 WXML / 28 WXSS 官方编译通过。微信官方开发者工具已上传 `1.0.20260911` 并生成同源码预览二维码，121 文件纯源码 ZIP 已更新；公众平台仍需管理员扫码登录，尚未提交审核或正式上线。用户报告的课程发布失败仍待新版手机复测，当前证据不足以确定唯一根因。详情见 `outputs/wechat-release-2026-09-11/发布说明.md`。


### 2026-09-11 二阶线上共修展示更新

正式版本 `XAgrmdNbOvm` 已回读；新增 `course.description`（TEXT，可空），用于完整课程介绍。新增真实课程 `id=7`：《透过现象·直击本质》二阶线上共修营·03期，展示“付费”，已建档680元、未建档1680元的说明均存于后端介绍。首页只推荐 `badge=付费` 的课程，旧有课程和免费权益保留；这不等同于实现支付或资格校验。用户明确确认清空 `advisor` 5–10 号头像引用及 `course` 1–6 号人物封面，未删除资产原文件、用户个人头像或课程内容。详见 `outputs/course-home-2026-09-11/`。
