#!/usr/bin/env python3
"""
🎯 Detailed Travel Personality Predictor
Creates rich, descriptive personality profiles for precise Gemini AI itineraries
"""

import joblib
import numpy as np

def generate_detailed_travel_personality(big_five_scores, travel_preferences=None):
    """
    Generate detailed, descriptive travel personality for precise itinerary customization
    
    Returns rich personality description instead of simple labels
    """
    
    ext, est, agr, csn, opn = big_five_scores
    
    # Build detailed personality components
    social_style = get_social_preference(ext, agr)
    pace_style = get_pace_preference(est, csn, opn)
    exploration_style = get_exploration_preference(opn, est, csn)
    planning_style = get_planning_preference(csn, est)
    experience_style = get_experience_preference(agr, opn, ext)
    
    # Combine into detailed description
    detailed_personality = f"{social_style}. Enjoys {pace_style}, and {exploration_style}. Prefers {planning_style} and seeks {experience_style}."
    
    # Add specific travel motivations
    motivations = get_travel_motivations(big_five_scores)
    
    # Add accommodation preferences
    accommodation_style = get_accommodation_preference(ext, csn, est)
    
    # Add activity preferences
    activity_preferences = get_activity_preferences(big_five_scores)
    
    # Create comprehensive profile
    comprehensive_profile = {
        "personality_description": detailed_personality,
        "travel_motivations": motivations,
        "accommodation_preference": accommodation_style,
        "preferred_activities": activity_preferences,
        "detailed_scores": {
            "extraversion": f"{ext:.2f} - {'High social energy, enjoys group activities' if ext > 0.6 else 'Prefers quieter, more intimate experiences'}",
            "emotional_stability": f"{est:.2f} - {'Calm and adaptable, handles changes well' if est > 0.6 else 'Prefers familiar, predictable environments'}",
            "agreeableness": f"{agr:.2f} - {'Enjoys meeting locals and cultural immersion' if agr > 0.6 else 'Independent explorer, values personal space'}",
            "conscientiousness": f"{csn:.2f} - {'Appreciates well-planned, organized trips' if csn > 0.6 else 'Spontaneous, goes with the flow'}",
            "openness": f"{opn:.2f} - {'Seeks novel experiences and adventures' if opn > 0.6 else 'Prefers familiar activities and destinations'}"
        }
    }
    
    return comprehensive_profile

def get_social_preference(extraversion, agreeableness):
    """Determine social travel style"""
    if extraversion > 0.7 and agreeableness > 0.6:
        return "A highly social traveler who thrives meeting new people and enjoys group experiences"
    elif extraversion > 0.6:
        return "A moderately social traveler who enjoys meeting locals but also values quiet personal moments"
    elif extraversion < 0.4:
        return "A solo traveler who prefers spending time alone, exploring at their own pace"
    else:
        return "A flexible traveler who enjoys both social interactions and peaceful solitude"

def get_pace_preference(emotional_stability, conscientiousness, openness):
    """Determine travel pace preference"""
    if emotional_stability > 0.6 and conscientiousness < 0.5:
        return "slow-paced, relaxed exploration with plenty of time to absorb each experience"
    elif openness > 0.7 and emotional_stability > 0.5:
        return "active discovery with spontaneous detours and adventure opportunities"
    elif conscientiousness > 0.7:
        return "well-organized, efficient touring with structured daily schedules"
    elif openness > 0.6:
        return "dynamic exploration covering diverse experiences and activities"
    else:
        return "comfortable, steady-paced travel with balanced activity levels"

def get_exploration_preference(openness, emotional_stability, conscientiousness):
    """Determine exploration style"""
    if openness > 0.7 and emotional_stability > 0.5:
        return "seeks unique, off-the-beaten-path experiences and local hidden gems"
    elif conscientiousness > 0.6:
        return "prefers well-researched destinations with historical and cultural significance"
    elif emotional_stability < 0.5:
        return "chooses familiar, well-established attractions with reliable experiences"
    else:
        return "enjoys a mix of popular attractions and authentic local discoveries"

def get_planning_preference(conscientiousness, emotional_stability):
    """Determine planning style preference"""
    if conscientiousness > 0.7:
        return "detailed advance planning with researched itineraries and booked accommodations"
    elif conscientiousness < 0.4 and emotional_stability > 0.6:
        return "spontaneous exploration with minimal advance planning"
    elif emotional_stability < 0.5:
        return "moderate planning with backup options and contingency plans"
    else:
        return "flexible planning with key highlights reserved but room for spontaneous discoveries"

def get_experience_preference(agreeableness, openness, extraversion):
    """Determine experience preferences"""
    if agreeableness > 0.7 and openness > 0.6:
        return "authentic cultural immersion and meaningful connections with local communities"
    elif openness > 0.7:
        return "unique, transformative experiences that challenge perspectives and create lasting memories"
    elif extraversion > 0.6:
        return "social experiences with opportunities to meet fellow travelers and locals"
    elif agreeableness > 0.6:
        return "peaceful, harmonious experiences in beautiful, serene environments"
    else:
        return "personally meaningful experiences that align with individual interests and values"

def get_travel_motivations(big_five_scores):
    """Generate specific travel motivations"""
    ext, est, agr, csn, opn = big_five_scores
    
    motivations = []
    
    if opn > 0.7:
        motivations.append("seeking novel experiences and personal growth")
    if agr > 0.6:
        motivations.append("connecting with local cultures and communities")
    if ext > 0.6:
        motivations.append("sharing adventures and creating social memories")
    if est > 0.6:
        motivations.append("finding relaxation and stress relief")
    if csn > 0.6:
        motivations.append("learning and expanding knowledge through travel")
    
    if not motivations:
        motivations.append("enjoying comfortable and familiar experiences")
    
    return motivations

def get_accommodation_preference(extraversion, conscientiousness, emotional_stability):
    """Determine accommodation style"""
    if extraversion > 0.6 and conscientiousness < 0.5:
        return "Social accommodations like boutique hotels or guesthouses with common areas for meeting other travelers"
    elif conscientiousness > 0.6:
        return "Well-reviewed, reliable hotels with excellent service and amenities"
    elif emotional_stability > 0.6:
        return "Peaceful, comfortable accommodations that offer relaxation and tranquility"
    elif extraversion < 0.4:
        return "Private, quiet accommodations that offer personal space and minimal social interaction"
    else:
        return "Mid-range accommodations that balance comfort, value, and convenience"

def get_activity_preferences(big_five_scores):
    """Generate activity preferences"""
    ext, est, agr, csn, opn = big_five_scores
    
    activities = []
    
    if opn > 0.7:
        activities.append("Adventure activities and unique local experiences")
    if agr > 0.6:
        activities.append("Cultural workshops and community-based tourism")
    if ext > 0.6:
        activities.append("Group tours and social dining experiences")
    if est > 0.6:
        activities.append("Wellness activities and scenic relaxation spots")
    if csn > 0.6:
        activities.append("Educational tours and historical site visits")
    
    if not activities:
        activities.append("Comfortable sightseeing and familiar activities")
    
    return activities

def create_gemini_prompt_with_detailed_personality(detailed_profile, destination=None, duration=7):
    """Create enhanced Gemini prompt with detailed personality insights"""
    
    prompt = f"""Create a personalized {duration}-day travel itinerary based on this traveler profile:

TRAVELER DESCRIPTION:
{detailed_profile['personality_description']}

TRAVEL MOTIVATIONS:
{', '.join(detailed_profile['travel_motivations'])}

ACCOMMODATION STYLE:
{detailed_profile['accommodation_preference']}

ACTIVITY PREFERENCES:
{', '.join(detailed_profile['preferred_activities'])}

PERSONALITY DETAILS:
{chr(10).join([f"• {trait.title()}: {desc}" for trait, desc in detailed_profile['detailed_scores'].items()])}

{f'DESTINATION: {destination}' if destination else 'Please suggest an ideal destination for this traveler profile.'}

Please provide:
1. Day-by-day detailed itinerary matching their personality
2. Specific accommodation recommendations that fit their style
3. Restaurant and dining experiences aligned with their preferences
4. Transportation options considering their comfort level
5. Activities that match their motivation and energy level
6. Budget recommendations for their travel style
7. Special tips tailored to their personality type

Focus on creating experiences that deeply resonate with their personality profile and travel motivations."""

    return prompt

# Test with sample data
if __name__ == "__main__":
    # Your sample Big Five scores
    sample_scores = [0.606, 0.639, 0.625, 0.635, 0.668]
    
    print("🎯 DETAILED TRAVEL PERSONALITY ANALYSIS")
    print("=" * 60)
    
    # Generate detailed profile
    profile = generate_detailed_travel_personality(sample_scores)
    
    print(f"\n📋 PERSONALITY DESCRIPTION:")
    print(f"   {profile['personality_description']}")
    
    print(f"\n🎯 TRAVEL MOTIVATIONS:")
    for motivation in profile['travel_motivations']:
        print(f"   • {motivation}")
    
    print(f"\n🏨 ACCOMMODATION PREFERENCE:")
    print(f"   {profile['accommodation_preference']}")
    
    print(f"\n🎨 PREFERRED ACTIVITIES:")
    for activity in profile['preferred_activities']:
        print(f"   • {activity}")
    
    print(f"\n📊 DETAILED PERSONALITY SCORES:")
    for trait, description in profile['detailed_scores'].items():
        print(f"   • {trait.title()}: {description}")
    
    print(f"\n🤖 SAMPLE GEMINI PROMPT:")
    print("-" * 60)
    prompt = create_gemini_prompt_with_detailed_personality(profile, "Japan", 10)
    print(prompt[:500] + "...")
    
    print(f"\n💡 This detailed profile gives Gemini AI much more context!")
    print(f"   Instead of just 'Relaxation Seeker', it gets a full personality picture.")
