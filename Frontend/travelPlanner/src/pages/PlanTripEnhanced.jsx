import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Plane, 
  Clock,
  Download,
  Sparkles,
  Sun,
  CloudRain,
  Star,
  Camera,
  Coffee,
  Mountain,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { aiAPI, pdfAPI } from '../services/api';
import ItineraryTable from '../components/ItineraryTable';
import './PlanTripEnhanced.css';

const PlanTrip = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form', 'generating', 'results'
  const [tripData, setTripData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: 1,
    additionalRequirements: ''
  });
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setTripData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateDuration = () => {
    if (tripData.startDate && tripData.endDate) {
      const start = new Date(tripData.startDate);
      const end = new Date(tripData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 1;
    }
    return 1;
  };

  const generateItinerary = async () => {
    if (!tripData.destination || !tripData.startDate || !tripData.endDate || !tripData.budget) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setStep('generating');
    setError('');

    try {
      const duration = calculateDuration();
      const dailyBudget = Math.floor(tripData.budget / duration);

      const requestData = {
        destination: tripData.destination,
        travel_dates: `${tripData.startDate} to ${tripData.endDate}`,
        duration: duration,
        daily_budget: dailyBudget,
        total_budget: parseInt(tripData.budget),
        additional_preferences: tripData.additionalRequirements || 'Standard travel preferences',
        travelers: tripData.travelers
      };

      const response = await aiAPI.generateItinerary(requestData);
      
      if (response.data.success) {
        setItinerary(response.data.itinerary); // Extract just the itinerary data
        setStep('results');
      } else {
        throw new Error(response.data.error || 'Failed to generate itinerary');
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      setError('Failed to generate itinerary. Please try again.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!itinerary) return;

    try {
      const response = await pdfAPI.generateItineraryPDF({
        ...itinerary,
        destination: tripData.destination,
        travel_dates: `${tripData.startDate} to ${tripData.endDate}`,
        duration: calculateDuration(),
        total_budget: parseInt(tripData.budget),
        tripData
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tripData.destination}_Itinerary.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const planAnotherTrip = () => {
    setStep('form');
    setTripData({
      destination: '',
      startDate: '',
      endDate: '',
      budget: '',
      travelers: 1,
      additionalRequirements: ''
    });
    setItinerary(null);
    setError('');
  };

  const renderForm = () => (
    <motion.div
      className="trip-form-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="form-header">
        <h1>🗺️ Plan Your Perfect Trip</h1>
        <p>Tell us about your dream destination and we'll create a personalized itinerary</p>
      </div>

      <div className="trip-form">
        <div className="form-row">
          <div className="form-group full-width">
            <label>
              <MapPin className="input-icon" />
              Where do you want to go?
            </label>
            <input
              type="text"
              placeholder="e.g., Paris, France or Tokyo, Japan"
              value={tripData.destination}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <Calendar className="input-icon" />
              Start Date
            </label>
            <input
              type="date"
              value={tripData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>
              <Calendar className="input-icon" />
              End Date
            </label>
            <input
              type="date"
              value={tripData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="form-input"
              min={tripData.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <DollarSign className="input-icon" />
              Total Budget (USD)
            </label>
            <input
              type="number"
              placeholder="e.g., 1500"
              value={tripData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className="form-input"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>
              <Users className="input-icon" />
              Number of Travelers
            </label>
            <select
              value={tripData.travelers}
              onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
              className="form-input"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>
              <Sparkles className="input-icon" />
              Additional Requirements (Optional)
            </label>
            <textarea
              placeholder="e.g., vegetarian food, wheelchair accessible, family-friendly activities, adventure sports, cultural experiences..."
              value={tripData.additionalRequirements}
              onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
              className="form-textarea"
              rows={4}
            />
          </div>
        </div>

        {tripData.startDate && tripData.endDate && (
          <div className="trip-summary">
            <div className="summary-item">
              <Clock className="summary-icon" />
              <span>{calculateDuration()} days</span>
            </div>
            {tripData.budget && (
              <div className="summary-item">
                <DollarSign className="summary-icon" />
                <span>${Math.floor(tripData.budget / calculateDuration())}/day</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <motion.button
          className="generate-btn"
          onClick={generateItinerary}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plane className="btn-icon" />
          Generate My Itinerary
        </motion.button>
      </div>
    </motion.div>
  );

  const renderGenerating = () => (
    <motion.div
      className="generating-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="generating-content">
        <div className="generating-animation">
          <div className="spinner-container">
            <div className="travel-spinner">
              <Plane className="plane-icon" />
            </div>
          </div>
          <h2>🧠 Creating Your Perfect Itinerary...</h2>
          <div className="generating-steps">
            <div className="step active">
              <Sun className="step-icon" />
              <span>Analyzing weather conditions</span>
            </div>
            <div className="step active">
              <Star className="step-icon" />
              <span>Finding personalized recommendations</span>
            </div>
            <div className="step active">
              <DollarSign className="step-icon" />
              <span>Optimizing your budget</span>
            </div>
            <div className="step active">
              <MapPin className="step-icon" />
              <span>Crafting detailed daily plans</span>
            </div>
          </div>
          <p>This may take a few moments while our AI analyzes thousands of options...</p>
        </div>
      </div>
    </motion.div>
  );

  const renderResults = () => (
    <motion.div
      className="results-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="results-header">
        <h1>🎉 Your Personalized Itinerary</h1>
        <div className="trip-info">
          <span><MapPin className="info-icon" />{tripData.destination}</span>
          <span><Calendar className="info-icon" />{calculateDuration()} days</span>
          <span><DollarSign className="info-icon" />${tripData.budget}</span>
        </div>
      </div>

      {/* Personality Analysis */}
      {itinerary?.personality_analysis && (
        <motion.div 
          className="personality-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>🎭 Travel Personality Match</h3>
          <p>{itinerary.personality_analysis.description}</p>
          <div className="personality-highlights">
            {itinerary.personality_analysis.motivations?.slice(0, 3).map((motivation, index) => (
              <span key={index} className="highlight-tag">{motivation}</span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Weather Forecast */}
      {itinerary?.weather_forecast && (
        <motion.div 
          className="weather-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>🌤️ Weather Forecast</h3>
          <div className="weather-summary">
            <p>{itinerary.weather_forecast.overall_summary}</p>
            <div className="packing-tips">
              <strong>Packing recommendations:</strong>
              {itinerary.weather_forecast.packing_recommendations?.map((item, index) => (
                <span key={index} className="packing-item">{item}</span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Detailed Itinerary */}
      {/* Tabular Itinerary Display */}
      <motion.div 
        className="tabular-itinerary-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ItineraryTable itinerary={itinerary} tripData={tripData} />
      </motion.div>

      {/* Action Buttons */}
      <div className="results-actions">
        <motion.button
          className="action-btn primary"
          onClick={downloadPDF}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download className="btn-icon" />
          Download PDF
        </motion.button>

        <motion.button
          className="action-btn secondary"
          onClick={planAnotherTrip}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="btn-icon" />
          Plan Another Trip
        </motion.button>

        <motion.button
          className="action-btn tertiary"
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Mountain className="btn-icon" />
          Back to Dashboard
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="plan-trip-container">
      <AnimatePresence mode="wait">
        {step === 'form' && renderForm()}
        {step === 'generating' && renderGenerating()}
        {step === 'results' && renderResults()}
      </AnimatePresence>
    </div>
  );
};

export default PlanTrip;
