#!/usr/bin/env python3
"""
🎯 Enhanced Gemini Service with User Inputs
Accepts destination, dates, budget from user and creates detailed itineraries
"""

import google.generativeai as genai
import os
from datetime import datetime
from detailed_personality_predictor import generate_detailed_travel_personality

class DetailedTravelPlanner:
    """Enhanced travel planner with user inputs and detailed schedules"""
    
    def __init__(self, api_key=None):
        """Initialize with Gemini API"""
        if not api_key:
            api_key = os.getenv('GEMINI_API_KEY', 'AIzaSyD_Sph8KNA8slQB8AzWGm2Ioe3nU5jyldo')
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        print("✅ Enhanced Travel Planner initialized")
    
    def create_detailed_itinerary(self, 
                                personality_data: dict,
                                destination: str,
                                travel_dates: str,
                                duration: int,
                                daily_budget: int,
                                additional_preferences: str = "") -> dict:
        """
        Create detailed itinerary with user specifications
        
        Args:
            personality_data: From your ML model
            destination: Where to travel (e.g., "Tokyo, Japan")
            travel_dates: When to travel (e.g., "March 15-20, 2025")
            duration: Trip length in days
            daily_budget: Budget per day in USD
            additional_preferences: Extra user requests
        """
        
        total_budget = daily_budget * duration
        
        prompt = f"""Create a comprehensive {duration}-day travel itinerary for {destination} from {travel_dates} with a budget of ${daily_budget} per day (${total_budget} total), based on this detailed traveler profile:

TRAVELER PERSONALITY:
{personality_data.get('personality_description', 'Balanced traveler')}

TRAVEL MOTIVATIONS:
{', '.join(personality_data.get('travel_motivations', ['exploring new places']))}

ACCOMMODATION PREFERENCE:
{personality_data.get('accommodation_preference', 'Comfortable hotels')}

PREFERRED ACTIVITIES:
{', '.join(personality_data.get('preferred_activities', ['sightseeing']))}

TRAVEL SPECIFICATIONS:
- Destination: {destination}
- Travel Dates: {travel_dates}
- Duration: {duration} days
- Daily Budget: ${daily_budget}
- Total Budget: ${total_budget}
{f'- Additional Preferences: {additional_preferences}' if additional_preferences else ''}

Please provide a detailed itinerary using this EXACT format for each day:

DAY [X] - [Specific Date] - [Daily Theme]

MORNING (8:00 AM - 12:00 PM):
- 8:00 AM: Breakfast at [Restaurant Name] - Try: [Specific dish] - Cost: $[amount]
- 9:30 AM: [Specific Activity/Attraction] - Duration: [X hours] - Entry: $[amount]
- 11:00 AM: [Additional morning activity or travel time]
- Morning Total: $[amount]

AFTERNOON (12:00 PM - 6:00 PM):
- 12:30 PM: Lunch at [Restaurant Name] - Try: [Specific dish] - Cost: $[amount]
- 2:00 PM: [Main Afternoon Activity] - Duration: [X hours] - Cost: $[amount]
- 4:30 PM: [Secondary activity or rest/exploration time]
- Afternoon Total: $[amount]

EVENING (6:00 PM - 10:00 PM):
- 6:30 PM: [Evening Activity/Cultural Experience] - Cost: $[amount]
- 8:00 PM: Dinner at [Restaurant Name] - Try: [Specific dish] - Cost: $[amount]
- 9:30 PM: [Evening wind-down or local experience]
- Evening Total: $[amount]

TRANSPORTATION FOR THE DAY:
- Primary: [Method] - Cost: $[amount]
- Tips: [Specific transportation advice]

ACCOMMODATION:
- Hotel: [Specific hotel name and area]
- Nightly Rate: $[amount]
- Why it matches: [Brief explanation of personality fit]

DAILY COST BREAKDOWN:
- Meals: $[amount]
- Activities: $[amount]
- Transportation: $[amount]
- Accommodation: $[amount]
- TOTAL: $[amount] (Budget: ${daily_budget})

PERSONALITY MATCH:
- [Why today's activities match their travel motivations]
- [Cultural/experience elements that suit their personality]

INSIDER TIPS:
- [Local customs for today's activities]
- [Best times to visit attractions]
- [Money-saving tips while maintaining quality]

---

Provide this detailed format for all {duration} days. Ensure:
1. All restaurant and attraction names are real and specific
2. Meal recommendations are authentic local dishes
3. Daily costs stay within ${daily_budget} budget
4. Activities match their personality profile
5. Transportation is practical and cost-effective
6. Cultural experiences align with their motivations
7. Include exact addresses when possible

Focus on creating experiences that deeply resonate with their personality: {personality_data.get('personality_description', 'well-rounded traveler')}"""

        try:
            print(f"🤖 Generating detailed {duration}-day itinerary for {destination}...")
            print(f"📅 Dates: {travel_dates}")
            print(f"💰 Budget: ${daily_budget}/day (${total_budget} total)")
            
            response = self.model.generate_content(prompt)
            
            return {
                'success': True,
                'destination': destination,
                'travel_dates': travel_dates,
                'duration': duration,
                'daily_budget': daily_budget,
                'total_budget': total_budget,
                'personality_profile': personality_data.get('personality_description', ''),
                'detailed_itinerary': response.text,
                'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
        except Exception as e:
            print(f"❌ Error generating itinerary: {e}")
            return {
                'success': False,
                'error': str(e),
                'destination': destination,
                'travel_dates': travel_dates
            }

def test_enhanced_planner():
    """Test the enhanced planner with user inputs"""
    
    print("🎯 ENHANCED TRAVEL PLANNER TEST")
    print("=" * 50)
    
    # Sample personality data (from your ML model)
    personality_data = {
        'personality_description': 'A solo traveler who prefers spending time alone, exploring at their own pace. Enjoys active discovery with spontaneous detours and adventure opportunities, and seeks unique, off-the-beaten-path experiences and local hidden gems.',
        'travel_motivations': [
            'seeking novel experiences and personal growth',
            'connecting with local cultures and communities',
            'finding relaxation and stress relief'
        ],
        'accommodation_preference': 'Peaceful, comfortable accommodations that offer relaxation and tranquility',
        'preferred_activities': [
            'Adventure activities and unique local experiences',
            'Wellness activities and scenic relaxation spots',
            'Educational tours and historical site visits'
        ]
    }
    
    # User inputs
    destination = "Kyoto, Japan"
    travel_dates = "April 10-15, 2025"  # Cherry blossom season
    duration = 6
    daily_budget = 120  # $120 per day
    additional_preferences = "Want to experience traditional tea ceremonies and visit temples during cherry blossom season"
    
    print(f"📋 Test Parameters:")
    print(f"   Destination: {destination}")
    print(f"   Dates: {travel_dates}")
    print(f"   Duration: {duration} days")
    print(f"   Daily Budget: ${daily_budget}")
    print(f"   Additional: {additional_preferences}")
    
    # Create planner and generate itinerary
    planner = DetailedTravelPlanner()
    result = planner.create_detailed_itinerary(
        personality_data, destination, travel_dates, duration, daily_budget, additional_preferences
    )
    
    if result['success']:
        print(f"\n🎉 SUCCESS! Detailed itinerary generated!")
        print(f"📊 Summary:")
        print(f"   • {result['duration']} days in {result['destination']}")
        print(f"   • ${result['daily_budget']}/day (${result['total_budget']} total)")
        print(f"   • Generated: {result['generated_at']}")
        
        print(f"\n📋 Detailed Itinerary:")
        print("=" * 60)
        print(result['detailed_itinerary'][:1000] + "...")
        print("=" * 60)
        
        print(f"\n✅ Your enhanced travel planner is working!")
        print(f"🎯 Personality + Budget + Dates + Destination = Perfect Itinerary")
        
    else:
        print(f"❌ Error: {result['error']}")

if __name__ == "__main__":
    test_enhanced_planner()
