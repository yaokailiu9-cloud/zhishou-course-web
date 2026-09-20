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

## 网页发布流程（用户于 2026-09-20 确认，后续持续遵守）

- 正式仓库：`https://github.com/yaokailiu9-cloud/zhishou-course-web`，发布分支：`main`。
- **更新仓库的 `main` 分支后，Zeabur 会自动更新并发布网页。** 这是本项目的默认发布流程。
- 用户要求网页修复、修改并使其生效时，完成必要验证后，把对应改动上传至该仓库；不要只停留在本地修改。无需另行要求用户提供 Zeabur 项目链接、令牌或手动部署。
- 涉及网页源代码时，按改动需要执行 `npm run build:web`、相关测试及 `npm run build`，同步提交网页构建产物。纯文档规则变更不必重复运行应用测试。
- 上传前读取远程最新版本，保留线上配置和其他任务的并发修改；只提交当前任务相关文件，禁止覆盖其他任务未提交的工作，禁止上传密钥或 `.env`。
- 默认不通过 Vercel、Sites 或 Zeabur CLI 单独发布，也不更改托管平台、域名或环境变量。用户明确要求时除外。
- 上传后核对远程提交，并检查 `https://www.apply.tianqiwushu.cn/web/`。如自动部署尚未完成，明确区分“仓库已更新”和“正式网址已生效”；Vercel 部署成功不能代表这个正式域名已更新。不要仅因短暂未生效就重复提交或切换发布渠道。
