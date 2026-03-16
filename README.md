# Playwright LLM HTML Reporter

Custom Playwright reporter that generates a **single-file HTML report** (with embedded results data) including:

- Interactive graphs (status, durations, per-project breakdown)
- A filterable/sortable **All tests** table (project/status/duration filters)
- Human-readable error previews + full stack on hover
- Links to artifacts (screenshots, videos, traces) **when available**
- Optional “Ask LLM” panel (works only if you run the included LLM server)

## Prerequisites

- Node.js 18+ recommended
- Windows PowerShell (examples below)

## Install

```powershell
cd C:\playwright
npm install
```

### Install Playwright browsers

Playwright needs browsers installed:

```powershell
npx playwright install
```

#### If you get `SELF_SIGNED_CERT_IN_CHAIN` (corporate proxy / MITM)

This means Node does not trust your corporate TLS CA. Fix by trusting the CA (recommended):

1. Obtain your corporate root CA certificate as a `.pem` (or `.crt`) file, e.g. `C:\certs\corp-ca.pem`.
2. Point Node to it for this session:

```powershell
$env:NODE_EXTRA_CA_CERTS="C:\certs\corp-ca.pem"
npx playwright install
```

Or configure npm to always use the CA bundle:

```powershell
npm config set cafile "C:\certs\corp-ca.pem"
npx playwright install
```

If your environment requires an explicit proxy, configure it too:

```powershell
npm config set proxy "http://your-proxy:port"
npm config set https-proxy "http://your-proxy:port"
```

> Avoid `NODE_TLS_REJECT_UNAUTHORIZED=0` unless you *fully* understand the security implications.

## Run tests (generates the HTML report)

```powershell
npm test
```

Report output:

- `playwright-llm-report/index.html`
- `playwright-llm-report/artifacts/` (copied attachments like screenshots/videos/traces, when generated)

Open `playwright-llm-report/index.html` in your browser (double-click is fine; it works via `file://`).

## Artifacts (screenshots / videos / traces)

Artifacts are controlled by `playwright.config.ts`:

- `screenshot: 'only-on-failure'`
- `video: 'retain-on-failure'`
- `trace: 'retain-on-failure'`

If tests fail *before* a browser launches (for example, browsers aren’t installed), Playwright cannot capture screenshots/videos/traces.

## Optional: run the LLM server

The report has an “Ask LLM” panel that sends results + your question to an HTTP endpoint.

### 1) Set an API key (optional)

If `OPENAI_API_KEY` is not set, the server returns a friendly “LLM not configured” response and the rest of the report still works.

```powershell
# For current terminal session:
$env:OPENAI_API_KEY="YOUR_KEY"
```

### 2) Start the server

```powershell
npm run llm-server
```

Default endpoint:

- `POST http://localhost:3000/llm/analyze`

The generated report points to this by default.

## Project structure

- `playwright.config.ts` – Playwright config (projects + artifact settings)
- `reporters/llm-html-reporter.ts` – custom reporter that writes the HTML report
- `llm-server.ts` – Express server for optional LLM interaction
- `tests/` – sample tests

## Notes / troubleshooting

- If graphs don’t show, ensure you opened `playwright-llm-report/index.html` generated from the latest run.
- If artifact links don’t appear, confirm Playwright is producing attachments (requires browsers installed and a test that actually reaches runtime failure).

