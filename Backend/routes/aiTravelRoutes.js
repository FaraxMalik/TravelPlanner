const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const aiTravelController = require('../controllers/aiTravelController');

// AI Travel Planning Routes
router.post('/generate-plan', protect, aiTravelController.generatePersonalizedPlan);
router.post('/generate-enhanced-plan', protect, aiTravelController.generateEnhancedPlan);
router.get('/personality', protect, aiTravelController.getUserPersonality);

// Testing Routes (for development)
router.post('/test-personality', protect, aiTravelController.testPersonalityPrediction);
router.post('/test-gemini', protect, aiTravelController.testGeminiGeneration);

module.exports = router; 