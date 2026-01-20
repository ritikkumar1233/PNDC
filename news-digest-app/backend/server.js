const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const digestRoutes = require('./routes/digestRoutes');

const { startFetchNewsJob } = require('./cron/fetchNewsJob');
const { startSendDigestJob } = require('./cron/sendDigestJob');

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Routes
app.use('/', authRoutes);
app.use('/news', newsRoutes);
app.use('/digest', digestRoutes);

// Root health endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Personalized News Digest API is running' });
});

// Mongo connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/news_digest_app';

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');

    // Start cron jobs after DB connection
    startFetchNewsJob();
    startSendDigestJob();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
  });

