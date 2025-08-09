#!/usr/bin/env python3
"""
🚀 Backend Integration Function
For your Node.js backend to call with user inputs
"""

import sys
import json
import os
from detailed_personality_predictor import generate_detailed_travel_personality
from weather_service import WeatherService

# Set API key
os.environ['GEMINI_API_KEY'] = 'AIzaSyD_Sph8KNA8slQB8AzWGm2Ioe3nU5jyldo'

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

def generate_itinerary_for_backend(travel_preferences, destination, travel_dates, duration, daily_budget, additional_preferences=""):
    """
    Main function for Node.js backend integration
    
    Args:
        travel_preferences: Dict with 12 travel question responses
        destination: Where to travel
        travel_dates: When to travel
        duration: Number of days
        daily_budget: Budget per day in USD
        additional_preferences: Extra user requests
    
    Returns:
        JSON response with itinerary
    """
    
    try:
        # Step 1: Generate personality from preferences
        big_five_scores = [0.6, 0.65, 0.7, 0.68, 0.72]  # Would come from your ML model
        personality_data = generate_detailed_travel_personality(big_five_scores, travel_preferences)
        
        # Step 2: Get weather data for the destination
        weather_service = WeatherService()
        weather_data = weather_service.get_weather_forecast(destination, travel_dates, duration)
        
        if not GEMINI_AVAILABLE:
            return {
                'success': False,
                'error': 'Gemini AI library not available',
                'personality_data': personality_data,
                'weather_data': weather_data
            }
        
        # Step 2: Get weather data for the destination
        weather_service = WeatherService()
        weather_data = weather_service.get_weather_forecast(destination, travel_dates, duration)
        
        if not GEMINI_AVAILABLE:
            return {
                'success': False,
                'error': 'Gemini AI library not available',
                'personality_data': personality_data,
                'weather_data': weather_data
            }
        
        # Step 3: Configure Gemini
        genai.configure(api_key=os.environ['GEMINI_API_KEY'])
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Step 4: Create enhanced prompt with weather data
        total_budget = daily_budget * duration
        
        # Add weather information to the prompt
        weather_summary = ""
        if weather_data and weather_data.get('daily_forecasts'):
            weather_summary = f"\nWEATHER FORECAST:\n{weather_data['summary']}\n"
            weather_summary += "\nDaily Weather Details:\n"
            for day, forecast in weather_data['daily_forecasts'].items():
                weather_summary += f"- {day}: {forecast['description']}, {forecast['temperature_range']}\n"
            weather_summary += f"\nClothing Advice: {weather_data.get('clothing_advice', 'Pack appropriately for the season')}\n"
        
        prompt = f"""Create a comprehensive {duration}-day travel itinerary for {destination} from {travel_dates} with a budget of ${daily_budget} per day (${total_budget} total), based on this traveler profile:

TRAVELER PERSONALITY:
{personality_data['personality_description']}

TRAVEL MOTIVATIONS:
{', '.join(personality_data['travel_motivations'])}

ACCOMMODATION PREFERENCE:
{personality_data['accommodation_preference']}

PREFERRED ACTIVITIES:
{', '.join(personality_data['preferred_activities'])}{weather_summary}

TRAVEL SPECIFICATIONS:
- Destination: {destination}
- Travel Dates: {travel_dates}
- Duration: {duration} days
- Daily Budget: ${daily_budget}
- Total Budget: ${total_budget}
{f'- Additional Preferences: {additional_preferences}' if additional_preferences else ''}

Please provide a detailed itinerary using this EXACT format for each day. Consider the weather conditions for activity planning:

DAY [X] - [Specific Date] - [Daily Theme]
WEATHER: [Temperature, conditions, and recommendations]

MORNING (8:00 AM - 12:00 PM):
- 8:00 AM: Breakfast at [Restaurant Name] - Try: [Specific dish] - Cost: $[amount]
- 9:30 AM: [Weather-appropriate Activity/Attraction] - Duration: [X hours] - Entry: $[amount]
- 11:00 AM: [Additional morning activity considering weather]

AFTERNOON (12:00 PM - 6:00 PM):
- 12:30 PM: Lunch at [Restaurant Name] - Try: [Specific dish] - Cost: $[amount]  
- 2:00 PM: [Main Afternoon Activity - indoor/outdoor based on weather] - Duration: [X hours] - Cost: $[amount]
- 4:30 PM: [Secondary activity or rest/exploration time]

EVENING (6:00 PM - 10:00 PM):
- 6:30 PM: [Evening Activity/Cultural Experience] - Cost: $[amount]
- 8:00 PM: Dinner at [Restaurant Name] - Try: [Specific dish] - Cost: $[amount]
- 9:30 PM: [Evening wind-down or local experience]

ACCOMMODATION:
- Hotel: [Specific hotel name and area] - $[amount]/night

TRANSPORTATION:
- Method: [bus/train/walking/taxi] - Daily cost: $[amount]

DAILY TOTAL: $[amount] (Budget: ${daily_budget})

PERSONALITY NOTES:
- [Why activities match their travel style]

WEATHER CONSIDERATIONS:
- [How the day's activities are adapted to weather conditions]

Provide this format for all {duration} days. Include real restaurant names, specific dishes, actual attraction costs, and ensure daily totals stay within ${daily_budget}. Adapt activities to weather conditions - suggest indoor alternatives for rainy days, outdoor activities for sunny weather. Focus on experiences matching: {personality_data['travel_motivations'][0]}."""

TRANSPORTATION:
- Method: [bus/train/walking/taxi] - Daily cost: $[amount]

DAILY TOTAL: $[amount] (Budget: ${daily_budget})

PERSONALITY NOTES:
- [Why activities match their travel style]

Provide this format for all {duration} days. Include real restaurant names, specific dishes, actual attraction costs, and ensure daily totals stay within ${daily_budget}. Focus on experiences matching: {personality_data['travel_motivations'][0]}."""

        # Step 5: Generate with Gemini
        response = model.generate_content(prompt)
        
        return {
            'success': True,
            'destination': destination,
            'travel_dates': travel_dates,
            'duration': duration,
            'daily_budget': daily_budget,
            'total_budget': total_budget,
            'personality_analysis': {
                'description': personality_data['personality_description'],
                'motivations': personality_data['travel_motivations'],
                'accommodation_style': personality_data['accommodation_preference'],
                'preferred_activities': personality_data['preferred_activities']
            },
            'weather_forecast': weather_data if weather_data else None,
            'detailed_itinerary': response.text,
            'generated_at': '2025-08-09'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'destination': destination,
            'travel_dates': travel_dates
        }

# CLI interface for testing and Node.js integration
if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Called from Node.js with JSON arguments
        try:
            travel_preferences = json.loads(sys.argv[1])
            destination = sys.argv[2]
            travel_dates = sys.argv[3]
            duration = int(sys.argv[4])
            daily_budget = int(sys.argv[5])
            additional_preferences = sys.argv[6] if len(sys.argv) > 6 else ""
            
            result = generate_itinerary_for_backend(
                travel_preferences, destination, travel_dates, duration, daily_budget, additional_preferences
            )
            
            print(json.dumps(result))
            
        except Exception as e:
            print(json.dumps({'success': False, 'error': str(e)}))
    
    else:
        # Test mode
        print("🎯 BACKEND INTEGRATION TEST")
        print("=" * 40)
        
        # Sample data
        sample_preferences = {
            "budgetComfort": 3, "travelPace": 2, "spontaneityLevel": 2,
            "placePreference": 4, "groupDynamics": 2, "memorableElements": 4,
            "challenges": 2, "cultureLevel": 4, "restRelaxation": 4,
            "experienceDepth": 4, "safetyAdventure": 1, "planningStyle": 3
        }
        
        result = generate_itinerary_for_backend(
            sample_preferences, 
            "Rome, Italy", 
            "May 15-20, 2025", 
            5, 
            100,
            "Want to see Colosseum and Vatican, prefer authentic Italian food"
        )
        
        if result['success']:
            print("✅ SUCCESS! Sample itinerary generated")
            print(f"📍 {result['destination']} • {result['duration']} days • ${result['daily_budget']}/day")
            print(f"🧠 Personality: {result['personality_analysis']['description'][:100]}...")
            print(f"📋 Itinerary preview: {result['detailed_itinerary'][:200]}...")
        else:
            print(f"❌ Error: {result['error']}")
        
        print(f"\n💡 Integration ready for Node.js backend!")
