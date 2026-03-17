import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from 'playwright/types/testReporter';
import * as fs from 'fs';
import * as path from 'path';
import type { ReporterOptions, SerializedTestResult } from './report-types';
import { serializeTestResult } from './serialization';
import * as artifacts from './artifacts';
import { buildHtml } from './html-template';

export default class LlmHtmlReporter implements Reporter {
  private options: ReporterOptions;
  private results: SerializedTestResult[] = [];

  constructor(options: ReporterOptions = {}) {
    this.options = {
      outputDir: options.outputDir || 'playwright-llm-report',
      title: options.title || 'Playwright LLM Report',
      llmPort: options.llmPort,
      llmEndpoint: options.llmEndpoint,
    };
  }

  onBegin(config: FullConfig, suite: Suite) {
    const outDir = this.options.outputDir ?? 'playwright-llm-report';
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    this.options.outputDir = outDir;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const projectName = test.parent?.project()?.name ?? 'default';
    const serialized = serializeTestResult(test, result, projectName);
    this.results.push(serialized);
  }

  async onEnd(result: FullResult) {
    const outputDir = this.options.outputDir ?? 'playwright-llm-report';
    const artifactsDir = path.join(outputDir, 'artifacts');

    await artifacts.copyArtifactsForResults({
      results: this.results,
      targetRoot: artifactsDir,
    });

    const html = buildHtml({ results: this.results, options: this.options });
    const htmlPath = path.join(outputDir, 'index.html');
    await fs.promises.writeFile(htmlPath, html, 'utf-8');
  }
}
