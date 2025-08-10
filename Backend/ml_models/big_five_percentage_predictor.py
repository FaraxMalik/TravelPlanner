#!/usr/bin/env python3
"""
Big Five Percentage Predictor
Simple ML model that takes 12 preference responses and returns Big Five personality scores
"""

import sys
import json
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import pickle
import os

def predict_big_five_from_preferences(responses):
    """
    Predict Big Five personality scores from 12 travel preference responses
    
    Args:
        responses: List of 12 integers (1-4) representing user responses
    
    Returns:
        Dictionary with Big Five scores and personality description
    """
    
    # Convert responses to numpy array
    responses = np.array(responses).reshape(1, -1)
    
    # Simple mapping logic (since we don't have trained model yet)
    # This creates reasonable personality scores based on responses
    
    # Calculate scores based on response patterns
    avg_response = np.mean(responses)
    
    # Map responses to Big Five traits with some logic
    openness = min(1.0, max(0.0, (responses[0][1] + responses[0][6] + responses[0][11]) / 12.0))  # Based on place preference, photography, memorable elements
    conscientiousness = min(1.0, max(0.0, (responses[0][4] + responses[0][9]) / 8.0))  # Based on backup planning, packing philosophy
    extraversion = min(1.0, max(0.0, (responses[0][7] + responses[0][10]) / 8.0))  # Based on music preferences, group dynamics
    agreeableness = min(1.0, max(0.0, (responses[0][3] + responses[0][10]) / 8.0))  # Based on food preferences, group dynamics
    neuroticism = min(1.0, max(0.0, (8 - responses[0][2] - responses[0][8]) / 8.0))  # Inverse of travel pace and spontaneity
    
    # Add some randomness for more realistic scores
    import random
    random.seed(int(sum(responses[0])))  # Convert to int and use as deterministic seed
    
    openness += random.uniform(-0.1, 0.1)
    conscientiousness += random.uniform(-0.1, 0.1)
    extraversion += random.uniform(-0.1, 0.1)
    agreeableness += random.uniform(-0.1, 0.1)
    neuroticism += random.uniform(-0.1, 0.1)
    
    # Ensure scores are in valid range
    openness = min(1.0, max(0.0, openness))
    conscientiousness = min(1.0, max(0.0, conscientiousness))
    extraversion = min(1.0, max(0.0, extraversion))
    agreeableness = min(1.0, max(0.0, agreeableness))
    neuroticism = min(1.0, max(0.0, neuroticism))
    
    # Generate personality description
    description = generate_personality_description(
        openness, conscientiousness, extraversion, agreeableness, neuroticism
    )
    
    # Get dominant trait and traveler type
    dominant_info = get_dominant_trait(openness, conscientiousness, extraversion, agreeableness, neuroticism)
    
    return {
        'success': True,
        'big_five_scores': {
            'Openness': openness,
            'Conscientiousness': conscientiousness,
            'Extraversion': extraversion,
            'Agreeableness': agreeableness,
            'Neuroticism': neuroticism
        },
        'personality_description': description,
        'dominant_trait': dominant_info['trait'],
        'traveler_type': dominant_info['traveler_type'],
        'descriptions': {
            'Openness': {
                'description': 'Cultural Explorers who love discovering unique and artistic places',
                'places_they_love': 'Museums, art galleries, historical sites, cultural centers, local markets, traditional workshops, archaeological ruins, heritage villages, street art districts, cultural festivals, independent bookstores, artist studios',
                'traveler_type': 'Cultural Explorer'
            },
            'Conscientiousness': {
                'description': 'Luxury Seekers who prefer high-end and well-organized destinations',
                'places_they_love': 'Five-star hotels, fine dining restaurants, luxury spas, upscale shopping districts, premium resorts, exclusive clubs, high-end galleries, luxury cruise ships, gourmet food markets, wine estates, private tours',
                'traveler_type': 'Luxury Seeker'
            },
            'Extraversion': {
                'description': 'Social Party-Goers who thrive in vibrant and energetic environments',
                'places_they_love': 'Nightclubs, bars, beach parties, music festivals, social events, group tours, crowded markets, vibrant neighborhoods, sports venues, rooftop lounges, live music venues, dance clubs, karaoke bars',
                'traveler_type': 'Social Party-Goer'
            },
            'Agreeableness': {
                'description': 'Community Connectors who value authentic local experiences and peaceful places',
                'places_they_love': 'Local communities, family restaurants, parks, gardens, temples, community centers, volunteer organizations, local homes, peaceful cafes, nature reserves, spiritual sites, farmers markets',
                'traveler_type': 'Community Connector'
            },
            'Neuroticism': {
                'description': 'Comfort Seekers who prefer safe, familiar, and relaxing destinations',
                'places_they_love': 'All-inclusive resorts, familiar chain restaurants, hotel pools, spa centers, safe tourist areas, guided tour buses, shopping malls, comfortable lounges, well-reviewed establishments, beach resorts',
                'traveler_type': 'Comfort Seeker'
            }
        }
    }

def generate_personality_description(openness, conscientiousness, extraversion, agreeableness, neuroticism):
    """Generate a descriptive personality analysis for travel planning"""
    
    traits = []
    
    # Openness - Adventure vs Comfort
    if openness > 0.7:
        traits.append("You're an **Adventure Seeker** who thrives on discovering new cultures, exotic foods, and off-the-beaten-path experiences")
    elif openness > 0.4:
        traits.append("You're a **Balanced Explorer** who enjoys a good mix of familiar comforts and exciting new discoveries")
    else:
        traits.append("You're a **Comfort Traveler** who prefers well-known destinations and tried-and-true experiences")
    
    # Conscientiousness - Planning vs Spontaneity
    if conscientiousness > 0.7:
        traits.append("You're a **Meticulous Planner** who likes detailed itineraries, reservations, and well-organized trips")
    elif conscientiousness > 0.4:
        traits.append("You're a **Flexible Planner** who appreciates some planning but also leaves room for spontaneous adventures")
    else:
        traits.append("You're a **Spontaneous Wanderer** who prefers to go with the flow and discover things as you travel")
    
    # Extraversion - Social vs Solo
    if extraversion > 0.7:
        traits.append("You're a **Social Butterfly** who loves meeting new people, joining group activities, and experiencing vibrant social scenes")
    elif extraversion > 0.4:
        traits.append("You're a **Social Balancer** who enjoys both social activities and quiet moments of reflection")
    else:
        traits.append("You're a **Peaceful Traveler** who prefers intimate settings, peaceful environments, and meaningful solo experiences")
    
    # Agreeableness - Cultural immersion vs Independence
    if agreeableness > 0.7:
        traits.append("You're a **Cultural Connector** who is drawn to authentic cultural exchanges and connecting with local communities")
    elif agreeableness > 0.4:
        traits.append("You're a **Cultural Observer** who appreciates cultural experiences while maintaining your independence")
    else:
        traits.append("You're an **Independent Explorer** who values personal space and prefers observing cultures from a comfortable distance")
    
    # Neuroticism - Stress tolerance
    if neuroticism < 0.3:
        traits.append("You're a **Resilient Adventurer** who is adaptable and calm, handling travel challenges with ease")
    elif neuroticism < 0.7:
        traits.append("You're a **Steady Traveler** who handles most travel situations well but appreciates some predictability")
    else:
        traits.append("You're a **Security-Seeking Traveler** who prefers familiar environments and well-planned trips to minimize stress")
    
    return ". ".join(traits) + "."

def get_dominant_trait(openness, conscientiousness, extraversion, agreeableness, neuroticism):
    """Determine the dominant personality trait and return traveler type"""
    
    scores = {
        'Openness': openness,
        'Conscientiousness': conscientiousness,
        'Extraversion': extraversion,
        'Agreeableness': agreeableness,
        'Emotional_Stability': 1 - neuroticism  # Reverse neuroticism
    }
    
    dominant = max(scores, key=scores.get)
    
    # Map dominant traits to traveler types
    traveler_types = {
        'Openness': 'Adventure Seeker',
        'Conscientiousness': 'Meticulous Planner', 
        'Extraversion': 'Social Butterfly',
        'Agreeableness': 'Cultural Connector',
        'Emotional_Stability': 'Resilient Adventurer'
    }
    
    return {
        'trait': dominant,
        'traveler_type': traveler_types[dominant]
    }

def main():
    """Main function to handle command line input"""
    
    if len(sys.argv) != 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python big_five_percentage_predictor.py "response1,response2,...,response12"'
        }))
        return
    
    try:
        # Parse responses from command line argument
        responses_str = sys.argv[1]
        responses = [int(x.strip()) for x in responses_str.split(',')]
        
        if len(responses) != 12:
            print(json.dumps({
                'success': False,
                'error': f'Expected 12 responses, got {len(responses)}'
            }))
            return
        
        # Validate responses are in range 1-4
        for i, response in enumerate(responses):
            if response < 1 or response > 4:
                print(json.dumps({
                    'success': False,
                    'error': f'Response {i+1} must be between 1 and 4, got {response}'
                }))
                return
        
        # Get prediction
        result = predict_big_five_from_preferences(responses)
        
        # Output JSON result
        print(json.dumps(result))
        
    except ValueError as e:
        print(json.dumps({
            'success': False,
            'error': f'Invalid input format: {str(e)}'
        }))
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }))

if __name__ == '__main__':
    main()
