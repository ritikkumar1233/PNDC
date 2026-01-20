const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function formatDigestEmail(user, digest) {
  const articlesByCategory = {};
  digest.articles.forEach((a) => {
    const cat = a.category || 'General';
    if (!articlesByCategory[cat]) articlesByCategory[cat] = [];
    articlesByCategory[cat].push(a);
  });

  let body = `Hi ${user.name},\nHere is your news digest for today:\n\n`;

  Object.entries(articlesByCategory).forEach(([category, articles]) => {
    body += `🔹 ${category}\n`;
    articles.forEach((a) => {
      body += `- ${a.title}\n`;
    });
    body += '\n';
  });

  body += 'Stay informed!\n— News Digest AI';

  return body;
}

async function sendDailyDigestEmail(user, digest) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not set, skipping email send');
    return;
  }

  const text = formatDigestEmail(user, digest);

  const msg = {
    to: user.email,
    from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@news-digest-app.com',
    subject: 'Your Daily Personalized News Digest',
    text,
  };

  await sgMail.send(msg);
}

module.exports = {
  sendDailyDigestEmail,
};

