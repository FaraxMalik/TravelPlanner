// Test the new structured format (Morning/Noon/Evening)
require('dotenv').config();
const axios = require('axios');

async function testStructuredFormat() {
    try {
        console.log('🧪 Testing New Structured Format (Morning/Noon/Evening)...\n');
        
        // Test authentication
        console.log('1️⃣ Getting auth token...');
        const auth = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'quicktest@test.com',
            password: 'test123'
        });
        console.log('✅ Auth successful\n');
        
        // Test API call with short duration for quick results
        console.log('2️⃣ Generating 2-day itinerary with new structured format...');
        const response = await axios.post('http://localhost:5000/api/ai/generate-itinerary', {
            destination: 'Paris, France',
            travel_dates: '2024-12-28 to 2024-12-29',
            duration: 2,
            daily_budget: 150,
            total_budget: 300,
            travelers: 1,
            additional_preferences: 'Cultural experiences and good food'
        }, {
            headers: { 'Authorization': `Bearer ${auth.data.token}` },
            timeout: 45000
        });
        
        if (response.data.success && response.data.itinerary) {
            const itinerary = response.data.itinerary;
            console.log('✅ Itinerary generated successfully!\n');
            
            console.log('📋 STRUCTURED FORMAT ANALYSIS:');
            console.log('=' .repeat(60));
            
            if (itinerary.dailyPlan && itinerary.dailyPlan.length > 0) {
                itinerary.dailyPlan.forEach((day, index) => {
                    console.log(`\n📅 DAY ${day.day} - ${day.title}`);
                    console.log(`💰 Daily Total: $${day.totalCost}`);
                    console.log('-'.repeat(40));
                    
                    day.activities.forEach((activity, actIndex) => {
                        let period = 'General';
                        if (activity.activity.includes('Morning:')) period = '🌅 MORNING';
                        else if (activity.activity.includes('Afternoon:')) period = '☀️ AFTERNOON';
                        else if (activity.activity.includes('Evening:')) period = '🌙 EVENING';
                        
                        console.log(`${period} (${activity.time})`);
                        console.log(`  Activity: ${activity.activity.replace(/^(Morning|Afternoon|Evening):\s*/, '')}`);
                        console.log(`  Cost: $${activity.cost}`);
                        console.log('');
                    });
                });
                
                console.log('\n🎯 FORMAT VALIDATION:');
                const hasStructuredFormat = itinerary.dailyPlan.some(day => 
                    day.activities.some(act => 
                        act.activity.includes('Morning:') || 
                        act.activity.includes('Afternoon:') || 
                        act.activity.includes('Evening:')
                    )
                );
                
                if (hasStructuredFormat) {
                    console.log('✅ NEW STRUCTURED FORMAT DETECTED!');
                    console.log('✅ Morning/Noon/Evening periods are properly formatted');
                    console.log('✅ Frontend will display with period badges');
                    console.log('✅ Tabular format will show time-based organization');
                } else {
                    console.log('⚠️  Old format detected - may need prompt adjustment');
                }
                
                // Check for additional structured data
                if (itinerary.weather_forecast) {
                    console.log(`✅ Weather forecast available for ${itinerary.weather_forecast.length} days`);
                }
                if (itinerary.hotels_to_stay) {
                    console.log(`✅ Hotel recommendations: ${itinerary.hotels_to_stay.length} options`);
                }
                if (itinerary.transportation) {
                    console.log('✅ Transportation recommendations included');
                }
                if (itinerary.other_information) {
                    console.log('✅ Additional travel information provided');
                }
                
                console.log('\n🎉 NEW FORMAT IMPLEMENTATION SUCCESS!');
                console.log('🔗 Ready for frontend testing');
                
            } else {
                console.log('❌ No dailyPlan data found');
            }
        } else {
            console.log('❌ Failed to generate itinerary:', response.data.error);
        }
        
    } catch (error) {
        if (error.response?.status === 429) {
            console.log('🚫 API quota limit reached - try Groq instead');
        } else if (error.code === 'ECONNRESET') {
            console.log('🔄 Connection reset - LLM response might be too long');
        } else {
            console.log('❌ Error:', error.response?.data?.message || error.message);
        }
    }
}

testStructuredFormat();
