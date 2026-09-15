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
