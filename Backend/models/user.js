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