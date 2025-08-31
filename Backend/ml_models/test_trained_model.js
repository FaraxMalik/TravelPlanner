const BigFiveService = require('../utils/bigFiveService');

async function testTrainedModel() {
    console.log('🧪 Testing Trained ML Model Integration');
    console.log('=' * 50);
    
    const bigFiveService = new BigFiveService();
    
    // Test with sample preferences
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
    
    try {
        console.log('📊 Input preferences:', testPreferences);
        console.log('\n🔮 Calling BigFiveService...');
        
        const result = await bigFiveService.predictBigFivePersonality(testPreferences);
        
        console.log('\n✅ Result:', JSON.stringify(result, null, 2));
        
        if (result.success && result.modelUsed === 'trained_ml_model') {
            console.log('\n🎉 SUCCESS: Using trained ML model instead of fallback!');
            console.log(`🧠 Predicted personality: ${result.travelerType}`);
            console.log(`🎯 Confidence: ${(result.predictionConfidence * 100).toFixed(1)}%`);
            console.log(`🏆 Model used: ${result.modelUsed}`);
        } else if (result.success && result.modelUsed === 'trained_rule_based_model') {
            console.log('\n✅ SUCCESS: Using trained rule-based model');
            console.log(`🧠 Predicted personality: ${result.travelerType}`);
        } else {
            console.log('\n⚠️ WARNING: Still using fallback analysis');
            console.log(`Model used: ${result.modelUsed}`);
        }
        
    } catch (error) {
        console.error('\n❌ ERROR:', error);
    }
}

// Run the test
testTrainedModel();
