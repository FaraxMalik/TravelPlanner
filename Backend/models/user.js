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
    // 12 Finalized Preference Questions (0=A, 1=B, 2=C, 3=D) - Optional during registration
    morningRoutine: {
      type: Number, // Q1: "How do you like to start your day on a trip?"
      enum: [0, 1, 2, 3],
      required: false
    },
    placePreference: {
      type: Number, // Q2: "Would you rather..." (Hidden Gem Edition)
      enum: [0, 1, 2, 3],
      required: false
    },
    travelPace: {
      type: Number, // Q3: "Your trip starts now. What's your vibe?"
      enum: [0, 1, 2, 3],
      required: false
    },
    snackVibe: {
      type: Number, // Q4: "Which snack sounds like your vibe?"
      enum: [0, 1, 2, 3],
      required: false
    },
    backupPlan: {
      type: Number, // Q5: "If it rains on your travel day..."
      enum: [0, 1, 2, 3],
      required: false
    },
    souvenirType: {
      type: Number, // Q6: "Your ideal souvenir is..."
      enum: [0, 1, 2, 3],
      required: false
    },
    photoStyle: {
      type: Number, // Q7: "Your travel album mostly has..."
      enum: [0, 1, 2, 3],
      required: false
    },
    musicTaste: {
      type: Number, // Q8: "Pick a song for your road trip playlist."
      enum: [0, 1, 2, 3],
      required: false
    },
    spontaneity: {
      type: Number, // Q9: "You stumble across an unplanned detour...?"
      enum: [0, 1, 2, 3],
      required: false
    },
    packingStyle: {
      type: Number, // Q10: "What does your luggage say about you?"
      enum: [0, 1, 2, 3],
      required: false
    },
    groupRole: {
      type: Number, // Q11: "Your friends say you are the..."
      enum: [0, 1, 2, 3],
      required: false
    },
    memorableElement: {
      type: Number, // Q12: "What makes a trip unforgettable?"
      enum: [0, 1, 2, 3],
      required: false
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