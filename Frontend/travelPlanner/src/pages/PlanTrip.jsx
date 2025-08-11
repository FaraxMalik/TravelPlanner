import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Plane,
  Clock,
  Star,
  ArrowRight,
  ArrowLeft,
  Loader,
  CheckCircle
} from 'lucide-react';
import { travelAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PlanTrip = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [tripData, setTripData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: 1,
    tripType: '',
    duration: 0
  });
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const tripTypes = [
    { value: 'adventure', label: 'Adventure & Exploration', emoji: '🏔️', color: 'var(--primary-orange)' },
    { value: 'relaxation', label: 'Relaxation & Wellness', emoji: '🏖️', color: 'var(--secondary-orange)' },
    { value: 'cultural', label: 'Cultural & Historical', emoji: '🏛️', color: 'var(--primary-red)' },
    { value: 'romantic', label: 'Romantic Getaway', emoji: '💕', color: 'var(--secondary-red)' },
    { value: 'family', label: 'Family Fun', emoji: '👨‍👩‍👧‍👦', color: 'var(--primary-orange)' },
    { value: 'business', label: 'Business & Networking', emoji: '💼', color: 'var(--text-dark)' }
  ];

  const steps = [
    { title: 'Where to?', subtitle: 'Choose your dream destination', icon: <MapPin /> },
    { title: 'When?', subtitle: 'Pick your travel dates', icon: <Calendar /> },
    { title: 'Budget & Group', subtitle: 'Set your budget and group size', icon: <DollarSign /> },
    { title: 'Trip Style', subtitle: 'What kind of experience do you want?', icon: <Star /> }
  ];

  const handleInputChange = (field, value) => {
    setTripData(prev => ({
      ...prev,
      [field]: value
    }));

    // Calculate duration when dates change
    if (field === 'startDate' || field === 'endDate') {
      const updatedData = { ...tripData, [field]: value };
      if (updatedData.startDate && updatedData.endDate) {
        const start = new Date(updatedData.startDate);
        const end = new Date(updatedData.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTripData(prev => ({ ...prev, duration: diffDays }));
      }
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      generateItinerary();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return tripData.destination.trim().length > 0;
      case 1:
        return tripData.startDate && tripData.endDate && tripData.duration > 0;
      case 2:
        return tripData.budget && tripData.travelers > 0;
      case 3:
        return tripData.tripType;
      default:
        return false;
    }
  };

  const generateItinerary = async () => {
    setIsGenerating(true);
    try {
      const response = await travelAPI.generateItinerary(tripData);
      if (response.data.success) {
        setGeneratedItinerary(response.data.itinerary);
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      // Mock itinerary for demo
      setGeneratedItinerary({
        destination: tripData.destination,
        duration: tripData.duration,
        budget: tripData.budget,
        personalizedInsights: "Based on your adventurous personality and love for cultural experiences...",
        dailyPlan: [
          {
            day: 1,
            title: "Arrival & City Exploration",
            activities: [
              { time: "09:00", activity: "Airport pickup & hotel check-in", cost: 25 },
              { time: "11:00", activity: "Walking tour of historic district", cost: 15 },
              { time: "13:00", activity: "Local cuisine lunch experience", cost: 35 },
              { time: "15:00", activity: "Visit iconic landmark", cost: 20 },
              { time: "19:00", activity: "Welcome dinner at rooftop restaurant", cost: 60 }
            ],
            totalCost: 155
          },
          {
            day: 2,
            title: "Adventure & Nature",
            activities: [
              { time: "08:00", activity: "Mountain hiking expedition", cost: 45 },
              { time: "12:00", activity: "Picnic lunch with scenic views", cost: 20 },
              { time: "14:00", activity: "Adventure sports activity", cost: 80 },
              { time: "17:00", activity: "Relaxation at natural hot springs", cost: 30 },
              { time: "20:00", activity: "Traditional cultural show", cost: 40 }
            ],
            totalCost: 215
          }
        ],
        totalEstimatedCost: 370,
        recommendations: [
          "Pack comfortable hiking shoes for day 2",
          "Book restaurant reservations in advance",
          "Carry local currency for street vendors",
          "Download offline maps for navigation"
        ]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (generatedItinerary) {
    return (
      <div className="trip-result-container bg-pattern">
        <motion.div 
          className="result-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="result-success">
            <CheckCircle className="success-icon" />
            <h1>Your Perfect Trip to {generatedItinerary.destination}!</h1>
            <p>Your perfect trip itinerary tailored just for you ✨</p>
          </div>
        </motion.div>

        <motion.div 
          className="itinerary-overview"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="overview-stats">
            <div className="stat-box">
              <Calendar className="stat-icon" />
              <span>{generatedItinerary.duration} Days</span>
            </div>
            <div className="stat-box">
              <DollarSign className="stat-icon" />
              <span>${generatedItinerary.budget} Budget</span>
            </div>
            <div className="stat-box">
              <Users className="stat-icon" />
              <span>{tripData.travelers} Traveler{tripData.travelers > 1 ? 's' : ''}</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="daily-itinerary"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2>Your Day-by-Day Itinerary</h2>
          {generatedItinerary.dailyPlan.map((day, index) => (
            <div key={index} className="day-card">
              <div className="day-header">
                <div className="day-number">Day {day.day}</div>
                <div className="day-title">{day.title}</div>
                <div className="day-cost">${day.totalCost}</div>
              </div>
              <div className="activities-list">
                {day.activities.map((activity, actIndex) => (
                  <div key={actIndex} className="activity-item">
                    <div className="activity-time">
                      <Clock size={16} />
                      {activity.time}
                    </div>
                    <div className="activity-details">
                      <span className="activity-name">{activity.activity}</span>
                      <span className="activity-cost">${activity.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div 
          className="recommendations-section"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3>💡 Travel Recommendations</h3>
          <div className="recommendations-list">
            {generatedItinerary.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <CheckCircle size={16} />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="result-actions">
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Plan Another Trip
          </button>
          <button className="btn btn-primary">
            Save This Itinerary
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="trip-generating">
        <motion.div 
          className="generating-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="generating-icon"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Plane size={60} />
          </motion.div>
          <h2>Creating Your Perfect Trip...</h2>
          <p>Using your preferences to craft the ideal itinerary ✨</p>
          <div className="progress-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="plan-trip-container bg-pattern">
      <motion.div 
        className="trip-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Plan Your Next Adventure</h1>
        <p>Let's create the perfect trip tailored just for you! 🌟</p>
      </motion.div>

      <div className="trip-progress">
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`progress-step ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-subtitle">{step.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="trip-step-card"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {currentStep === 0 && (
            <div className="step-content">
              <h2>Where would you like to go?</h2>
              <div className="input-group">
                <MapPin className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter destination (e.g., Paris, Tokyo, New York)"
                  value={tripData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  className="destination-input"
                />
              </div>
              <div className="destination-suggestions">
                {['Paris, France', 'Tokyo, Japan', 'New York, USA', 'Bali, Indonesia'].map((dest, index) => (
                  <button 
                    key={index}
                    className="suggestion-btn"
                    onClick={() => handleInputChange('destination', dest)}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="step-content">
              <h2>When are you traveling?</h2>
              <div className="date-inputs">
                <div className="input-group">
                  <Calendar className="input-icon" />
                  <input
                    type="date"
                    value={tripData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <label>Start Date</label>
                </div>
                <div className="input-group">
                  <Calendar className="input-icon" />
                  <input
                    type="date"
                    value={tripData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={tripData.startDate}
                  />
                  <label>End Date</label>
                </div>
              </div>
              {tripData.duration > 0 && (
                <div className="duration-display">
                  <Clock className="duration-icon" />
                  <span>{tripData.duration} day{tripData.duration > 1 ? 's' : ''} trip</span>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <h2>Budget and Group Size</h2>
              <div className="budget-group-inputs">
                <div className="input-group">
                  <DollarSign className="input-icon" />
                  <select
                    value={tripData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                  >
                    <option value="">Select Budget Range</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-2500">$1,000 - $2,500</option>
                    <option value="2500-5000">$2,500 - $5,000</option>
                    <option value="5000+">$5,000+</option>
                  </select>
                </div>
                <div className="input-group">
                  <Users className="input-icon" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tripData.travelers}
                    onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
                    placeholder="Number of travelers"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-content">
              <h2>What type of trip are you planning?</h2>
              <div className="trip-types-grid">
                {tripTypes.map((type, index) => (
                  <button
                    key={index}
                    className={`trip-type-card ${tripData.tripType === type.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange('tripType', type.value)}
                    style={{ '--accent-color': type.color }}
                  >
                    <div className="trip-type-emoji">{type.emoji}</div>
                    <div className="trip-type-label">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="step-navigation">
            <button 
              className="btn btn-secondary"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft size={20} />
              Previous
            </button>

            <button 
              className="btn btn-primary"
              onClick={nextStep}
              disabled={!isStepValid()}
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Generate Trip
                  <Plane size={20} />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PlanTrip;
