# Zion 后端数据库与调用约定

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


更新时间：2026-08-16  
项目：`JmAxbl1MMe4`

完整、可供产品与开发共同阅读的实时结构说明见：[`../数据库结构与关联关系说明.md`](../数据库结构与关联关系说明.md)。该文档由 Zion 官方插件读取实时 schema 后生成，是本项目的数据库结构主文档。

## 当前真实业务表

- 身份：`account`、`account_profile`、`wechat_login_record`
- 咨询：`advisor`、`service_provider`、`customer_service_binding`、`consultation_order`、`consultation_session`、`consultation_message`
- 内容：`course`、`course_lesson`、`advisor_favorite`、`recommendation`
- 配置：`ud_banbenshenhe_ebcabf`

旧文档中的 `users`、`advisors`、`consultation_orders`、`conversations`、`messages` 是早期概念模型，不是当前 Zion GraphQL 表名，禁止继续用于新代码。

## GraphQL 端点

- HTTP：`https://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-v2`
- Subscription：`wss://zion-app.functorz.com/zero/JmAxbl1MMe4/api/graphql-subscription`

客户端只能携带 Zion 登录返回的用户 JWT。管理员 Bearer Token 仅用于本地/服务端诊断，禁止进入小程序代码、WXML、日志或仓库。

## 身份与登录

1. 微信身份登录调用 `loginWithWechatMiniApp`，登录请求不携带旧用户 JWT。
2. 登录成功后保存新的 JWT，再读取 `account` / `account_profile`。
3. 真实用户身份以 `account.id` 和 JWT 为准；`wechat_login_record` 只是审计记录。
4. `account_profile` 保存可编辑资料；Zion 验证手机号存放在 `account.fz_phone_number`。
5. 头像优先读取 Zion IMAGE 字段产生的实时 `url`，不要把临时签名 URL 当永久数据。

## 咨询链路

```text
account
  -> customer_service_binding
      -> advisor
      -> service_provider
      -> consultation_session（1:1，固定会话）
          -> consultation_message（当前为 session_id 业务推断）

consultation_order
  -> consultation_session.order_id（当前为业务推断）
```

- 客户首次预约后建立 `customer_service_binding`。
- 同一客户后续续费复用绑定对应的唯一 `consultation_session`。
- 经理首次回复才启动服务计时；续费后清空计时字段。
- 客户消息查询必须过滤 `visible_to_customer=true`。
- 消息撤回通过审计字段实现，不物理删除消息。

## 服务人员权限

前端隐藏入口不是权限控制。真实权限必须由 Zion Permission Management 配置，并至少校验：

- `service_provider.service_status == ACTIVE`
- 回复：`can_reply == true`
- 接单：`can_accept_order == true`
- 会话/订单必须属于当前 `service_provider`

当前有效服务人员绑定：

```text
service_provider.id = 1
account.id = 1000000000000010
advisor.id = 5
display_name = 刘曜恺
```

## 当前答主数据

| ID | 姓名 |
| --- | --- |
| 5 | 刘曜恺 |
| 6 | 曜恺 |
| 7 | 郝婉彤 |
| 8 | 梅朵 |
| 9 | 白智杰 |
| 10 | 周流君腾 |

## 前端查询规则

- 所有数据库 ID 必须先验证为正整数，再用于 `bigint` 变量。
- 本地 mock ID（如 `adv-001`、`course-001`）只能走离线数据，不允许转为 `Number(...)` 后请求后端。
- 错误日志必须带 GraphQL operation name，不记录 JWT、验证码或敏感变量。
- `utils/mock.js` 只作离线兜底，不能作为线上数据库真实状态。
- 实时 schema 中没有 `app_runtime_config`；普通构建直接进入主应用。

## 变更流程

1. 使用 Zion 官方插件 `schema load`。
2. 读取表、字段、关系和约束，不猜名称。
3. 修改 schema 后执行 `schema validate`。
4. 使用 `project sync-backend` 部署。
5. 同步更新根目录数据库关系文档。

