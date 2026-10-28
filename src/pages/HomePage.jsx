import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NEW_EVENTS, MATCHES_DATA, CASINO_GAMES, SPORTS_CATEGORIES } from '../data/mockData';
import { useBetSlip } from '../context/BetSlipContext';

export const HomePage = () => {
  const [selectedSportTab, setSelectedSportTab] = useState('all'); // 'all' | 4 | 1 | 2 | 7 | 8
  const [selectedCasinoCategory, setSelectedCasinoCategory] = useState('all');
  const { selectBet } = useBetSlip();
  const navigate = useNavigate();

  // Filter matches by sport
  const filteredMatches = selectedSportTab === 'all'
    ? MATCHES_DATA
    : selectedSportTab === 'inplay'
      ? MATCHES_DATA.filter(m => m.isInPlay)
      : MATCHES_DATA.filter(m => m.sportId === Number(selectedSportTab));

  // Filter casino games
  const filteredCasino = selectedCasinoCategory === 'all'
    ? CASINO_GAMES
    : CASINO_GAMES.filter(g => g.category === selectedCasinoCategory);

  const handleOddsClick = (match, selection, type, odds) => {
    if (!odds || odds === '-') return;
    selectBet({
      matchId: match.id,
      matchName: match.name,
      selection: selection,
      type: type,
      odds: odds
    });
  };

  return (
    <div className="center-main-container home-page">
      <div className="center-container">
        {/* Latest Events Ticker */}
        {NEW_EVENTS && NEW_EVENTS.length > 0 && (
          <div className="latest-event d-none d-xl-flex flex-wrap gap-2 mb-2 p-2 rounded" style={{ background: '#0e1215', border: '1px solid #1f272e' }}>
            {NEW_EVENTS.map((event, idx) => (
              <div className="latest-event-item" key={idx}>
                <Link
                  className="blink_me text-decoration-none d-flex align-items-center text-white small px-2 py-1 rounded"
                  to={`/game-details/${event.sportId}/${event.id}`}
                  style={{ background: '#171e24', border: '1px solid #2e3b46' }}
                >
                  <i className={`fas fa-${event.sportId === 4 ? 'baseball-ball text-warning' : 'table-tennis text-success'} me-1`}></i>
                  <span>{event.name}</span>
                  {event.live && <span className="badge bg-danger ms-1" style={{ fontSize: '9px' }}>LIVE</span>}
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Sports Navigation Tabs */}
        <div className="sports-tab-container mb-3">
          <ul className="nav nav-pills sports-tab flex-nowrap overflow-auto p-1 rounded" style={{ background: '#1c2125' }}>
            <li className="nav-item">
              <button 
                type="button"
                className={`nav-link py-2 px-3 fw-bold ${selectedSportTab === 'all' ? 'active' : 'text-white'}`}
                style={{ borderRadius: '4px', cursor: 'pointer' }}
                onClick={() => setSelectedSportTab('all')}
              >
                All Sports
              </button>
            </li>
            <li className="nav-item">
              <button 
                type="button"
                className={`nav-link py-2 px-3 fw-bold ${selectedSportTab === 'inplay' ? 'active bg-danger' : 'text-danger'}`}
                style={{ borderRadius: '4px', cursor: 'pointer' }}
                onClick={() => setSelectedSportTab('inplay')}
              >
                <i className="fas fa-play-circle me-1 blink_me"></i> In-Play ({MATCHES_DATA.filter(m => m.isInPlay).length})
              </button>
            </li>
            {SPORTS_CATEGORIES.slice(0, 6).map(sport => (
              <li className="nav-item" key={sport.id}>
                <button 
                  type="button"
                  className={`nav-link py-2 px-3 fw-bold ${selectedSportTab === sport.id ? 'active' : 'text-white'}`}
                  style={{ borderRadius: '4px', cursor: 'pointer' }}
                  onClick={() => setSelectedSportTab(sport.id)}
                >
                  <i className={`${sport.icon} me-1`}></i> {sport.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Bet Table (Exchange Markets) */}
        <div className="bet-table-wrapper mb-4 rounded overflow-hidden" style={{ border: '1px solid #28333c' }}>
          <div className="bet-table-header d-flex align-items-center py-2 px-3" style={{ background: '#0e1215', borderBottom: '2px solid #04a1a6' }}>
            <div className="flex-grow-1 fw-bold text-white">
              <i className="fas fa-trophy me-2 text-warning"></i> Match / Event
            </div>
            <div className="d-flex text-center" style={{ minWidth: '360px' }}>
              <div className="flex-fill fw-bold text-white">1</div>
              <div className="flex-fill fw-bold text-white">X</div>
              <div className="flex-fill fw-bold text-white">2</div>
            </div>
          </div>

          <div className="bet-table-body" style={{ background: '#16191c' }}>
            {filteredMatches.length === 0 ? (
              <div className="text-center py-4 text-muted">No active matches found in this category.</div>
            ) : (
              filteredMatches.map(match => (
                <div 
                  key={match.id} 
                  className="bet-table-row d-flex flex-wrap align-items-center py-2 px-3 border-bottom border-dark"
                  style={{ transition: 'background 0.2s' }}
                >
                  {/* Match Info Column */}
                  <div className="flex-grow-1 pe-2 mb-2 mb-md-0" style={{ minWidth: '240px' }}>
                    <div className="d-flex align-items-center mb-1">
                      {match.isInPlay ? (
                        <span className="badge bg-danger me-2 blink_me" style={{ fontSize: '10px' }}>IN-PLAY</span>
                      ) : (
                        <span className="badge bg-secondary me-2" style={{ fontSize: '10px' }}>{match.date}</span>
                      )}
                      <span className="text-muted small">{match.tournament}</span>
                      {match.hasTv && (
                        <i className="fas fa-tv text-warning ms-2" title="Live Video Available"></i>
                      )}
                      {match.hasBookmaker && (
                        <span className="badge bg-dark border border-secondary text-info ms-2" style={{ fontSize: '9px' }}>BM</span>
                      )}
                      {match.hasFancy && (
                        <span className="badge bg-dark border border-secondary text-warning ms-1" style={{ fontSize: '9px' }}>FANCY</span>
                      )}
                    </div>

                    <Link 
                      to={`/game-details/${match.sportId}/${match.id}`}
                      className="text-white fw-bold text-decoration-none hover-underline fs-6 d-block"
                    >
                      {match.name}
                    </Link>

                    {match.score && (
                      <div className="small text-warning mt-1">
                        <i className="fas fa-baseball-ball me-1"></i> {match.score}
                      </div>
                    )}
                  </div>

                  {/* Odds Columns: 1, X, 2 (Back & Lay) */}
                  <div className="d-flex align-items-center justify-content-end" style={{ minWidth: '360px' }}>
                    {/* Selection 1 */}
                    <div className="d-flex flex-fill me-1">
                      <button 
                        type="button" 
                        className="btn btn-sm flex-fill p-1 me-1 text-center back odd-box"
                        style={{ background: '#72bbef', color: '#000', border: 'none', minWidth: '54px' }}
                        onClick={() => handleOddsClick(match, match.team1, 'back', match.odds.team1.back)}
                      >
                        <b className="d-block">{match.odds.team1.back}</b>
                        <small className="text-muted" style={{ fontSize: '10px' }}>{match.odds.team1.backVol || '10K'}</small>
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-sm flex-fill p-1 text-center lay odd-box"
                        style={{ background: '#faa9ba', color: '#000', border: 'none', minWidth: '54px' }}
                        onClick={() => handleOddsClick(match, match.team1, 'lay', match.odds.team1.lay)}
                      >
                        <b className="d-block">{match.odds.team1.lay}</b>
                        <small className="text-muted" style={{ fontSize: '10px' }}>{match.odds.team1.layVol || '5K'}</small>
                      </button>
                    </div>

                    {/* Draw (X) */}
                    <div className="d-flex flex-fill me-1">
                      <button 
                        type="button" 
                        className="btn btn-sm flex-fill p-1 me-1 text-center back odd-box"
                        style={{ background: match.odds.draw.back !== '-' ? '#72bbef' : '#1f272e', color: match.odds.draw.back !== '-' ? '#000' : '#6c757d', border: 'none', minWidth: '54px' }}
                        disabled={match.odds.draw.back === '-'}
                        onClick={() => handleOddsClick(match, 'Draw', 'back', match.odds.draw.back)}
                      >
                        <b className="d-block">{match.odds.draw.back}</b>
                        <small style={{ fontSize: '10px' }}>{match.odds.draw.backVol || '-'}</small>
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-sm flex-fill p-1 text-center lay odd-box"
                        style={{ background: match.odds.draw.lay !== '-' ? '#faa9ba' : '#1f272e', color: match.odds.draw.lay !== '-' ? '#000' : '#6c757d', border: 'none', minWidth: '54px' }}
                        disabled={match.odds.draw.lay === '-'}
                        onClick={() => handleOddsClick(match, 'Draw', 'lay', match.odds.draw.lay)}
                      >
                        <b className="d-block">{match.odds.draw.lay}</b>
                        <small style={{ fontSize: '10px' }}>{match.odds.draw.layVol || '-'}</small>
                      </button>
                    </div>

                    {/* Selection 2 */}
                    <div className="d-flex flex-fill">
                      <button 
                        type="button" 
                        className="btn btn-sm flex-fill p-1 me-1 text-center back odd-box"
                        style={{ background: '#72bbef', color: '#000', border: 'none', minWidth: '54px' }}
                        onClick={() => handleOddsClick(match, match.team2, 'back', match.odds.team2.back)}
                      >
                        <b className="d-block">{match.odds.team2.back}</b>
                        <small className="text-muted" style={{ fontSize: '10px' }}>{match.odds.team2.backVol || '15K'}</small>
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-sm flex-fill p-1 text-center lay odd-box"
                        style={{ background: '#faa9ba', color: '#000', border: 'none', minWidth: '54px' }}
                        onClick={() => handleOddsClick(match, match.team2, 'lay', match.odds.team2.lay)}
                      >
                        <b className="d-block">{match.odds.team2.lay}</b>
                        <small className="text-muted" style={{ fontSize: '10px' }}>{match.odds.team2.layVol || '7K'}</small>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Casino & Live Games Section */}
        <div className="casino-section mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fs-5 text-white m-0 d-flex align-items-center">
              <i className="fas fa-dice text-warning me-2"></i> Our Live Casino & Crash Games
            </h4>
            <div className="d-flex gap-1">
              {['all', 'crash', 'live', 'table'].map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm text-capitalize ${selectedCasinoCategory === cat ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary text-white'}`}
                  onClick={() => setSelectedCasinoCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="row g-3">
            {filteredCasino.map(game => (
              <div className="col-6 col-md-4 col-lg-3" key={game.id}>
                <div 
                  className="casino-list-item position-relative rounded overflow-hidden shadow-sm"
                  style={{
                    background: game.bg || '#1a2228',
                    height: '140px',
                    cursor: 'pointer',
                    border: '1px solid #2f3b44',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onClick={() => {
                    alert(`Starting ${game.gname} Demo Session!`);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div className="p-3 d-flex flex-column justify-content-between h-100">
                    <div className="d-flex justify-content-between">
                      <span className="badge bg-dark text-warning border border-secondary" style={{ fontSize: '10px' }}>
                        {game.provider}
                      </span>
                      {game.category === 'crash' && (
                        <span className="badge bg-danger blink_me" style={{ fontSize: '10px' }}>HOT</span>
                      )}
                    </div>
                    <div>
                      <h6 className="text-white fw-bold m-0">{game.gname}</h6>
                      <small className="text-white-50 text-capitalize">{game.category} game</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
