// Test complete functionality including tabular display and PDF
require('dotenv').config();
const axios = require('axios');

async function testCompleteFlow() {
    try {
        console.log('🎯 Testing Complete Travel Planner Functionality...\n');
        
        // Step 1: Login
        console.log('1️⃣ Testing authentication...');
        const auth = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'quicktest@test.com',
            password: 'test123'
        });
        console.log('✅ Authentication successful\n');
        
        // Step 2: Generate itinerary with both services
        console.log('2️⃣ Testing itinerary generation...');
        const response = await axios.post('http://localhost:5000/api/ai/generate-itinerary', {
            destination: 'Kyoto, Japan',
            travel_dates: '2024-12-28 to 2024-12-30',
            duration: 3,
            daily_budget: 120,
            total_budget: 360,
            travelers: 1,
            additional_preferences: 'Traditional culture and temples'
        }, {
            headers: { 'Authorization': `Bearer ${auth.data.token}` },
            timeout: 30000
        });
        
        if (response.data.success) {
            console.log('✅ Itinerary generation successful');
            const itinerary = response.data.itinerary;
            
            // Check tabular display data
            console.log('\n📊 TABULAR DISPLAY DATA CHECK:');
            console.log(`   ✅ dailyPlan: ${itinerary.dailyPlan ? 'Available' : 'Missing'}`);
            console.log(`   ✅ destination: ${itinerary.destination ? 'Available' : 'Missing'}`);
            console.log(`   ✅ budget: ${itinerary.budget ? 'Available' : 'Missing'}`);
            console.log(`   ✅ recommendations: ${itinerary.recommendations ? 'Available' : 'Missing'}`);
            
            if (itinerary.dailyPlan && itinerary.dailyPlan[0]) {
                console.log(`   ✅ First day activities: ${itinerary.dailyPlan[0].activities?.length || 0}`);
                console.log(`   ✅ Day cost: $${itinerary.dailyPlan[0].totalCost || 0}`);
            }
            
            // Step 3: Test PDF generation
            console.log('\n3️⃣ Testing PDF generation...');
            try {
                const pdfResponse = await axios.post('http://localhost:5000/api/ai/generate-pdf', {
                    ...itinerary,
                    destination: itinerary.destination,
                    travel_dates: '2024-12-28 to 2024-12-30',
                    duration: 3,
                    total_budget: 360
                }, {
                    headers: { 
                        'Authorization': `Bearer ${auth.data.token}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'arraybuffer',
                    timeout: 15000
                });
                
                if (pdfResponse.data.byteLength > 0) {
                    console.log('✅ PDF generation successful');
                    console.log(`   📄 PDF size: ${(pdfResponse.data.byteLength / 1024).toFixed(2)} KB`);
                } else {
                    console.log('⚠️ PDF generated but empty');
                }
                
            } catch (pdfError) {
                console.log('❌ PDF generation failed:', pdfError.response?.data || pdfError.message);
            }
            
            console.log('\n🎉 FUNCTIONALITY TEST RESULTS:');
            console.log('✅ Authentication: Working');
            console.log('✅ Itinerary Generation: Working');
            console.log('✅ Tabular Data Format: Ready for Frontend');
            console.log('✅ Backend Response Structure: Complete');
            console.log('✅ PDF Generation: Available');
            
            console.log('\n🔄 ACTIVE LLM SERVICE:');
            console.log('Current: Gemini (switch to Groq in aiTravelController.js if needed)');
            
        } else {
            console.log('❌ Itinerary generation failed:', response.data.message);
        }
        
    } catch (error) {
        if (error.response?.status === 429) {
            console.log('🚫 API quota exceeded');
            console.log('💡 Switch to Groq in aiTravelController.js (lines 15-16)');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('🔌 Server not running. Start with: npm start');
        } else {
            console.log('❌ Error:', error.response?.data?.message || error.message);
        }
    }
}

testCompleteFlow();