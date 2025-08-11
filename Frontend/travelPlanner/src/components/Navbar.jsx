import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Don't show navbar on auth pages
  if (location.pathname === '/signin' || location.pathname === '/signup') {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          {/* Logo */}
          <Link to="/" className="nav-brand">
            <div className="brand-icon">
              <svg viewBox="0 0 60 60" className="brand-logo">
                <circle cx="30" cy="30" r="25" fill="var(--gradient-sunset)"/>
                <path d="M20 30 L30 20 L40 30 L30 40 Z" fill="white"/>
              </svg>
            </div>
            <span className="brand-text">TravelPlanner</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links desktop-only">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/destinations" className="nav-link">Destinations</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>

          {/* Auth Buttons */}
          <div className="nav-auth desktop-only">
            {isAuthenticated ? (
              <div className="user-menu">
                <button className="user-button" onClick={toggleMenu}>
                  <div className="user-avatar">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <span className="user-name">
                    {user?.firstName || 'User'}
                  </span>
                  <svg className="chevron-icon" viewBox="0 0 24 24" fill="none">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <div className="dropdown-menu">
                    <Link to="/dashboard" className="dropdown-item">
                      <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                      </svg>
                      Dashboard
                    </Link>
                    <Link to="/profile" className="dropdown-item">
                      <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Profile
                    </Link>
                    <Link to="/trips" className="dropdown-item">
                      <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      My Trips
                    </Link>
                    <hr className="dropdown-divider" />
                    <button onClick={handleLogout} className="dropdown-item">
                      <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none">
                        <path d="m9 21 5-5-5-5"/>
                        <path d="M20 16H9"/>
                        <path d="M5 21V5a2 2 0 0 1 2-2h4"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/signin" className="btn btn-secondary">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn mobile-only" onClick={toggleMenu}>
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none">
              {isMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav mobile-only">
            <div className="mobile-nav-links">
              <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/destinations" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Destinations
              </Link>
              <Link to="/about" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              <Link to="/contact" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
            </div>

            <div className="mobile-auth">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/trips" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                    My Trips
                  </Link>
                  <button onClick={handleLogout} className="mobile-nav-link logout-btn">
                    Logout
                  </button>
                </>
              ) : (
                <div className="mobile-auth-buttons">
                  <Link to="/signin" className="btn btn-secondary" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
