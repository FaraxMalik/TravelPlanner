const { generateItinerary } = require('../utils/geminiService');

// @desc    Generate itinerary using LLM
// @route   POST /api/llm/itinerary
// @access  Private
async function generateItineraryFromLLM(req, res) {
  try {
    const { prompt, options } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'Prompt is required and must be a string.' });
    }
    const itinerary = await generateItinerary(prompt, options);
    res.json({ itinerary });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to generate itinerary.' });
  }
}

module.exports = { generateItineraryFromLLM }; 