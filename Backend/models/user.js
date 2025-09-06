  const mongoose = require('mongoose');

  const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    preferences: {
      // Store all 12 preference answers (1-4 scale)
      morningRoutine: { type: Number, min: 1, max: 4 },
      placePreference: { type: Number, min: 1, max: 4 },
      travelPace: { type: Number, min: 1, max: 4 },
      foodPreferences: { type: Number, min: 1, max: 4 },
      backupPlanning: { type: Number, min: 1, max: 4 },
      memoryCapturing: { type: Number, min: 1, max: 4 },
      photographyStyle: { type: Number, min: 1, max: 4 },
      musicPreferences: { type: Number, min: 1, max: 4 },
      spontaneityLevel: { type: Number, min: 1, max: 4 },
      packingPhilosophy: { type: Number, min: 1, max: 4 },
      groupDynamics: { type: Number, min: 1, max: 4 },
      memorableElements: { type: Number, min: 1, max: 4 },
      
      // Legacy fields for backward compatibility
      interests: {
        type: [String],
        default: []
      },
      budget: {
        type: Number,
        default: 0
      },
      duration: {
        type: Number,
        default: 1
      }
    },
    
    // New fields for enhanced functionality
    preferencesCompleted: {
      type: Boolean,
      default: false
    },
    preferencesUpdatedAt: {
      type: Date
    },
    personalityAnalysis: {
      // Store the description from ML model
      description: { type: String },
      // Store full ML model results for future use
      bigFiveScores: { type: Object },
      dominantTrait: { type: String },
      confidenceScores: { type: Object }
    },
    personalityAnalyzedAt: {
      type: Date
    },
    tours: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TourPlan'
    }]
  }, {
    timestamps: true
  });

  // Index for better query performance
  userSchema.index({ email: 1 });

  module.exports = mongoose.model('User', userSchema); 