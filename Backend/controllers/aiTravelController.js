const BigFiveService = require('../utils/bigFiveService');
const GeminiTravelService = require('../utils/geminiTravelService');
const User = require('../models/user');
const { exec } = require('child_process');
const path = require('path');

class AITravelController {
    constructor() {
        this.bigFiveService = new BigFiveService();
        this.geminiService = new GeminiTravelService();
        
        // Bind methods to preserve 'this' context
        this.generatePersonalizedPlan = this.generatePersonalizedPlan.bind(this);
        this.generateEnhancedPlan = this.generateEnhancedPlan.bind(this);
        this.getUserPersonality = this.getUserPersonality.bind(this);
        this.testPersonalityPrediction = this.testPersonalityPrediction.bind(this);
        this.testGeminiGeneration = this.testGeminiGeneration.bind(this);
    }

    /**
     * Generate personalized travel plan using AI
     * @route POST /api/ai/generate-plan
     * @access Private
     */
    async generatePersonalizedPlan(req, res) {
        try {
            const {
                destination,
                startDate,
                endDate,
                budget,
                interests = []
            } = req.body;

            // Validate required fields
            if (!destination || !startDate || !endDate || !budget) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: destination, startDate, endDate, budget'
                });
            }

            // Get user and their preferences
            const user = await User.findById(req.user._id);
            if (!user || !user.preferences) {
                return res.status(400).json({
                    success: false,
                    message: 'User preferences not found. Please complete the preference questionnaire first.'
                });
            }

            // Step 1: Predict Big Five personality
            console.log('🔮 Predicting Big Five personality...');
            const bigFiveResult = await this.bigFiveService.predictBigFivePersonality(user.preferences);
            
            if (!bigFiveResult.success) {
                console.log('⚠️ Using fallback personality analysis');
            }

            // Step 2: Generate personality-based recommendations
            const personalityRecommendations = this.bigFiveService.generatePersonalityRecommendations(
                bigFiveResult.success ? bigFiveResult : bigFiveResult.fallback
            );

            // Step 3: Generate AI-powered travel plan
            console.log('🤖 Generating personalized travel plan with Gemini...');
            const travelPlanParams = {
                destination,
                startDate,
                endDate,
                budget: parseInt(budget),
                bigFiveScores: bigFiveResult.success ? bigFiveResult.bigFiveScores : bigFiveResult.fallback.big_five_scores,
                dominantTrait: bigFiveResult.success ? bigFiveResult.dominantTrait : bigFiveResult.fallback.dominant_trait,
                personalityDescriptions: bigFiveResult.success ? bigFiveResult.descriptions : bigFiveResult.fallback.descriptions,
                userPreferences: user.preferences,
                interests: interests.length > 0 ? interests : user.preferences.interests || []
            };

            const geminiResult = await this.geminiService.generatePersonalizedTravelPlan(travelPlanParams);

            // Step 4: Prepare comprehensive response
            const response = {
                success: true,
                destination,
                dates: { start: startDate, end: endDate },
                budget: parseInt(budget),
                personality: {
                    dominantTrait: travelPlanParams.dominantTrait,
                    bigFiveScores: travelPlanParams.bigFiveScores,
                    confidence: bigFiveResult.success ? bigFiveResult.confidenceScores : null,
                    analysis: bigFiveResult.success ? bigFiveResult.descriptions : bigFiveResult.fallback.descriptions
                },
                recommendations: personalityRecommendations,
                travelPlan: geminiResult.success ? geminiResult.travelPlan : geminiResult.fallback,
                aiStatus: {
                    bigFivePrediction: bigFiveResult.success ? 'success' : 'fallback',
                    geminiGeneration: geminiResult.success ? 'success' : 'fallback'
                }
            };

            res.json(response);

        } catch (error) {
            console.error('AI travel plan generation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate personalized travel plan',
                error: error.message
            });
        }
    }

    /**
     * Generate enhanced personalized travel plan with weather data
     * @route POST /api/ai/generate-enhanced-plan
     * @access Private
     */
    async generateEnhancedPlan(req, res) {
        try {
            const {
                destination,
                startDate,
                endDate,
                dailyBudget,
                additionalPreferences = ''
            } = req.body;

            // Validate required fields
            if (!destination || !startDate || !endDate || !dailyBudget) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: destination, startDate, endDate, dailyBudget'
                });
            }

            // Get user and their preferences
            const user = await User.findById(req.user._id);
            if (!user || !user.preferences) {
                return res.status(400).json({
                    success: false,
                    message: 'User preferences not found. Please complete the preference questionnaire first.'
                });
            }

            // Calculate duration
            const start = new Date(startDate);
            const end = new Date(endDate);
            const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            if (duration <= 0 || duration > 30) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid duration. Must be between 1 and 30 days.'
                });
            }

            // Format travel dates
            const travelDates = `${startDate} to ${endDate}`;

            // Call the enhanced Python integration
            const pythonScript = path.join(__dirname, '../ml_models/backend_integration_enhanced.py');
            const command = `python "${pythonScript}" '${JSON.stringify(user.preferences)}' "${destination}" "${travelDates}" ${duration} ${dailyBudget} "${additionalPreferences}"`;

            console.log('🚀 Calling enhanced Python integration...');
            
            const result = await new Promise((resolve, reject) => {
                exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Python execution error:', error);
                        reject(error);
                        return;
                    }
                    
                    if (stderr) {
                        console.error('Python stderr:', stderr);
                    }
                    
                    try {
                        const output = JSON.parse(stdout);
                        resolve(output);
                    } catch (parseError) {
                        console.error('Failed to parse Python output:', stdout);
                        reject(new Error('Failed to parse Python response'));
                    }
                });
            });

            if (result.success) {
                res.json({
                    success: true,
                    destination: result.destination,
                    dates: { start: startDate, end: endDate },
                    duration: result.duration,
                    dailyBudget: result.daily_budget,
                    totalBudget: result.total_budget,
                    personalityAnalysis: result.personality_analysis,
                    weatherForecast: result.weather_forecast,
                    detailedItinerary: result.detailed_itinerary,
                    generatedAt: result.generated_at,
                    enhancedFeatures: ['personality_analysis', 'weather_integration', 'detailed_scheduling', 'budget_breakdown']
                });
            } else {
                throw new Error(result.error || 'Failed to generate enhanced itinerary');
            }

        } catch (error) {
            console.error('Enhanced AI travel plan generation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate enhanced personalized travel plan',
                error: error.message
            });
        }
    }

    /**
     * Get user's personality analysis
     * @route GET /api/ai/personality
     * @access Private
     */
    async getUserPersonality(req, res) {
        try {
            const user = await User.findById(req.user._id);
            if (!user || !user.preferences) {
                return res.status(400).json({
                    success: false,
                    message: 'User preferences not found. Please complete the preference questionnaire first.'
                });
            }

            // Predict Big Five personality
            const bigFiveResult = await this.bigFiveService.predictBigFivePersonality(user.preferences);
            
            // Generate personality-based recommendations
            const personalityRecommendations = this.bigFiveService.generatePersonalityRecommendations(
                bigFiveResult.success ? bigFiveResult : bigFiveResult.fallback
            );

            res.json({
                success: true,
                personality: {
                    dominantTrait: bigFiveResult.success ? bigFiveResult.dominantTrait : bigFiveResult.fallback.dominant_trait,
                    bigFiveScores: bigFiveResult.success ? bigFiveResult.bigFiveScores : bigFiveResult.fallback.big_five_scores,
                    confidence: bigFiveResult.success ? bigFiveResult.confidenceScores : null,
                    analysis: bigFiveResult.success ? bigFiveResult.descriptions : bigFiveResult.fallback.descriptions
                },
                recommendations: personalityRecommendations,
                userPreferences: user.preferences,
                aiStatus: {
                    prediction: bigFiveResult.success ? 'success' : 'fallback'
                }
            });

        } catch (error) {
            console.error('Personality analysis error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to analyze personality',
                error: error.message
            });
        }
    }

    /**
     * Test Big Five prediction with sample data
     * @route POST /api/ai/test-personality
     * @access Private
     */
    async testPersonalityPrediction(req, res) {
        try {
            const { testResponses } = req.body;

            if (!testResponses || testResponses.length !== 12) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide 12 test responses (0-3 values)'
                });
            }

            // Convert array to preference object
            const preferenceFields = [
                'morningRoutine', 'placePreference', 'travelPace', 'snackVibe',
                'backupPlan', 'souvenirType', 'photoStyle', 'musicTaste',
                'spontaneity', 'packingStyle', 'groupRole', 'memorableElement'
            ];

            const testPreferences = {};
            preferenceFields.forEach((field, index) => {
                testPreferences[field] = testResponses[index];
            });

            // Test Big Five prediction
            console.log('Testing BigFiveService...');
            console.log('this.bigFiveService exists:', !!this.bigFiveService);
            
            const bigFiveResult = await this.bigFiveService.predictBigFivePersonality(testPreferences);
            
            // Generate recommendations
            const personalityRecommendations = this.bigFiveService.generatePersonalityRecommendations(
                bigFiveResult.success ? bigFiveResult : bigFiveResult.fallback
            );

            res.json({
                success: true,
                testResponses,
                personality: {
                    dominantTrait: bigFiveResult.success ? bigFiveResult.dominantTrait : bigFiveResult.fallback.dominant_trait,
                    bigFiveScores: bigFiveResult.success ? bigFiveResult.bigFiveScores : bigFiveResult.fallback.big_five_scores,
                    confidence: bigFiveResult.success ? bigFiveResult.confidenceScores : null,
                    analysis: bigFiveResult.success ? bigFiveResult.descriptions : bigFiveResult.fallback.descriptions
                },
                recommendations: personalityRecommendations,
                aiStatus: {
                    prediction: bigFiveResult.success ? 'success' : 'fallback'
                }
            });

        } catch (error) {
            console.error('Test personality prediction error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to test personality prediction',
                error: error.message
            });
        }
    }

    /**
     * Test Gemini travel plan generation
     * @route POST /api/ai/test-gemini
     * @access Private
     */
    async testGeminiGeneration(req, res) {
        try {
            const {
                destination = 'Tokyo, Japan',
                startDate = '2024-03-15',
                endDate = '2024-03-20',
                budget = 3000,
                testResponses = [2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1]
            } = req.body;

            // Convert test responses to preferences
            const preferenceFields = [
                'morningRoutine', 'placePreference', 'travelPace', 'snackVibe',
                'backupPlan', 'souvenirType', 'photoStyle', 'musicTaste',
                'spontaneity', 'packingStyle', 'groupRole', 'memorableElement'
            ];

            const testPreferences = {};
            preferenceFields.forEach((field, index) => {
                testPreferences[field] = testResponses[index];
            });

            // Mock Big Five results for testing
            const mockBigFiveResult = {
                big_five_scores: {
                    Openness: 65,
                    Conscientiousness: 45,
                    Extraversion: 70,
                    Agreeableness: 60,
                    Neuroticism: 30
                },
                dominant_trait: 'Extraversion',
                descriptions: {
                    Openness: {
                        description: 'Creative, curious, adventurous travelers',
                        travel_preferences: 'Cultural sites, off-beaten-path adventures'
                    },
                    Conscientiousness: {
                        description: 'Organized, planned, detail-oriented travelers',
                        travel_preferences: 'Luxury accommodations, detailed itineraries'
                    },
                    Extraversion: {
                        description: 'Social, energetic, outgoing travelers',
                        travel_preferences: 'Group activities, nightlife, social experiences'
                    },
                    Agreeableness: {
                        description: 'Cooperative, trusting, compassionate travelers',
                        travel_preferences: 'Peaceful destinations, local authenticity'
                    },
                    Neuroticism: {
                        description: 'Sensitive, comfort-seeking travelers',
                        travel_preferences: 'Comfortable accommodations, familiar food'
                    }
                }
            };

            // Test Gemini generation
            const geminiResult = await this.geminiService.generatePersonalizedTravelPlan({
                destination,
                startDate,
                endDate,
                budget,
                bigFiveScores: mockBigFiveResult.big_five_scores,
                dominantTrait: mockBigFiveResult.dominant_trait,
                personalityDescriptions: mockBigFiveResult.descriptions,
                userPreferences: testPreferences,
                interests: ['culture', 'food', 'technology']
            });

            res.json({
                success: true,
                testParams: {
                    destination,
                    startDate,
                    endDate,
                    budget,
                    testResponses
                },
                travelPlan: geminiResult.success ? geminiResult.travelPlan : geminiResult.fallback,
                aiStatus: {
                    generation: geminiResult.success ? 'success' : 'fallback'
                },
                rawResponse: geminiResult.success ? geminiResult.rawResponse : null
            });

        } catch (error) {
            console.error('Test Gemini generation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to test Gemini generation',
                error: error.message
            });
        }
    }
}

module.exports = new AITravelController(); 