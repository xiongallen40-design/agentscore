# 🤖 AgentScore

**Is your website ready for AI agents?** AgentScore audits web pages for agent-readability — semantic HTML, ARIA coverage, selector stability, WebMCP support, and structured data.

> Think Lighthouse, but for AI agents instead of humans.

## Quick Start

```bash
npx agentscore audit https://example.com
```

## Example Output

```
  🔍 Auditing https://example.com...

  🟡 Agent-Readiness Score: 62/100

  ─────────────────────────────────────────────

  Semantic HTML            ████████████████░░░░ 80 (25%)
  ARIA Coverage            ██████████████████░░ 90 (25%)
  Selector Stability       ██████████░░░░░░░░░░ 50 (15%)
  WebMCP / Structured Data ███░░░░░░░░░░░░░░░░░ 15 (20%)
  Meta Information         ████████████████░░░░ 80 (15%)

  ─────────────────────────────────────────────

  💡 Top Improvements:

  1. Add JSON-LD structured data with schema.org vocabulary
  2. Consider implementing navigator.modelContext (WebMCP)
  3. Add data-testid attributes to key interactive elements
```

## What It Checks

| Dimension | Weight | What |
|-----------|--------|------|
| **Semantic HTML** | 25% | Semantic tags, heading hierarchy, form labels |
| **ARIA Coverage** | 25% | Accessible names, alt text, role attributes |
| **Selector Stability** | 15% | Test IDs, CSS-in-JS hash detection |
| **WebMCP / Structured Data** | 20% | `navigator.modelContext`, MCP meta, JSON-LD, schema.org |
| **Meta Information** | 15% | Title, description, Open Graph, canonical, lang |

## CLI Options

```bash
agentscore audit <url>          # Standard audit
agentscore audit <url> --json   # JSON output (for CI/CD)
```

## Why AgentScore?

AI agents (Claude, GPT, Copilot) increasingly browse and interact with web pages. Pages built with semantic HTML, proper ARIA, stable selectors, and structured data are **dramatically easier** for agents to understand and act on.

AgentScore gives you a score and actionable improvements — so your site works great for both humans *and* machines.

## Roadmap

- 🏷️ **AgentScore Badge** — Embed your score on your site
- 🧩 **Chrome Extension** — Real-time audit in DevTools
- 🔄 **CI/CD Integration** — GitHub Action to audit on every deploy
- 📊 **Historical Tracking** — Score trends over time
- 🌐 **WebMCP Deep Analysis** — Full MCP endpoint validation

## Contributing

Contributions welcome! This project is in early stages — issues, PRs, and ideas are all appreciated.

```bash
git clone https://github.com/xiongallen40-design/agentscore
cd agentscore
pnpm install
pnpm build
```

## License

MIT
