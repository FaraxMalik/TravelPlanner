#!/usr/bin/env python3
"""
🧪 COMPLETE WORKFLOW TEST
Tests the entire AI Travel Planner system end-to-end
"""

import json
import random
from backend_integration_enhanced import generate_itinerary_for_backend

def generate_random_preferences():
    """Generate random answers for the 12 travel questions (1-5 scale)"""
    return {
        "budgetComfort": random.randint(1, 5),
        "travelPace": random.randint(1, 5), 
        "spontaneityLevel": random.randint(1, 5),
        "placePreference": random.randint(1, 5),
        "groupDynamics": random.randint(1, 5),
        "memorableElements": random.randint(1, 5),
        "challenges": random.randint(1, 5),
        "cultureLevel": random.randint(1, 5),
        "restRelaxation": random.randint(1, 5),
        "experienceDepth": random.randint(1, 5),
        "safetyAdventure": random.randint(1, 5),
        "planningStyle": random.randint(1, 5)
    }

def main():
    print("🌟 AI TRAVEL PLANNER - COMPLETE WORKFLOW TEST")
    print("=" * 60)
    
    # Generate random user preferences
    preferences = generate_random_preferences()
    print("📝 RANDOM USER PREFERENCES GENERATED:")
    for key, value in preferences.items():
        print(f"   {key}: {value}/5")
    
    # Trip details as specified
    destination = "Sydney, Australia"
    start_date = "August 13, 2025"
    end_date = "August 20, 2025"
    duration = 7  # days
    daily_budget = 142  # $1000 / 7 days ≈ $142/day
    total_budget = 1000
    additional_preferences = "Want to see Sydney Opera House and Harbour Bridge, enjoy good food and beaches"
    
    print(f"\n🎯 TRIP DETAILS:")
    print(f"   Destination: {destination}")
    print(f"   Dates: {start_date} to {end_date}")
    print(f"   Duration: {duration} days")
    print(f"   Total Budget: ${total_budget}")
    print(f"   Daily Budget: ${daily_budget}")
    print(f"   Special Requests: {additional_preferences}")
    
    print(f"\n🚀 GENERATING PERSONALIZED ITINERARY...")
    print("-" * 40)
    
    try:
        # Call the complete AI travel planner system
        result = generate_itinerary_for_backend(
            preferences,
            destination,
            f"{start_date} to {end_date}",
            duration,
            daily_budget,
            additional_preferences
        )
        
        if result['success']:
            print("✅ SUCCESS! Complete itinerary generated!")
            print("\n" + "🎉" * 20)
            
            # Display personality analysis
            personality = result['personality_analysis']
            print(f"\n🧠 PERSONALITY ANALYSIS:")
            print(f"📖 Description: {personality['description']}")
            print(f"🎯 Travel Motivations: {', '.join(personality['motivations'])}")
            print(f"🏨 Accommodation Style: {personality['accommodation_style']}")
            print(f"🎪 Preferred Activities: {', '.join(personality['preferred_activities'][:3])}")
            
            # Display weather forecast
            if result.get('weather_forecast'):
                print(f"\n🌤️  WEATHER FORECAST:")
                weather = result['weather_forecast']
                if isinstance(weather, dict) and 'daily_forecasts' in weather:
                    for day, forecast in list(weather['daily_forecasts'].items())[:3]:
                        print(f"   {day}: {forecast.get('description', 'N/A')}")
                else:
                    print(f"   Weather data available for planning")
            
            # Display detailed itinerary (first 1000 characters)
            print(f"\n📋 DETAILED ITINERARY:")
            print("=" * 50)
            itinerary = result['detailed_itinerary']
            
            # Show first part of itinerary
            if len(itinerary) > 1500:
                print(itinerary[:1500] + "...")
                print(f"\n[Showing first 1500 characters of {len(itinerary)} total characters]")
            else:
                print(itinerary)
            
            print("\n" + "✨" * 20)
            print(f"🎊 WORKFLOW TEST COMPLETE!")
            print(f"📊 Generated: {len(itinerary)} characters of detailed itinerary")
            print(f"🤖 AI Features Used: Personality Analysis + Weather Integration + Gemini AI")
            print(f"⏱️  Total Processing: Complete end-to-end pipeline")
            
            # Save detailed results to file for inspection
            with open('test_results.json', 'w') as f:
                json.dump(result, f, indent=2)
            print(f"💾 Full results saved to: test_results.json")
            
        else:
            print(f"❌ ERROR: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"💥 FATAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
