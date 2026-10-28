import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SPORTS_CATEGORIES, RACING_SPORTS, OTHER_CASINOS } from '../data/mockData';

export const LeftSidebar = ({ isOpen, onClose }) => {
  const [racingOpen, setRacingOpen] = useState(true);
  const [othersOpen, setOthersOpen] = useState(true);
  const [sportsOpen, setSportsOpen] = useState(true);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
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
        {/* Mobile Close Button */}
        <div className="d-xl-none p-2 d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark">Menu</span>
          <div className="close-sidebar pointer" onClick={onClose} style={{ cursor: 'pointer' }}>
            <i className="far fa-times-circle fa-lg text-dark"></i>
          </div>
        </div>

        {/* 1. Racing Sports */}
        <div className="sidebar-box">
          <div className="accordion-item">
            <div className="sidebar-title">
              <button
                type="button"
                className={`accordion-button w-100 ${racingOpen ? '' : 'collapsed'}`}
                onClick={() => setRacingOpen(!racingOpen)}
              >
                <h4>Racing Sports</h4>
              </button>
            </div>
            {racingOpen && (
              <div className="accordion-body racing-sport">
                <ul className="list-unstyled m-0">
                  {RACING_SPORTS.map((sport, idx) => (
                    <li key={idx} className="nav-item">
                      <Link
                        to={`/all-sports/${sport.sportId}`}
                        className="nav-link d-flex justify-content-between align-items-center"
                        onClick={onClose}
                      >
                        <span>{sport.name}</span>
                        <span className="badge bg-secondary">{sport.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 2. Others */}
        <div className="sidebar-box">
          <div className="accordion-item">
            <div className="sidebar-title">
              <button
                type="button"
                className={`accordion-button w-100 ${othersOpen ? '' : 'collapsed'}`}
                onClick={() => setOthersOpen(!othersOpen)}
              >
                <h4>Others</h4>
              </button>
            </div>
            {othersOpen && (
              <div className="accordion-body other-casino-list">
                <ul className="list-unstyled m-0">
                  {OTHER_CASINOS.map((item, idx) => (
                    <li key={idx} className="nav-item">
                      <Link
                        to="/casino-list"
                        className="nav-link"
                        onClick={onClose}
                      >
                        <span className={idx < 4 ? 'blink_me' : ''}>{item.cname}</span>
                      </Link>
                    </li>
                  ))}
                  <li className="nav-item">
                    <Link to="/live-casino-list" className="nav-link" onClick={onClose}>
                      <span>Live Casino</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/slot-list" className="nav-link" onClick={onClose}>
                      <span>Slot Game</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/fantasy-list" className="nav-link" onClick={onClose}>
                      <span>Fantasy Game</span>
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 3. All Sports */}
        <div className="sidebar-box">
          <div className="accordion-item">
            <div className="sidebar-title">
              <button
                type="button"
                className={`accordion-button w-100 ${sportsOpen ? '' : 'collapsed'}`}
                onClick={() => setSportsOpen(!sportsOpen)}
              >
                <h4>All Sports</h4>
              </button>
            </div>
            {sportsOpen && (
              <div className="accordion-body menu-box">
                <ul className="list-unstyled m-0">
                  {SPORTS_CATEGORIES.map(sport => (
                    <li key={sport.id} className="nav-item">
                      <Link
                        to={`/all-sports/${sport.id}`}
                        className="nav-link d-flex justify-content-between align-items-center"
                        onClick={onClose}
                      >
                        <span>{sport.name}</span>
                        <span className="badge bg-secondary">{sport.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
