# Quick Reference: Packaging & Publishing

This guide provides a quick reference for packaging and publishing the Playwright LLM Reporter as an npm package.

## What Has Been Done ✅

Your project is now configured as a **publishable npm package**:

- ✅ `package.json` – Updated with npm metadata, exports, and peer dependencies
- ✅ `LICENSE` – MIT license included
- ✅ `.npmignore` – Controls what gets published to npm
- ✅ `README.md` – Quick start guide with npm badges
- ✅ `INTEGRATION.md` – Step-by-step integration for existing projects
- ✅ `PUBLISHING.md` – Complete publishing workflow
- ✅ `CHANGELOG.md` – Version history and roadmap
- ✅ `AGENTS.md` – Developer guide for contributors

## Before Publishing

### Step 1: Build & Test

```bash
# Clean build
npm run build

# Verify compiled files exist
ls dist/reporters/llm-html-reporter.js
ls dist/llm-server.js
```

### Step 2: Update GitHub URLs

In `package.json`, replace placeholders:

```json
{
  "repository": {
    "url": "https://github.com/YOUR_USERNAME/playwright-llm-reporter.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/playwright-llm-reporter/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/playwright-llm-reporter#readme"
}
```

Also update in README.md, INTEGRATION.md, and PUBLISHING.md.

### Step 3: Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: Playwright LLM Reporter v1.0.0"
git remote add origin https://github.com/YOUR_USERNAME/playwright-llm-reporter.git
git branch -M main
git push -u origin main
```

### Step 4: Create GitHub Release

1. Go to your repo → **Releases** → **Create a new release**
2. Tag: `v1.0.0`
3. Title: `Release 1.0.0 - Initial Release`
4. Description: Copy from `CHANGELOG.md`

## Publishing to npm

### Option A: Scoped Package (`@yourorg/playwright-llm-reporter`)

For organization-scoped packages, use your org scope:

```json
{
  "name": "@yourorg/playwright-llm-reporter"
}
```

Then publish:

```bash
npm login
npm publish --access public
```

### Option B: Unscoped Package (`playwright-llm-reporter`)

Rename in `package.json`:

```json
{
  "name": "playwright-llm-reporter"
}
```

Then publish:

```bash
npm login
npm publish
```

### Verify Publication

```bash
npm info playwright-llm-reporter
# or
npm info @yourorg/playwright-llm-reporter
```

## Post-Publishing

### Promote Your Package

1. **Add to awesome-playwright**
   - Fork: https://github.com/mxschmitt/awesome-playwright
   - Add your package to the reporters section
   - Create PR

2. **Tweet about it**
   - Share on Twitter/Dev.to
   - "Check out my new Playwright reporter with LLM integration!"

3. **Create example projects**
   - Show integration in separate repos
   - Link from README

4. **Add npm badge to README**
   ```markdown
   [![npm version](https://img.shields.io/npm/v/@yourorg/playwright-llm-reporter)](https://www.npmjs.com/package/@yourorg/playwright-llm-reporter)
   ```

## Maintenance

### Publishing Updates

For each update:

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Rebuild: `npm run build`
4. Commit and push
5. Create GitHub release with tag
6. Publish to npm: `npm publish`

### Semantic Versioning

- **PATCH** (1.0.1): Bug fixes
- **MINOR** (1.1.0): New features
- **MAJOR** (2.0.0): Breaking changes

Example:

```bash
npm version patch    # 1.0.0 → 1.0.1
npm version minor    # 1.0.0 → 1.1.0
npm version major    # 1.0.0 → 2.0.0
npm publish
```

## File Structure

Your npm package will contain:

```
dist/
  reporters/
    llm-html-reporter.js
    llm-html-reporter.d.ts
  llm-server.js
  llm-server.d.ts
README.md
LICENSE
AGENTS.md
CHANGELOG.md
package.json
```

## For Users

Once published, users can install with:

```bash
npm install --save-dev @yourorg/playwright-llm-reporter
```

And use in `playwright.config.ts`:

```typescript
reporter: [
  ['@yourorg/playwright-llm-reporter', {
    outputDir: 'playwright-llm-report',
    title: 'Test Report'
  }],
]
```

## Files Reference

- **[README.md](./README.md)** – User-facing quick start
- **[INTEGRATION.md](./INTEGRATION.md)** – Detailed integration guide
- **[PUBLISHING.md](./PUBLISHING.md)** – Full publishing workflow
- **[AGENTS.md](./AGENTS.md)** – Developer guide
- **[CHANGELOG.md](./CHANGELOG.md)** – Version history
- **[LICENSE](./LICENSE)** – MIT License
- **[package.json](./package.json)** – npm package metadata

## Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check `reporters/llm-html-reporter.ts` exists; run `npm run build` |
| Can't publish | Run `npm login` and verify account; check package name not taken |
| "403 Forbidden" | Name taken or org restrictions; choose different name or contact org admin |
| Types not generated | Verify `tsconfig.json` has `declaration: true` |

## Next Steps

1. Update GitHub URLs in config files
2. Run `npm run build` to verify compilation
3. Create GitHub repository and push code
4. Create GitHub release for v1.0.0
5. Run `npm publish --access public` or `npm publish`
6. Update npm badge in README
7. Promote on social media / awesome-playwright

You're ready to share your package with the world! 🚀

