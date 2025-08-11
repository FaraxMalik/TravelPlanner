const BigFiveService = require('../utils/bigFiveService');
const GeminiTravelService = require('../utils/geminiTravelService');
const GroqTravelService = require('../utils/groqTravelService');
const User = require('../models/user');
const { exec } = require('child_process');
const path = require('path');

class AITravelController {
    constructor() {
        this.bigFiveService = new BigFiveService();
        this.geminiService = new GeminiTravelService();
        this.groqService = new GroqTravelService();
        
        // 🔄 EASY LLM SWITCHING - Comment/Uncomment the lines below:
     //   this.activeService = this.geminiService;  // ✅ UNCOMMENT to use Gemini
         this.activeService = this.groqService;     // ✅ UNCOMMENT to use Groq (comment Gemini line above)
        
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
                placesTheyLove: storedPersonality.placesTheyLove,
                travelStyle: storedPersonality.travelStyle,
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

            // Use active LLM service (Gemini or Groq) to generate personalized itinerary
            const llmResult = await this.activeService.generatePersonalizedItinerary(tripData);
            
            if (llmResult.success) {
                // Save the generated itinerary to MongoDB
                const TourPlan = require('../models/tourPlan');
                // Extract required fields from LLM result
                const itineraryData = llmResult.itinerary;
                const dailyPlans = itineraryData?.daily_plans || [];
                
                // Convert LLM format to TourPlan schema format
                const formattedItinerary = dailyPlans.map((day, index) => ({
                    day: index + 1,
                    activities: (day.activities || []).map(activity => ({
                        name: activity.name || 'Activity',
                        description: activity.description || '',
                        category: activity.category || 'general',
                        startTime: activity.time || activity.start_time || '',
                        endTime: activity.end_time || '',
                        location: activity.location || ''
                    }))
                }));
                
                const weatherForecast = (itineraryData?.weather_forecast || []).map(weather => ({
                    date: weather.date || new Date().toISOString().split('T')[0],
                    temperature: weather.temperature_high || weather.temperature || 'N/A',
                    conditions: weather.conditions || 'Unknown'
                }));
                
                const newItinerary = new TourPlan({
                    userId: req.user._id,
                    placeName: destination, // Required field
                    budget: total_budget,
                    numberOfDays: parseInt(duration), // Required field
                    itinerary: formattedItinerary, // Required format
                    weatherForecast: weatherForecast,
                    personalizedRecommendations: true,
                    preferenceAnalysis: {
                        travelerType: user.personalityAnalysis?.travelerType,
                        personalityDescription: user.personalityAnalysis?.description,
                        generatedWith: 'gemini-1.5-flash'
                    }
                });
                
                // Save to database
                await newItinerary.save();
                
                // Add the itinerary ID to user's tours
                await User.findByIdAndUpdate(req.user._id, {
                    $push: { tours: newItinerary._id }
                });
                
                // Format response for frontend consumption
                const frontendItinerary = {
                    ...llmResult.itinerary,
                    // Add destination, duration, budget for basic component
                    destination: destination,
                    duration: parseInt(duration),
                    budget: total_budget,
                    // Add detailed text format for enhanced view
                    detailed_itinerary: this.formatDetailedItinerary(llmResult.itinerary),
                    // Fix weather forecast format
                    weather_forecast: this.formatWeatherForFrontend(llmResult.itinerary.weather_forecast),
                    // Add personality analysis for frontend
                    personality_analysis: {
                        description: user.personalityAnalysis.description,
                        traveler_type: user.personalityAnalysis.travelerType,
                        motivations: user.personalityAnalysis.motivations || []
                    },
                    // Add basic component format (dailyPlan)
                    dailyPlan: this.formatDailyPlan(llmResult.itinerary),
                    // Add personalized insights
                    personalizedInsights: user.personalityAnalysis.description || "Based on your travel personality, this itinerary is customized for you.",
                    // Add recommendations
                    recommendations: this.extractRecommendations(llmResult.itinerary)
                };

                res.json({
                    success: true,
                    message: 'Personalized itinerary generated successfully',
                    itinerary: frontendItinerary,
                    personalityUsed: user.personalityAnalysis.description,
                    itineraryId: newItinerary._id
                });
            } else {
                // Use fallback itinerary if LLM failed
                console.log('🔄 Using fallback itinerary due to LLM service unavailability');
                const fallbackItinerary = llmResult.fallback || this.generateBasicFallback({
                    destination,
                    duration: parseInt(duration),
                    total_budget,
                    travelerType: user.personalityAnalysis?.travelerType || 'General_Traveler'
                });

                // Save fallback itinerary to database
                const TourPlan = require('../models/tourPlan');
                const formattedFallback = this.formatFallbackForDB(fallbackItinerary, {
                    userId: req.user._id,
                    destination,
                    total_budget,
                    duration: parseInt(duration),
                    user
                });

                const newItinerary = new TourPlan(formattedFallback);
                await newItinerary.save();

                // Format for frontend
                const frontendItinerary = {
                    trip_overview: fallbackItinerary.trip_overview || {
                        destination,
                        duration: `${duration} days`,
                        budget: total_budget,
                        traveler_type: user.personalityAnalysis?.travelerType || 'General_Traveler'
                    },
                    daily_plans: fallbackItinerary.daily_plans || [],
                    weather_forecast: fallbackItinerary.weather_forecast || [],
                    hotels_to_stay: fallbackItinerary.hotels_to_stay || [],
                    transportation: fallbackItinerary.transportation || {},
                    other_information: fallbackItinerary.other_information || {},
                    personalizedInsights: "This is a basic travel plan. For fully personalized recommendations, please configure AI API keys.",
                    note: "Fallback itinerary - AI services unavailable"
                };

                res.json({
                    success: true,
                    message: 'Basic itinerary generated (AI services unavailable)',
                    itinerary: frontendItinerary,
                    personalityUsed: user.personalityAnalysis.description,
                    itineraryId: newItinerary._id,
                    fallback: true
                });
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
                console.log(`📍 Places They Love: ${personalityResult.placesTheyLove}`);
                console.log(`🎭 Travel Style: ${personalityResult.travelStyle}`);

                // Create detailed personality description
                personalityDescription = `You are a **${personalityResult.travelerType}**! Based on our advanced ML analysis of over 1 million personality profiles, you love visiting: ${personalityResult.placesTheyLove}. Your travel style is: ${personalityResult.travelStyle}. Your dominant personality trait is ${personalityResult.dominantTrait}, which means you're drawn to experiences that align with your unique travel style.`;

                // Prepare comprehensive personality data for storage
                personalityAnalysisData = {
                    // Core ML predictions
                    travelerType: personalityResult.travelerType,
                    dominantTrait: personalityResult.dominantTrait,
                    placesTheyLove: personalityResult.placesTheyLove,
                    travelStyle: personalityResult.travelStyle,
                    
                    // Big Five scores
                    bigFiveScores: personalityResult.bigFiveScores,
                    confidenceScores: personalityResult.confidenceScores,
                    
                    // Descriptive text for UI
                    description: personalityDescription,
                    
                    // ML model info
                    modelUsed: personalityResult.modelUsed || 'trained_ml_model',
                    predictionConfidence: personalityResult.predictionConfidence || 0.8,
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

            // Daily itinerary in simple format (avoiding table positioning issues)
            if (req.body.dailyPlan && req.body.dailyPlan.length > 0) {
                doc.fontSize(16).text('Daily Itinerary', { underline: true });
                doc.moveDown();
                
                req.body.dailyPlan.forEach((day, index) => {
                    // Ensure we have valid data
                    const dayNum = day.day || (index + 1);
                    const dayTitle = day.title || `Day ${dayNum}`;
                    const dayCost = parseFloat(day.totalCost) || 0;
                    
                    // Day header with cost
                    doc.fontSize(14)
                       .fillColor('#2c3e50')
                       .text(`Day ${dayNum}: ${dayTitle} - Total: $${dayCost.toFixed(2)}`, { underline: true });
                    doc.moveDown(0.5);
                    
                    // Activities in simple list format
                    if (day.activities && Array.isArray(day.activities) && day.activities.length > 0) {
                        day.activities.forEach((activity, actIndex) => {
                            // Validate activity data
                            const activityText = activity.activity || activity.name || 'Activity';
                            const activityTime = activity.time || 'All day';
                            const activityCost = parseFloat(activity.cost) || 0;
                            
                            // Determine period
                            let period = 'All Day';
                            let cleanActivity = activityText;
                            
                            if (activityText.includes('Morning:')) {
                                period = '🌅 Morning';
                                cleanActivity = activityText.replace(/^Morning:\s*/, '');
                            } else if (activityText.includes('Afternoon:')) {
                                period = '☀️ Afternoon';
                                cleanActivity = activityText.replace(/^Afternoon:\s*/, '');
                            } else if (activityText.includes('Evening:')) {
                                period = '🌙 Evening';
                                cleanActivity = activityText.replace(/^Evening:\s*/, '');
                            }
                            
                            // Simple text layout instead of complex table
                            doc.fontSize(11)
                               .fillColor('#000000')
                               .text(`${period} | ${activityTime}`, { indent: 20 });
                            
                            doc.fontSize(10)
                               .text(`${cleanActivity}`, { indent: 40 });
                            
                            if (activityCost > 0) {
                                doc.fontSize(9)
                                   .fillColor('#1976d2')
                                   .text(`Cost: $${activityCost.toFixed(2)}`, { indent: 60 });
                            }
                            
                            // Add location if available
                            if (activity.location) {
                                doc.fontSize(8)
                                   .fillColor('#666666')
                                   .text(`📍 ${activity.location}`, { indent: 60 });
                            }
                            
                            doc.moveDown(0.3);
                        });
                    } else {
                        doc.fontSize(10)
                           .fillColor('#666666')
                           .text('No activities planned for this day', { indent: 20 });
                    }
                    
                    doc.moveDown();
                });
                
                // Trip total
                const tripTotal = req.body.dailyPlan.reduce((sum, day) => {
                    const dayTotal = parseFloat(day.totalCost) || 0;
                    return sum + dayTotal;
                }, 0);
                
                doc.fontSize(14)
                   .fillColor('#d32f2f')
                   .text(`Total Trip Cost: $${tripTotal.toFixed(2)}`, { 
                       align: 'right',
                       underline: true 
                   });
                doc.moveDown();
            }

            // Detailed itinerary text
            doc.fontSize(16).fillColor('#000000').text('Detailed Description', { underline: true });
            doc.fontSize(10).text(detailed_itinerary || 'Detailed itinerary not available', {
                width: 410,
                align: 'left'
            });

            // Finalize PDF
            doc.end();

            // Handle PDF completion properly
            doc.on('end', () => {
                // Wait a moment for file to be fully written
                setTimeout(() => {
                    try {
                        // Check if file exists
                        if (!fs.existsSync(filepath)) {
                            throw new Error('PDF file was not created');
                        }

                        // Set response headers
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                        res.setHeader('Content-Length', fs.statSync(filepath).size);
                        
                        // Send file
                        const fileStream = fs.createReadStream(filepath);
                        
                        fileStream.on('error', (err) => {
                            console.error('Error reading PDF file:', err);
                            if (!res.headersSent) {
                                res.status(500).json({
                                    success: false,
                                    message: 'Error reading PDF file'
                                });
                            }
                        });

                        fileStream.on('end', () => {
                            // Clean up file after sending
                            setTimeout(() => {
                                fs.unlink(filepath, (err) => {
                                    if (err) console.error('Error deleting temp PDF:', err);
                                    else console.log('✅ Temp PDF file cleaned up');
                                });
                            }, 1000);
                        });

                        fileStream.pipe(res);
                        
                    } catch (error) {
                        console.error('Error sending PDF:', error);
                        if (!res.headersSent) {
                            res.status(500).json({
                                success: false,
                                message: 'Error generating PDF file',
                                error: error.message
                            });
                        }
                    }
                }, 500);
            });

            doc.on('error', (err) => {
                console.error('PDF document error:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error creating PDF document',
                        error: err.message
                    });
                }
            });

        } catch (error) {
            console.error('Generate PDF error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate PDF',
                error: error.message
            });
        }
    }

    // Helper function to format detailed itinerary text
    formatDetailedItinerary(itineraryData) {
        if (!itineraryData || !itineraryData.daily_plans) {
            return "Detailed itinerary not available";
        }

        let text = `🎯 TRIP OVERVIEW\n`;
        text += `Destination: ${itineraryData.trip_overview?.destination || 'Your chosen destination'}\n`;
        text += `Duration: ${itineraryData.trip_overview?.duration || 'Multiple days'}\n`;
        text += `Budget: $${itineraryData.trip_overview?.budget || 'As planned'}\n\n`;

        text += `📋 DAILY ITINERARY\n\n`;

        itineraryData.daily_plans.forEach((day, index) => {
            text += `==== DAY ${day.day || index + 1} ====\n`;
            text += `Theme: ${day.theme || 'Exploration Day'}\n\n`;
            
            if (day.activities && day.activities.length > 0) {
                day.activities.forEach((activity, actIndex) => {
                    text += `${actIndex + 1}. ${activity.name || 'Activity'}\n`;
                    if (activity.time) text += `   ⏰ Time: ${activity.time}\n`;
                    if (activity.description) text += `   📝 ${activity.description}\n`;
                    if (activity.location) text += `   📍 Location: ${activity.location}\n`;
                    text += `\n`;
                });
            } else {
                text += `   • General exploration and sightseeing\n\n`;
            }
            text += `\n`;
        });

        if (itineraryData.personality_optimization) {
            text += `🎭 PERSONALIZED FOR YOU\n`;
            text += `${itineraryData.personality_optimization.traveler_type_benefits || 'This itinerary is customized based on your travel personality and preferences.'}\n\n`;
        }

        return text;
    }

    // Helper function to format weather forecast for frontend
    formatWeatherForFrontend(weatherData) {
        if (!weatherData || !Array.isArray(weatherData)) {
            return [];
        }

        // Normalize weather data from both Groq and Gemini APIs
        return weatherData.map((weather, index) => ({
            day: weather.day || (index + 1),
            date: weather.date || new Date().toISOString().split('T')[0],
            condition: weather.condition || weather.conditions || 'Sunny',
            temperature: weather.temperature || weather.temperature_high || '25°C',
            humidity: weather.humidity || '65%',
            wind_speed: weather.wind_speed || '15 km/h',
            precipitation: weather.precipitation || weather.precipitation_chance || '0%',
            precautions: weather.precautions || weather.travel_tips || 'Enjoy your day!',
            clothing_suggestions: weather.clothing_suggestions || weather.recommended_clothing || 'Comfortable attire'
        }));
    }

    // Helper function to format daily plan for basic frontend component
    formatDailyPlan(itineraryData) {
        if (!itineraryData || !itineraryData.daily_plans) {
            return [
                {
                    day: 1,
                    title: "Exploration Day",
                    activities: [
                        { time: "09:00", activity: "General sightseeing", cost: 50 }
                    ],
                    totalCost: 50
                }
            ];
        }

        return itineraryData.daily_plans.map((day, index) => {
            const activities = [];
            let totalCost = 0;
            
            // Handle new structured format: morning, noon, evening
            if (day.morning) {
                activities.push({
                    time: day.morning.time || '8:00 AM - 12:00 PM',
                    activity: `Morning: ${day.morning.activities}`,
                    cost: day.morning.cost || 0
                });
                totalCost += day.morning.cost || 0;
            }
            
            if (day.noon) {
                activities.push({
                    time: day.noon.time || '12:00 PM - 4:00 PM',
                    activity: `Afternoon: ${day.noon.activities}`,
                    cost: day.noon.cost || 0
                });
                totalCost += day.noon.cost || 0;
            }
            
            if (day.evening) {
                activities.push({
                    time: day.evening.time || '4:00 PM - 10:00 PM',
                    activity: `Evening: ${day.evening.activities}`,
                    cost: day.evening.cost || 0
                });
                totalCost += day.evening.cost || 0;
            }
            
            // Fallback for old format
            if (activities.length === 0 && day.activities) {
                day.activities.forEach((activity, actIndex) => {
                    activities.push({
                        time: activity.time || activity.startTime || `${9 + actIndex * 2}:00`,
                        activity: activity.name || activity.description || 'Planned activity',
                        cost: activity.cost || Math.floor(Math.random() * 50) + 20
                    });
                    totalCost += activity.cost || Math.floor(Math.random() * 50) + 20;
                });
            }
            
            return {
                day: day.day || index + 1,
                title: day.theme || `Day ${day.day || index + 1} Activities`,
                activities,
                totalCost: day.daily_total || totalCost
            };
        });
    }

    // Helper function to extract recommendations
    extractRecommendations(itineraryData) {
        const defaultRecommendations = [
            "Pack comfortable walking shoes",
            "Bring a portable charger for your devices",
            "Download offline maps for navigation",
            "Carry local currency for small vendors",
            "Book popular attractions in advance"
        ];

        if (itineraryData?.personality_optimization?.recommendations) {
            return itineraryData.personality_optimization.recommendations;
        }

        return defaultRecommendations;
    }
}

module.exports = new AITravelController();
