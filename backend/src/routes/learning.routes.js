const express = require('express');
const { listArticles, getArticleById } = require('../controllers/learning.controller');

const router = express.Router();

router.get('/', listArticles);
router.get('/:id', getArticleById);

module.exports = router;
