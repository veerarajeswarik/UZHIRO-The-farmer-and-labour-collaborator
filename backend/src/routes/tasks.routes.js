const express = require('express');
const {
  createTask,
  listTasks,
  updateTask,
  completeTask,
  deleteTask,
  generateFromCrop,
} = require('../controllers/task.controller');
const { createValidators, updateValidators, generateFromCropValidators } = require('../validators/task.validators');
const { handleValidation } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('farmer'));

router.post('/generate-from-crop', generateFromCropValidators, handleValidation, generateFromCrop);
router.post('/', createValidators, handleValidation, createTask);
router.get('/', listTasks);
router.put('/:id/complete', completeTask);
router.put('/:id', updateValidators, handleValidation, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
