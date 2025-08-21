import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Calendar, 
  TrendingUp, 
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
  const [pastTrips, setPastTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Auto-redirect first-time users to preferences
  useEffect(() => {
    if (user && !loading && !user.preferencesCompleted && !user.hasCompletedPreferences) {
      console.log('🔄 Redirecting new user to preferences questionnaire...');
      navigate('/preferences');
    }
  }, [user, loading, navigate]);

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

      // Check if user has completed preferences
      if (!user?.preferencesCompleted && !user?.hasCompletedPreferences) {
        console.log('📋 User has not completed preferences - showing zero stats');
        setLoading(false);
        return;
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
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <motion.div
            className="welcome-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>Welcome back, {user?.firstName || 'Traveler'}! 🌟</h1>
            <p>Ready to plan your next adventure?</p>
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
              <h3>{user?.preferencesCompleted || user?.hasCompletedPreferences ? '100%' : '0%'}</h3>
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
              <p>Let our AI create a personalized itinerary just for you. From hidden gems to must-see attractions, we'll craft the perfect journey based on your travel preferences and style.</p>
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
    </div>
  );
};

export default Dashboard;
