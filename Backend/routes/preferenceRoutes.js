const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getPreferenceQuestions,
  submitPreferences,
  getUserPreferences
} = require('../controllers/preferenceController');

// Public routes
router.get('/questions', getPreferenceQuestions);

// Protected routes
router.post('/submit', protect, submitPreferences);
router.get('/user', protect, getUserPreferences);

module.exports = router; 