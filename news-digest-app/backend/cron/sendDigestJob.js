const cron = require('node-cron');
const User = require('../models/User');
const Article = require('../models/Article');
const Digest = require('../models/Digest');
const { summarizeDigest } = require('../services/aiService');
const { sendDailyDigestEmail } = require('../services/emailService');

function startSendDigestJob() {
  // At 20:00 (8 PM) server time every day
  cron.schedule('0 20 * * *', async () => {
    console.log('[CRON] Generating and sending daily digests...');
    try {
      const users = await User.find({});
      const now = new Date();

      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      );

      const articlesToday = await Article.find({
        publishedAt: { $gte: startOfDay, $lte: now },
      });

      for (const user of users) {
        if (!user.interests || user.interests.length === 0) {
          continue;
        }

        const matchingArticles = articlesToday.filter((a) =>
          user.interests.includes(a.category)
        );

        if (matchingArticles.length === 0) continue;

        let summaryText = null;
        try {
          summaryText = await summarizeDigest(matchingArticles);
        } catch (err) {
          console.error(
            `[CRON] Error summarizing digest for user ${user.email}`,
            err
          );
        }

        const digest = await Digest.create({
          userId: user._id,
          date: now,
          articles: matchingArticles,
          summaryText,
        });

        try {
          await sendDailyDigestEmail(user, digest);
          console.log(`[CRON] Sent digest to ${user.email}`);
        } catch (err) {
          console.error(
            `[CRON] Error sending digest email to ${user.email}`,
            err
          );
        }
      }
    } catch (err) {
      console.error('[CRON] Error in daily digest job', err);
    }
  });
}

module.exports = {
  startSendDigestJob,
};

