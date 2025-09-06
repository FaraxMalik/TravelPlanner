import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import images
import travelImage1 from '../img/1.jpg';
import travelImage2 from '../img/2.jpg';
import travelImage3 from '../img/3.jpg';
import travelImage4 from '../img/4.jpg';
import travelImage5 from '../img/5.jpg';
import travelImage6 from '../img/6.jpg';
import travelImage7 from '../img/7.png';
import travelImage8 from '../img/8.png';
import travelImage9 from '../img/9.png';
import travelImage10 from '../img/10.jpg';

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
                    <Link to="/signup" className="btn btn-primary btn-large">
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
          
          <div className="features-grid modern-features">
            <div className="feature-card card animate-fade-scale">
              <div className="feature-icon gradient-bg">
                <svg className="travel-icon" style={{width: '48px', height: '48px'}} viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#orangeGradient)" strokeWidth="2" fill="none"/>
                  <defs>
                    <linearGradient id="orangeGradient" x1="0" y1="0" x2="24" y2="24">
                      <stop stopColor="#ff9966"/>
                      <stop offset="1" stopColor="#ff5e62"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 className="feature-title">AI-Powered Recommendations</h3>
              <p className="feature-desc">Our advanced AI analyzes your preferences and personality to suggest perfect destinations and activities.</p>
            </div>

            <div className="feature-card card animate-fade-scale" style={{animationDelay: '0.2s'}}>
              <div className="feature-icon gradient-bg">
                <svg className="travel-icon" style={{width: '48px', height: '48px'}} viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="url(#pinkGradient)" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="10" r="3" stroke="url(#pinkGradient)" strokeWidth="2" fill="none"/>
                  <defs>
                    <linearGradient id="pinkGradient" x1="0" y1="0" x2="24" y2="24">
                      <stop stopColor="#ff5e62"/>
                      <stop offset="1" stopColor="#ff9966"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 className="feature-title">Personalized Itineraries</h3>
              <p className="feature-desc">Get detailed day-by-day plans tailored to your travel style, budget, and interests.</p>
            </div>

            <div className="feature-card card animate-fade-scale" style={{animationDelay: '0.4s'}}>
              <div className="feature-icon gradient-bg">
                <svg className="travel-icon" style={{width: '48px', height: '48px'}} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="url(#yellowGradient)" strokeWidth="2" fill="none"/>
                  <polyline points="12,6 12,12 16,14" stroke="url(#yellowGradient)" strokeWidth="2" fill="none"/>
                  <defs>
                    <linearGradient id="yellowGradient" x1="0" y1="0" x2="24" y2="24">
                      <stop stopColor="#ffd86a"/>
                      <stop offset="1" stopColor="#ff9966"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 className="feature-title">Real-time Updates</h3>
              <p className="feature-desc">Stay informed with live weather updates, local events, and travel advisories for your destinations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Gallery Section */}
      <section className="travel-gallery-section">
        <div className="container">
          <div className="section-header">
            <h2>Discover Amazing Destinations</h2>
            <p>From breathtaking landscapes to vibrant cultures, explore the world with us</p>
          </div>
          
          <div className="travel-gallery">
            <div className="gallery-item large animate-fade-scale">
              <img src={travelImage1} alt="Beautiful mountain landscape" />
              <div className="gallery-overlay">
                <div className="overlay-content">
                  <h3>Mountain Adventures</h3>
                  <p>Discover breathtaking peaks and pristine wilderness</p>
                </div>
              </div>
            </div>
            
            <div className="gallery-item animate-fade-scale" style={{animationDelay: '0.2s'}}>
              <img src={travelImage2} alt="Coastal paradise" />
              <div className="gallery-overlay">
                <div className="overlay-content">
                  <h3>Coastal Escapes</h3>
                  <p>Relax by crystal clear waters</p>
                </div>
              </div>
            </div>
            
            <div className="gallery-item animate-fade-scale" style={{animationDelay: '0.4s'}}>
              <img src={travelImage3} alt="Cultural experiences" />
              <div className="gallery-overlay">
                <div className="overlay-content">
                  <h3>Cultural Journeys</h3>
                  <p>Immerse in local traditions</p>
                </div>
              </div>
            </div>
            
            <div className="gallery-item animate-fade-scale" style={{animationDelay: '0.6s'}}>
              <img src={travelImage4} alt="Urban exploration" />
              <div className="gallery-overlay">
                <div className="overlay-content">
                  <h3>City Adventures</h3>
                  <p>Explore vibrant urban landscapes</p>
                </div>
              </div>
            </div>
            
            <div className="gallery-item animate-fade-scale" style={{animationDelay: '0.8s'}}>
              <img src={travelImage5} alt="Scenic landscapes" />
              <div className="gallery-overlay">
                <div className="overlay-content">
                  <h3>Natural Wonders</h3>
                  <p>Experience stunning landscapes</p>
                </div>
              </div>
            </div>
            
            <div className="gallery-item animate-fade-scale" style={{animationDelay: '1.0s'}}>
              <img src={travelImage6} alt="Historic destinations" />
              <div className="gallery-overlay">
                <div className="overlay-content">
                  <h3>Historic Sites</h3>
                  <p>Step back in time and explore history</p>
                </div>
              </div>
            </div>
            
            <div className="gallery-item animate-fade-scale" style={{animationDelay: '1.2s'}}>
              <img src={travelImage7} alt="Luxury experiences" />
              <div className="gallery-overlay">
                <div className="overlay-content">
                  <h3>Luxury Getaways</h3>
                  <p>Indulge in premium travel experiences</p>
                </div>
              </div>
            </div>
            
            <div className="gallery-item animate-fade-scale" style={{animationDelay: '1.4s'}}>
              <img src={travelImage8} alt="Adventure activities" />
              <div className="gallery-overlay">
                <div className="overlay-content">
                  <h3>Thrilling Adventures</h3>
                  <p>Get your adrenaline pumping</p>
                </div>
              </div>
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
                <Link to="/signup" className="btn btn-primary btn-large">
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
