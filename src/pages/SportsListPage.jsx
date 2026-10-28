import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MATCHES_DATA, SPORTS_CATEGORIES } from '../data/mockData';
import { useBetSlip } from '../context/BetSlipContext';

export const SportsListPage = () => {
  const { etId } = useParams();
  const { selectBet } = useBetSlip();

  const currentSport = SPORTS_CATEGORIES.find(s => s.id === Number(etId)) || { name: 'All Sports', id: 'all' };

  const matches = etId 
    ? MATCHES_DATA.filter(m => m.sportId === Number(etId))
    : MATCHES_DATA;

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
    <div className="center-main-container sports-list-page">
      <div className="center-container">
        {/* Title bar */}
        <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded" style={{ background: '#0e1215', border: '1px solid #04a1a6' }}>
          <div>
            <h4 className="m-0 text-white fs-5 fw-bold">
              <i className="fas fa-trophy text-warning me-2"></i> {currentSport.name} Fixtures
            </h4>
            <span className="text-muted small">Live Odds & Match Winner Markets</span>
          </div>
          <Link to="/" className="btn btn-sm btn-outline-info text-white">
            <i className="fas fa-arrow-left me-1"></i> Back to Home
          </Link>
        </div>

        {/* Sports Matches */}
        <div className="bet-table-wrapper rounded overflow-hidden" style={{ border: '1px solid #28333c' }}>
          <div className="bet-table-header d-flex align-items-center py-2 px-3" style={{ background: '#0e1215', borderBottom: '2px solid #04a1a6' }}>
            <div className="flex-grow-1 fw-bold text-white">Event Name</div>
            <div className="d-flex text-center" style={{ minWidth: '360px' }}>
              <div className="flex-fill fw-bold text-white">1</div>
              <div className="flex-fill fw-bold text-white">X</div>
              <div className="flex-fill fw-bold text-white">2</div>
            </div>
          </div>

          <div className="bet-table-body" style={{ background: '#16191c' }}>
            {matches.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-calendar-times fa-2x mb-2 text-secondary"></i>
                <p>No active matches scheduled for {currentSport.name} right now.</p>
              </div>
            ) : (
              matches.map(match => (
                <div 
                  key={match.id} 
                  className="bet-table-row d-flex flex-wrap align-items-center py-2 px-3 border-bottom border-dark"
                >
                  <div className="flex-grow-1 pe-2 mb-2 mb-md-0" style={{ minWidth: '240px' }}>
                    <div className="d-flex align-items-center mb-1">
                      {match.isInPlay ? (
                        <span className="badge bg-danger me-2 blink_me" style={{ fontSize: '10px' }}>IN-PLAY</span>
                      ) : (
                        <span className="badge bg-secondary me-2" style={{ fontSize: '10px' }}>{match.date}</span>
                      )}
                      <span className="text-muted small">{match.tournament}</span>
                      {match.hasTv && <i className="fas fa-tv text-warning ms-2"></i>}
                    </div>

                    <Link 
                      to={`/game-details/${match.sportId}/${match.id}`}
                      className="text-dark fw-bold text-decoration-none fs-6 d-block"
                    >
                      {match.name}
                    </Link>

                    {match.score && (
                      <div className="small text-danger fw-bold mt-1">
                        <i className="fas fa-baseball-ball me-1"></i> {match.score}
                      </div>
                    )}
                  </div>

                  {/* Odds */}
                  <div className="d-flex align-items-center justify-content-end" style={{ minWidth: '360px' }}>
                    <div className="d-flex flex-fill me-1">
                      <button 
                        type="button" 
                        className="btn btn-sm flex-fill p-1 me-1 text-center"
                        style={{ background: '#72bbef', color: '#000', border: 'none', minWidth: '54px' }}
                        onClick={() => handleOddsClick(match, match.team1, 'back', match.odds.team1.back)}
                      >
                        <b>{match.odds.team1.back}</b>
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-sm flex-fill p-1 text-center"
                        style={{ background: '#faa9ba', color: '#000', border: 'none', minWidth: '54px' }}
                        onClick={() => handleOddsClick(match, match.team1, 'lay', match.odds.team1.lay)}
                      >
                        <b>{match.odds.team1.lay}</b>
                      </button>
                    </div>

                    <div className="d-flex flex-fill me-1">
                      <button 
                        type="button" 
                        className="btn btn-sm flex-fill p-1 me-1 text-center"
                        style={{ background: match.odds.draw.back !== '-' ? '#72bbef' : '#e9ecef', color: match.odds.draw.back !== '-' ? '#000' : '#adb5bd', border: 'none', minWidth: '54px' }}
                        disabled={match.odds.draw.back === '-'}
                        onClick={() => handleOddsClick(match, 'Draw', 'back', match.odds.draw.back)}
                      >
                        <b>{match.odds.draw.back}</b>
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-sm flex-fill p-1 text-center"
                        style={{ background: match.odds.draw.lay !== '-' ? '#faa9ba' : '#e9ecef', color: match.odds.draw.lay !== '-' ? '#000' : '#adb5bd', border: 'none', minWidth: '54px' }}
                        disabled={match.odds.draw.lay === '-'}
                        onClick={() => handleOddsClick(match, 'Draw', 'lay', match.odds.draw.lay)}
                      >
                        <b>{match.odds.draw.lay}</b>
                      </button>
                    </div>

                    <div className="d-flex flex-fill">
                      <button 
                        type="button" 
                        className="btn btn-sm flex-fill p-1 me-1 text-center"
                        style={{ background: '#72bbef', color: '#000', border: 'none', minWidth: '54px' }}
                        onClick={() => handleOddsClick(match, match.team2, 'back', match.odds.team2.back)}
                      >
                        <b>{match.odds.team2.back}</b>
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-sm flex-fill p-1 text-center"
                        style={{ background: '#faa9ba', color: '#000', border: 'none', minWidth: '54px' }}
                        onClick={() => handleOddsClick(match, match.team2, 'lay', match.odds.team2.lay)}
                      >
                        <b>{match.odds.team2.lay}</b>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

