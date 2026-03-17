#!/usr/bin/env bash
set -euo pipefail

# Helper script to publish @gcombrinck/playwright-llm-reporter to the npm registry.
#
# Usage (from repo root):
#   ./publish.sh
#
# Requirements:
#   - bash (Git Bash / WSL / macOS / Linux)
#   - Node.js + npm
#   - npm login with publish rights for the @gcombrinck scope

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "==> Publishing from: $ROOT_DIR"

# 1. Basic tooling checks
if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is not installed or not on PATH." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not on PATH." >&2
  exit 1
fi

echo "Node version: $(node -v)"
echo "npm version:  $(npm -v)"

# 2. Show current package name and version
PKG_NAME=$(node -p "require('./package.json').name")
PKG_VERSION=$(node -p "require('./package.json').version")

echo "Package: $PKG_NAME"
echo "Version: $PKG_VERSION"

if [[ "$PKG_NAME" != "@gcombrinck/playwright-llm-reporter" ]]; then
  echo "Warning: package name in package.json is '$PKG_NAME', expected '@gcombrinck/playwright-llm-reporter'." >&2
fi

# 3. Confirm before publishing
read -r -p "Proceed to publish $PKG_NAME@$PKG_VERSION to npm? [y/N] " RESP
RESP=${RESP:-N}

if [[ ! "$RESP" =~ ^[Yy]$ ]]; then
  echo "Aborted by user."
  exit 0
fi

# 4. Install dependencies
echo "==> Installing dependencies (npm install)"
npm install

# 5. Run tests
echo "==> Running tests (npm test)"
npm test

# 6. Build the project
echo "==> Building project (npm run build)"
npm run build

# 7. Inspect package contents
echo "==> Inspecting package contents (npm pack --dry-run)"
npm pack --dry-run

echo "==> If the above file list looks correct, publishing..."

# 8. Publish to npm (scoped package, public access)
npm publish --access public

echo "==> Publish complete: $PKG_NAME@$PKG_VERSION"
