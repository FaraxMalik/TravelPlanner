# Travel Personality ML Models

This directory contains the trained machine learning models for travel personality prediction.

## Directory Structure

```
ml_models/
├── models/                          # Trained model files
│   ├── travel_personality_model.pkl # Trained Random Forest classifier
│   ├── preference_scaler.pkl        # Feature scaler for preprocessing
│   ├── model_metadata.json          # Model configuration and metadata
│   └── preference_simulator.json    # Model simulation data
├── scripts/                         # Prediction scripts
│   └── predict_personality.py       # Main prediction script
└── README.md                        # This file
```

## Model Details

### Travel Personality Model
- **Algorithm**: Random Forest Classifier
- **Features**: 12 travel preference questions (1-4 scale)
- **Output**: 10 travel personality types
- **Training Data**: 1M+ personality records from Big Five dataset
- **Model Size**: ~2MB
- **Accuracy**: ~50% (multi-class classification with 10 classes)

### Personality Types Predicted
1. **Cultural_Explorer** - Museums, art galleries, historical sites
2. **Adventure_Seeker** - Hiking, extreme sports, outdoor activities  
3. **Luxury_Seeker** - Fine dining, luxury hotels, premium experiences
4. **Social_Party_Goer** - Nightlife, social events, group activities
5. **Nature_Lover** - National parks, wildlife, natural environments
6. **Budget_Backpacker** - Street food, hostels, authentic experiences
7. **Family_Oriented** - Family attractions, safe environments, educational
8. **Solo_Adventurer** - Independent travel, unique experiences
9. **Relaxation_Seeker** - Spas, quiet beaches, wellness retreats
10. **History_Buff** - Historical sites, museums, cultural heritage

## Usage

The model is called by the Node.js backend through the `BigFiveService`:

```javascript
const result = await bigFiveService.predictBigFivePersonality(userPreferences);
```

### Input Format
```json
{
  "morningRoutine": 3,
  "placePreference": 4,
  "travelPace": 2,
  "foodPreferences": 3,
  "backupPlanning": 4,
  "memoryCapturing": 3,
  "photographyStyle": 3,
  "musicPreferences": 2,
  "spontaneityLevel": 2,
  "packingPhilosophy": 3,
  "groupDynamics": 3,
  "memorableElements": 4
}
```

### Output Format
```json
{
  "success": true,
  "travel_type": "Cultural_Explorer",
  "confidence": 0.65,
  "places_they_love": "Museums, art galleries, historical sites...",
  "travel_description": "You are a Cultural Explorer! You love...",
  "travel_style": "Cultural immersion, educational experiences",
  "big_five_scores": {
    "EXT": 2.8,
    "EST": 3.2,
    "AGR": 3.5,
    "CSN": 3.8,
    "OPN": 4.2
  },
  "dominant_trait": "OPN",
  "all_probabilities": {...},
  "model_used": "trained_ml_model"
}
```

## Integration

The model integrates with:
1. **Frontend**: User questionnaire → preferences
2. **Backend**: API endpoint `/ai/analyze-personality`
3. **Database**: Stores personality analysis results
4. **Gemini AI**: Uses personality data for trip generation

## Files

- `travel_personality_model.pkl`: The trained Random Forest model
- `preference_scaler.pkl`: StandardScaler for feature normalization
- `model_metadata.json`: Model configuration, training date, feature names
- `preference_simulator.json`: Additional model metadata
- `predict_personality.py`: Python script for making predictions