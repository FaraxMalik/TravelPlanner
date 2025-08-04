#!/usr/bin/env python3
"""
Setup script for the Big Five Personality Predictor ML model
This script generates training data and trains the model
"""

import os
import sys
import subprocess

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}...")
    print(f"Command: {command}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print("Output:", result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        print("Error:", e.stderr)
        return False

def main():
    print("🚀 Setting up Big Five Personality Predictor ML Model")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists('ml_models'):
        print("❌ Error: ml_models directory not found. Please run this script from the Backend directory.")
        sys.exit(1)
    
    # Change to ml_models directory
    os.chdir('ml_models')
    
    # Step 1: Generate training dataset
    print("\n📊 Step 1: Generating training dataset...")
    if not run_command("python generate_dataset.py", "Dataset generation"):
        print("❌ Failed to generate dataset")
        sys.exit(1)
    
    # Step 2: Train the model
    print("\n🧠 Step 2: Training the ML model...")
    if not run_command("python big_five_percentage_predictor.py --train", "Model training"):
        print("❌ Failed to train model")
        sys.exit(1)
    
    # Step 3: Test the model
    print("\n🧪 Step 3: Testing the model...")
    test_responses = "[2, 1, 2, 3, 1, 2, 3, 2, 1, 2, 1, 2]"
    test_command = f'python big_five_percentage_predictor.py --predict --responses "{test_responses}"'
    
    if not run_command(test_command, "Model testing"):
        print("❌ Failed to test model")
        sys.exit(1)
    
    print("\n✅ Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. The model is now ready for integration with Node.js")
    print("2. Run 'node test_integration.js' to test the Python-JavaScript bridge")
    print("3. Start your Node.js server to use the complete flow")
    
    # Check if model file exists
    if os.path.exists('big_five_percentage_model.pkl'):
        print(f"\n✅ Model file created: big_five_percentage_model.pkl")
        file_size = os.path.getsize('big_five_percentage_model.pkl')
        print(f"📁 File size: {file_size / 1024:.1f} KB")
    else:
        print("❌ Warning: Model file not found!")

if __name__ == "__main__":
    main() 