
import React, { useState } from 'react';
import './Footer.css';

const Footer = () => {
  const [showPolicy, setShowPolicy] = useState(false);

  return (
    <footer className="main-footer white-footer">
      <div className="footer-content enhanced-footer">
        <div className="footer-section footer-links">
          <button className="footer-link policy-btn" onClick={() => setShowPolicy(true)}>
            Privacy Policy
          </button>
        </div>
        {showPolicy && (
          <div className="footer-policy-modal" onClick={() => setShowPolicy(false)}>
            <div className="footer-policy-modal-content" onClick={e => e.stopPropagation()}>
              <h3 className="footer-policy-title">Privacy Policy</h3>
              <p className="footer-policy-text">
                TravelPlanner is committed to protecting your privacy and ensuring a secure experience. We do not share your personal information with third parties except as required by law. By using our service, you consent to our data practices as described in this policy.
              </p>
              <button className="close-policy-btn" onClick={() => setShowPolicy(false)}>Close</button>
            </div>
          </div>
        )}
        <div className="footer-section footer-copyright">
          <span>&copy; {new Date().getFullYear()} TravelPlanner. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
