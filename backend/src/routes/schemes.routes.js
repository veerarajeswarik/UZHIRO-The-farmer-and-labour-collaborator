const express = require('express');
const { listSchemes, getSchemeById } = require('../controllers/scheme.controller');

const router = express.Router();

router.get('/', listSchemes);
router.get('/:id', getSchemeById);

module.exports = router;
