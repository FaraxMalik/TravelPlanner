// Test Groq connection directly
require('dotenv').config(); // Load environment variables
const GroqTravelService = require('./utils/groqTravelService');

async function testGroqConnection() {
    try {
        console.log('🦙 Testing Groq Connection with Llama 3.3 70B...\n');
        
        const groqService = new GroqTravelService();
        console.log('✅ Service initialized');
        console.log('🔑 API Key loaded:', groqService.apiKey ? 'YES' : 'NO');
        
        if (!groqService.apiKey) {
            console.log('❌ No API key found. Check .env file.');
            return;
        }
        
        // Test with simple parameters
        const testParams = {
            destination: 'Tokyo, Japan',
            travel_dates: '2024-12-28 to 2024-12-30',
            duration: 2,
            daily_budget: 100,
            total_budget: 200,
            travelers: 1,
            additional_preferences: 'Cultural experiences',
            personalityDescription: 'You are a cultural explorer who loves history and art.',
            userPreferences: { culturalInterest: 8, adventureLevel: 6 }
        };
        
        console.log('🚀 Sending request to Groq...');
        console.log('📍 Destination:', testParams.destination);
        console.log('🦙 Model: llama-3.3-70b-versatile');
        
        const result = await groqService.generatePersonalizedItinerary(testParams);
        
        if (result.success) {
            console.log('\n🎉 SUCCESS! Groq is working!');
            console.log('✅ Response received');
            console.log('📊 Itinerary structure:');
            console.log('   - trip_overview:', result.itinerary.trip_overview ? '✅' : '❌');
            console.log('   - daily_plans:', result.itinerary.daily_plans ? '✅' : '❌');
            console.log('   - weather_forecast:', result.itinerary.weather_forecast ? '✅' : '❌');
            console.log('   - personality_optimization:', result.itinerary.personality_optimization ? '✅' : '❌');
            
            if (result.itinerary.daily_plans && result.itinerary.daily_plans[0]) {
                console.log('   - First day activities:', result.itinerary.daily_plans[0].activities?.length || 0);
            }
            
            console.log('\n🔄 SWITCHING READY!');
            console.log('To use Groq instead of Gemini, edit aiTravelController.js:');
            console.log('Comment line 15 and uncomment line 16');
            
        } else {
            console.log('\n❌ Request failed:', result.error);
            console.log('But fallback structure is available!');
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testGroqConnection();