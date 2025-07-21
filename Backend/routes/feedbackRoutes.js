const express = require('express');
const router = express.Router();
const { createFeedback, getFeedbackByUser, getFeedbackByTourPlan } = require('../controllers/feedbackController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/', createFeedback);
router.get('/user', getFeedbackByUser);
router.get('/tour/:tourPlanId', getFeedbackByTourPlan);

module.exports = router; 