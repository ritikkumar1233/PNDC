const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function mapCategoryDisplayName(category) {
  if (!category) return 'General';
  const lower = category.toLowerCase();
  if (lower.includes('ai') || lower.includes('tech')) return 'AI & Technology';
  if (lower.includes('web')) return 'Web Development';
  if (lower.includes('startup')) return 'Startups';
  return category;
}

function formatDigestEmail(user, digest) {
  const articlesByCategory = {};
  digest.articles.forEach((a) => {
    const catKey = a.category || 'General';
    if (!articlesByCategory[catKey]) articlesByCategory[catKey] = [];
    articlesByCategory[catKey].push(a);
  });

  const today = new Date(digest.date || Date.now());
  const formattedDate = today.toLocaleDateString();
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;

  let body = `Hi ${user.name},\n\nHere’s your curated news digest based on your interests:\n\n`;

  Object.entries(articlesByCategory).forEach(([categoryKey, articles]) => {
    const displayName = mapCategoryDisplayName(categoryKey);
    body += `🔹 ${displayName}  \n`;
    articles.forEach((a) => {
      // Use first lines of the summary if available, otherwise the title
      if (a.summary) {
        const lines = a.summary.split('\n').filter((l) => l.trim().length > 0);
        const firstTwo = lines.slice(0, 2);
        firstTwo.forEach((line) => {
          body += `• ${line.replace(/^[•\-]\s*/, '')}  \n`;
        });
      } else {
        body += `• ${a.title}  \n`;
      }
    });
    body += '\n';
  });

  body += `View all articles in your dashboard:\n${dashboardUrl}\n\n`;
  body += 'Stay informed!  \n— Your AI News Assistant';

  return { body, formattedDate };
}

async function sendDailyDigestEmail(user, digest) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not set, skipping email send');
    return;
  }

  const { body, formattedDate } = formatDigestEmail(user, digest);
  const subject = `Your Personalized News Digest — ${formattedDate}`;

  const msg = {
    to: user.email,
    from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@news-digest-app.com',
    subject,
    text: body,
  };

  await sgMail.send(msg);
}

module.exports = {
  sendDailyDigestEmail,
};

