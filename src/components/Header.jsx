import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SITE_CONFIG } from '../data/mockData';

export const Header = ({ onToggleSidebar }) => {
  const { isLoggedIn, user, loginDemo, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isHome = location.pathname === '/' || location.pathname === '/home';

  return (
    <section className="header">
      {/* Header Top */}
      <div className="header-top">
        <div className="logo-header">
          {/* Mobile hamburger / home toggle */}
          <button 
            type="button" 
            className="btn btn-link text-white d-xl-none p-0 me-2" 
            onClick={onToggleSidebar}
            style={{ fontSize: '18px' }}
          >
            {isHome ? <i className="fas fa-bars"></i> : <i className="fas fa-home"></i>}
          </button>

          <Link to="/">
            <img 
              src={SITE_CONFIG.logo} 
              alt={SITE_CONFIG.title} 
              style={{ maxHeight: '42px', height: 'auto' }} 
            />
          </Link>
        </div>

        <div className="user-details login-btn-box d-flex align-items-center">
          {/* Download APK Link */}
          <div className="header-rules ms-3 download-apk d-none d-md-block">
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Silverbhai APK v1.9 download started!'); }}>
              <span>
                <b>Download Apk</b> <i className="fab fa-android"></i>
              </span>
            </a>
          </div>

          {!isLoggedIn ? (
            <div className="user-name d-flex align-items-center ms-3">
              <div className="d-flex me-1">
                <button
                  type="button"
                  className="btn-home-login btn-demo me-2"
                  onClick={() => loginDemo()}
                  style={{
                    background: 'linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)',
                    color: '#000',
                    fontWeight: '700',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-user-circle me-1"></i> Demo
                </button>
                <Link 
                  to="/login" 
                  className="btn-home-login me-2"
                  style={{
                    background: 'var(--bg-primary, #04A1A6)',
                    color: '#fff',
                    fontWeight: '600',
                    padding: '4px 12px',
                    borderRadius: '4px'
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-home-login"
                  style={{
                    background: 'var(--bg-secondary, #0F696E)',
                    color: '#fff',
                    fontWeight: '600',
                    padding: '4px 12px',
                    borderRadius: '4px'
                  }}
                >
                  Register
                </Link>
              </div>
            </div>
          ) : (
            <div className="user-name d-flex align-items-center dropdown ms-3 position-relative">
              {/* Wallet Info */}
              <div 
                className="user-balance-box d-flex align-items-center me-3 px-2 py-1 rounded"
                style={{ background: '#0e1215', border: '1px solid #04a1a6', fontSize: '13px' }}
              >
                <div className="me-3">
                  <span className="text-muted d-block" style={{ fontSize: '10px' }}>PTS</span>
                  <b className="text-warning">₹{user?.bal?.toLocaleString('en-IN') || '100,000'}</b>
                </div>
                <div>
                  <span className="text-muted d-block" style={{ fontSize: '10px' }}>EXP</span>
                  <b className="text-danger">₹{user?.exp?.toLocaleString('en-IN') || '0'}</b>
                </div>
              </div>

              {/* User Menu Trigger */}
              <div className="dropdown position-relative">
                <button 
                  className="btn btn-sm btn-outline-info text-white dropdown-toggle d-flex align-items-center"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ borderColor: '#04a1a6' }}
                >
                  <i className="fas fa-user me-1 text-warning"></i>
                  <span>{user?.uname || 'DemoUser'}</span>
                </button>

                {dropdownOpen && (
                  <ul 
                    className="dropdown-menu dropdown-menu-end show position-absolute end-0 mt-1 py-1 shadow"
                    style={{ background: '#1c2125', border: '1px solid #2a3239', minWidth: '180px', zIndex: 1050 }}
                  >
                    <li>
                      <span className="dropdown-item-text text-muted small pb-1 d-block border-bottom border-secondary">
                        Logged as <b>{user?.uname}</b>
                      </span>
                    </li>
                    <li>
                      <Link to="/account-statement" className="dropdown-item text-white py-2" onClick={() => setDropdownOpen(false)}>
                        <i className="fas fa-file-invoice me-2 text-info"></i> Account Statement
                      </Link>
                    </li>
                    <li>
                      <Link to="/current-bet" className="dropdown-item text-white py-2" onClick={() => setDropdownOpen(false)}>
                        <i className="fas fa-list-alt me-2 text-info"></i> Current Bets
                      </Link>
                    </li>
                    <li>
                      <Link to="/activity-log" className="dropdown-item text-white py-2" onClick={() => setDropdownOpen(false)}>
                        <i className="fas fa-history me-2 text-info"></i> Activity Log
                      </Link>
                    </li>
                    <li>
                      <Link to="/change-password" className="dropdown-item text-white py-2" onClick={() => setDropdownOpen(false)}>
                        <i className="fas fa-key me-2 text-info"></i> Change Password
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider my-1 border-secondary" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger py-2 w-100 text-start btn btn-link" 
                        onClick={() => { logout(); setDropdownOpen(false); }}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Marquee / News Ticker */}
        <div className="news">
          <marquee scrollamount="3">{SITE_CONFIG.news}</marquee>
        </div>
      </div>

      {/* Header Bottom (Desktop Nav Bar) */}
      <div className="header-bottom d-none d-xl-block">
        <nav className="navbar navbar-expand p-0">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/all-sports/4" className="nav-link">
                <i className="fas fa-baseball-ball me-1 text-warning"></i> Cricket
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/all-sports/2" className="nav-link">
                <i className="fas fa-table-tennis me-1 text-success"></i> Tennis
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/all-sports/1" className="nav-link">
                <i className="fas fa-futbol me-1 text-danger"></i> Football
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/all-sports/8" className="nav-link">
                Table Tennis
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/casino-list" className="nav-link">
                Baccarat
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/casino-list" className="nav-link">
                32 Cards
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/casino-list" className="nav-link">
                Teenpatti
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/casino-list" className="nav-link">
                Poker
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/casino-list" className="nav-link">
                Lucky 7
              </Link>
            </li>
            <li className="nav-item aviator">
              <Link to="/casino-list" className="nav-link d-flex align-items-center">
                <svg 
                  style={{ width: '22px', height: '14px', marginRight: '4px' }} 
                  viewBox="0 0 457.6 277.4"
                >
                  <path fill="#e40539" d="M61.85,273.4c-1.8-3.5-2.3-3.9-4-3-3.2,1.7-5.5,1.1-9-2.5l-3.3-3.4,4.4-1.9c2.4-1.1,8-2.2,12.4-2.6,27.1-2.5,84.1-19.2,161-47.1,32.1-11.7,80.4-30.1,81.3-31,1.2-1.2-1-1.5-11.9-1.7-10.6-.2-11.7,0-16.5,2.4-13.1,6.8-74.6,31.2-92.8,36.7l-6.9,2.1-6.4-5-6.5-4.9-3.6,1.5c-21.3,9-88,36.4-89.2,36.6-1,.2-1.6-.6-1.8-2.3-.3-2.4.5-3,7.8-6.9,4.5-2.3,7.9-4.5,7.5-4.8-.3-.4-4.3-.9-8.9-1.3-9.7-.8-17.3-4-28.2-11.9-4.8-3.5-7.8-5-10-5-4.3,0-6.4.9-6.4,2.7,0,.8,6.8,8.7,15.1,17.6,13,13.7,14.9,16.2,13.3,16.8-3.7,1.5-4.8.8-16.3-10.3-6.4-6.2-14.6-14.2-18.3-17.7l-6.7-6.5-8.8,4.2-8.8,4.2-.3-3.4c-.2-2,.2-4.4.8-5.5s6.5-4.8,13.1-8.2c11.8-6,14.2-8,12.2-10-.7-.7-4.1.5-10.2,3.5l-9.1,4.6v-2.5c0-2,1.4-3.3,7.7-7,10.3-6,17.3-8.1,22.3-6.6,2.1.6,10.7,6.3,19.1,12.6,19,14.3,29.4,19.9,35.9,19.2,5.3-.5,34-13.7,61.9-28.5,18.3-9.7,21.6-12.1,19.5-14.2" />
                </svg>
                <span className="ms-1 fw-bold text-danger">Aviator</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  );
};
