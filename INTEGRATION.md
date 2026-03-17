# Integration Guide

This guide shows how to integrate **Playwright LLM Reporter** into your existing Playwright test suite.

## Installation

```bash
npm install --save-dev @playwright/llm-reporter
```

## Quick Start

### 1. Update `playwright.config.ts`

Add the reporter to your Playwright configuration:

```typescript
import type { PlaywrightTestConfig } from '@playwright/test';
import type { LlmReporterOptions } from '@playwright/llm-reporter';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  use: {
    // Artifacts are needed for the reporter to show screenshots/videos/traces
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: [
    ['html'],  // Keep the default HTML reporter if you want
    ['@playwright/llm-reporter', {
      outputDir: 'playwright-llm-report',
      title: 'My Test Report',
      // port: 3000  // Optional: override LLM server port (default 3000)
    }],
  ],
};

export default config;
```

### 2. Run Tests

```bash
npm test
```

Your report will be generated at `playwright-llm-report/index.html`.

### 3. Open the Report

```bash
# On Windows
start playwright-llm-report/index.html

# On macOS
open playwright-llm-report/index.html

# On Linux
xdg-open playwright-llm-report/index.html
```

## Optional: Enable LLM Features

The "Ask LLM" panel in the report requires a separate server process.

### 1. Set OpenAI API Key

```bash
# macOS / Linux
export OPENAI_API_KEY="sk-..."

# Windows PowerShell
$env:OPENAI_API_KEY="sk-..."
```

### 2. Start the LLM Server

In a separate terminal:

```bash
npx @playwright/llm-reporter llm-server
```

Or run it programmatically:

```typescript
import { startLlmServer } from '@playwright/llm-reporter/llm-server';

startLlmServer({ port: 3000 });
```

The server will listen on `http://localhost:3000` by default.

### 3. Run Tests + View Report

```bash
npm test
```

Now the "Ask LLM" button in the report will send test results to the LLM server for analysis.

## Configuration Options

Pass options to the reporter via the configuration array:

```typescript
reporter: [
  ['@playwright/llm-reporter', {
    outputDir: 'my-reports',           // Output directory (default: playwright-llm-report)
    title: 'E2E Test Results',          // Report title (default: Playwright LLM Report)
    port: 3001,                         // LLM server port (default: 3000)
  }],
]
```

## What's Included in the Report

- **Status Chart**: Pie chart showing passed/failed/skipped breakdown
- **Duration Chart**: Bar chart of slowest tests
- **Per-Project Breakdown**: Results by browser project (chromium, webkit, firefox)
- **Filterable Test Table**: Sort by title, status, duration, project
- **Error Details**: Full stack traces on hover
- **Artifacts**: Links to screenshots, videos, and trace files (when available)
- **LLM Analysis**: Optional "Ask LLM" panel for intelligent test summaries

## Artifact Capture

For the reporter to show screenshots, videos, and traces, ensure Playwright is configured to capture them:

```typescript
use: {
  screenshot: 'only-on-failure',  // or 'on' for every test
  video: 'retain-on-failure',     // or 'on' for every test
  trace: 'retain-on-failure',     // or 'on' for every test
},
```

⚠️ **Important**: Artifacts are only captured if:
- The browser is launched (tests skip before browser launch won't have artifacts)
- The test reaches runtime failure (assertion failure, timeout, etc.)

## Troubleshooting

### Report not generated

Verify that:
1. Tests ran to completion
2. `outputDir` directory exists or can be created
3. No file permission errors in your workspace

### Artifacts not showing

Check:
1. Are artifacts being captured? (`screenshot: 'only-on-failure'` etc.)
2. Did tests actually fail or timeout? (Artifacts only on failure)
3. Is the browser being launched? (Some test configs skip browser)

### LLM server connection error

Ensure:
1. LLM server is running in a separate terminal (`npx @playwright/llm-reporter llm-server`)
2. `OPENAI_API_KEY` is set
3. Port 3000 (or your configured port) is not in use

### "LLM not configured"

This is normal if `OPENAI_API_KEY` is not set. The report still works; the "Ask LLM" feature just won't be available. Set the key to enable it:

```bash
$env:OPENAI_API_KEY="sk-..."
```

## Example Project

See the included `tests/example.spec.ts` for a working test suite with both passing and failing tests.

## Advanced Usage

### Custom LLM Analysis

If you want to use a different LLM provider, run your own proxy server at `http://localhost:3000/llm/analyze` that handles the same request format:

```json
{
  "question": "What tests failed?",
  "tests": [
    {
      "title": "login form submits",
      "status": "failed",
      "duration": 1234,
      "file": "tests/auth.spec.ts"
    },
    ...
  ]
}
```

Expected response:

```json
{
  "answer": "Your LLM analysis here..."
}
```

### CI/CD Integration

The report can be committed to your repo or uploaded to a static hosting service:

```yaml
# GitHub Actions example
- name: Run tests
  run: npm test

- name: Upload report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-llm-report/
```

## Support

For issues, questions, or feature requests, see the project repository:
- **Issues**: https://github.com/yourusername/playwright-llm-reporter/issues
- **Discussions**: https://github.com/yourusername/playwright-llm-reporter/discussions

