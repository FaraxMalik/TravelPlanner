"""
🚀 Enhanced API for AI Travel Planner with Detailed Personality Predictions
Creates rich, descriptive personality profiles for precise Gemini AI itineraries!
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import joblib
import numpy as np
import pandas as pd
import os
from pathlib import Path
import logging

# Import our detailed personality predictor
from detailed_personality_predictor import generate_detailed_travel_personality, create_gemini_prompt_with_detailed_personality

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Travel Planner - Enhanced Personality Prediction API",
    description="Predicts detailed travel personality profiles from questionnaire responses",
    version="2.0.0"
)

# Global model variables
personality_model = None
travel_classifier = None

class TravelPreferences(BaseModel):
    """Travel questionnaire responses"""
    # Your 12 travel questions
    budgetComfort: int  # 1-4 scale
    travelPace: int     # 1-4 scale  
    spontaneityLevel: int  # 1-4 scale
    placePreference: int   # 1-4 scale
    groupDynamics: int     # 1-4 scale
    memorableElements: int # 1-4 scale
    challenges: int        # 1-4 scale
    cultureLevel: int      # 1-4 scale
    restRelaxation: int    # 1-4 scale
    experienceDepth: int   # 1-4 scale
    safetyAdventure: int   # 1-4 scale
    planningStyle: int     # 1-4 scale
    
class DetailedPersonalityResponse(BaseModel):
    """Enhanced response with detailed personality profile"""
    success: bool
    personality_description: str
    travel_motivations: List[str]
    accommodation_preference: str
    preferred_activities: List[str]
    big_five_scores: Dict[str, float]
    detailed_scores: Dict[str, str]
    gemini_prompt: str
    simple_label: str  # Backward compatibility

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    message: str
    models_loaded: bool

def load_models():
    """Load trained models"""
    global personality_model, travel_classifier
    
    try:
        model_path = Path("./models")
        
        # Try to load models
        if (model_path / "personality_model.pkl").exists():
            personality_model = joblib.load(model_path / "personality_model.pkl")
            logger.info("✅ Personality model loaded successfully")
        else:
            logger.warning("⚠️ Personality model not found")
            
        if (model_path / "travel_classifier.pkl").exists():
            travel_classifier = joblib.load(model_path / "travel_classifier.pkl")
            logger.info("✅ Travel classifier loaded successfully")
        else:
            logger.warning("⚠️ Travel classifier not found")
            
        return True
        
    except Exception as e:
        logger.error(f"❌ Error loading models: {e}")
        return False

def predict_big_five_from_preferences(preferences: TravelPreferences) -> List[float]:
    """Convert travel preferences to Big Five personality scores"""
    
    # Convert preferences to feature array (same as training)
    features = np.array([
        preferences.budgetComfort,
        preferences.travelPace,
        preferences.spontaneityLevel,
        preferences.placePreference,
        preferences.groupDynamics,
        preferences.memorableElements,
        preferences.challenges,
        preferences.cultureLevel,
        preferences.restRelaxation,
        preferences.experienceDepth,
        preferences.safetyAdventure,
        preferences.planningStyle
    ]).reshape(1, -1)
    
    if personality_model is not None:
        try:
            # Predict Big Five scores
            prediction = personality_model.predict(features)[0]
            return prediction.tolist()
        except Exception as e:
            logger.error(f"Model prediction error: {e}")
    
    # Fallback: Calculate Big Five from preferences
    extraversion = (preferences.groupDynamics + preferences.memorableElements) / 8.0
    emotional_stability = (preferences.restRelaxation + (5 - preferences.challenges)) / 8.0
    agreeableness = (preferences.cultureLevel + preferences.groupDynamics) / 8.0
    conscientiousness = (preferences.planningStyle + preferences.safetyAdventure) / 8.0
    openness = (preferences.spontaneityLevel + preferences.placePreference) / 8.0
    
    return [extraversion, emotional_stability, agreeableness, conscientiousness, openness]

def get_simple_label_fallback(big_five_scores: List[float]) -> str:
    """Generate simple travel type for backward compatibility"""
    ext, est, agr, csn, opn = big_five_scores
    
    if opn > 0.7 and ext > 0.6:
        return "Adventure Seeker"
    elif agr > 0.7 and opn > 0.6:
        return "Cultural Explorer"
    elif ext > 0.7:
        return "Social Explorer"
    elif csn > 0.7:
        return "Planned Traveler"
    elif ext < 0.4:
        return "Solo Wanderer"
    elif est > 0.6:
        return "Relaxation Seeker"
    else:
        return "Flexible Wanderer"

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("🚀 Starting AI Travel Planner Enhanced API...")
    success = load_models()
    if success:
        logger.info("✅ API ready for detailed personality predictions!")
    else:
        logger.warning("⚠️ API started with limited functionality")

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    models_loaded = personality_model is not None and travel_classifier is not None
    
    return HealthResponse(
        status="healthy" if models_loaded else "limited",
        message="API is running" + (" with all models loaded" if models_loaded else " with fallback predictions"),
        models_loaded=models_loaded
    )

@app.post("/predict/detailed", response_model=DetailedPersonalityResponse)
async def predict_detailed_personality(preferences: TravelPreferences):
    """
    🎯 Enhanced endpoint: Predict detailed travel personality profile
    
    Returns rich personality description instead of simple labels!
    Perfect for generating precise Gemini AI prompts.
    """
    
    try:
        # Convert preferences to Big Five scores
        big_five_scores = predict_big_five_from_preferences(preferences)
        
        # Convert preferences to dict for detailed analysis
        pref_dict = {
            'budgetComfort': preferences.budgetComfort,
            'travelPace': preferences.travelPace,
            'spontaneityLevel': preferences.spontaneityLevel,
            'placePreference': preferences.placePreference,
            'groupDynamics': preferences.groupDynamics,
            'memorableElements': preferences.memorableElements,
            'challenges': preferences.challenges,
            'cultureLevel': preferences.cultureLevel,
            'restRelaxation': preferences.restRelaxation,
            'experienceDepth': preferences.experienceDepth,
            'safetyAdventure': preferences.safetyAdventure,
            'planningStyle': preferences.planningStyle
        }
        
        # Generate detailed personality profile
        detailed_profile = generate_detailed_travel_personality(big_five_scores, pref_dict)
        
        # Create enhanced Gemini prompt
        gemini_prompt = create_gemini_prompt_with_detailed_personality(detailed_profile)
        
        # Get simple label for backward compatibility
        simple_label = get_simple_label_fallback(big_five_scores)
        
        # Create Big Five scores dict
        big_five_dict = {
            'extraversion': big_five_scores[0],
            'emotional_stability': big_five_scores[1], 
            'agreeableness': big_five_scores[2],
            'conscientiousness': big_five_scores[3],
            'openness': big_five_scores[4]
        }
        
        logger.info(f"✅ Generated detailed personality: {detailed_profile['personality_description'][:100]}...")
        
        return DetailedPersonalityResponse(
            success=True,
            personality_description=detailed_profile['personality_description'],
            travel_motivations=detailed_profile['travel_motivations'],
            accommodation_preference=detailed_profile['accommodation_preference'],
            preferred_activities=detailed_profile['preferred_activities'],
            big_five_scores=big_five_dict,
            detailed_scores=detailed_profile['detailed_scores'],
            gemini_prompt=gemini_prompt,
            simple_label=simple_label
        )
        
    except Exception as e:
        logger.error(f"❌ Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict/simple")
async def predict_simple_personality(preferences: TravelPreferences):
    """
    🔄 Backward compatibility endpoint: Returns simple travel type labels
    """
    
    try:
        # Get Big Five scores
        big_five_scores = predict_big_five_from_preferences(preferences)
        
        # Get simple label
        travel_type = get_simple_label_fallback(big_five_scores)
        
        return {
            "success": True,
            "travel_type": travel_type,
            "big_five_scores": {
                'extraversion': big_five_scores[0],
                'emotional_stability': big_five_scores[1],
                'agreeableness': big_five_scores[2], 
                'conscientiousness': big_five_scores[3],
                'openness': big_five_scores[4]
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Simple prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "🎯 AI Travel Planner - Enhanced Personality Prediction API",
        "version": "2.0.0",
        "endpoints": {
            "/predict/detailed": "Get detailed personality profile (RECOMMENDED)",
            "/predict/simple": "Get simple travel type (backward compatibility)",
            "/health": "Health check"
        },
        "features": [
            "🎯 Rich personality descriptions",
            "🎨 Specific activity preferences", 
            "🏨 Detailed accommodation recommendations",
            "🤖 Enhanced Gemini AI prompts",
            "📊 Big Five personality analysis"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Enhanced AI Travel Planner API...")
    print("📋 Features:")
    print("   ✅ Detailed personality profiles")
    print("   ✅ Enhanced Gemini prompts")
    print("   ✅ Specific travel recommendations")
    print("   ✅ Backward compatibility")
    print("\n🌐 Access at: http://localhost:8000")
    print("📖 Docs at: http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
