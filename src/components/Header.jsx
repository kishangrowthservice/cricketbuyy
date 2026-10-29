import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SITE_CONFIG, MATCHES_DATA } from '../data/mockData';

export const Header = ({ onToggleSidebar }) => {
  const { isLoggedIn, user, loginDemo, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showButtonsModal, setShowButtonsModal] = useState(false);
  const [stakeButtons, setStakeButtons] = useState([100, 500, 1000, 5000, 10000, 25000]);
  const [tempButtons, setTempButtons] = useState([100, 500, 1000, 5000, 10000, 25000]);
  const searchInputRef = useRef(null);

  const isHome = location.pathname === '/' || location.pathname === '/home';

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 50);
    }
  };

  const filteredSearchResults = searchQuery.trim().length >= 2
    ? MATCHES_DATA.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSaveButtons = (e) => {
    e.preventDefault();
    setStakeButtons([...tempButtons]);
    setShowButtonsModal(false);
  };

  return (
    <section className="header">
      {/* Header Top */}
      <div className="header-top">
        {/* Logo and Mobile Hamburger */}
        <div className="logo-header">
          <Link
            to={isHome ? "#" : "/"}
            className="d-xl-none text-white text-decoration-none"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                onToggleSidebar();
              }
            }}
          >
            {isHome ? <i className="fas fa-bars me-2"></i> : <i className="fas fa-home me-1"></i>}
          </Link>

          <Link to="/">
            <img src={SITE_CONFIG.logo} alt="SILVERBHAI" />
          </Link>
        </div>

        {/* User Details & Controls */}
        <div className="user-details">
          {/* Desktop Search */}
          <div className="search-box-container d-none d-xl-block position-relative">
            <div className="search-box">
              <input
                type="search"
                ref={searchInputRef}
                placeholder="Search here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`form-control ${searchOpen ? 'search-input-show' : ''}`}
              />
              <a onClick={toggleSearch} style={{ cursor: 'pointer' }}>
                <i className="fas fa-search-plus"></i>
              </a>

              {/* Search dropdown results */}
              {searchQuery.trim().length >= 2 && (
                <div className="search-list shadow" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1100, background: '#1c2125', width: '280px', maxHeight: '300px', overflowY: 'auto' }}>
                  <div className="search-game-name p-2 border-bottom border-dark text-muted small">
                    <b>Matches ({filteredSearchResults.length})</b>
                  </div>
                  {filteredSearchResults.length === 0 ? (
                    <div className="p-2 text-white small">No matches found</div>
                  ) : (
                    filteredSearchResults.map((m, idx) => (
                      <Link
                        key={idx}
                        to={`/game-details/${m.sportId}/${m.id}`}
                        onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                        className="text-decoration-none"
                      >
                        <div className="search-list-item p-2 border-bottom border-dark text-white hover-bg-dark">
                          <div className="search-tournament-name fw-bold small text-info">{m.tournament}</div>
                          <div className="search-game-date small">{m.name}</div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Rules and APK Download */}
          <div className="header-rules ms-3">
            <div>
              <a
                className="rules-link pointer"
                onClick={() => setShowRulesModal(true)}
                style={{ cursor: 'pointer' }}
              >
                <b>Rules</b>
              </a>
            </div>
            <div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Silverbhai APK v1.9 download started!');
                }}
              >
                <span>
                  <b>Download Apk</b> <i className="fab fa-android"></i>
                </span>
              </a>
            </div>
          </div>

          {/* Wallet / Auth Display */}
          {isLoggedIn ? (
            <>
              <div className="user-balance ms-1 ms-xl-3">
                <div>
                  <span>Balance: </span>
                  <b>{user?.bal ? `₹${user.bal.toLocaleString('en-IN')}` : '₹1,00,000'}</b>
                </div>
                <div>
                  <span>Exp: </span>
                  <b className="pointer">{user?.exp ? `₹${user.exp.toLocaleString('en-IN')}` : '0'}</b>
                </div>
              </div>

              {/* User Account Dropdown */}
              <div className="user-name ms-3 position-relative">
                <div
                  className="pointer text-white fw-bold d-flex align-items-center py-1 px-2 rounded"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.2)' }}
                >
                  <i className="fas fa-user-circle me-1 text-warning"></i>
                  <span>{user?.uname || 'demouser'}</span>
                  <i className="fas fa-chevron-down ms-1" style={{ fontSize: '11px' }}></i>
                </div>

                {dropdownOpen && (
                  <ul
                    className="dropdown-menu show shadow position-absolute end-0 mt-2 py-0 border-0"
                    style={{
                      zIndex: 1050,
                      background: '#1c2125',
                      minWidth: '220px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                  >
                    <li className="p-2 border-bottom border-secondary text-light small d-flex align-items-center justify-content-between">
                      <span>Signed in as <b>{user?.uname || 'demouser'}</b></span>
                      <span className="badge bg-success" style={{ fontSize: '10px' }}>Active</span>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item text-white py-2"
                        to="/account-statement"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="fas fa-file-invoice-dollar me-2 text-info"></i> Account Statement
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item text-white py-2"
                        to="/current-bet"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="fas fa-list-alt me-2 text-warning"></i> Current Bets
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item text-white py-2"
                        to="/casino-results"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="fas fa-dice me-2 text-success"></i> Casino Results
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item text-white py-2"
                        to="/deposit-statement"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="fas fa-arrow-circle-down me-2 text-primary"></i> Deposit Statement
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item text-white py-2"
                        to="/withdraw-statement"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="fas fa-arrow-circle-up me-2 text-danger"></i> Withdraw Statement
                      </Link>
                    </li>
                    <li>
                      <a
                        className="dropdown-item text-white py-2 pointer"
                        onClick={() => {
                          setDropdownOpen(false);
                          setShowButtonsModal(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="fas fa-cog me-2 text-info"></i> Set Button Values
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item text-white py-2 pointer"
                        onClick={() => {
                          setDropdownOpen(false);
                          setShowRulesModal(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="fas fa-book me-2 text-secondary"></i> Rules
                      </a>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item text-white py-2"
                        to="/terms-and-conditions"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="fas fa-file-contract me-2 text-secondary"></i> Terms &amp; Conditions
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item text-white py-2"
                        to="/responsible-gaming"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="fas fa-shield-alt me-2 text-success"></i> Responsible Gaming
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item text-danger py-2 border-top border-secondary w-100 text-start bg-transparent"
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className="user-details-auth ms-3 d-flex align-items-center">
              <button
                type="button"
                className="btn btn-warning btn-sm me-2 fw-bold text-dark px-3"
                onClick={loginDemo}
              >
                Demo ID
              </button>
              <Link to="/login" className="btn btn-outline-light btn-sm me-2 px-3">
                Login
              </Link>
              <Link to="/register" className="btn btn-light btn-sm px-3">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="search-box-container d-xl-none px-2 py-1 bg-dark">
        <div className="search-box position-relative">
          <input
            type="search"
            placeholder="Search here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ height: '32px', fontSize: '13px' }}
          />
          {searchQuery.trim().length >= 2 && (
            <div className="search-list shadow" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1100, background: '#1c2125', width: '100%', maxHeight: '250px', overflowY: 'auto' }}>
              {filteredSearchResults.map((m, idx) => (
                <Link
                  key={idx}
                  to={`/game-details/${m.sportId}/${m.id}`}
                  onClick={() => setSearchQuery('')}
                  className="text-decoration-none"
                >
                  <div className="p-2 border-bottom border-dark text-white">
                    <div className="fw-bold small text-info">{m.tournament}</div>
                    <div className="small">{m.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* News Marquee */}
      <div className="news">
        <marquee scrollamount="3">
          {SITE_CONFIG.news}
        </marquee>
      </div>

      {/* Header Bottom Navbar (Desktop) */}
      <div className="header-bottom d-none d-xl-block">
        <nav className="navbar navbar-expand p-0">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/all-sports/33" className="nav-link">Lottery</Link>
            </li>
            <li className="nav-item">
              <Link to="/all-sports/4" className="nav-link">Cricket</Link>
            </li>
            <li className="nav-item">
              <Link to="/all-sports/2" className="nav-link">Tennis</Link>
            </li>
            <li className="nav-item">
              <Link to="/all-sports/1" className="nav-link">Football</Link>
            </li>
            <li className="nav-item">
              <Link to="/all-sports/8" className="nav-link">Table Tennis</Link>
            </li>
            <li className="nav-item">
              <Link to="/casino-list/LC/4/22" className="nav-link">Baccarat</Link>
            </li>
            <li className="nav-item">
              <Link to="/casino-list/LC/4/24" className="nav-link">32 Cards</Link>
            </li>
            <li className="nav-item">
              <Link to="/casino-list/LC/4/20" className="nav-link">Teenpatti</Link>
            </li>
            <li className="nav-item">
              <Link to="/casino-list/LC/4/21" className="nav-link">Poker</Link>
            </li>
            <li className="nav-item">
              <Link to="/casino-list/LC/4/27" className="nav-link">Lucky 7</Link>
            </li>
            <li className="nav-item aviator">
              <Link to="/aviator-list" className="nav-link d-flex align-items-center">
                <svg
                  id="Layer_2"
                  data-name="Layer 2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 457.6 277.4"
                  style={{ height: '18px', width: 'auto', display: 'inline-block' }}
                >
                  <defs>
                    <style>{".cls-1 { fill: #e40539; }"}</style>
                  </defs>
                  <g id="Layer_1-2" data-name="Layer 1">
                    <path
                      className="cls-1"
                      d="M61.85,273.4c-1.8-3.5-2.3-3.9-4-3-3.2,1.7-5.5,1.1-9-2.5l-3.3-3.4,4.4-1.9c2.4-1.1,8-2.2,12.4-2.6,27.1-2.5,84.1-19.2,161-47.1,32.1-11.7,80.4-30.1,81.3-31,1.2-1.2-1-1.5-11.9-1.7-10.6-.2-11.7,0-16.5,2.4-13.1,6.8-74.6,31.2-92.8,36.7l-6.9,2.1-6.4-5-6.5-4.9-3.6,1.5c-21.3,9-88,36.4-89.2,36.6-1,.2-1.6-.6-1.8-2.3-.3-2.4.5-3,7.8-6.9,4.5-2.3,7.9-4.5,7.5-4.8-.3-.4-4.3-.9-8.9-1.3-9.7-.8-17.3-4-28.2-11.9-4.8-3.5-7.8-5-10-5-4.3,0-6.4.9-6.4,2.7,0,.8,6.8,8.7,15.1,17.6,13,13.7,14.9,16.2,13.3,16.8-3.7,1.5-4.8.8-16.3-10.3-6.4-6.2-14.6-14.2-18.3-17.7l-6.7-6.5-8.8,4.2-8.8,4.2-.3-3.4c-.2-2,.2-4.4.8-5.5s6.5-4.8,13.1-8.2c11.8-6,14.2-8,12.2-10-.7-.7-4.1.5-10.2,3.5l-9.1,4.6v-2.5c0-2,1.4-3.3,7.7-7,10.3-6,17.3-8.1,22.3-6.6,2.1.6,10.7,6.3,19.1,12.6,19,14.3,29.4,19.9,35.9,19.2,5.3-.5,34-13.7,61.9-28.5,18.3-9.7,21.6-12.1,19.5-14.2-.7-.7-7.1,1.8-21.4,8.5-14.7,7-20.5,9.3-21.1,8.4-1.2-2-.1-3.3,5.6-6.3,3-1.6,5.5-3.4,5.5-4,0-.7-1.3-2.5-2.8-4l-2.9-2.7-19.8,9.6c-10.9,5.2-20,9.3-20.2,9.1-.8-.7,2.5-12.8,3.8-14.1.8-.8,9.5-5.6,19.4-10.8,17.7-9.4,18-9.6,17.8-12.7,0-1.7-.4-3.4-.7-3.7s-3.9.9-8,2.7l-7.4,3.3-8.9-9.3c-4.8-5.1-8.9-9.6-9.1-10-.5-1.4,8.8-7.9,14.6-10.1"
                    />
                  </g>
                </svg>
                <span className="ms-1 fw-bold text-danger">Crash</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Set Button Values Modal */}
      {showButtonsModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1200 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: '#1c2125', color: '#fff', border: '1px solid var(--bg-primary, #941b2c)' }}>
              <div className="modal-header" style={{ background: 'var(--bg-primary, #941b2c)' }}>
                <h5 className="modal-title fw-bold">Set Button Values</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowButtonsModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSaveButtons}>
                <div className="modal-body">
                  <p className="small text-muted mb-3">Customize quick stake button amounts for your bet slip:</p>
                  <div className="row g-2">
                    {tempButtons.map((btnVal, idx) => (
                      <div className="col-4" key={idx}>
                        <label className="small text-muted">Button {idx + 1}</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={btnVal}
                          onChange={(e) => {
                            const updated = [...tempButtons];
                            updated[idx] = Number(e.target.value) || 0;
                            setTempButtons(updated);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowButtonsModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1200 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ background: '#1c2125', color: '#fff', border: '1px solid var(--bg-primary, #941b2c)' }}>
              <div className="modal-header" style={{ background: 'var(--bg-primary, #941b2c)' }}>
                <h5 className="modal-title fw-bold">Rules &amp; Regulations</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowRulesModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', fontSize: '13px', lineHeight: '1.6' }}>
                <h6 className="fw-bold text-info">General Exchange Betting Rules</h6>
                <p>1. If a ball is not bowled during a competition, tournament, or match, all bets on that event shall be voided unless specified otherwise.</p>
                <p>2. Penalty runs added after match completion will not count toward completed over markets.</p>
                <p>3. In the event of a tie, standard dead heat rules apply where stake is split proportionately.</p>
                <h6 className="fw-bold text-info mt-3">Fancy &amp; Bookmaker Markets</h6>
                <p>1. Once a bet is placed and confirmed in Fancy/Bookmaker, it cannot be canceled.</p>
                <p>2. Company reserves the right to suspend or void any market due to suspicious activity, technical feeds failure, or erroneous odds feed.</p>
              </div>
              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowRulesModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
