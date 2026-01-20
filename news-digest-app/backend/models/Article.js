const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String },
    category: { type: String },
    source: { type: String },
    url: { type: String },
    publishedAt: { type: Date },
    summary: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

module.exports = mongoose.model('Article', ArticleSchema);
module.exports.ArticleSchema = ArticleSchema;

