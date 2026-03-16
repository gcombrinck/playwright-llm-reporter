"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const openai_1 = __importDefault(require("openai"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey
    ? new openai_1.default({ apiKey })
    : null;
app.post('/llm/analyze', async (req, res) => {
    const { question, tests } = req.body || {};
    try {
        if (!client) {
            return res.status(200).json({
                answer: 'LLM is not configured (missing OPENAI_API_KEY). The report graphs and test data still work without it.'
            });
        }
        const summary = JSON.stringify((tests || []).map((t) => ({
            title: t.title,
            status: t.status,
            durationMs: t.duration,
            file: t.file
        })).slice(0, 80), null, 2);
        const prompt = `
You are a test analytics assistant.
You see Playwright test results as JSON and a user question.

User question:
${question}

Tests (truncated):
${summary}

Please answer succinctly with concrete insights: highlight top failing files, flaky patterns, and suggested improvements.
`;
        const completion = await client.responses.create({
            model: 'gpt-4.1-mini',
            input: prompt
        });
        const answer = completion.output[0].content[0].text;
        res.json({ answer });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || String(err) });
    }
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`LLM server listening on http://localhost:${port}`);
});
