const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getUserPreferences,
  updateUserPreferences,
  verifyToken,
  logoutUser
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected routes
router.get('/verify', protect, verifyToken);
router.get('/user/me', protect, getUserProfile);
router.get('/user/preferences', protect, getUserPreferences);
router.put('/user/preferences', protect, updateUserPreferences);

module.exports = router; 