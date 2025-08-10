import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Quote, 
  Camera,
  Heart,
  Plane,
  Plus,
  BarChart3,
  Compass,
  Star,
  Globe,
  Mountain,
  Sunset
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, travelAPI } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import './DashboardEnhanced.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userStats, setUserStats] = useState(null);
  const [personalityProfile, setPersonalityProfile] = useState(null);
  const [pastTrips, setPastTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuote, setCurrentQuote] = useState(0);

  // Get personality result from navigation state or load from API
  useEffect(() => {
    if (location.state?.personalityResult) {
      setPersonalityProfile(location.state.personalityResult);
    }
    loadDashboardData();
  }, [location.state, user]);

  // Auto-redirect first-time users to preferences
  useEffect(() => {
    if (user && !loading && !user.preferencesCompleted && !user.hasCompletedPreferences) {
      console.log('🔄 Redirecting new user to preferences questionnaire...');
      navigate('/preferences');
    }
  }, [user, loading, navigate]);

  // Auto-redirect new users to preferences questionnaire
  useEffect(() => {
    if (!loading && user && !user.preferencesCompleted && !personalityProfile) {
      console.log('New user detected, redirecting to preferences...');
      navigate('/preferences');
    }
  }, [user, loading, personalityProfile, navigate]);

  const travelQuotes = [
    {
      text: "The world is a book and those who do not travel read only one page.",
      author: "Augustine of Hippo",
      bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: "📚"
    },
    {
      text: "Adventure awaits those who dare to explore beyond their comfort zone.",
      author: "Unknown Explorer",
      bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      icon: "🗺️"
    },
    {
      text: "Travel makes one modest. You see what a tiny place you occupy in the world.",
      author: "Francis Bacon",
      bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      icon: "🌍"
    },
    {
      text: "Not all those who wander are lost.",
      author: "J.R.R. Tolkien",
      bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      icon: "🧭"
    },
    {
      text: "Travel is the only thing you buy that makes you richer.",
      author: "Anonymous",
      bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      icon: "💰"
    }
  ];

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Initialize with zero stats for new users
      setUserStats({
        totalTrips: 0,
        countriesVisited: 0,
        totalDays: 0,
        totalSpent: 0
      });

      // Check if user has completed personality assessment
      if (!user?.preferencesCompleted && !user?.hasCompletedPreferences) {
        console.log('📋 User has not completed preferences - showing zero stats');
        setPersonalityProfile(null);
        setLoading(false);
        return;
      }

      // Load user personality if they've completed the assessment
      try {
        const personalityResponse = await userAPI.getPersonality();
        if (personalityResponse.data.success) {
          setPersonalityProfile(personalityResponse.data.personality);
        }
      } catch (error) {
        console.log('No personality data found:', error.response?.status);
        setPersonalityProfile(null);
      }

      // Load past trips and calculate real stats
      try {
        const tripsResponse = await travelAPI.getItineraries();
        if (tripsResponse.data.success && tripsResponse.data.itineraries) {
          const trips = tripsResponse.data.itineraries;
          setPastTrips(trips);
          
          // Calculate real user stats from trips
          const stats = trips.reduce((acc, trip) => {
            acc.totalTrips += 1;
            acc.totalDays += trip.duration || 0;
            acc.totalSpent += trip.budget || 0;
            // Count unique countries
            if (trip.destination && !acc.countries.includes(trip.destination)) {
              acc.countries.push(trip.destination);
            }
            return acc;
          }, { totalTrips: 0, totalDays: 0, totalSpent: 0, countries: [] });
          
          setUserStats({
            totalTrips: stats.totalTrips,
            countriesVisited: stats.countries.length,
            totalDays: stats.totalDays,
            totalSpent: stats.totalSpent
          });
        }
      } catch (error) {
        console.log('No past trips found');
        setPastTrips([]);
      }

    } catch (error) {
      console.error('Dashboard loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rotate quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % travelQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const planNewTrip = () => {
    navigate('/plan-trip');
  };

  const viewPastTrip = (trip) => {
    navigate('/trip-details', { state: { trip } });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Hero Section with Personality */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <motion.div
            className="welcome-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>Welcome back, {user?.firstName || 'Traveler'}! 🌟</h1>
            
            {personalityProfile ? (
              <motion.div 
                className="personality-highlight"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="personality-badge">
                  <h3>🎭 Your Travel Personality</h3>
                  <p>{personalityProfile.description}</p>
                  <div className="personality-tags">
                    {personalityProfile.motivations?.slice(0, 2).map((motivation, index) => (
                      <span key={index} className="personality-tag">
                        {motivation}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="no-personality"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p>Complete your travel personality quiz to get personalized recommendations!</p>
                <button 
                  className="cta-btn"
                  onClick={() => navigate('/preferences')}
                >
                  Take Quiz 🧠
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Travel Quote Carousel */}
          <motion.div
            className="quote-carousel"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuote}
                className="quote-card"
                style={{ background: travelQuotes[currentQuote].bg }}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.6 }}
              >
                <div className="quote-icon">{travelQuotes[currentQuote].icon}</div>
                <Quote className="quote-symbol" />
                <p className="quote-text">{travelQuotes[currentQuote].text}</p>
                <p className="quote-author">— {travelQuotes[currentQuote].author}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Plane className="stat-icon" />
            <div className="stat-content">
              <h3>{userStats?.totalTrips || 0}</h3>
              <p>Trips Planned</p>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Globe className="stat-icon" />
            <div className="stat-content">
              <h3>{userStats?.countriesVisited || 0}</h3>
              <p>Countries Explored</p>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Calendar className="stat-icon" />
            <div className="stat-content">
              <h3>{userStats?.totalDays || 0}</h3>
              <p>Days Traveled</p>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Star className="stat-icon" />
            <div className="stat-content">
              <h3>{personalityProfile ? '100%' : '0%'}</h3>
              <p>Profile Complete</p>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Heart className="stat-icon" />
            <div className="stat-content">
              <h3>Ready</h3>
              <p>For Adventure</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Action: Plan Your Trip */}
      <section className="main-action-section">
        <motion.div 
          className="plan-trip-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="plan-trip-content">
            <div className="plan-trip-text">
              <h2>🗺️ Ready for Your Next Adventure?</h2>
              <p>Let our AI create a personalized itinerary just for you. From hidden gems to must-see attractions, we'll craft the perfect journey based on your unique travel personality.</p>
              <ul className="features-list">
                <li>✨ Personalized based on your preferences</li>
                <li>🌤️ Weather-optimized planning</li>
                <li>💰 Budget-conscious recommendations</li>
                <li>🎯 Local experiences and hidden gems</li>
              </ul>
            </div>
            <div className="plan-trip-action">
              <motion.button
                className="plan-trip-btn"
                onClick={planNewTrip}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="btn-icon" />
                Plan Your Trip
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Past Trips */}
      <section className="past-trips-section">
        <h2>📚 Your Travel Memories</h2>
        
        {pastTrips.length > 0 ? (
          <div className="trips-grid">
            {pastTrips.map((trip, index) => (
              <motion.div
                key={trip.id || index}
                className="trip-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => viewPastTrip(trip)}
              >
                <div className="trip-image">
                  <MapPin className="trip-icon" />
                </div>
                <div className="trip-info">
                  <h3>{trip.destination || 'Unknown Destination'}</h3>
                  <p className="trip-date">
                    <Calendar className="date-icon" />
                    {trip.dates || 'Date not specified'}
                  </p>
                  <p className="trip-duration">{trip.duration || 'N/A'} days</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="no-trips"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Mountain className="no-trips-icon" />
            <h3>No trips yet, but adventure awaits!</h3>
            <p>Start planning your first trip and create unforgettable memories.</p>
            <button className="start-planning-btn" onClick={planNewTrip}>
              Start Planning <Compass className="btn-icon" />
            </button>
          </motion.div>
        )}
      </section>

      {/* Quick Tips based on personality */}
      {personalityProfile && (
        <section className="tips-section">
          <motion.div 
            className="tips-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <h3>💡 Personalized Tips for You</h3>
            <div className="tips-grid">
              <div className="tip">
                <div className="tip-icon">🏨</div>
                <p>Based on your personality, you'd love: {personalityProfile.accommodation_style}</p>
              </div>
              <div className="tip">
                <div className="tip-icon">🎪</div>
                <p>Perfect activities for you: {personalityProfile.preferred_activities?.[0]}</p>
              </div>
              <div className="tip">
                <div className="tip-icon">🎯</div>
                <p>Your travel motivation: {personalityProfile.motivations?.[0]}</p>
              </div>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
