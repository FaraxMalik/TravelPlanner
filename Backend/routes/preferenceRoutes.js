const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getPreferenceQuestions,
  submitPreferences,
  getPreferenceAnalysis,
  getTravelPersonality
} = require('../controllers/preferenceController');

// Public routes
router.get('/questions', getPreferenceQuestions);

// Protected routes
router.post('/submit', protect, submitPreferences);
router.get('/analysis', protect, getPreferenceAnalysis);
router.get('/personality', protect, getTravelPersonality);

module.exports = router; 