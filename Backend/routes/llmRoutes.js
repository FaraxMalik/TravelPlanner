const express = require('express');
const router = express.Router();
const { generateItineraryFromLLM } = require('../controllers/llmController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/itinerary', protect, generateItineraryFromLLM);

module.exports = router; 