"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function sanitizeFileName(name) {
    return name
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160);
}
function summarizeError(message, stack) {
    const raw = (message || stack || '').trim();
    if (!raw)
        return undefined;
    const firstLine = raw.split(/\r?\n/)[0].trim();
    return firstLine.length > 220 ? firstLine.slice(0, 217) + '...' : firstLine;
}
class LlmHtmlReporter {
    options;
    results = [];
    constructor(options = {}) {
        this.options = {
            outputDir: options.outputDir || 'playwright-llm-report',
            title: options.title || 'Playwright LLM Report'
        };
    }
    onBegin(config, suite) {
        if (!fs.existsSync(this.options.outputDir)) {
            fs.mkdirSync(this.options.outputDir, { recursive: true });
        }
    }
    onTestEnd(test, result) {
        const fullTitle = test.titlePath().join(' › ');
        const errorMessage = result.error?.message;
        const errorStack = result.error?.stack;
        this.results.push({
            title: test.title,
            fullTitle,
            status: result.status,
            duration: result.duration,
            errorMessage,
            errorStack,
            errorPreview: summarizeError(errorMessage, errorStack),
            projectName: test.parent?.project()?.name,
            file: test.location.file,
            attachments: (result.attachments || []).map(a => ({
                name: a.name || 'attachment',
                contentType: a.contentType || 'application/octet-stream',
                path: a.path
            }))
        });
    }
    async onEnd(result) {
        // Copy attachments (screenshots/videos/traces) into report folder so links work with file://.
        const artifactsDir = path.join(this.options.outputDir, 'artifacts');
        if (!fs.existsSync(artifactsDir))
            fs.mkdirSync(artifactsDir, { recursive: true });
        let seq = 0;
        for (const t of this.results) {
            for (const a of t.attachments || []) {
                if (!a.path)
                    continue;
                const src = a.path;
                if (!fs.existsSync(src))
                    continue;
                const ext = path.extname(src) || '';
                const base = sanitizeFileName(`${t.projectName || 'default'}-${t.title}-${a.name}`) || 'artifact';
                const destFile = `${String(seq++).padStart(4, '0')}-${base}${ext}`;
                const destAbs = path.join(artifactsDir, destFile);
                try {
                    fs.copyFileSync(src, destAbs);
                    a.path = `artifacts/${destFile}`;
                }
                catch {
                    // leave original path; link may not work, but keep data
                }
            }
        }
        const htmlPath = path.join(this.options.outputDir, 'index.html');
        fs.writeFileSync(htmlPath, this.buildHtml(), 'utf-8');
    }
    buildHtml() {
        const title = this.options.title;
        const dataJson = JSON.stringify(this.results).replace(/</g, '\\u003c');
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg: #0f172a;
      --bg-elevated: #111827;
      --accent: #38bdf8;
      --accent-soft: rgba(56, 189, 248, 0.15);
      --text: #e5e7eb;
      --text-muted: #9ca3af;
      --danger: #f97373;
      --success: #4ade80;
      --border: #1f2937;
      --card-radius: 14px;
      --shadow-soft: 0 18px 40px rgba(15, 23, 42, 0.65);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 24px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
      background: radial-gradient(circle at top left, #1f2937 0, #020617 55%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(0, 3fr) minmax(0, 2.4fr);
      gap: 24px;
    }

    @media (max-width: 900px) {
      .layout {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .card {
      background: radial-gradient(circle at 0 0, rgba(56,189,248,0.1) 0, rgba(15,23,42,0.4) 32%, rgba(15,23,42,0.9) 100%);
      border-radius: var(--card-radius);
      border: 1px solid rgba(148, 163, 184, 0.18);
      padding: 18px 20px;
      box-shadow: var(--shadow-soft);
      position: relative;
      overflow: hidden;
    }

    .card::before {
      content: "";
      position: absolute;
      inset: -40%;
      background:
        radial-gradient(circle at top left, rgba(56,189,248,0.17), transparent 55%),
        radial-gradient(circle at bottom right, rgba(59,130,246,0.12), transparent 55%);
      opacity: 0.9;
      mix-blend-mode: soft-light;
      pointer-events: none;
    }

    .card-inner {
      position: relative;
      z-index: 1;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 16px;
      margin-bottom: 4px;
    }

    .title {
      font-size: 20px;
      font-weight: 650;
      letter-spacing: 0.02em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .badge {
      border-radius: 999px;
      padding: 2px 10px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      background: linear-gradient(135deg, rgba(56,189,248,0.18), rgba(56,189,248,0.03));
      color: var(--accent);
      border: 1px solid rgba(56,189,248,0.55);
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 13px;
    }

    .metrics-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 10px;
      margin-bottom: 16px;
    }

    .metric {
      padding: 7px 10px;
      border-radius: 999px;
      background: radial-gradient(circle at top left, rgba(31,41,55,1), #020617);
      border: 1px solid rgba(55,65,81,0.95);
      display: flex;
      align-items: baseline;
      gap: 6px;
      font-size: 12px;
      color: var(--text-muted);
    }

    .metric-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
    }

    .metric-value.success {
      color: var(--success);
    }

    .metric-value.danger {
      color: var(--danger);
    }

    .metric-dot {
      width: 5px;
      height: 5px;
      border-radius: 999px;
      background: var(--accent);
      margin-right: 2px;
    }

    .chart-container {
      position: relative;
      width: 100%;
      height: 260px;
    }

    .tabs {
      display: flex;
      gap: 4px;
      margin-top: 10px;
      margin-bottom: 4px;
    }

    .tab {
      padding: 5px 10px;
      border-radius: 999px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-muted);
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .tab.active {
      background: radial-gradient(circle at top left, rgba(56,189,248,0.27), rgba(37,99,235,0.2));
      border-color: rgba(56,189,248,0.7);
      color: var(--text);
      box-shadow: 0 0 0 1px rgba(15,23,42,0.65), 0 10px 28px rgba(15,23,42,0.8);
    }

    .test-list {
      margin-top: 10px;
      max-height: 260px;
      overflow: auto;
      padding-right: 4px;
    }

    .table-controls {
      display: grid;
      grid-template-columns: 1.2fr 1fr 1fr 1fr;
      gap: 8px;
      margin-top: 14px;
      margin-bottom: 10px;
    }

    @media (max-width: 900px) {
      .table-controls {
        grid-template-columns: 1fr 1fr;
      }
    }

    .control {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .control label {
      font-size: 11px;
      color: var(--text-muted);
      letter-spacing: 0.02em;
    }

    .control select,
    .control input {
      width: 100%;
      border-radius: 12px;
      border: 1px solid rgba(55,65,81,0.9);
      background-color: #020617;
      color: var(--text);
      font-size: 13px;
      padding: 8px 10px;
      outline: none;
    }

    .control select option {
      background-color: #020617;
      color: var(--text);
    }

    .control select:focus,
    .control input:focus {
      border-color: rgba(56,189,248,0.7);
      box-shadow: 0 0 0 1px rgba(15,23,42,0.95), 0 0 0 1px rgba(37,99,235,0.7);
    }

    .table-wrap {
      margin-top: 4px;
      border-radius: 12px;
      border: 1px solid rgba(55,65,81,0.9);
      background: radial-gradient(circle at top left, rgba(15,23,42,1), #020617);
      overflow: auto;
      max-height: 70vh;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    thead th {
      position: sticky;
      top: 0;
      background: rgba(2, 6, 23, 0.95);
      color: var(--text);
      text-align: left;
      padding: 10px 10px;
      border-bottom: 1px solid rgba(55,65,81,0.9);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }

    thead th .sort {
      color: var(--text-muted);
      font-size: 11px;
      margin-left: 6px;
    }

    tbody td {
      padding: 9px 10px;
      border-bottom: 1px solid rgba(31,41,55,0.8);
      vertical-align: top;
    }

    tbody tr:hover td {
      background: rgba(56,189,248,0.06);
    }

    .cell-muted {
      color: var(--text-muted);
      font-size: 11px;
      margin-top: 2px;
    }

    .cell-title {
      max-width: 520px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .test-row {
      padding: 8px 9px;
      border-radius: 999px;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      font-size: 12px;
      border: 1px solid rgba(31,41,55,0.95);
      background: radial-gradient(circle at top left, rgba(17,24,39,1), #020617);
      margin-bottom: 5px;
      cursor: default;
    }

    .test-main {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .test-title {
      font-size: 12px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .test-meta {
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      gap: 8px;
      opacity: 0.9;
    }

    .status-pill {
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border: 1px solid rgba(148,163,184,0.4);
    }

    .status-pass {
      border-color: rgba(74,222,128,0.55);
      color: var(--success);
      background: linear-gradient(120deg, rgba(21,128,61,0.45), rgba(22,101,52,0.7));
    }

    .status-fail {
      border-color: rgba(248,113,113,0.68);
      color: var(--danger);
      background: linear-gradient(120deg, rgba(127,29,29,0.45), rgba(127,29,29,0.78));
    }

    .status-flaky {
      border-color: rgba(250,204,21,0.7);
      color: #facc15;
      background: linear-gradient(120deg, rgba(133,77,14,0.6), rgba(113,63,18,0.75));
    }

    .status-skipped {
      border-color: rgba(148,163,184,0.6);
      color: var(--text-muted);
      background: linear-gradient(120deg, rgba(15,23,42,0.7), rgba(15,23,42,0.9));
    }

    .llm-panel {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-top: 6px;
    }

    .llm-tip {
      font-size: 12px;
      color: var(--text-muted);
    }

    .llm-input-row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .llm-textarea {
      flex: 1;
      resize: vertical;
      min-height: 60px;
      max-height: 140px;
      padding: 8px 10px;
      border-radius: 12px;
      border: 1px solid rgba(55,65,81,0.9);
      background: radial-gradient(circle at top left, rgba(15,23,42,1), #020617);
      color: var(--text);
      font-size: 13px;
      outline: none;
    }

    .llm-textarea:focus {
      border-color: rgba(56,189,248,0.7);
      box-shadow: 0 0 0 1px rgba(15,23,42,0.95), 0 0 0 1px rgba(37,99,235,0.7);
    }

    .llm-button {
      padding: 9px 14px;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      background: radial-gradient(circle at top left, rgba(56,189,248,0.5), rgba(37,99,235,0.95));
      color: #0b1120;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 16px 30px rgba(15,23,42,0.9);
      white-space: nowrap;
    }

    .llm-button:disabled {
      opacity: 0.5;
      cursor: default;
      box-shadow: none;
    }

    .llm-output {
      max-height: 140px;
      overflow: auto;
      font-size: 13px;
      line-height: 1.45;
      padding: 8px 10px;
      border-radius: 12px;
      background: radial-gradient(circle at top left, rgba(15,23,42,1), #020617);
      border: 1px solid rgba(55,65,81,0.95);
      white-space: pre-wrap;
    }

    .llm-output.empty {
      display: none;
    }

    .pulse {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: var(--accent);
      box-shadow: 0 0 0 0 rgba(56,189,248,0.75);
      animation: pulse 1.4s infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(56,189,248,0.7);
      }
      70% {
        transform: scale(1.6);
        box-shadow: 0 0 0 10px rgba(56,189,248,0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(56,189,248,0);
      }
    }
  </style>
</head>
<body>
  <script id="pw-data" type="application/json">${dataJson}</script>
  <div class="layout">
    <div class="card">
      <div class="card-inner">
        <div class="header">
          <div>
            <div class="title">
              ${title}
              <span class="badge">Playwright · Interactive</span>
            </div>
            <div class="subtitle">Run insights with interactive charts and AI analysis.</div>
          </div>
          <div class="pulse"></div>
        </div>

        <div class="metrics-row" id="metrics-row"></div>
        <div id="metrics-extra" class="subtitle" style="margin-top:4px;"></div>

        <div class="tabs">
          <button class="tab active" data-chart="status">Status distribution</button>
          <button class="tab" data-chart="duration">Duration by test</button>
          <button class="tab" data-chart="project">Per project</button>
        </div>

        <div class="chart-container">
          <canvas id="statusChart"></canvas>
          <canvas id="durationChart" style="display:none;"></canvas>
          <canvas id="projectChart" style="display:none;"></canvas>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-inner">
        <div class="header">
          <div>
            <div class="title">Test details & LLM</div>
            <div class="subtitle">Browse tests and ask an LLM about this run.</div>
          </div>
        </div>

        <div class="test-list" id="test-list"></div>

        <div class="llm-panel">
          <div class="llm-tip">
            LLM endpoint URL is configured in <code>window.LLM_ENDPOINT</code>. Default: <code>/llm/analyze</code>.
          </div>
          <div class="llm-input-row">
            <textarea
              class="llm-textarea"
              id="llm-input"
              placeholder="Ask things like: Why are these tests flaky? Which files fail the most? How can we speed up this run?"></textarea>
            <button class="llm-button" id="llm-send">Ask LLM</button>
          </div>
          <div class="llm-output empty" id="llm-output"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="width:100%;">
    <div class="card-inner">
      <div class="header">
        <div>
          <div class="title">All tests</div>
          <div class="subtitle">Filter and sort across the entire run.</div>
        </div>
      </div>

      <div class="table-controls" id="table-controls">
        <div class="control">
          <label for="filter-project">Project</label>
          <select id="filter-project"></select>
        </div>
        <div class="control">
          <label for="filter-status">Status</label>
          <select id="filter-status"></select>
        </div>
        <div class="control">
          <label for="filter-min">Min duration (s)</label>
          <input id="filter-min" type="number" min="0" step="0.1" placeholder="0" />
        </div>
        <div class="control">
          <label for="filter-max">Max duration (s)</label>
          <input id="filter-max" type="number" min="0" step="0.1" placeholder="∞" />
        </div>
      </div>

      <div class="table-wrap">
        <table id="tests-table">
          <thead>
            <tr>
              <th data-col="status">Status <span class="sort" data-sort="status"></span></th>
              <th data-col="projectName">Project <span class="sort" data-sort="projectName"></span></th>
              <th data-col="duration">Duration <span class="sort" data-sort="duration"></span></th>
              <th data-col="fullTitle">Test <span class="sort" data-sort="fullTitle"></span></th>
              <th data-col="file">File <span class="sort" data-sort="file"></span></th>
              <th data-col="error">Error <span class="sort" data-sort="error"></span></th>
            </tr>
          </thead>
          <tbody id="tests-tbody"></tbody>
        </table>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    window.LLM_ENDPOINT = 'http://localhost:3000/llm/analyze';

    function computeMetrics(tests) {
      const statusCounts = { passed: 0, failed: 0, skipped: 0, flaky: 0 };
      let totalDuration = 0;
      const perProject = {};
      let slowest = null;

      for (const t of tests) {
        statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
        const dur = t.duration || 0;
        totalDuration += dur;

        const proj = t.projectName || 'default';
        if (!perProject[proj]) {
          perProject[proj] = { total: 0, passed: 0, failed: 0, duration: 0 };
        }
        perProject[proj].total += 1;
        perProject[proj].duration += dur;
        if (t.status === 'passed') {
          perProject[proj].passed += 1;
        } else if (t.status === 'failed' || t.status === 'flaky') {
          perProject[proj].failed += 1;
        }

        if (!slowest || dur > slowest.duration) {
          slowest = { title: t.fullTitle || t.title, duration: dur };
        }
      }

      return {
        statusCounts,
        totalDurationMs: totalDuration,
        testCount: tests.length,
        perProject,
        slowest
      };
    }

    function msToHuman(ms) {
      if (!ms || ms < 1000) return ms + ' ms';
      const s = ms / 1000;
      if (s < 60) return s.toFixed(1) + ' s';
      const m = Math.floor(s / 60);
      const rem = (s % 60).toFixed(0);
      return m + 'm ' + rem + 's';
    }

    function buildMetricsRow(metrics) {
      const row = document.getElementById('metrics-row');
      row.innerHTML = '';

      const makeMetric = (label, value, extraClass = '') => {
        const el = document.createElement('div');
        el.className = 'metric';
        el.innerHTML = '<div class="metric-dot"></div>' +
          '<span>' + label + '</span>' +
          '<span class="metric-value ' + extraClass + '">' + value + '</span>';
        return el;
      };

      const { statusCounts, totalDurationMs, testCount } = metrics;
      const passed = statusCounts.passed || 0;
      const failed = statusCounts.failed || 0;
      const flaky = statusCounts.flaky || 0;
      const skipped = statusCounts.skipped || 0;

      row.appendChild(makeMetric('Tests', testCount.toString(), passed > 0 && failed === 0 ? 'success' : ''));
      row.appendChild(makeMetric('Passed', passed.toString(), 'success'));
      if (failed + flaky > 0) {
        row.appendChild(makeMetric('Failed', failed.toString(), failed > 0 ? 'danger' : ''));
        row.appendChild(makeMetric('Flaky', flaky.toString(), flaky > 0 ? 'danger' : ''));
      }
      if (skipped > 0) {
        row.appendChild(makeMetric('Skipped', skipped.toString(), ''));
      }
      row.appendChild(makeMetric('Total duration', msToHuman(totalDurationMs), ''));

      const extra = document.getElementById('metrics-extra');
      if (!extra) return;

      const executed = testCount - skipped;
      const passRate = executed > 0 ? (passed / executed) * 100 : 0;
      const avgDuration = executed > 0 ? totalDurationMs / executed : 0;

      const projectNames = Object.keys(metrics.perProject || {});
      const projectSummary = projectNames.length
        ? projectNames
            .map(name => {
              const p = metrics.perProject[name];
              const failPart = p.failed ? \`, \${p.failed} failed\` : '';
              return \`\${name} (\${p.total} tests\${failPart})\`;
            })
            .join(' · ')
        : 'n/a';

      const slowest = metrics.slowest && metrics.slowest.duration
        ? \`\${metrics.slowest.title} (\${msToHuman(metrics.slowest.duration)})\`
        : 'n/a';

      extra.textContent =
        \`Pass rate: \${passRate.toFixed(1)}% · Avg duration: \${msToHuman(avgDuration)} · Projects: \${projectSummary} · Slowest: \${slowest}\`;
    }

    function buildTestList(tests) {
      const list = document.getElementById('test-list');
      list.innerHTML = '';

      tests.forEach(t => {
        const row = document.createElement('div');
        row.className = 'test-row';

        const main = document.createElement('div');
        main.className = 'test-main';

        const title = document.createElement('div');
        title.className = 'test-title';
        title.textContent = t.fullTitle || t.title;

        const meta = document.createElement('div');
        meta.className = 'test-meta';
        meta.innerHTML =
          '<span>' + (t.projectName || 'default') + '</span>' +
          '<span>' + (t.file || '') + '</span>' +
          '<span>' + msToHuman(t.duration || 0) + '</span>';

        main.appendChild(title);
        main.appendChild(meta);

        const status = document.createElement('div');
        status.className = 'status-pill';
        if (t.status === 'passed') status.classList.add('status-pass');
        else if (t.status === 'failed') status.classList.add('status-fail');
        else if (t.status === 'flaky') status.classList.add('status-flaky');
        else status.classList.add('status-skipped');
        status.textContent = t.status;

        row.appendChild(main);
        row.appendChild(status);

        if (t.error) {
          row.title = t.error;
        }

        list.appendChild(row);
      });
    }

    function buildTestTable(tests) {
      const projectSelect = document.getElementById('filter-project');
      const statusSelect = document.getElementById('filter-status');
      const minInput = document.getElementById('filter-min');
      const maxInput = document.getElementById('filter-max');
      const tbody = document.getElementById('tests-tbody');
      const table = document.getElementById('tests-table');

      if (!projectSelect || !statusSelect || !minInput || !maxInput || !tbody || !table) return;

      const projects = Array.from(new Set(tests.map(t => t.projectName || 'default'))).sort();
      const statuses = ['all', 'passed', 'failed', 'flaky', 'skipped'];

      projectSelect.innerHTML = ['all', ...projects]
        .map(p => '<option value="' + p + '">' + p + '</option>')
        .join('');
      statusSelect.innerHTML = statuses
        .map(s => '<option value="' + s + '">' + s + '</option>')
        .join('');

      let sort = { col: 'duration', dir: 'desc' };

      function updateSortIndicators() {
        const indicators = table.querySelectorAll('span[data-sort]');
        indicators.forEach(el => {
          const col = el.getAttribute('data-sort');
          if (col === sort.col) {
            el.textContent = sort.dir === 'asc' ? '▲' : '▼';
          } else {
            el.textContent = '';
          }
        });
      }

      function getFilterState() {
        const project = projectSelect.value;
        const status = statusSelect.value;
        const minS = parseFloat(minInput.value);
        const maxS = parseFloat(maxInput.value);
        const minMs = Number.isFinite(minS) ? Math.max(0, minS * 1000) : 0;
        const maxMs = Number.isFinite(maxS) ? Math.max(0, maxS * 1000) : Number.POSITIVE_INFINITY;
        return { project, status, minMs, maxMs };
      }

      function compare(a, b) {
        const dir = sort.dir === 'asc' ? 1 : -1;
        const col = sort.col;
        const av = (a[col] ?? '');
        const bv = (b[col] ?? '');

        if (col === 'duration') return dir * ((a.duration || 0) - (b.duration || 0));
        return dir * String(av).localeCompare(String(bv));
      }

      function render() {
        const { project, status, minMs, maxMs } = getFilterState();

        const filtered = tests.filter(t => {
          const proj = t.projectName || 'default';
          const dur = t.duration || 0;
          const statusOk = status === 'all' ? true : t.status === status;
          const projOk = project === 'all' ? true : proj === project;
          const durOk = dur >= minMs && dur <= maxMs;
          return statusOk && projOk && durOk;
        });

        filtered.sort(compare);

        tbody.innerHTML = filtered.map(t => {
          const proj = t.projectName || 'default';
          const title = t.fullTitle || t.title;
          const error = t.errorPreview || t.errorMessage || '';
          const errorFull = (t.errorStack || t.errorMessage || '').replace(/</g, '&lt;');
          const errorCell = String(error).replace(/</g, '&lt;');
          const statusClass =
            t.status === 'passed' ? 'status-pass' :
            t.status === 'failed' ? 'status-fail' :
            t.status === 'flaky' ? 'status-flaky' : 'status-skipped';

          const artifacts = (t.attachments || []).filter(a => {
            if (!a || !a.path) return false;
            const ct = String(a.contentType || '').toLowerCase();
            const n = String(a.name || '').toLowerCase();
            return (
              ct.startsWith('image/') ||
              ct.startsWith('video/') ||
              ct === 'application/zip' ||
              ct === 'text/markdown' ||
              n.includes('trace') ||
              n.includes('screenshot') ||
              n.includes('video')
            );
          });
          const artifactLinks = artifacts.length
            ? '<div class="cell-muted">' + artifacts.map(a => {
                const ct = String(a.contentType || '').toLowerCase();
                const n = String(a.name || '');
                const label =
                  ct.startsWith('image/') ? 'Screenshot' :
                  ct.startsWith('video/') ? 'Video' :
                  ct === 'application/zip' ? 'Trace' :
                  ct === 'text/markdown' ? 'Context' :
                  (n || 'Artifact');
                return '<a href="' + a.path + '" target="_blank" rel="noreferrer">' + label + '</a>';
              }).join(' · ') + '</div>'
            : '';

          return (
            '<tr title="' + errorFull + '">' +
              '<td><span class="status-pill ' + statusClass + '">' + t.status + '</span></td>' +
              '<td>' + proj + '</td>' +
              '<td>' + msToHuman(t.duration || 0) + '</td>' +
              '<td>' +
                '<div class="cell-title">' + title + '</div>' +
                ((t.errorMessage || t.errorStack) ? '<div class="cell-muted">Has error (hover row)</div>' : '') +
              '</td>' +
              '<td><div class="cell-title">' + (t.file || '') + '</div></td>' +
              '<td><div class="cell-title">' + errorCell + '</div>' + artifactLinks + '</td>' +
            '</tr>'
          );
        }).join('');

        updateSortIndicators();
      }

      function onHeaderClick(e) {
        const th = e.target.closest('th[data-col]');
        if (!th) return;
        const col = th.getAttribute('data-col');
        if (!col) return;
        if (sort.col === col) {
          sort.dir = sort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          sort.col = col;
          sort.dir = col === 'duration' ? 'desc' : 'asc';
        }
        render();
      }

      table.querySelector('thead')?.addEventListener('click', onHeaderClick);
      projectSelect.addEventListener('change', render);
      statusSelect.addEventListener('change', render);
      minInput.addEventListener('input', render);
      maxInput.addEventListener('input', render);

      render();
    }

    function buildCharts(tests, metrics) {
      const { statusCounts } = metrics;
      const ctxStatus = document.getElementById('statusChart').getContext('2d');
      const ctxDuration = document.getElementById('durationChart').getContext('2d');
      const ctxProject = document.getElementById('projectChart').getContext('2d');

      const statusChart = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
          labels: ['Passed', 'Failed', 'Flaky', 'Skipped'],
          datasets: [{
            data: [
              statusCounts.passed || 0,
              statusCounts.failed || 0,
              statusCounts.flaky || 0,
              statusCounts.skipped || 0
            ],
            backgroundColor: [
              'rgba(74,222,128,0.9)',
              'rgba(248,113,113,0.9)',
              'rgba(250,204,21,0.9)',
              'rgba(148,163,184,0.9)'
            ],
            borderWidth: 0
          }]
        },
        options: {
          plugins: {
            legend: {
              labels: {
                color: '#e5e7eb',
                font: { size: 11 }
              }
            }
          },
          cutout: '65%'
        }
      });

      const sortedByDuration = [...tests].sort((a, b) => (b.duration || 0) - (a.duration || 0)).slice(0, 25);
      const durationChart = new Chart(ctxDuration, {
        type: 'bar',
        data: {
          labels: sortedByDuration.map(t => t.title),
          datasets: [{
            label: 'Duration (ms)',
            data: sortedByDuration.map(t => t.duration || 0),
            backgroundColor: 'rgba(56,189,248,0.75)',
            borderWidth: 0,
            borderRadius: 10
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              ticks: { color: '#9ca3af', font: { size: 10 } },
              grid: { color: 'rgba(31,41,55,0.8)' }
            },
            y: {
              ticks: { color: '#e5e7eb', font: { size: 10 } },
              grid: { display: false }
            }
          },
          plugins: {
            legend: {
              labels: { color: '#e5e7eb', font: { size: 11 } }
            },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  const v = ctx.parsed.x ?? ctx.parsed.y;
                  return msToHuman(v);
                }
              }
            }
          }
        }
      });

      const projectNames = Object.keys(metrics.perProject || {});
      const projectData = projectNames.map(name => metrics.perProject[name]);
      const projectChart = new Chart(ctxProject, {
        type: 'bar',
        data: {
          labels: projectNames,
          datasets: [
            {
              label: 'Passed',
              data: projectData.map(p => p.passed || 0),
              backgroundColor: 'rgba(74,222,128,0.85)',
              borderWidth: 0,
              stack: 'status'
            },
            {
              label: 'Failed / Flaky',
              data: projectData.map(p => p.failed || 0),
              backgroundColor: 'rgba(248,113,113,0.9)',
              borderWidth: 0,
              stack: 'status'
            }
          ]
        },
        options: {
          scales: {
            x: {
              ticks: { color: '#e5e7eb', font: { size: 10 } },
              grid: { display: false }
            },
            y: {
              ticks: { color: '#9ca3af', font: { size: 10 }, precision: 0 },
              grid: { color: 'rgba(31,41,55,0.8)' },
              beginAtZero: true,
              stacked: true
            }
          },
          plugins: {
            legend: {
              labels: { color: '#e5e7eb', font: { size: 11 } }
            },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  const v = ctx.parsed.y;
                  return \`\${ctx.dataset.label}: \${v} test\${v === 1 ? '' : 's'}\`;
                }
              }
            }
          }
        }
      });

      const tabs = document.querySelectorAll('.tab');
      const statusCanvas = document.getElementById('statusChart');
      const durationCanvas = document.getElementById('durationChart');
      const projectCanvas = document.getElementById('projectChart');

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const which = tab.getAttribute('data-chart');
          if (which === 'status') {
            statusCanvas.style.display = 'block';
            durationCanvas.style.display = 'none';
            projectCanvas.style.display = 'none';
          } else if (which === 'duration') {
            statusCanvas.style.display = 'none';
            durationCanvas.style.display = 'block';
            projectCanvas.style.display = 'none';
          } else {
            statusCanvas.style.display = 'none';
            durationCanvas.style.display = 'none';
            projectCanvas.style.display = 'block';
          }
        });
      });
    }

    function setupLlm(tests) {
      const input = document.getElementById('llm-input');
      const send = document.getElementById('llm-send');
      const out = document.getElementById('llm-output');

      async function callLlm() {
        const question = input.value.trim();
        if (!question) return;
        send.disabled = true;
        send.textContent = 'Thinking...';
        out.classList.remove('empty');
        out.textContent = 'Waiting for LLM response...';

        try {
          const res = await fetch(window.LLM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, tests })
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const data = await res.json();
          out.textContent = data.answer || JSON.stringify(data, null, 2);
        } catch (e) {
          out.textContent = 'Error talking to LLM: ' + e;
        } finally {
          send.disabled = false;
          send.textContent = 'Ask LLM';
        }
      }

      send.addEventListener('click', callLlm);
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          callLlm();
        }
      });
    }

    (() => {
      const raw = document.getElementById('pw-data')?.textContent || '[]';
      let tests;
      try {
        tests = JSON.parse(raw);
      } catch {
        tests = [];
      }
      const metrics = computeMetrics(tests);
      buildMetricsRow(metrics);
      buildTestList(tests);
      buildTestTable(tests);
      buildCharts(tests, metrics);
      setupLlm(tests);
    })();
  </script>
</body>
</html>`;
    }
}
exports.default = LlmHtmlReporter;
