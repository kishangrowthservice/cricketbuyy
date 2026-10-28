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

  const isBack = activeBet?.type?.toLowerCase() === 'back';
  const odds = Number(activeBet?.odds || 1);
  const stake = Number(activeBet?.stake || 0);

  const profit = isBack
    ? Math.round(stake * (odds - 1))
    : stake;

  const liability = !isBack
    ? Math.round(stake * (odds - 1))
    : stake;

  return (
    <div className="sidebar right-sidebar">
      {/* Live Match Screen */}
      <div className="sidebar-box">
        <div className="sidebar-title">
          <h4>Live Match</h4>
        </div>
        <div className="live-tv">
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #092c30 0%, #031315 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              borderBottom: '1px solid #04a1a6'
            }}
          >
            <i className="fas fa-play-circle fa-2x text-warning mb-2" style={{ cursor: 'pointer' }}></i>
            <span className="small text-white fw-bold">Live Cricket Stream</span>
            <span className="text-muted" style={{ fontSize: '11px' }}>Live broadcast available in-play</span>
          </div>
        </div>
      </div>

      {/* Place Bet Container */}
      <div className="sidebar-box place-bet-container mt-2">
        <div className="sidebar-title">
          <h4>Place Bet</h4>
        </div>

        {betSuccessMsg && (
          <div className="alert alert-success py-1 px-2 m-2 small text-center">
            <i className="fas fa-check-circle me-1"></i> {betSuccessMsg}
          </div>
        )}

        {activeBet ? (
          <div className={`place-bet-box ${isBack ? 'back' : 'lay'}`}>
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
                    onClick={() => updateOdds(Number((odds + 0.01).toFixed(2)))}
                  >
                    <i className="fa fa-angle-up"></i>
                  </button>
                  <button
                    type="button"
                    className="btn-default"
                    onClick={() => updateOdds(Math.max(1.01, Number((odds - 0.01).toFixed(2))))}
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
                {profit}
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
        ) : (
          <div className="p-3 text-center text-muted small" style={{ background: '#f7f7f7' }}>
            Click on any Back (blue) or Lay (pink) odd to place a bet
          </div>
        )}
      </div>

      {/* Open Bets / My Bets Container */}
      <div className="sidebar-box my-bet-container mt-2">
        <div className="sidebar-title">
          <h4>My Bets ({openBets.length})</h4>
        </div>
        {openBets.length === 0 ? (
          <div className="p-3 text-center text-muted small" style={{ background: '#f7f7f7' }}>
            No open bets
          </div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table className="table table-sm m-0" style={{ fontSize: '12px' }}>
              <thead>
                <tr className="bg-light">
                  <th>Nation</th>
                  <th>Type</th>
                  <th>Odds</th>
                  <th>Stake</th>
                </tr>
              </thead>
              <tbody>
                {openBets.map((bet, idx) => (
                  <tr key={idx} className={bet.type === 'back' ? 'table-info' : 'table-danger'}>
                    <td className="fw-bold">{bet.selection}</td>
                    <td className="text-uppercase fw-bold">{bet.type}</td>
                    <td>{bet.odds}</td>
                    <td>₹{bet.stake}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
