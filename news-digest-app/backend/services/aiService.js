const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function summarizeArticle(content) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, skipping summarization');
    return null;
  }

  const prompt = `Summarize this news in 3 clear bullet points.\n\n${content}`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  return completion.choices[0].message.content.trim();
}

async function summarizeDigest(articles) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, skipping digest summarization');
    return null;
  }

  const combined = articles
    .map((a, idx) => `${idx + 1}. ${a.title}\n${a.summary || a.content || ''}`)
    .join('\n\n');

  const prompt = `You are creating a daily personalized news digest.\nSummarize the following news items in a concise friendly paragraph followed by 3–5 bullet points highlighting key themes.\n\n${combined}`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
  });

  return completion.choices[0].message.content.trim();
}

module.exports = {
  summarizeArticle,
  summarizeDigest,
};

