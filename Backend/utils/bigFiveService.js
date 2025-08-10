const { spawn } = require('child_process');
const path = require('path');

class BigFiveService {
    constructor() {
        this.pythonScriptPath = path.join(__dirname, '../ml_models/big_five_percentage_predictor.py');
        this.modelPath = path.join(__dirname, '../ml_models/big_five_percentage_model.pkl');
    }

    async predictBigFivePersonality(userPreferences) {
        try {
            const preferenceFields = [
                'morningRoutine', 'placePreference', 'travelPace', 'foodPreferences',
                'backupPlanning', 'memoryCapturing', 'photographyStyle', 'musicPreferences',
                'spontaneityLevel', 'packingPhilosophy', 'groupDynamics', 'memorableElements'
            ];

            const userResponses = preferenceFields.map(field => {
                const value = userPreferences[field];
                if (value === undefined || value === null) {
                    throw new Error(`Missing preference field: ${field}`);
                }
                return parseInt(value);
            });

            console.log('🔮 Calling Python ML model with responses:', userResponses);
            const result = await this.callPythonModel(userResponses);
            
            if (result.success) {
                return {
                    success: true,
                    bigFiveScores: result.big_five_scores,
                    dominantTrait: result.dominant_trait,
                    travelerType: result.traveler_type,
                    personalityDescription: result.personality_description,
                    confidenceScores: result.confidence_scores,
                    descriptions: result.descriptions
                };
            } else {
                console.log('⚠️ Python model failed, using fallback analysis');
                return this.generateFallbackAnalysis(userResponses);
            }

        } catch (error) {
            console.error('BigFiveService prediction error:', error);
            return this.generateFallbackAnalysis(this.extractResponses(userPreferences));
        }
    }

    async callPythonModel(userResponses) {
        return new Promise((resolve, reject) => {
            // Convert responses array to comma-separated string for the script
            const responsesString = userResponses.join(',');
            
            const pythonProcess = spawn('py', [
                this.pythonScriptPath,
                responsesString
            ]);

            let stdout = '';
            let stderr = '';

            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        const result = JSON.parse(stdout);
                        resolve({ success: true, ...result });
                    } catch (parseError) {
                        console.error('Failed to parse Python output:', parseError);
                        resolve({ success: false, error: 'Parse error' });
                    }
                } else {
                    console.error('Python process failed:', stderr);
                    resolve({ success: false, error: stderr });
                }
            });

            pythonProcess.on('error', (error) => {
                console.error('Failed to start Python process:', error);
                resolve({ success: false, error: error.message });
            });
        });
    }

    generateFallbackAnalysis(userResponses) {
        console.log('🔄 Using fallback personality analysis');
        
        const analysis = {
            big_five_scores: {
                Openness: this.calculateOpenness(userResponses),
                Conscientiousness: this.calculateConscientiousness(userResponses),
                Extraversion: this.calculateExtraversion(userResponses),
                Agreeableness: this.calculateAgreeableness(userResponses),
                Neuroticism: this.calculateNeuroticism(userResponses)
            },
            dominant_trait: '',
            descriptions: {
                Openness: {
                    description: 'Cultural Explorers who love discovering unique and artistic places',
                    places_they_love: 'Museums, art galleries, historical sites, cultural centers, local markets, traditional workshops, archaeological ruins, heritage villages, street art districts, cultural festivals',
                    traveler_type: 'Cultural Explorer'
                },
                Conscientiousness: {
                    description: 'Luxury Seekers who prefer high-end and well-organized destinations',
                    places_they_love: 'Five-star hotels, fine dining restaurants, luxury spas, upscale shopping districts, premium resorts, exclusive clubs, high-end galleries, luxury cruise ships',
                    traveler_type: 'Luxury Seeker'
                },
                Extraversion: {
                    description: 'Social Party-Goers who thrive in vibrant and energetic environments',
                    places_they_love: 'Nightclubs, bars, beach parties, music festivals, social events, group tours, crowded markets, vibrant neighborhoods, sports venues, rooftop lounges',
                    traveler_type: 'Social Party-Goer'
                },
                Agreeableness: {
                    description: 'Community Connectors who value authentic local experiences and peaceful places',
                    places_they_love: 'Local communities, family restaurants, parks, gardens, temples, community centers, volunteer organizations, local homes, peaceful cafes, nature reserves',
                    traveler_type: 'Community Connector'
                },
                Neuroticism: {
                    description: 'Comfort Seekers who prefer safe, familiar, and relaxing destinations',
                    places_they_love: 'All-inclusive resorts, familiar chain restaurants, hotel pools, spa centers, safe tourist areas, guided tour buses, shopping malls, comfortable lounges',
                    traveler_type: 'Comfort Seeker'
                }
            }
        };

        const scores = analysis.big_five_scores;
        analysis.dominant_trait = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

        return { success: false, fallback: analysis };
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