const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiTravelService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            console.error('❌ GEMINI_API_KEY not found in environment variables');
            this.model = null;
        } else {
            console.log('✅ Gemini API key found, initializing...');
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }
    }

    /**
     * Generate comprehensive personalized travel plan with detailed day-by-day breakdown
     * @param {Object} params - Comprehensive travel plan parameters
     * @returns {Object} Detailed travel plan with weather, hotels, restaurants, activities
     */
    async generateComprehensiveTravelPlan(params) {
        try {
            if (!this.model) {
                console.error('❌ Gemini model not initialized - API key missing');
                return {
                    success: false,
                    error: 'Gemini API not available',
                    fallback: this.generateComprehensiveFallback(params)
                };
            }

            const {
                destination,
                startDate,
                endDate,
                tripDuration,
                budget,
                numberOfPeople,
                additionalInfo,
                travelerType,
                placesTheyLove,
                travelStyle,
                dominantTrait,
                bigFiveScores,
                userPreferences
            } = params;

            const prompt = this.buildComprehensivePrompt({
                destination,
                startDate,
                endDate,
                tripDuration,
                budget,
                numberOfPeople,
                additionalInfo,
                travelerType,
                placesTheyLove,
                travelStyle,
                dominantTrait,
                bigFiveScores,
                userPreferences
            });

            console.log('🤖 Generating comprehensive plan with Gemini...');
            console.log(`📍 Destination: ${destination}`);
            console.log(`📅 Duration: ${tripDuration} days`);
            console.log(`👥 People: ${numberOfPeople}`);
            console.log(`💰 Budget: $${budget}`);
            console.log(`🧠 Traveler Type: ${travelerType}`);
            console.log(`🎭 Travel Style: ${travelStyle}`);
            console.log(`📍 Places They Love: ${placesTheyLove}`);

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse the comprehensive response
            const comprehensivePlan = this.parseComprehensiveResponse(text);

            return {
                success: true,
                plan: comprehensivePlan,
                rawResponse: text
            };

        } catch (error) {
            console.error('Comprehensive travel plan generation error:', error);
            return {
                success: false,
                error: error.message,
                fallback: this.generateComprehensiveFallback(params)
            };
        }
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
     * Generate personalized itinerary (alternative method for compatibility)
     * @param {Object} params - Trip data parameters
     * @returns {Object} Personalized itinerary
     */
    async generatePersonalizedItinerary(params) {
        try {
            const {
                destination,
                travel_dates,
                duration,
                daily_budget,
                total_budget,
                travelers,
                additional_preferences,
                personalityDescription,
                userPreferences
            } = params;

            // Parse travel dates
            const [startDate, endDate] = travel_dates.split(' to ');

            const prompt = this.buildItineraryPrompt({
                destination,
                startDate,
                endDate,
                duration,
                daily_budget,
                total_budget,
                travelers,
                additional_preferences,
                personalityDescription,
                userPreferences
            });

            console.log('🔮 Generating itinerary with Gemini...');
            console.log('📍 Destination:', destination);
            console.log('📅 Dates:', travel_dates);
            console.log('🧠 Personality Description:', personalityDescription);
            console.log('📝 User Preferences:', userPreferences);
            console.log('💰 Budget:', total_budget);
            console.log('👤 Personality:', personalityDescription?.substring(0, 100) + '...');

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log('✅ Gemini response received, length:', text.length);

            // Parse the structured response
            const itinerary = this.parseItineraryResponse(text);

            return {
                success: true,
                itinerary,
                rawResponse: text
            };

        } catch (error) {
            console.error('❌ Gemini itinerary generation error:', error);
            return {
                success: false,
                error: error.message,
                fallback: this.generateFallbackItinerary(params)
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
     * Build comprehensive prompt for detailed travel planning
     */
    buildComprehensivePrompt(params) {
        const {
            destination,
            startDate,
            endDate,
            tripDuration,
            budget,
            numberOfPeople,
            additionalInfo,
            travelerType,
            placesTheyLove,
            travelStyle,
            dominantTrait,
            bigFiveScores,
            userPreferences
        } = params;

        return `You are the world's most advanced AI travel planner with expertise in psychology-based travel recommendations and real-time data access. Create a comprehensive, highly personalized travel plan based on scientifically-backed personality analysis from a trained machine learning model.

**🎯 TRIP OVERVIEW:**
- Destination: ${destination}
- Dates: ${startDate} to ${endDate} (${tripDuration} days)
- Budget: $${budget} USD total
- Number of People: ${numberOfPeople}
- Additional Info: ${additionalInfo || 'None provided'}

**🧠 SCIENTIFIC PERSONALITY ANALYSIS:**
- Traveler Type: ${travelerType} (ML Model Prediction)
- Dominant Personality Trait: ${dominantTrait}
- Places This Traveler Specifically Loves: ${placesTheyLove}
- Travel Style: ${travelStyle}
- Big Five Personality Scores: ${JSON.stringify(bigFiveScores, null, 2)}

**👤 USER TRAVEL PREFERENCES:**
- Morning Routine: ${this.getPreferenceText(userPreferences.morningRoutine, 'morning')}
- Place Preference: ${this.getPreferenceText(userPreferences.placePreference, 'place')}
- Travel Pace: ${this.getPreferenceText(userPreferences.travelPace, 'pace')}
- Food Preferences: ${this.getPreferenceText(userPreferences.foodPreferences, 'food')}
- Spontaneity Level: ${this.getPreferenceText(userPreferences.spontaneityLevel, 'spontaneity')}
- Group Dynamics: ${this.getPreferenceText(userPreferences.groupDynamics, 'group')}

**📋 COMPREHENSIVE REQUIREMENTS:**

1. **WEATHER FORECAST**: Include actual weather predictions for each day of travel
2. **HOTEL RECOMMENDATIONS**: 3-4 specific hotels within budget that match their ${travelerType} personality
3. **DAY-BY-DAY BREAKDOWN**: Detailed plan for morning (8AM-12PM), afternoon (12PM-6PM), evening (6PM-10PM) for EVERY day
4. **RESTAURANT SUGGESTIONS**: Specific restaurants for breakfast, lunch, and dinner each day
5. **EXACT LOCATIONS**: Real addresses, operating hours, and contact information
6. **BUDGET BREAKDOWN**: Detailed cost analysis for accommodation, food, activities, transport
7. **PERSONALITY MATCHING**: Explain why each recommendation matches their ${travelerType} personality
8. **PRACTICAL TIPS**: Travel tips specific to the weather and destination during those dates
9. **TRANSPORTATION**: Best travel methods between locations
10. **EMERGENCY INFO**: Important contacts and backup plans

**🎯 PERSONALITY-SPECIFIC FOCUS:**
Since this is a ${travelerType} traveler who loves: ${placesTheyLove}
Travel Style: ${travelStyle}
- Prioritize these types of places and experiences
- Ensure activities align with their personality profile
- Consider their ${dominantTrait} trait as the primary influence
- Match restaurant choices to their food preferences
- Plan pace according to their travel style

**📊 REQUIRED JSON RESPONSE FORMAT:**

{
  "trip_overview": {
    "destination": "${destination}",
    "dates": {"start": "${startDate}", "end": "${endDate}"},
    "duration": "${tripDuration} days",
    "budget": ${budget},
    "people": ${numberOfPeople},
    "traveler_type": "${travelerType}"
  },
  "weather_forecast": [
    {
      "date": "YYYY-MM-DD",
      "temperature_high": "XX°C",
      "temperature_low": "XX°C", 
      "conditions": "Sunny/Cloudy/Rainy/Snow",
      "humidity": "XX%",
      "precipitation_chance": "XX%",
      "travel_tips": "Weather-specific advice for this day",
      "recommended_clothing": "What to wear",
      "indoor_backup_activities": "If weather is bad"
    }
  ],
  "accommodation_recommendations": [
    {
      "name": "Exact Hotel Name",
      "address": "Complete street address",
      "phone": "+XX-XXX-XXX-XXXX",
      "website": "hotel-website.com",
      "rating": "X.X stars",
      "price_per_night": "$XXX",
      "total_cost": "$XXX for ${tripDuration} nights",
      "personality_match": "Why perfect for ${travelerType}",
      "key_amenities": ["WiFi", "Gym", "Pool", "Restaurant"],
      "nearby_attractions": "What's within walking distance",
      "booking_tips": "Best way to book, cancellation policy"
    }
  ],
  "daily_itinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "day_theme": "Cultural Exploration/Adventure/Relaxation/Food Discovery",
      "weather": {
        "high": "XX°C",
        "low": "XX°C",
        "conditions": "Sunny/Cloudy",
        "outfit_suggestion": "Light jacket, comfortable shoes"
      },
      "morning": {
        "time_slot": "8:00 AM - 12:00 PM",
        "activities": [
          {
            "name": "Exact Attraction Name",
            "address": "Complete street address",
            "phone": "+XX-XXX-XXX-XXXX",
            "opening_hours": "9:00 AM - 6:00 PM",
            "duration": "2 hours",
            "cost": "$XX per person",
            "description": "Detailed description of what to see/do",
            "why_perfect_for_personality": "Specific reason this matches ${travelerType}",
            "best_photo_spots": "Where to take pictures",
            "insider_tips": "Local secrets and advice",
            "transportation_to_next": "Walk 5 minutes / Take bus #X"
          }
        ],
        "breakfast": {
          "restaurant": "Exact Restaurant Name",
          "address": "Complete street address", 
          "phone": "+XX-XXX-XXX-XXXX",
          "cuisine_type": "Italian/French/Local/International",
          "price_range": "$XX-XX per person",
          "must_try_dishes": ["Dish 1", "Dish 2"],
          "why_chosen": "Matches ${travelerType} food preferences",
          "reservation_needed": "Yes/No",
          "opening_hours": "7:00 AM - 11:00 AM"
        }
      },
      "afternoon": {
        "time_slot": "12:00 PM - 6:00 PM",
        "activities": [
          {
            "name": "Exact Attraction Name",
            "address": "Complete street address",
            "phone": "+XX-XXX-XXX-XXXX",
            "opening_hours": "10:00 AM - 8:00 PM",
            "duration": "3 hours",
            "cost": "$XX per person",
            "description": "Detailed description of what to see/do",
            "why_perfect_for_personality": "Specific reason this matches ${travelerType}",
            "best_photo_spots": "Where to take pictures",
            "insider_tips": "Local secrets and advice",
            "transportation_to_next": "Walk 10 minutes / Take metro line X"
          }
        ],
        "lunch": {
          "restaurant": "Exact Restaurant Name",
          "address": "Complete street address",
          "phone": "+XX-XXX-XXX-XXXX", 
          "cuisine_type": "Italian/French/Local/International",
          "price_range": "$XX-XX per person",
          "must_try_dishes": ["Dish 1", "Dish 2"],
          "why_chosen": "Matches ${travelerType} food preferences",
          "reservation_needed": "Yes/No",
          "opening_hours": "12:00 PM - 3:00 PM"
        }
      },
      "evening": {
        "time_slot": "6:00 PM - 10:00 PM",
        "activities": [
          {
            "name": "Exact Attraction Name",
            "address": "Complete street address",
            "phone": "+XX-XXX-XXX-XXXX",
            "opening_hours": "6:00 PM - 11:00 PM",
            "duration": "2 hours", 
            "cost": "$XX per person",
            "description": "Detailed description of what to see/do",
            "why_perfect_for_personality": "Specific reason this matches ${travelerType}",
            "best_photo_spots": "Where to take pictures",
            "insider_tips": "Local secrets and advice"
          }
        ],
        "dinner": {
          "restaurant": "Exact Restaurant Name",
          "address": "Complete street address",
          "phone": "+XX-XXX-XXX-XXXX",
          "cuisine_type": "Italian/French/Local/International", 
          "price_range": "$XX-XX per person",
          "must_try_dishes": ["Dish 1", "Dish 2"],
          "why_chosen": "Matches ${travelerType} food preferences",
          "reservation_needed": "Yes/No",
          "opening_hours": "6:00 PM - 11:00 PM"
        }
      },
      "daily_summary": {
        "total_cost_per_person": "$XXX",
        "total_distance_walked": "X km",
        "transportation_costs": "$XX",
        "highlights": "Top 3 experiences of the day",
        "personality_alignment": "How this day perfectly matches ${travelerType} preferences",
        "energy_level": "High/Medium/Low - matches their preferences",
        "backup_indoor_activities": "If weather is bad"
      }
    }
  ],
  "budget_breakdown": {
    "accommodation": {
      "total": "$XXX",
      "per_night": "$XX", 
      "per_person": "$XX"
    },
    "meals": {
      "total": "$XXX",
      "breakfast_total": "$XX",
      "lunch_total": "$XX", 
      "dinner_total": "$XX",
      "per_person_per_day": "$XX"
    },
    "activities": {
      "total": "$XXX",
      "per_person": "$XX",
      "most_expensive": "Activity name - $XX",
      "free_activities": ["Free activity 1", "Free activity 2"]
    },
    "transportation": {
      "total": "$XXX",
      "local_transport": "$XX",
      "between_cities": "$XX",
      "recommendations": "Best transport options for ${travelerType}"
    },
    "miscellaneous": {
      "total": "$XXX",
      "souvenirs": "$XX",
      "tips": "$XX",
      "emergency_fund": "$XX"
    },
    "daily_spending": "$XX per person per day",
    "budget_remaining": "$XX",
    "money_saving_tips": ["Tip 1", "Tip 2", "Tip 3"]
  },
  "transportation_guide": {
    "getting_around": [
      {
        "method": "Public Transport/Walking/Taxi/Rental Car",
        "cost": "$XX per day",
        "why_perfect": "Matches ${travelerType} travel style",
        "booking_info": "How to book/buy tickets",
        "apps_to_download": ["App 1", "App 2"],
        "tips": "Insider transportation tips"
      }
    ],
    "airport_transfer": {
      "method": "Train/Bus/Taxi/Uber",
      "cost": "$XX",
      "duration": "XX minutes",
      "booking_details": "How to book in advance"
    }
  },
  "personality_optimization": {
    "traveler_type_benefits": "Why this plan is perfect for ${travelerType}",
    "dominant_trait_influence": "How ${dominantTrait} shaped every recommendation",
    "preferred_places_included": "How we incorporated: ${personalityDescription}",
    "customization_highlights": ["Key personalization 1", "Key personalization 2", "Key personalization 3"],
    "flexibility_options": "How to adjust plan based on mood/weather"
  },
  "practical_information": {
    "emergency_contacts": {
      "local_emergency": "XXX",
      "police": "XXX", 
      "medical": "XXX",
      "tourist_helpline": "+XX-XXX-XXX-XXXX"
    },
    "important_numbers": {
      "embassy": "+XX-XXX-XXX-XXXX",
      "travel_insurance": "Policy details",
      "hotel_contact": "+XX-XXX-XXX-XXXX"
    },
    "local_customs": {
      "tipping_culture": "How much to tip",
      "dress_code": "What's appropriate",
      "cultural_etiquette": "Do's and don'ts",
      "language_basics": ["Hello", "Thank you", "Excuse me"]
    },
    "health_and_safety": {
      "medical_facilities": "Nearest hospitals",
      "pharmacies": "24-hour pharmacy locations",
      "safety_tips": "Area-specific safety advice",
      "travel_insurance_tips": "What to know"
    }
  },
  "special_recommendations": {
    "hidden_gems": "Secret spots only locals know",
    "photo_opportunities": "Best Instagram spots for ${travelerType}",
    "seasonal_specialties": "Special events/activities during travel dates",
    "local_experiences": "Unique experiences matching their personality",
    "souvenir_shopping": "Best places for meaningful souvenirs"
  }
}

**🚨 CRITICAL REQUIREMENTS:**
1. ALL information must be REAL and ACCURATE (real addresses, phone numbers, opening hours)
2. EVERY recommendation must explain WHY it matches the ${travelerType} personality
3. Include EXACT costs in USD for everything
4. Provide SPECIFIC weather forecasts for travel dates  
5. Ensure the plan stays within the $${budget} budget
6. Give DETAILED daily plans for all ${tripDuration} days
7. Include PRACTICAL contact information and addresses
8. Explain the PERSONALITY SCIENCE behind each choice
9. Provide BACKUP plans for bad weather
10. Make it ACTIONABLE - the user should be able to follow this plan immediately

Create the most comprehensive, personalized travel plan ever generated, perfectly tailored to a ${travelerType} personality with ${dominantTrait} as their dominant trait.`;
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
     * Build itinerary prompt for Gemini
     */
    buildItineraryPrompt(params) {
        const {
            destination,
            startDate,
            endDate,
            duration,
            daily_budget,
            total_budget,
            travelers,
            additional_preferences,
            personalityDescription,
            userPreferences
        } = params;

        return `You are an expert travel planner with deep knowledge of psychology and travel preferences. Create a highly personalized travel itinerary based on the user's detailed personality analysis.

**TRAVEL REQUEST:**
- Destination: ${destination}
- Dates: ${startDate} to ${endDate}
- Duration: ${duration} days
- Daily Budget: $${daily_budget}
- Total Budget: $${total_budget}
- Number of Travelers: ${travelers}
- Additional Preferences: ${additional_preferences}

**DETAILED PERSONALITY ANALYSIS:**
${personalityDescription}

**USER PREFERENCES DATA:**
${userPreferences ? Object.entries(userPreferences).map(([key, value]) => `${key}: ${value}`).join('\n') : 'Not specified'}

**CRITICAL: EXACT JSON FORMAT REQUIRED**
You MUST respond with ONLY valid JSON in this EXACT structure:

{
  "trip_overview": {
    "destination": "${destination}",
    "duration": ${duration},
    "total_budget": ${total_budget},
    "traveler_type": "Based on personality analysis"
  },
  "daily_plans": [
    {
      "day": 1,
      "morning": {
        "time": "8:00 AM - 12:00 PM",
        "activities": "Detailed morning activities with specific places and costs",
        "cost": 50,
        "personality_reason": "Why this fits their personality"
      },
      "noon": {
        "time": "12:00 PM - 4:00 PM", 
        "activities": "Detailed afternoon activities with specific places and costs",
        "cost": 75,
        "personality_reason": "Why this fits their personality"
      },
      "evening": {
        "time": "4:00 PM - 10:00 PM",
        "activities": "Detailed evening activities with specific places and costs", 
        "cost": 60,
        "personality_reason": "Why this fits their personality"
      },
      "daily_total": 185
    }
  ],
  "weather_forecast": [
    {
      "day": 1,
      "condition": "Sunny",
      "temperature": "22°C - 28°C",
      "precautions": "Wear sunscreen, carry water"
    }
  ],
  "hotels_to_stay": [
    {
      "name": "Hotel Name",
      "location": "Exact address",
      "price_per_night": 80,
      "why_recommended": "Matches personality traits",
      "amenities": ["WiFi", "Breakfast", "Pool"]
    }
  ],
  "transportation": {
    "to_destination": {
      "method": "Flight/Train/Bus",
      "cost": 200,
      "details": "Specific recommendations"
    },
    "local_transport": {
      "recommended": "Metro/Taxi/Walking",
      "daily_cost": 15,
      "personality_fit": "Why this suits their style"
    }
  },
  "other_information": {
    "packing_tips": ["Item 1", "Item 2"],
    "cultural_notes": "Important cultural information",
    "emergency_contacts": "Local emergency numbers",
    "personality_optimization": "How to maximize enjoyment based on their traits"
  }
}

**REQUIREMENTS:**
1. Include ALL ${duration} days in daily_plans
2. Each day MUST have morning, noon, and evening sections
3. All costs must be realistic and add up correctly
4. Every recommendation must explain the personality connection
5. Use specific place names, addresses, and realistic pricing
6. Weather should cover all days
7. Response must be ONLY valid JSON - no extra text before or after`;
    }

    /**
     * Parse itinerary response
     */
    parseItineraryResponse(text) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                let jsonText = jsonMatch[0];
                
                // Clean up common JSON issues from Gemini
                jsonText = jsonText
                    .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
                    .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')  // Quote unquoted keys
                    .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ': "$1"$2')  // Quote unquoted string values
                    .replace(/"\s*\+\s*"/g, '')  // Remove string concatenation
                    .replace(/\\"/g, '"')  // Fix escaped quotes
                    .replace(/\n/g, ' ')  // Remove newlines that break JSON
                    .replace(/\t/g, ' ');  // Remove tabs
                
                return JSON.parse(jsonText);
            }

            // If no JSON found, create a basic structured response
            return {
                trip_overview: {
                    destination: "Generated Trip",
                    duration: "3 days",
                    budget: 1000,
                    traveler_type: "Cultural_Explorer"
                },
                daily_plans: [
                    {
                        day: 1,
                        theme: "Arrival and Exploration",
                        activities: [
                            {
                                name: "City Overview",
                                description: "General city exploration and orientation",
                                time: "9:00 AM - 6:00 PM"
                            }
                        ]
                    }
                ],
                weather_forecast: [],
                personality_optimization: {
                    traveler_type_benefits: "This itinerary is customized for your travel preferences"
                },
                budget_breakdown: "Budget analysis included in full response",
                raw_response: text.substring(0, 1000) // Limit raw response size
            };

        } catch (error) {
            console.error('Error parsing itinerary response:', error);
            console.error('Raw response text:', text.substring(0, 500) + '...');
            
            // Return a valid fallback structure that matches expected format
            return {
                trip_overview: {
                    destination: "Fallback Trip",
                    duration: "1 day",
                    budget: 100,
                    traveler_type: "Explorer"
                },
                daily_plans: [
                    {
                        day: 1,
                        theme: "Basic Exploration",
                        activities: [
                            {
                                name: "General Sightseeing",
                                description: "Explore the destination at your own pace",
                                time: "All day"
                            }
                        ]
                    }
                ],
                weather_forecast: [],
                personality_optimization: {
                    traveler_type_benefits: "Basic itinerary with standard recommendations"
                },
                error: 'Parsed with fallback due to JSON issues',
                raw_response: text.substring(0, 500) + '...'
            };
        }
    }

    /**
     * Generate fallback itinerary
     */
    generateFallbackItinerary(params) {
        const { destination, startDate, endDate, duration, total_budget } = params;

        return {
            overview: `A wonderful ${duration}-day trip to ${destination}`,
            highlights: [
                "Explore local attractions",
                "Experience local cuisine",
                "Immerse in local culture"
            ],
            daily_plans: Array.from({ length: duration }, (_, i) => ({
                day: i + 1,
                date: startDate, // Should calculate actual dates
                activities: [
                    "Morning: Explore local area",
                    "Afternoon: Visit main attractions", 
                    "Evening: Enjoy local dining"
                ],
                estimated_cost: Math.round(total_budget / duration)
            })),
            budget_breakdown: {
                accommodation: Math.round(total_budget * 0.4),
                food: Math.round(total_budget * 0.3),
                activities: Math.round(total_budget * 0.2),
                transportation: Math.round(total_budget * 0.1)
            },
            personality_notes: "This itinerary has been tailored to your preferences"
        };
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

    /**
     * Parse comprehensive travel plan response from Gemini
     */
    parseComprehensiveResponse(text) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[0];
                const parsed = JSON.parse(jsonStr);
                return parsed;
            }
            
            // If no JSON found, create structured response from text
            return {
                trip_overview: {
                    raw_response: text,
                    parsing_status: 'fallback_text_parsing'
                },
                comprehensive_plan: text,
                note: "Gemini response was parsed as text due to JSON parsing issues"
            };
            
        } catch (error) {
            console.log('📝 Using text parsing for comprehensive response');
            return {
                comprehensive_plan: text,
                parsing_status: 'text_only',
                note: "Full comprehensive plan in text format"
            };
        }
    }

    /**
     * Generate comprehensive fallback plan
     */
    generateComprehensiveFallback(params) {
        const {
            destination,
            startDate,
            endDate,
            tripDuration,
            budget,
            numberOfPeople,
            travelerType,
            personalityDescription
        } = params;

        return {
            trip_overview: {
                destination,
                dates: { start: startDate, end: endDate },
                duration: `${tripDuration} days`,
                budget: budget,
                people: numberOfPeople,
                traveler_type: travelerType,
                status: 'fallback_plan'
            },
            weather_forecast: Array.from({length: tripDuration}, (_, i) => ({
                date: new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                temperature_high: "Check local weather",
                temperature_low: "Check local weather", 
                conditions: "Check weather app",
                travel_tips: "Check weather before heading out",
                recommended_clothing: "Layer appropriately"
            })),
            accommodation_recommendations: [
                {
                    name: `${travelerType}-friendly accommodation in ${destination}`,
                    price_per_night: `$${Math.round(budget * 0.3 / tripDuration)}`,
                    personality_match: `Perfect for ${travelerType} who loves: ${personalityDescription}`,
                    booking_tips: "Book through major travel sites for best rates"
                }
            ],
            daily_itinerary: Array.from({length: tripDuration}, (_, i) => ({
                day: i + 1,
                date: new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                day_theme: "Exploration & Discovery",
                morning: {
                    time_slot: "8:00 AM - 12:00 PM",
                    activities: [{
                        name: `${destination} highlights`,
                        description: `Explore places perfect for ${travelerType}`,
                        why_perfect_for_personality: `Matches your love for: ${personalityDescription}`,
                        cost: `$${Math.round(budget * 0.2 / tripDuration)}`,
                        insider_tips: "Start early to avoid crowds"
                    }],
                    breakfast: {
                        restaurant: "Local recommended café",
                        price_range: `$${Math.round(budget * 0.1 / tripDuration)}`,
                        why_chosen: `Fits ${travelerType} preferences`
                    }
                },
                afternoon: {
                    time_slot: "12:00 PM - 6:00 PM", 
                    activities: [{
                        name: `${destination} cultural sites`,
                        description: `Discover places that ${travelerType} travelers love`,
                        why_perfect_for_personality: personalityDescription,
                        cost: `$${Math.round(budget * 0.15 / tripDuration)}`
                    }],
                    lunch: {
                        restaurant: "Local recommended restaurant",
                        price_range: `$${Math.round(budget * 0.15 / tripDuration)}`
                    }
                },
                evening: {
                    time_slot: "6:00 PM - 10:00 PM",
                    activities: [{
                        name: `${destination} evening activities`,
                        description: `Evening experiences for ${travelerType}`,
                        cost: `$${Math.round(budget * 0.1 / tripDuration)}`
                    }],
                    dinner: {
                        restaurant: "Local recommended dining",
                        price_range: `$${Math.round(budget * 0.2 / tripDuration)}`
                    }
                },
                daily_summary: {
                    total_cost_per_person: `$${Math.round(budget / tripDuration / numberOfPeople)}`,
                    personality_alignment: `Day designed for ${travelerType} preferences`
                }
            })),
            budget_breakdown: {
                accommodation: {
                    total: `$${Math.round(budget * 0.4)}`,
                    per_night: `$${Math.round(budget * 0.4 / tripDuration)}`
                },
                meals: {
                    total: `$${Math.round(budget * 0.3)}`,
                    per_person_per_day: `$${Math.round(budget * 0.3 / tripDuration / numberOfPeople)}`
                },
                activities: {
                    total: `$${Math.round(budget * 0.25)}`,
                    per_person: `$${Math.round(budget * 0.25 / numberOfPeople)}`
                },
                transportation: {
                    total: `$${Math.round(budget * 0.05)}`,
                    recommendations: `Best options for ${travelerType}`
                }
            },
            personality_optimization: {
                traveler_type_benefits: `This plan is tailored for ${travelerType} personalities`,
                preferred_places_included: personalityDescription,
                customization_highlights: [
                    `Focuses on ${travelerType} preferred activities`,
                    `Budget allocated for ${personalityDescription}`,
                    `Pace suitable for your travel style`
                ]
            },
            note: "This is a fallback plan. For detailed recommendations, please try again or contact support."
        };
    }
}

module.exports = GeminiTravelService; 