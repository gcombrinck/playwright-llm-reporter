import express, { Request, Response } from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey
  ? new OpenAI({ apiKey })
  : null;

app.post('/llm/analyze', async (req: Request, res: Response) => {
  const { question, tests } = req.body || {};

  try {
    if (!client) {
      return res.status(200).json({
        answer:
          'LLM is not configured (missing OPENAI_API_KEY). The report graphs and test data still work without it.'
      });
    }

    const summary = JSON.stringify(
      (tests || []).map((t: any) => ({
        title: t.title,
        status: t.status,
        durationMs: t.duration,
        file: t.file
      })).slice(0, 80),
      null,
      2
    );

    const prompt = `
You are a test analytics assistant.
You see Playwright test results as JSON and a user question.

User question:
${question}

Tests (truncated):
${summary}

Please answer succinctly with concrete insights: highlight top failing files, flaky patterns, and suggested improvements.
`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const answer = completion.choices[0]?.message?.content ?? '';
    res.json({ answer });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LLM server listening on http://localhost:${port}`);
});
