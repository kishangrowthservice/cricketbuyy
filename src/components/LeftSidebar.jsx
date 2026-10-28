import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SPORTS_CATEGORIES, RACING_SPORTS, OTHER_CASINOS } from '../data/mockData';

export const LeftSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [racingOpen, setRacingOpen] = useState(true);
  const [othersOpen, setOthersOpen] = useState(true);
  const [sportsOpen, setSportsOpen] = useState(true);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop d-xl-none"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1040
          }}
        />
      )}

      <div className={`sidebar left-sidebar ${isOpen ? 'visible' : ''}`}>
        {/* Mobile Header Inside Drawer */}
        <div className="d-xl-none d-flex justify-content-between align-items-center p-2 border-bottom border-secondary">
          <span className="fw-bold text-info"><i className="fas fa-bars me-2"></i> Menu</span>
          <button className="btn btn-sm btn-outline-secondary text-white" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* 1. Racing Sports Accordion */}
        <div className="sidebar-box">
          <div className="accordion">
            <div className="accordion-item bg-transparent border-0">
              <div 
                className="sidebar-title d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => setRacingOpen(!racingOpen)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <span>Racing Sports</span>
                <i className={`fas fa-chevron-${racingOpen ? 'up' : 'down'} text-muted small`}></i>
              </div>
              {racingOpen && (
                <div className="racing-sport">
                  <ul className="list-unstyled mb-0">
                    {RACING_SPORTS.map((sport, idx) => (
                      <li key={idx} className="nav-item">
                        <Link 
                          to={`/all-sports/${sport.sportId}`}
                          className="nav-link d-flex justify-content-between align-items-center py-2 px-3 text-white border-bottom border-dark"
                          onClick={onClose}
                        >
                          <span>
                            <i className={`${sport.icon} me-2 text-warning`}></i>
                            {sport.name}
                          </span>
                          <span className="badge bg-secondary rounded-pill">{sport.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Others / Casino Accordion */}
        <div className="sidebar-box mt-2">
          <div className="accordion">
            <div className="accordion-item bg-transparent border-0">
              <div 
                className="sidebar-title d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => setOthersOpen(!othersOpen)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <span>Others</span>
                <i className={`fas fa-chevron-${othersOpen ? 'up' : 'down'} text-muted small`}></i>
              </div>
              {othersOpen && (
                <div className="other-casino-list">
                  <ul className="list-unstyled mb-0">
                    {OTHER_CASINOS.map((item, idx) => (
                      <li key={idx} className="nav-item">
                        <Link 
                          to="/casino-list" 
                          className="nav-link py-2 px-3 text-white border-bottom border-dark d-flex align-items-center"
                          onClick={onClose}
                        >
                          <i className="fas fa-dice me-2 text-info"></i>
                          <span className={idx === 0 ? 'blink_me text-warning' : ''}>
                            {item.cname}
                          </span>
                        </Link>
                      </li>
                    ))}
                    <li className="nav-item">
                      <Link 
                        to="/casino-list" 
                        className="nav-link py-2 px-3 text-white border-bottom border-dark d-flex align-items-center"
                        onClick={onClose}
                      >
                        <i className="fas fa-plane me-2 text-danger"></i>
                        <span className="text-danger fw-bold">Aviator Crash</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. All Sports Accordion */}
        <div className="sidebar-box mt-2">
          <div className="accordion">
            <div className="accordion-item bg-transparent border-0">
              <div 
                className="sidebar-title d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => setSportsOpen(!sportsOpen)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <span>All Sports</span>
                <i className={`fas fa-chevron-${sportsOpen ? 'up' : 'down'} text-muted small`}></i>
              </div>
              {sportsOpen && (
                <div className="menu-box">
                  <ul className="list-unstyled mb-0">
                    {SPORTS_CATEGORIES.map((sport) => {
                      const isActive = location.pathname.includes(`/all-sports/${sport.id}`);
                      return (
                        <li key={sport.id} className="nav-item">
                          <Link 
                            to={`/all-sports/${sport.id}`} 
                            className={`nav-link d-flex justify-content-between align-items-center py-2 px-3 border-bottom border-dark ${isActive ? 'bg-dark text-info' : 'text-white'}`}
                            onClick={onClose}
                          >
                            <span>
                              <i className={`${sport.icon} me-2 text-info`} style={{ width: '16px' }}></i>
                              {sport.name}
                            </span>
                            <span className="badge bg-secondary rounded-pill">{sport.count}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
