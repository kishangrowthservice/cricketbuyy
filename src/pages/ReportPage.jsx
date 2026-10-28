import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBetSlip } from '../context/BetSlipContext';

export const AccountStatementPage = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('7');

  const statements = [
    { date: '2026-10-28 22:30', narration: 'Deposit via UPI / IMPS Ref #99281734', credit: '1,00,000', debit: '-', balance: '1,00,000' },
    { date: '2026-10-28 23:15', narration: 'Bet Placed: Bangladesh v West Indies (BAN @ 2.14)', credit: '-', debit: '500', balance: '99,500' },
    { date: '2026-10-28 23:45', narration: 'Bet Won: South Africa v Australia (SA @ 1.75)', credit: '875', debit: '-', balance: '1,00,375' }
  ];

  return (
    <div className="center-main-container report-page">
      <div className="center-container">
        {/* Title */}
        <div className="report-table-title p-2 mb-2">
          <h4 className="m-0 fw-bold fs-6">Account Statement</h4>
        </div>

        {/* Filter bar */}
        <div className="d-flex flex-wrap gap-2 mb-3 align-items-center p-2 bg-light border">
          <div>
            <label className="form-label small fw-bold m-0 me-2">Date Range:</label>
            <select
              className="form-select d-inline-block w-auto"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="1">Today</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>
          <button type="button" className="btn btn-primary btn-sm px-3">
            Submit
          </button>
        </div>

        {/* Statement Table */}
        <div className="table-responsive bg-white border">
          <table className="table table-bordered table-striped m-0">
            <thead className="bg-light">
              <tr>
                <th>Date &amp; Time</th>
                <th>Narration</th>
                <th className="text-success text-end">Credit (₹)</th>
                <th className="text-danger text-end">Debit (₹)</th>
                <th className="text-end">Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {statements.map((s, idx) => (
                <tr key={idx}>
                  <td>{s.date}</td>
                  <td>{s.narration}</td>
                  <td className="text-success fw-bold text-end">{s.credit}</td>
                  <td className="text-danger fw-bold text-end">{s.debit}</td>
                  <td className="fw-bold text-end">{s.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const CurrentBetsPage = () => {
  const { openBets } = useBetSlip();
  const [filterType, setFilterType] = useState('all');

  return (
    <div className="center-main-container report-page">
      <div className="center-container">
        <div className="report-table-title p-2 mb-2 d-flex justify-content-between align-items-center">
          <h4 className="m-0 fw-bold fs-6">Current Open Bets</h4>
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${filterType === 'matched' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterType('matched')}
            >
              Matched ({openBets.length})
            </button>
            <button
              type="button"
              className={`btn ${filterType === 'unmatched' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterType('unmatched')}
            >
              Unmatched (0)
            </button>
          </div>
        </div>

        <div className="table-responsive bg-white border">
          <table className="table table-bordered table-striped m-0">
            <thead className="bg-light">
              <tr>
                <th>Event Name</th>
                <th>Market</th>
                <th>Selection</th>
                <th>Type</th>
                <th>Odds</th>
                <th className="text-end">Stake (₹)</th>
              </tr>
            </thead>
            <tbody>
              {openBets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No active or unsettled bets found.
                  </td>
                </tr>
              ) : (
                openBets.map((bet, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold">{bet.matchName}</td>
                    <td>Match Odds</td>
                    <td className="text-primary fw-bold">{bet.selection}</td>
                    <td>
                      <span className={`badge ${bet.type === 'back' ? 'bg-primary' : 'bg-danger'}`}>
                        {bet.type ? bet.type.toUpperCase() : 'BACK'}
                      </span>
                    </td>
                    <td className="fw-bold">{bet.odds}</td>
                    <td className="text-end fw-bold">₹{bet.stake || 100}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const CasinoResultsPage = () => {
  const results = [
    { roundId: '849103', game: 'Teen Patti Live', winner: 'Player A', result: 'Pair of Aces', time: '2026-10-28 23:55' },
    { roundId: '849102', game: 'Baccarat Super 6', winner: 'Banker', result: 'Natural 9', time: '2026-10-28 23:52' },
    { roundId: '849101', game: 'Gold Roulette', winner: 'Black 26', result: 'Color: Black', time: '2026-10-28 23:50' },
    { roundId: '849100', game: 'Lucky 7', winner: '7 Up', result: 'Card: King', time: '2026-10-28 23:48' }
  ];

  return (
    <div className="center-main-container report-page">
      <div className="center-container">
        <div className="report-table-title p-2 mb-2">
          <h4 className="m-0 fw-bold fs-6">Casino Results</h4>
        </div>
        <div className="table-responsive bg-white border">
          <table className="table table-bordered table-striped m-0">
            <thead className="bg-light">
              <tr>
                <th>Round ID</th>
                <th>Game Name</th>
                <th>Winner</th>
                <th>Result Detail</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx}>
                  <td className="fw-bold text-info">{r.roundId}</td>
                  <td>{r.game}</td>
                  <td className="fw-bold text-success">{r.winner}</td>
                  <td>{r.result}</td>
                  <td className="text-muted small">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const StatementPage = ({ type = 'Deposit' }) => {
  const items = type === 'Deposit' ? [
    { id: 'DEP-849102', date: '2026-10-28 22:30', method: 'UPI / IMPS', amount: '1,00,000', status: 'Approved' }
  ] : [
    { id: 'WTH-773912', date: '2026-10-28 21:00', method: 'Bank Transfer', amount: '25,000', status: 'Completed' }
  ];

  return (
    <div className="center-main-container report-page">
      <div className="center-container">
        <div className="report-table-title p-2 mb-2">
          <h4 className="m-0 fw-bold fs-6">{type} Statement</h4>
        </div>
        <div className="table-responsive bg-white border">
          <table className="table table-bordered table-striped m-0">
            <thead className="bg-light">
              <tr>
                <th>Reference ID</th>
                <th>Date &amp; Time</th>
                <th>Payment Method</th>
                <th className="text-end">Amount (₹)</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td className="fw-bold">{it.id}</td>
                  <td>{it.date}</td>
                  <td>{it.method}</td>
                  <td className="fw-bold text-end">₹{it.amount}</td>
                  <td className="text-center"><span className="badge bg-success">{it.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
