import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const showFooterSection = location.pathname === '/about' || location.pathname === '/contact';

  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section">
          <Link to="/about" className="footer-link">About</Link>
          <Link to="/contact" className="footer-link">Contact</Link>
        </div>
        <div className="footer-section">
          <span>Made by <strong>Ahmer Nadeem</strong></span>
          <span className="footer-semester">This was the semester project.</span>
        </div>
      </div>
      {showFooterSection && location.pathname === '/about' && (
        <div className="footer-popup">
          <h3>About</h3>
          <p>This was the semester project for the course.<br/>TravelPlanner is an AI-powered travel planning app designed to help users create personalized journeys.</p>
        </div>
      )}
      {showFooterSection && location.pathname === '/contact' && (
        <div className="footer-popup">
          <h3>Contact</h3>
          <p>This project was made by <strong>Ahmer Nadeem</strong>.<br/>For any queries, please reach out via email or the provided contact form.</p>
        </div>
      )}
    </footer>
  );
};

export default Footer;
