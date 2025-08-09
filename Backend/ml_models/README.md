# 🎯 AI Travel Planner - Clean ML Setup

## Quick Start (3 steps):

### 1. Train Models
```bash
python train_models.py
```

### 2. Start API Server  
```bash
python enhanced_api_server.py
```

### 3. Test API
```bash
# Test endpoint
curl -X POST "http://localhost:8000/predict/detailed" \
     -H "Content-Type: application/json" \
     -d '{
       "budgetComfort": 3,
       "travelPace": 3,
       "spontaneityLevel": 2,
       "placePreference": 3,
       "groupDynamics": 3,
       "memorableElements": 3,
       "challenges": 3,
       "cultureLevel": 3,
       "restRelaxation": 3,
       "experienceDepth": 3,
       "safetyAdventure": 2,
       "planningStyle": 3
     }'
```

## Files:
- `train_models.py` - Train personality models from Big Five dataset
- `enhanced_api_server.py` - FastAPI server with detailed personality predictions  
- `detailed_personality_predictor.py` - Rich personality description generator
- `models/` - Trained ML models (created after training)

## Integration:
Your React questionnaire → API → Detailed personality → Gemini AI → Personalized itinerary

## Features:
✅ Natural personality descriptions (not simple labels)  
✅ Specific travel preferences and motivations  
✅ Enhanced Gemini prompts for precise itineraries  
✅ Production-ready FastAPI server
