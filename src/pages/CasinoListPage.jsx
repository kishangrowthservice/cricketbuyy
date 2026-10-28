import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CASINO_GAMES } from '../data/mockData';
import { RightSidebar } from '../components/RightSidebar';
import { useBetSlip } from '../context/BetSlipContext';

export const CasinoListPage = () => {
  const { cType, type } = useParams();
  const [activeCategory, setActiveCategory] = useState(cType || type || 'all');
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedStake, setSelectedStake] = useState(100);
  const [gameMessage, setGameMessage] = useState('');
  const { selectBet } = useBetSlip();

  const categories = [
    { id: 'all', label: 'All Games' },
    { id: 'live', label: 'Live Casino' },
    { id: 'crash', label: 'Crash / Aviator' },
    { id: 'table', label: 'Table Games' },
    { id: 'slots', label: 'Slots' }
  ];

  const filtered = activeCategory === 'all'
    ? CASINO_GAMES
    : CASINO_GAMES.filter(g => g.category === activeCategory);

  const handlePlaceCasinoBet = (betOption) => {
    setGameMessage(`Bet of ₹${selectedStake} placed on ${betOption}!`);
    selectBet({
      matchId: selectedGame.id,
      matchName: selectedGame.gname,
      selection: betOption,
      type: 'back',
      odds: '1.98',
      stake: selectedStake
    });
    setTimeout(() => setGameMessage(''), 3000);
  };

  return (
    <div className="center-main-container casino-page d-flex">
      <div className="center-container flex-grow-1">
        {/* Category Pills */}
        <div className="casino-sub-tab-list mb-2">
          <ul className="nav casino-tab" style={{ background: 'var(--bg-secondary)', padding: '5px' }}>
            {categories.map(cat => (
              <li className="nav-item" key={cat.id} style={{ width: 'auto' }}>
                <button
                  type="button"
                  className={`nav-link btn py-1 px-3 ${activeCategory === cat.id ? 'active fw-bold' : 'text-white'}`}
                  style={{
                    borderRadius: '0',
                    background: activeCategory === cat.id ? 'var(--bg-primary)' : 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Live Dealer / Game Launch Simulation */}
        {selectedGame && (
          <div className="casino-game-frame mb-3 p-3 text-center rounded shadow" style={{ background: '#000', border: '2px solid var(--bg-primary)', position: 'relative' }}>
            <div className="d-flex justify-content-between align-items-center mb-2 border-bottom border-secondary pb-2">
              <span className="text-white fw-bold">
                <i className="fas fa-circle text-danger me-1 blink_me"></i> {selectedGame.gname} - Live Stream
              </span>
              <button
                type="button"
                className="btn btn-sm btn-danger py-0 px-2"
                onClick={() => setSelectedGame(null)}
              >
                <i className="fas fa-times"></i> Close
              </button>
            </div>
            <div style={{ height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle, #093438 0%, #031c1e 100%)' }}>
              <i className="fas fa-gamepad fa-4x text-info mb-3"></i>
              <h4 className="text-white fw-bold">{selectedGame.gname} Active</h4>
              <p className="text-muted small">Provider: {selectedGame.provider} &bull; Provably Fair &bull; Round #849104</p>
              
              {/* Quick Betting Options */}
              <div className="d-flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm px-3"
                  onClick={() => handlePlaceCasinoBet('Player / Runner A')}
                >
                  Runner A (1.98)
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-3"
                  onClick={() => handlePlaceCasinoBet('Banker / Runner B')}
                >
                  Runner B (1.98)
                </button>
                <button
                  type="button"
                  className="btn btn-warning btn-sm px-3 text-dark fw-bold"
                  onClick={() => handlePlaceCasinoBet('Tie (8.50)')}
                >
                  Tie (8.50)
                </button>
              </div>

              {/* Stake Chips */}
              <div className="d-flex gap-2 mt-3 align-items-center">
                <span className="text-light small">Chip:</span>
                {[100, 500, 1000, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    className={`btn btn-sm rounded-circle ${selectedStake === val ? 'btn-warning text-dark fw-bold' : 'btn-outline-light'}`}
                    style={{ width: '42px', height: '42px', padding: 0, fontSize: '11px' }}
                    onClick={() => setSelectedStake(val)}
                  >
                    {val >= 1000 ? `${val/1000}K` : val}
                  </button>
                ))}
              </div>

              {gameMessage && (
                <div className="badge bg-success mt-2 py-1 px-3">
                  {gameMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Casino List Grid (Matching target 7-column / 10-column layout) */}
        <div className="casino-list mt-2">
          {filtered.map((game, idx) => {
            const title = game.gname || game.name;
            const image = game.image || (game.imgpath ? `https://cdn.926assets.com/casino-icons/lc/${game.imgpath}` : 'https://cdn.926assets.com/casino-icons/default.jpg');
            return (
              <div
                className="casino-list-item"
                key={idx}
                onClick={() => setSelectedGame(game)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="casino-list-item-banner"
                  style={{
                    backgroundImage: `url(${image}), url(https://cdn.926assets.com/casino-icons/default.jpg)`
                  }}
                />
                <div className="casino-list-name">{title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Sidebar for Casino Bets */}
      <RightSidebar />
    </div>
  );
};
