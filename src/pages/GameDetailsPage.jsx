import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MATCHES_DATA } from '../data/mockData';
import { useBetSlip } from '../context/BetSlipContext';
import { RightSidebar } from '../components/RightSidebar';

export const GameDetailsPage = () => {
  const { etId, gameId } = useParams();
  const { selectBet } = useBetSlip();
  const [showLiveStream, setShowLiveStream] = useState(true);

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

  // Helper for 3 back & 3 lay columns
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

  return (
    <div className="center-main-container game-page">
      <div className="center-container">
        {/* Breadcrumb / Match Header Bar */}
        <div className="d-flex align-items-center justify-content-between p-2 mb-1" style={{ background: 'var(--bg-secondary)', color: '#fff', fontSize: '13px' }}>
          <div>
            <span className="fw-bold">{match.name}</span>
            <span className="ms-2 text-warning">({match.tournament})</span>
            {match.isInPlay && <span className="badge bg-danger ms-2 blink_me">LIVE</span>}
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2 small">{match.date}</span>
            <button
              type="button"
              className="btn btn-sm btn-outline-light py-0 px-2"
              onClick={() => setShowLiveStream(!showLiveStream)}
            >
              <i className="fas fa-tv me-1"></i> {showLiveStream ? 'Hide TV' : 'Live TV'}
            </button>
          </div>
        </div>

        {/* Live Stream / Scoreboard Embed */}
        {showLiveStream && (
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
              <p className="text-warning small mt-1 mb-1">Live Score: {match.score}</p>
              <span className="badge bg-success">H.265 Ultra Low Latency Stream Active</span>
            </div>
          </div>
        )}

        {/* 1. MATCH ODDS (Exchange 6-column ladder) */}
        <div className="game-market market-1">
          <div className="market-title">
            <span>Match Odds</span>
            <span>Max: 2,50,000 | Min: 100</span>
          </div>

          <div className="market-header d-none d-md-flex">
            <div className="market-nation-detail">
              <span className="market-nation-name">Matched: ₹ 4,89,30,120</span>
            </div>
            <div className="d-flex">
              <div className="market-odd-box" style={{ background: 'transparent', cursor: 'default' }}></div>
              <div className="market-odd-box" style={{ background: 'transparent', cursor: 'default' }}></div>
              <div className="market-odd-box back" style={{ cursor: 'default' }}>
                <b>Back</b>
              </div>
              <div className="market-odd-box lay" style={{ cursor: 'default' }}>
                <b>Lay</b>
              </div>
              <div className="market-odd-box" style={{ background: 'transparent', cursor: 'default' }}></div>
              <div className="market-odd-box" style={{ background: 'transparent', cursor: 'default' }}></div>
            </div>
          </div>

          {runners.map((runner, idx) => {
            const backOdds = getOddsLadder(runner.baseBack, false);
            const layOdds = getOddsLadder(runner.baseLay, true);
            return (
              <div className="market-row" key={idx}>
                <div className="market-nation-detail">
                  <span className="market-nation-name fw-bold">{runner.name}</span>
                </div>

                <div className="d-flex">
                  {/* 3 Back Columns */}
                  {backOdds.map((item, bIdx) => (
                    <div
                      key={`back-${bIdx}`}
                      className={`market-odd-box ${item.cls}`}
                      onClick={() => handleOddsClick(runner.name, 'back', item.odds)}
                    >
                      <span className="market-odd">{item.odds}</span>
                      <span className="market-volume">{item.vol}</span>
                    </div>
                  ))}

                  {/* 3 Lay Columns */}
                  {layOdds.map((item, lIdx) => (
                    <div
                      key={`lay-${lIdx}`}
                      className={`market-odd-box ${item.cls}`}
                      onClick={() => handleOddsClick(runner.name, 'lay', item.odds)}
                    >
                      <span className="market-odd">{item.odds}</span>
                      <span className="market-volume">{item.vol}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. BOOKMAKER MARKET */}
        <div className="game-market market-bookmaker mt-3">
          <div className="market-title">
            <span>Bookmaker 0% Commission</span>
            <span>Max: 1,00,000 | Min: 100</span>
          </div>

          <div className="market-header d-none d-md-flex">
            <div className="market-nation-detail">
              <span className="market-nation-name">Zero Commission</span>
            </div>
            <div className="d-flex">
              <div className="market-odd-box back" style={{ width: '120px', cursor: 'default' }}>
                <b>Back</b>
              </div>
              <div className="market-odd-box lay" style={{ width: '120px', cursor: 'default' }}>
                <b>Lay</b>
              </div>
            </div>
          </div>

          {runners.filter(r => r.name !== 'The Draw').map((runner, idx) => (
            <div className="market-row" key={idx}>
              <div className="market-nation-detail" style={{ width: 'calc(100% - 240px)' }}>
                <span className="market-nation-name fw-bold">{runner.name}</span>
              </div>
              <div className="d-flex">
                <div
                  className="market-odd-box back"
                  style={{ width: '120px' }}
                  onClick={() => handleOddsClick(runner.name, 'back', runner.baseBack)}
                >
                  <span className="market-odd">{runner.baseBack}</span>
                  <span className="market-volume">100.00</span>
                </div>
                <div
                  className="market-odd-box lay"
                  style={{ width: '120px' }}
                  onClick={() => handleOddsClick(runner.name, 'lay', runner.baseLay)}
                >
                  <span className="market-odd">{runner.baseLay}</span>
                  <span className="market-volume">100.00</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. FANCY MARKET */}
        {match.sportId === 4 && (
          <div className="game-market fancy-market mt-3">
            <div className="market-title">
              <span>Fancy Market / Session Bets</span>
              <span>Max: 50,000 | Min: 100</span>
            </div>

            <div className="market-header d-none d-md-flex">
              <div className="market-nation-detail" style={{ width: 'calc(100% - 240px)' }}>
                <span className="market-nation-name">Session Name</span>
              </div>
              <div className="d-flex">
                <div className="market-odd-box lay" style={{ width: '120px', cursor: 'default' }}>
                  <b>No</b>
                </div>
                <div className="market-odd-box back" style={{ width: '120px', cursor: 'default' }}>
                  <b>Yes</b>
                </div>
              </div>
            </div>

            {[
              { title: '40 Over Total BAN Runs', noRuns: '215', noRate: '100', yesRuns: '218', yesRate: '100' },
              { title: 'Fall of 6th Wicket BAN', noRuns: '198', noRate: '90', yesRuns: '202', yesRate: '110' },
              { title: 'West Indies 1st 6 Over Runs', noRuns: '48', noRate: '100', yesRuns: '50', yesRate: '100' },
              { title: 'Total Match Sixes', noRuns: '14', noRate: '115', yesRuns: '16', yesRate: '90' }
            ].map((fancy, idx) => (
              <div className="market-row" key={idx}>
                <div className="market-nation-detail" style={{ width: 'calc(100% - 240px)' }}>
                  <span className="market-nation-name fw-bold">{fancy.title}</span>
                </div>
                <div className="d-flex">
                  <div
                    className="market-odd-box lay"
                    style={{ width: '120px' }}
                    onClick={() => handleOddsClick(`${fancy.title} (No)`, 'lay', parseFloat(fancy.noRuns))}
                  >
                    <span className="market-odd">{fancy.noRuns}</span>
                    <span className="market-volume">{fancy.noRate}</span>
                  </div>
                  <div
                    className="market-odd-box back"
                    style={{ width: '120px' }}
                    onClick={() => handleOddsClick(`${fancy.title} (Yes)`, 'back', parseFloat(fancy.yesRuns))}
                  >
                    <span className="market-odd">{fancy.yesRuns}</span>
                    <span className="market-volume">{fancy.yesRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar (Placed side-by-side with 450px width matching style.css) */}
      <RightSidebar />
    </div>
  );
};
