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
        this.generateComprehensivePlan = this.generateComprehensivePlan.bind(this);
        this.generateEnhancedPlan = this.generateEnhancedPlan.bind(this);
        this.getUserPersonality = this.getUserPersonality.bind(this);
        this.checkPersonalityStatus = this.checkPersonalityStatus.bind(this);
        this.testPersonalityPrediction = this.testPersonalityPrediction.bind(this);
        this.testGeminiGeneration = this.testGeminiGeneration.bind(this);
        this.analyzePersonality = this.analyzePersonality.bind(this);
        this.generateItinerary = this.generateItinerary.bind(this);
        this.generatePDF = this.generatePDF.bind(this);
    }

    /**
     * Generate comprehensive personalized travel plan using trained ML model
     * @route POST /api/ai/generate-comprehensive-plan
     * @access Private
     */
    async generateComprehensivePlan(req, res) {
        try {
            const {
                destination,
                startDate,
                endDate,
                budget,
                numberOfPeople = 1,
                additionalInfo = ''
            } = req.body;

            // Validate required fields
            if (!destination || !startDate || !endDate || !budget) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: destination, startDate, endDate, budget'
                });
            }

            // Get user and their stored personality analysis
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if user has completed personality analysis
            if (!user.personalityAnalysis || !user.preferencesCompleted) {
                return res.status(400).json({
                    success: false,
                    message: 'Please complete the personality questionnaire first to get personalized travel recommendations.',
                    redirectTo: '/preferences'
                });
            }

            console.log('🎯 Using stored personality analysis for trip planning...');
            console.log(`👤 User Type: ${user.personalityAnalysis.travelerType}`);
            console.log(`🧠 Dominant Trait: ${user.personalityAnalysis.dominantTrait}`);
            console.log(`📍 Places They Love: ${user.personalityAnalysis.placesTheyLove}`);

            // Step 2: Calculate trip duration and prepare comprehensive parameters
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(endDate);
            const tripDuration = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;

            // Use stored personality data for planning
            const storedPersonality = user.personalityAnalysis;
            const comprehensivePlanParams = {
                // Trip Details
                destination,
                startDate,
                endDate,
                tripDuration,
                budget: parseInt(budget),
                numberOfPeople: parseInt(numberOfPeople),
                additionalInfo,

                // Stored Personality Analysis (from trained ML model)
                travelerType: storedPersonality.travelerType,
                personalityDescription: storedPersonality.placesTheyLove,
                dominantTrait: storedPersonality.dominantTrait,
                bigFiveScores: storedPersonality.bigFiveScores,
                confidenceScores: storedPersonality.confidenceScores,

                // User Preferences (original responses)
                userPreferences: user.preferences,
                
                // Personality metadata
                modelUsed: storedPersonality.modelUsed,
                predictionConfidence: storedPersonality.predictionConfidence,
                
                // Request comprehensive planning
                includeWeather: true,
                includeHotels: true,
                includeRestaurants: true,
                includeDayByDayPlan: true,
                includeBudgetBreakdown: true,
                includeTips: true
            };

            console.log('🤖 Generating comprehensive travel plan with stored personality data...');
            console.log(`📊 Model Used: ${storedPersonality.modelUsed}`);
            console.log(`🎯 Prediction Confidence: ${(storedPersonality.predictionConfidence * 100).toFixed(1)}%`);

            const geminiResult = await this.geminiService.generateComprehensiveTravelPlan(comprehensivePlanParams);

            // Step 3: Prepare detailed response with personality context
            const response = {
                success: true,
                tripDetails: {
                    destination,
                    dates: { start: startDate, end: endDate },
                    duration: `${tripDuration} days`,
                    budget: parseInt(budget),
                    numberOfPeople: parseInt(numberOfPeople),
                    additionalInfo
                },
                personalityContext: {
                    travelerType: storedPersonality.travelerType,
                    personalityDescription: storedPersonality.description,
                    placesTheyLove: storedPersonality.placesTheyLove,
                    dominantTrait: storedPersonality.dominantTrait,
                    confidence: storedPersonality.predictionConfidence,
                    modelUsed: storedPersonality.modelUsed,
                    analysisDate: storedPersonality.analysisDate,
                    bigFiveScores: storedPersonality.bigFiveScores
                },
                comprehensivePlan: geminiResult.success ? geminiResult.plan : geminiResult.fallback,
                personalizationDetails: {
                    planPersonalizedFor: `${storedPersonality.travelerType} personality`,
                    keyPersonalizations: [
                        `Focused on ${storedPersonality.placesTheyLove}`,
                        `Adapted for ${storedPersonality.dominantTrait} dominant trait`,
                        `Confidence level: ${(storedPersonality.predictionConfidence * 100).toFixed(1)}%`
                    ],
                    dataSource: storedPersonality.modelUsed === 'trained_ml_model' ? 
                        'Advanced ML model trained on 1M+ personality profiles' : 
                        'Enhanced personality analysis algorithm'
                },
                aiStatus: {
                    personalitySource: 'stored_analysis',
                    personalityModel: storedPersonality.modelUsed,
                    planGeneration: geminiResult.success ? 'gemini_success' : 'gemini_fallback',
                    dataQuality: storedPersonality.modelUsed === 'trained_ml_model' ? 'highest_confidence' : 'high_confidence'
                }
            };

            // Optional: Save the generated plan to user's trip history
            if (geminiResult.success) {
                const TourPlan = require('../models/tourPlan');
                const newPlan = new TourPlan({
                    userId: req.user._id,
                    destination: destination,
                    startDate: startDate,
                    endDate: endDate,
                    duration: tripDuration,
                    budget: parseInt(budget),
                    numberOfPeople: parseInt(numberOfPeople),
                    itinerary: geminiResult.plan,
                    personalityType: storedPersonality.travelerType,
                    personalityConfidence: storedPersonality.predictionConfidence,
                    createdAt: new Date()
                });

                await newPlan.save();
                
                // Add plan ID to response
                response.planId = newPlan._id;
                
                console.log(`💾 Travel plan saved with ID: ${newPlan._id}`);
            }

            res.json(response);

        } catch (error) {
            console.error('❌ Comprehensive travel plan generation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate comprehensive travel plan',
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
     * Check user's personality analysis status
     * @route GET /api/ai/personality-status
     * @access Private
     */
    async checkPersonalityStatus(req, res) {
        try {
            const user = await User.findById(req.user._id).select('personalityAnalysis personalityAnalyzedAt preferencesCompleted readyForPersonalizedPlanning');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const hasPersonalityAnalysis = !!(user.personalityAnalysis && user.preferencesCompleted);
            
            res.json({
                success: true,
                personalityStatus: {
                    completed: hasPersonalityAnalysis,
                    preferencesCompleted: user.preferencesCompleted || false,
                    readyForPersonalizedPlanning: user.readyForPersonalizedPlanning || false,
                    analysisDate: user.personalityAnalyzedAt,
                    travelerType: hasPersonalityAnalysis ? user.personalityAnalysis.travelerType : null,
                    confidence: hasPersonalityAnalysis ? user.personalityAnalysis.predictionConfidence : null,
                    modelUsed: hasPersonalityAnalysis ? user.personalityAnalysis.modelUsed : null
                },
                nextSteps: hasPersonalityAnalysis ? 
                    { action: 'plan_trip', message: 'You can now create personalized travel plans!' } :
                    { action: 'complete_questionnaire', message: 'Complete the personality questionnaire to get personalized recommendations.' }
            });

        } catch (error) {
            console.error('Check personality status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check personality status',
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
            const user = await User.findById(req.user._id).select('personalityAnalysis personalityAnalyzedAt preferencesCompleted preferences');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!user.preferencesCompleted || !user.personalityAnalysis) {
                return res.status(404).json({
                    success: false,
                    message: 'Personality analysis not available. Please complete the questionnaire first.'
                });
            }

            res.json({
                success: true,
                personality: user.personalityAnalysis,
                analyzed_at: user.personalityAnalyzedAt,
                preferences_completed: user.preferencesCompleted
            });

        } catch (error) {
            console.error('Get user personality error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve personality data',
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

    /**
     * Generate itinerary using the enhanced ML pipeline
     * @route POST /api/ai/generate-itinerary
     * @access Private
     */
    async generateItinerary(req, res) {
        try {
            const {
                destination,
                travel_dates,
                duration,
                daily_budget,
                total_budget,
                additional_preferences,
                travelers = 1
            } = req.body;

            // Validate required fields
            if (!destination || !travel_dates || !duration || !daily_budget) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: destination, travel_dates, duration, daily_budget'
                });
            }

            // Get user data including personality analysis from MongoDB
            const user = await User.findById(req.user._id);
            if (!user || !user.preferences) {
                return res.status(400).json({
                    success: false,
                    message: 'User preferences not found. Please complete the questionnaire first.'
                });
            }

            // Check if user has personality analysis
            if (!user.personalityAnalysis || !user.personalityAnalysis.description) {
                return res.status(400).json({
                    success: false,
                    message: 'Personality analysis not found. Please complete the questionnaire first.'
                });
            }

            // Prepare data for Gemini API with personality description
            const tripData = {
                destination: destination,
                travel_dates: travel_dates,
                duration: parseInt(duration),
                daily_budget: parseInt(daily_budget),
                total_budget: total_budget,
                travelers: travelers,
                additional_preferences: additional_preferences || '',
                personalityDescription: user.personalityAnalysis.description, // This is the key addition!
                userPreferences: user.preferences
            };

            // Use Gemini service to generate personalized itinerary
            const geminiResult = await this.geminiService.generatePersonalizedItinerary(tripData);
            
            if (geminiResult.success) {
                // Save the generated itinerary to MongoDB
                const TourPlan = require('../models/tourPlan');
                const newItinerary = new TourPlan({
                    userId: req.user._id,
                    destination: destination,
                    startDate: travel_dates.split(' to ')[0],
                    endDate: travel_dates.split(' to ')[1],
                    duration: duration,
                    budget: total_budget,
                    itinerary: geminiResult.itinerary,
                    personalityAnalysis: user.personalityAnalysis.description,
                    createdAt: new Date()
                });
                
                // Save to database
                await newItinerary.save();
                
                // Add the itinerary ID to user's tours
                await User.findByIdAndUpdate(req.user._id, {
                    $push: { tours: newItinerary._id }
                });
                
                res.json({
                    success: true,
                    message: 'Personalized itinerary generated successfully',
                    itinerary: geminiResult.itinerary,
                    personalityUsed: user.personalityAnalysis.description,
                    itineraryId: newItinerary._id
                });
            } else {
                throw new Error(geminiResult.error || 'Failed to generate itinerary');
            }

        } catch (error) {
            console.error('Generate itinerary error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate itinerary',
                error: error.message
            });
        }
    }

    /**
     * Analyze personality from preferences using trained ML model
     * @route POST /api/ai/analyze-personality
     * @access Private
     */
    async analyzePersonality(req, res) {
        try {
            const preferences = req.body;

            // Validate preferences - ensure all 12 required fields are present
            const requiredFields = [
                'morningRoutine', 'placePreference', 'travelPace', 'foodPreferences',
                'backupPlanning', 'memoryCapturing', 'photographyStyle', 'musicPreferences',
                'spontaneityLevel', 'packingPhilosophy', 'groupDynamics', 'memorableElements'
            ];

            const missingFields = requiredFields.filter(field => 
                preferences[field] === undefined || preferences[field] === null
            );

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required preference fields: ${missingFields.join(', ')}`
                });
            }

            console.log('🧠 Analyzing personality with trained ML model...');
            console.log('📊 User preferences received:', Object.keys(preferences).length, 'fields');

            // Step 1: Use trained ML model for personality prediction
            const personalityResult = await this.bigFiveService.predictBigFivePersonality(preferences);
            
            let personalityAnalysisData = null;
            let personalityDescription = '';

            if (personalityResult.success) {
                console.log('✅ Trained ML model prediction successful!');
                console.log(`🎯 Predicted Traveler Type: ${personalityResult.travelerType}`);
                console.log(`🏆 Dominant Trait: ${personalityResult.dominantTrait}`);
                console.log(`📍 Places They Love: ${personalityResult.personalityDescription}`);

                // Create detailed personality description
                personalityDescription = `You are a **${personalityResult.travelerType}**! Based on our advanced ML analysis of over 1 million personality profiles, you love visiting: ${personalityResult.personalityDescription}. Your dominant personality trait is ${personalityResult.dominantTrait}, which means you're drawn to experiences that align with your unique travel style.`;

                // Prepare comprehensive personality data for storage
                personalityAnalysisData = {
                    // Core ML predictions
                    travelerType: personalityResult.travelerType,
                    dominantTrait: personalityResult.dominantTrait,
                    placesTheyLove: personalityResult.personalityDescription,
                    
                    // Big Five scores
                    bigFiveScores: personalityResult.bigFiveScores,
                    confidenceScores: personalityResult.confidenceScores,
                    
                    // Descriptive text for UI
                    description: personalityDescription,
                    
                    // ML model info
                    modelUsed: 'trained_ml_model',
                    predictionConfidence: Math.max(...Object.values(personalityResult.confidenceScores || {})) || 0.8,
                    analysisDate: new Date(),
                    
                    // Available traveler types for reference
                    availableTravelerTypes: personalityResult.descriptions || {}
                };

            } else {
                console.log('⚠️ ML model failed, using enhanced fallback analysis');
                
                // Enhanced fallback with better personality mapping
                const fallbackResult = personalityResult.fallback || personalityResult;
                const dominantTrait = fallbackResult.dominantTrait || 'openness';
                
                // Map traits to traveler types
                const traitToTravelerType = {
                    'openness': 'Cultural_Explorer',
                    'conscientiousness': 'Luxury_Seeker', 
                    'extraversion': 'Social_Party_Goer',
                    'agreeableness': 'Community_Connector',
                    'neuroticism': 'Comfort_Seeker'
                };

                const travelerType = traitToTravelerType[dominantTrait] || 'Cultural_Explorer';
                const travelerTypeDescriptions = personalityResult.descriptions || {};
                const placeDescription = travelerTypeDescriptions[travelerType] || 'Museums, art galleries, cultural sites, and unique local experiences';

                personalityDescription = `You are a **${travelerType.replace('_', ' ')}**! Based on your preferences, you love visiting: ${placeDescription}. Your dominant personality trait is ${dominantTrait}, which influences your travel choices.`;

                personalityAnalysisData = {
                    travelerType: travelerType,
                    dominantTrait: dominantTrait,
                    placesTheyLove: placeDescription,
                    bigFiveScores: fallbackResult.bigFiveScores || {},
                    confidenceScores: { [travelerType]: 0.75 },
                    description: personalityDescription,
                    modelUsed: 'fallback_analysis',
                    predictionConfidence: 0.75,
                    analysisDate: new Date(),
                    availableTravelerTypes: travelerTypeDescriptions
                };
            }

            // Step 2: Save comprehensive data to user document
            const updateData = {
                // Save original preferences
                preferences: preferences,
                preferencesCompleted: true,
                preferencesUpdatedAt: new Date(),
                
                // Save personality analysis
                personalityAnalysis: personalityAnalysisData,
                personalityAnalyzedAt: new Date(),
                
                // Mark user as ready for personalized trip planning
                readyForPersonalizedPlanning: true
            };

            await User.findByIdAndUpdate(req.user._id, updateData);

            console.log('💾 Personality analysis saved to database');
            console.log(`👤 User ${req.user._id} is now ready for personalized trip planning`);

            // Step 3: Send response to frontend
            res.json({
                success: true,
                message: 'Personality analysis completed and saved successfully!',
                personalityAnalysis: {
                    travelerType: personalityAnalysisData.travelerType,
                    description: personalityDescription,
                    placesTheyLove: personalityAnalysisData.placesTheyLove,
                    dominantTrait: personalityAnalysisData.dominantTrait,
                    confidence: personalityAnalysisData.predictionConfidence,
                    modelUsed: personalityAnalysisData.modelUsed
                },
                // Additional data for frontend display
                detailedAnalysis: {
                    bigFiveScores: personalityAnalysisData.bigFiveScores,
                    confidenceScores: personalityAnalysisData.confidenceScores,
                    availableTravelerTypes: Object.keys(personalityAnalysisData.availableTravelerTypes || {})
                },
                nextSteps: {
                    canPlanTrips: true,
                    message: "You're now ready to create personalized travel plans!"
                }
            });

        } catch (error) {
            console.error('❌ Analyze personality error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to analyze personality. Please try again.',
                error: error.message
            });
        }
    }

    /**
     * Generate PDF from itinerary data
     * @route POST /api/ai/generate-pdf
     * @access Private
     */
    async generatePDF(req, res) {
        try {
            const { 
                detailed_itinerary, 
                destination, 
                travel_dates, 
                personality_analysis, 
                weather_forecast,
                duration,
                total_budget 
            } = req.body;

            if (!detailed_itinerary || !destination) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required data for PDF generation'
                });
            }

            // For now, we'll use a simple text-based PDF generation
            // You can enhance this with libraries like PDFKit or puppeteer
            const PDFDocument = require('pdfkit');
            const fs = require('fs');
            const path = require('path');

            // Create a new PDF document
            const doc = new PDFDocument();
            const filename = `${destination.replace(/[^a-z0-9]/gi, '_')}_Itinerary_${Date.now()}.pdf`;
            const filepath = path.join(__dirname, '../temp', filename);

            // Ensure temp directory exists
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Pipe PDF to file
            doc.pipe(fs.createWriteStream(filepath));

            // Add content to PDF
            doc.fontSize(24).text('Travel Itinerary', { align: 'center' });
            doc.fontSize(18).text(destination, { align: 'center' });
            doc.moveDown();

            // Trip details
            doc.fontSize(14).text(`Travel Dates: ${travel_dates}`);
            doc.text(`Duration: ${duration} days`);
            doc.text(`Budget: $${total_budget}`);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`);
            doc.moveDown();

            // Personality section
            if (personality_analysis) {
                doc.fontSize(16).text('Your Travel Personality', { underline: true });
                doc.fontSize(12).text(personality_analysis.description || '');
                doc.moveDown();
            }

            // Weather section
            if (weather_forecast && weather_forecast.overall_summary) {
                doc.fontSize(16).text('Weather Forecast', { underline: true });
                doc.fontSize(12).text(weather_forecast.overall_summary);
                doc.moveDown();
            }

            // Detailed itinerary
            doc.fontSize(16).text('Detailed Itinerary', { underline: true });
            doc.fontSize(10).text(detailed_itinerary, {
                width: 410,
                align: 'left'
            });

            // Finalize PDF
            doc.end();

            // Wait for PDF to be written and send response
            setTimeout(() => {
                try {
                    // Set response headers
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                    
                    // Send file
                    const fileStream = fs.createReadStream(filepath);
                    fileStream.pipe(res);
                    
                    // Clean up file after sending
                    fileStream.on('end', () => {
                        fs.unlink(filepath, (err) => {
                            if (err) console.error('Error deleting temp PDF:', err);
                        });
                    });
                    
                } catch (error) {
                    console.error('Error sending PDF:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Error generating PDF file'
                    });
                }
            }, 1000);

        } catch (error) {
            console.error('Generate PDF error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate PDF',
                error: error.message
            });
        }
    }
}

module.exports = new AITravelController();
