import React from 'react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../data/mockData';

export const TermsPage = () => {
  return (
    <div className="center-main-container terms-page py-4">
      <div className="center-container bg-dark p-4 rounded" style={{ border: '1px solid #29343d', maxWidth: '850px', margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-3">
          <h3 className="fs-4 text-white m-0">Terms & Conditions</h3>
          <Link to="/" className="btn btn-sm btn-outline-info">Return to Home</Link>
        </div>

        <div className="text-white-50" style={{ lineHeight: '1.7', fontSize: '14px' }}>
          <h5 className="text-white mt-3">1. Agreement to Terms</h5>
          <p>By accessing or using {SITE_CONFIG.title}, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to all of these terms, do not use this website.</p>

          <h5 className="text-white mt-3">2. Eligibility and Account Security</h5>
          <p>You must be at least 18 years of age or the legal age for gambling in your jurisdiction. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

          <h5 className="text-white mt-3">3. Betting Rules & Fair Play</h5>
          <p>All bets placed through the exchange are subject to market rules. In case of palpable errors, match abandonments, or technical anomalies, settlements will adhere strictly to standard international exchange guidelines.</p>

          <h5 className="text-white mt-3">4. Deposits and Withdrawals</h5>
          <p>All transactions are processed securely. Users are advised to only transact using authorized payment gateways or designated verified accounts.</p>

          <h5 className="text-white mt-3">5. Disclaimer and Limitation of Liability</h5>
          <p>{SITE_CONFIG.title} provides exchange services on an "as is" and "as available" basis without warranties of any kind.</p>
        </div>
      </div>
    </div>
  );
};

export const ResponsibleGamingPage = () => {
  return (
    <div className="center-main-container responsible-gaming-page py-4">
      <div className="center-container bg-dark p-4 rounded" style={{ border: '1px solid #29343d', maxWidth: '850px', margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-3">
          <h3 className="fs-4 text-warning m-0"><i className="fas fa-shield-alt me-2"></i> Responsible Gaming</h3>
          <Link to="/" className="btn btn-sm btn-outline-info">Return to Home</Link>
        </div>

        <div className="text-white-50" style={{ lineHeight: '1.7', fontSize: '14px' }}>
          <h5 className="text-white mt-3">Our Commitment</h5>
          <p>{SITE_CONFIG.title} is dedicated to promoting responsible gaming. We recognize that while gambling can be entertaining, it can also lead to difficulties for some individuals.</p>

          <h5 className="text-white mt-3">Key Principles for Safe Play</h5>
          <ul>
            <li>Treat gaming as a form of leisure, never as a guaranteed income source.</li>
            <li>Never bet money that you cannot afford to lose.</li>
            <li>Set strict personal deposit and loss limits before playing.</li>
            <li>Take frequent breaks and do not chase losses.</li>
          </ul>

          <h5 className="text-white mt-3">Underage Protection</h5>
          <p>We enforce strict age verification checks to prevent minors (under 18) from participating in real-money gaming activities.</p>

          <h5 className="text-white mt-3">Self-Exclusion and Support</h5>
          <p>If you feel your gaming is becoming problematic, please reach out to our 24X7 support team to request temporary cooling-off or permanent self-exclusion.</p>
        </div>
      </div>
    </div>
  );
};

