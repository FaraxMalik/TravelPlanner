# Travel Planner API Documentation
## Frontend Integration Guide

### 🎯 Overview
This API provides ML-powered personality analysis and comprehensive travel planning based on trained models using 1M+ real personality responses.

---

## 🔐 Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📝 Personality Analysis Endpoints

### 1. Analyze User Personality
**POST** `/api/ai/analyze-personality`

Analyzes user's personality from 12 preference questions using trained ML model.

**Request Body:**
```json
{
  "morningRoutine": 4,        // 1-5 scale
  "placePreference": 5,       // 1-5 scale  
  "travelPace": 3,           // 1-5 scale
  "foodPreferences": 4,       // 1-5 scale
  "backupPlanning": 4,        // 1-5 scale
  "memoryCapturing": 5,       // 1-5 scale
  "photographyStyle": 4,      // 1-5 scale
  "musicPreferences": 3,      // 1-5 scale
  "spontaneityLevel": 2,      // 1-5 scale
  "packingPhilosophy": 4,     // 1-5 scale
  "groupDynamics": 2,         // 1-5 scale
  "memorableElements": 5      // 1-5 scale
}
```

**Response:**
```json
{
  "success": true,
  "message": "Personality analysis completed and saved successfully!",
  "personalityAnalysis": {
    "travelerType": "Cultural_Explorer",
    "description": "You are a **Cultural_Explorer**! Based on our advanced ML analysis...",
    "placesTheyLove": "Museums, art galleries, historical sites...",
    "dominantTrait": "openness",
    "confidence": 0.834,
    "modelUsed": "trained_ml_model"
  },
  "detailedAnalysis": {
    "bigFiveScores": {
      "openness": 4.8,
      "conscientiousness": 3.9,
      "extraversion": 3.2,
      "agreeableness": 3.7,
      "neuroticism": 2.1
    },
    "confidenceScores": {
      "Cultural_Explorer": 0.834,
      "Luxury_Seeker": 0.098,
      "Social_Party_Goer": 0.045
    }
  },
  "nextSteps": {
    "canPlanTrips": true,
    "message": "You're now ready to create personalized travel plans!"
  }
}
```

### 2. Check Personality Status
**GET** `/api/ai/personality-status`

Checks if user has completed personality analysis.

**Response:**
```json
{
  "success": true,
  "personalityStatus": {
    "completed": true,
    "preferencesCompleted": true,
    "readyForPersonalizedPlanning": true,
    "analysisDate": "2025-08-10T14:30:00Z",
    "travelerType": "Cultural_Explorer",
    "confidence": 0.834,
    "modelUsed": "trained_ml_model"
  },
  "nextSteps": {
    "action": "plan_trip",
    "message": "You can now create personalized travel plans!"
  }
}
```

### 3. Get Personality Details
**GET** `/api/ai/personality`

Gets full personality analysis data.

**Response:**
```json
{
  "success": true,
  "personality": {
    "travelerType": "Cultural_Explorer",
    "description": "You are a **Cultural_Explorer**!...",
    "placesTheyLove": "Museums, art galleries...",
    "dominantTrait": "openness",
    "bigFiveScores": { "openness": 4.8, ... },
    "confidenceScores": { "Cultural_Explorer": 0.834, ... },
    "modelUsed": "trained_ml_model",
    "predictionConfidence": 0.834
  },
  "analyzed_at": "2025-08-10T14:30:00Z",
  "preferences_completed": true
}
```

---

## 🌍 Travel Planning Endpoints

### 1. Generate Comprehensive Travel Plan
**POST** `/api/ai/generate-comprehensive-plan`

Creates detailed personalized travel plan using stored personality data.

**Request Body:**
```json
{
  "destination": "Rome, Italy",
  "startDate": "2025-10-15",
  "endDate": "2025-10-19", 
  "budget": 3000,
  "numberOfPeople": 2,
  "additionalInfo": "First time visiting, love art and history"
}
```

**Response:**
```json
{
  "success": true,
  "tripDetails": {
    "destination": "Rome, Italy",
    "dates": { "start": "2025-10-15", "end": "2025-10-19" },
    "duration": "5 days",
    "budget": 3000,
    "numberOfPeople": 2
  },
  "personalityContext": {
    "travelerType": "Cultural_Explorer",
    "placesTheyLove": "Museums, art galleries, historical sites...",
    "dominantTrait": "openness",
    "confidence": 0.834,
    "modelUsed": "trained_ml_model"
  },
  "comprehensivePlan": {
    "trip_overview": {
      "destination": "Rome, Italy",
      "traveler_type": "Cultural_Explorer"
    },
    "weather_forecast": [
      {
        "date": "2025-10-15",
        "temperature_high": "22°C",
        "temperature_low": "14°C",
        "conditions": "Partly cloudy",
        "travel_tips": "Perfect weather for outdoor sightseeing"
      }
    ],
    "accommodation_recommendations": [
      {
        "name": "Hotel Artemide",
        "address": "Via Nazionale 22, Rome",
        "phone": "+39 06 489911",
        "price_per_night": "$180",
        "personality_match": "Perfect for Cultural_Explorer..."
      }
    ],
    "daily_itinerary": [
      {
        "day": 1,
        "date": "2025-10-15",
        "day_theme": "Ancient Rome Exploration",
        "morning": {
          "activities": [
            {
              "name": "Colosseum & Roman Forum",
              "address": "Piazza del Colosseo, 1, Rome",
              "cost": "$25 per person",
              "why_perfect_for_personality": "As a Cultural_Explorer, you'll love the rich history..."
            }
          ],
          "breakfast": {
            "restaurant": "Checchino dal 1887",
            "address": "Via di Monte Testaccio, 30, Rome",
            "why_chosen": "Historic venue perfect for Cultural_Explorer..."
          }
        },
        "afternoon": { /* ... */ },
        "evening": { /* ... */ }
      }
    ],
    "budget_breakdown": {
      "accommodation": { "total": "$720" },
      "meals": { "total": "$580" },
      "activities": { "total": "$430" },
      "transportation": { "total": "$120" }
    }
  },
  "personalizationDetails": {
    "planPersonalizedFor": "Cultural_Explorer personality",
    "dataSource": "Advanced ML model trained on 1M+ personality profiles"
  }
}
```

---

## 🎯 Available Traveler Types

The ML model predicts one of these traveler types:

| Type | Places They Love |
|------|------------------|
| **Cultural_Explorer** | Museums, art galleries, historical sites, cultural centers, local markets |
| **Luxury_Seeker** | Five-star hotels, fine dining, luxury spas, upscale shopping districts |
| **Social_Party_Goer** | Nightclubs, bars, beach parties, music festivals, social events |
| **Community_Connector** | Local communities, family restaurants, parks, gardens, temples |
| **Comfort_Seeker** | All-inclusive resorts, familiar restaurants, hotel pools, spa centers |

---

## 🔄 Frontend Flow

### New User Journey:
1. **User signs up** → Show personality questionnaire
2. **User completes 12 questions** → POST `/api/ai/analyze-personality`
3. **Show personality result** → Display traveler type & confidence
4. **User can plan trips** → Redirect to trip planning

### Returning User Journey:
1. **User logs in** → GET `/api/ai/personality-status`
2. **If completed** → Show trip planning interface
3. **If not completed** → Show questionnaire
4. **Plan trip** → POST `/api/ai/generate-comprehensive-plan`

---

## ⚠️ Error Handling

### Common Error Responses:

**Missing Preferences:**
```json
{
  "success": false,
  "message": "Please complete the personality questionnaire first to get personalized travel recommendations.",
  "redirectTo": "/preferences"
}
```

**Invalid Data:**
```json
{
  "success": false,
  "message": "Missing required fields: destination, startDate, endDate, budget"
}
```

**Server Error:**
```json
{
  "success": false,
  "message": "Failed to generate comprehensive travel plan",
  "error": "Detailed error message"
}
```

---

## 🎉 Key Features

✅ **One-time personality analysis** - Stored permanently in database  
✅ **Dataset-trained predictions** - Based on 1M+ real personality responses  
✅ **Comprehensive planning** - Weather, hotels, restaurants, activities  
✅ **Exact details** - Real addresses, phone numbers, costs  
✅ **Scientific explanations** - Why each recommendation fits personality  
✅ **High confidence** - ML model provides confidence scores  

---

## 📞 Support

For integration questions or issues, please contact the backend team.
