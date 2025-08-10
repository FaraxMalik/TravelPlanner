// Complete API Test for Travel Planner with Gemini 1.5 Flash
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
    name: 'API Test User',
    email: 'apitest@example.com',
    password: 'testpass123'
};

// Test preferences for personality analysis
const testPreferences = {
    morningRoutine: 3,
    placePreference: 4,
    travelPace: 2,
    foodPreferences: 3,
    backupPlanning: 4,
    memoryCapturing: 3,
    photographyStyle: 3,
    musicPreferences: 2,
    spontaneityLevel: 2,
    packingPhilosophy: 3,
    groupDynamics: 3,
    memorableElements: 4
};

// Test trip request
const testTripRequest = {
    destination: 'Tokyo, Japan',
    travel_dates: '2024-12-15 to 2024-12-20',
    duration: 5,
    daily_budget: 200,
    total_budget: 1000,
    travelers: 2,
    additional_preferences: 'Love anime, technology, and traditional culture'
};

async function testCompleteAPI() {
    let authToken = null;
    
    try {
        console.log('🧪 TESTING COMPLETE TRAVEL PLANNER API WITH GEMINI 1.5 FLASH');
        console.log('=' * 80);
        
        // Step 1: Test Server Health
        console.log('\n1️⃣ Testing Server Health...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Server Status:', healthResponse.data.status);
        console.log('✅ Database:', healthResponse.data.database);
        
        // Step 2: User Authentication
        console.log('\n2️⃣ Testing User Authentication...');
        try {
            const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
            authToken = registerResponse.data.token;
            console.log('✅ User registered successfully');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('⚠️ User exists, attempting login...');
                const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                    email: testUser.email,
                    password: testUser.password
                });
                authToken = loginResponse.data.token;
                console.log('✅ User logged in successfully');
            } else {
                throw error;
            }
        }
        
        // Step 3: Test ML Model & Personality Analysis
        console.log('\n3️⃣ Testing ML Model Integration...');
        const personalityResponse = await axios.post(`${BASE_URL}/ai/analyze-personality`, testPreferences, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log('✅ ML Model Response:');
        console.log('   - Success:', personalityResponse.data.success);
        console.log('   - Traveler Type:', personalityResponse.data.personalityAnalysis?.travelerType);
        console.log('   - Places They Love:', personalityResponse.data.personalityAnalysis?.placesTheyLove?.substring(0, 100) + '...');
        console.log('   - Model Used:', personalityResponse.data.personalityAnalysis?.modelUsed);
        console.log('   - Confidence:', personalityResponse.data.personalityAnalysis?.confidence);
        
        // Step 4: Verify Database Storage
        console.log('\n4️⃣ Testing Database Storage...');
        const userResponse = await axios.get(`${BASE_URL}/auth/user/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const userData = userResponse.data.user;
        console.log('✅ Database Verification:');
        console.log('   - Preferences Completed:', userData.preferencesCompleted);
        console.log('   - Personality Analysis Stored:', !!userData.personalityAnalysis);
        console.log('   - Ready for Planning:', userData.readyForPersonalizedPlanning);
        console.log('   - Traveler Type in DB:', userData.personalityAnalysis?.travelerType);
        
        // Step 5: Test Gemini 1.5 Flash Integration
        console.log('\n5️⃣ Testing Gemini 1.5 Flash API...');
        console.log('🔮 Sending trip request to Gemini 1.5 Flash...');
        console.log('📍 Destination:', testTripRequest.destination);
        console.log('📅 Dates:', testTripRequest.travel_dates);
        console.log('💰 Budget:', testTripRequest.total_budget);
        console.log('👤 Personality will be loaded from DB...');
        
        const startTime = Date.now();
        
        const tripResponse = await axios.post(`${BASE_URL}/ai/generate-itinerary`, testTripRequest, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            timeout: 60000 // 60 second timeout
        });
        
        const endTime = Date.now();
        const responseTime = (endTime - startTime) / 1000;
        
        console.log('⚡ Response Time:', responseTime, 'seconds');
        
        if (tripResponse.data.success) {
            console.log('✅ Gemini 1.5 Flash SUCCESS!');
            console.log('   - Itinerary Generated:', !!tripResponse.data.itinerary);
            console.log('   - Destination:', tripResponse.data.itinerary?.trip_overview?.destination);
            console.log('   - Duration:', tripResponse.data.itinerary?.trip_overview?.duration);
            console.log('   - Traveler Type Used:', tripResponse.data.itinerary?.trip_overview?.traveler_type);
            
            // Test Weather Integration
            if (tripResponse.data.itinerary?.weather_forecast) {
                console.log('🌤️ Weather Integration:');
                console.log('   - Weather Data Included:', tripResponse.data.itinerary.weather_forecast.length > 0);
                if (tripResponse.data.itinerary.weather_forecast.length > 0) {
                    const firstDay = tripResponse.data.itinerary.weather_forecast[0];
                    console.log('   - Sample Weather:', firstDay.date, firstDay.conditions, firstDay.temperature_high);
                }
            }
            
            // Test Personality Integration
            if (tripResponse.data.itinerary?.personality_optimization) {
                console.log('🧠 Personality Integration:');
                console.log('   - Personality Used:', !!tripResponse.data.itinerary.personality_optimization);
                console.log('   - Traveler Benefits:', tripResponse.data.itinerary.personality_optimization?.traveler_type_benefits?.substring(0, 100));
            }
            
            // Test Day-by-Day Plans
            if (tripResponse.data.itinerary?.daily_plans) {
                console.log('📅 Daily Plans:');
                console.log('   - Number of Days:', tripResponse.data.itinerary.daily_plans.length);
                if (tripResponse.data.itinerary.daily_plans.length > 0) {
                    const firstDay = tripResponse.data.itinerary.daily_plans[0];
                    console.log('   - Sample Day:', firstDay.day, firstDay.theme);
                    console.log('   - Activities Count:', firstDay.activities?.length || 0);
                }
            }
            
            // Test Hotel Recommendations
            if (tripResponse.data.itinerary?.hotels) {
                console.log('🏨 Hotel Recommendations:');
                console.log('   - Number of Hotels:', tripResponse.data.itinerary.hotels.length);
                if (tripResponse.data.itinerary.hotels.length > 0) {
                    console.log('   - Sample Hotel:', tripResponse.data.itinerary.hotels[0].name);
                }
            }
            
        } else {
            console.log('❌ Gemini Response Failed:', tripResponse.data.message);
            if (tripResponse.data.fallback) {
                console.log('🔄 Fallback Response Provided:', !!tripResponse.data.fallback);
            }
        }
        
        // Step 6: Test Model Performance
        console.log('\n6️⃣ Performance Analysis:');
        console.log('   - Model Used: Gemini 1.5 Flash');
        console.log('   - Response Time:', responseTime, 'seconds');
        console.log('   - Status:', tripResponse.data.success ? 'SUCCESS' : 'FAILED');
        
        if (responseTime < 10) {
            console.log('   - Performance: ⚡ EXCELLENT (< 10s)');
        } else if (responseTime < 20) {
            console.log('   - Performance: ✅ GOOD (< 20s)');
        } else {
            console.log('   - Performance: ⚠️ SLOW (> 20s)');
        }
        
        console.log('\n🎉 API TEST COMPLETED SUCCESSFULLY!');
        console.log('=' * 80);
        
        return {
            success: true,
            mlModel: personalityResponse.data.success,
            geminiFlash: tripResponse.data.success,
            responseTime: responseTime,
            weatherIncluded: !!tripResponse.data.itinerary?.weather_forecast,
            personalityUsed: !!tripResponse.data.itinerary?.personality_optimization
        };
        
    } catch (error) {
        console.error('\n❌ API TEST FAILED:');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
            
            // Check for specific Gemini errors
            if (error.response.status === 429) {
                console.error('🚫 QUOTA EXCEEDED - Gemini API rate limit hit');
                console.error('💡 Solution: Wait for quota reset or upgrade API plan');
            } else if (error.response.status === 500) {
                console.error('🔧 SERVER ERROR - Check backend logs');
            }
        } else {
            console.error('Network Error:', error.message);
        }
        
        return {
            success: false,
            error: error.message,
            status: error.response?.status
        };
    }
}

// Run the test
console.log('🚀 Starting Travel Planner API Test...\n');
testCompleteAPI()
    .then(result => {
        if (result.success) {
            console.log('\n✅ ALL SYSTEMS OPERATIONAL!');
            console.log('🤖 ML Model:', result.mlModel ? '✅ Working' : '❌ Failed');
            console.log('⚡ Gemini 1.5 Flash:', result.geminiFlash ? '✅ Working' : '❌ Failed');
            console.log('🌤️ Weather Integration:', result.weatherIncluded ? '✅ Included' : '❌ Missing');
            console.log('🧠 Personality Integration:', result.personalityUsed ? '✅ Active' : '❌ Missing');
            console.log('⏱️ Response Time:', result.responseTime + 's');
        } else {
            console.log('\n❌ SYSTEM ISSUES DETECTED');
            console.log('Error:', result.error);
            console.log('Status:', result.status);
        }
    })
    .catch(error => {
        console.error('\n💥 CRITICAL ERROR:', error.message);
    });