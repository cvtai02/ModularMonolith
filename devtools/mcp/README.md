# Nekomin App Agent MCP Server

This MCP server lets Codex, Claude, or another MCP client query/update app data through the backend API.

It does not connect to the database directly.

## Tools

- `app_agent_list_tools`
- `app_agent_execute_command`
- `app_api_request`

## Environment

- `NEKOMIN_API_BASE_URL`: backend base URL, defaults to `http://localhost:5000`
- `NEKOMIN_API_TOKEN`: access token for authenticated/admin API calls

## Claude Code Config

Add this to `.mcp.json` or your Claude MCP config:

```json
{
  "mcpServers": {
    "nekomin-app-agent": {
      "command": "node",
      "args": ["devtools/mcp/app-agent-server.mjs"],
      "env": {
        "NEKOMIN_API_BASE_URL": "http://localhost:5000"
      }
    }
  }
}
```

Set `NEKOMIN_API_TOKEN` in your shell/session before starting Claude if the API requires auth.

## Example Tool Call

```json
{
  "tool": "orders.list",
  "parameters": {
    "pageNumber": 1,
    "pageSize": 20
  }
}
```

For write tools, call with `dryRun: true` first, then call again with `dryRun: false` after confirmation.
