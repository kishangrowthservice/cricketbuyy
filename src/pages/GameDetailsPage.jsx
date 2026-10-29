import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MATCHES_DATA } from '../data/mockData';
import { useBetSlip } from '../context/BetSlipContext';
import { RightSidebar } from '../components/RightSidebar';

export const GameDetailsPage = () => {
  const { etId, gameId } = useParams();
  const { selectBet, openBets } = useBetSlip();
  const [activeTab, setActiveTab] = useState('odds');
  const [showLiveTv, setShowLiveTv] = useState(true);
  const [showFancyModal, setShowFancyModal] = useState(false);
  const [selectedFancy, setSelectedFancy] = useState(null);

  // Find match or fallback
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

  // Helper for 3 back & 3 lay tiers (ladder)
  const getOddsLadder = (baseOdds, isLay = false) => {
    const num = parseFloat(baseOdds) || 2.0;
    if (isLay) {
      return [
        { odds: (num).toFixed(2), vol: '12.4K', cls: 'lay' },
        { odds: (num + 0.01).toFixed(2), vol: '45.1K', cls: 'lay1' },
        { odds: (num + 0.02).toFixed(2), vol: '80.0K', cls: 'lay2' },
      ];
    }
    return [
      { odds: Math.max(1.01, num - 0.02).toFixed(2), vol: '85.2K', cls: 'back2' },
      { odds: Math.max(1.01, num - 0.01).toFixed(2), vol: '32.6K', cls: 'back1' },
      { odds: (num).toFixed(2), vol: '142.8K', cls: 'back' },
    ];
  };

  const runners = [
    { name: match.team1, baseBack: match.odds?.team1?.back || '1.85', baseLay: match.odds?.team1?.lay || '1.88' },
    ...(match.sportId === 1 ? [{ name: 'The Draw', baseBack: match.odds?.draw?.back || '3.20', baseLay: match.odds?.draw?.lay || '3.30' }] : []),
    { name: match.team2, baseBack: match.odds?.team2?.back || '2.04', baseLay: match.odds?.team2?.lay || '2.08' }
  ];

  const fancyMarkets = [
    { name: '10 Over BAN Runs', lay: '72', layVol: '100', back: '74', backVol: '100', min: '100', max: '50,000' },
    { name: 'Fall of 6th Wicket BAN', lay: '195', layVol: '100', back: '198', backVol: '100', min: '100', max: '50,000' },
    { name: 'West Indies 1st 6 Over Runs', lay: '48', layVol: '100', back: '50', backVol: '100', min: '100', max: '50,000' },
    { name: 'Highest Opening Partnership', lay: '32', layVol: '100', back: '34', backVol: '100', min: '100', max: '50,000' }
  ];

  const balls = ['1', '0', '4', '1', 'W', '6', '2', '0'];

  const openFancyBook = (fancy) => {
    setSelectedFancy(fancy);
    setShowFancyModal(true);
  };

  return (
    <div className="center-main-container detail-page d-flex">
      <div className="center-container flex-grow-1">
        <div className="detail-page-container">
          {/* Header Bar */}
          <div className="game-header">
            <span>{match.name}</span>
            <span className="float-right">{match.date}</span>
          </div>

          {/* Mobile Tabs */}
          <ul className="nav nav-tabs d-xl-none menu-tabs my-1">
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === 'odds' ? 'active' : ''}`}
                onClick={() => setActiveTab('odds')}
                style={{ cursor: 'pointer' }}
              >
                Odds
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === 'matchedbets' ? 'active' : ''}`}
                onClick={() => setActiveTab('matchedbets')}
                style={{ cursor: 'pointer' }}
              >
                Matched Bet ({openBets.length})
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                onClick={() => setShowLiveTv(!showLiveTv)}
                style={{ cursor: 'pointer' }}
              >
                <i className="fas fa-tv"></i>
              </a>
            </li>
          </ul>

          {/* Live TV Screen */}
          {showLiveTv && (
            <div className="live-tv mb-2 position-relative" style={{ height: '220px', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #093438 0%, #031c1e 100%)',
                  color: '#fff'
                }}
              >
                <i className="fas fa-satellite-dish fa-3x text-info mb-2"></i>
                <h5 className="fw-bold m-0">{match.name}</h5>
                <p className="text-warning small mt-1 mb-1">Live Feed: {match.score}</p>
                <span className="badge bg-success">H.265 Ultra Low Latency Stream Active</span>
              </div>
            </div>
          )}

          {/* Scorecard */}
          <div className="scorecard p-2 mb-2" style={{ background: '#1c2125', borderRadius: '4px', color: '#fff', fontSize: '13px' }}>
            <div className="row">
              <div className="col-12 col-md-6">
                <p className="team-1 row m-0">
                  <span className="team-name col-4 fw-bold">{match.team1}</span>
                  <span className="score col-5 text-end text-warning fw-bold">{match.score.split('|')[0] || match.score}</span>
                  <span className="team-name col-3 text-end text-muted small">CRR 5.34</span>
                </p>
                <p className="team-1 row m-0 mt-1">
                  <span className="team-name col-4 fw-bold">{match.team2}</span>
                  <span className="score col-5 text-end text-warning fw-bold">{match.score.split('|')[1] || 'Yet to bat'}</span>
                  <span className="team-name col-3 text-end text-muted small">RR 5.12</span>
                </p>
              </div>
              <div className="col-12 col-md-6 text-xl-end mt-2 mt-md-0">
                <div className="text-xl-end small text-info fw-bold">
                  <span>Day 1 | Live Session In Progress</span>
                </div>
                <p className="text-xl-end ball-by-ball mt-1 mb-0">
                  {balls.map((b, idx) => (
                    <span
                      key={idx}
                      className={`badge rounded-circle mx-1 ${b === '4' ? 'bg-primary' : b === '6' ? 'bg-success' : b === 'W' ? 'bg-danger' : 'bg-secondary'}`}
                      style={{ width: '22px', height: '22px', lineHeight: '14px', display: 'inline-block' }}
                    >
                      {b}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>

          {activeTab === 'matchedbets' ? (
            <div className="matched-bets-container p-3 bg-dark text-white rounded">
              <h5 className="border-bottom pb-2">Matched Bets ({openBets.length})</h5>
              {openBets.length === 0 ? (
                <p className="text-muted small">No matched bets on this market.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-sm">
                    <thead>
                      <tr>
                        <th>Selection</th>
                        <th>Type</th>
                        <th>Odds</th>
                        <th>Stake</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openBets.map((b, idx) => (
                        <tr key={idx}>
                          <td>{b.selection}</td>
                          <td><span className={`badge ${b.type === 'back' ? 'bg-primary' : 'bg-danger'}`}>{b.type.toUpperCase()}</span></td>
                          <td>{b.odds}</td>
                          <td>₹{b.stake}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 1. MATCH ODDS (Exchange 6-column ladder) */}
              <div className="game-market market-4">
                <div className="market-title">
                  <span>Match Odds</span>
                  <button className="btn btn-success btn-sm">Cashout</button>
                </div>

                <div className="market-header">
                  <div className="market-nation-detail">
                    <span className="market-nation-name">Max: 2,50,000 | Min: 100</span>
                  </div>
                  <div className="market-odd-box no-border d-none d-md-block"></div>
                  <div className="market-odd-box no-border d-none d-md-block"></div>
                  <div className="market-odd-box back">
                    <b>Back</b>
                  </div>
                  <div className="market-odd-box lay">
                    <b>Lay</b>
                  </div>
                  <div className="market-odd-box"></div>
                  <div className="market-odd-box no-border"></div>
                </div>

                <div className="market-body">
                  {runners.map((runner, idx) => {
                    const backOdds = getOddsLadder(runner.baseBack, false);
                    const layOdds = getOddsLadder(runner.baseLay, true);
                    return (
                      <div className="market-row" key={idx}>
                        <div className="market-nation-detail">
                          <span className="market-nation-name fw-bold">{runner.name}</span>
                          <div className="market-nation-book">
                            <span className="market-book text-muted small">0.00</span>
                          </div>
                        </div>

                        {/* 3 Back Columns */}
                        <div
                          className="market-odd-box back2"
                          onClick={() => handleOddsClick(runner.name, 'back', backOdds[0].odds)}
                        >
                          <span className="market-odd">{backOdds[0].odds}</span>
                          <span className="market-volume">{backOdds[0].vol}</span>
                        </div>
                        <div
                          className="market-odd-box back1"
                          onClick={() => handleOddsClick(runner.name, 'back', backOdds[1].odds)}
                        >
                          <span className="market-odd">{backOdds[1].odds}</span>
                          <span className="market-volume">{backOdds[1].vol}</span>
                        </div>
                        <div
                          className="market-odd-box back"
                          onClick={() => handleOddsClick(runner.name, 'back', backOdds[2].odds)}
                        >
                          <span className="market-odd">{backOdds[2].odds}</span>
                          <span className="market-volume">{backOdds[2].vol}</span>
                        </div>

                        {/* 3 Lay Columns */}
                        <div
                          className="market-odd-box lay"
                          onClick={() => handleOddsClick(runner.name, 'lay', layOdds[0].odds)}
                        >
                          <span className="market-odd">{layOdds[0].odds}</span>
                          <span className="market-volume">{layOdds[0].vol}</span>
                        </div>
                        <div
                          className="market-odd-box lay1"
                          onClick={() => handleOddsClick(runner.name, 'lay', layOdds[1].odds)}
                        >
                          <span className="market-odd">{layOdds[1].odds}</span>
                          <span className="market-volume">{layOdds[1].vol}</span>
                        </div>
                        <div
                          className="market-odd-box lay2"
                          onClick={() => handleOddsClick(runner.name, 'lay', layOdds[2].odds)}
                        >
                          <span className="market-odd">{layOdds[2].odds}</span>
                          <span className="market-volume">{layOdds[2].vol}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. BOOKMAKER MARKET */}
              <div className="game-market market-2 mt-2">
                <div className="market-title">
                  <span>Bookmaker 0% Commission</span>
                </div>

                <div className="market-header">
                  <div className="market-nation-detail">
                    <span className="market-nation-name">Min: 100 &nbsp; Max: 1,00,000</span>
                  </div>
                  <div className="market-odd-box back">
                    <b>Back</b>
                  </div>
                  <div className="market-odd-box lay">
                    <b>Lay</b>
                  </div>
                </div>

                <div className="market-body">
                  {runners.filter(r => r.name !== 'The Draw').map((runner, idx) => (
                    <div className="market-row" key={idx}>
                      <div className="market-nation-detail">
                        <span className="market-nation-name fw-bold">{runner.name}</span>
                      </div>
                      <div
                        className="market-odd-box back"
                        onClick={() => handleOddsClick(runner.name, 'back', runner.baseBack)}
                      >
                        <span className="market-odd">{runner.baseBack}</span>
                        <span className="market-volume">100.00</span>
                      </div>
                      <div
                        className="market-odd-box lay"
                        onClick={() => handleOddsClick(runner.name, 'lay', runner.baseLay)}
                      >
                        <span className="market-odd">{runner.baseLay}</span>
                        <span className="market-volume">100.00</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. FANCY MARKET */}
              <div className="game-market market-6 mt-2">
                <div className="market-title">
                  <span>Fancy Market</span>
                </div>

                <div className="market-header">
                  <div className="market-nation-detail">
                    <span className="market-nation-name">Min: 100 &nbsp; Max: 50,000</span>
                  </div>
                  <div className="market-odd-box lay">
                    <b>No</b>
                  </div>
                  <div className="market-odd-box back">
                    <b>Yes</b>
                  </div>
                  <div className="fancy-min-max-box"></div>
                </div>

                <div className="market-body">
                  {fancyMarkets.map((fancy, idx) => (
                    <div className="market-row" key={idx}>
                      <div className="market-nation-detail">
                        <span className="market-nation-name">{fancy.name}</span>
                        <div className="market-nation-book">
                          <button
                            type="button"
                            className="btn btn-outline-info btn-sm py-0 px-1"
                            style={{ fontSize: '11px' }}
                            onClick={() => openFancyBook(fancy)}
                          >
                            Book
                          </button>
                        </div>
                      </div>
                      <div
                        className="market-odd-box lay"
                        onClick={() => handleOddsClick(fancy.name, 'lay', fancy.lay)}
                      >
                        <span className="market-odd">{fancy.lay}</span>
                        <span className="market-volume">{fancy.layVol}</span>
                      </div>
                      <div
                        className="market-odd-box back"
                        onClick={() => handleOddsClick(fancy.name, 'back', fancy.back)}
                      >
                        <span className="market-odd">{fancy.back}</span>
                        <span className="market-volume">{fancy.backVol}</span>
                      </div>
                      <div className="fancy-min-max-box d-flex align-items-center justify-content-center">
                        <span className="small text-muted" style={{ fontSize: '10px' }}>100-50K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar Bet Slip */}
      <RightSidebar />

      {/* Fancy Book / Run Amount Modal */}
      {showFancyModal && selectedFancy && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1200 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: '#1c2125', color: '#fff', border: '1px solid var(--bg-primary, #800000)' }}>
              <div className="modal-header" style={{ background: 'var(--bg-primary, #800000)' }}>
                <h5 className="modal-title fw-bold">Run Amount - {selectedFancy.name}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowFancyModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-dark table-sm">
                    <thead>
                      <tr>
                        <th>Run</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{Number(selectedFancy.lay) - 1}</td>
                        <td className="text-end text-success">+₹ 0.00</td>
                      </tr>
                      <tr>
                        <td>{selectedFancy.lay}</td>
                        <td className="text-end text-success">+₹ 0.00</td>
                      </tr>
                      <tr>
                        <td>{selectedFancy.back}</td>
                        <td className="text-end text-danger">-₹ 0.00</td>
                      </tr>
                      <tr>
                        <td>{Number(selectedFancy.back) + 1}</td>
                        <td className="text-end text-danger">-₹ 0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowFancyModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
