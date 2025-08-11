const mongoose = require('mongoose');

// Feedback on a specific activity within a tour plan by a user
const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tourPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourPlan',
    required: true
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true // Refers to the activity's activityId in the tour plan
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Feedback', feedbackSchema); 