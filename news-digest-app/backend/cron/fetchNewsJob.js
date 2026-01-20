const cron = require('node-cron');
const { fetchAndStoreLatestNews } = require('../services/newsService');

function startFetchNewsJob() {
  // Every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Fetching latest news...');
    try {
      const result = await fetchAndStoreLatestNews();
      console.log(
        `[CRON] Fetched ${result.fetchedCount}, stored ${result.storedCount} articles`
      );
    } catch (err) {
      console.error('[CRON] Error fetching news', err);
    }
  });
}

module.exports = {
  startFetchNewsJob,
};

