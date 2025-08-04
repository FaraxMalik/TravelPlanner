import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, r2_score
import pickle

class BigFivePercentagePredictor:
    """
    Predicts Big Five personality percentage scores (0-100%) from 12 travel preference questions.
    Returns percentage scores for all 5 traits: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism.
    """
    
    def __init__(self, model_path=None):
        self.models = {}  # One model per Big Five trait
        self.scaler = StandardScaler()
        self.imputer = SimpleImputer(strategy='mean')
        self.feature_names = None
        
        # Big Five descriptions with travel applications
        self.big_five_descriptions = {
            'Openness': {
                'description': 'Creative, curious, adventurous travelers who seek novel experiences and cultural immersion',
                'travel_preferences': 'Cultural sites, off-beaten-path adventures, artistic experiences, local traditions, museums, historical sites',
                'high_score_meaning': 'Very open to new experiences, cultural immersion, artistic pursuits',
                'low_score_meaning': 'Prefers familiar experiences, comfort over novelty'
            },
            'Conscientiousness': {
                'description': 'Organized, planned, detail-oriented travelers who prefer structured experiences',
                'travel_preferences': 'Luxury accommodations, detailed itineraries, high-end dining, organized tours, well-reviewed places',
                'high_score_meaning': 'Very organized, plans everything, prefers luxury and structure',
                'low_score_meaning': 'Spontaneous, flexible, doesn\'t need detailed planning'
            },
            'Extraversion': {
                'description': 'Social, energetic, outgoing travelers who thrive on interactions and excitement',
                'travel_preferences': 'Group activities, nightlife, social experiences, vibrant destinations, party scenes, guided tours',
                'high_score_meaning': 'Very social, loves group activities, nightlife, meeting people',
                'low_score_meaning': 'Prefers quiet, solo experiences, peaceful destinations'
            },
            'Agreeableness': {
                'description': 'Cooperative, trusting, compassionate travelers who value peaceful experiences',
                'travel_preferences': 'Peaceful destinations, local authenticity, community experiences, nature retreats, family-friendly places',
                'high_score_meaning': 'Very cooperative, values local culture, peaceful experiences',
                'low_score_meaning': 'More independent, may prefer less touristy areas'
            },
            'Neuroticism': {
                'description': 'Sensitive, comfort-seeking travelers who prefer familiar and relaxing experiences',
                'travel_preferences': 'Comfortable accommodations, familiar food, relaxing activities, safe destinations, all-inclusive resorts',
                'high_score_meaning': 'Prefers comfort, safety, familiar experiences, stress-free travel',
                'low_score_meaning': 'More adventurous, comfortable with uncertainty, flexible'
            }
        }
        
        if model_path:
            self.load_model(model_path)
    
    def create_features(self, user_responses):
        """Create comprehensive features from user responses"""
        features = {}
        
        # Basic statistics
        features['response_mean'] = np.mean(user_responses)
        features['response_variance'] = np.var(user_responses)
        features['response_range'] = max(user_responses) - min(user_responses)
        features['response_std'] = np.std(user_responses)
        
        # Individual question responses
        for i, response in enumerate(user_responses):
            features[f'q{i+1}_response'] = response
        
        # Question-specific patterns
        features['adventure_preference'] = np.sum([r >= 2 for r in user_responses])
        features['comfort_preference'] = np.sum([r <= 1 for r in user_responses])
        features['social_preference'] = np.sum([r >= 2 for r in user_responses[3:7]])  # Questions 4-7
        features['cultural_preference'] = np.sum([r >= 2 for r in user_responses[1:3]])  # Questions 2-3
        features['planning_preference'] = np.sum([r <= 1 for r in user_responses[2:4]])  # Questions 3-4
        
        # Response patterns
        features['high_variance'] = 1 if features['response_variance'] > 1.5 else 0
        features['low_variance'] = 1 if features['response_variance'] < 0.5 else 0
        features['consistent_responses'] = 1 if features['response_variance'] < 0.8 else 0
        
        # Preference intensity
        features['strong_adventure'] = np.sum([r == 3 for r in user_responses])
        features['strong_comfort'] = np.sum([r == 0 for r in user_responses])
        features['moderate_preferences'] = np.sum([r == 1 for r in user_responses])
        
        # Question group patterns
        features['morning_preference'] = user_responses[0]  # Question 1
        features['place_preference'] = user_responses[1]    # Question 2
        features['pace_preference'] = user_responses[2]     # Question 3
        features['food_preference'] = user_responses[3]     # Question 4
        features['weather_preference'] = user_responses[4]  # Question 5
        features['souvenir_preference'] = user_responses[5] # Question 6
        features['photo_preference'] = user_responses[6]    # Question 7
        features['music_preference'] = user_responses[7]    # Question 8
        features['spontaneity_preference'] = user_responses[8] # Question 9
        features['packing_preference'] = user_responses[9]   # Question 10
        features['group_role_preference'] = user_responses[10] # Question 11
        features['memory_preference'] = user_responses[11]   # Question 12
        
        # Interaction features
        features['adventure_culture_balance'] = abs(user_responses[1] - user_responses[2])
        features['social_planning_balance'] = abs(user_responses[3] - user_responses[2])
        features['comfort_adventure_balance'] = abs(user_responses[0] - user_responses[4])
        
        return features
    
    def prepare_dataset(self, dataset_file="big_five_10000_dataset.json"):
        """Prepare dataset for Big Five percentage prediction"""
        print("📊 Preparing Big Five percentage dataset...")
        
        with open(dataset_file, 'r') as f:
            data = json.load(f)
        
        features_list = []
        big_five_scores = {
            'Openness': [],
            'Conscientiousness': [],
            'Extraversion': [],
            'Agreeableness': [],
            'Neuroticism': []
        }
        
        for user in data:
            responses = user['responses']
            big_five_user_scores = user['big_five_scores']
            
            features = self.create_features(responses)
            features_list.append(features)
            
            # Collect scores for each trait
            for trait in big_five_scores.keys():
                big_five_scores[trait].append(big_five_user_scores[trait])
        
        # Convert to DataFrame
        df = pd.DataFrame(features_list)
        self.feature_names = df.columns.tolist()
        
        X = df
        y_dict = big_five_scores
        
        print(f"✅ Dataset prepared: {len(X)} users, {len(X.columns)} features")
        print(f"✅ Features created: {len(self.feature_names)}")
        
        return X, y_dict
    
    def encode_and_scale(self, X):
        """Encode and scale features"""
        X_encoded = X.copy()
        
        # Handle missing values
        X_encoded = pd.DataFrame(self.imputer.fit_transform(X_encoded), columns=X_encoded.columns)
        
        # Scale numerical features
        X_scaled = self.scaler.fit_transform(X_encoded)
        
        return X_scaled
    
    def train_models(self):
        """Train separate models for each Big Five trait"""
        print("🧠 Training Big Five Percentage Predictor...")
        
        X, y_dict = self.prepare_dataset()
        X_encoded = self.encode_and_scale(X)
        
        # Train separate model for each Big Five trait
        for trait in y_dict.keys():
            print(f"\n🎯 Training {trait} model...")
            
            y = y_dict[trait]
            
            # Split data for this trait
            X_train, X_test, y_train, y_test = train_test_split(
                X_encoded, y, test_size=0.2, random_state=42
            )
            
            # Train model with optimized parameters
            model = RandomForestRegressor(
                n_estimators=200,
                max_depth=12,
                min_samples_split=8,
                min_samples_leaf=4,
                random_state=42
            )
            
            model.fit(X_train, y_train)
            self.models[trait] = model
            
            # Evaluate
            train_pred = model.predict(X_train)
            test_pred = model.predict(X_test)
            
            train_mae = mean_absolute_error(y_train, train_pred)
            test_mae = mean_absolute_error(y_test, test_pred)
            train_r2 = r2_score(y_train, train_pred)
            test_r2 = r2_score(y_test, test_pred)
            
            print(f"✅ {trait} - Train MAE: {train_mae:.2f}%, Test MAE: {test_mae:.2f}%")
            print(f"✅ {trait} - Train R²: {train_r2:.3f}, Test R²: {test_r2:.3f}")
            
            # Feature importance
            feature_importance = pd.DataFrame({
                'feature': self.feature_names,
                'importance': model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            print(f"🔍 Top 5 features for {trait}:")
            for _, row in feature_importance.head(5).iterrows():
                print(f"   {row['feature']}: {row['importance']:.3f}")
    
    def predict_big_five_percentages(self, user_responses, demographics=None):
        """Predict Big Five percentage scores for a user"""
        if not self.models:
            raise ValueError("Models not trained. Please train the models first.")
        
        # Create features
        features = self.create_features(user_responses)
        features_df = pd.DataFrame([features])
        
        # Ensure same features as training
        for col in self.feature_names:
            if col not in features_df.columns:
                features_df[col] = 0
        features_df = features_df[self.feature_names]
        
        # Preprocess
        features_imputed = self.imputer.transform(features_df)
        features_scaled = self.scaler.transform(features_imputed)
        
        # Predict all 5 traits
        big_five_scores = {}
        confidence_scores = {}
        
        for trait, model in self.models.items():
            prediction = model.predict(features_scaled)[0]
            # Clamp predictions to 0-100 range
            prediction = max(0, min(100, prediction))
            big_five_scores[trait] = round(prediction, 1)
            
            # Calculate confidence based on model's prediction variance
            predictions = []
            for estimator in model.estimators_:
                pred = estimator.predict(features_scaled)[0]
                predictions.append(max(0, min(100, pred)))
            
            confidence = 1 - (np.std(predictions) / 100)  # Higher variance = lower confidence
            confidence_scores[trait] = max(0.1, min(1.0, confidence))
        
        # Determine dominant trait
        dominant_trait = max(big_five_scores, key=big_five_scores.get)
        
        # Create detailed result
        result = {
            'big_five_scores': big_five_scores,
            'confidence_scores': confidence_scores,
            'dominant_trait': dominant_trait,
            'descriptions': {}
        }
        
        # Add descriptions for each trait
        for trait, score in big_five_scores.items():
            desc = self.big_five_descriptions[trait]
            if score >= 70:
                meaning = desc['high_score_meaning']
            elif score <= 30:
                meaning = desc['low_score_meaning']
            else:
                meaning = desc['description']
            
            result['descriptions'][trait] = {
                'score': score,
                'confidence': confidence_scores[trait],
                'description': desc['description'],
                'travel_preferences': desc['travel_preferences'],
                'meaning': meaning
            }
        
        return result
    
    def save_model(self, filepath="big_five_percentage_model.pkl"):
        """Save the trained models"""
        model_data = {
            'models': self.models,
            'scaler': self.scaler,
            'imputer': self.imputer,
            'feature_names': self.feature_names,
            'big_five_descriptions': self.big_five_descriptions
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"✅ Model saved to {filepath}")
    
    def load_model(self, filepath="big_five_percentage_model.pkl"):
        """Load a trained model"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.models = model_data['models']
        self.scaler = model_data['scaler']
        self.imputer = model_data['imputer']
        self.feature_names = model_data['feature_names']
        self.big_five_descriptions = model_data['big_five_descriptions']
        
        print(f"✅ Model loaded from {filepath}")

def main():
    """Main training function"""
    print("🚀 Starting Big Five Percentage Predictor Training...")
    
    # Initialize predictor
    predictor = BigFivePercentagePredictor()
    
    # Train models
    predictor.train_models()
    
    # Save model
    predictor.save_model()
    
    # Test prediction
    test_responses = [3, 0, 3, 2, 3, 3, 3, 3, 3, 3, 3, 2]  # Example responses
    result = predictor.predict_big_five_percentages(test_responses)
    
    print("\n🧪 Test Prediction:")
    print(f"User Responses: {test_responses}")
    print(f"Dominant Trait: {result['dominant_trait']}")
    print("\n📊 Big Five Percentage Scores:")
    for trait, info in result['descriptions'].items():
        print(f"{trait}: {info['score']}% (Confidence: {info['confidence']:.3f})")
        print(f"  {info['meaning']}")
    
    print("\n✅ Training complete! Model ready for integration.")

if __name__ == "__main__":
    main() 