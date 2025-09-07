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
    // Generates a personalized itinerary using Groq LLM
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
                max_tokens: Math.min(4000, Math.max(1500, duration * 150)), // Adjust tokens based on trip length
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

        return `You are an expert travel planner with deep knowledge of destinations and weather patterns. Create a comprehensive travel itinerary with detailed weather information for each day.

**TRAVEL REQUEST:**
- Destination: ${destination}
- Dates: ${startDate} to ${endDate}
- Duration: ${duration} days
- Daily Budget: £${daily_budget}
- Total Budget: £${total_budget}
- Number of Travelers: ${travelers}
- Additional Preferences: ${additional_preferences}

**PERSONALITY CONTEXT (FOR INTERNAL USE ONLY):**
${personalityDescription}

**USER PREFERENCES:**
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
        "cost": 50
      },
      "noon": {
        "time": "12:00 PM - 4:00 PM", 
        "activities": "Detailed afternoon activities with specific places and costs",
        "cost": 75
      },
      "evening": {
        "time": "4:00 PM - 10:00 PM",
        "activities": "Detailed evening activities with specific places and costs", 
        "cost": 60
      },
      "daily_total": 185
    }
  ],
  "weather_forecast": [
    {
      "day": 1,
      "date": "${startDate}",
      "condition": "Sunny/Cloudy/Rainy/Snowy",
      "temperature": "22°C - 28°C (or local temperature range)",
      "humidity": "65%",
      "wind_speed": "15 km/h",
      "precipitation": "0%",
      "precautions": "Wear sunscreen, carry water, umbrella if needed",
      "clothing_suggestions": "Light clothing, comfortable shoes, hat"
    }
  ],
  "hotels_to_stay": [
    {
      "name": "Hotel Name",
      "location": "Exact address with neighborhood",
      "price_per_night": 80,
      "rating": "4.5/5",
      "amenities": ["WiFi", "Breakfast", "Pool", "Gym"],
      "booking_tips": "Book in advance for better rates"
    }
  ],
  "transportation": {
    "to_destination": {
      "method": "Flight/Train/Bus",
      "cost": 200,
      "duration": "3 hours",
      "details": "Specific recommendations and booking tips"
    },
    "local_transport": {
      "recommended": "Metro/Taxi/Walking",
      "daily_cost": 15,
      "tips": "Best transport options for this destination"
    }
  },
  "other_information": {
    "packing_tips": ["Essential items for the weather", "Comfortable walking shoes", "Local customs clothing"],
    "cultural_notes": "Important cultural information and etiquette",
    "emergency_contacts": "Local emergency numbers and important contacts",
    "budget_tips": "Ways to save money and get the best value",
    "local_cuisine": ["Must-try dishes", "Recommended restaurants", "Food safety tips"],
    "safety_tips": ["General safety guidelines", "Areas to avoid", "Emergency procedures"]
  }
}

**REQUIREMENTS:**
1. Include ALL ${duration} days in daily_plans
2. Each day MUST have morning, noon, and evening sections
3. All costs must be realistic and add up correctly
4. Weather forecast must include daily information for ALL ${duration} days
5. Use specific place names and realistic pricing
6. Keep activity descriptions concise (max ${duration > 10 ? '50' : '100'} characters each)
7. Weather should account for seasonal patterns of ${destination}
8. Response must be ONLY valid JSON - no extra text before or after
9. Keep total response under ${Math.min(8000, Math.max(3000, duration * 300))} characters to prevent truncation
10. DO NOT include personality reasoning in activities - focus on practical travel information`;
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
                    
                    // If response is truncated, try to complete it
                    if (jsonText.length > 8000 && !jsonText.endsWith('}')) {
                        console.log('🔧 Attempting to repair truncated JSON response...');
                        jsonText = this.repairTruncatedJSON(jsonText);
                        try {
                            return JSON.parse(jsonText);
                        } catch (repairError) {
                            console.error('Failed to repair JSON:', repairError.message);
                        }
                    }
                    
                    // Save the problematic response for debugging
                    const fs = require('fs');
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const filename = `debug_groq_response_${timestamp}.json`;
                    fs.writeFileSync(filename, jsonText, 'utf8');
                    console.log(`Saved problematic response to ${filename} for debugging`);
                    
                    // Return a valid fallback structure
                    return this.createFallbackResponse(text);
                }
            }

            // If no JSON found, create a basic structured response
            return this.createFallbackResponse(text);

        } catch (error) {
            console.error('Error parsing Groq itinerary response:', error);
            console.error('Raw response text (first 1000 chars):', text.substring(0, 1000));
            
            // Return a valid fallback structure that matches expected format
            return this.createFallbackResponse(text);
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

    /**
     * Repair truncated JSON by attempting to complete the structure
     */
    repairTruncatedJSON(jsonText) {
        try {
            // Remove any incomplete last property that might be causing issues
            let repaired = jsonText;
            
            // Find the last complete comma
            const lastCommaIndex = jsonText.lastIndexOf(',');
            const lastBraceIndex = jsonText.lastIndexOf('{');
            const lastBracketIndex = jsonText.lastIndexOf('[');
            
            // If we have incomplete content after the last comma, remove it
            if (lastCommaIndex > lastBraceIndex && lastCommaIndex > lastBracketIndex) {
                const afterComma = jsonText.substring(lastCommaIndex + 1).trim();
                // If the content after comma doesn't look like a complete property, remove it
                if (!afterComma.includes(':') || !afterComma.includes('"')) {
                    repaired = jsonText.substring(0, lastCommaIndex);
                }
            }
            
            // Count unmatched braces and brackets
            const openBraces = (repaired.match(/\{/g) || []).length;
            const closeBraces = (repaired.match(/\}/g) || []).length;
            const openBrackets = (repaired.match(/\[/g) || []).length;
            const closeBrackets = (repaired.match(/\]/g) || []).length;
            
            // Close unmatched brackets first
            for (let i = 0; i < (openBrackets - closeBrackets); i++) {
                repaired += ']';
            }
            
            // Close unmatched braces
            for (let i = 0; i < (openBraces - closeBraces); i++) {
                repaired += '}';
            }
            
            return repaired;
        } catch (error) {
            console.error('Error repairing JSON:', error);
            return jsonText;
        }
    }

    /**
     * Detect if JSON response appears to be truncated
     */
    detectTruncation(jsonText, errorPosition) {
        // Check if response ends abruptly
        const endsAbruptly = !jsonText.trim().endsWith('}') && !jsonText.trim().endsWith(']');
        
        // Check if error position is near the end of the text
        const nearEnd = errorPosition > (jsonText.length - 100);
        
        // Check for incomplete strings at the end
        const hasIncompleteString = jsonText.trim().endsWith('"') && 
            jsonText.substring(jsonText.lastIndexOf('"', jsonText.length - 2)).includes(':');
        
        return endsAbruptly || nearEnd || hasIncompleteString;
    }

    /**
     * Create a consistent fallback response structure
     */
    createFallbackResponse(originalText) {
        return {
            trip_overview: {
                destination: "Generated Trip",
                duration: 3,
                total_budget: 1000,
                traveler_type: "Explorer"
            },
            daily_plans: [
                {
                    day: 1,
                    morning: {
                        time: "8:00 AM - 12:00 PM",
                        activities: "Arrival and local orientation, hotel check-in",
                        cost: 50
                    },
                    noon: {
                        time: "12:00 PM - 4:00 PM",
                        activities: "City exploration and main attractions visit",
                        cost: 75
                    },
                    evening: {
                        time: "4:00 PM - 10:00 PM",
                        activities: "Local dining and cultural experiences",
                        cost: 60
                    },
                    daily_total: 185
                }
            ],
            weather_forecast: [
                {
                    day: 1,
                    date: new Date().toISOString().split('T')[0],
                    condition: "Pleasant",
                    temperature: "22°C - 28°C",
                    humidity: "65%",
                    wind_speed: "15 km/h",
                    precipitation: "10%",
                    precautions: "Carry light jacket and water",
                    clothing_suggestions: "Comfortable walking attire"
                }
            ],
            hotels_to_stay: [
                {
                    name: "Recommended Hotel",
                    location: "City Center",
                    price_per_night: 80,
                    rating: "4.0/5",
                    amenities: ["WiFi", "Breakfast", "AC"],
                    booking_tips: "Book in advance for better rates"
                }
            ],
            transportation: {
                to_destination: {
                    method: "Flight/Train/Bus",
                    cost: 200,
                    duration: "2-4 hours",
                    details: "Multiple options available"
                },
                local_transport: {
                    recommended: "Public transport/Walking",
                    daily_cost: 15,
                    tips: "Use local transport apps"
                }
            },
            other_information: {
                packing_tips: ["Comfortable shoes", "Weather-appropriate clothing", "Travel documents"],
                cultural_notes: "Research local customs and etiquette",
                emergency_contacts: "Save local emergency numbers",
                budget_tips: "Look for local deals and free activities",
                local_cuisine: ["Try local specialties", "Visit recommended restaurants"],
                safety_tips: ["Stay aware of surroundings", "Keep valuables secure"]
            },
            error: `Fallback used due to parsing error. Original response length: ${originalText.length} characters`,
            raw_response_preview: originalText.substring(0, 500) + '...'
        };
    }

    /**
     * Create a fallback response when JSON parsing completely fails
     */
    createFallbackResponse(originalText) {
        // Try to extract some basic information from the failed response
        const destinationMatch = originalText.match(/"destination":\s*"([^"]+)"/);
        const durationMatch = originalText.match(/"duration":\s*(\d+)/);
        const budgetMatch = originalText.match(/"total_budget":\s*(\d+)/);
        
        const destination = destinationMatch ? destinationMatch[1] : "Unknown Destination";
        const duration = durationMatch ? parseInt(durationMatch[1]) : 3;
        const budget = budgetMatch ? parseInt(budgetMatch[1]) : 500;
        
        return {
            trip_overview: {
                destination: destination,
                duration: duration,
                total_budget: budget,
                traveler_type: "Explorer"
            },
            daily_plans: Array.from({ length: duration }, (_, i) => ({
                day: i + 1,
                morning: {
                    time: "8:00 AM - 12:00 PM",
                    activities: `Morning exploration of ${destination}`,
                    cost: Math.floor(budget / duration / 3)
                },
                noon: {
                    time: "12:00 PM - 4:00 PM", 
                    activities: `Afternoon activities in ${destination}`,
                    cost: Math.floor(budget / duration / 3)
                },
                evening: {
                    time: "4:00 PM - 10:00 PM",
                    activities: `Evening experiences in ${destination}`,
                    cost: Math.floor(budget / duration / 3)
                },
                daily_total: Math.floor(budget / duration)
            })),
            weather_forecast: Array.from({ length: duration }, (_, i) => ({
                day: i + 1,
                condition: "Pleasant",
                temperature: "20-25°C",
                precautions: "Check local weather before traveling"
            })),
            hotels_to_stay: [{
                name: `Hotel in ${destination}`,
                location: "City Center",
                price_per_night: Math.floor(budget / duration / 2),
                rating: "4.0/5"
            }],
            transportation: {
                to_destination: {
                    method: "Flight/Train",
                    cost: Math.floor(budget * 0.3),
                    details: "Book in advance for better rates"
                }
            },
            other_information: {
                packing_tips: ["Comfortable shoes", "Weather-appropriate clothing"],
                cultural_notes: "Respect local customs and traditions",
                budget_tips: "Look for local restaurants and public transport"
            },
            error_note: "This is a fallback response due to API response parsing issues"
        };
    }
}

module.exports = GroqTravelService;