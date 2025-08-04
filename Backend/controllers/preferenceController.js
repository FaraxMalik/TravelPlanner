const { preferenceQuestions, analyzePreferences, generateRecommendations } = require('../config/preferenceQuestions');
const User = require('../models/user');

// @desc    Get all preference questions
// @route   GET /api/preferences/questions
// @access  Public
const getPreferenceQuestions = async (req, res) => {
  try {
    res.json({
      success: true,
      data: preferenceQuestions.questions
    });
  } catch (error) {
    console.error('Get preference questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit user preferences and get analysis
// @route   POST /api/preferences/submit
// @access  Private
const submitPreferences = async (req, res) => {
  try {
    const { 
      morningRoutine, placePreference, travelPace, snackVibe, backupPlan,
      souvenirType, photoStyle, musicTaste, spontaneity, packingStyle,
      groupRole, memorableElement, budget, duration, interests 
    } = req.body;

    // Validate all preference answers are provided
    const requiredFields = [
      'morningRoutine', 'placePreference', 'travelPace', 'snackVibe', 'backupPlan',
      'souvenirType', 'photoStyle', 'musicTaste', 'spontaneity', 'packingStyle',
      'groupRole', 'memorableElement'
    ];

    const missingFields = requiredFields.filter(field => req.body[field] === undefined);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required preference fields: ${missingFields.join(', ')}`
      });
    }

    // Validate all answers are valid (0-3)
    const answers = {
      morningRoutine, placePreference, travelPace, snackVibe, backupPlan,
      souvenirType, photoStyle, musicTaste, spontaneity, packingStyle,
      groupRole, memorableElement
    };

    for (const [field, value] of Object.entries(answers)) {
      if (![0, 1, 2, 3].includes(value)) {
        return res.status(400).json({
          message: `Invalid value for ${field}. Must be 0, 1, 2, or 3.`
        });
      }
    }

    // Analyze preferences
    const preferenceAnalysis = analyzePreferences(answers);
    const recommendations = generateRecommendations(preferenceAnalysis);

    // Update user preferences in database
    const updateData = {
      'preferences.morningRoutine': morningRoutine,
      'preferences.placePreference': placePreference,
      'preferences.travelPace': travelPace,
      'preferences.snackVibe': snackVibe,
      'preferences.backupPlan': backupPlan,
      'preferences.souvenirType': souvenirType,
      'preferences.photoStyle': photoStyle,
      'preferences.musicTaste': musicTaste,
      'preferences.spontaneity': spontaneity,
      'preferences.packingStyle': packingStyle,
      'preferences.groupRole': groupRole,
      'preferences.memorableElement': memorableElement
    };

    // Add optional fields if provided
    if (budget !== undefined) updateData['preferences.budget'] = budget;
    if (duration !== undefined) updateData['preferences.duration'] = duration;
    if (interests !== undefined) updateData['preferences.interests'] = interests;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Preferences saved successfully!',
      data: {
        userPreferences: user.preferences,
        analysis: preferenceAnalysis,
        recommendations: recommendations
      }
    });

  } catch (error) {
    console.error('Submit preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's preference analysis
// @route   GET /api/preferences/analysis
// @access  Private
const getPreferenceAnalysis = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.preferences) {
      return res.status(404).json({
        message: 'No preferences found. Please complete the preference questionnaire first.'
      });
    }

    // Check if all preference questions are answered
    const requiredFields = [
      'morningRoutine', 'placePreference', 'travelPace', 'snackVibe', 'backupPlan',
      'souvenirType', 'photoStyle', 'musicTaste', 'spontaneity', 'packingStyle',
      'groupRole', 'memorableElement'
    ];

    const missingAnswers = requiredFields.filter(field => 
      user.preferences[field] === undefined || user.preferences[field] === null
    );

    if (missingAnswers.length > 0) {
      return res.status(400).json({
        message: 'Please complete all preference questions first.',
        missingQuestions: missingAnswers
      });
    }

    // Extract answers for analysis
    const answers = {
      morningRoutine: user.preferences.morningRoutine,
      placePreference: user.preferences.placePreference,
      travelPace: user.preferences.travelPace,
      snackVibe: user.preferences.snackVibe,
      backupPlan: user.preferences.backupPlan,
      souvenirType: user.preferences.souvenirType,
      photoStyle: user.preferences.photoStyle,
      musicTaste: user.preferences.musicTaste,
      spontaneity: user.preferences.spontaneity,
      packingStyle: user.preferences.packingStyle,
      groupRole: user.preferences.groupRole,
      memorableElement: user.preferences.memorableElement
    };

    const preferenceAnalysis = analyzePreferences(answers);
    const recommendations = generateRecommendations(preferenceAnalysis);

    res.json({
      success: true,
      data: {
        userPreferences: user.preferences,
        analysis: preferenceAnalysis,
        recommendations: recommendations
      }
    });

  } catch (error) {
    console.error('Get preference analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get personalized travel personality
// @route   GET /api/preferences/personality
// @access  Private
const getTravelPersonality = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.preferences) {
      return res.status(404).json({
        message: 'No preferences found. Please complete the preference questionnaire first.'
      });
    }

    // Extract answers
    const answers = {
      morningRoutine: user.preferences.morningRoutine,
      placePreference: user.preferences.placePreference,
      travelPace: user.preferences.travelPace,
      snackVibe: user.preferences.snackVibe,
      backupPlan: user.preferences.backupPlan,
      souvenirType: user.preferences.souvenirType,
      photoStyle: user.preferences.photoStyle,
      musicTaste: user.preferences.musicTaste,
      spontaneity: user.preferences.spontaneity,
      packingStyle: user.preferences.packingStyle,
      groupRole: user.preferences.groupRole,
      memorableElement: user.preferences.memorableElement
    };

    const analysis = analyzePreferences(answers);

    // Generate personality type based on dominant preferences
    let personalityType = 'Balanced Explorer';
    let personalityDescription = 'You enjoy a mix of different experiences and adapt well to various travel styles.';

    // Determine personality based on dominant preferences
    if (analysis.personality?.includes('thrill_seeker') && analysis.activityStyle?.includes('adventure')) {
      personalityType = 'Adventure Seeker';
      personalityDescription = 'You thrive on excitement and physical challenges. Your ideal trips involve outdoor activities, adrenaline-pumping experiences, and pushing your limits.';
    } else if (analysis.personality?.includes('history_buff') && analysis.environment?.includes('historic')) {
      personalityType = 'Cultural Enthusiast';
      personalityDescription = 'You have a deep appreciation for history, traditions, and local cultures. You love immersing yourself in the heritage and customs of the places you visit.';
    } else if (analysis.personality?.includes('culture_seeker') && analysis.foodStyle?.includes('authentic')) {
      personalityType = 'Local Experience Hunter';
      personalityDescription = 'You seek authentic, off-the-beaten-path experiences. You prefer local interactions, street food, and discovering hidden gems that most tourists miss.';
    } else if (analysis.personality?.includes('chill') && analysis.activityStyle?.includes('relaxed')) {
      personalityType = 'Peaceful Wanderer';
      personalityDescription = 'You value tranquility and mindfulness in your travels. You prefer serene environments, slow-paced activities, and opportunities for reflection and relaxation.';
    } else if (analysis.personality?.includes('foodie') && analysis.foodStyle?.includes('luxury')) {
      personalityType = 'Gourmet Explorer';
      personalityDescription = 'You love culinary adventures and sophisticated dining experiences. You appreciate fine dining, wine tastings, and discovering new flavors from around the world.';
    } else if (analysis.personality?.includes('mindful') && analysis.activityStyle?.includes('reflective')) {
      personalityType = 'Mindful Traveler';
      personalityDescription = 'You seek meaningful experiences that connect you with yourself and the world around you. You prefer quiet moments, spiritual places, and transformative journeys.';
    }

    res.json({
      success: true,
      data: {
        personalityType,
        personalityDescription,
        analysis,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Get travel personality error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPreferenceQuestions,
  submitPreferences,
  getPreferenceAnalysis,
  getTravelPersonality
}; 