const express = require('express');
const Article = require('../models/Article');
const { fetchAndStoreLatestNews } = require('../services/newsService');

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

// GET /news/all - get stored news
router.get('/all', async (req, res) => {
  try {
    const articles = await Article.find({})
      .sort({ publishedAt: -1 })
      .limit(100);
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get news' });
  }
});

module.exports = router;

