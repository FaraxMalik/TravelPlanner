const { spawn } = require('child_process');
const path = require('path');

class BigFiveService {
    constructor() {
        this.pythonScriptPath = 'scripts/predict_personality_trained.py'; 
        this.modelPath = path.join(__dirname, '../ml_models/models/travel_personality_classifier.pkl');
    }

    // Predicts Big Five personality traits from user preferences
    async predictBigFivePersonality(userPreferences) {
        try {
            console.log('🔮 Calling trained ML model with user preferences:', userPreferences);
            const result = await this.callTrainedModel(userPreferences);
            
            if (result.success) {
                return {
                    success: true,
                    bigFiveScores: result.big_five_scores,
                    dominantTrait: result.dominant_trait,
                    travelerType: result.travel_type,
                    personalityDescription: result.travel_description,
                    placesTheyLove: result.places_they_love,
                    travelStyle: result.travel_style,
                    confidenceScores: result.all_probabilities,
                    predictionConfidence: result.confidence,
                    modelUsed: result.model_used,
                    descriptions: this.getTraverlerTypeDescriptions()
                };
            } else {
                console.log('⚠️ Trained model failed, using fallback analysis');
                const bigFiveScores = this.calculateBigFiveFromPreferences(userPreferences);
                return this.generateFallbackAnalysis(bigFiveScores);
            }

        } catch (error) {
            console.error('BigFiveService prediction error:', error);
            const fallbackScores = this.calculateBigFiveFromPreferences(userPreferences);
            return this.generateFallbackAnalysis(fallbackScores);
        }
    }

    // Calls the trained ML model to get personality prediction
    async callTrainedModel(userPreferences) {
        return new Promise((resolve, reject) => {
            // Pass preferences as JSON string to Python script
            const preferencesJson = JSON.stringify(userPreferences);
            
            // Use system Python (or virtual environment if available)
            const pythonPath = 'python';
            const pythonProcess = spawn(pythonPath, [this.pythonScriptPath, preferencesJson], {
                cwd: path.join(__dirname, '../ml_models')
            });

            let stdout = '';
            let stderr = '';

            // Set timeout for Python process (30 seconds)
            const timeout = setTimeout(() => {
                console.error('Python process timeout (30s), killing process...');
                pythonProcess.kill();
                resolve({ success: false, error: 'Python process timeout' });
            }, 30000);

            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            pythonProcess.on('close', (code) => {
                clearTimeout(timeout);
                if (code === 0) {
                    try {
                        const result = JSON.parse(stdout);
                        if (result.error) {
                            resolve({ success: false, error: result.error });
                        } else {
                            resolve({ 
                                success: true, 
                                travel_type: result.travel_type,
                                confidence: result.confidence,
                                places_they_love: result.places_they_love,
                                travel_description: result.travel_description,
                                travel_style: result.travel_style,
                                big_five_scores: result.big_five_scores,
                                dominant_trait: result.dominant_trait,
                                all_probabilities: result.all_probabilities,
                                model_used: result.model_used
                            });
                        }
                    } catch (parseError) {
                        console.error('Failed to parse Python output:', parseError);
                        console.error('Raw output:', stdout);
                        resolve({ success: false, error: 'Parse error' });
                    }
                } else {
                    console.error('Python process failed with code:', code);
                    console.error('stderr:', stderr);
                    resolve({ success: false, error: stderr });
                }
            });

            pythonProcess.on('error', (error) => {
                console.error('Failed to start Python process:', error);
                clearTimeout(timeout);
                resolve({ success: false, error: error.message });
            });
        });
    }

    bigFiveToResponses(bigFiveScores) {
        // Convert Big Five scores (0-5) to 50 individual question responses
        const responses = [];
        
        // Order: EXT, AGR, CSN, EST, OPN (10 questions each)
        const traits = ['extraversion', 'agreeableness', 'conscientiousness', 'neuroticism', 'openness'];
        
        for (const trait of traits) {
            const score = Math.round(bigFiveScores[trait] || 3); // Default to 3 if missing
            const clampedScore = Math.max(1, Math.min(5, score)); // Ensure 1-5 range
            
            // Repeat the score 10 times (representing 10 questions per trait)
            for (let i = 0; i < 10; i++) {
                responses.push(clampedScore);
            }
        }
        
        return responses;
    }

    getDominantTrait(bigFiveScores) {
        return Object.keys(bigFiveScores).reduce((a, b) => 
            bigFiveScores[a] > bigFiveScores[b] ? a : b
        );
    }

    calculateBigFiveFromPreferences(userPreferences) {
        // Convert user travel preferences to Big Five personality scores (0-5 scale)
        const preferences = {
            morningRoutine: parseInt(userPreferences.morningRoutine) || 3,
            placePreference: parseInt(userPreferences.placePreference) || 3,
            travelPace: parseInt(userPreferences.travelPace) || 3,
            foodPreferences: parseInt(userPreferences.foodPreferences) || 3,
            backupPlanning: parseInt(userPreferences.backupPlanning) || 3,
            memoryCapturing: parseInt(userPreferences.memoryCapturing) || 3,
            photographyStyle: parseInt(userPreferences.photographyStyle) || 3,
            musicPreferences: parseInt(userPreferences.musicPreferences) || 3,
            spontaneityLevel: parseInt(userPreferences.spontaneityLevel) || 3,
            packingPhilosophy: parseInt(userPreferences.packingPhilosophy) || 3,
            groupDynamics: parseInt(userPreferences.groupDynamics) || 3,
            memorableElements: parseInt(userPreferences.memorableElements) || 3
        };

        return {
            openness: this.calculateOpenness(Object.values(preferences)) / 20, // Scale to 0-5
            conscientiousness: this.calculateConscientiousness(Object.values(preferences)) / 20,
            extraversion: this.calculateExtraversion(Object.values(preferences)) / 20,
            agreeableness: this.calculateAgreeableness(Object.values(preferences)) / 20,
            neuroticism: this.calculateNeuroticism(Object.values(preferences)) / 20
        };
    }

    generateFallbackAnalysis(bigFiveScores) {
        console.log('🔄 Using fallback personality analysis');
        
        // Ensure we have valid scores
        const validScores = bigFiveScores || {
            'openness': 60,
            'conscientiousness': 55, 
            'extraversion': 65,
            'agreeableness': 50,
            'neuroticism': 40
        };
        
        // Determine traveler type based on dominant trait
        const dominantTrait = Object.keys(validScores).reduce((a, b) => 
            validScores[a] > validScores[b] ? a : b
        );

        const traitToTravelerType = {
            'openness': 'Cultural_Explorer',
            'conscientiousness': 'Luxury_Seeker',
            'extraversion': 'Social_Party_Goer',
            'agreeableness': 'Community_Connector',
            'neuroticism': 'Comfort_Seeker'
        };

        const travelerType = traitToTravelerType[dominantTrait] || 'Cultural_Explorer';
        const descriptions = this.getTraverlerTypeDescriptions();
        
        // Always return a valid result
        return {
            success: true,
            bigFiveScores: validScores,
            dominantTrait: dominantTrait,
            travelerType: travelerType,
            personalityDescription: descriptions[travelerType] || 'Diverse travel experiences tailored to your preferences',
            placesTheyLove: descriptions[travelerType] || 'Various interesting destinations',
            travelStyle: `${travelerType.replace('_', ' ').toLowerCase()} experiences`,
            confidenceScores: { [travelerType]: 0.8 },
            predictionConfidence: 0.8,
            modelUsed: 'enhanced_fallback',
            descriptions: descriptions,
            fallback: true
        };
    }

    getTraverlerTypeDescriptions() {
        return {
            'Cultural_Explorer': 'Museums, art galleries, historical sites, cultural centers, local markets, traditional workshops',
            'Luxury_Seeker': 'Five-star hotels, fine dining restaurants, luxury spas, upscale shopping districts, premium resorts',
            'Social_Party_Goer': 'Nightclubs, bars, beach parties, music festivals, social events, group tours, crowded markets',
            'Community_Connector': 'Local communities, family restaurants, parks, gardens, temples, community centers, peaceful cafes',
            'Comfort_Seeker': 'All-inclusive resorts, familiar chain restaurants, hotel pools, spa centers, safe tourist areas'
        };
    }

    calculateOpenness(responses) {
        const opennessQuestions = [1, 2, 3, 5, 6, 9];
        let score = 50;
        opennessQuestions.forEach(qIndex => {
            const response = responses[qIndex];
            if (response >= 2) score += 8;
            else if (response <= 1) score -= 5;
        });
        return Math.max(0, Math.min(100, score));
    }

    calculateConscientiousness(responses) {
        const conscientiousnessQuestions = [0, 2, 4, 9, 10];
        let score = 50;
        conscientiousnessQuestions.forEach(qIndex => {
            const response = responses[qIndex];
            if (response <= 1) score += 8;
            else if (response >= 2) score -= 5;
        });
        return Math.max(0, Math.min(100, score));
    }

    calculateExtraversion(responses) {
        const extraversionQuestions = [3, 6, 7, 10, 11];
        let score = 50;
        extraversionQuestions.forEach(qIndex => {
            const response = responses[qIndex];
            if (response >= 2) score += 8;
            else if (response <= 1) score -= 5;
        });
        return Math.max(0, Math.min(100, score));
    }

    calculateAgreeableness(responses) {
        const agreeablenessQuestions = [1, 4, 5, 10, 11];
        let score = 50;
        agreeablenessQuestions.forEach(qIndex => {
            const response = responses[qIndex];
            if (response <= 1) score += 8;
            else if (response >= 2) score -= 5;
        });
        return Math.max(0, Math.min(100, score));
    }

    calculateNeuroticism(responses) {
        const neuroticismQuestions = [0, 4, 8, 9];
        let score = 50;
        neuroticismQuestions.forEach(qIndex => {
            const response = responses[qIndex];
            if (response <= 1) score += 8;
            else if (response >= 2) score -= 5;
        });
        return Math.max(0, Math.min(100, score));
    }

    extractResponses(userPreferences) {
        const preferenceFields = [
            'morningRoutine', 'placePreference', 'travelPace', 'foodPreferences',
            'backupPlanning', 'memoryCapturing', 'photographyStyle', 'musicPreferences',
            'spontaneityLevel', 'packingPhilosophy', 'groupDynamics', 'memorableElements'
        ];
        return preferenceFields.map(field => {
            const value = userPreferences[field];
            return value !== undefined && value !== null ? parseInt(value) : 1;
        });
    }

    generatePersonalityRecommendations(personalityResult) {
        const scores = personalityResult.big_five_scores || personalityResult.fallback?.big_five_scores;
        const dominantTrait = personalityResult.dominantTrait || personalityResult.fallback?.dominant_trait;

        if (!scores) {
            return {
                activities: ['cultural tours', 'local experiences', 'scenic views'],
                accommodations: ['comfortable hotels', 'local guesthouses'],
                dining: ['local restaurants', 'street food'],
                style: ['balanced', 'flexible']
            };
        }

        const recommendations = {
            activities: [],
            accommodations: [],
            dining: [],
            style: []
        };

        if (scores.Openness >= 70) {
            recommendations.activities.push('cultural immersion', 'off-beaten-path adventures', 'artistic experiences');
        } else if (scores.Openness <= 30) {
            recommendations.activities.push('familiar activities', 'comfortable experiences');
        }

        if (scores.Extraversion >= 70) {
            recommendations.activities.push('group tours', 'nightlife', 'social experiences');
        } else if (scores.Extraversion <= 30) {
            recommendations.activities.push('solo experiences', 'quiet activities', 'peaceful destinations');
        }

        if (scores.Conscientiousness >= 70) {
            recommendations.activities.push('organized tours', 'detailed itineraries', 'well-reviewed places');
            recommendations.accommodations.push('luxury hotels', 'high-end resorts');
        } else if (scores.Conscientiousness <= 30) {
            recommendations.activities.push('spontaneous adventures', 'flexible planning');
            recommendations.accommodations.push('budget-friendly options', 'unique stays');
        }

        if (scores.Agreeableness >= 70) {
            recommendations.activities.push('community experiences', 'local interactions', 'family-friendly activities');
        }

        if (scores.Neuroticism >= 70) {
            recommendations.activities.push('relaxing activities', 'safe destinations');
            recommendations.accommodations.push('all-inclusive resorts', 'comfortable hotels');
        }

        if (scores.Openness >= 70 && scores.Extraversion >= 70) {
            recommendations.style.push('adventurous', 'social');
        } else if (scores.Conscientiousness >= 70) {
            recommendations.style.push('organized', 'luxury');
        } else if (scores.Neuroticism >= 70) {
            recommendations.style.push('comfortable', 'safe');
        } else {
            recommendations.style.push('balanced', 'flexible');
        }

        if (recommendations.activities.length === 0) {
            recommendations.activities.push('cultural tours', 'local experiences');
        }
        if (recommendations.accommodations.length === 0) {
            recommendations.accommodations.push('comfortable hotels');
        }
        if (recommendations.dining.length === 0) {
            recommendations.dining.push('local restaurants');
        }

        return recommendations;
    }
}

module.exports = BigFiveService; 