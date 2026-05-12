#!/usr/bin/env node

const apiBaseUrl = (process.env.NEKOMIN_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
const apiToken = process.env.NEKOMIN_API_TOKEN ?? "";

const serverInfo = {
  name: "nekomin-app-agent",
  version: "0.1.0",
};

const tools = [
  {
    name: "app_agent_list_tools",
    description: "List backend AppAgent tools available for safe app data query/update.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
  },
  {
    name: "app_agent_execute_command",
    description: "Execute a backend AppAgent tool. Use dryRun=true before write tools, then confirm with dryRun=false.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["tool"],
      properties: {
        tool: { type: "string" },
        parameters: {
          type: "object",
          additionalProperties: true,
        },
        dryRun: { type: "boolean", default: false },
      },
    },
  },
  {
    name: "app_api_request",
    description: "Call a Nekomin backend API path. Path must start with /api/. For write methods, use dryRun=true first.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["method", "path"],
      properties: {
        method: {
          type: "string",
          enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        },
        path: {
          type: "string",
          description: "API path beginning with /api/, optionally including query string.",
        },
        body: {
          type: "object",
          additionalProperties: true,
        },
        dryRun: { type: "boolean", default: false },
      },
    },
  },
];

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => {
  buffer += chunk;
  let newlineIndex;
  while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    if (line.length > 0) {
      void handleLine(line);
    }
  }
});

async function handleLine(line) {
  let message;
  try {
    message = JSON.parse(line);
  } catch (error) {
    writeError(null, -32700, "Parse error", error instanceof Error ? error.message : String(error));
    return;
  }

  if (!message || typeof message !== "object" || !("method" in message)) {
    return;
  }

  try {
    switch (message.method) {
      case "initialize":
        writeResult(message.id, {
          protocolVersion: message.params?.protocolVersion ?? "2024-11-05",
          capabilities: {
            tools: {},
          },
          serverInfo,
        });
        break;
      case "notifications/initialized":
        break;
      case "ping":
        writeResult(message.id, {});
        break;
      case "tools/list":
        writeResult(message.id, { tools });
        break;
      case "tools/call":
        writeResult(message.id, await callTool(message.params));
        break;
      default:
        if ("id" in message) {
          writeError(message.id, -32601, `Method not found: ${message.method}`);
        }
        break;
    }
  } catch (error) {
    writeError(
      message.id ?? null,
      -32000,
      error instanceof Error ? error.message : "Tool call failed.",
      error instanceof Error ? error.stack : String(error),
    );
  }
}

async function callTool(params) {
  const name = params?.name;
  const args = params?.arguments ?? {};

  switch (name) {
    case "app_agent_list_tools":
      return jsonContent(await apiRequest("GET", "/api/AppAgent/tools"));
    case "app_agent_execute_command":
      return jsonContent(await apiRequest("POST", "/api/AppAgent/commands", {
        tool: requireString(args.tool, "tool"),
        parameters: args.parameters ?? {},
        dryRun: Boolean(args.dryRun),
      }));
    case "app_api_request":
      return jsonContent(await callApiRequest(args));
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function callApiRequest(args) {
  const method = requireString(args.method, "method").toUpperCase();
  const path = normalizeApiPath(requireString(args.path, "path"));
  const isWrite = method !== "GET";

  if (isWrite && args.dryRun !== false) {
    return {
      dryRun: true,
      method,
      path,
      body: args.body ?? null,
      message: "Dry-run only. Call again with dryRun=false to execute this write request.",
    };
  }

  return await apiRequest(method, path, args.body);
}

async function apiRequest(method, path, body) {
  const url = `${apiBaseUrl}${normalizeApiPath(path)}`;
  const headers = {
    Accept: "application/json",
  };
  if (apiToken) {
    headers.Authorization = `Bearer ${apiToken}`;
  }
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await readPayload(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      statusText: response.statusText,
      payload,
    };
  }

  return {
    ok: true,
    status: response.status,
    payload,
  };
}

async function readPayload(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

function normalizeApiPath(path) {
  const normalized = path.trim();
  if (!normalized.startsWith("/api/")) {
    throw new Error("Only /api/ paths are allowed.");
  }
  if (normalized.includes("://")) {
    throw new Error("Absolute URLs are not allowed.");
  }
  return normalized;
}

function requireString(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required.`);
  }
  return value.trim();
}

function jsonContent(value) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

function writeResult(id, result) {
  writeMessage({
    jsonrpc: "2.0",
    id,
    result,
  });
}

function writeError(id, code, message, data) {
  writeMessage({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      data,
    },
  });
}

function writeMessage(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}
