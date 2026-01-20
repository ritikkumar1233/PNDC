const { GoogleGenerativeAI } = require('@google/generative-ai');

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

function normalizeAi429(err, providerName) {
  const status = err?.status || err?.statusCode;
  if (status === 429) {
    const e = new Error(
      `${providerName} quota/rate limit exceeded (429). Check your billing/quota and try again.`
    );
    e.statusCode = 429;
    throw e;
  }
  throw err;
}

async function generateWithGemini({ prompt, temperature = 0.3 }) {
  const genAI = getGeminiClient();
  if (!genAI) return null;

  // Default to a supported Google Generative AI model. Override with GEMINI_MODEL if needed.
  // 'gemini-1.5-flash' is not available for v1beta generateContent (caused 404). Use text-bison as a safe default.
  const modelName = process.env.GEMINI_MODEL || 'models/text-bison-001';
  const model = genAI.getGenerativeModel({ model: modelName });

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature },
    });
    const text = result?.response?.text?.();
    return text ? text.trim() : null;
  } catch (err) {
    normalizeAi429(err, 'Gemini');
  }
}


async function summarizeArticle(content) {
  const prompt = `Summarize the following news in 5 detailed bullet points.
Each point should be 1–2 full sentences explaining the idea clearly.
Avoid very short phrases or one-liners.

News:
${content}`;

  // Prefer Gemini if configured, otherwise fallback to OpenAI.
  const geminiText = await generateWithGemini({ prompt, temperature: 0.3 });
  if (geminiText) return geminiText;

  console.warn(
    'No AI provider configured (set GEMINI_API_KEY), skipping summarization'
  );
  return null;
}

async function summarizeDigest(articles) {
  const combined = articles
    .map((a, idx) => `${idx + 1}. ${a.title}\n${a.summary || a.content || ''}`)
    .join('\n\n');

  const prompt = `You are creating a daily personalized news digest.\nSummarize the following news items in a concise friendly paragraph followed by 3–5 bullet points highlighting key themes.\n\n${combined}`;

  const geminiText = await generateWithGemini({ prompt, temperature: 0.4 });
  if (geminiText) return geminiText;


  console.warn(
    'No AI provider configured (set GEMINI_API_KEY), skipping digest summarization'
  );
  return null;
}

module.exports = {
  summarizeArticle,
  summarizeDigest,
};

