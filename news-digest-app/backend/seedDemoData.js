const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Article = require('./models/Article');
const Digest = require('./models/Digest');

async function seed() {
  const MONGODB_URI =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/news_digest_app';

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await Digest.deleteMany({});
  await Article.deleteMany({});
  await User.deleteMany({});

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  const user = await User.create({
    name: 'Ritik',
    email: 'ritik@example.com',
    password: hashedPassword,
    interests: ['AI', 'Web Development'],
  });

  const articles = await Article.insertMany([
    {
      title: 'New AI model launched with improved reasoning',
      content:
        'A new AI model has been released featuring improved reasoning and efficiency. Experts expect broad adoption across industries.',
      category: 'AI',
      source: 'DemoSource',
      url: 'https://example.com/ai-model',
      publishedAt: new Date(),
      summary: '- Improved reasoning\n- Better efficiency\n- Expected wide adoption',
    },
    {
      title: 'React update released with performance improvements',
      content:
        'The React team released an update focused on performance and developer experience, including new tooling improvements.',
      category: 'Web Development',
      source: 'DemoSource',
      url: 'https://example.com/react-update',
      publishedAt: new Date(),
      summary:
        '- Performance improvements\n- Better DX\n- Tooling updates included',
    },
    {
      title: 'Finance markets rally amid economic optimism',
      content:
        'Stocks rallied today as investors reacted to optimistic economic indicators and positive earnings reports.',
      category: 'Finance',
      source: 'DemoSource',
      url: 'https://example.com/finance-rally',
      publishedAt: new Date(),
      summary: '- Markets rallied\n- Optimistic indicators\n- Strong earnings',
    },
    {
      title: 'Healthcare breakthrough improves early detection',
      content:
        'Researchers reported a breakthrough method that improves early detection rates and reduces false positives.',
      category: 'Health',
      source: 'DemoSource',
      url: 'https://example.com/health-breakthrough',
      publishedAt: new Date(),
      summary:
        '- Better early detection\n- Fewer false positives\n- Promising results',
    },
    {
      title: 'General tech news: new device announced',
      content:
        'A major tech company announced a new device with incremental upgrades and a refreshed design.',
      category: 'General',
      source: 'DemoSource',
      url: 'https://example.com/device-announced',
      publishedAt: new Date(),
      summary: '- New device\n- Incremental upgrades\n- Refreshed design',
    },
  ]);

  const digest = await Digest.create({
    userId: user._id,
    date: new Date(),
    articles: articles.filter((a) => ['AI', 'Web Development'].includes(a.category)),
    summaryText:
      'Today you have two key updates: one in AI and one in web development.\n\n- AI: New model improves reasoning and efficiency\n- Web: React update boosts performance and DX',
  });

  console.log('Seed complete');
  console.log('User:', { email: user.email, password: 'Password@123' });
  console.log('Digest id:', digest._id.toString());

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

