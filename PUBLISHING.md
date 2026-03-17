# Publishing Guide

This guide explains how to publish the **Playwright LLM HTML Reporter** package to the npm registry so it can be installed as `@gcombrinck/playwright-llm-reporter`.

> This document is aimed at project maintainers who have publish rights for the package.

---

## 1. Prerequisites

### 1.1. Accounts & Permissions

- **npm account**: Create one if you don’t already have it: https://www.npmjs.com/signup
- **Publish rights**:
  - If publishing as `@gcombrinck/playwright-llm-reporter`, you must belong to the organization that owns the `@gcombrinck` scope **or** own that scope yourself.
  - Otherwise, adjust the scope/name (e.g. `@your-org/llm-reporter`).

Check your npm identity and whether the target package name is available or already owned:

```powershell
# Who you are logged in as
npm whoami

# Check if the package name is already in use and by whom
npm view @gcombrinck/playwright-llm-reporter

# (Optional) If you publish under an org/scope, list its members
npm org ls @your-org
```

### 1.2. Local Environment

- Node.js (LTS recommended).
- npm (comes with Node.js).
- This repository cloned locally.

Install project dependencies:

```powershell
cd C:\playwright-llm-reporter
npm install
```

### 1.3. npm Login

Log in to npm from this machine (once per environment/session):

```powershell
npm login
```

Follow the prompts for username, password, and 2FA (if enabled).

---

## 2. Project Build Overview

This project is written in TypeScript and compiled before publishing.

Key files:

- `reporters/llm-html-reporter.ts` – Playwright reporter implementation
- `llm-server.ts` – optional Express-based LLM server
- `tsconfig.json` – TypeScript configuration
- `package.json` – npm metadata and scripts

The build script (see `package.json`) compiles TypeScript to JavaScript (typically into a `dist/` directory):

```powershell
npm run build
```

Make sure this command completes successfully before publishing.

---

## 3. One-Time Package Setup

These steps are usually done once per project and updated only when layout or public API changes.

### 3.1. Confirm Package Name

Open `package.json` and verify the `name` field:

```jsonc
{
  "name": "@gcombrinck/playwright-llm-reporter",
  // ...
}
```

If you need a different scope (for example `@your-org/llm-reporter`), update:

- `"name"` in `package.json`
- Usage examples in `INTEGRATION.md` and `README.md` (e.g. `npm install --save-dev @gcombrinck/playwright-llm-reporter`)
- Import paths like `import type { LlmReporterOptions } from '@gcombrinck/playwright-llm-reporter';`

### 3.2. Entry Points & Files

Ensure consumers load the compiled output, not the raw TypeScript.

In `package.json`, you should have something like (adapt paths to your actual `dist` layout):

```jsonc
{
  "main": "dist/reporters/llm-html-reporter.js",
  "types": "dist/reporters/llm-html-reporter.d.ts",
  "exports": {
    ".": {
      "types": "./dist/reporters/llm-html-reporter.d.ts",
      "default": "./dist/reporters/llm-html-reporter.js"
    },
    "./llm-server": {
      "types": "./dist/llm-server.d.ts",
      "default": "./dist/llm-server.js"
    }
  },
  "files": [
    "dist",
    "README.md",
    "INTEGRATION.md",
    "LICENSE"
  ]
}
```

Adjust these paths if your compiled output lives elsewhere or you use a different folder structure.

### 3.3. Initial Version

Set a semantic version in `package.json`:

```jsonc
{
  "version": "0.1.0"
}
```

Use [SemVer](https://semver.org/) conventions:

- `MAJOR.MINOR.PATCH`
- Bump:
  - **PATCH** for bug fixes (e.g. `0.1.0` → `0.1.1`)
  - **MINOR** for backward-compatible features (e.g. `0.1.0` → `0.2.0`)
  - **MAJOR** for breaking changes (e.g. `0.1.0` → `1.0.0`)

---

## 4. Build & Verify Before Publishing

Run these steps **every time** before you publish a new version.

1. **Install dependencies (if not already done):**

   ```powershell
   npm install
   ```

2. **Build the project:**

   ```powershell
   npm run build
   ```

   Confirm that TypeScript compiles without errors and that the expected `dist/` files exist.

3. **Run tests to ensure the reporter still works:**

   ```powershell
   npm test
   ```

   This should generate a report at `playwright-llm-report/index.html` using the custom reporter.

4. **Inspect the package contents with a dry run:**

   ```powershell
   npm pack --dry-run
   ```

   Review the output list to ensure only the intended files are included (primarily `dist/` and key docs).

---

## 5. Version Bumping

Before each publish, bump the version number.

You can do this manually by editing `package.json`, or use npm helpers:

```powershell
# For a patch release (bug fixes)
npm version patch

# For a minor release (new features, no breaking changes)
npm version minor

# For a major release (breaking changes)
npm version major
```

These commands will:

- Update the `version` in `package.json` (and `package-lock.json` if present)
- Create a Git tag like `v0.1.1`

If you use Git, commit the changes:

```powershell
git add package.json package-lock.json
git commit -m "chore: release v0.1.1"
# Optional: push tag
git tag v0.1.1
git push origin main --follow-tags
```

Adjust the branch name (`main`) and version tag as needed.

---

## 6. Publishing to npm

### 6.1. Access Configuration

For scoped packages like `@gcombrinck/playwright-llm-reporter`, configure publish access in `package.json`:

```jsonc
{
  "publishConfig": {
    "access": "public"
  }
}
```

If you are publishing to a private registry or want private access, adjust accordingly.

### 6.2. Final Checks

Before publishing:

- Build succeeds: `npm run build`
- Tests pass: `npm test`
- Package contents are correct: `npm pack --dry-run`
- Version has been bumped and not used previously on npm.

### 6.3. Publish Command

From the project root (`C:\playwright-llm-reporter`):

```powershell
npm publish
```

For the **first** public release of a **scoped** package, you may need:

```powershell
npm publish --access public
```

Common issues:

- **Permission error / E403** – You don’t have rights to publish this scope/name. Confirm ownership or choose a different scope.
- **"Cannot publish over existing version"** – The current `version` already exists on npm. Bump the version and try again.

---

## 7. Verifying the Published Package

After a successful publish:

1. **Check on npm** (replace with your actual package URL if you changed the name):

   - https://www.npmjs.com/package/@gcombrinck/playwright-llm-reporter

2. **Install in a clean project** and confirm integration.

   In a new directory:

   ```powershell
   mkdir test-playwright-llm-reporter
   cd test-playwright-llm-reporter
   npm init -y
   npm install --save-dev @playwright/test @gcombrinck/playwright-llm-reporter
   ```

   Create a minimal `playwright.config.ts`:

   ```ts
   import type { PlaywrightTestConfig } from '@playwright/test';
   import type { LlmReporterOptions } from '@gcombrinck/playwright-llm-reporter';

   const config: PlaywrightTestConfig = {
     testDir: './tests',
     use: {
       screenshot: 'only-on-failure',
       video: 'retain-on-failure',
       trace: 'retain-on-failure',
     },
      reporter: [
        ['html'],
        ['@gcombrinck/playwright-llm-reporter', {
         outputDir: 'playwright-llm-report',
         title: 'My Test Report',
       } satisfies LlmReporterOptions],
     ],
   };

   export default config;
   ```

   Add a simple test (e.g. `tests/example.spec.ts`), then run:

   ```powershell
   npx playwright test
   ```

   Confirm that `playwright-llm-report/index.html` is generated and behaves as described in `INTEGRATION.md`.

3. (Optional) **Test the LLM server** from the installed package, following the integration guide:

   ```powershell
   # In PowerShell
   $env:OPENAI_API_KEY="sk-..."
   npx @gcombrinck/playwright-llm-reporter llm-server
   ```

   Or programmatically via:

   ```ts
   import { startLlmServer } from '@gcombrinck/playwright-llm-reporter/llm-server';

   startLlmServer({ port: 3000 });
   ```

   Then re-run tests and open the report; the **Ask LLM** panel should be active.

---

## 8. Release Checklist

Use this checklist for every release:

- [ ] All tests pass (`npm test`).
- [ ] TypeScript build succeeds (`npm run build`).
- [ ] `CHANGELOG.md` updated (if you maintain one).
- [ ] `package.json` version bumped (SemVer).
- [ ] `npm pack --dry-run` shows only intended files.
- [ ] `npm publish` (or `npm publish --access public`) completed successfully.
- [ ] Package is visible on npm and installable in a clean project.
- [ ] `INTEGRATION.md` and `README.md` are still accurate for installation and usage.

---

## 9. Troubleshooting

### 9.1. Permission Errors (E403)

- Confirm npm login and identity:

  ```powershell
  npm whoami
  ```

- Check if the package name already exists and who owns it:

  ```powershell
  npm view @gcombrinck/playwright-llm-reporter
  ```

- If you publish under an organization scope, list its members (replace `@your-org`):

  ```powershell
  npm org ls @your-org
  ```

- If you don’t control the scope or package, request access from the owners or change the `name` in `package.json` to a scope you control.

### 9.2. Version Already Published

If npm reports that the version already exists:

1. Bump the version in `package.json` (or use `npm version patch|minor|major`).
2. Rebuild and re-run `npm pack --dry-run` if needed.
3. Run `npm publish` again.

### 9.3. Consumers Can’t Import the Reporter

If users report errors like "Cannot find module '@gcombrinck/playwright-llm-reporter'" or missing exports:

- Verify that:
  - `main`, `types`, and `exports` in `package.json` point to files that exist in the published `dist/` directory.
  - The `files` array includes `dist` (and not just the TypeScript sources).
- Use `npm pack --dry-run` to confirm that the built files are present.

### 9.4. LLM Server Not Working After Install

If consumers say the **Ask LLM** feature fails:

- Confirm they followed `INTEGRATION.md`:
  - Set `OPENAI_API_KEY`.
  - Started the LLM server via CLI (`npx @gcombrinck/playwright-llm-reporter llm-server`) or programmatically.
- Ensure that your published `exports` expose the `llm-server` entry point under `@gcombrinck/playwright-llm-reporter/llm-server`.

---

With this guide, maintainers can consistently build, version, publish, and verify the **Playwright LLM HTML Reporter** package on npm so users can install it with:

```bash
npm install --save-dev @gcombrinck/playwright-llm-reporter
```
