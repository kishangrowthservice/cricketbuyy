import React from 'react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../data/mockData';

export const Footer = () => {
  return (
    <footer className="footer footer-login mt-4 py-4 border-top border-dark" style={{ background: '#0e1215' }}>
      <div className="container">
        <div className="footer-top d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div className="footer-links mb-2 mb-md-0">
            <nav className="navbar navbar-expand p-0">
              <ul className="navbar-nav flex-wrap">
                <li className="nav-item">
                  <Link className="nav-link text-white-50 px-2" to="/terms-and-conditions">
                    Terms and Conditions
                  </Link>
                </li>
                <li className="nav-item">
                  <span className="text-muted d-flex align-items-center">|</span>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white-50 px-2" to="/responsible-gaming">
                    Responsible Gaming
                  </Link>
                </li>
                <li className="nav-item">
                  <span className="text-muted d-flex align-items-center">|</span>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white-50 px-2" to="/all-sports">
                    All Sports
                  </Link>
                </li>
                <li className="nav-item">
                  <span className="text-muted d-flex align-items-center">|</span>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white-50 px-2" to="/casino-list">
                    Casino Games
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="support-detail text-md-end text-start">
            <h5 className="fs-6 text-warning m-0">24X7 Instant Support</h5>
            <small className="text-white-50">Email: support@silverbhai.com</small>
          </div>
        </div>

        <div className="text-center text-muted small border-top border-secondary pt-3">
          <p className="mb-1">
            © {new Date().getFullYear()} <b>{SITE_CONFIG.title}</b>. All rights reserved. 
            Licensed and regulated gaming exchange platform.
          </p>
          <p className="mb-0 text-white-50" style={{ fontSize: '11px' }}>
            Warning: Online gambling involves financial risk and may be addictive. Please play responsibly. 
            Persons under 18 years of age are strictly prohibited from opening an account or betting.
          </p>
        </div>
      </div>
    </footer>
  );
};
