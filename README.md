# Playwright LLM HTML Reporter

[![npm version](https://img.shields.io/npm/v/@gcombrinck/playwright-llm-reporter)](https://www.npmjs.com/package/@gcombrinck/playwright-llm-reporter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A custom Playwright reporter that generates **single-file interactive HTML reports** with optional LLM-powered analysis.

**Features:**
- 📊 Interactive graphs (status breakdown, duration distribution, per-project metrics)
- 🔍 Filterable/sortable test table with project, status, and duration filters
- 🚨 Human-readable error previews + full stack traces on hover
- 📎 Automatic artifact links (screenshots, videos, traces)
- 🤖 Optional "Ask LLM" panel powered by OpenAI or custom LLM service

## Quick Start

### 1. Install

```bash
npm install --save-dev @gcombrinck/playwright-llm-reporter
```

### 2. Add to `playwright.config.ts`

```typescript
import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: [
    ['@gcombrinck/playwright-llm-reporter', {
      outputDir: 'playwright-llm-report',
      title: 'Test Results'
    }],
  ],
};

export default config;
```

### 3. Run Tests

```bash
npm test
```

**Open `playwright-llm-report/index.html` in your browser!**

## Prerequisites

- Node.js 18+ 
- Playwright 1.40+

## Documentation

- **[INTEGRATION.md](./INTEGRATION.md)** – How to integrate into your existing Playwright project
- **[PUBLISHING.md](./PUBLISHING.md)** – How to publish and maintain the npm package
- **[AGENTS.md](./AGENTS.md)** – Developer guide and architecture overview

## Features

### 📊 Visual Analytics
- **Status Chart**: Pie chart showing passed/failed/skipped breakdown
- **Duration Chart**: Bar chart of slowest tests
- **Project Breakdown**: Per-project (chromium, webkit, firefox) metrics
- **Responsive Design**: Dark theme with glassmorphic UI

### 🧪 Test Details
- **Filterable Table**: Sort/filter by title, status, duration, or project
- **Error Display**: Error messages with full stack traces on hover
- **Test Metadata**: Duration, file path, browser project
- **Quick Search**: Find tests by title or status

### 📎 Artifact Management
- **Automatic Capture**: Screenshots, videos, traces on failure
- **Direct Links**: All artifacts accessible from the report
- **Safe Storage**: Artifacts moved to `artifacts/` folder with sanitized names
- **File Protocol Compatible**: Works with `file://` URLs (no server needed)

### 🤖 LLM Integration (Optional)
- **Ask LLM Panel**: Send test results to OpenAI for analysis
- **Smart Insights**: Get suggestions on failing tests and performance
- **Custom LLM Support**: Works with any LLM service at `/llm/analyze` endpoint
- **Graceful Fallback**: Report works perfectly without LLM configured

## Configuration

### Reporter Options

```typescript
reporter: [
  ['@gcombrinck/playwright-llm-reporter', {
    outputDir: 'my-report',          // Where to save the report (default: "playwright-llm-report")
    title: 'My Test Suite',          // Report title (default: "Playwright LLM Report")
    llmPort: 4000,                   // Optional: LLM server port (default: 3000)
    // Or provide a full endpoint instead of a port:
    // llmEndpoint: 'http://my-llm-host.internal:4000/llm/analyze',
  }],
]
```

#### How `llmPort` and `llmEndpoint` are used

- If you set **`llmEndpoint`**, the report will call that URL directly for the "Ask LLM" feature.
- If you omit `llmEndpoint` but set **`llmPort`**, the report will call:
  - `http://localhost:<llmPort>/llm/analyze` (for example `http://localhost:4000/llm/analyze`).
- If you set neither, the default endpoint is:
  - `http://localhost:3000/llm/analyze`.

This must match where your LLM server is actually listening. For example:

```bash
# Windows PowerShell
$env:PORT = "4000"
npm run llm-server

# In playwright.config.ts
reporter: [
  ['@gcombrinck/playwright-llm-reporter', {
    llmPort: 4000,
  }],
]
```

### Artifact Configuration

Control what gets captured:

```typescript
use: {
  screenshot: 'only-on-failure',  // 'off' | 'on' | 'only-on-failure'
  video: 'retain-on-failure',     // 'off' | 'on' | 'retain-on-failure'
  trace: 'retain-on-failure',     // 'off' | 'on' | 'retain-on-failure'
},
```

## Optional: LLM Features

### 1. Set OpenAI API Key

```bash
# macOS / Linux
export OPENAI_API_KEY="sk-..."

# Windows PowerShell
$env:OPENAI_API_KEY="sk-..."
```

### 2. Start LLM Server

In a separate terminal:

```bash
npx @gcombrinck/playwright-llm-reporter llm-server
```

The server listens on `http://localhost:3000` by default.

### 3. Use "Ask LLM" in Report

Run tests and open the report. The "Ask LLM" panel will now be active:

```bash
npm test
start playwright-llm-report/index.html
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Report not generated** | Check `outputDir` exists and has write permissions; verify tests ran |
| **Artifacts not showing** | Ensure `screenshot`/`video`/`trace` are enabled in config; tests must fail to capture |
| **LLM button not working** | Verify `OPENAI_API_KEY` is set and LLM server is running on port 3000 |
| **"LLM not configured" message** | Set `OPENAI_API_KEY` environment variable; report works without it |
| **Corporate CA certificate errors** | Use `NODE_EXTRA_CA_CERTS` environment variable (see INTEGRATION.md) |
| **Port already in use** | Change port: `PORT=3001 npx @gcombrinck/playwright-llm-reporter llm-server` |

## For Existing Projects

**Integrating into an existing Playwright test suite?** See [INTEGRATION.md](./INTEGRATION.md) for step-by-step instructions.

## Contributing

Want to improve this reporter? See [AGENTS.md](./AGENTS.md) for:
- Project architecture and data flows
- Critical developer workflows
- Extension patterns and conventions

## Publishing & Maintenance

To publish updates to npm or maintain this package, update the version in `package.json`, run `npm run build`, and then `npm publish --access public` (after `npm login`).

## License

MIT – See [LICENSE](./LICENSE) for details.

## Support

- 📖 **Documentation**: [INTEGRATION.md](./INTEGRATION.md) | [AGENTS.md](./AGENTS.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/playwright-llm-reporter/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/playwright-llm-reporter/discussions)
- 🤝 **Contributing**: Contributions welcome!

