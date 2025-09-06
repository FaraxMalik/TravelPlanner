#!/usr/bin/env python3
"""
Travel Personality Prediction Script
Called by Node.js backend to predict travel personality from user preferences
"""

import sys
import json
import pickle
import numpy as np
import pandas as pd
from pathlib import Path

class TravelPersonalityPredictor:
    def __init__(self):
        self.models_dir = Path(__file__).parent.parent / 'models'
        self.load_models()
        
        # Travel personality descriptions
        self.traveler_descriptions = {
            'Cultural_Explorer': {
                'description': 'You are a **Cultural Explorer**! You love immersing yourself in local cultures, visiting museums, art galleries, and historical sites. You appreciate authentic experiences and learning about different traditions.',
                'places_they_love': 'Museums, art galleries, historical sites, cultural festivals, local markets, traditional restaurants, heritage sites, cultural workshops',
                'travel_style': 'Cultural immersion, educational experiences, authentic local interactions'
            },
            'Adventure_Seeker': {
                'description': 'You are an **Adventure Seeker**! You thrive on excitement and new experiences. You love outdoor activities, adrenaline-pumping adventures, and exploring off-the-beaten-path destinations.',
                'places_they_love': 'Hiking trails, adventure parks, extreme sports venues, national parks, mountain climbing, water sports, zip-lining, rock climbing',
                'travel_style': 'High-energy activities, outdoor adventures, thrill-seeking experiences'
            },
            'Luxury_Seeker': {
                'description': 'You are a **Luxury Seeker**! You appreciate comfort, quality, and premium experiences. You enjoy fine dining, upscale accommodations, and exclusive activities.',
                'places_they_love': 'Luxury hotels, fine dining restaurants, spa resorts, exclusive clubs, high-end shopping districts, premium tours, private experiences',
                'travel_style': 'Premium experiences, comfort and quality, exclusive access'
            },
            'Social_Party_Goer': {
                'description': 'You are a **Social Party Goer**! You love meeting new people, nightlife, and social experiences. You enjoy vibrant atmospheres, music venues, and group activities.',
                'places_they_love': 'Nightclubs, bars, music venues, social events, group tours, party districts, entertainment venues, social gatherings',
                'travel_style': 'Social interactions, nightlife, group activities, vibrant atmospheres'
            },
            'Nature_Lover': {
                'description': 'You are a **Nature Lover**! You find peace and joy in natural environments. You love scenic landscapes, wildlife, and outdoor activities in serene settings.',
                'places_they_love': 'National parks, botanical gardens, wildlife sanctuaries, scenic viewpoints, nature trails, beaches, mountains, forests',
                'travel_style': 'Nature appreciation, peaceful environments, outdoor activities'
            },
            'Budget_Backpacker': {
                'description': 'You are a **Budget Backpacker**! You value experiences over luxury and love discovering hidden gems on a budget. You enjoy authentic local experiences and meeting fellow travelers.',
                'places_they_love': 'Hostels, local markets, street food, budget-friendly attractions, public transportation, local neighborhoods, backpacker districts',
                'travel_style': 'Budget-conscious travel, authentic experiences, social interactions'
            },
            'Family_Oriented': {
                'description': 'You are **Family Oriented**! You prioritize family-friendly activities and safe, comfortable environments. You enjoy educational experiences and activities suitable for all ages.',
                'places_they_love': 'Family-friendly attractions, educational museums, safe neighborhoods, parks, family restaurants, kid-friendly activities, comfortable accommodations',
                'travel_style': 'Family-friendly experiences, safety and comfort, educational activities'
            },
            'Solo_Adventurer': {
                'description': 'You are a **Solo Adventurer**! You enjoy the freedom of traveling alone and discovering places at your own pace. You love unique experiences and meeting locals.',
                'places_they_love': 'Solo-friendly accommodations, local cafes, independent tours, quiet spots, unique experiences, local interactions, flexible itineraries',
                'travel_style': 'Independent exploration, unique experiences, local connections'
            },
            'Relaxation_Seeker': {
                'description': 'You are a **Relaxation Seeker**! You travel to unwind and recharge. You prefer peaceful environments, spa experiences, and stress-free activities.',
                'places_they_love': 'Spa resorts, quiet beaches, meditation centers, peaceful gardens, wellness retreats, quiet accommodations, relaxation activities',
                'travel_style': 'Peaceful environments, wellness activities, stress-free experiences'
            },
            'History_Buff': {
                'description': 'You are a **History Buff**! You are fascinated by historical sites, ancient civilizations, and cultural heritage. You love learning about the past and visiting significant historical locations.',
                'places_they_love': 'Historical sites, ancient ruins, heritage museums, archaeological sites, historical tours, cultural landmarks, traditional villages',
                'travel_style': 'Historical exploration, cultural heritage, educational experiences'
            }
        }

    def load_models(self):
        """Load trained models and metadata"""
        try:
            # Load classifier
            with open(self.models_dir / 'travel_personality_model.pkl', 'rb') as f:
                self.classifier = pickle.load(f)
            
            # Load scaler
            with open(self.models_dir / 'preference_scaler.pkl', 'rb') as f:
                self.scaler = pickle.load(f)
            
            # Load metadata
            with open(self.models_dir / 'model_metadata.json', 'r') as f:
                self.metadata = json.load(f)
            
            print("✅ Models loaded successfully", file=sys.stderr)
            
        except Exception as e:
            print(f"❌ Error loading models: {e}", file=sys.stderr)
            raise

    def predict_personality(self, preferences):
        """
        Predict travel personality from user preferences
        
        Args:
            preferences (dict): Dictionary with 12 preference values (1-4 scale)
            
        Returns:
            dict: Prediction results with personality analysis
        """
        try:
            # Validate preferences
            expected_fields = [
                'morningRoutine', 'placePreference', 'travelPace', 'foodPreferences',
                'backupPlanning', 'memoryCapturing', 'photographyStyle', 'musicPreferences',
                'spontaneityLevel', 'packingPhilosophy', 'groupDynamics', 'memorableElements'
            ]
            
            for field in expected_fields:
                if field not in preferences:
                    raise ValueError(f"Missing required field: {field}")
                
                value = preferences[field]
                if not isinstance(value, (int, float)) or value < 1 or value > 4:
                    raise ValueError(f"Invalid value for {field}: {value}. Must be 1-4.")
            
            # Prepare features
            feature_values = [preferences[field] for field in expected_fields]
            X = np.array(feature_values).reshape(1, -1)
            
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Make prediction
            predicted_type = self.classifier.predict(X_scaled)[0]
            probabilities = self.classifier.predict_proba(X_scaled)[0]
            
            # Get confidence scores for all types
            confidence_scores = {}
            for i, traveler_type in enumerate(self.metadata['traveler_types']):
                confidence_scores[traveler_type] = float(probabilities[i])
            
            # Get description for predicted type
            type_info = self.traveler_descriptions.get(predicted_type, {})
            
            # Calculate Big Five scores from preferences (approximate)
            big_five_scores = self.calculate_big_five_scores(preferences)
            
            # Determine dominant trait
            dominant_trait = max(big_five_scores, key=big_five_scores.get)
            
            result = {
                'success': True,
                'travel_type': predicted_type,
                'confidence': float(max(probabilities)),
                'places_they_love': type_info.get('places_they_love', ''),
                'travel_description': type_info.get('description', ''),
                'travel_style': type_info.get('travel_style', ''),
                'big_five_scores': big_five_scores,
                'dominant_trait': dominant_trait,
                'all_probabilities': confidence_scores,
                'model_used': 'trained_ml_model'
            }
            
            return result
            
        except Exception as e:
            # Enhanced fallback: Always return a valid travel type
            print(f"❌ ML Model Error: {e}", file=sys.stderr)
            print("🔄 Using enhanced fallback analysis", file=sys.stderr)
            
            # Calculate basic personality scores from preferences  
            fallback_scores = self.calculate_fallback_personality(preferences)
            dominant_trait = max(fallback_scores, key=fallback_scores.get)
            
            # Map to travel type with guaranteed fallback
            trait_to_type = {
                'EXT': 'Social_Party_Goer',
                'CSN': 'Luxury_Seeker', 
                'OPN': 'Cultural_Explorer',
                'AGR': 'Community_Connector',
                'EST': 'Nature_Lover'
            }
            
            predicted_type = trait_to_type.get(dominant_trait, 'Cultural_Explorer')
            type_info = self.traveler_descriptions.get(predicted_type, {})
            
            return {
                'success': True,
                'travel_type': predicted_type,
                'confidence': 0.75,  # Fallback confidence
                'places_they_love': type_info.get('places_they_love', 'Various cultural and interesting destinations'),
                'travel_description': type_info.get('description', f'You are a {predicted_type.replace("_", " ")}!'),
                'travel_style': type_info.get('travel_style', 'Balanced and enjoyable travel experiences'),
                'big_five_scores': fallback_scores,
                'dominant_trait': dominant_trait,
                'all_probabilities': {predicted_type: 0.75},
                'model_used': 'enhanced_fallback',
                'error_handled': str(e)
            }

    def calculate_fallback_personality(self, preferences):
        """
        Simple but reliable personality calculation that always works
        """
        try:
            # Default scores
            scores = {'EXT': 50, 'CSN': 50, 'OPN': 50, 'AGR': 50, 'EST': 50}
            
            # Simple mapping from common preference patterns
            if preferences.get('travelPace', 2) >= 3:
                scores['EXT'] += 15
            if preferences.get('backupPlanning', 2) <= 2:
                scores['CSN'] += 15
            if preferences.get('placePreference', 2) >= 3:
                scores['OPN'] += 15
            if preferences.get('groupDynamics', 2) >= 3:
                scores['AGR'] += 15
            if preferences.get('spontaneityLevel', 2) <= 2:
                scores['EST'] += 15
                
            return scores
        except:
            # Ultimate fallback - return balanced scores
            return {'EXT': 60, 'CSN': 55, 'OPN': 65, 'AGR': 50, 'EST': 50}

    def calculate_big_five_scores(self, preferences):
        """
        Calculate approximate Big Five scores from preferences
        This is a simplified mapping based on the preference mapping used in training
        """
        # Initialize scores
        big_five = {
            'EXT': 0,  # Extraversion
            'EST': 0,  # Emotional Stability (Neuroticism inverse)
            'AGR': 0,  # Agreeableness
            'CSN': 0,  # Conscientiousness
            'OPN': 0   # Openness
        }
        
        # Mapping from preferences to Big Five traits (weighted)
        preference_weights = {
            'morningRoutine': {'EXT': 0.5, 'CSN': 0.5},
            'placePreference': {'OPN': 0.6, 'EXT': 0.4},
            'travelPace': {'EXT': 0.6, 'CSN': 0.4},
            'foodPreferences': {'OPN': 0.5, 'AGR': 0.5},
            'backupPlanning': {'CSN': 0.6, 'EST': 0.4},
            'memoryCapturing': {'OPN': 0.5, 'EXT': 0.5},
            'photographyStyle': {'OPN': 0.5, 'EXT': 0.5},
            'musicPreferences': {'OPN': 0.5, 'EXT': 0.5},
            'spontaneityLevel': {'OPN': 0.6, 'EST': 0.4},
            'packingPhilosophy': {'CSN': 0.6, 'EXT': 0.4},
            'groupDynamics': {'AGR': 0.6, 'EXT': 0.4},
            'memorableElements': {'OPN': 0.6, 'EXT': 0.4}
        }
        
        # Calculate weighted scores
        trait_counts = {trait: 0 for trait in big_five}
        
        for pref, value in preferences.items():
            if pref in preference_weights:
                for trait, weight in preference_weights[pref].items():
                    big_five[trait] += value * weight
                    trait_counts[trait] += weight
        
        # Normalize scores (convert from 1-4 scale to 1-5 scale)
        for trait in big_five:
            if trait_counts[trait] > 0:
                big_five[trait] = 1 + (big_five[trait] / trait_counts[trait] - 1) * 4 / 3
                big_five[trait] = max(1, min(5, big_five[trait]))
            else:
                big_five[trait] = 3.0  # Neutral score
        
        return big_five

def main():
    """Main function called from Node.js"""
    try:
        # Read input from command line arguments
        if len(sys.argv) < 2:
            print(json.dumps({
                'success': False,
                'error': 'No preferences provided'
            }))
            return
        
        # Parse preferences from command line
        preferences_str = sys.argv[1]
        preferences = json.loads(preferences_str)
        
        # Initialize predictor
        predictor = TravelPersonalityPredictor()
        
        # Make prediction
        result = predictor.predict_personality(preferences)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))

if __name__ == "__main__":
    main()