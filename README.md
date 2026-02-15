# 🔍 AgentLint

<!-- TODO: badges -->
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Audit web pages for AI-agent readability and semantic quality.**

AgentLint analyzes HTML pages and scores how well they can be understood by AI agents, screen readers, and automated tools.

## Vision

The web is increasingly consumed by agents (LLMs, crawlers, assistants). AgentLint helps developers ensure their pages are **agent-friendly** — semantic, structured, and accessible.

## Packages

| Package | Description |
|---------|-------------|
| `@agentlint/core` | Core audit engine |
| `agentlint` (CLI) | Command-line interface |
| Chrome Extension | Phase 3 |

## Quick Start

```bash
pnpm install
pnpm build
npx agentlint audit https://example.com
```

## Roadmap

- [x] Phase 1: Project scaffold & semantic-html rule
- [ ] Phase 2: Core rules (aria, heading-hierarchy, landmark, link-text)
- [ ] Phase 3: Chrome extension
- [ ] Phase 4: CI integration & GitHub Action
- [ ] Phase 5: Agent-specific rules (structured data, tool-use hints)
