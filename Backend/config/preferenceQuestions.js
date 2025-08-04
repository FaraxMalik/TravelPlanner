const preferenceQuestions = {
  questions: [
    {
      id: 'morningRoutine',
      question: "How do you like to start your day on a trip?",
      options: [
        {
          text: "Sunrise walk & journaling",
          value: 0,
          preferences: {
            activityStyle: 'reflective',
            pace: 'slow',
            aesthetic: 'scenic',
            personality: 'mindful'
          }
        },
        {
          text: "Coffee and plan the day",
          value: 1,
          preferences: {
            activityStyle: 'organized',
            pace: 'moderate',
            aesthetic: 'practical',
            personality: 'planner'
          }
        },
        {
          text: "Sleep in, it's a vacation",
          value: 2,
          preferences: {
            activityStyle: 'relaxed',
            pace: 'slow',
            aesthetic: 'comfortable',
            personality: 'chill'
          }
        },
        {
          text: "Straight to adventure!",
          value: 3,
          preferences: {
            activityStyle: 'adventure',
            pace: 'active',
            aesthetic: 'energetic',
            personality: 'thrill_seeker'
          }
        }
      ]
    },
    {
      id: 'placePreference',
      question: "Would you rather...",
      options: [
        {
          text: "Hike to a quiet waterfall",
          value: 0,
          preferences: {
            environment: 'nature',
            activity: 'hiking',
            atmosphere: 'peaceful',
            personality: 'nature_lover'
          }
        },
        {
          text: "Chill at a beach café",
          value: 1,
          preferences: {
            environment: 'coastal',
            activity: 'relaxation',
            atmosphere: 'casual',
            personality: 'beach_lover'
          }
        },
        {
          text: "Explore a buzzing local market",
          value: 2,
          preferences: {
            environment: 'urban',
            activity: 'shopping',
            atmosphere: 'vibrant',
            personality: 'culture_seeker'
          }
        },
        {
          text: "Take a history tour of old forts",
          value: 3,
          preferences: {
            environment: 'historic',
            activity: 'cultural',
            atmosphere: 'educational',
            personality: 'history_buff'
          }
        }
      ]
    },
    {
      id: 'travelPace',
      question: "Your trip starts now. What's your vibe?",
      options: [
        {
          text: "Hour-by-hour plan",
          value: 0,
          preferences: {
            planning: 'detailed',
            flexibility: 'low',
            personality: 'organized',
            style: 'structured'
          }
        },
        {
          text: "Light structure, with room to wander",
          value: 1,
          preferences: {
            planning: 'moderate',
            flexibility: 'medium',
            personality: 'balanced',
            style: 'flexible'
          }
        },
        {
          text: "Go with the flow",
          value: 2,
          preferences: {
            planning: 'minimal',
            flexibility: 'high',
            personality: 'easygoing',
            style: 'spontaneous'
          }
        },
        {
          text: "Zero plan—surprise me!",
          value: 3,
          preferences: {
            planning: 'none',
            flexibility: 'maximum',
            personality: 'adventurous',
            style: 'impulsive'
          }
        }
      ]
    },
    {
      id: 'snackVibe',
      question: "Which snack sounds like your vibe?",
      options: [
        {
          text: "Energy bar",
          value: 0,
          preferences: {
            foodStyle: 'practical',
            nutrition: 'high',
            personality: 'health_conscious',
            style: 'efficient'
          }
        },
        {
          text: "Chai and biscuits",
          value: 1,
          preferences: {
            foodStyle: 'traditional',
            nutrition: 'moderate',
            personality: 'comfort_seeker',
            style: 'cozy'
          }
        },
        {
          text: "Local street food",
          value: 2,
          preferences: {
            foodStyle: 'authentic',
            nutrition: 'varied',
            personality: 'adventurous_eater',
            style: 'local'
          }
        },
        {
          text: "Something fancy from a bakery",
          value: 3,
          preferences: {
            foodStyle: 'luxury',
            nutrition: 'indulgent',
            personality: 'foodie',
            style: 'sophisticated'
          }
        }
      ]
    },
    {
      id: 'backupPlan',
      question: "If it rains on your travel day...",
      options: [
        {
          text: "Museum day",
          value: 0,
          preferences: {
            backupStyle: 'cultural',
            activity: 'indoor',
            personality: 'intellectual',
            style: 'educational'
          }
        },
        {
          text: "Netflix & nap",
          value: 1,
          preferences: {
            backupStyle: 'relaxed',
            activity: 'rest',
            personality: 'chill',
            style: 'comfortable'
          }
        },
        {
          text: "Hit a local indoor market",
          value: 2,
          preferences: {
            backupStyle: 'social',
            activity: 'shopping',
            personality: 'social',
            style: 'interactive'
          }
        },
        {
          text: "Embrace it—rain walk!",
          value: 3,
          preferences: {
            backupStyle: 'adventurous',
            activity: 'outdoor',
            personality: 'daring',
            style: 'unconventional'
          }
        }
      ]
    },
    {
      id: 'souvenirType',
      question: "Your ideal souvenir is...",
      options: [
        {
          text: "A rare handcrafted item",
          value: 0,
          preferences: {
            souvenirStyle: 'unique',
            value: 'artistic',
            personality: 'collector',
            style: 'authentic'
          }
        },
        {
          text: "Local snacks or spices",
          value: 1,
          preferences: {
            souvenirStyle: 'culinary',
            value: 'taste',
            personality: 'food_lover',
            style: 'sensory'
          }
        },
        {
          text: "A picture at a famous spot",
          value: 2,
          preferences: {
            souvenirStyle: 'photographic',
            value: 'memory',
            personality: 'social_media',
            style: 'documentary'
          }
        },
        {
          text: "Something funny & odd",
          value: 3,
          preferences: {
            souvenirStyle: 'quirky',
            value: 'humor',
            personality: 'fun_lover',
            style: 'entertaining'
          }
        }
      ]
    },
    {
      id: 'photoStyle',
      question: "Your travel album mostly has...",
      options: [
        {
          text: "Scenic landscapes",
          value: 0,
          preferences: {
            photoStyle: 'landscape',
            focus: 'nature',
            personality: 'nature_photographer',
            style: 'artistic'
          }
        },
        {
          text: "Food and cafés",
          value: 1,
          preferences: {
            photoStyle: 'culinary',
            focus: 'food',
            personality: 'food_photographer',
            style: 'gastronomic'
          }
        },
        {
          text: "Selfies with locals",
          value: 2,
          preferences: {
            photoStyle: 'social',
            focus: 'people',
            personality: 'people_person',
            style: 'interactive'
          }
        },
        {
          text: "Spontaneous & chaotic moments",
          value: 3,
          preferences: {
            photoStyle: 'candid',
            focus: 'action',
            personality: 'adventurous',
            style: 'dynamic'
          }
        }
      ]
    },
    {
      id: 'musicTaste',
      question: "Pick a song for your road trip playlist.",
      options: [
        {
          text: "Acoustic indie or classical",
          value: 0,
          preferences: {
            musicStyle: 'acoustic',
            mood: 'calm',
            personality: 'sophisticated',
            style: 'refined'
          }
        },
        {
          text: "Chill lofi or café vibes",
          value: 1,
          preferences: {
            musicStyle: 'ambient',
            mood: 'relaxed',
            personality: 'chill',
            style: 'peaceful'
          }
        },
        {
          text: "Energetic pop or EDM",
          value: 2,
          preferences: {
            musicStyle: 'electronic',
            mood: 'energetic',
            personality: 'party_lover',
            style: 'vibrant'
          }
        },
        {
          text: "Rock, rap, or whatever's loud",
          value: 3,
          preferences: {
            musicStyle: 'intense',
            mood: 'powerful',
            personality: 'bold',
            style: 'intense'
          }
        }
      ]
    },
    {
      id: 'spontaneity',
      question: "You stumble across an unplanned detour...?",
      options: [
        {
          text: "No, stick to the plan",
          value: 0,
          preferences: {
            spontaneity: 'low',
            planning: 'strict',
            personality: 'organized',
            style: 'disciplined'
          }
        },
        {
          text: "Maybe, if time allows",
          value: 1,
          preferences: {
            spontaneity: 'moderate',
            planning: 'flexible',
            personality: 'practical',
            style: 'balanced'
          }
        },
        {
          text: "Sure! Let's see where it leads",
          value: 2,
          preferences: {
            spontaneity: 'high',
            planning: 'loose',
            personality: 'adventurous',
            style: 'exploratory'
          }
        },
        {
          text: "Best part of the trip!",
          value: 3,
          preferences: {
            spontaneity: 'maximum',
            planning: 'minimal',
            personality: 'impulsive',
            style: 'wild'
          }
        }
      ]
    },
    {
      id: 'packingStyle',
      question: "What does your luggage say about you?",
      options: [
        {
          text: "Everything folded, labeled",
          value: 0,
          preferences: {
            packingStyle: 'organized',
            preparation: 'thorough',
            personality: 'perfectionist',
            style: 'meticulous'
          }
        },
        {
          text: "Mostly organized with extras",
          value: 1,
          preferences: {
            packingStyle: 'prepared',
            preparation: 'moderate',
            personality: 'practical',
            style: 'balanced'
          }
        },
        {
          text: "Thrown in last minute",
          value: 2,
          preferences: {
            packingStyle: 'casual',
            preparation: 'minimal',
            personality: 'easygoing',
            style: 'relaxed'
          }
        },
        {
          text: "Wait—I packed something?",
          value: 3,
          preferences: {
            packingStyle: 'impulsive',
            preparation: 'none',
            personality: 'carefree',
            style: 'spontaneous'
          }
        }
      ]
    },
    {
      id: 'groupRole',
      question: "Your friends say you are the...",
      options: [
        {
          text: "The planner",
          value: 0,
          preferences: {
            groupRole: 'leader',
            responsibility: 'high',
            personality: 'organized',
            style: 'responsible'
          }
        },
        {
          text: "The peacemaker",
          value: 1,
          preferences: {
            groupRole: 'mediator',
            responsibility: 'moderate',
            personality: 'diplomatic',
            style: 'harmonious'
          }
        },
        {
          text: "The mood maker",
          value: 2,
          preferences: {
            groupRole: 'entertainer',
            responsibility: 'social',
            personality: 'extroverted',
            style: 'fun'
          }
        },
        {
          text: "The wild card",
          value: 3,
          preferences: {
            groupRole: 'adventurer',
            responsibility: 'low',
            personality: 'unpredictable',
            style: 'exciting'
          }
        }
      ]
    },
    {
      id: 'memorableElement',
      question: "What makes a trip unforgettable?",
      options: [
        {
          text: "The planning & flawless execution",
          value: 0,
          preferences: {
            memorableElement: 'achievement',
            satisfaction: 'perfection',
            personality: 'achiever',
            style: 'success_oriented'
          }
        },
        {
          text: "The people you meet",
          value: 1,
          preferences: {
            memorableElement: 'connections',
            satisfaction: 'relationships',
            personality: 'social',
            style: 'people_oriented'
          }
        },
        {
          text: "The unpredictable moments",
          value: 2,
          preferences: {
            memorableElement: 'surprises',
            satisfaction: 'excitement',
            personality: 'adventurous',
            style: 'thrill_seeking'
          }
        },
        {
          text: "The personal transformation",
          value: 3,
          preferences: {
            memorableElement: 'growth',
            satisfaction: 'self_improvement',
            personality: 'reflective',
            style: 'transformative'
          }
        }
      ]
    }
  ]
};

// Function to analyze user preferences based on their answers
const analyzePreferences = (userAnswers) => {
  const analysis = {
    activityStyle: {},
    pace: {},
    aesthetic: {},
    personality: {},
    environment: {},
    planning: {},
    foodStyle: {},
    backupStyle: {},
    souvenirStyle: {},
    photoStyle: {},
    musicStyle: {},
    spontaneity: {},
    packingStyle: {},
    groupRole: {},
    memorableElement: {}
  };

  // Count preferences from each answer
  preferenceQuestions.questions.forEach((question, index) => {
    const answer = userAnswers[question.id];
    if (answer !== undefined && answer >= 0 && answer <= 3) {
      const selectedOption = question.options[answer];
      if (selectedOption && selectedOption.preferences) {
        Object.entries(selectedOption.preferences).forEach(([key, value]) => {
          if (!analysis[key]) analysis[key] = {};
          analysis[key][value] = (analysis[key][value] || 0) + 1;
        });
      }
    }
  });

  // Get dominant preferences
  const dominantPreferences = {};
  Object.entries(analysis).forEach(([category, preferences]) => {
    if (Object.keys(preferences).length > 0) {
      const maxCount = Math.max(...Object.values(preferences));
      const dominant = Object.keys(preferences).filter(key => preferences[key] === maxCount);
      dominantPreferences[category] = dominant;
    }
  });

  return dominantPreferences;
};

// Function to generate travel recommendations based on preferences
const generateRecommendations = (preferences) => {
  const recommendations = {
    activities: [],
    food: [],
    places: [],
    style: [],
    personality: []
  };

  // Activity recommendations based on preferences
  if (preferences.activityStyle?.includes('adventure')) {
    recommendations.activities.push('hiking', 'water sports', 'rock climbing', 'zip lining');
  }
  if (preferences.activityStyle?.includes('cultural')) {
    recommendations.activities.push('museum visits', 'temple tours', 'cultural workshops', 'historical tours');
  }
  if (preferences.activityStyle?.includes('relaxed')) {
    recommendations.activities.push('spa treatments', 'yoga sessions', 'meditation retreats', 'beach relaxation');
  }
  if (preferences.activityStyle?.includes('reflective')) {
    recommendations.activities.push('journaling spots', 'quiet walks', 'sunrise viewing', 'meditation gardens');
  }

  // Food recommendations
  if (preferences.foodStyle?.includes('authentic')) {
    recommendations.food.push('street food tours', 'local markets', 'food trucks', 'home cooking classes');
  }
  if (preferences.foodStyle?.includes('luxury')) {
    recommendations.food.push('fine dining experiences', 'wine tastings', 'chef\'s table', 'gourmet tours');
  }
  if (preferences.foodStyle?.includes('traditional')) {
    recommendations.food.push('traditional tea ceremonies', 'local bakeries', 'family restaurants', 'cultural dining');
  }

  // Place recommendations
  if (preferences.environment?.includes('nature')) {
    recommendations.places.push('national parks', 'waterfalls', 'hiking trails', 'wildlife sanctuaries');
  }
  if (preferences.environment?.includes('coastal')) {
    recommendations.places.push('beach destinations', 'island getaways', 'coastal towns', 'waterfront resorts');
  }
  if (preferences.environment?.includes('urban')) {
    recommendations.places.push('city centers', 'local markets', 'street art districts', 'cultural neighborhoods');
  }

  // Personality-based recommendations
  if (preferences.personality?.includes('adventurous')) {
    recommendations.personality.push('adventure sports', 'off-the-beaten-path destinations', 'extreme activities');
  }
  if (preferences.personality?.includes('chill')) {
    recommendations.personality.push('wellness retreats', 'quiet beaches', 'spa destinations', 'peaceful villages');
  }
  if (preferences.personality?.includes('culture_seeker')) {
    recommendations.personality.push('heritage sites', 'cultural festivals', 'local workshops', 'traditional villages');
  }

  return recommendations;
};

module.exports = {
  preferenceQuestions,
  analyzePreferences,
  generateRecommendations
}; 