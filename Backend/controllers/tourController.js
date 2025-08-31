const TourPlan = require('../models/tourPlan');
const User = require('../models/user');

// @desc    Create a new tour plan
// @route   POST /api/tours/create
// @access  Private
// Creates a new tour plan for the user
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

    // Get user preferences for personalized recommendations
    const user = await User.findById(req.user._id);
    let personalizedSuggestions = suggestedPlaces || [];
    let personalizedItinerary = itinerary || [];

          // If user has preferences, enhance the tour plan with personalized recommendations
      if (user.preferences) {
        const answers = {
          morningRoutine: user.preferences.morningRoutine,
          placePreference: user.preferences.placePreference,
          travelPace: user.preferences.travelPace,
          snackVibe: user.preferences.snackVibe,
          backupPlan: user.preferences.backupPlan,
          souvenirType: user.preferences.souvenirType,
          photoStyle: user.preferences.photoStyle,
          musicTaste: user.preferences.musicTaste,
          spontaneity: user.preferences.spontaneity,
          packingStyle: user.preferences.packingStyle,
          groupRole: user.preferences.groupRole,
          memorableElement: user.preferences.memorableElement
        };

      // Check if all preference questions are answered
      const hasAllPreferences = Object.values(answers).every(answer => 
        answer !== undefined && answer !== null
      );

      if (hasAllPreferences) {
        const preferenceAnalysis = analyzePreferences(answers);
        const recommendations = generateRecommendations(preferenceAnalysis);
        
        // Add personalized recommendations to the tour plan
        personalizedSuggestions = [
          ...personalizedSuggestions,
          ...recommendations.activities,
          ...recommendations.food,
          ...recommendations.places
        ];
      }
    }

    // Create tour plan with personalized data
    const tourPlan = await TourPlan.create({
      userId: req.user._id,
      placeName,
      budget,
      numberOfDays,
      suggestedPlaces: personalizedSuggestions,
      itinerary: personalizedItinerary,
      weatherForecast: weatherForecast || [],
      personalizedRecommendations: user.preferences ? true : false
    });

    // Add tour to user's tours array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { tours: tourPlan._id } }
    );

    res.status(201).json({
      message: 'Tour plan created successfully',
      tourPlan,
      personalized: user.preferences ? true : false
    });
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all tour plans for logged-in user
// @route   GET /api/tours/myplans
// @access  Private
// Retrieves all tour plans created by the user
const getUserTours = async (req, res) => {
  try {
    const tours = await TourPlan.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tours.length,
      itineraries: tours,
      tours // Keep backward compatibility
    });
  } catch (error) {
    console.error('Get user tours error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

module.exports = {
  createTour,
  getUserTours
}; 