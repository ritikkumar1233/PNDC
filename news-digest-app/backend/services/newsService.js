const axios = require('axios');
const Article = require('../models/Article');
const { summarizeArticle } = require('./aiService');

async function fetchFromNewsAPI() {
  if (!process.env.NEWS_API_KEY) {
    console.warn('NEWS_API_KEY not set, skipping external fetch');
    return [];
  }

  const url = 'https://newsapi.org/v2/top-headlines';

  const params = {
    language: 'en',
    pageSize: 20,
  };

  const response = await axios.get(url, {
    params,
    headers: {
      'X-Api-Key': process.env.NEWS_API_KEY,
    },
  });

  return response.data.articles || [];
}

function inferCategory(article) {
  // very simple category inference; in real life you’d tune this
  const title = (article.title || '').toLowerCase();
  if (title.includes('ai') || title.includes('machine learning')) return 'AI';
  if (title.includes('javascript') || title.includes('react')) return 'Web Development';
  if (title.includes('finance') || title.includes('stock')) return 'Finance';
  if (title.includes('health') || title.includes('covid')) return 'Health';
  return 'General';
}

async function fetchAndStoreLatestNews() {
  const externalArticles = await fetchFromNewsAPI();
  let storedCount = 0;

  for (const a of externalArticles) {
    const exists = await Article.findOne({ url: a.url });
    if (exists) continue;

    const combinedContent =
      a.content || a.description || `${a.title || ''} - ${a.description || ''}`;

    let summary = null;
    try {
      summary = await summarizeArticle(combinedContent);
    } catch (err) {
      console.error('Error summarizing article', err.message);
    }

    const category = inferCategory(a);

    await Article.create({
      title: a.title,
      content: combinedContent,
      category,
      source: a.source?.name || 'Unknown',
      url: a.url,
      publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date(),
      summary,
    });

    storedCount += 1;
  }

  return { fetchedCount: externalArticles.length, storedCount };
}

module.exports = {
  fetchAndStoreLatestNews,
};

