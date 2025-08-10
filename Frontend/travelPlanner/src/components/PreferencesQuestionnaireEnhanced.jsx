import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiAPI, preferencesAPI } from '../services/api';
import './PreferencesEnhanced.css';

const PreferencesQuestionnaire = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [personalityResult, setPersonalityResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  const QUESTIONS_PER_PAGE = 3;
  const TOTAL_PAGES = 4;

  console.log('🔄 PreferencesQuestionnaire component mounted');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      console.log('📋 Fetching questions...');
      console.log('🌐 API Base URL:', 'http://localhost:5000/api');
      const response = await preferencesAPI.getQuestions();
      console.log('📋 Questions response:', response);
      console.log('📋 Response data:', response?.data);
      console.log('📋 Response questions:', response?.data?.questions);
      
      // Try multiple possible response formats
      let questionsData = null;
      if (response && response.questions) {
        questionsData = response.questions;
      } else if (response && response.data && response.data.questions) {
        questionsData = response.data.questions;
      } else if (response && Array.isArray(response)) {
        questionsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        questionsData = response.data;
      }
      
      if (questionsData && questionsData.length > 0) {
        setQuestions(questionsData);
        console.log('✅ Questions loaded:', questionsData.length);
      } else {
        console.error('❌ Invalid questions response format:', response);
        setQuestions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching questions:', error);
      console.error('❌ Error details:', error.response);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, value) => {
    console.log('📝 Answer selected:', { questionId, value });
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    const startIndex = currentPage * QUESTIONS_PER_PAGE;
    const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, questions.length);
    const currentPageQuestions = questions.slice(startIndex, endIndex);
    
    // Check if all questions on current page are answered
    const unansweredQuestions = currentPageQuestions.filter(q => !answers[q.id]);
    
    if (unansweredQuestions.length > 0) {
      alert(`Please answer all questions on this page before proceeding. Missing: ${unansweredQuestions.length} question(s).`);
      return;
    }

    if (currentPage < TOTAL_PAGES - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getCurrentPageQuestions = () => {
    const startIndex = currentPage * QUESTIONS_PER_PAGE;
    const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, questions.length);
    return questions.slice(startIndex, endIndex);
  };

  const getTotalAnswered = () => {
    return Object.keys(answers).length;
  };

  const getPageProgress = () => {
    return ((currentPage + 1) / TOTAL_PAGES) * 100;
  };

  const handleSubmit = async () => {
    try {
      setAnalyzing(true);
      console.log('🧠 Submitting personality analysis...', answers);
      
      // Debug: Log the exact values being sent
      console.log('📊 Answer values:', Object.values(answers));
      console.log('📋 Answer mapping:', answers);
      
      const response = await aiAPI.analyzePersonality(answers);
      console.log('🎯 Personality analysis result:', response);
      
      // Refresh user data to update needsPreferences status
      await refreshUser();
      
      // Wait a moment for the analysis animation to show, then navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000); // 3 seconds to show the analyzing animation
      
    } catch (error) {
      console.error('❌ Error analyzing personality:', error);
      
      // Refresh user data and navigate even if there's an error
      await refreshUser();
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
      alert('Error analyzing your preferences. Please try again.');
    } finally {
      // Keep analyzing state true until navigation happens
      // setAnalyzing(false); // Removed this so the animation stays
    }
  };

  if (loading) {
    return (
      <div className="preferences-loading">
        <motion.div 
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Loading questions...</p>
      </div>
    );
  }

  if (analyzing) {
    return (
      <motion.div 
        className="preferences-analyzing"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="analyzing-container">
          <motion.div 
            className="analyzing-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            🧠
          </motion.div>
          <h2>Analyzing Your Travel Personality...</h2>
          <p className="analyzing-message">
            We're discovering what kind of tours you'll love! ✨
          </p>
          <div className="analyzing-steps">
            <motion.div 
              className="step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              🔍 Analyzing your preferences...
            </motion.div>
            <motion.div 
              className="step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
            >
              🎯 Identifying your travel personality...
            </motion.div>
            <motion.div 
              className="step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 }}
            >
              🌟 Preparing personalized recommendations...
            </motion.div>
          </div>
          <motion.div 
            className="progress-dots"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
            >
              •
            </motion.span>
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
            >
              •
            </motion.span>
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
            >
              •
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="preferences-error">
        <h2>❌ No Questions Available</h2>
        <p>Unable to load personality questions. Please try again later.</p>
        <button onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
      </div>
    );
  }

  if (showResults && personalityResult) {
    return (
      <motion.div 
        className="preferences-results"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="results-container">
          <motion.div 
            className="checkmark"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          >
            ✅
          </motion.div>
          <h2>Analysis Complete!</h2>
          <div className="personality-summary">
            <h3>Your Travel Personality</h3>
            <p>{personalityResult}</p>
          </div>
          <motion.p 
            className="redirect-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Redirecting to your personalized dashboard...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  const currentPageQuestions = getCurrentPageQuestions();
  const totalAnswered = getTotalAnswered();
  const pageProgress = getPageProgress();

  return (
    <div className="preferences-container">
      <div className="preferences-header">
        <h1>✨ Discover Your Travel Personality ✨</h1>
        <p>Answer 12 personalized questions across 4 beautiful pages</p>
        
        <div className="progress-section">
          <div className="page-indicators">
            {[...Array(TOTAL_PAGES)].map((_, index) => (
              <div
                key={index}
                className={`page-dot ${index <= currentPage ? 'completed' : ''} ${index === currentPage ? 'active' : ''}`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          
          <div className="progress-container">
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${pageProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="progress-text">
              Page {currentPage + 1} of {TOTAL_PAGES} • {totalAnswered} of {questions.length} answered
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          className="questions-page"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="page-header">
            <h2>Page {currentPage + 1} of {TOTAL_PAGES}</h2>
            <p className="page-subtitle">Complete all questions on this page to continue</p>
          </div>

          <div className="questions-grid">
            {currentPageQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                className="question-card"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className="question-header">
                  <div className="question-number">
                    {currentPage * QUESTIONS_PER_PAGE + index + 1}
                  </div>
                  <h3 className="question-title">{question.question}</h3>
                </div>
                
                <p className="question-text">{question.text}</p>
                {question.subtitle && (
                  <p className="question-subtitle">{question.subtitle}</p>
                )}
                
                <div className="options-grid">
                  {question.options.map((option) => (
                    <motion.button
                      key={option.value}
                      className={`option-card ${answers[question.id] === option.value ? 'selected' : ''}`}
                      onClick={() => handleAnswer(question.id, option.value)}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="option-badge">{option.value}</div>
                      <div className="option-content">
                        <span className="option-text">{option.text}</span>
                        {answers[question.id] === option.value && (
                          <motion.div
                            className="selected-indicator"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            ✓
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="navigation-section">
        <button 
          className="nav-button prev"
          onClick={handlePrevious}
          disabled={currentPage === 0}
        >
          <span className="nav-icon">←</span>
          Previous Page
        </button>
        
        <div className="page-info">
          <span className="current-page">Page {currentPage + 1}</span>
          <div className="page-dots">
            {[...Array(TOTAL_PAGES)].map((_, index) => (
              <div
                key={index}
                className={`mini-dot ${index === currentPage ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
        
        <button 
          className="nav-button next"
          onClick={handleNext}
          disabled={analyzing}
        >
          {analyzing ? (
            <>
              <motion.span 
                className="spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⟳
              </motion.span>
              Analyzing...
            </>
          ) : currentPage === TOTAL_PAGES - 1 ? (
            <>
              Complete Assessment
              <span className="nav-icon">✨</span>
            </>
          ) : (
            <>
              Next Page
              <span className="nav-icon">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PreferencesQuestionnaire;