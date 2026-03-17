import * as fs from 'fs';
import * as path from 'path';
import type { SerializedTestResult } from './report-types';

export function sanitizeFileName(name: string): string {
  const replaced = name.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const maxLength = 160;
  if (replaced.length <= maxLength) return replaced;

  const extMatch = /\.[^./]+$/.exec(replaced);
  if (!extMatch) return replaced.slice(0, maxLength);

  const ext = extMatch[0];
  const base = replaced.slice(0, maxLength - ext.length);
  return base + ext;
}

export function buildArtifactFileName(
  index: number,
  projectName: string,
  testTitle: string,
  attachmentName: string,
  extension: string,
): string {
  const prefix = index.toString().padStart(4, '0');
  const base = `${prefix}-${projectName}-${testTitle} - ${attachmentName}`;
  const withExt = `${base}.${extension.replace(/^\./, '')}`;
  return sanitizeFileName(withExt);
}

function guessExtension(contentType: string | undefined, fallbackPath?: string): string {
  if (fallbackPath) {
    const ext = path.extname(fallbackPath);
    if (ext) return ext.replace(/^\./, '');
  }

  if (!contentType) return 'bin';

  if (contentType.startsWith('image/')) return contentType.split('/')[1];
  if (contentType.startsWith('video/')) return contentType.split('/')[1];
  if (contentType === 'application/zip') return 'zip';
  if (contentType === 'text/plain') return 'md';

  return 'bin';
}

export async function copyArtifactsForResults(params: {
  results: SerializedTestResult[];
  targetRoot: string;
}): Promise<void> {
  const { results, targetRoot } = params;

  await fs.promises.mkdir(targetRoot, { recursive: true });

  let seq = 0;

  for (const result of results) {
    for (const attachment of result.attachments) {
      if (!attachment.path) continue;

      const ext = guessExtension(attachment.contentType, attachment.path);
      const fileName = buildArtifactFileName(
        seq++,
        result.projectName,
        result.title,
        attachment.name,
        ext,
      );

      const targetPath = path.join(targetRoot, fileName);

      try {
        await fs.promises.copyFile(attachment.path, targetPath);
        attachment.path = `artifacts/${fileName}`;
      } catch (error) {
        // Keep behavior non-fatal but visible.
        console.warn(
          `Failed to copy artifact from ${attachment.path} to ${targetPath}:`,
          (error as Error).message,
        );
      }
    }
  }
}
