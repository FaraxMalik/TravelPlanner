import json
import random
import numpy as np

def generate_sample_dataset(num_samples=1000, output_file="big_five_10000_dataset.json"):
    """
    Generate a sample dataset for Big Five personality prediction
    """
    print(f"Generating {num_samples} sample users...")
    
    dataset = []
    
    for i in range(num_samples):
        # Generate random responses (0-3) for 12 questions
        responses = [random.randint(0, 3) for _ in range(12)]
        
        # Generate realistic Big Five scores based on responses
        big_five_scores = generate_realistic_big_five_scores(responses)
        
        user_data = {
            "user_id": f"user_{i+1:04d}",
            "responses": responses,
            "big_five_scores": big_five_scores
        }
        
        dataset.append(user_data)
        
        if (i + 1) % 100 == 0:
            print(f"Generated {i + 1} users...")
    
    # Save to file
    with open(output_file, 'w') as f:
        json.dump(dataset, f, indent=2)
    
    print(f"Dataset saved to {output_file}")
    print(f"Total users: {len(dataset)}")
    
    # Show sample statistics
    show_dataset_stats(dataset)

def generate_realistic_big_five_scores(responses):
    """
    Generate realistic Big Five scores based on response patterns
    """
    scores = {
        'Openness': 50,
        'Conscientiousness': 50,
        'Extraversion': 50,
        'Agreeableness': 50,
        'Neuroticism': 50
    }
    
    # Openness: influenced by place preference, travel pace, food style, backup plan, souvenir, spontaneity
    openness_questions = [1, 2, 3, 5, 6, 9]
    openness_score = 50
    for q in openness_questions:
        if responses[q] >= 2:
            openness_score += random.uniform(5, 12)
        else:
            openness_score -= random.uniform(3, 8)
    scores['Openness'] = max(0, min(100, openness_score))
    
    # Conscientiousness: influenced by morning routine, travel pace, backup plan, packing style, group role
    conscientiousness_questions = [0, 2, 4, 9, 10]
    conscientiousness_score = 50
    for q in conscientiousness_questions:
        if responses[q] <= 1:
            conscientiousness_score += random.uniform(5, 12)
        else:
            conscientiousness_score -= random.uniform(3, 8)
    scores['Conscientiousness'] = max(0, min(100, conscientiousness_score))
    
    # Extraversion: influenced by food style, photo style, music taste, group role, memorable element
    extraversion_questions = [3, 6, 7, 10, 11]
    extraversion_score = 50
    for q in extraversion_questions:
        if responses[q] >= 2:
            extraversion_score += random.uniform(5, 12)
        else:
            extraversion_score -= random.uniform(3, 8)
    scores['Extraversion'] = max(0, min(100, extraversion_score))
    
    # Agreeableness: influenced by place preference, backup plan, souvenir, group role, memorable element
    agreeableness_questions = [1, 4, 5, 10, 11]
    agreeableness_score = 50
    for q in agreeableness_questions:
        if responses[q] <= 1:
            agreeableness_score += random.uniform(5, 12)
        else:
            agreeableness_score -= random.uniform(3, 8)
    scores['Agreeableness'] = max(0, min(100, agreeableness_score))
    
    # Neuroticism: influenced by morning routine, backup plan, spontaneity, packing style
    neuroticism_questions = [0, 4, 8, 9]
    neuroticism_score = 50
    for q in neuroticism_questions:
        if responses[q] <= 1:
            neuroticism_score += random.uniform(5, 12)
        else:
            neuroticism_score -= random.uniform(3, 8)
    scores['Neuroticism'] = max(0, min(100, neuroticism_score))
    
    # Add some noise to make it more realistic
    for trait in scores:
        scores[trait] += random.uniform(-5, 5)
        scores[trait] = max(0, min(100, scores[trait]))
        scores[trait] = round(scores[trait], 1)
    
    return scores

def show_dataset_stats(dataset):
    """
    Show statistics about the generated dataset
    """
    print("\nDataset Statistics:")
    
    # Response distribution
    all_responses = [resp for user in dataset for resp in user['responses']]
    response_counts = {}
    for resp in all_responses:
        response_counts[resp] = response_counts.get(resp, 0) + 1
    
    print("Response Distribution:")
    for resp in sorted(response_counts.keys()):
        percentage = (response_counts[resp] / len(all_responses)) * 100
        print(f"  {resp}: {response_counts[resp]} ({percentage:.1f}%)")
    
    # Big Five score ranges
    traits = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism']
    print("\nBig Five Score Ranges:")
    for trait in traits:
        scores = [user['big_five_scores'][trait] for user in dataset]
        min_score = min(scores)
        max_score = max(scores)
        avg_score = np.mean(scores)
        print(f"  {trait}: {min_score:.1f} - {max_score:.1f} (avg: {avg_score:.1f})")

if __name__ == "__main__":
    # Generate a smaller dataset for testing
    generate_sample_dataset(1000, "big_five_10000_dataset.json") 