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
        this.analyzePersonality = this.analyzePersonality.bind(this);
        this.generateItinerary = this.generateItinerary.bind(this);
        this.generatePDF = this.generatePDF.bind(this);
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

            // Check if user has completed personality analysis
            let personalityAnalysis = null;
            let bigFiveResult = null;
            
            if (user.personalityAnalysis) {
                console.log('� Using stored personality analysis...');
                personalityAnalysis = user.personalityAnalysis;
                
                // Use stored personality for travel planning
                bigFiveResult = {
                    success: true,
                    dominantTrait: personalityAnalysis.travel_style || 'Balanced Explorer',
                    descriptions: personalityAnalysis.description,
                    personalityType: personalityAnalysis.accommodation_style
                };
            } else {
                console.log('🔮 Generating new personality analysis...');
                bigFiveResult = await this.bigFiveService.predictBigFivePersonality(user.preferences);
                
                if (!bigFiveResult.success) {
                    console.log('⚠️ Using fallback personality analysis');
                }
            }

            // Step 2: Generate personality-based recommendations
            const personalityRecommendations = personalityAnalysis ? 
                personalityAnalysis.preferred_activities || [] :
                this.bigFiveService.generatePersonalityRecommendations(
                    bigFiveResult.success ? bigFiveResult : bigFiveResult.fallback
                );

            // Step 3: Generate AI-powered travel plan with stored personality data
            console.log('🤖 Generating personalized travel plan with Gemini...');
            const travelPlanParams = {
                destination,
                startDate,
                endDate,
                budget: parseInt(budget),
                personalityAnalysis: personalityAnalysis,
                bigFiveScores: bigFiveResult.bigFiveScores || null,
                dominantTrait: bigFiveResult.dominantTrait,
                personalityDescriptions: personalityAnalysis?.description || bigFiveResult.descriptions,
                userPreferences: user.preferences,
                interests: interests.length > 0 ? interests : user.preferences.interests || [],
                accommodationStyle: personalityAnalysis?.accommodation_style,
                travelStyle: personalityAnalysis?.travel_style,
                motivations: personalityAnalysis?.motivations || []
            };

            const geminiResult = await this.geminiService.generatePersonalizedTravelPlan(travelPlanParams);

            // Step 4: Prepare comprehensive response
            const response = {
                success: true,
                destination,
                dates: { start: startDate, end: endDate },
                budget: parseInt(budget),
                personality: personalityAnalysis || {
                    dominantTrait: travelPlanParams.dominantTrait,
                    bigFiveScores: travelPlanParams.bigFiveScores,
                    confidence: bigFiveResult.success ? bigFiveResult.confidenceScores : null,
                    analysis: bigFiveResult.success ? bigFiveResult.descriptions : bigFiveResult.fallback?.descriptions
                },
                personalityAnalysis: personalityAnalysis,
                recommendations: personalityRecommendations,
                travelPlan: geminiResult.success ? geminiResult.travelPlan : geminiResult.fallback,
                aiStatus: {
                    personalitySource: personalityAnalysis ? 'stored' : 'generated',
                    bigFivePrediction: bigFiveResult?.success ? 'success' : 'fallback',
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
     * Analyze personality from preferences
     * @route POST /api/ai/analyze-personality
     * @access Private
     */
    async analyzePersonality(req, res) {
        try {
            const preferences = req.body;

            // Validate preferences
            if (!preferences || Object.keys(preferences).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No preferences provided'
                });
            }

            // Save preferences to MongoDB user document
            await User.findByIdAndUpdate(req.user._id, {
                preferences: preferences,
                preferencesCompleted: true,
                preferencesUpdatedAt: new Date()
            });

            // Use BigFive service for personality analysis (Node.js implementation)
            const personalityData = await this.bigFiveService.predictBigFivePersonality(preferences);
            
            // Extract a meaningful description for the frontend and future trip planning
            let personalityDescription = '';
            if (personalityData.success && personalityData.travelerType) {
                // Use the traveler type and detailed personality description
                personalityDescription = `You are a **${personalityData.travelerType}**! ${personalityData.personalityDescription}`;
                
                // Add specific places they love for the dominant trait
                if (personalityData.descriptions && personalityData.descriptions[personalityData.dominantTrait]) {
                    const traitInfo = personalityData.descriptions[personalityData.dominantTrait];
                    personalityDescription += ` Places you'll love visiting: ${traitInfo.places_they_love || traitInfo.travel_preferences}`;
                }
            } else if (personalityData.fallback && personalityData.fallback.descriptions) {
                // Use fallback detailed descriptions
                const dominantTrait = personalityData.fallback.dominant_trait;
                const traitDescription = personalityData.fallback.descriptions[dominantTrait];
                personalityDescription = `You are a **${traitDescription.traveler_type || 'Balanced Traveler'}**! ${traitDescription.description}. Places you'll love visiting: ${traitDescription.places_they_love || traitDescription.travel_preferences}`;
            } else {
                personalityDescription = "You are a **Balanced Traveler** who enjoys a mix of adventure and comfort in your travel experiences.";
            }

            // Save personality analysis to user document and mark preferences as completed
            await User.findByIdAndUpdate(req.user._id, {
                preferences: req.body, // Save the preferences that were submitted
                preferencesCompleted: true, // Mark preferences as completed
                preferencesUpdatedAt: new Date(),
                personalityAnalysis: {
                    description: personalityDescription,
                    bigFiveScores: personalityData.bigFiveScores,
                    dominantTrait: personalityData.dominantTrait,
                    confidenceScores: personalityData.confidenceScores
                },
                personalityAnalyzedAt: new Date()
            });

            res.json({
                success: true,
                personalityAnalysis: personalityDescription,
                personalityData: personalityData, // Include full data for future use
                message: 'Personality analysis completed and saved'
            });

        } catch (error) {
            console.error('Analyze personality error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to analyze personality',
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