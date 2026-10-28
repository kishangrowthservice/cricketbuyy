import React, { useState } from 'react';
import { CASINO_GAMES } from '../data/mockData';

export const CasinoListPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Games', icon: 'fas fa-th' },
    { id: 'crash', label: 'Crash / Aviator', icon: 'fas fa-plane' },
    { id: 'live', label: 'Live Casino', icon: 'fas fa-broadcast-tower' },
    { id: 'table', label: 'Table Games', icon: 'fas fa-chess-board' },
  ];

  const filtered = CASINO_GAMES.filter(game => {
    const matchesCat = activeCategory === 'all' || game.category === activeCategory;
    const matchesSearch = game.gname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="center-main-container casino-page">
      <div className="center-container">
        {/* Banner */}
        <div 
          className="p-4 mb-4 rounded d-flex flex-wrap justify-content-between align-items-center"
          style={{
            background: 'linear-gradient(135deg, #093438 0%, #031c1e 100%)',
            border: '1px solid #04a1a6'
          }}
        >
          <div>
            <span className="badge bg-warning text-dark mb-1 fw-bold">PREMIUM CASINO</span>
            <h2 className="text-white fs-4 fw-bold m-0">Live Dealer & Crash Gaming Hub</h2>
            <p className="text-white-50 small m-0 mt-1">Play Evolution, Ezugi, Spribe Aviator and Smartsoft titles with verified fair RTP.</p>
          </div>
          <div className="mt-3 mt-md-0">
            <span className="badge bg-danger p-2 fs-6 blink_me">
              <i className="fas fa-fire me-1"></i> Aviator Live Multiplier: 4.82x
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          {/* Categories */}
          <div className="btn-group">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`btn btn-sm ${activeCategory === cat.id ? 'btn-info text-dark fw-bold' : 'btn-dark text-white'}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <i className={`${cat.icon} me-1`}></i> {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ maxWidth: '240px', width: '100%' }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-dark border-secondary text-muted">
                <i className="fas fa-search"></i>
              </span>
              <input 
                type="text" 
                className="form-control bg-dark text-white border-secondary" 
                placeholder="Search games..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Casino Grid */}
        <div className="row g-3">
          {filtered.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted">
              <i className="fas fa-search fa-2x mb-2 text-secondary"></i>
              <p>No games found matching "{searchQuery}".</p>
            </div>
          ) : (
            filtered.map(game => (
              <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={game.id}>
                <div 
                  className="casino-card rounded overflow-hidden shadow-sm position-relative"
                  style={{
                    background: game.bg || '#1a2228',
                    height: '160px',
                    cursor: 'pointer',
                    border: '1px solid #28333c',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onClick={() => alert(`Launching ${game.gname} in Demo Mode!`)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div className="p-3 d-flex flex-column justify-content-between h-100">
                    <div className="d-flex justify-content-between">
                      <span className="badge bg-dark text-warning border border-secondary" style={{ fontSize: '9px' }}>
                        {game.provider}
                      </span>
                      {game.category === 'crash' && (
                        <span className="badge bg-danger blink_me" style={{ fontSize: '9px' }}>HOT</span>
                      )}
                    </div>
                    <div>
                      <h6 className="text-white fw-bold m-0 fs-6">{game.gname}</h6>
                      <small className="text-white-50 text-capitalize">{game.category}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
