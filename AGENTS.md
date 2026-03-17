# AGENTS.md

AI coding agent guide for **Playwright LLM HTML Reporter** — a custom Playwright test reporter that generates interactive HTML reports with optional LLM integration.

## Project Architecture

### Overview
This is a **Playwright test reporter** (not a test framework itself):
- **Custom Reporter** (`reporters/llm-html-reporter.ts`): Implements Playwright's Reporter interface to intercept test results and build a single-file HTML report with embedded data
- **LLM Server** (`llm-server.ts`): Optional Express.js HTTP endpoint that sends test results + user questions to OpenAI's API via the `openai` npm package
- **Test Suite** (`tests/example.spec.ts`): Example Playwright tests showing failures, screenshots, and skipped tests
- **Configuration** (`playwright.config.ts`): Sets reporters, captures screenshots/videos/traces on failure, runs projects (chromium, webkit)

### Data Flow
1. User runs `npm test` → Playwright executes tests in `testDir: './tests'`
2. **Reporter hooks:**
   - `onBegin()` → creates output directory
   - `onTestEnd()` → serializes each test result (title, status, duration, error, attachments)
   - `onEnd()` → copies artifact files (screenshots/videos/traces) to `artifacts/` folder, generates `index.html`
3. Generated report at `playwright-llm-report/index.html` can be opened in a browser
4. (Optional) User clicks "Ask LLM" in the HTML report → JavaScript fetch to `POST /llm/analyze` → server summarizes test data and prompts OpenAI
5. LLM response streamed back to HTML UI

### Key Files
- `reporters/llm-html-reporter.ts` (1340 lines): Core reporter; builds embedded HTML/CSS/JS, manages artifact copying
- `llm-server.ts` (71 lines): Express app for LLM integration; returns error if `OPENAI_API_KEY` not set
- `playwright.config.ts`: Reporter registration, artifact capture settings, browser projects
- `package.json`: Scripts (`test`, `test:ui`, `llm-server`, `build`), dependencies include `chart.js`, `express`, `openai`

## Critical Workflows & Commands

### Running Tests
```powershell
npm test                    # Runs all tests; generates report at playwright-llm-report/index.html
npm run test:ui            # Runs tests in UI mode (interactive debugging)
```

### LLM Server
```powershell
$env:OPENAI_API_KEY="sk-..."  # Set API key for current session
npm run llm-server              # Starts Express on port 3000 (or $env:PORT)
                                # Requires running in parallel to `npm test` for "Ask LLM" feature
```

### Building TypeScript
```powershell
npm run build               # Compiles to dist/
```

## Project-Specific Patterns

### Reporter Result Serialization
- Each test result is captured in `SerializedTestResult` type (see line 18):
  - `title`: Test name
  - `fullTitle`: Full test path (e.g., "test › homepage has title and links to intro page")
  - `status`: 'passed' | 'failed' | 'skipped' | 'flaky'
  - `duration`: milliseconds
  - `errorMessage` / `errorStack`: Captured from `result.error` object
  - `errorPreview`: First line of error, max 220 chars (for UI display)
  - `attachments`: Array of screenshots, videos, traces (with `name`, `contentType`, `path`)
  - `projectName`: Browser project ('chromium', 'webkit', etc.)

### Artifact Management (line 82–107)
- **Copying**: Playwright test results dir stores artifacts; reporter copies them to `artifacts/` folder with sanitized names
- **Naming**: `{seq}-{sanitized-project-name}-{test-title}-{attachment-name}.{ext}`
- **Sanitization** (line 37): Replaces unsafe filename chars with `_`, max 160 chars
- **Why**: Makes artifacts accessible via `file://` protocol in browser (relative paths break with absolute paths)

### HTML Generation (line 114+)
- Single-file output: All CSS, JS, data embedded inline (no separate assets)
- Data escaping: Results JSON has `<` replaced with `\u003c` to prevent HTML injection
- Dark theme with gradients and glassmorphism design (CSS custom properties at line 121)
- Chart.js integration for status/duration charts

### Error Handling in LLM Server
- `OPENAI_API_KEY` optional: If missing, returns friendly response instead of error
- Truncates test array to first 80 tests before sending to OpenAI (line 36) — reduces token usage
- Maps only relevant fields (title, status, durationMs, file) for API call
- Model hardcoded to `gpt-4o-mini` (line 52)

## Integration Points & External Dependencies

### Playwright Integration
- Implements Playwright's `Reporter` interface (types from `@playwright/test`)
- Lifecycle methods: `onBegin()`, `onTestEnd()`, `onEnd()`
- Accesses attachment paths from `result.attachments` — only works if browser launched

### Express & CORS
- `llm-server.ts` uses Express 4.19+ with CORS enabled (allows HTML report to call server)
- Single endpoint: `POST /llm/analyze` expects JSON body `{ question, tests }`

### OpenAI API
- Uses `openai` npm package v4.58.0+
- Requires `OPENAI_API_KEY` env var
- Creates chat completion with user question + test summary as prompt

## Conventions & Developer Notes

### TypeScript Compilation
- `tsconfig.json`: Strict mode enabled, ESNext target, CommonJS module
- Both reporter and server are `.ts` files; runner uses `ts-node` or `tsc`

### Port Configuration
- LLM server defaults to port 3000, overridable via `PORT` env var
- HTML report references `http://localhost:${port}` in fetch calls

### Browser Projects
- Default config has chromium + webkit (not Firefox)
- Artifacts captured only on failure (except video: "retain-on-failure")
- Trace/video/screenshot links in HTML only appear if artifacts exist

### Corporate Network Setup
- See README for Node.js CA certificate handling (`NODE_EXTRA_CA_CERTS`, `npm config set cafile`)
- Common in enterprise environments where MITM TLS proxies intercept traffic

## Common Modification Patterns

When extending this codebase:

1. **Adding test metadata**: Modify `SerializedTestResult` type and `onTestEnd()` method (line 73)
2. **Changing artifact naming**: Update `sanitizeFileName()` (line 37) and naming logic (line 100)
3. **Updating HTML/styling**: Modify `buildHtml()` method (line 114+); note CSS-in-JS embedded inline
4. **Adding LLM features**: POST handler in `llm-server.ts` (line 16); ensure `/llm/analyze` CORS is configured
5. **Browser projects**: Edit `playwright.config.ts` `projects` array; reporter picks up `project().name`

## Troubleshooting Patterns

- **"Artifacts not found"**: Ensure browser launched (see Playwright docs on `skip` vs `fail`). Artifacts require a running browser.
- **"LLM not configured"**: Check `OPENAI_API_KEY` env var is set before running server.
- **"Port already in use"**: Set `PORT` env var to different port or kill process on 3000.
- **SELF_SIGNED_CERT**: See README; use `NODE_EXTRA_CA_CERTS` for corporate proxies, not `NODE_TLS_REJECT_UNAUTHORIZED`.

