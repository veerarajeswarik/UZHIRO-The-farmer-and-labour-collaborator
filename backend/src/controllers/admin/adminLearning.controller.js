const asyncHandler = require('express-async-handler');
const LearningArticle = require('../../models/LearningArticle');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const ALLOWED_FIELDS = ['title', 'category', 'summary', 'content', 'source'];

function pickFields(body) {
  const out = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

// GET /api/admin/learning - includes full content, unlike the public list.
const listArticles = asyncHandler(async (req, res) => {
  const articles = await LearningArticle.find().sort({ category: 1, title: 1 });
  sendSuccess(res, 200, { articles, count: articles.length });
});

// POST /api/admin/learning
const createArticle = asyncHandler(async (req, res) => {
  const fields = pickFields(req.body);
  const article = await LearningArticle.create({
    ...fields,
    source: fields.source || 'Written by UZHIRO admin.',
  });
  sendSuccess(res, 201, { article });
});

// PUT /api/admin/learning/:id
const updateArticle = asyncHandler(async (req, res) => {
  const article = await LearningArticle.findByIdAndUpdate(
    req.params.id,
    { $set: pickFields(req.body) },
    { new: true, runValidators: true }
  );
  if (!article) return sendError(res, 404, 'Article not found.');
  sendSuccess(res, 200, { article });
});

// DELETE /api/admin/learning/:id
const deleteArticle = asyncHandler(async (req, res) => {
  const article = await LearningArticle.findByIdAndDelete(req.params.id);
  if (!article) return sendError(res, 404, 'Article not found.');
  sendSuccess(res, 200, { deleted: true });
});

module.exports = { listArticles, createArticle, updateArticle, deleteArticle };
