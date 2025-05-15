import React from 'react';
import './Support.css';

const Support = () => {
  return (
    <div className="support-container">
      <h2>Support</h2>
      <div className="support-card">
        <h3>Contact Us</h3>
        <p><strong>Email:</strong> support@smartinvesthub.com</p>
        <p>
          <strong>Phone:</strong>{' '}
          <a href="tel:+254736196188" aria-label="Call support at +254736196188">
            +254736196188
          </a>
        </p>
        <p><strong>Hours:</strong> Mon-Fri, 9 AM - 5 PM</p>
        <p>We're here to help! Reach out with any questions or issues.</p>
      </div>
    </div>
  );
};

export default Support;