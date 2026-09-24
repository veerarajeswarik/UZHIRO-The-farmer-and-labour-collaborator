const asyncHandler = require('express-async-handler');
const LearningArticle = require('../models/LearningArticle');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { escapeRegex } = require('../utils/regex');

// GET /api/learning?category=&q= (public)
const listArticles = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.q) {
    const re = new RegExp(escapeRegex(req.query.q.trim()), 'i');
    filter.$or = [{ title: re }, { summary: re }];
  }

  const articles = await LearningArticle.find(filter).select('-content').sort({ category: 1, title: 1 });
  sendSuccess(res, 200, { articles, count: articles.length });
});

// GET /api/learning/:id (public)
const getArticleById = asyncHandler(async (req, res) => {
  const article = await LearningArticle.findById(req.params.id).catch(() => null);
  if (!article) return sendError(res, 404, 'Article not found.');
  sendSuccess(res, 200, { article });
});

module.exports = { listArticles, getArticleById };
