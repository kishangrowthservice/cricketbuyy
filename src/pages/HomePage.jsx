import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { NEW_EVENTS, MATCHES_DATA, CASINO_GAMES } from '../data/mockData';
import { useBetSlip } from '../context/BetSlipContext';

export const HomePage = () => {
  const [tabEventId, setTabEventId] = useState(4); // default 4 = Cricket
  const [horseSubTab, setHorseSubTab] = useState(0);
  const { selectBet } = useBetSlip();

  // Authentic Sports Tabs matching yd
  const tabs = [
    { eid: 'all', ename: 'All Sports' },
    { eid: 'inplay', ename: 'In-Play (5)' },
    { eid: 4, ename: 'Cricket' },
    { eid: 1, ename: 'Football' },
    { eid: 2, ename: 'Tennis' },
    { eid: 8, ename: 'Table Tennis' },
    { eid: 10, ename: 'Horse Racing' },
    { eid: 65, ename: 'Greyhound Racing' }
  ];

  // Horse Racing Mock Tracks
  const horseTracks = [
    {
      cname: 'Cheltenham',
      races: [
        { ename: '14:30 Novices Hurdle', stime: '14:30', iplay: true, etid: 10, gmid: 'hr_chel_1' },
        { ename: '15:10 Champion Hurdle', stime: '15:10', iplay: false, etid: 10, gmid: 'hr_chel_2' },
        { ename: '15:50 Steeplechase', stime: '15:50', iplay: false, etid: 10, gmid: 'hr_chel_3' }
      ]
    },
    {
      cname: 'Kempton',
      races: [
        { ename: '17:00 Stakes', stime: '17:00', iplay: false, etid: 10, gmid: 'hr_kemp_1' },
        { ename: '17:30 Handicap', stime: '17:30', iplay: false, etid: 10, gmid: 'hr_kemp_2' }
      ]
    }
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
            {/* If Horse Racing (10) or Greyhound (65) */}
            {(tabEventId === 10 || tabEventId === 65) ? (
              <div className="bet-table position-relative horse-table">
                <ul className="nav nav-pills mb-2 p-1" style={{ background: 'var(--bg-secondary)' }}>
                  {horseTracks.map((trk, i) => (
                    <li className="nav-item me-1" key={i}>
                      <button
                        type="button"
                        className={`nav-link btn btn-sm py-1 px-3 ${horseSubTab === i ? 'active bg-primary text-white' : 'text-white'}`}
                        onClick={() => setHorseSubTab(i)}
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        {trk.cname}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="bet-table-body">
                  {horseTracks[horseSubTab].races.map((race, rIdx) => (
                    <div className="bet-table-row" key={rIdx}>
                      <div className="bet-nation-name">
                        <div className="game-icon">
                          <i className="fas fa-tv icon-tv"></i>
                        </div>
                        <div className="bet-nation-game-name">
                          <span>{race.ename}</span>
                        </div>
                      </div>
                      <div className="horse-time-detail">
                        <Link to={`/game-details/${race.etid}/${race.gmid}`}>
                          <span className={`badge ${race.iplay ? 'bg-success active' : 'bg-secondary'}`}>
                            {race.stime}
                          </span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
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
                  {/* Super Over2 row when Cricket or All Sports */}
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
                            <img src="https://cdn.926assets.com/g3ver/v107/static/front/img/ic_fancy.png" alt="Fancy" style={{ width: '16px', height: '16px' }} />
                          </div>
                          <div className="game-icon">
                            <img src="https://cdn.926assets.com/g3ver/v107/static/front/img/ic_bm.png" alt="BM" style={{ width: '16px', height: '16px' }} />
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

                  {/* Goal2 row when Football */}
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
                    filteredMatches.map((m, idx) => (
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
                              {m.hasFancy && <img src="https://cdn.926assets.com/g3ver/v107/static/front/img/ic_fancy.png" alt="Fancy" style={{ width: '16px', height: '16px' }} />}
                            </div>
                            <div className="game-icon">
                              {m.hasBookmaker && <img src="https://cdn.926assets.com/g3ver/v107/static/front/img/ic_bm.png" alt="BM" style={{ width: '16px', height: '16px' }} />}
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

                        {/* 1 Runner Odds */}
                        <div className="bet-nation-odd">
                          <div
                            className="back odd-box"
                            onClick={() => handleOddsClick(m, m.team1, 'back', m.odds?.team1?.back)}
                          >
                            <span className="bet-odd">
                              <b>{m.odds?.team1?.back || '-'}</b>
                            </span>
                          </div>
                          <div
                            className="lay odd-box"
                            onClick={() => handleOddsClick(m, m.team1, 'lay', m.odds?.team1?.lay)}
                          >
                            <span className="bet-odd">
                              <b>{m.odds?.team1?.lay || '-'}</b>
                            </span>
                          </div>
                        </div>

                        {/* X (Draw) Runner Odds */}
                        <div className="bet-nation-odd">
                          <div
                            className="back odd-box"
                            onClick={() => handleOddsClick(m, 'The Draw', 'back', m.odds?.draw?.back)}
                          >
                            <span className="bet-odd">
                              <b>{m.odds?.draw?.back || '-'}</b>
                            </span>
                          </div>
                          <div
                            className="lay odd-box"
                            onClick={() => handleOddsClick(m, 'The Draw', 'lay', m.odds?.draw?.lay)}
                          >
                            <span className="bet-odd">
                              <b>{m.odds?.draw?.lay || '-'}</b>
                            </span>
                          </div>
                        </div>

                        {/* 2 Runner Odds */}
                        <div className="bet-nation-odd">
                          <div
                            className="back odd-box"
                            onClick={() => handleOddsClick(m, m.team2, 'back', m.odds?.team2?.back)}
                          >
                            <span className="bet-odd">
                              <b>{m.odds?.team2?.back || '-'}</b>
                            </span>
                          </div>
                          <div
                            className="lay odd-box"
                            onClick={() => handleOddsClick(m, m.team2, 'lay', m.odds?.team2?.lay)}
                          >
                            <span className="bet-odd">
                              <b>{m.odds?.team2?.lay || '-'}</b>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Casino List Grid at bottom */}
        <div className="casino-list mt-3">
          {CASINO_GAMES.map((game, idx) => {
            const title = game.gname || game.name;
            const image = game.image || (game.imgpath ? `https://cdn.926assets.com/casino-icons/lc/${game.imgpath}` : 'https://cdn.926assets.com/casino-icons/default.jpg');
            return (
              <div className="casino-list-item" key={idx}>
                <Link to="/casino-list">
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
      </div>
    </div>
  );
};
