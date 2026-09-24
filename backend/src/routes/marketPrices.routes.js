const express = require('express');
const { getPriceByCropName, getPriceByCropId } = require('../controllers/marketPrice.controller');

const router = express.Router();

router.get('/', getPriceByCropName);
router.get('/:cropId', getPriceByCropId);

module.exports = router;
