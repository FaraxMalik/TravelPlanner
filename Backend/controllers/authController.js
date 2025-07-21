const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateToken } = require('../utils/generateJWT');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, preferences } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      preferences: preferences || {}
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/user/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged-in user's preferences
// @route   GET /api/user/preferences
// @access  Private
const getUserPreferences = async (req, res) => {
  try {
    res.json({ preferences: req.user.preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update logged-in user's preferences
// @route   PUT /api/user/preferences
// @access  Private
const updateUserPreferences = async (req, res) => {
  try {
    const allowedFields = [
      'interests', 'budget', 'duration',
      'perfectDayType', 'placePreference', 'travelPace', 'snackVibe', 'backupPlan'
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[`preferences.${field}`] = req.body[field];
    }
    // Validation (basic)
    if (updates['preferences.perfectDayType'] !== undefined && ![0,1,2,3].includes(updates['preferences.perfectDayType'])) {
      return res.status(400).json({ message: 'Invalid perfectDayType' });
    }
    if (updates['preferences.placePreference'] !== undefined && ![0,1,2,3].includes(updates['preferences.placePreference'])) {
      return res.status(400).json({ message: 'Invalid placePreference' });
    }
    if (updates['preferences.travelPace'] !== undefined && ![0,1,2,3].includes(updates['preferences.travelPace'])) {
      return res.status(400).json({ message: 'Invalid travelPace' });
    }
    if (updates['preferences.snackVibe'] !== undefined && ![0,1,2,3].includes(updates['preferences.snackVibe'])) {
      return res.status(400).json({ message: 'Invalid snackVibe' });
    }
    if (updates['preferences.backupPlan'] !== undefined && ![0,1,2,3].includes(updates['preferences.backupPlan'])) {
      return res.status(400).json({ message: 'Invalid backupPlan' });
    }
    if (updates['preferences.budget'] !== undefined && (typeof updates['preferences.budget'] !== 'number' || updates['preferences.budget'] < 0)) {
      return res.status(400).json({ message: 'Invalid budget' });
    }
    if (updates['preferences.duration'] !== undefined && (typeof updates['preferences.duration'] !== 'number' || updates['preferences.duration'] < 1)) {
      return res.status(400).json({ message: 'Invalid duration' });
    }
    // Update user
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
    res.json({ preferences: user.preferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getUserPreferences,
  updateUserPreferences
}; 