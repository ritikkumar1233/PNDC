const mongoose = require('mongoose');
const { ArticleSchema } = require('./Article');

const DigestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  articles: [ArticleSchema],
  summaryText: { type: String },
});

module.exports = mongoose.model('Digest', DigestSchema);

