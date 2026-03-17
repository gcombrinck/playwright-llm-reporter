#!/usr/bin/env node

import { startLlmServer } from '../llm-server';

// Simple wrapper CLI that starts the LLM server.
// Optional: allow PORT env or default logic inside startLlmServer.

void (async () => {
  // Delegate to the existing startLlmServer helper so logic stays centralized.
  await startLlmServer({});
})();

