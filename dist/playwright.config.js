"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    testDir: './tests',
    use: {
        // These generate attachments that the reporter links to.
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
    },
    reporter: [
        ['./reporters/llm-html-reporter.ts', {
                outputDir: 'playwright-llm-report',
                title: 'Playwright LLM Report'
            }]
    ],
    projects: [{
            name: 'chromium',
            use: {
                browserName: 'chromium',
            },
        },
        {
            name: 'webkit',
            use: {
                browserName: 'webkit',
            },
        }],
};
exports.default = config;
