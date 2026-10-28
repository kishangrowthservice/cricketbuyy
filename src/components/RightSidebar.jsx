import React from 'react';
import { useBetSlip } from '../context/BetSlipContext';

export const RightSidebar = () => {
  const { 
    activeBet, 
    openBets, 
    activeTab, 
    setActiveTab, 
    betSuccessMsg, 
    updateOdds, 
    setStake, 
    addStake, 
    cancelBet, 
    placeBet 
  } = useBetSlip();

  const isBack = activeBet?.type === 'back';
  const quickStakes = [100, 500, 1000, 5000, 10000, 25000, 50000];

  const potentialProfit = activeBet 
    ? (isBack 
        ? Math.round((activeBet.stake || 0) * (activeBet.odds - 1))
        : (activeBet.stake || 0))
    : 0;

  const liability = activeBet
    ? (!isBack
        ? Math.round((activeBet.stake || 0) * (activeBet.odds - 1))
        : (activeBet.stake || 0))
    : 0;

  return (
    <div className="sidebar right-sidebar">
      {/* Live Match Card */}
      <div className="sidebar-box mb-3">
        <div className="sidebar-title d-flex justify-content-between align-items-center">
          <h4 className="m-0 fs-6"><i className="fas fa-tv me-2 text-danger"></i> Live Match</h4>
          <span className="badge bg-danger rounded-pill blink_me">LIVE</span>
        </div>
        <div className="live-tv p-2 text-center" style={{ background: '#0e1215' }}>
          <div 
            style={{ 
              height: '140px', 
              background: 'linear-gradient(135deg, #092c30 0%, #031315 100%)', 
              borderRadius: '6px',
              border: '1px solid #04a1a6',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <i className="fas fa-play-circle fa-2x text-warning mb-2" style={{ cursor: 'pointer' }}></i>
            <span className="small text-white fw-bold">Live Cricket Stream</span>
            <span className="text-muted" style={{ fontSize: '11px' }}>ICC Champions Trophy 2026</span>
          </div>
        </div>
      </div>

      {/* Bet Slip Box */}
      <div className="sidebar-box place-bet-container">
        {/* Tabs for Bet Slip & Open Bets */}
        <div className="d-flex border-bottom border-dark" style={{ background: '#1c2125' }}>
          <button 
            type="button"
            className={`btn btn-sm flex-grow-1 rounded-0 py-2 fw-bold ${activeTab === 'betslip' ? 'bg-info text-dark' : 'text-white'}`}
            onClick={() => setActiveTab('betslip')}
          >
            Bet Slip {activeBet && <span className="badge bg-danger ms-1">1</span>}
          </button>
          <button 
            type="button"
            className={`btn btn-sm flex-grow-1 rounded-0 py-2 fw-bold ${activeTab === 'openbets' ? 'bg-info text-dark' : 'text-white'}`}
            onClick={() => setActiveTab('openbets')}
          >
            Open Bets ({openBets.length})
          </button>
        </div>

        {/* Tab 1: Bet Slip */}
        {activeTab === 'betslip' && (
          <div className="p-2">
            {betSuccessMsg && (
              <div className="alert alert-success py-1 px-2 small mb-2 text-center">
                <i className="fas fa-check-circle me-1"></i> {betSuccessMsg}
              </div>
            )}

            {activeBet ? (
              <div 
                className="place-bet-box p-3 rounded"
                style={{
                  background: isBack ? '#e8f4fc' : '#fdf0f3',
                  color: '#111',
                  border: isBack ? '1px solid #72bbef' : '1px solid #faa9ba'
                }}
              >
                {/* Header info */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span 
                      className={`badge ${isBack ? 'bg-primary' : 'bg-danger'} text-uppercase me-1`}
                      style={{ fontSize: '11px' }}
                    >
                      {activeBet.type}
                    </span>
                    <b className="fs-6 text-dark">{activeBet.selection}</b>
                    <div className="small text-muted">{activeBet.matchName}</div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-close btn-sm"
                    onClick={cancelBet}
                  ></button>
                </div>

                {/* Odds & Stake Inputs */}
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small text-muted mb-1">Odds</label>
                    <div className="input-group input-group-sm">
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => updateOdds(-0.01)}
                      >-</button>
                      <input 
                        type="number" 
                        className="form-control text-center fw-bold" 
                        value={activeBet.odds}
                        step="0.01"
                        onChange={(e) => setActiveBet({ ...activeBet, odds: parseFloat(e.target.value) || 1.01 })}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => updateOdds(0.01)}
                      >+</button>
                    </div>
                  </div>

                  <div className="col-6">
                    <label className="form-label small text-muted mb-1">Stake</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm text-center fw-bold" 
                      value={activeBet.stake || ''}
                      placeholder="0"
                      onChange={(e) => setStake(e.target.value)}
                    />
                  </div>
                </div>

                {/* Quick Stake Chips */}
                <div className="quick-stakes d-flex flex-wrap gap-1 mb-3">
                  {quickStakes.map(amt => (
                    <button 
                      key={amt}
                      type="button"
                      className="btn btn-xs btn-outline-dark py-0 px-2 rounded"
                      style={{ fontSize: '11px', background: '#fff' }}
                      onClick={() => addStake(amt)}
                    >
                      +{amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                  <button 
                    type="button"
                    className="btn btn-xs btn-outline-danger py-0 px-2 rounded"
                    style={{ fontSize: '11px', background: '#fff' }}
                    onClick={() => setStake(0)}
                  >
                    Clear
                  </button>
                </div>

                {/* P&L Info */}
                <div className="d-flex justify-content-between small text-dark border-top pt-2 mb-3">
                  <span>Profit: <b className="text-success">₹{potentialProfit.toLocaleString('en-IN')}</b></span>
                  <span>Liability: <b className="text-danger">₹{liability.toLocaleString('en-IN')}</b></span>
                </div>

                {/* Actions */}
                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary flex-grow-1"
                    onClick={cancelBet}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className={`btn btn-sm flex-grow-1 fw-bold ${isBack ? 'btn-primary' : 'btn-danger'}`}
                    disabled={!activeBet.stake || activeBet.stake <= 0}
                    onClick={placeBet}
                  >
                    Place Bet
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-ticket-alt fa-2x mb-2 text-secondary"></i>
                <p className="small m-0">Click on any odds to place a bet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Open Bets */}
        {activeTab === 'openbets' && (
          <div className="p-2">
            {openBets.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <i className="fas fa-folder-open fa-2x mb-2 text-secondary"></i>
                <p className="m-0">No open bets currently.</p>
              </div>
            ) : (
              <div className="open-bets-list">
                {openBets.map(b => (
                  <div 
                    key={b.id} 
                    className="p-2 mb-2 rounded small"
                    style={{
                      background: b.type === 'back' ? '#0f2738' : '#38141c',
                      borderLeft: `4px solid ${b.type === 'back' ? '#72bbef' : '#faa9ba'}`
                    }}
                  >
                    <div className="d-flex justify-content-between fw-bold text-white">
                      <span>{b.selection}</span>
                      <span className="badge bg-secondary">{b.id}</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>{b.matchName}</div>
                    <div className="d-flex justify-content-between mt-1 text-white-50">
                      <span>Odds: <b className="text-white">{b.odds}</b></span>
                      <span>Stake: <b className="text-white">₹{b.stake}</b></span>
                      <span>P&L: <b className="text-success">+₹{b.potentialProfit}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 24x7 Customer Support Card */}
      <div className="sidebar-box mt-3 p-3 rounded" style={{ background: '#1c2125', border: '1px solid #2a3239' }}>
        <h5 className="fs-6 text-warning mb-2"><i className="fas fa-headset me-2"></i> 24X7 Instant Support</h5>
        <p className="small text-muted mb-2">Need help with deposits, withdrawals or rules? Contact our dedicated support desk.</p>
        <div className="d-grid gap-2">
          <a 
            href="https://wa.me/919876543210" 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-sm btn-success d-flex align-items-center justify-content-center"
          >
            <i className="fab fa-whatsapp me-2 fs-6"></i> WhatsApp Support
          </a>
          <a 
            href="https://t.me/silverbhai_official" 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-sm btn-info text-white d-flex align-items-center justify-content-center"
          >
            <i className="fab fa-telegram me-2 fs-6"></i> Telegram Channel
          </a>
        </div>
      </div>
    </div>
  );
};

