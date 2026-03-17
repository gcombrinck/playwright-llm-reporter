// Shared types for the LLM HTML reporter and related tools.

export type SerializedAttachment = {
  name: string;
  contentType: string;
  path?: string;
};

export type SerializedTestStatus = 'passed' | 'failed' | 'skipped' | 'flaky';

export type SerializedTestResult = {
  title: string;
  fullTitle: string;
  status: SerializedTestStatus;
  duration: number;
  errorMessage?: string;
  errorStack?: string;
  errorPreview?: string;
  attachments: SerializedAttachment[];
  projectName: string;
};

export type ReporterOptions = {
  outputDir?: string;
  title?: string;
  llmPort?: number;
  llmEndpoint?: string;
};
