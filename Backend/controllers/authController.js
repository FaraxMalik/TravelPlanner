const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateToken } = require('../utils/generateJWT');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, firstName, lastName, email, password, preferences } = req.body;

    // Handle both name formats (single name or firstName/lastName)
    const fullName = name || `${firstName} ${lastName}`.trim();
    
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      preferences: preferences || {}
    });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          firstName: user.name.split(' ')[0],
          lastName: user.name.split(' ').slice(1).join(' '),
          email: user.email,
          preferences: user.preferences
        }
      });
    } else {
      res.status(400).json({ 
        success: false,
        message: 'Invalid user data' 
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ').slice(1).join(' '),
        email: user.email,
        preferences: user.preferences,
        hasCompletedPreferences: Object.keys(user.preferences || {}).length > 3
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
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
      'morningRoutine', 'placePreference', 'travelPace', 'snackVibe', 'backupPlan',
      'souvenirType', 'photoStyle', 'musicTaste', 'spontaneity', 'packingStyle',
      'groupRole', 'memorableElement'
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[`preferences.${field}`] = req.body[field];
    }
    
    // Validation for preference questions (all should be 0-3)
    const preferenceFields = [
      'morningRoutine', 'placePreference', 'travelPace', 'snackVibe', 'backupPlan',
      'souvenirType', 'photoStyle', 'musicTaste', 'spontaneity', 'packingStyle',
      'groupRole', 'memorableElement'
    ];
    
    for (const field of preferenceFields) {
      if (updates[`preferences.${field}`] !== undefined && ![0,1,2,3].includes(updates[`preferences.${field}`])) {
        return res.status(400).json({ message: `Invalid ${field} value. Must be 0, 1, 2, or 3.` });
      }
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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
  try {
    // Since we're using JWT without server-side sessions,
    // logout is handled client-side by removing the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Verify JWT token
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ').slice(1).join(' '),
        email: user.email,
        preferences: user.preferences,
        hasCompletedPreferences: Object.keys(user.preferences || {}).length > 3
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getUserPreferences,
  updateUserPreferences,
  verifyToken,
  logoutUser
}; 