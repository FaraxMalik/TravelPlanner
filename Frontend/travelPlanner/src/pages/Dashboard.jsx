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
  DollarSign,
  Map,
  Calendar as CalendarIcon,
  Eye,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, travelAPI } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
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
              <DollarSign className="mini-icon" />
              <div className="mini-stat">
                <h3>€{userStats?.totalSpent || 0}</h3>
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
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="empty-visual">
              <motion.div
                className="empty-icon-container"
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sunset size={48} />
              </motion.div>
              <div className="empty-particles">
                <motion.div className="particle" animate={{ y: [-20, 20, -20] }} transition={{ duration: 2, repeat: Infinity }} />
                <motion.div className="particle" animate={{ y: [20, -20, 20] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
                <motion.div className="particle" animate={{ y: [-10, 30, -10] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
              </div>
            </div>
            <div className="empty-content">
              <h3>Your Adventure Awaits</h3>
              <p>Ready to create some incredible memories? Let's plan your first unforgettable journey.</p>
              <motion.button
                className="empty-cta"
                onClick={planNewTrip}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles size={20} />
                Begin Your Journey
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
};

export default Dashboard;
