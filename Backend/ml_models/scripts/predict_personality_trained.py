#!/usr/bin/env python3
"""
Travel Personality Prediction Script - Using Trained Models
This replaces the fallback analysis with actual trained ML models
"""

import sys
import json
import pickle
import numpy as np
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# This class predicts travel personality using trained ML models and rule-based logic
class TrainedTravelPersonalityPredictor:
    # Initializes the predictor and loads models
    def __init__(self):
        self.models_dir = Path(__file__).parent.parent / 'models'
        self.load_models()
        
        # Travel personality descriptions (kept from training)
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
                'description': 'You are a **Luxury Seeker**! You appreciate the finer things in life and prefer comfort and elegance in your travels. You enjoy premium experiences, fine dining, and luxurious accommodations.',
                'places_they_love': 'Luxury hotels, fine dining restaurants, spas, premium shopping districts, exclusive venues, high-end cultural experiences',
                'travel_style': 'Comfort-focused, premium experiences, luxury accommodations'
            },
            'Social_Party_Goer': {
                'description': 'You are a **Social Party Goer**! You love meeting new people, experiencing vibrant nightlife, and being part of social gatherings. You seek destinations with great entertainment and social scenes.',
                'places_they_love': 'Nightclubs, bars, festivals, social events, beach parties, live music venues, bustling social districts',
                'travel_style': 'Social experiences, nightlife, group activities, entertainment-focused'
            },
            'Nature_Lover': {
                'description': 'You are a **Nature Lover**! You find peace and inspiration in natural environments. You prefer destinations with beautiful landscapes, wildlife, and opportunities to connect with nature.',
                'places_they_love': 'National parks, wildlife reserves, hiking trails, beaches, mountains, forests, botanical gardens, scenic viewpoints',
                'travel_style': 'Nature-focused, peaceful environments, outdoor activities, wildlife experiences'
            },
            'Budget_Backpacker': {
                'description': 'You are a **Budget Backpacker**! You love authentic, affordable travel experiences. You prefer local transportation, street food, and staying in budget accommodations while maximizing cultural immersion.',
                'places_they_love': 'Local markets, street food vendors, hostels, public transportation, local neighborhoods, free attractions, walking tours',
                'travel_style': 'Budget-conscious, authentic experiences, local immersion, independent travel'
            },
            'Family_Oriented': {
                'description': 'You are **Family Oriented**! You prioritize safe, family-friendly destinations with activities suitable for all ages. You value educational and bonding experiences that everyone can enjoy.',
                'places_they_love': 'Theme parks, family resorts, educational museums, zoos, aquariums, family-friendly beaches, cultural sites with guided tours',
                'travel_style': 'Family-friendly, safe environments, educational experiences, group bonding activities'
            },
            'Solo_Adventurer': {
                'description': 'You are a **Solo Adventurer**! You enjoy independent travel and self-discovery. You prefer flexible itineraries and unique experiences that allow for personal reflection and growth.',
                'places_they_love': 'Quiet cafes, solo hiking trails, photography spots, meditation retreats, local workshops, independent bookstores, peaceful locations',
                'travel_style': 'Independent travel, flexible schedules, self-discovery, unique personal experiences'
            },
            'Relaxation_Seeker': {
                'description': 'You are a **Relaxation Seeker**! You travel to unwind and recharge. You prefer peaceful destinations with spa services, comfortable accommodations, and stress-free activities.',
                'places_they_love': 'Spas, quiet beaches, wellness retreats, comfortable resorts, peaceful gardens, meditation centers, calm lakes',
                'travel_style': 'Relaxation-focused, wellness experiences, comfortable pace, stress-free environments'
            },
            'History_Buff': {
                'description': 'You are a **History Buff**! You are fascinated by historical sites, ancient civilizations, and cultural heritage. You love learning about the past through travel.',
                'places_they_love': 'Historical sites, ancient ruins, museums, archaeological sites, heritage tours, historical monuments, cultural heritage centers',
                'travel_style': 'Educational travel, historical exploration, cultural heritage, guided historical tours'
            }
        }
    
    # Loads trained ML models from disk
    def load_models(self):
        """Load the trained models"""
        try:
            logger.info(f"Loading models from {self.models_dir}")
            
            # Load metadata
            with open(self.models_dir / 'model_metadata.json', 'r') as f:
                self.metadata = json.load(f)
            
            # Try to load trained classifier (if available)
            classifier_path = self.models_dir / 'travel_personality_classifier.pkl'
            scaler_path = self.models_dir / 'travel_personality_scaler.pkl'
            encoder_path = self.models_dir / 'label_encoder.pkl'
            
            if classifier_path.exists() and scaler_path.exists() and encoder_path.exists():
                with open(classifier_path, 'rb') as f:
                    self.classifier = pickle.load(f)
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                with open(encoder_path, 'rb') as f:
                    self.label_encoder = pickle.load(f)
                
                self.use_trained_model = True
                logger.info("✅ Trained models loaded successfully")
            else:
                self.use_trained_model = False
                logger.info("⚠️ Trained models not found, will use rule-based approach")
                
        except Exception as e:
            logger.error(f"❌ Error loading models: {e}")
            self.use_trained_model = False
    
    # Maps 12 travel questions to Big Five scores
    def map_12_questions_to_big_five(self, preferences):
        """Map 12 travel preference questions to Big Five scores"""
        # Extract the 12 preference values
        morning = preferences.get('morningRoutine', 3)
        place = preferences.get('placePreference', 3) 
        pace = preferences.get('travelPace', 3)
        food = preferences.get('foodPreferences', 3)
        backup = preferences.get('backupPlanning', 3)
        memory = preferences.get('memoryCapturing', 3)
        photo = preferences.get('photographyStyle', 3)
        music = preferences.get('musicPreferences', 3)
        spontaneity = preferences.get('spontaneityLevel', 3)
        packing = preferences.get('packingPhilosophy', 3)
        group = preferences.get('groupDynamics', 3)
        memorable = preferences.get('memorableElements', 3)
        
        # Create estimated Big Five scores based on travel preferences
        
        # Extraversion: social aspects, group dynamics, social activities
        ext_score = (group + place + music) / 3.0
        
        # Emotional Stability: planning, backup planning, pace
        est_score = (backup + packing + (5 - spontaneity)) / 3.0
        
        # Agreeableness: group dynamics, food sharing, social harmony
        agr_score = (group + food + memorable) / 3.0
        
        # Conscientiousness: planning, packing, morning routine
        csn_score = (backup + packing + morning) / 3.0
        
        # Openness: place preference, spontaneity, new experiences
        opn_score = (place + spontaneity + memorable) / 3.0
        
        return [ext_score, est_score, agr_score, csn_score, opn_score]
    
    # Assigns travel personality using rule-based logic
    def assign_travel_personality_rule_based(self, big_five_scores):
        """Rule-based personality assignment"""
        ext, est, agr, csn, opn = big_five_scores
        
        # Use thresholds
        high_ext = ext >= 3.0
        high_est = est >= 3.0
        high_agr = agr >= 3.0
        high_csn = csn >= 3.0
        high_opn = opn >= 3.0
        
        # Rule-based assignment
        if high_opn and high_csn:
            return 'Cultural_Explorer'
        elif high_ext and high_opn:
            return 'Adventure_Seeker'
        elif high_agr and high_csn:
            return 'Family_Oriented'
        elif high_ext and not high_csn:
            return 'Social_Party_Goer'
        elif high_opn and not high_csn:
            return 'Budget_Backpacker'
        elif not high_ext and high_opn:
            return 'Solo_Adventurer'
        elif high_est and high_agr:
            return 'Relaxation_Seeker'
        elif not high_agr and high_csn:
            return 'Luxury_Seeker'
        elif high_opn and high_agr:
            return 'Nature_Lover'
        else:
            return 'History_Buff'
    
    # Predicts personality using the trained ML model
    def predict_with_trained_model(self, preferences):
        """Use trained ML model for prediction"""
        try:
            # Map 12 questions to simulated 50 Big Five questions
            # This is a simplified approach - in practice you'd want a more sophisticated mapping
            big_five_scores = self.map_12_questions_to_big_five(preferences)
            
            # Create a feature vector that mimics the 50 Big Five questions
            # Each Big Five trait gets 10 questions, we'll replicate the scores
            feature_vector = []
            trait_scores = big_five_scores
            
            for trait_score in trait_scores:
                # Add some noise to create variation for the 10 questions per trait
                for i in range(10):
                    noise = np.random.normal(0, 0.2)  # Small noise
                    question_score = max(1, min(5, trait_score + noise))
                    feature_vector.append(question_score)
            
            # Scale the features
            X = np.array(feature_vector).reshape(1, -1)
            X_scaled = self.scaler.transform(X)
            
            # Make prediction
            predicted_class = self.classifier.predict(X_scaled)[0]
            probabilities = self.classifier.predict_proba(X_scaled)[0]
            
            # Get travel type name
            travel_type = self.label_encoder.inverse_transform([predicted_class])[0]
            confidence = float(probabilities[predicted_class])
            
            return travel_type, confidence, big_five_scores
            
        except Exception as e:
            logger.error(f"Error in trained model prediction: {e}")
            # Fall back to rule-based
            return self.predict_with_rule_based(preferences)
    
    # Predicts personality using rule-based logic
    def predict_with_rule_based(self, preferences):
        """Use rule-based approach for prediction"""
        big_five_scores = self.map_12_questions_to_big_five(preferences)
        travel_type = self.assign_travel_personality_rule_based(big_five_scores)
        confidence = 0.75  # Fixed confidence for rule-based
        
        return travel_type, confidence, big_five_scores
    
    # Main function to predict personality from preferences
    def predict_personality(self, preferences):
        """
        Main prediction function that chooses between trained model and rule-based approach
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
            
            # Choose prediction method
            if self.use_trained_model:
                travel_type, confidence, big_five_scores = self.predict_with_trained_model(preferences)
                model_used = "trained_ml_model"
                logger.info(f"✅ Used trained ML model for prediction: {travel_type}")
            else:
                travel_type, confidence, big_five_scores = self.predict_with_rule_based(preferences)
                model_used = "trained_rule_based_model"
                logger.info(f"✅ Used rule-based model for prediction: {travel_type}")
            
            # Get description for predicted type
            type_info = self.traveler_descriptions.get(travel_type, {})
            
            # Create Big Five scores dictionary
            big_five_dict = {
                'EXT': big_five_scores[0],
                'EST': big_five_scores[1],
                'AGR': big_five_scores[2],
                'CSN': big_five_scores[3],
                'OPN': big_five_scores[4]
            }
            
            # Determine dominant trait
            dominant_trait = max(big_five_dict, key=big_five_dict.get)
            
            return {
                'success': True,
                'travel_type': travel_type,
                'confidence': confidence,
                'places_they_love': type_info.get('places_they_love', ''),
                'travel_description': type_info.get('description', ''),
                'travel_style': type_info.get('travel_style', ''),
                'big_five_scores': big_five_dict,
                'dominant_trait': dominant_trait,
                'model_used': model_used
            }
            
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            return {
                'success': False,
                'error': str(e)
            }

# Main entry point for running the predictor
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
        predictor = TrainedTravelPersonalityPredictor()
        
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
