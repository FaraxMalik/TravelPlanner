#!/usr/bin/env python3
"""
🤖 Gemini AI Integration for Travel Planner
Complete workflow: Travel Questions → Personality → Gemini → Itinerary
"""

import google.generativeai as genai
import json
import os
from typing import Dict, List
import requests
from detailed_personality_predictor import generate_detailed_travel_personality, create_gemini_prompt_with_detailed_personality

class GeminiTravelService:
    """Gemini AI service for generating personalized travel itineraries"""
    
    def __init__(self, api_key: str = None):
        """Initialize Gemini service"""
        
        # Set up Gemini API
        if api_key:
            genai.configure(api_key=api_key)
        else:
            # Try to get from environment
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                raise ValueError("Gemini API key required! Set GEMINI_API_KEY environment variable or pass api_key parameter")
            genai.configure(api_key=api_key)
        
        # Initialize model
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        print("✅ Gemini AI service initialized")
    
    def generate_itinerary_from_personality(self, 
                                          detailed_personality: Dict,
                                          destination: str = None,
                                          duration: int = 7,
                                          budget: str = "moderate",
                                          additional_preferences: str = "") -> Dict:
        """
        Generate personalized itinerary using detailed personality profile
        
        Args:
            detailed_personality: Output from generate_detailed_travel_personality()
            destination: Specific destination or None for AI to suggest
            duration: Trip duration in days
            budget: "budget", "moderate", "luxury"
            additional_preferences: Any extra user preferences
        
        Returns:
            Complete itinerary with day-by-day plan
        """
        
        # Create enhanced prompt
        base_prompt = create_gemini_prompt_with_detailed_personality(
            detailed_personality, destination, duration
        )
        
        # Add budget and additional preferences
        enhanced_prompt = f"""{base_prompt}

ADDITIONAL REQUIREMENTS:
- Budget Level: {budget.title()}
- Duration: {duration} days
{f'- Additional Preferences: {additional_preferences}' if additional_preferences else ''}

Please provide a detailed response in this JSON format:
{{
    "destination": "Selected destination",
    "trip_overview": "Brief overview of the trip",
    "personality_match": "Why this itinerary matches their personality",
    "daily_itinerary": [
        {{
            "day": 1,
            "title": "Day title",
            "activities": ["Activity 1", "Activity 2", "Activity 3"],
            "meals": {{
                "breakfast": "Breakfast recommendation",
                "lunch": "Lunch recommendation", 
                "dinner": "Dinner recommendation"
            }},
            "accommodation": "Where to stay",
            "transportation": "How to get around",
            "estimated_cost": "Daily budget estimate",
            "personality_notes": "Why these activities match their personality"
        }}
    ],
    "travel_tips": ["Tip 1", "Tip 2", "Tip 3"],
    "packing_suggestions": ["Item 1", "Item 2", "Item 3"],
    "total_estimated_cost": "Total trip cost estimate",
    "best_time_to_visit": "Recommended travel dates"
}}

Ensure the itinerary deeply reflects their personality profile and travel motivations."""

        try:
            # Generate response
            print("🤖 Generating personalized itinerary with Gemini AI...")
            response = self.model.generate_content(enhanced_prompt)
            
            # Try to parse as JSON
            try:
                # Extract JSON from response
                response_text = response.text
                
                # Find JSON in the response (sometimes Gemini adds extra text)
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_text = response_text[start_idx:end_idx]
                    itinerary = json.loads(json_text)
                else:
                    # Fallback: return raw response
                    itinerary = {
                        "destination": destination or "AI Selected",
                        "trip_overview": "Personalized itinerary generated",
                        "raw_response": response_text,
                        "personality_match": detailed_personality['personality_description']
                    }
                
            except json.JSONDecodeError:
                # Fallback: structure the raw response
                itinerary = {
                    "destination": destination or "AI Selected",
                    "trip_overview": "Personalized itinerary generated", 
                    "raw_response": response.text,
                    "personality_match": detailed_personality['personality_description']
                }
            
            print("✅ Itinerary generated successfully!")
            return itinerary
            
        except Exception as e:
            print(f"❌ Error generating itinerary: {e}")
            return {
                "error": str(e),
                "fallback_message": "Unable to generate itinerary. Please try again."
            }

def complete_travel_workflow(travel_preferences: Dict, 
                           destination: str = None,
                           duration: int = 7,
                           budget: str = "moderate",
                           gemini_api_key: str = None) -> Dict:
    """
    Complete workflow: Travel preferences → Personality → Gemini itinerary
    
    Args:
        travel_preferences: Dict with your 12 travel question responses
        destination: Target destination
        duration: Trip length in days  
        budget: Budget level
        gemini_api_key: Gemini API key
    
    Returns:
        Complete result with personality analysis and itinerary
    """
    
    try:
        # Step 1: Get personality prediction from local API
        print("🎯 Step 1: Analyzing travel personality...")
        
        # Call your enhanced API (assuming it's running)
        api_url = "http://localhost:8000/predict/detailed"
        response = requests.post(api_url, json=travel_preferences)
        
        if response.status_code == 200:
            personality_result = response.json()
            print(f"✅ Personality analyzed: {personality_result['personality_description'][:50]}...")
        else:
            # Fallback: use local prediction
            print("⚠️ API not available, using local prediction...")
            big_five_scores = [0.6, 0.65, 0.62, 0.64, 0.67]  # Sample scores
            detailed_personality = generate_detailed_travel_personality(big_five_scores, travel_preferences)
            personality_result = {
                'personality_description': detailed_personality['personality_description'],
                'travel_motivations': detailed_personality['travel_motivations'],
                'accommodation_preference': detailed_personality['accommodation_preference'],
                'preferred_activities': detailed_personality['preferred_activities'],
                'detailed_scores': detailed_personality['detailed_scores']
            }
        
        # Step 2: Generate itinerary with Gemini
        print("🤖 Step 2: Generating personalized itinerary...")
        
        gemini_service = GeminiTravelService(gemini_api_key)
        itinerary = gemini_service.generate_itinerary_from_personality(
            personality_result, destination, duration, budget
        )
        
        # Step 3: Combine results
        complete_result = {
            "personality_analysis": personality_result,
            "itinerary": itinerary,
            "metadata": {
                "destination": destination,
                "duration": duration,
                "budget": budget,
                "generated_at": "2025-08-09"
            }
        }
        
        print("🎉 Complete travel plan generated!")
        return complete_result
        
    except Exception as e:
        print(f"❌ Workflow error: {e}")
        return {"error": str(e)}

# Example usage and testing
if __name__ == "__main__":
    print("🎯 AI Travel Planner - Gemini Integration Test")
    print("=" * 50)
    
    # Sample travel preferences (your 12 questions)
    sample_preferences = {
        "budgetComfort": 3,
        "travelPace": 3, 
        "spontaneityLevel": 2,
        "placePreference": 3,
        "groupDynamics": 3,
        "memorableElements": 3,
        "challenges": 3,
        "cultureLevel": 4,
        "restRelaxation": 3,
        "experienceDepth": 3,
        "safetyAdventure": 2,
        "planningStyle": 3
    }
    
    print("📋 Sample Travel Preferences:")
    for key, value in sample_preferences.items():
        print(f"   {key}: {value}")
    
    # Test personality analysis only (without Gemini)
    print(f"\n🧠 Testing Personality Analysis:")
    big_five_scores = [0.6, 0.65, 0.62, 0.64, 0.67]
    detailed_personality = generate_detailed_travel_personality(big_five_scores, sample_preferences)
    
    print(f"✅ Personality Description:")
    print(f"   {detailed_personality['personality_description']}")
    
    print(f"\n✅ Travel Motivations:")
    for motivation in detailed_personality['travel_motivations']:
        print(f"   • {motivation}")
    
    print(f"\n📝 Enhanced Gemini Prompt Preview:")
    prompt = create_gemini_prompt_with_detailed_personality(detailed_personality, "Japan", 10)
    print(f"{prompt[:300]}...")
    
    print(f"\n💡 To test with Gemini AI:")
    print(f"   1. Get Gemini API key from Google AI Studio")
    print(f"   2. Set environment variable: GEMINI_API_KEY=your_key")
    print(f"   3. Run: python gemini_integration.py")
    print(f"\n🚀 Your personality → Gemini integration is ready!")
