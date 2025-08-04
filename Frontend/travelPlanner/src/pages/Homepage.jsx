import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Homepage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero bg-pattern">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="animate-slide-up">
                Your Perfect Journey
                <br />
                <span style={{color: 'var(--primary-orange)'}}>Awaits</span>
              </h1>
              <p className="hero-description animate-slide-up" style={{animationDelay: '0.2s'}}>
                Discover personalized travel experiences powered by AI. From dream destinations 
                to detailed itineraries, we craft journeys that match your unique personality 
                and preferences.
              </p>
              <div className="hero-buttons animate-slide-up" style={{animationDelay: '0.4s'}}>
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary btn-large">
                    <svg className="travel-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    Plan New Journey
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-large">
                      <svg className="travel-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="m19 8 2 2-2 2"></path>
                        <path d="m21 10-7.5-7.5L11 5l7 7"></path>
                      </svg>
                      Start Your Adventure
                    </Link>
                    <Link to="/signin" className="btn btn-secondary btn-large">
                      <svg className="travel-icon" viewBox="0 0 24 24" fill="none">
                        <path d="m15 3 4 4-4 4"></path>
                        <path d="M21 7H9"></path>
                        <path d="M9 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      </svg>
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hero-image">
              <div className="travel-illustration animate-float">
                <svg viewBox="0 0 400 300" className="illustration-svg">
                  {/* Mountain Background */}
                  <path d="M0 200 L100 120 L200 160 L300 100 L400 140 L400 300 L0 300 Z" 
                        fill="var(--accent-cream)" opacity="0.6"/>
                  
                  {/* Sun */}
                  <circle cx="320" cy="80" r="25" fill="var(--secondary-orange)" opacity="0.8"/>
                  
                  {/* Airplane */}
                  <g transform="translate(150, 100)">
                    <path d="M0 0 L30 -5 L35 0 L30 5 Z" fill="var(--primary-orange)"/>
                    <path d="M10 -5 L20 -15 L25 -10 L15 0 Z" fill="var(--primary-red)"/>
                    <path d="M10 5 L20 15 L25 10 L15 0 Z" fill="var(--primary-red)"/>
                  </g>
                  
                  {/* Clouds */}
                  <g opacity="0.4">
                    <circle cx="80" cy="60" r="15" fill="white"/>
                    <circle cx="95" cy="60" r="20" fill="white"/>
                    <circle cx="110" cy="60" r="15" fill="white"/>
                  </g>
                  
                  {/* Travel Elements */}
                  <g transform="translate(50, 180)">
                    <rect x="0" y="0" width="30" height="40" rx="5" fill="var(--primary-orange)"/>
                    <rect x="5" y="5" width="20" height="25" fill="var(--primary-white)"/>
                    <circle cx="15" cy="45" r="8" fill="var(--text-dark)"/>
                    <circle cx="25" cy="45" r="8" fill="var(--text-dark)"/>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose TravelPlanner?</h2>
            <p>Experience the future of travel planning with our AI-powered platform</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card card animate-fade-scale">
              <div className="feature-icon">
                <svg className="travel-icon" style={{width: '48px', height: '48px', color: 'var(--primary-orange)'}} viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3>AI-Powered Recommendations</h3>
              <p>Our advanced AI analyzes your preferences and personality to suggest perfect destinations and activities.</p>
            </div>

            <div className="feature-card card animate-fade-scale" style={{animationDelay: '0.2s'}}>
              <div className="feature-icon">
                <svg className="travel-icon" style={{width: '48px', height: '48px', color: 'var(--primary-red)'}} viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3>Personalized Itineraries</h3>
              <p>Get detailed day-by-day plans tailored to your travel style, budget, and interests.</p>
            </div>

            <div className="feature-card card animate-fade-scale" style={{animationDelay: '0.4s'}}>
              <div className="feature-icon">
                <svg className="travel-icon" style={{width: '48px', height: '48px', color: 'var(--secondary-orange)'}} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <h3>Real-time Updates</h3>
              <p>Stay informed with live weather updates, local events, and travel advisories for your destinations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta bg-pattern">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Explore the World?</h2>
            <p>Join thousands of travelers who trust TravelPlanner for their perfect getaways</p>
            {!isAuthenticated && (
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started Free
                </Link>
                <Link to="/signin" className="btn btn-secondary btn-large">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
