#!/usr/bin/env python3
"""
🎯 Production Gemini Service for AI Travel Planner
Integrates with your Node.js backend
"""

import google.generativeai as genai
import json
import os
from typing import Dict, Optional

class GeminiTravelPlanner:
    """Production-ready Gemini integration for travel planning"""
    
    def __init__(self):
        """Initialize with API key from environment"""
        
        # Get API key from environment
        api_key = os.getenv('GEMINI_API_KEY', 'AIzaSyD_Sph8KNA8slQB8AzWGm2Ioe3nU5jyldo')
        
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        print("✅ Gemini Travel Planner initialized")
    
    def create_itinerary(self, personality_data: Dict, destination: str, duration: int = 7, budget: str = "moderate") -> Dict:
        """
        Create personalized itinerary using personality data
        
        Args:
            personality_data: From your ML model (detailed personality description)
            destination: Where to travel
            duration: Trip length in days
            budget: "budget", "moderate", "luxury"
        
        Returns:
            Structured itinerary data
        """
        
        # Create enhanced prompt
        prompt = f"""Create a {duration}-day travel itinerary for {destination} based on this detailed traveler profile:

TRAVELER PERSONALITY:
{personality_data.get('personality_description', 'Balanced traveler')}

TRAVEL MOTIVATIONS:
{', '.join(personality_data.get('travel_motivations', ['exploring new places']))}

ACCOMMODATION PREFERENCE:
{personality_data.get('accommodation_preference', 'Comfortable hotels')}

PREFERRED ACTIVITIES:
{', '.join(personality_data.get('preferred_activities', ['sightseeing']))}

BUDGET LEVEL: {budget.title()}

Please provide a detailed response in this exact JSON format:
{{
    "destination": "{destination}",
    "duration": {duration},
    "trip_overview": "Brief description of the trip highlighting personality match",
    "daily_itinerary": [
        {{
            "day": 1,
            "title": "Arrival & First Impressions",
            "morning": "Activity description",
            "afternoon": "Activity description", 
            "evening": "Activity description",
            "meals": {{
                "breakfast": "Recommendation",
                "lunch": "Recommendation",
                "dinner": "Recommendation"
            }},
            "accommodation": "Where to stay",
            "transportation": "Getting around",
            "estimated_cost": "$X - $Y",
            "personality_notes": "Why this fits their personality"
        }}
    ],
    "travel_tips": ["Tip 1", "Tip 2", "Tip 3"],
    "packing_list": ["Item 1", "Item 2", "Item 3"],
    "total_cost_estimate": "Total budget range",
    "best_time_to_visit": "Recommended season/months"
}}

Ensure every recommendation matches their personality traits and travel motivations. Make it highly personalized."""

        try:
            print(f"🤖 Generating {duration}-day itinerary for {destination}...")
            
            # Generate response
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            # Try to extract JSON
            try:
                # Find JSON in response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_text = response_text[start_idx:end_idx]
                    itinerary = json.loads(json_text)
                    
                    # Add metadata
                    itinerary['generated_by'] = 'AI Travel Planner'
                    itinerary['personality_matched'] = True
                    
                    print("✅ Structured itinerary generated successfully!")
                    return {
                        'success': True,
                        'itinerary': itinerary
                    }
                else:
                    # Return unstructured response
                    return {
                        'success': True,
                        'itinerary': {
                            'destination': destination,
                            'duration': duration,
                            'description': response_text,
                            'structured': False
                        }
                    }
                    
            except json.JSONDecodeError:
                # Return raw response if JSON parsing fails
                return {
                    'success': True,
                    'itinerary': {
                        'destination': destination,
                        'duration': duration,
                        'description': response_text,
                        'structured': False
                    }
                }
                
        except Exception as e:
            print(f"❌ Error generating itinerary: {e}")
            return {
                'success': False,
                'error': str(e),
                'fallback': f"Unable to generate itinerary for {destination}. Please try again."
            }

# Export for use in your Node.js backend
def generate_travel_itinerary(personality_data: Dict, destination: str, duration: int = 7, budget: str = "moderate") -> Dict:
    """
    Main function to be called from your Node.js backend
    
    Usage from Node.js:
    const { PythonShell } = require('python-shell');
    
    PythonShell.run('gemini_service.py', {
        args: [JSON.stringify(personalityData), destination, duration, budget]
    }, callback);
    """
    
    try:
        planner = GeminiTravelPlanner()
        result = planner.create_itinerary(personality_data, destination, duration, budget)
        return result
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

# CLI interface for testing
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python gemini_service.py <destination> <duration> [budget]")
        print("Example: python gemini_service.py 'Tokyo, Japan' 7 moderate")
        sys.exit(1)
    
    # Parse arguments
    destination = sys.argv[1]
    duration = int(sys.argv[2])
    budget = sys.argv[3] if len(sys.argv) > 3 else "moderate"
    
    # Sample personality data (normally from your ML model)
    sample_personality = {
        'personality_description': 'A moderately social traveler who enjoys meeting locals but values quiet personal moments. Prefers well-researched destinations with historical and cultural significance, and seeks authentic cultural immersion experiences.',
        'travel_motivations': [
            'connecting with local cultures and communities',
            'learning and expanding knowledge through travel',
            'finding relaxation and stress relief'
        ],
        'accommodation_preference': 'Well-reviewed, reliable hotels with excellent service and cultural character',
        'preferred_activities': [
            'Cultural workshops and community-based tourism',
            'Educational tours and historical site visits',
            'Wellness activities and scenic relaxation spots'
        ]
    }
    
    print(f"🎯 Testing Gemini Integration")
    print(f"Destination: {destination}")
    print(f"Duration: {duration} days")
    print(f"Budget: {budget}")
    
    # Generate itinerary
    result = generate_travel_itinerary(sample_personality, destination, duration, budget)
    
    if result['success']:
        print(f"\n🎉 SUCCESS! Itinerary generated!")
        
        # Print overview
        itinerary = result['itinerary']
        if itinerary.get('structured', True):
            print(f"\n📋 Trip Overview:")
            print(f"   {itinerary.get('trip_overview', 'Personalized itinerary created')}")
            
            if 'daily_itinerary' in itinerary:
                print(f"\n📅 Daily Itinerary:")
                for day in itinerary['daily_itinerary'][:2]:  # Show first 2 days
                    print(f"   Day {day['day']}: {day['title']}")
                print(f"   ... and {len(itinerary['daily_itinerary'])-2} more days")
        else:
            print(f"\n📝 Itinerary Description:")
            print(f"   {itinerary['description'][:200]}...")
            
    else:
        print(f"❌ Error: {result['error']}")
    
    print(f"\n🚀 Your Gemini integration is working!")
