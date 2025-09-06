const User = require('../models/user');
const fs = require('fs');
const path = require('path');

// Load the new travel questions
const questionsPath = path.join(__dirname, '../config/travel_questions_12.json');
const travelQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

// @desc    Get all preference questions (new format)
// @route   GET /api/preferences/questions
// @access  Public
const getPreferenceQuestions = async (req, res) => {
  try {
    res.json({
      success: true,
      questions: travelQuestions // Direct array, not travelQuestions.questions
    });
  } catch (error) {
    console.error('Get preference questions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Submit user preferences and save to user profile
// @route   POST /api/preferences/submit
// @access  Private
const submitPreferences = async (req, res) => {
  try {
    const preferences = req.body;

    // Validate that we have the expected fields for ML model
    const expectedFields = [
      'morningRoutine', 'placePreference', 'travelPace', 'foodPreferences',
      'backupPlanning', 'memoryCapturing', 'photographyStyle', 'musicPreferences',
      'spontaneityLevel', 'packingPhilosophy', 'groupDynamics', 'memorableElements'
    ];

    const missingFields = expectedFields.filter(field => !(field in preferences));
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required preference fields: ${missingFields.join(', ')}`
      });
    }

    // Update user preferences in database
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        preferences,
        preferencesCompleted: true,
        preferencesUpdatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Preferences saved successfully',
      data: {
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Submit preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save preferences'
    });
  }
};

// @desc    Get user preferences
// @route   GET /api/preferences/user
// @access  Private
const getUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences preferencesCompleted');
        
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        preferences: user.preferences || {},
        preferencesCompleted: user.preferencesCompleted || false
      }
    });

  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user preferences'
    });
  }
};

module.exports = {
  getPreferenceQuestions,
  submitPreferences,
  getUserPreferences
};