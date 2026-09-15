# Zion Cursor Plugin Setup

Official plugin: [functorz-tech/zion-nocode-plugin](https://github.com/functorz-tech/zion-nocode-plugin)

## Installed locally

| Item | Path |
| --- | --- |
| Plugin clone | `/Users/nidie/Desktop/zion-nocode-plugin` |
| Cursor plugin symlink | `~/.cursor/plugins/local/zion-nocode` |
| Project skill | `.cursor/skills/zion-platform` |
| MCP config | `.cursor/mcp.json` |

## Enable in Cursor

1. Open **Cursor Settings → Plugins** (or MCP settings).
2. Enable plugin **zion-nocode** if it appears under local plugins.
3. Open **Cursor Settings → MCP** and confirm server **zion** is enabled for this project.
4. Reload the window if tools do not show up immediately.

## First-time login

```bash
npx -y zion-mcp@latest login
```

Then set the current project in Zion MCP:

- Project exId for this app: `JmAxbl1MMe4`

## Update plugin

```bash
cd /Users/nidie/Desktop/zion-nocode-plugin
git pull
```

Symlinks pick up updates automatically.
