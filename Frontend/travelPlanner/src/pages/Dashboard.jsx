import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
      bg: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)"
    },
    {
      text: "Travel makes one modest. You see what a tiny place you occupy in the world.",
      author: "Francis Bacon",
      bg: "linear-gradient(135deg, #e63946 0%, #f1627c 100%)"
    },
    {
      text: "Not all those who wander are lost.",
      author: "J.R.R. Tolkien",
      bg: "linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)"
    },
    {
      text: "Travel is the only thing you buy that makes you richer.",
      author: "Anonymous",
      bg: "linear-gradient(135deg, #f1627c 0%, #e63946 100%)"
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
    
    // Rotate quotes every 5 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % travelQuotes.length);
    }, 5000);

    return () => clearInterval(quoteInterval);
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

      {/* Quote Section */}
      <motion.div 
        className="quote-section"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div 
          className="quote-card"
          style={{ background: travelQuotes[currentQuote].bg }}
        >
          <Quote className="quote-icon" />
          <blockquote className="quote-text">
            "{travelQuotes[currentQuote].text}"
          </blockquote>
          <cite className="quote-author">
            — {travelQuotes[currentQuote].author}
          </cite>
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
            <h3>Your Travel Stats</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">12</div>
              <div className="stat-label">Countries Visited</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">47</div>
              <div className="stat-label">Cities Explored</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">156</div>
              <div className="stat-label">Memories Made</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">8.2k</div>
              <div className="stat-label">Miles Traveled</div>
            </div>
          </div>
        </motion.div>

        {/* Personality Insight */}
        <motion.div 
          className="personality-card"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="card-header">
            <Compass className="card-icon" />
            <h3>Your Travel Personality</h3>
          </div>
          <div className="personality-content">
            <div className="personality-insight">
              <p>{getPersonalityInsight(personalityProfile)}</p>
            </div>
            {personalityProfile?.dominantTrait && (
              <div className="dominant-trait">
                <Star className="trait-icon" />
                <span>Dominant Trait: {personalityProfile.dominantTrait}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Nostalgic Memories */}
        <motion.div 
          className="memories-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="card-header">
            <Camera className="card-icon" />
            <h3>Nostalgic Memories</h3>
          </div>
          <div className="memories-grid">
            {nostalgicPlaces.map((place, index) => (
              <div key={index} className="memory-item">
                <div className="memory-image">{place.image}</div>
                <div className="memory-content">
                  <h4>{place.name}</h4>
                  <p>{place.memory}</p>
                </div>
              </div>
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
            <h3>Plan Your Next Adventure</h3>
          </div>
          <div className="actions-content">
            <button 
              className="btn btn-primary btn-large action-btn"
              onClick={() => navigate('/plan-trip')}
            >
              <Plus size={20} />
              Plan a New Trip
            </button>
            <div className="quick-links">
              <button className="quick-link">
                <MapPin size={16} />
                View Past Trips
              </button>
              <button className="quick-link">
                <Heart size={16} />
                Saved Destinations
              </button>
              <button className="quick-link">
                <Calendar size={16} />
                Travel Calendar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
