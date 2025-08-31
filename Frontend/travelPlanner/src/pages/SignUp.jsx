import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const { register, loading, error, isAuthenticated, clearError } = useAuth();
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

  // Password strength calculation
  useEffect(() => {
    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return strength;
    };

    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password
    });

    if (result.success) {
      setSuccessMessage('Registration successful! Please sign in to continue.');
      // Clear the form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      // Redirect to sign-in page after 2 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return '#e63946';
      case 2: return '#f77f00';
      case 3: return '#fcbf49';
      case 4:
      case 5: return '#06d6a0';
      default: return '#e9ecef';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4:
      case 5: return 'Strong';
      default: return '';
    }
  };

  return (
    <div className="auth-page">
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
                <h1>Create Your Account</h1>
                <p>Join thousands of travelers planning perfect journeys</p>
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

              {/* Success Message */}
              {successMessage && (
                <div className="success-message animate-slide-up">
                  <svg className="travel-icon" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  {successMessage}
                </div>
              )}

              {/* Sign Up Form */}
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      First Name
                    </label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`form-input ${errors.firstName ? 'error' : ''}`}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      Last Name
                    </label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`form-input ${errors.lastName ? 'error' : ''}`}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                  </div>
                </div>

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
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  {errors.email && <span className="error-text">{errors.email}</span>}
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
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Create a password"
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
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className="strength-fill"
                          style={{
                            width: `${(passwordStrength / 5) * 100}%`,
                            backgroundColor: getPasswordStrengthColor()
                          }}
                        ></div>
                      </div>
                      <span className="strength-text" style={{color: getPasswordStrengthColor()}}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                  )}
                  
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <circle cx="12" cy="16" r="1"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <svg className="travel-icon" viewBox="0 0 24 24" fill="none">
                        {showConfirmPassword ? (
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
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>

                <div className="form-group">
                  <label className="checkbox-wrapper">
                    <input type="checkbox" className="checkbox-input" required />
                    <span className="checkbox-custom"></span>
                    I agree to the{' '}
                    <Link to="/terms" className="auth-link">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="auth-link">Privacy Policy</Link>
                  </label>
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary btn-large btn-full ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <svg className="travel-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="m19 8 2 2-2 2"/>
                        <path d="m21 10-7.5-7.5L11 5l7 7"/>
                      </svg>
                      Create Account
                    </>
                  )}
                </button>
              </form>



              {/* Sign In Link */}
              <div className="auth-footer">
                <p>
                  Already have an account?{' '}
                  <Link to="/signin" className="auth-link">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div className="auth-illustration-section">
            <div className="illustration-wrapper">
              <div className="illustration-content">
                <h2>Begin Your Adventure</h2>
                <p>Create personalized travel experiences with our AI-powered recommendations and join a community of passionate travelers.</p>
                
                <div className="feature-highlights">
                  <div className="highlight-item">
                    <svg className="highlight-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <span>AI-Powered Planning</span>
                  </div>
                  <div className="highlight-item">
                    <svg className="highlight-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>Personalized Itineraries</span>
                  </div>
                  <div className="highlight-item">
                    <svg className="highlight-icon" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span>Real-time Updates</span>
                  </div>
                </div>
              </div>
              
              <div className="floating-elements">
                <div className="float-element passport">
                  <svg viewBox="0 0 100 100">
                    <rect x="20" y="15" width="60" height="70" rx="5" fill="var(--primary-red)"/>
                    <rect x="25" y="20" width="50" height="40" fill="white"/>
                    <circle cx="50" cy="35" r="8" fill="var(--primary-orange)"/>
                  </svg>
                </div>
                <div className="float-element luggage">
                  <svg viewBox="0 0 100 100">
                    <rect x="25" y="30" width="50" height="60" rx="5" fill="var(--secondary-orange)"/>
                    <rect x="45" y="20" width="10" height="10" fill="var(--text-dark)"/>
                    <circle cx="35" cy="95" r="5" fill="var(--text-dark)"/>
                    <circle cx="65" cy="95" r="5" fill="var(--text-dark)"/>
                  </svg>
                </div>
                <div className="float-element globe">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" fill="none" stroke="var(--primary-orange)" strokeWidth="3"/>
                    <path d="M20 50 Q50 20 80 50 Q50 80 20 50" fill="none" stroke="var(--primary-red)" strokeWidth="2"/>
                    <path d="M50 15 Q70 50 50 85 Q30 50 50 15" fill="none" stroke="var(--primary-red)" strokeWidth="2"/>
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

export default SignUp;
