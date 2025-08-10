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
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, travelAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState(null);
  const [personalityProfile, setPersonalityProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuote, setCurrentQuote] = useState(0);

  const travelQuotes = [
    {
      text: "The world is a book and those who do not travel read only one page.",
      author: "Augustine of Hippo",
      bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: "📚"
    },
    {
      text: "Travel makes one modest. You see what a tiny place you occupy in the world.",
      author: "Francis Bacon", 
      bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      icon: "🌍"
    },
    {
      text: "Not all those who wander are lost.",
      author: "J.R.R. Tolkien",
      bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      icon: "🧭"
    },
    {
      text: "Travel is the only thing you buy that makes you richer.",
      author: "Anonymous",
      bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      icon: "💎"
    },
    {
      text: "Adventure awaits those who seek it.",
      author: "Unknown Explorer",
      bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      icon: "⛰️"
    },
    {
      text: "Collect moments, not things.",
      author: "Travel Wisdom",
      bg: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      icon: "📸"
    }
  ];

  const nostalgicPlaces = [
    {
      name: "Santorini Sunset",
      image: "🌅",
      memory: "That magical moment when the sky painted itself in gold..."
    },
    {
      name: "Tokyo Streets",
      image: "🏮",
      memory: "Lost in translation but found in wonder..."
    },
    {
      name: "Swiss Alps",
      image: "⛰️",
      memory: "Where the mountains touched the clouds..."
    },
    {
      name: "Bali Beach",
      image: "🏖️",
      memory: "Waves whispered secrets of distant lands..."
    }
  ];

  useEffect(() => {
    fetchUserData();
    // Removed auto-rotating quotes as requested
  }, []);

  const fetchUserData = async () => {
    try {
      const [profileResponse, personalityResponse] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getPersonality()
      ]);

      if (profileResponse.data.success) {
        setUserStats(profileResponse.data.user);
        
        // Check if user has completed preferences
        if (!profileResponse.data.user.hasCompletedPreferences) {
          navigate('/preferences');
          return;
        }
      }

      if (personalityResponse.data.success) {
        setPersonalityProfile(personalityResponse.data.personality);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If preferences API fails, might indicate user hasn't completed them
      if (error.response?.status === 404) {
        navigate('/preferences');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const getPersonalityInsight = (profile) => {
    if (!profile) return "Discovering your travel personality...";
    
    const traits = Object.entries(profile.bigFiveScores || {});
    const dominantTrait = traits.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );

    const insights = {
      openness: "You're an adventure seeker who loves exploring new cultures! 🌍",
      conscientiousness: "You're a meticulous planner who creates amazing itineraries! 📋",
      extraversion: "You're a social butterfly who makes friends wherever you go! 🦋",
      agreeableness: "You're a harmonious traveler who brings people together! 🤝",
      neuroticism: "You prefer peaceful, relaxing destinations for rejuvenation! 🧘"
    };

    return insights[dominantTrait[0]] || "Your unique travel style makes every journey special! ✨";
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your travel world...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container bg-pattern">
      {/* Header */}
      <motion.div 
        className="dashboard-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="user-welcome">
            <div className="user-avatar">
              <User size={24} />
            </div>
            <div className="welcome-text">
              <h1>Welcome back, {user?.name?.split(' ')[0]}! ✈️</h1>
              <p>Ready for your next adventure?</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </motion.div>

      {/* Inspirational Quote Carousel */}
      <motion.div 
        className="quote-carousel"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div 
          className="quote-card"
          style={{ background: travelQuotes[currentQuote].bg }}
        >
          <div className="quote-icon-large">{travelQuotes[currentQuote].icon}</div>
          <blockquote className="quote-text">
            "{travelQuotes[currentQuote].text}"
          </blockquote>
          <cite className="quote-author">
            — {travelQuotes[currentQuote].author}
          </cite>
          <div className="quote-navigation">
            <button 
              className="quote-nav-btn"
              onClick={() => setCurrentQuote(prev => prev === 0 ? travelQuotes.length - 1 : prev - 1)}
            >
              ←
            </button>
            <div className="quote-dots">
              {travelQuotes.map((_, index) => (
                <button
                  key={index}
                  className={`quote-dot ${index === currentQuote ? 'active' : ''}`}
                  onClick={() => setCurrentQuote(index)}
                />
              ))}
            </div>
            <button 
              className="quote-nav-btn"
              onClick={() => setCurrentQuote(prev => (prev + 1) % travelQuotes.length)}
            >
              →
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {/* Travel Stats */}
        <motion.div 
          className="stats-card"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="card-header">
            <BarChart3 className="card-icon" />
            <h3>Your Travel Journey</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">🌍</div>
              <div className="stat-number">0</div>
              <div className="stat-label">Countries Explored</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">✈️</div>
              <div className="stat-number">0</div>
              <div className="stat-label">Trips Planned</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📷</div>
              <div className="stat-number">0</div>
              <div className="stat-label">Memories Created</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <div className="stat-number">0</div>
              <div className="stat-label">Dream Destinations</div>
            </div>
          </div>
        </motion.div>

        {/* Dream Destinations */}
        <motion.div 
          className="destinations-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="card-header">
            <Camera className="card-icon" />
            <h3>Dream Destinations</h3>
          </div>
          <div className="destinations-grid">
            {nostalgicPlaces.map((place, index) => (
              <motion.div 
                key={index} 
                className="destination-item"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="destination-image">{place.image}</div>
                <div className="destination-content">
                  <h4>{place.name}</h4>
                  <p>{place.memory}</p>
                  <div className="destination-badge">Explore</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="actions-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="card-header">
            <Plane className="card-icon" />
            <h3>Start Your Adventure</h3>
          </div>
          <div className="actions-content">
            <motion.button 
              className="btn btn-primary btn-large action-btn"
              onClick={() => navigate('/plan-trip')}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Plus size={20} />
              Plan a New Trip
              <span className="btn-sparkle">✨</span>
            </motion.button>
            <div className="quick-links">
              <motion.button 
                className="quick-link"
                whileHover={{ scale: 1.02, x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MapPin size={16} />
                Saved Places
              </motion.button>
              <motion.button 
                className="quick-link"
                whileHover={{ scale: 1.02, x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Heart size={16} />
                Wishlist
              </motion.button>
              <motion.button 
                className="quick-link"
                whileHover={{ scale: 1.02, x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Calendar size={16} />
                Travel Calendar
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
