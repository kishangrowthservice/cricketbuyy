import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CASINO_GAMES } from '../data/mockData';
import { RightSidebar } from '../components/RightSidebar';

export const CasinoListPage = () => {
  const { cType, type } = useParams();
  const [activeCategory, setActiveCategory] = useState(cType || 'all');
  const [selectedGame, setSelectedGame] = useState(null);

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

  return (
    <div className="center-main-container casino-page">
      <div className="center-container">
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

        {/* Live Dealer / Game Launch Modal Simulation */}
        {selectedGame && (
          <div className="casino-game-frame mb-3 p-3 text-center rounded" style={{ background: '#000', border: '2px solid var(--bg-primary)', position: 'relative' }}>
            <div className="d-flex justify-content-between align-items-center mb-2 border-bottom border-secondary pb-2">
              <span className="text-white fw-bold">{selectedGame.gname} - Live Stream</span>
              <button
                type="button"
                className="btn btn-sm btn-danger py-0 px-2"
                onClick={() => setSelectedGame(null)}
              >
                <i className="fas fa-times"></i> Close Game
              </button>
            </div>
            <div style={{ height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle, #093438 0%, #031c1e 100%)' }}>
              <i className="fas fa-gamepad fa-4x text-info mb-3"></i>
              <h4 className="text-white fw-bold">{selectedGame.gname} Active</h4>
              <p className="text-muted small">Powered by {selectedGame.provider} • Verified Provably Fair</p>
              <div className="d-flex gap-2 mt-2">
                <button type="button" className="btn btn-success btn-sm">Place Bet (₹100)</button>
                <button type="button" className="btn btn-warning btn-sm text-dark fw-bold">Auto Cashout</button>
              </div>
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

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
};
