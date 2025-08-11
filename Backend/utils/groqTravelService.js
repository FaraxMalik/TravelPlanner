const Groq = require('groq-sdk');

class GroqTravelService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        
        if (!this.apiKey) {
            console.log('❌ GROQ_API_KEY not found in environment variables');
            return;
        }

        this.groq = new Groq({
            apiKey: this.apiKey
        });

        console.log('✅ GroqTravelService initialized');
    }

    /**
     * Generate personalized travel itinerary using Groq
     */
    async generatePersonalizedItinerary(params) {
        try {
            // Check if Groq service is properly initialized
            if (!this.groq) {
                console.log('⚠️ Groq service not initialized - API key missing');
                return {
                    success: false,
                    error: 'Groq API key not configured',
                    fallback: this.generateFallbackItinerary(params)
                };
            }

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

            console.log('🚀 Generating itinerary with Groq...');
            console.log('📍 Destination:', destination);
            console.log('📅 Dates:', travel_dates);
            console.log('🧠 Personality Description:', personalityDescription);
            console.log('💰 Budget:', total_budget);

            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are an expert travel planner specializing in personality-based travel recommendations. Always respond with valid JSON format."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "llama-3.3-70b-versatile", // Latest Llama 3.3 model for complex tasks
                temperature: 0.7,
                max_tokens: 4000,
                top_p: 1,
                stop: null
            });

            const text = completion.choices[0]?.message?.content || '';
            
            console.log('✅ Groq response received, length:', text.length);

            // Parse the structured response using same parser as Gemini
            const itinerary = this.parseItineraryResponse(text);

            return {
                success: true,
                itinerary,
                rawResponse: text
            };

        } catch (error) {
            console.error('❌ Groq itinerary generation error:', error);
            return {
                success: false,
                error: error.message,
                fallback: this.generateFallbackItinerary(params)
            };
        }
    }

    /**
     * Build itinerary prompt for Groq (same as Gemini)
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
     * Parse itinerary response with improved error handling
     */
    parseItineraryResponse(text) {
        try {
            console.log('Raw response text:', text.substring(0, 500) + '...');
            
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                let jsonText = jsonMatch[0];
                
                // More robust JSON cleaning
                jsonText = jsonText
                    .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
                    .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')  // Quote unquoted keys
                    .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ': "$1"$2')  // Quote unquoted string values
                    .replace(/"\s*\+\s*"/g, '')  // Remove string concatenation
                    .replace(/\\"/g, '"')  // Fix escaped quotes
                    .replace(/\n/g, ' ')  // Remove newlines that break JSON
                    .replace(/\t/g, ' ')  // Remove tabs
                    .replace(/,(\s*,)/g, ',')  // Remove duplicate commas
                    .replace(/:\s*,/g, ': null,')  // Fix empty values
                    .replace(/,(\s*})/g, '$1');  // Final trailing comma cleanup
                
                // Try parsing with cleaned JSON
                try {
                    return JSON.parse(jsonText);
                } catch (parseError) {
                    console.error('JSON parse error at position:', parseError.message);
                    console.error('Problematic JSON section:', jsonText.substring(Math.max(0, 12540), 12560));
                    
                    // Save the problematic response for debugging
                    const fs = require('fs');
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const filename = `debug_groq_response_${timestamp}.json`;
                    fs.writeFileSync(filename, jsonText, 'utf8');
                    console.log(`Saved problematic response to ${filename} for debugging`);
                    
                    // Try to fix common issues around position 12548
                    const problemArea = jsonText.substring(12540, 12560);
                    console.log('Problem area:', problemArea);
                    
                    // If there's a truncated response, try to complete it
                    if (jsonText.endsWith('...') || !jsonText.endsWith('}')) {
                        console.log('Response appears truncated, attempting to complete JSON structure');
                        jsonText = this.completeIncompleteJSON(jsonText);
                        return JSON.parse(jsonText);
                    }
                    
                    throw parseError;
                }
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
            console.error('Error parsing Groq itinerary response:', error);
            console.error('Raw response text (first 1000 chars):', text.substring(0, 1000));
            if (text.length > 12540) {
                console.error('Response section around error position:', text.substring(12540, 12570));
            }
            
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
                error: 'Parsed with fallback due to JSON issues: ' + error.message,
                raw_response: text.substring(0, 500) + '...'
            };
        }
    }

    /**
     * Helper method to complete truncated JSON responses
     */
    completeIncompleteJSON(jsonText) {
        try {
            // Count open and close braces/brackets
            const openBraces = (jsonText.match(/\{/g) || []).length;
            const closeBraces = (jsonText.match(/\}/g) || []).length;
            const openBrackets = (jsonText.match(/\[/g) || []).length;
            const closeBrackets = (jsonText.match(/\]/g) || []).length;
            
            // Remove any trailing incomplete content
            let cleaned = jsonText.replace(/,?\s*"[^"]*$/, ''); // Remove incomplete property
            cleaned = cleaned.replace(/,?\s*[^,}\]]*$/, ''); // Remove incomplete value
            
            // Add missing closing brackets and braces
            const missingBrackets = openBrackets - closeBrackets;
            const missingBraces = openBraces - closeBraces;
            
            for (let i = 0; i < missingBrackets; i++) {
                cleaned += ']';
            }
            for (let i = 0; i < missingBraces; i++) {
                cleaned += '}';
            }
            
            return cleaned;
        } catch (error) {
            console.error('Error completing JSON:', error);
            throw error;
        }
    }

    /**
     * Generate fallback itinerary (same as Gemini service)
     */
    generateFallbackItinerary(params) {
        const { destination, startDate, endDate, duration, total_budget } = params;

        return {
            trip_overview: {
                destination: destination || "Your Destination",
                duration: `${duration || 3} days`,
                budget: total_budget || 1000,
                traveler_type: "General_Traveler"
            },
            daily_plans: Array.from({ length: duration || 3 }, (_, i) => ({
                day: i + 1,
                theme: `Day ${i + 1} Exploration`,
                activities: [
                    {
                        name: "Morning Activities",
                        description: "Explore local attractions and culture",
                        time: "9:00 AM - 12:00 PM",
                        location: "City Center"
                    },
                    {
                        name: "Afternoon Adventures",
                        description: "Visit main tourist spots and local experiences",
                        time: "2:00 PM - 6:00 PM",
                        location: "Popular Areas"
                    },
                    {
                        name: "Evening Relaxation",
                        description: "Enjoy local cuisine and nightlife",
                        time: "7:00 PM - 10:00 PM",
                        location: "Restaurant District"
                    }
                ]
            })),
            weather_forecast: [
                {
                    date: startDate || "2024-01-01",
                    temperature: "Pleasant",
                    conditions: "Check local weather"
                }
            ],
            personality_optimization: {
                traveler_type_benefits: "A well-rounded itinerary suitable for most travelers",
                recommendations: [
                    "Pack comfortable walking shoes",
                    "Bring a camera for memories",
                    "Try local cuisine",
                    "Learn basic local phrases",
                    "Keep emergency contacts handy"
                ]
            }
        };
    }
}

module.exports = GroqTravelService;