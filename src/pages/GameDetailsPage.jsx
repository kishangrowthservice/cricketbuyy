import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MATCHES_DATA } from '../data/mockData';
import { useBetSlip } from '../context/BetSlipContext';

export const GameDetailsPage = () => {
  const { etId, gameId } = useParams();
  const { selectBet } = useBetSlip();
  const [showLiveStream, setShowLiveStream] = useState(true);

  // Find match or use first match as fallback
  const match = MATCHES_DATA.find(m => m.id === gameId) || MATCHES_DATA[0];

  const handleOddsClick = (selection, type, odds) => {
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
    <div className="center-main-container game-details-page">
      <div className="center-container">
        {/* Breadcrumb */}
        <div className="d-flex align-items-center mb-2 text-muted small">
          <Link to="/" className="text-muted text-decoration-none me-2">Home</Link>
          <span className="me-2">/</span>
          <Link to={`/all-sports/${match.sportId}`} className="text-muted text-decoration-none me-2">{match.sportName}</Link>
          <span className="me-2">/</span>
          <span className="text-white fw-bold">{match.name}</span>
        </div>

        {/* Match Header Bar */}
        <div 
          className="p-3 mb-3 rounded"
          style={{ background: 'linear-gradient(90deg, #093438 0%, #041b1d 100%)', border: '1px solid #04a1a6' }}
        >
          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <div>
              <span className="badge bg-danger me-2 blink_me">LIVE IN-PLAY</span>
              <span className="text-white-50 small">{match.tournament}</span>
              <h3 className="text-white fs-5 fw-bold m-0 mt-1">{match.name}</h3>
              <div className="text-warning small mt-1">
                <i className="fas fa-chart-line me-1"></i> Live Score: <b>{match.score}</b>
              </div>
            </div>

            <div className="d-flex gap-2 mt-2 mt-md-0">
              <button 
                type="button" 
                className={`btn btn-sm ${showLiveStream ? 'btn-info text-dark' : 'btn-outline-info text-white'}`}
                onClick={() => setShowLiveStream(!showLiveStream)}
              >
                <i className="fas fa-tv me-1"></i> {showLiveStream ? 'Hide TV' : 'Live Stream'}
              </button>
            </div>
          </div>

          {/* Simulated Live Stream / Radar */}
          {showLiveStream && (
            <div className="mt-3 p-3 rounded text-center" style={{ background: '#0b1318', border: '1px solid #1f2c36' }}>
              <div className="d-flex justify-content-between text-muted small mb-2 border-bottom border-dark pb-1">
                <span>{match.team1} vs {match.team2}</span>
                <span className="text-danger blink_me"><i className="fas fa-circle me-1"></i> STREAM ACTIVE</span>
              </div>
              <div style={{ height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <i className="fas fa-satellite-dish fa-3x text-info mb-2"></i>
                <b className="text-white">{match.name} - LIVE BROADCAST</b>
                <span className="text-warning small mt-1">{match.score}</span>
                <span className="text-muted" style={{ fontSize: '11px' }}>Low Latency Live Feed (H.265)</span>
              </div>
            </div>
          )}
        </div>

        {/* 1. MATCH ODDS MARKET */}
        <div className="game-market market-1 mb-4 rounded overflow-hidden" style={{ border: '1px solid #28333c' }}>
          <div className="market-title d-flex justify-content-between align-items-center py-2 px-3" style={{ background: '#0e1215', borderBottom: '2px solid #04a1a6' }}>
            <span className="fw-bold text-white"><i className="fas fa-handshake me-2 text-warning"></i> MATCH ODDS</span>
            <span className="small text-muted">Max Bet: 2.50L | Min: 100</span>
          </div>

          <div className="table-responsive">
            <table className="table table-dark table-borderless m-0 align-middle">
              <thead>
                <tr className="border-bottom border-dark text-muted" style={{ fontSize: '12px' }}>
                  <th style={{ width: '50%' }}>Selection</th>
                  <th className="text-center" style={{ width: '25%', background: '#13354b', color: '#72bbef' }}>Back</th>
                  <th className="text-center" style={{ width: '25%', background: '#451a24', color: '#faa9ba' }}>Lay</th>
                </tr>
              </thead>
              <tbody>
                {/* Team 1 */}
                <tr className="border-bottom border-dark">
                  <td className="fw-bold text-white ps-3">
                    {match.team1}
                    <div className="small text-muted" style={{ fontSize: '10px' }}>Match Winner</div>
                  </td>
                  <td className="p-1">
                    <button 
                      type="button" 
                      className="btn w-100 fw-bold py-2"
                      style={{ background: '#72bbef', color: '#000' }}
                      onClick={() => handleOddsClick(match.team1, 'back', match.odds.team1.back)}
                    >
                      <div>{match.odds.team1.back}</div>
                      <small style={{ fontSize: '10px' }}>{match.odds.team1.backVol || '50K'}</small>
                    </button>
                  </td>
                  <td className="p-1">
                    <button 
                      type="button" 
                      className="btn w-100 fw-bold py-2"
                      style={{ background: '#faa9ba', color: '#000' }}
                      onClick={() => handleOddsClick(match.team1, 'lay', match.odds.team1.lay)}
                    >
                      <div>{match.odds.team1.lay}</div>
                      <small style={{ fontSize: '10px' }}>{match.odds.team1.layVol || '20K'}</small>
                    </button>
                  </td>
                </tr>

                {/* Draw (if applicable) */}
                {match.odds.draw.back !== '-' && (
                  <tr className="border-bottom border-dark">
                    <td className="fw-bold text-white ps-3">
                      The Draw
                      <div className="small text-muted" style={{ fontSize: '10px' }}>Match Tied</div>
                    </td>
                    <td className="p-1">
                      <button 
                        type="button" 
                        className="btn w-100 fw-bold py-2"
                        style={{ background: '#72bbef', color: '#000' }}
                        onClick={() => handleOddsClick('Draw', 'back', match.odds.draw.back)}
                      >
                        <div>{match.odds.draw.back}</div>
                        <small style={{ fontSize: '10px' }}>{match.odds.draw.backVol || '10K'}</small>
                      </button>
                    </td>
                    <td className="p-1">
                      <button 
                        type="button" 
                        className="btn w-100 fw-bold py-2"
                        style={{ background: '#faa9ba', color: '#000' }}
                        onClick={() => handleOddsClick('Draw', 'lay', match.odds.draw.lay)}
                      >
                        <div>{match.odds.draw.lay}</div>
                        <small style={{ fontSize: '10px' }}>{match.odds.draw.layVol || '5K'}</small>
                      </button>
                    </td>
                  </tr>
                )}

                {/* Team 2 */}
                <tr>
                  <td className="fw-bold text-white ps-3">
                    {match.team2}
                    <div className="small text-muted" style={{ fontSize: '10px' }}>Match Winner</div>
                  </td>
                  <td className="p-1">
                    <button 
                      type="button" 
                      className="btn w-100 fw-bold py-2"
                      style={{ background: '#72bbef', color: '#000' }}
                      onClick={() => handleOddsClick(match.team2, 'back', match.odds.team2.back)}
                    >
                      <div>{match.odds.team2.back}</div>
                      <small style={{ fontSize: '10px' }}>{match.odds.team2.backVol || '40K'}</small>
                    </button>
                  </td>
                  <td className="p-1">
                    <button 
                      type="button" 
                      className="btn w-100 fw-bold py-2"
                      style={{ background: '#faa9ba', color: '#000' }}
                      onClick={() => handleOddsClick(match.team2, 'lay', match.odds.team2.lay)}
                    >
                      <div>{match.odds.team2.lay}</div>
                      <small style={{ fontSize: '10px' }}>{match.odds.team2.layVol || '18K'}</small>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. BOOKMAKER MARKET */}
        <div className="game-market market-bookmaker mb-4 rounded overflow-hidden" style={{ border: '1px solid #28333c' }}>
          <div className="market-title d-flex justify-content-between align-items-center py-2 px-3" style={{ background: '#0e1215', borderBottom: '2px solid #ffc107' }}>
            <span className="fw-bold text-warning"><i className="fas fa-book me-2"></i> BOOKMAKER 0% COMMISSION</span>
            <span className="small text-muted">Zero Comm Market | Max: 10.0L</span>
          </div>

          <div className="table-responsive">
            <table className="table table-dark table-borderless m-0 align-middle">
              <thead>
                <tr className="border-bottom border-dark text-muted" style={{ fontSize: '12px' }}>
                  <th style={{ width: '50%' }}>Nation</th>
                  <th className="text-center" style={{ width: '25%', background: '#13354b', color: '#72bbef' }}>Back</th>
                  <th className="text-center" style={{ width: '25%', background: '#451a24', color: '#faa9ba' }}>Lay</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-bottom border-dark">
                  <td className="fw-bold text-white ps-3">{match.team1}</td>
                  <td className="p-1">
                    <button 
                      type="button" 
                      className="btn w-100 fw-bold py-2"
                      style={{ background: '#72bbef', color: '#000' }}
                      onClick={() => handleOddsClick(`${match.team1} (BM)`, 'back', +(parseFloat(match.odds.team1.back) - 0.02).toFixed(2))}
                    >
                      <div>{+(parseFloat(match.odds.team1.back) - 0.02).toFixed(2)}</div>
                      <small style={{ fontSize: '10px' }}>100</small>
                    </button>
                  </td>
                  <td className="p-1">
                    <button 
                      type="button" 
                      className="btn w-100 fw-bold py-2"
                      style={{ background: '#faa9ba', color: '#000' }}
                      onClick={() => handleOddsClick(`${match.team1} (BM)`, 'lay', +(parseFloat(match.odds.team1.lay) + 0.02).toFixed(2))}
                    >
                      <div>{+(parseFloat(match.odds.team1.lay) + 0.02).toFixed(2)}</div>
                      <small style={{ fontSize: '10px' }}>100</small>
                    </button>
                  </td>
                </tr>

                <tr>
                  <td className="fw-bold text-white ps-3">{match.team2}</td>
                  <td className="p-1">
                    <button 
                      type="button" 
                      className="btn w-100 fw-bold py-2"
                      style={{ background: '#72bbef', color: '#000' }}
                      onClick={() => handleOddsClick(`${match.team2} (BM)`, 'back', +(parseFloat(match.odds.team2.back) - 0.02).toFixed(2))}
                    >
                      <div>{+(parseFloat(match.odds.team2.back) - 0.02).toFixed(2)}</div>
                      <small style={{ fontSize: '10px' }}>100</small>
                    </button>
                  </td>
                  <td className="p-1">
                    <button 
                      type="button" 
                      className="btn w-100 fw-bold py-2"
                      style={{ background: '#faa9ba', color: '#000' }}
                      onClick={() => handleOddsClick(`${match.team2} (BM)`, 'lay', +(parseFloat(match.odds.team2.lay) + 0.02).toFixed(2))}
                    >
                      <div>{+(parseFloat(match.odds.team2.lay) + 0.02).toFixed(2)}</div>
                      <small style={{ fontSize: '10px' }}>100</small>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. FANCY MARKETS (SESSIONS) */}
        {match.hasFancy && (
          <div className="game-market market-fancy mb-4 rounded overflow-hidden" style={{ border: '1px solid #28333c' }}>
            <div className="market-title d-flex justify-content-between align-items-center py-2 px-3" style={{ background: '#0e1215', borderBottom: '2px solid #28a745' }}>
              <span className="fw-bold text-success"><i className="fas fa-bolt me-2"></i> NORMAL FANCY / SESSIONS</span>
              <span className="small text-muted">Live Ball-by-Ball Markets</span>
            </div>

            <div className="table-responsive">
              <table className="table table-dark table-borderless m-0 align-middle">
                <thead>
                  <tr className="border-bottom border-dark text-muted" style={{ fontSize: '12px' }}>
                    <th style={{ width: '50%' }}>Session / Market</th>
                    <th className="text-center" style={{ width: '25%', background: '#451a24', color: '#faa9ba' }}>No</th>
                    <th className="text-center" style={{ width: '25%', background: '#13354b', color: '#72bbef' }}>Yes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { title: '40 Over Total BAN Runs', noRuns: '215', noRate: '100', yesRuns: '218', yesRate: '100' },
                    { title: 'Fall of 6th Wicket BAN', noRuns: '198', noRate: '90', yesRuns: '202', yesRate: '110' },
                    { title: 'West Indies 1st 6 Over Runs', noRuns: '48', noRate: '100', yesRuns: '50', yesRate: '100' },
                    { title: 'Total Match Sixes', noRuns: '14', noRate: '115', yesRuns: '16', yesRate: '90' },
                  ].map((fancy, idx) => (
                    <tr key={idx} className="border-bottom border-dark">
                      <td className="fw-bold text-white ps-3">
                        {fancy.title}
                        <div className="small text-muted" style={{ fontSize: '10px' }}>Session Odds</div>
                      </td>
                      <td className="p-1">
                        <button 
                          type="button" 
                          className="btn w-100 fw-bold py-1"
                          style={{ background: '#faa9ba', color: '#000' }}
                          onClick={() => handleOddsClick(`${fancy.title} (No)`, 'lay', parseFloat(fancy.noRuns))}
                        >
                          <div>{fancy.noRuns}</div>
                          <small style={{ fontSize: '10px' }}>{fancy.noRate}</small>
                        </button>
                      </td>
                      <td className="p-1">
                        <button 
                          type="button" 
                          className="btn w-100 fw-bold py-1"
                          style={{ background: '#72bbef', color: '#000' }}
                          onClick={() => handleOddsClick(`${fancy.title} (Yes)`, 'back', parseFloat(fancy.yesRuns))}
                        >
                          <div>{fancy.yesRuns}</div>
                          <small style={{ fontSize: '10px' }}>{fancy.yesRate}</small>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
