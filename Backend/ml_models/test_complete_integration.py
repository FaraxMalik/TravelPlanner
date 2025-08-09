#!/usr/bin/env python3
"""
🧪 Complete System Integration Test
Tests all components: ML Model + Weather + Gemini AI
"""

import json
from backend_integration_enhanced import generate_itinerary_for_backend

def test_complete_integration():
    """Test the complete enhanced travel planning system"""
    
    print("🚀 COMPLETE TRAVEL PLANNER INTEGRATION TEST")
    print("=" * 60)
    
    # Test cases with different scenarios
    test_cases = [
        {
            "name": "🇮🇹 Rome Adventure (Budget Traveler)",
            "preferences": {
                "budgetComfort": 2, "travelPace": 4, "spontaneityLevel": 4,
                "placePreference": 3, "groupDynamics": 3, "memorableElements": 5,
                "challenges": 4, "cultureLevel": 5, "restRelaxation": 2,
                "experienceDepth": 4, "safetyAdventure": 3, "planningStyle": 2
            },
            "destination": "Rome, Italy",
            "dates": "June 10-15, 2025",
            "duration": 5,
            "budget": 80,
            "additional": "Love history and authentic food"
        },
        {
            "name": "🇯🇵 Tokyo Experience (Luxury Traveler)",
            "preferences": {
                "budgetComfort": 5, "travelPace": 2, "spontaneityLevel": 1,
                "placePreference": 4, "groupDynamics": 1, "memorableElements": 4,
                "challenges": 1, "cultureLevel": 5, "restRelaxation": 4,
                "experienceDepth": 5, "safetyAdventure": 1, "planningStyle": 5
            },
            "destination": "Tokyo, Japan",
            "dates": "April 1-7, 2025",
            "duration": 6,
            "budget": 200,
            "additional": "Interested in traditional culture and modern technology"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🎯 TEST CASE {i}: {test_case['name']}")
        print("-" * 50)
        
        try:
            result = generate_itinerary_for_backend(
                test_case['preferences'],
                test_case['destination'],
                test_case['dates'],
                test_case['duration'],
                test_case['budget'],
                test_case['additional']
            )
            
            if result['success']:
                print("✅ SUCCESS!")
                print(f"📍 Destination: {result['destination']}")
                print(f"📅 Dates: {result['travel_dates']}")
                print(f"💰 Budget: ${result['daily_budget']}/day (${result['total_budget']} total)")
                
                # Personality Analysis
                personality = result['personality_analysis']
                print(f"\n🧠 PERSONALITY ANALYSIS:")
                print(f"   Description: {personality['description'][:100]}...")
                print(f"   Motivations: {', '.join(personality['motivations'][:2])}")
                print(f"   Style: {personality['accommodation_style']}")
                
                # Weather Information
                if result['weather_forecast']:
                    print(f"\n🌤️  WEATHER FORECAST:")
                    weather = result['weather_forecast']
                    if isinstance(weather, dict) and 'daily_forecasts' in weather:
                        forecast_count = len(weather.get('daily_forecasts', {}))
                        print(f"   Forecast available for {forecast_count} days")
                    else:
                        print(f"   Weather data: {str(weather)[:100]}...")
                
                # Itinerary Preview
                itinerary = result['detailed_itinerary']
                print(f"\n📋 ITINERARY PREVIEW:")
                print(f"   {itinerary[:200]}...")
                
                print(f"\n✨ Generated at: {result['generated_at']}")
                
            else:
                print(f"❌ FAILED: {result['error']}")
                
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
    
    print(f"\n🎉 INTEGRATION TEST COMPLETE!")
    print("=" * 60)
    print("✅ All components tested:")
    print("   • ML Model Personality Prediction")
    print("   • Weather Service Integration") 
    print("   • Gemini AI Itinerary Generation")
    print("   • Enhanced Prompt Engineering")
    print("   • Budget & Schedule Management")

if __name__ == "__main__":
    test_complete_integration()
