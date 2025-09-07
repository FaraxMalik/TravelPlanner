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
  Sunset,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  PoundSterling,
  Map,
  Calendar as CalendarIcon,
  Eye,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, travelAPI } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';

// Import dashboard images
import dashboardImage1 from '../img/6.jpg';
import dashboardImage2 from '../img/7.png';
import dashboardImage3 from '../img/8.png';
import './Dashboard.css';

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

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            acc.totalDays += trip.numberOfDays || trip.duration || 0;
            acc.totalSpent += trip.budget || 0;
            // Count unique countries/destinations
            const destination = trip.placeName || trip.destination;
            if (destination && !acc.countries.includes(destination)) {
              acc.countries.push(destination);
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
    <div className="modern-dashboard">
      {/* Floating Header */}
      <motion.div 
        className="floating-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="header-content">
          <div className="user-greeting">
            <motion.div 
              className="avatar-section"
              whileHover={{ scale: 1.05 }}
            >
              <div className="avatar-circle">
                <User size={24} />
              </div>
              <div className="greeting-text">
                <h1>Welcome back, {user?.firstName || 'Explorer'}!</h1>
                <p>Let's plan your next extraordinary journey</p>
              </div>
            </motion.div>
          </div>
          <div className="header-actions">
            <motion.button
              className="primary-cta"
              onClick={planNewTrip}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={20} />
              Create New Trip
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Dashboard */}
      <motion.section 
        className="stats-dashboard"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="stats-container">
          <motion.div 
            className="primary-stat-card"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-header">
              <div className="stat-icon-wrapper">
                <Plane className="stat-icon" />
              </div>
              <div className="stat-badge">Active Traveler</div>
            </div>
            <div className="stat-content">
              <h2>{userStats?.totalTrips || 0}</h2>
              <p>Trips Planned</p>
              <div className="stat-trend">
                <TrendingUp size={16} />
                <span>Ready for more</span>
              </div>
            </div>
            <div className="stat-decoration">
              <div className="decoration-circle"></div>
              <div className="decoration-line"></div>
            </div>
          </motion.div>

          <div className="secondary-stats">
            <motion.div 
              className="stat-card compact"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Globe className="mini-icon" />
              <div className="mini-stat">
                <h3>{userStats?.countriesVisited || 0}</h3>
                <p>Countries</p>
              </div>
            </motion.div>

            <motion.div 
              className="stat-card compact"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <CalendarIcon className="mini-icon" />
              <div className="mini-stat">
                <h3>{userStats?.totalDays || 0}</h3>
                <p>Days Traveled</p>
              </div>
            </motion.div>

            <motion.div 
              className="stat-card compact"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Award className="mini-icon" />
              <div className="mini-stat">
                <h3>{user?.preferencesCompleted || user?.hasCompletedPreferences ? '100%' : '0%'}</h3>
                <p>Profile</p>
              </div>
            </motion.div>

            <motion.div 
              className="stat-card compact"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <PoundSterling className="mini-icon" />
              <div className="mini-stat">
                <h3>£{userStats?.totalSpent || 0}</h3>
                <p>Spent</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Feature Highlight */}
      <motion.section 
        className="feature-highlight"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <div className="feature-card">
          <div className="feature-visual">
            <div className="floating-elements">
              <motion.div 
                className="floating-icon"
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Map size={32} />
              </motion.div>
              <motion.div 
                className="floating-icon"
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <Compass size={28} />
              </motion.div>
              <motion.div 
                className="floating-icon"
                animate={{ y: [-5, 15, -5] }}
                transition={{ duration: 3, repeat: Infinity, delay: 2 }}
              >
                <Mountain size={30} />
              </motion.div>
            </div>
          </div>
          <div className="feature-content">
            <h2>AI-Powered Travel Planning</h2>
            <p>Experience the future of travel with our intelligent itinerary generator. Get personalized recommendations, weather-optimized schedules, and hidden local gems.</p>
            <div className="feature-tags">
              <span className="tag">🤖 AI-Powered</span>
              <span className="tag">🌍 Global Coverage</span>
              <span className="tag">💰 Budget-Friendly</span>
              <span className="tag">⚡ Instant Results</span>
            </div>
            <motion.button
              className="feature-cta"
              onClick={planNewTrip}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Planning
              <Navigation size={18} />
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Travel Inspiration Gallery */}
      <motion.section 
        className="dashboard-gallery-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className="container">
          <div className="gallery-header">
            <h2>Travel Inspiration</h2>
            <p>Discover your next dream destination</p>
          </div>
          
          <div className="dashboard-gallery">
            <motion.div
              className="dashboard-gallery-item"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <img src={dashboardImage1} alt="Exotic destinations" />
              <div className="dashboard-gallery-overlay">
                <div className="dashboard-overlay-content">
                  <h4>Exotic Getaways</h4>
                  <p>Discover hidden paradises</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="dashboard-gallery-item"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <img src={dashboardImage2} alt="Adventure travel" />
              <div className="dashboard-gallery-overlay">
                <div className="dashboard-overlay-content">
                  <h4>Adventure Awaits</h4>
                  <p>Thrilling experiences ahead</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="dashboard-gallery-item"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <img src={dashboardImage3} alt="Luxury travel" />
              <div className="dashboard-gallery-overlay">
                <div className="dashboard-overlay-content">
                  <h4>Luxury Escapes</h4>
                  <p>Indulge in premium experiences</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Travel Gallery */}
      <motion.section 
        className="travel-gallery"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <div className="gallery-header">
          <h2>Your Travel Story</h2>
          <p>Every journey begins with a single step</p>
        </div>

        {pastTrips.length > 0 ? (
          <div className="trips-masonry">
            {pastTrips.map((trip, index) => (
              <motion.div
                key={trip.id || index}
                className="trip-tile sleek-tile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index, duration: 0.5 }}
                whileHover={{ y: -4, scale: 1.03, boxShadow: '0 4px 24px #F95F3933' }}
                onClick={() => viewPastTrip(trip)}
                style={{
                  background: '#fff',
                  borderRadius: '18px',
                  boxShadow: '0 2px 12px #F95F3912',
                  padding: '1.2rem 1.5rem',
                  margin: '0.5rem',
                  minWidth: '180px',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '1.5px solid #F95F3933',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
              >
                <span style={{
                  color: '#F95F39',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  letterSpacing: '0.02em',
                  textAlign: 'center',
                  width: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {trip.placeName || trip.destination || 'Adventure Destination'}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="empty-state-modern"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="empty-hero">
              <div className="empty-icon-wrapper">
                <motion.div
                  className="empty-icon-bg"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity }
                  }}
                />
                <motion.div
                  className="empty-main-icon"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Plane size={40} className="plane-icon" />
                </motion.div>
                <motion.div 
                  className="floating-element element-1"
                  animate={{ 
                    x: [0, 20, 0],
                    y: [0, -15, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  <Sparkles size={16} />
                </motion.div>
                <motion.div 
                  className="floating-element element-2"
                  animate={{ 
                    x: [0, -25, 0],
                    y: [0, 20, 0],
                    rotate: [0, -180, -360]
                  }}
                  transition={{ duration: 8, repeat: Infinity, delay: 1 }}
                >
                  <MapPin size={18} />
                </motion.div>
                <motion.div 
                  className="floating-element element-3"
                  animate={{ 
                    x: [0, 15, 0],
                    y: [0, -25, 0],
                    rotate: [0, 90, 180, 270, 360]
                  }}
                  transition={{ duration: 10, repeat: Infinity, delay: 2 }}
                >
                  <Navigation size={14} />
                </motion.div>
              </div>
            </div>
            <div className="empty-content-modern">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                Your Travel Story
              </motion.h2>
              <motion.p
                className="empty-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
              >
                Every journey begins with a single step
              </motion.p>
              <motion.div
                className="adventure-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6, duration: 0.8 }}
              >
                <div className="adventure-icon">
                  <Sunset size={24} />
                </div>
                <div className="adventure-text">
                  <h3>Your Adventure Awaits</h3>
                  <p>Ready to create some incredible memories? Let's plan your first unforgettable journey.</p>
                </div>
              </motion.div>
              <motion.button
                className="cta-button-modern"
                onClick={planNewTrip}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 40px rgba(255, 107, 53, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles size={20} />
                <span>Begin Your Journey</span>
                <motion.div
                  className="button-shine"
                  animate={{ x: [-100, 200] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 3 }}
                />
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
};

export default Dashboard;
