#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tools } from "./tools/index.js";

const server = new McpServer({ name: "rankorg-free-tools", version: "0.1.0" });

for (const t of tools) {
  server.registerTool(
    t.name,
    { title: t.title, description: t.description, inputSchema: t.schema, annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false } },
    async (args: any) => {
      try {
        const out = (t.handler as (a: unknown) => unknown)(args);
        return { content: [{ type: "text" as const, text: JSON.stringify(out, null, 2) }] };
      } catch (e) {
        return { isError: true, content: [{ type: "text" as const, text: (e as Error).message }] };
      }
    },
  );
}

await server.connect(new StdioServerTransport());
