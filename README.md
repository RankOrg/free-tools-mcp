# RankOrg Free Tools MCP

Free, offline SEO & marketing tools for any MCP client (Claude, Cursor, ChatGPT dev mode, ...). No account, no API key, no network calls: everything runs locally.

## Install

Claude Desktop / Cursor config:

```json
{
  "mcpServers": {
    "rankorg-free-tools": { "command": "npx", "args": ["-y", "rankorg-free-tools-mcp"] }
  }
}
```

Claude Code: `claude mcp add rankorg-free-tools -- npx -y rankorg-free-tools-mcp`

## Tools (13)

| Group | Tools |
|---|---|
| Calculators | `cpc_calculator`, `cpm_calculator`, `ctr_calculator`, `seo_roi_calculator` |
| Text analysis | `word_counter`, `keyword_density`, `heading_structure_analyzer` |
| Generators | `meta_tag_generator`, `open_graph_generator`, `hreflang_generator`, `schema_markup_generator`, `xml_sitemap_generator`, `robots_txt_generator` |

## Develop

```sh
npm i && npm test && npm run build
npm run inspect   # open MCP Inspector
```

Add a tool: write a pure function in `src/core/`, then add one `tool({...})` entry in `src/tools/index.ts`.

Want hosted rank tracking and automated SEO content? See [RankOrg](https://rankorg.com).
