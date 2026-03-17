import type { TestCase, TestResult } from '@playwright/test/reporter';
import type {
  SerializedAttachment,
  SerializedTestResult,
  SerializedTestStatus,
} from './report-types';

function buildErrorMessage(error: TestResult['error'] | undefined): string | undefined {
  if (!error) return undefined;
  if (typeof error.message === 'string' && error.message.trim()) return error.message;
  if (typeof error.value === 'string' && error.value.trim()) return error.value;
  return undefined;
}

function buildErrorStack(error: TestResult['error'] | undefined): string | undefined {
  if (!error) return undefined;
  if (typeof error.stack === 'string' && error.stack.trim()) return error.stack;
  return undefined;
}

export function summarizeError(error: TestResult['error'] | undefined): {
  errorMessage?: string;
  errorStack?: string;
  errorPreview?: string;
} {
  const errorMessage = buildErrorMessage(error);
  const errorStack = buildErrorStack(error);

  let errorPreview: string | undefined;
  if (errorMessage) {
    const firstLine = errorMessage.split(/\r?\n/, 1)[0];
    const maxLen = 220;
    errorPreview = firstLine.length > maxLen ? `${firstLine.slice(0, maxLen - 1)}…` : firstLine;
  }

  return { errorMessage, errorStack, errorPreview };
}

export function serializeAttachments(
  _test: TestCase,
  result: TestResult,
): SerializedAttachment[] {
  return result.attachments.map(att => ({
    name: att.name,
    contentType: att.contentType,
    path: att.path ?? undefined,
  }));
}

export function serializeTestResult(
  test: TestCase,
  result: TestResult,
  projectName: string,
): SerializedTestResult {
  const { errorMessage, errorStack, errorPreview } = summarizeError(result.error);

  const attachments = serializeAttachments(test, result);

  const fullTitle = test.titlePath().join(' \u203a ');
  const status = (result.status ?? 'failed') as SerializedTestStatus;

  return {
    title: test.title,
    fullTitle,
    status,
    duration: result.duration,
    errorMessage,
    errorStack,
    errorPreview,
    attachments,
    projectName,
  };
}

