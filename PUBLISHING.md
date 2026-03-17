# Publishing Guide

Complete instructions for publishing **Playwright LLM Reporter** to npm and making it available to the community.

## Pre-Publishing Checklist

- [ ] Update version in `package.json` (follow [semver](https://semver.org/))
- [ ] Update `CHANGELOG.md` with new features and fixes
- [ ] Ensure all tests pass: `npm test`
- [ ] Build successfully: `npm run build`
- [ ] Review code and security
- [ ] Add yourself as a contributor in `package.json`

## Step 1: Set Up npm Account

If you don't have an npm account:

1. Go to [npmjs.com](https://www.npmjs.com)
2. Click "Sign Up"
3. Create account with email and strong password
4. Verify email

## Step 2: Authenticate with npm Locally

```bash
npm login
```

Enter your npm credentials when prompted. This creates/updates `~/.npmrc` with your auth token.

Verify login:

```bash
npm whoami
```

## Step 3: Prepare Your Package

### Update Repository URL in package.json

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/playwright-llm-reporter.git"
  }
}
```

### Create/Update Key Files

- **README.md** – Comprehensive usage guide
- **LICENSE** – MIT license included ✓
- **AGENTS.md** – Developer guide ✓
- **INTEGRATION.md** – Integration instructions ✓
- **CHANGELOG.md** – Version history

Example `CHANGELOG.md`:

```markdown
# Changelog

## [1.0.0] - 2026-03-17

### Added
- Initial release
- Interactive HTML reporting with charts
- Artifact management (screenshots, videos, traces)
- Optional LLM analysis via OpenAI
- Express.js LLM server
- Full TypeScript support

### Features
- Single-file HTML report (no external assets)
- Dark theme with glassmorphic UI
- Filterable/sortable test table
- Error preview with full stack on hover
- Per-project test breakdown
```

## Step 4: Build and Test

```bash
# Clean previous build
rm -r dist

# Compile TypeScript
npm run build

# Verify dist/ contains compiled files
ls dist/reporters/
ls dist/llm-server.js
```

## Step 5: Create GitHub Release (Recommended)

On your GitHub repository:

1. Go to **Releases** → **Draft a new release**
2. Tag: `v1.0.0`
3. Title: `Release 1.0.0 - Initial Release`
4. Description: Copy from `CHANGELOG.md`
5. **Publish release**

## Step 6: Publish to npm

### Initial Publication

```bash
npm publish --access public
```

`--access public` makes the package public so anyone can install it.

For scoped packages (like `@yourorg/package`), you may need:

```bash
npm publish --access public
```

### Verify Publication

Check on npm:

```bash
npm info @playwright/llm-reporter
```

Or browse: https://www.npmjs.com/package/@playwright/llm-reporter

### After Publication

Test the package in a fresh directory:

```bash
mkdir test-install
cd test-install
npm init -y
npm install --save-dev @playwright/llm-reporter
cat node_modules/@playwright/llm-reporter/package.json
```

## Step 7: Update Documentation

### Add to README

If the package is published on npm, update your README to reference the npm package:

```markdown
## Installation

```bash
npm install --save-dev @playwright/llm-reporter
```

### Update URLs

- Update GitHub URLs in `package.json` to point to your repo
- Update homepage in `package.json`
- Link `INTEGRATION.md` from main README

## Publishing Updates

### Versioning Scheme

Follow [Semantic Versioning](https://semver.org/):

- **PATCH** (1.0.1): Bug fixes, non-breaking
- **MINOR** (1.1.0): New features, backward compatible
- **MAJOR** (2.0.0): Breaking changes

### Publishing a New Version

1. Update version in `package.json`:

```bash
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
```

2. Update `CHANGELOG.md` with changes

3. Commit and push:

```bash
git add package.json CHANGELOG.md
git commit -m "bump version to 1.0.1"
git push origin main
```

4. Create GitHub release (repeat Step 5)

5. Publish to npm:

```bash
npm publish
```

## Scoped vs. Unscoped Packages

### Current: Scoped Package (`@playwright/llm-reporter`)

**Pros:**
- Organized under organization
- Aligns with Playwright's namespace
- Professional appearance

**Cons:**
- Private by default; need `--access public` flag
- Requires publisher to own/be part of organization
- Organization members can publish under this scope

### Alternative: Unscoped Package (`playwright-llm-reporter`)

Rename in `package.json`:

```json
{
  "name": "playwright-llm-reporter"
}
```

**Pros:**
- Simpler name
- Public by default
- No org requirements

**Cons:**
- Namespace pollution risk
- Less organized appearance

## Troubleshooting Publication

### "You do not have permission to publish this package"

The scoped organization `@playwright` is exclusive. Use an unscoped name or your own scope:

```json
{
  "name": "my-playwright-llm-reporter"
}
```

Or use your organization scope:

```json
{
  "name": "@yourorg/playwright-llm-reporter"
}
```

### "Package not found after publishing"

npm publishes can take 1-2 minutes to appear in the registry. Wait and retry:

```bash
npm info @your-package/name
```

### "403 Forbidden"

Either:
1. Not logged in: `npm login` again
2. Package name already taken: Choose a different name
3. Org restrictions: Contact org admins

## Promoting Your Package

Once published:

1. **Add to awesome-playwright** – https://github.com/mxschmitt/awesome-playwright
2. **Share on Twitter/Dev.to** – "Check out my new Playwright reporter..."
3. **Open discussion on Playwright Slack** – https://join.slack.com/t/playwright/shared_invite/...
4. **Create example projects** – Show integration examples in separate repos
5. **Badge in README** – Add npm badge: `https://img.shields.io/npm/v/@your-package/name`

Example badge markdown:

```markdown
[![npm version](https://img.shields.io/npm/v/@playwright/llm-reporter)](https://www.npmjs.com/package/@playwright/llm-reporter)
```

## Maintenance

After publishing:

- **Monitor issues** – Respond to bug reports
- **Review PRs** – Community contributions
- **Semantic versioning** – Follow strict versioning
- **CHANGELOG** – Document every release
- **TypeScript** – Maintain type definitions
- **CI/CD** – Automate testing before publish

## Resources

- [npm docs - Publishing](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [npm scopes](https://docs.npmjs.com/cli/v9/using-npm/scope)

