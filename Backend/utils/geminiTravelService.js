const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiTravelService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    }

    /**
     * Generate personalized travel plan using Gemini AI
     * @param {Object} params - Travel plan parameters
     * @returns {Object} Personalized travel plan
     */
    async generatePersonalizedTravelPlan(params) {
        try {
            const {
                destination,
                startDate,
                endDate,
                budget,
                bigFiveScores,
                dominantTrait,
                personalityDescriptions,
                userPreferences,
                interests
            } = params;

            const prompt = this.buildTravelPlanPrompt({
                destination,
                startDate,
                endDate,
                budget,
                bigFiveScores,
                dominantTrait,
                personalityDescriptions,
                userPreferences,
                interests
            });

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse the structured response
            const travelPlan = this.parseTravelPlanResponse(text);

            return {
                success: true,
                travelPlan,
                rawResponse: text
            };

        } catch (error) {
            console.error('Gemini travel plan generation error:', error);
            return {
                success: false,
                error: error.message,
                fallback: this.generateFallbackPlan(params)
            };
        }
    }

    /**
     * Build comprehensive prompt for Gemini
     */
    buildTravelPlanPrompt(params) {
        const {
            destination,
            startDate,
            endDate,
            budget,
            bigFiveScores,
            dominantTrait,
            personalityDescriptions,
            userPreferences,
            interests
        } = params;

        return `You are an expert travel planner with deep knowledge of destinations worldwide. Create a highly personalized travel plan based on the user's Big Five personality traits and preferences.

**TRAVEL REQUEST:**
- Destination: ${destination}
- Dates: ${startDate} to ${endDate}
- Budget: $${budget}
- Interests: ${interests.join(', ')}

**USER'S PERSONALITY PROFILE:**
- Dominant Trait: ${dominantTrait}
- Big Five Scores: ${JSON.stringify(bigFiveScores, null, 2)}

**PERSONALITY DESCRIPTIONS:**
${Object.entries(personalityDescriptions).map(([trait, desc]) => 
    `${trait}: ${desc.description} (${desc.travel_preferences})`
).join('\n')}

**USER PREFERENCES:**
- Morning Routine: ${this.getPreferenceText(userPreferences.morningRoutine, 'morning')}
- Place Preference: ${this.getPreferenceText(userPreferences.placePreference, 'place')}
- Travel Pace: ${this.getPreferenceText(userPreferences.travelPace, 'pace')}
- Food Style: ${this.getPreferenceText(userPreferences.snackVibe, 'food')}
- Spontaneity: ${this.getPreferenceText(userPreferences.spontaneity, 'spontaneity')}

**INSTRUCTIONS:**
Create a highly detailed, day-by-day travel plan with specific places to visit each day. Each day should have a unique theme and specific locations. Include:

1. **ACCOMMODATION RECOMMENDATIONS** (2-3 options within budget)
2. **DAILY THEMES** (each day should have a different focus: cultural, adventure, relaxation, food, shopping, etc.)
3. **SPECIFIC PLACES TO VISIT** (exact locations, landmarks, attractions for each day)
4. **DETAILED DAILY ITINERARY** (morning, afternoon, evening with specific times and places)
5. **RESTAURANT SUGGESTIONS** (specific restaurants for breakfast, lunch, dinner each day)
6. **ACTIVITY RECOMMENDATIONS** (specific activities based on personality and interests)
7. **TRANSPORTATION OPTIONS** (how to get between places each day)
8. **WEATHER CONSIDERATIONS** (check weather for the dates)
9. **BUDGET BREAKDOWN** (accommodation, food, activities, transport)
10. **PERSONALIZATION NOTES** (why each place/activity matches their personality)

**RESPONSE FORMAT:**
Please respond in the following JSON structure:

{
  "destination": "${destination}",
  "dates": {
    "start": "${startDate}",
    "end": "${endDate}"
  },
  "budget": {
    "total": ${budget},
    "breakdown": {
      "accommodation": "estimated cost",
      "food": "estimated cost", 
      "activities": "estimated cost",
      "transportation": "estimated cost"
    }
  },
  "accommodations": [
    {
      "name": "Hotel name",
      "type": "Luxury/Mid-range/Budget",
      "price_range": "$XXX-XXX per night",
      "why_perfect": "Why this matches their personality",
      "location": "Area description",
      "amenities": ["amenity1", "amenity2"]
    }
  ],
  "daily_plans": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "Cultural/Adventure/Relaxation/Food/Shopping/Nature",
      "weather": {
        "temperature": "XX°C",
        "conditions": "Sunny/Cloudy/Rainy",
        "recommendations": "Weather-based suggestions"
      },
      "morning": {
        "time": "8:00 AM - 12:00 PM",
        "theme": "Morning theme (e.g., Cultural Immersion)",
        "places_to_visit": [
          {
            "name": "Specific landmark/attraction name",
            "address": "Exact address",
            "description": "What to see/do here",
            "duration": "1-2 hours",
            "cost": "$XX",
            "personality_fit": "Why this matches their ${dominantTrait} trait",
            "tips": "Best time to visit, photo spots, etc."
          }
        ],
        "total_cost": "$XX",
        "transportation": "How to get there (walk/taxi/bus)"
      },
      "afternoon": {
        "time": "12:00 PM - 5:00 PM",
        "theme": "Afternoon theme (e.g., Local Exploration)",
        "places_to_visit": [
          {
            "name": "Specific landmark/attraction name",
            "address": "Exact address",
            "description": "What to see/do here",
            "duration": "2-3 hours",
            "cost": "$XX",
            "personality_fit": "Why this matches their ${dominantTrait} trait",
            "tips": "Best time to visit, photo spots, etc."
          }
        ],
        "total_cost": "$XX",
        "transportation": "How to get there (walk/taxi/bus)"
      },
      "evening": {
        "time": "5:00 PM - 10:00 PM",
        "theme": "Evening theme (e.g., Nightlife & Dining)",
        "places_to_visit": [
          {
            "name": "Specific landmark/attraction name",
            "address": "Exact address",
            "description": "What to see/do here",
            "duration": "2-3 hours",
            "cost": "$XX",
            "personality_fit": "Why this matches their ${dominantTrait} trait",
            "tips": "Best time to visit, photo spots, etc."
          }
        ],
        "total_cost": "$XX",
        "transportation": "How to get there (walk/taxi/bus)"
      },
      "meals": {
        "breakfast": {
          "restaurant": "Specific restaurant name",
          "address": "Exact address",
          "type": "Café/Fine dining/Local",
          "cost": "$XX",
          "why_perfect": "Why this matches their food preferences",
          "must_try": "Signature dish to order"
        },
        "lunch": {
          "restaurant": "Specific restaurant name",
          "address": "Exact address",
          "type": "Café/Fine dining/Local", 
          "cost": "$XX",
          "why_perfect": "Why this matches their food preferences",
          "must_try": "Signature dish to order"
        },
        "dinner": {
          "restaurant": "Specific restaurant name",
          "address": "Exact address",
          "type": "Café/Fine dining/Local",
          "cost": "$XX", 
          "why_perfect": "Why this matches their food preferences",
          "must_try": "Signature dish to order"
        }
      },
      "day_summary": {
        "total_cost": "$XX",
        "total_distance": "XX km",
        "highlights": "Top 3 experiences of the day",
        "personality_alignment": "How this day matches their ${dominantTrait} trait"
      }
    }
  ],
  "transportation": {
    "recommendations": [
      {
        "type": "Public transport/Rental car/Taxi",
        "description": "Why this works for their personality",
        "cost": "$XX per day"
      }
    ]
  },
  "personalization_summary": {
    "dominant_trait_impact": "How ${dominantTrait} influenced the plan",
    "key_recommendations": "Top 3 personalized suggestions",
    "budget_optimization": "How to stay within budget"
  }
}

Make sure all recommendations are realistic, within budget, and perfectly aligned with the user's personality profile. Consider their ${dominantTrait} trait as the primary driver for recommendations.

**IMPORTANT:** Each day should have a different theme and focus. Provide specific, real places to visit with exact addresses. Include multiple places to visit each day (morning, afternoon, evening) with detailed descriptions of what to see/do at each location. Make the plan highly personalized based on their personality traits and preferences.`;
    }

    /**
     * Get human-readable preference text
     */
    getPreferenceText(value, category) {
        const preferences = {
            morning: {
                0: 'Sunrise walk & journaling (reflective)',
                1: 'Coffee and plan the day (organized)',
                2: 'Sleep in, it\'s a vacation (relaxed)',
                3: 'Straight to adventure! (adventurous)'
            },
            place: {
                0: 'Hike to a quiet waterfall (nature)',
                1: 'Chill at a beach café (relaxed)',
                2: 'Explore a buzzing local market (social)',
                3: 'Take a history tour of old forts (cultural)'
            },
            pace: {
                0: 'Hour-by-hour plan (organized)',
                1: 'Light structure, with room to wander (balanced)',
                2: 'Go with the flow (spontaneous)',
                3: 'Zero plan—surprise me! (adventurous)'
            },
            food: {
                0: 'Energy bar (practical)',
                1: 'Chai and biscuits (traditional)',
                2: 'Local street food (authentic)',
                3: 'Something fancy from a bakery (luxury)'
            },
            spontaneity: {
                0: 'No, stick to the plan (organized)',
                1: 'Maybe, if time allows (balanced)',
                2: 'Sure! Let\'s see where it leads (spontaneous)',
                3: 'Best part of the trip! (adventurous)'
            }
        };

        return preferences[category][value] || 'Not specified';
    }

    /**
     * Parse Gemini's structured response
     */
    parseTravelPlanResponse(text) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // If no JSON found, create a structured response
            return {
                destination: 'Unknown',
                dates: { start: 'Unknown', end: 'Unknown' },
                budget: { total: 0, breakdown: {} },
                accommodations: [],
                daily_plans: [],
                transportation: { recommendations: [] },
                personalization_summary: {
                    dominant_trait_impact: 'Analysis not available',
                    key_recommendations: 'Please check the raw response',
                    budget_optimization: 'Budget analysis not available'
                },
                raw_text: text
            };

        } catch (error) {
            console.error('Error parsing Gemini response:', error);
            return {
                error: 'Failed to parse response',
                raw_text: text
            };
        }
    }

    /**
     * Generate fallback plan if Gemini fails
     */
    generateFallbackPlan(params) {
        const { destination, startDate, endDate, budget, dominantTrait } = params;

        return {
            destination,
            dates: { start: startDate, end: endDate },
            budget: { total: budget, breakdown: {} },
            accommodations: [
                {
                    name: 'Standard Hotel',
                    type: 'Mid-range',
                    price_range: '$100-200 per night',
                    why_perfect: `Suitable for ${dominantTrait} personality`,
                    location: 'City center',
                    amenities: ['WiFi', 'Breakfast', '24/7 front desk']
                }
            ],
            daily_plans: [
                {
                    day: 1,
                    date: startDate,
                    weather: {
                        temperature: 'Check local weather',
                        conditions: 'Variable',
                        recommendations: 'Pack accordingly'
                    },
                    morning: {
                        activity: 'Explore local area',
                        location: 'City center',
                        duration: '2-3 hours',
                        cost: '$20',
                        personality_fit: `Activity suitable for ${dominantTrait} personality`
                    },
                    afternoon: {
                        activity: 'Visit main attractions',
                        location: 'Tourist areas',
                        duration: '3-4 hours',
                        cost: '$50',
                        personality_fit: `Activity suitable for ${dominantTrait} personality`
                    },
                    evening: {
                        activity: 'Dinner and relaxation',
                        location: 'Local restaurant',
                        duration: '2-3 hours',
                        cost: '$40',
                        personality_fit: `Activity suitable for ${dominantTrait} personality`
                    },
                    meals: {
                        breakfast: {
                            restaurant: 'Hotel breakfast',
                            type: 'Standard',
                            cost: '$15',
                            why_perfect: 'Convenient and reliable'
                        },
                        lunch: {
                            restaurant: 'Local café',
                            type: 'Casual',
                            cost: '$25',
                            why_perfect: 'Good local option'
                        },
                        dinner: {
                            restaurant: 'Local restaurant',
                            type: 'Casual',
                            cost: '$40',
                            why_perfect: 'Authentic local experience'
                        }
                    }
                }
            ],
            transportation: {
                recommendations: [
                    {
                        type: 'Public transport',
                        description: 'Cost-effective and convenient',
                        cost: '$10 per day'
                    }
                ]
            },
            personalization_summary: {
                dominant_trait_impact: `Plan adapted for ${dominantTrait} personality`,
                key_recommendations: 'Standard travel plan with personality considerations',
                budget_optimization: 'Budget-friendly options selected'
            }
        };
    }
}

module.exports = GeminiTravelService; 