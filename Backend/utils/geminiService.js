const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a travel itinerary using Gemini LLM
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} - The generated itinerary text
 */
async function generateItinerary(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error.message || error);
    throw new Error('Failed to generate itinerary from Gemini');
  }
}

module.exports = { generateItinerary }; 