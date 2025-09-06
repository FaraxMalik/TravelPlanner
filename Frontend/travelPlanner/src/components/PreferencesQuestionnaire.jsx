import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sunrise, 
  Mountain, 
  Zap, 
  Coffee, 
  Shield, 
  Heart, 
  Camera, 
  Music, 
  Star, 
  Backpack,
  Users,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { preferencesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PreferencesQuestionnaire = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      id: 'morningRoutine',
      title: "What's your perfect morning start?",
      subtitle: "Let's begin this journey together! ☀️",
      icon: <Sunrise className="travel-icon" />,
      options: [
        { value: 1, text: "🌅 Early bird catches the worm! 🐦", emoji: "🌅" },
        { value: 2, text: "🌞 Rise with the sun naturally ☀️", emoji: "🌞" },
        { value: 3, text: "☕ Slow and steady morning vibes 🧘", emoji: "☕" },
        { value: 4, text: "🛌 I'll wake up when I wake up 😴", emoji: "🛌" }
      ]
    },
    {
      id: 'placePreference',
      title: "Where does your heart want to wander?",
      subtitle: "Every place has its own magic ✨",
      icon: <Mountain className="travel-icon" />,
      options: [
        { value: 1, text: "🌃 Bustling cities that never sleep 🏙", emoji: "🌃" },
        { value: 2, text: "🏡 Charming towns with stories to tell 🏘", emoji: "🏡" },
        { value: 3, text: "🏔 Nature's untouched beauty 🌿", emoji: "🏔" },
        { value: 4, text: "💎 Hidden gems off the beaten path 🗺", emoji: "💎" }
      ]
    },
    {
      id: 'travelPace',
      title: "How do you like to explore?",
      subtitle: "Travel is about the journey, not just the destination 🚀",
      icon: <Zap className="travel-icon" />,
      options: [
        { value: 1, text: "🏃 Adventure packed, no time to waste! ⚡", emoji: "🏃" },
        { value: 2, text: "🥾 Active exploration with energy 🚶", emoji: "🥾" },
        { value: 3, text: "🧘 Relaxed pace, savor each moment 🌸", emoji: "🧘" },
        { value: 4, text: "🏖 Go with the flow completely 🌊", emoji: "🏖" }
      ]
    },
    {
      id: 'foodPreferences',
      title: "What fuels your adventures?",
      subtitle: "Food is the universal language of travel! 🍕",
      icon: <Coffee className="travel-icon" />,
      options: [
        { value: 1, text: "🥟 Street food adventures! 🌮", emoji: "🥟" },
        { value: 2, text: "🍛 Local cuisines and restaurants 🍜", emoji: "🍛" },
        { value: 3, text: "🥗 Familiar foods with local twists 🍝", emoji: "🥗" },
        { value: 4, text: "☕ Quick bites, more time exploring 🥪", emoji: "☕" }
      ]
    },
    {
      id: 'backupPlanning',
      title: "When plans change unexpectedly...",
      subtitle: "Life's greatest adventures come from unexpected moments 🎭",
      icon: <Shield className="travel-icon" />,
      options: [
        { value: 1, text: "📝 I have backup plans A, B, and C! 📋", emoji: "📝" },
        { value: 2, text: "💡 Quick research and adapt 🔍", emoji: "💡" },
        { value: 3, text: "👥 Ask locals for recommendations 🗣", emoji: "👥" },
        { value: 4, text: "🎲 Wing it and see what happens! 🦋", emoji: "🎲" }
      ]
    },
    {
      id: 'memoryCapturing',
      title: "How do you capture memories?",
      subtitle: "Every memory is a treasure to keep forever 💝",
      icon: <Heart className="travel-icon" />,
      options: [
        { value: 1, text: "🖼 Unique local crafts and art 🎨", emoji: "🖼" },
        { value: 2, text: "🎒 Practical items I can use daily 👜", emoji: "🎒" },
        { value: 3, text: "💭 Photos and experiences only 📸", emoji: "💭" },
        { value: 4, text: "🎁 Whatever catches my eye spontaneously ✨", emoji: "🎁" }
      ]
    },
    {
      id: 'photographyStyle',
      title: "What's your photography vibe?",
      subtitle: "Every photo tells a story of your journey 📷",
      icon: <Camera className="travel-icon" />,
      options: [
        { value: 1, text: "✨ Perfectly planned Instagram shots 📱", emoji: "✨" },
        { value: 2, text: "💫 Candid moments and real emotions 😊", emoji: "💫" },
        { value: 3, text: "🌄 Landscapes and scenery focused 🏞", emoji: "🌄" },
        { value: 4, text: "👁 Few photos, more living in the moment 🎯", emoji: "👁" }
      ]
    },
    {
      id: 'musicPreferences',
      title: "What soundtrack accompanies your travels?",
      subtitle: "Music makes every journey more magical 🎵",
      icon: <Music className="travel-icon" />,
      options: [
        { value: 1, text: "🌍 Local music from each destination 🎶", emoji: "🌍" },
        { value: 2, text: "🔥 Upbeat travel playlist energy 🎵", emoji: "🔥" },
        { value: 3, text: "🌸 Chill and relaxing vibes 🎧", emoji: "🌸" },
        { value: 4, text: "🍃 Natural sounds and silence 🕊", emoji: "🍃" }
      ]
    },
    {
      id: 'spontaneityLevel',
      title: "How spontaneous is your spirit?",
      subtitle: "Some magic happens when you least expect it 🌟",
      icon: <Star className="travel-icon" />,
      options: [
        { value: 1, text: "📋 Detailed itinerary planned perfectly 📅", emoji: "📋" },
        { value: 2, text: "⚖️ Flexible schedule with key highlights 🗓", emoji: "⚖️" },
        { value: 3, text: "🎪 Rough plan, open to changes 🎯", emoji: "🎪" },
        { value: 4, text: "🌪 Pure spontaneity, no plans needed! 🎲", emoji: "🌪" }
      ]
    },
    {
      id: 'packingPhilosophy',
      title: "What's your packing philosophy?",
      subtitle: "Pack your dreams, not just your clothes! 🧳",
      icon: <Backpack className="travel-icon" />,
      options: [
        { value: 1, text: "📐 Everything organized and labeled 📦", emoji: "📐" },
        { value: 2, text: "✅ Essential items neatly packed 🎒", emoji: "✅" },
        { value: 3, text: "🌟 Pack light, buy what I need 🛍", emoji: "🌟" },
        { value: 4, text: "🎪 Throw everything in and go! 🌀", emoji: "🎪" }
      ]
    },
    {
      id: 'groupDynamics',
      title: "In a group, you're usually the...",
      subtitle: "Every traveler brings something special to the group 👫",
      icon: <Users className="travel-icon" />,
      options: [
        { value: 1, text: "👑 Planner who organizes everything 📊", emoji: "👑" },
        { value: 2, text: "🗺 Navigator who finds the way 🧭", emoji: "🗺" },
        { value: 3, text: "🌟 Mood booster keeping spirits high 🎉", emoji: "🌟" },
        { value: 4, text: "🦋 Free spirit going with the flow 🌊", emoji: "🦋" }
      ]
    },
    {
      id: 'memorableElements',
      title: "What makes a trip truly unforgettable?",
      subtitle: "The best journeys touch your soul forever 💖",
      icon: <Sparkles className="travel-icon" />,
      options: [
        { value: 1, text: "💕 Meeting amazing people and connections 🤝", emoji: "💕" },
        { value: 2, text: "✨ Unique experiences I can't get at home 🎭", emoji: "✨" },
        { value: 3, text: "😍 Beautiful places that take my breath away 🌅", emoji: "😍" },
        { value: 4, text: "🦋 Personal growth and self-discovery 🌱", emoji: "🦋" }
      ]
    }
  ];

  // Group questions into pages of 3
  const questionsPerPage = 3;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  
  const getCurrentPageQuestions = () => {
    const startIndex = currentPage * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    return questions.slice(startIndex, endIndex);
  };

  const handleAnswerSelect = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      submitPreferences();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const isPageComplete = () => {
    const currentQuestions = getCurrentPageQuestions();
    return currentQuestions.every(q => answers[q.id] !== undefined);
  };

  const submitPreferences = async () => {
    setIsLoading(true);
    try {
      const response = await preferencesAPI.submitPreferences(answers);
      if (response.data.success) {
        setShowResult(true);
        
        // Refresh user data to update needsPreferences status
        await refreshUser();
        
        // Wait 3 seconds then navigate to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting preferences:', error);
      // Refresh user data and navigate to dashboard even if there's an error
      await refreshUser();
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
    setIsLoading(false);
  };

  const currentPageQuestions = getCurrentPageQuestions();
  const overallProgress = ((currentPage + 1) / totalPages) * 100;
  const answeredQuestionsOnPage = currentPageQuestions.filter(q => answers[q.id] !== undefined).length;

  if (showResult) {
    return (
      <div className="preferences-container">
        <motion.div 
          className="preferences-card result-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="result-content">
            <motion.div 
              className="result-icon"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ✨
            </motion.div>
            <h2>Analyzing Your Travel Personality...</h2>
            <p>We're creating your personalized travel profile!</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="preferences-container bg-pattern">
      {/* Journey Progress Header */}
      <div className="preferences-progress">
        <div className="progress-bar">
          <motion.div 
            className="progress-fill"
            style={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="progress-text">
          Journey Step {currentPage + 1} of {totalPages} • {answeredQuestionsOnPage}/{currentPageQuestions.length} completed
        </span>
      </div>

      {/* Travel Journey Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          className="journey-container"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Journey Header */}
          <div className="journey-header">
            <h1 className="journey-title">Your Travel Journey</h1>
            <p className="journey-subtitle">
              Step {currentPage + 1}: Discovering your travel personality ✨
            </p>
          </div>

          {/* Travel Path with Connected Questions */}
          <div className="travel-path">
            {/* Decorative Elements */}
            <div className="path-decorations">
              <div className="cloud cloud-1">☁️</div>
              <div className="cloud cloud-2">☁️</div>
              <div className="plane">✈️</div>
            </div>

            {/* Journey Path Line */}
            <div className="journey-path-line">
              <svg className="path-svg" viewBox="0 0 6 1000" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3,50 L3,950"
                  stroke="url(#journey-gradient-vertical)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray="20,12"
                  className="animated-path"
                />
                <defs>
                  <linearGradient id="journey-gradient-vertical" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.8"/>
                    <stop offset="30%" stopColor="#ff9a00" stopOpacity="1"/>
                    <stop offset="70%" stopColor="#ff9a00" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.9"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Question Stops */}
            <div className="question-stops">
              {currentPageQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  className={`question-stop ${answers[question.id] ? 'completed' : ''}`}
                  initial={{ y: 50, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
                >
                  {/* Question Marker */}
                  <div className="question-marker">
                    <div className="marker-icon">
                      {question.icon}
                    </div>
                    <div className="marker-number">
                      {currentPage * questionsPerPage + index + 1}
                    </div>
                  </div>

                  {/* Question Card */}
                  <div className="journey-question-card">
                    <div className="question-content">
                      <h3 className="question-title">{question.title}</h3>
                      <p className="question-subtitle">{question.subtitle}</p>
                    </div>

                    {/* Options */}
                    <div className="question-options">
                      {question.options.map((option, optIndex) => (
                        <motion.button
                          key={option.value}
                          className={`journey-option ${answers[question.id] === option.value ? 'selected' : ''}`}
                          onClick={() => handleAnswerSelect(question.id, option.value)}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: (index * 0.2) + (optIndex * 0.1) + 0.3 }}
                          whileHover={{ scale: 1.05, y: -3 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="option-emoji">{option.emoji}</span>
                          <span className="option-text">{option.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Journey Connection Line to Next Question */}
                  {index < currentPageQuestions.length - 1 && (
                    <div className="journey-connector">
                      <svg className="connector-svg" viewBox="0 0 4 80" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M2,10 L2,70"
                          stroke="url(#connector-gradient)"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray="8,6"
                          className="connector-path"
                        />
                        <defs>
                          <linearGradient id="connector-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.9"/>
                            <stop offset="50%" stopColor="#ff9a00" stopOpacity="1"/>
                            <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.8"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="journey-arrow">
                        <motion.div
                          animate={{ y: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          ⬇️
                        </motion.div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Journey Navigation */}
          <div className="journey-navigation">
            <button 
              className="btn btn-secondary journey-btn"
              onClick={prevPage}
              disabled={currentPage === 0}
            >
              <ArrowLeft size={20} />
              Previous Step
            </button>

            <div className="journey-progress-dots">
              {Array.from({ length: totalPages }, (_, index) => (
                <div 
                  key={index}
                  className={`progress-dot ${index === currentPage ? 'active' : ''} ${index < currentPage ? 'completed' : ''}`}
                />
              ))}
            </div>

            <button 
              className="btn btn-primary journey-btn"
              onClick={nextPage}
              disabled={!isPageComplete() || isLoading}
            >
              {currentPage === totalPages - 1 ? (
                isLoading ? 'Completing Journey...' : 'Complete Journey 🎯'
              ) : (
                <>
                  Next Step
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

export default PreferencesQuestionnaire;
