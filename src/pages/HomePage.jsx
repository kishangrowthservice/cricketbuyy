import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NEW_EVENTS, MATCHES_DATA, CASINO_GAMES } from '../data/mockData';
import { useBetSlip } from '../context/BetSlipContext';

export const HomePage = () => {
  const [tabEventId, setTabEventId] = useState(4); // default 4 = Cricket
  const {
    activeBet,
    selectBet,
    updateOdds,
    setStake,
    addStake,
    cancelBet,
    placeBet,
    betSuccessMsg
  } = useBetSlip();
  const navigate = useNavigate();

  // Sports Tabs matching target
  const tabs = [
    { eid: 'all', ename: 'All Sports' },
    { eid: 4, ename: 'Cricket' },
    { eid: 2, ename: 'Tennis' },
    { eid: 1, ename: 'Football' },
    { eid: 8, ename: 'Table Tennis' },
    { eid: 'inplay', ename: 'In-Play' }
  ];

  // Filter matches
  const filteredMatches = tabEventId === 'all'
    ? MATCHES_DATA
    : tabEventId === 'inplay'
      ? MATCHES_DATA.filter(m => m.isInPlay)
      : MATCHES_DATA.filter(m => m.sportId === Number(tabEventId));

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
        {/* Top Latest Events Ticker */}
        {NEW_EVENTS && NEW_EVENTS.length > 0 && (
          <div className="latest-event d-none d-xl-flex">
            {NEW_EVENTS.map((event, idx) => (
              <div className="latest-event-item" key={idx}>
                <Link
                  className="blink_me"
                  to={`/game-details/${event.sportId}/${event.id}`}
                >
                  <i className={`fas fa-${event.sportId === 4 ? 'baseball-ball' : 'table-tennis'} me-1`}></i>
                  <span>{event.name}</span>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Sports Navigation Tabs */}
        <ul className="nav nav-pills sports-tab">
          {tabs.map((tab, idx) => (
            <li className="nav-item" key={idx}>
              <a
                onClick={() => setTabEventId(tab.eid)}
                className={`nav-link ${tab.eid === tabEventId ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-xl-none">
                  <i className={`icon icon-${tab.eid}`}></i>
                </div>
                <span>{tab.ename}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Bet Table (Exchange Markets) */}
        <div className="tab-content mt-1">
          <div className="tab-pane active">
            <div className="bet-table">
              {/* Table Header */}
              <div className="bet-table-header">
                <div className="bet-nation-name">
                  <b>Game</b>
                </div>
                <div className="bet-nation-odd">
                  <b>1</b>
                </div>
                <div className="bet-nation-odd">
                  <b>X</b>
                </div>
                <div className="bet-nation-odd">
                  <b>2</b>
                </div>
              </div>

              {/* Table Body */}
              <div className="bet-table-body">
                {/* Special Super Over2 row when Cricket or All Sports is selected */}
                {(tabEventId === 'all' || tabEventId === 4) && (
                  <div className="bet-table-row">
                    <div className="bet-nation-name">
                      <Link to="/casino-list/superover2" className="bet-nation-game-name">
                        <span>Super Over2</span>
                      </Link>
                      <div className="game-icons">
                        <div className="game-icon">
                          <span className="active"></span>
                        </div>
                        <div className="game-icon">
                          <i className="fas fa-tv icon-tv"></i>
                        </div>
                        <div className="game-icon">
                          <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: '10px', padding: '2px 4px' }}>F</span>
                        </div>
                        <div className="game-icon">
                          <span className="badge bg-info text-white fw-bold" style={{ fontSize: '10px', padding: '2px 4px' }}>BM</span>
                        </div>
                        <div className="game-icon"></div>
                      </div>
                    </div>

                    <div className="bet-nation-odd">
                      <div className="back odd-box">
                        <span className="bet-odd"><b>-</b></span>
                      </div>
                      <div className="lay odd-box">
                        <span className="bet-odd"><b>-</b></span>
                      </div>
                    </div>
                    <div className="bet-nation-odd">
                      <div className="back odd-box">
                        <span className="bet-odd"><b>-</b></span>
                      </div>
                      <div className="lay odd-box">
                        <span className="bet-odd"><b>-</b></span>
                      </div>
                    </div>
                    <div className="bet-nation-odd">
                      <div className="back odd-box">
                        <span className="bet-odd"><b>-</b></span>
                      </div>
                      <div className="lay odd-box">
                        <span className="bet-odd"><b>-</b></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Goal2 row when Football is selected */}
                {(tabEventId === 1) && (
                  <div className="bet-table-row">
                    <div className="bet-nation-name">
                      <Link to="/casino-list/goal2" className="bet-nation-game-name">
                        <span>Goal2</span>
                      </Link>
                      <div className="game-icons">
                        <div className="game-icon">
                          <span className="active"></span>
                        </div>
                        <div className="game-icon">
                          <i className="fas fa-tv icon-tv"></i>
                        </div>
                        <div className="game-icon"></div>
                        <div className="game-icon"></div>
                        <div className="game-icon"></div>
                      </div>
                    </div>
                    <div className="bet-nation-odd suspended-box">
                      <div className="back odd-box">
                        <span className="bet-odd"><b>-</b></span>
                      </div>
                      <div className="lay odd-box">
                        <span className="bet-odd"><b>-</b></span>
                      </div>
                    </div>
                    <div className="bet-nation-odd">
                      <div className="back odd-box">
                        <span className="bet-odd"><b>-</b></span>
                      </div>
                      <div className="lay odd-box">
                        <span className="bet-odd"><b>-</b></span>
                      </div>
                    </div>
                    <div className="bet-nation-odd suspended-box">
                      <div className="back odd-box">
                        <span className="bet-odd"><b>-</b></span>
                      </div>
                      <div className="lay odd-box">
                        <span className="bet-odd"><b>-</b></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event rows */}
                {filteredMatches.length === 0 ? (
                  <div className="bet-table-row p-3 text-center w-100">
                    No Record Found
                  </div>
                ) : (
                  filteredMatches.map((m, idx) => {
                    return (
                      <div className="bet-table-row" key={idx}>
                        <div className="bet-nation-name">
                          <Link
                            to={`/game-details/${m.sportId}/${m.id}`}
                            className="bet-nation-game-name"
                          >
                            <span>{m.name}</span>
                            <span className="d-none d-md-inline-block">&nbsp;/&nbsp;</span>
                            <span>{m.date}</span>
                          </Link>
                          <div className="game-icons">
                            <div className="game-icon">
                              {m.isInPlay && <span className="active"></span>}
                            </div>
                            <div className="game-icon">
                              {m.hasTv && <i className="fas fa-tv icon-tv"></i>}
                            </div>
                            <div className="game-icon">
                              {m.hasFancy && <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: '10px', padding: '2px 4px' }}>F</span>}
                            </div>
                            <div className="game-icon">
                              {m.hasBookmaker && <span className="badge bg-info text-white fw-bold" style={{ fontSize: '10px', padding: '2px 4px' }}>BM</span>}
                            </div>
                            <div className="game-icon"></div>
                          </div>
                        </div>

                        {/* Mobile Odd column labels */}
                        <div className="bet-nation-odd d-xl-none">
                          <b>1</b>
                        </div>
                        <div className="bet-nation-odd d-xl-none">
                          <b>X</b>
                        </div>
                        <div className="bet-nation-odd d-xl-none">
                          <b>2</b>
                        </div>

                        {/* Selection 1 Odds (Back & Lay) */}
                        <div className="bet-nation-odd">
                          <div
                            className="back odd-box pointer"
                            onClick={() => handleOddsClick(m, m.team1, 'back', m.odds?.team1?.back)}
                            style={{ cursor: 'pointer' }}
                          >
                            <span className="bet-odd">
                              <b>{m.odds?.team1?.back || '-'}</b>
                            </span>
                          </div>
                          <div
                            className="lay odd-box pointer"
                            onClick={() => handleOddsClick(m, m.team1, 'lay', m.odds?.team1?.lay)}
                            style={{ cursor: 'pointer' }}
                          >
                            <span className="bet-odd">
                              <b>{m.odds?.team1?.lay || '-'}</b>
                            </span>
                          </div>
                        </div>

                        {/* Selection X / Draw Odds */}
                        <div className="bet-nation-odd">
                          <div
                            className={`back odd-box ${m.odds?.draw?.back !== '-' ? 'pointer' : ''}`}
                            onClick={() => m.odds?.draw?.back !== '-' && handleOddsClick(m, 'The Draw', 'back', m.odds?.draw?.back)}
                            style={{ cursor: m.odds?.draw?.back !== '-' ? 'pointer' : 'default' }}
                          >
                            <span className="bet-odd">
                              <b>{m.odds?.draw?.back || '-'}</b>
                            </span>
                          </div>
                          <div
                            className={`lay odd-box ${m.odds?.draw?.lay !== '-' ? 'pointer' : ''}`}
                            onClick={() => m.odds?.draw?.lay !== '-' && handleOddsClick(m, 'The Draw', 'lay', m.odds?.draw?.lay)}
                            style={{ cursor: m.odds?.draw?.lay !== '-' ? 'pointer' : 'default' }}
                          >
                            <span className="bet-odd">
                              <b>{m.odds?.draw?.lay || '-'}</b>
                            </span>
                          </div>
                        </div>

                        {/* Selection 2 Odds (Back & Lay) */}
                        <div className="bet-nation-odd">
                          <div
                            className="back odd-box pointer"
                            onClick={() => handleOddsClick(m, m.team2, 'back', m.odds?.team2?.back)}
                            style={{ cursor: 'pointer' }}
                          >
                            <span className="bet-odd">
                              <b>{m.odds?.team2?.back || '-'}</b>
                            </span>
                          </div>
                          <div
                            className="lay odd-box pointer"
                            onClick={() => handleOddsClick(m, m.team2, 'lay', m.odds?.team2?.lay)}
                            style={{ cursor: 'pointer' }}
                          >
                            <span className="bet-odd">
                              <b>{m.odds?.team2?.lay || '-'}</b>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Casino List Grid (Matching target 7/10-column grid) */}
        <div className="casino-list mt-2">
          {CASINO_GAMES.map((game, idx) => {
            const title = game.gname || game.name;
            const image = game.image || (game.imgpath ? `https://cdn.926assets.com/casino-icons/lc/${game.imgpath}` : 'https://cdn.926assets.com/casino-icons/default.jpg');
            return (
              <div className="casino-list-item" key={idx}>
                <Link to={`/casino-list/${game.category || 'LC'}`}>
                  <div
                    className="casino-list-item-banner"
                    style={{
                      backgroundImage: `url(${image}), url(https://cdn.926assets.com/casino-icons/default.jpg)`
                    }}
                  />
                  <div className="casino-list-name">{title}</div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Floating Bet Slip (When odd is clicked on Home page) */}
        {activeBet && (
          <div
            className="floating-place-bet shadow-lg"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '380px',
              maxWidth: 'calc(100vw - 40px)',
              zIndex: 1080,
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid #04a1a6'
            }}
          >
            <div className="sidebar-box place-bet-container m-0">
              <div className="sidebar-title d-flex justify-content-between align-items-center">
                <h4>Place Bet</h4>
                <button
                  type="button"
                  className="btn btn-sm text-white p-0 me-2"
                  onClick={cancelBet}
                  style={{ background: 'transparent', border: 'none' }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {betSuccessMsg && (
                <div className="alert alert-success py-1 px-2 m-2 small text-center">
                  <i className="fas fa-check-circle me-1"></i> {betSuccessMsg}
                </div>
              )}

              <div className={`place-bet-box ${activeBet.type.toLowerCase()}`}>
                <div className="place-bet-box-header">
                  <div className="place-bet-for">(Bet for)</div>
                  <div className="place-bet-odds">Odds</div>
                  <div className="place-bet-stake">Stake</div>
                  <div className="place-bet-profit">Profit</div>
                </div>

                <div className="place-bet-box-body">
                  <div className="place-bet-for">
                    <span>{activeBet.selection}</span>
                  </div>

                  <div className="place-bet-odds">
                    <input
                      type="text"
                      value={activeBet.odds}
                      className="form-control"
                      disabled
                    />
                    <div className="spinner-buttons input-group-btn btn-group-vertical">
                      <button
                        type="button"
                        className="btn-default"
                        onClick={() => updateOdds(Number((Number(activeBet.odds) + 0.01).toFixed(2)))}
                      >
                        <i className="fa fa-angle-up"></i>
                      </button>
                      <button
                        type="button"
                        className="btn-default"
                        onClick={() => updateOdds(Math.max(1.01, Number((Number(activeBet.odds) - 0.01).toFixed(2))))}
                      >
                        <i className="fa fa-angle-down"></i>
                      </button>
                    </div>
                  </div>

                  <div className="place-bet-stake">
                    <input
                      type="number"
                      value={activeBet.stake || ''}
                      placeholder="0"
                      onChange={(e) => setStake(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="place-bet-profit">
                    {activeBet.type.toLowerCase() === 'back'
                      ? Math.round(Number(activeBet.stake || 0) * (Number(activeBet.odds) - 1))
                      : Number(activeBet.stake || 0)}
                  </div>
                </div>

                <div className="place-bet-buttons">
                  {[100, 500, 1000, 5000, 10000, 25000].map(val => (
                    <button
                      type="button"
                      key={val}
                      className="btn btn-place-bet"
                      onClick={() => addStake(val)}
                    >
                      +{val}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setStake(0)}
                    className="btn btn-sm btn-link text-dark flex-fill text-end"
                  >
                    clear
                  </button>
                </div>

                <div className="place-bet-action-buttons">
                  <div>
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={() => alert('Quick stake values are configured.')}
                    >
                      Edit
                    </button>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="btn btn-danger me-1"
                      onClick={cancelBet}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      disabled={!activeBet.stake || Number(activeBet.stake) <= 0}
                      onClick={placeBet}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
