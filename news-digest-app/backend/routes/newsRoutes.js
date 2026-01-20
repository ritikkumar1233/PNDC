const express = require('express');
const {
  fetchAndStoreLatestNews,
  getPaginatedNews,
  summarizeArticleById,
} = require('../services/newsService');

const router = express.Router();

// GET /news/fetch - manual trigger for fetching news
router.get('/fetch', async (req, res) => {
  try {
    const result = await fetchAndStoreLatestNews();
    res.json({
      message: 'News fetched successfully',
      fetchedCount: result.fetchedCount,
      storedCount: result.storedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
});

// GET /news/all?page=&limit=&preference= - get stored news with pagination and optional filtering
router.get('/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const preference = req.query.preference || '';

    const result = await getPaginatedNews({ page, limit, preference });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get news' });
  }
});

// POST /news/summarize - trigger re-summarization of a single article
router.post('/summarize', async (req, res) => {
  try {
    const { articleId } = req.body;
    if (!articleId) {
      return res.status(400).json({ message: 'articleId is required' });
    }

    const updated = await summarizeArticleById(articleId);
    res.json(updated);
  } catch (err) {
    console.error(err);
    if (err.statusCode === 429 || err.status === 429) {
      return res.status(429).json({
        message:
          'AI quota/rate limit exceeded. Please add billing/credits or set a working GEMINI_API_KEY/OPENAI_API_KEY.',
      });
    }
    if (err.statusCode === 404) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to summarize article' });
  }
});

module.exports = router;

