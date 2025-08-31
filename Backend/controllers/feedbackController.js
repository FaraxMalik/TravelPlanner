const Feedback = require('../models/feedback');

// @desc    Create feedback for an activity
// @route   POST /api/feedback
// @access  Private
const createFeedback = async (req, res) => {
  try {
    const { tourPlanId, activityId, rating, comment } = req.body;
    if (!tourPlanId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid input' });
    }
    // Prevent duplicate feedback for the same user and trip
    const existing = await Feedback.findOne({ userId: req.user._id, tourPlanId, activityId });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted feedback for this trip.' });
    }
    const feedback = await Feedback.create({
      userId: req.user._id,
      tourPlanId,
      activityId,
      rating,
      comment
    });
    res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all feedback by logged-in user
// @route   GET /api/feedback/user
// @access  Private
const getFeedbackByUser = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user._id });
    res.json({ count: feedbacks.length, feedbacks });
  } catch (error) {
    console.error('Get feedback by user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all feedback for a tour plan
// @route   GET /api/feedback/tour/:tourPlanId
// @access  Private
const getFeedbackByTourPlan = async (req, res) => {
  try {
    const { tourPlanId } = req.params;
    const feedbacks = await Feedback.find({ tourPlanId });
    res.json({ count: feedbacks.length, feedbacks });
  } catch (error) {
    console.error('Get feedback by tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createFeedback,
  getFeedbackByUser,
  getFeedbackByTourPlan
}; 