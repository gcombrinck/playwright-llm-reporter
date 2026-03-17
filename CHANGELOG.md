# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-17

### Added
- ✨ **Initial Release**
- 📊 Interactive HTML reporting with embedded charts (status, duration, per-project)
- 🔍 Filterable and sortable test results table
- 🚨 Error previews with full stack trace details on hover
- 📎 Automatic artifact management (screenshots, videos, traces)
- 🤖 Optional LLM integration with OpenAI API (gpt-4o-mini)
- 💻 Express.js LLM server for analyzing test results
- 🎨 Dark theme with glassmorphic UI design
- 📱 Responsive design for all screen sizes
- 🔐 Single-file HTML report (no external assets, works with `file://`)
- 🧹 Automatic artifact copying with sanitized filenames
- ⚡ TypeScript first with full type support
- 📦 npm package ready for distribution
- 🔌 Pluggable architecture for extending LLM analysis
- 🛡️ Input sanitization to prevent HTML injection
- 🔄 Support for multiple browser projects (Chromium, WebKit, Firefox)

### Features

#### Reporter Capabilities
- Implements Playwright's Reporter interface
- Captures test results, metadata, and attachments
- Single-file embedded HTML output
- Data sanitization and safe escaping
- Customizable output directory and title

#### UI Components
- Status breakdown chart (pie chart)
- Duration distribution chart (bar chart)
- Per-project test metrics
- Searchable test table with sorting
- Multi-filter support (status, project, duration range)
- Error detail modal with stack traces
- Test metadata display (file, project, duration)

#### Artifact Management
- Copies artifacts from Playwright test-results to report folder
- Sanitizes filenames to remove unsafe characters
- Maintains sequential numbering for artifact organization
- Works with `file://` protocol (no web server required)
- Supports screenshots, videos, and trace files

#### LLM Integration
- Express.js HTTP server for LLM requests
- OpenAI API integration (configurable model, defaults to gpt-4o-mini)
- Request truncation to first 80 tests (token optimization)
- Graceful fallback when API key is missing
- Custom LLM support via proxy server

### Documentation
- Comprehensive README.md with quick start guide
- INTEGRATION.md for adding to existing projects
- PUBLISHING.md for npm package maintenance
- AGENTS.md for developer guidelines and architecture
- LICENSE file (MIT)
- `.npmignore` for package distribution
- CHANGELOG.md (this file)

### Configuration
- Customizable `outputDir` for report location
- Customizable `title` for report header
- Customizable `port` for LLM server
- Full integration with Playwright config

### Browser Support
- Chromium
- WebKit
- Firefox (configurable in projects)

### TypeScript
- Strict mode enabled
- Full type definitions
- ESNext compilation target
- CommonJS module format

---

## Future Enhancements (Roadmap)

- [ ] Support for multiple LLM providers (Anthropic, Hugging Face, etc.)
- [ ] Real-time report updates via WebSocket
- [ ] Report trending (historical comparisons)
- [ ] Team collaboration features
- [ ] Custom test categorization and tags
- [ ] Performance regression detection
- [ ] Integration with CI/CD platforms (GitHub Actions, GitLab CI, Jenkins)
- [ ] Docker image for LLM server
- [ ] Web dashboard for report hosting
- [ ] Multi-language support

---

## Notes

- Version 1.0.0 marks the initial stable release
- All major features are production-ready
- Breaking changes will trigger major version bumps
- Features and bug fixes will be documented in future releases

