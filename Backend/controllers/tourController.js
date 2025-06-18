const TourPlan = require('../models/tourPlan');
const User = require('../models/user');

// @desc    Create a new tour plan
// @route   POST /api/tours/create
// @access  Private
const createTour = async (req, res) => {
  try {
    const {
      placeName,
      budget,
      numberOfDays,
      suggestedPlaces,
      itinerary,
      weatherForecast
    } = req.body;

    // Validate required fields
    if (!placeName || !budget || !numberOfDays) {
      return res.status(400).json({
        message: 'Please provide placeName, budget, and numberOfDays'
      });
    }

    // Create tour plan
    const tourPlan = await TourPlan.create({
      userId: req.user._id,
      placeName,
      budget,
      numberOfDays,
      suggestedPlaces: suggestedPlaces || [],
      itinerary: itinerary || [],
      weatherForecast: weatherForecast || []
    });

    // Add tour to user's tours array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { tours: tourPlan._id } }
    );

    res.status(201).json({
      message: 'Tour plan created successfully',
      tourPlan
    });
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all tour plans for logged-in user
// @route   GET /api/tours/myplans
// @access  Private
const getUserTours = async (req, res) => {
  try {
    const tours = await TourPlan.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      count: tours.length,
      tours
    });
  } catch (error) {
    console.error('Get user tours error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTour,
  getUserTours
}; 