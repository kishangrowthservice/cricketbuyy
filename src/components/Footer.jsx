import React from 'react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../data/mockData';

export const Footer = () => {
  return (
    <section className="footer footer-login mt-auto">
      <div className="footer-top">
        <div className="footer-links">
          <nav className="navbar navbar-expand-sm">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/terms-and-conditions">
                  Terms and Conditions
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/responsible-gaming">
                  Responsible Gaming
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/all-sports">
                  All Sports
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/casino-list">
                  Casino
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="support-detail">
          <h2>24X7 Support</h2>
          <p>{SITE_CONFIG.supportNo}</p>
        </div>

        <div className="social-icons-box">
          <a
            href={SITE_CONFIG.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon me-2 text-decoration-none"
          >
            <i className="fab fa-telegram-plane text-info fa-lg"></i>
          </a>
          <a
            href={SITE_CONFIG.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon text-decoration-none"
          >
            <i className="fab fa-whatsapp text-success fa-lg"></i>
          </a>
        </div>
      </div>
      <div className="text-center py-2 text-white-50 border-top border-white-10" style={{ fontSize: '11px', borderColor: 'rgba(255,255,255,0.1)' }}>
        © 2026 {SITE_CONFIG.domain || 'Cricketbuyy.com'}. All Rights Reserved. 18+ Play Responsibly.
      </div>
    </section>
  );
};
