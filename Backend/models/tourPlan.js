const mongoose = require('mongoose');

const tourPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  placeName: {
    type: String,
    required: true,
    trim: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  numberOfDays: {
    type: Number,
    required: true,
    min: 1
  },
  suggestedPlaces: [{
    type: String,
    trim: true
  }],
  itinerary: [{
    day: {
      type: Number,
      required: true,
      min: 1
    },
    activities: [{
      type: String,
      trim: true
    }]
  }],
  weatherForecast: [{
    date: {
      type: String,
      required: true
    },
    temperature: {
      type: String,
      required: true
    },
    conditions: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
tourPlanSchema.index({ userId: 1 });
tourPlanSchema.index({ placeName: 1 });
tourPlanSchema.index({ createdAt: -1 });

module.exports = mongoose.model('TourPlan', tourPlanSchema); 