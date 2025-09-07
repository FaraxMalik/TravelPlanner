const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
  getUserPersonality,
  verifyToken,
  logoutUser
  , googleAuth, facebookAuth
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Social OAuth routes
router.get('/google', googleAuth);
router.get('/facebook', facebookAuth);

// Protected routes
router.get('/verify', protect, verifyToken);
router.get('/user/me', protect, getUserProfile);
router.put('/user/profile', protect, updateUserProfile);
router.get('/user/preferences', protect, getUserPreferences);
router.get('/user/personality', protect, getUserPersonality);
router.put('/user/preferences', protect, updateUserPreferences);

module.exports = router; 