# Project Rules

## Zion platform plugin (Cursor)

This project uses the official [zion-nocode-plugin](https://github.com/functorz-tech/zion-nocode-plugin):

- **Cursor local plugin**: `~/.cursor/plugins/local/zion-nocode` (symlink to cloned repo `plugin/`)
- **Project skill**: `.cursor/skills/zion-platform` → `zion-platform` orientation skill
- **MCP server**: `.cursor/mcp.json` → `zion` via `npx -y zion-mcp@2.0.21 mcp`

Before Zion schema / actionflow / binding work, read the `zion-platform` skill. First-time MCP use may require `npx -y zion-mcp@latest login`.

## Zion backend workflow

Before changing any code that talks to Zion, read `docs/zion-rules.md`.

Key rule: do not invent Zion table names, fields, action flows, filters, or auth behavior. Verify the live project schema first, then write code against the verified API.

## 网页修改完成后自动发布（新会话默认执行）

- GitHub 协作仓库：`https://github.com/yaokailiu9-cloud/zhishou-course-web`，发布分支：`main`。
- `main` 是正式网站唯一发布源。正式网站的发布服务会克隆并镜像这个协作仓库；**代码上传到 `main` 后立即进入自动构建与发布流程，不需要用户再次要求“同步”“上线”或“发布”。**
- 只要用户要求修改网页、修复功能或更新线上内容，就视为已同时授权本次任务在验证通过后直接发布。代理必须在同一任务中完成“修改 → 必要构建/测试 → 读取远程最新版本并保留并发改动 → 提交并推送 `main` → 核验正式网址”，不得停在本地改动、测试通过或本地提交后询问用户是否需要上传。
- 本规则是仓库级持久规则。任何以后在本项目中开启的新会话都必须自动执行，用户无需重复说明发布流程。
- 每次推送后，若现有协作仓库／镜像仓库提供手动同步或发布工作流，必须直接触发一次（同一版本已有运行中的任务则复用），跟进结果并验证正式域名，不必再次询问用户。只能使用已核实的既有发布链路；没有入口或缺少权限时明确报告，不得把仓库上传成功当成正式发布成功。
- 发布是否可用以协作仓库 `main` 的远程提交和正式网址为准，与当前登录的 Zeabur 账号无关；不要因为当前 Zeabur 账号看不到服务就改投其他项目或覆盖其他站点。
- 完成必要验证后直接把当前任务的对应改动上传至该仓库；无需另行要求用户提供 Zeabur 项目链接、令牌、确认上传或手动部署。
- 涉及网页源代码时，按改动需要执行 `npm run build:web`、相关测试及 `npm run build`，同步提交网页构建产物。纯文档规则变更不必重复运行应用测试。
- 上传前读取远程最新版本，保留线上配置和其他任务的并发修改；只提交当前任务相关文件，禁止覆盖其他任务未提交的工作，禁止上传密钥或 `.env`。
- 默认不通过 Vercel、Sites 或 Zeabur CLI 单独发布，也不更改托管平台、域名或环境变量。用户明确要求时除外。
- 上传后核对远程提交，并检查 `https://www.apply.tianqiwushu.cn/web/`。如自动部署尚未完成，明确区分“仓库已更新”和“正式网址已生效”；Vercel 部署成功不能代表这个正式域名已更新。不要仅因短暂未生效就重复提交或切换发布渠道。
