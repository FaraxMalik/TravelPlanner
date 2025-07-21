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
    },
    // Preference questions (store as numeric codes: 0 = A, 1 = B, 2 = C, 3 = D)
    perfectDayType: {
      type: Number, // Q1: “What’s your perfect kind of day on vacation?”
      enum: [0,1,2,3],
      required: true
    },
    placePreference: {
      type: Number, // Q2: “Would you rather…”
      enum: [0,1,2,3],
      required: true
    },
    travelPace: {
      type: Number, // Q3: “What’s your travel pace?”
      enum: [0,1,2,3],
      required: true
    },
    snackVibe: {
      type: Number, // Q4: “Which snack sounds like your vibe?”
      enum: [0,1,2,3],
      required: true
    },
    backupPlan: {
      type: Number, // Q5: “If weather’s bad, what’s your backup?”
      enum: [0,1,2,3],
      required: true
    }
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