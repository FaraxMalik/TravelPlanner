import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear error on component mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page" style={{paddingTop: 0}}>
      <div className="auth-container">
        <div className="auth-content">
          {/* Left Side - Form */}
          <div className="auth-form-section">
            <div className="auth-form-wrapper">
              {/* Logo/Brand */}
              <div className="auth-brand">
                <div className="brand-icon">
                  <svg viewBox="0 0 60 60" className="brand-logo">
                    <circle cx="30" cy="30" r="25" fill="var(--gradient-sunset)"/>
                    <path d="M20 30 L30 20 L40 30 L30 40 Z" fill="white"/>
                  </svg>
                </div>
                <h2>TravelPlanner</h2>
              </div>

              {/* Form Header */}
              <div className="form-header">
                <h1>Welcome Back!</h1>
                <p>Sign in to continue your travel journey</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message animate-slide-up">
                  <svg className="travel-icon" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <circle cx="12" cy="16" r="1"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <svg className="travel-icon" viewBox="0 0 24 24" fill="none">
                        {showPassword ? (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </>
                        ) : (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-wrapper">
                    <input type="checkbox" className="checkbox-input" />
                    <span className="checkbox-custom"></span>
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary btn-large btn-full ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <svg className="travel-icon" viewBox="0 0 24 24" fill="none">
                        <path d="m15 3 4 4-4 4"/>
                        <path d="M21 7H9"/>
                        <path d="M9 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      </svg>
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="auth-footer">
                <p>
                  Don't have an account?{' '}
                  <Link to="/signup" className="auth-link">
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div className="auth-illustration-section">
            <div className="illustration-wrapper">
              <div className="illustration-content">
                <h2>Start Your Journey</h2>
                <p>Discover amazing destinations and create unforgettable memories with our AI-powered travel planning.</p>
                
                <div className="travel-stats">
                  <div className="stat-item">
                    <div className="stat-number">50K+</div>
                    <div className="stat-label">Happy Travelers</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">150+</div>
                    <div className="stat-label">Destinations</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">98%</div>
                    <div className="stat-label">Satisfaction</div>
                  </div>
                </div>
              </div>
              
              <div className="floating-elements">
                <div className="float-element plane">
                  <svg viewBox="0 0 100 100">
                    <path d="M10 50 L70 30 L80 50 L70 70 Z" fill="var(--primary-orange)"/>
                  </svg>
                </div>
                <div className="float-element location">
                  <svg viewBox="0 0 100 100">
                    <path d="M50 10 C35 10 25 25 25 40 C25 65 50 90 50 90 C50 90 75 65 75 40 C75 25 65 10 50 10 Z" fill="var(--primary-red)"/>
                    <circle cx="50" cy="40" r="10" fill="white"/>
                  </svg>
                </div>
                <div className="float-element compass">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--secondary-orange)" strokeWidth="4"/>
                    <path d="M50 20 L60 45 L50 50 L40 45 Z" fill="var(--primary-red)"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
