import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const BetSlipContext = createContext();

export const BetSlipProvider = ({ children }) => {
  const { isLoggedIn, loginDemo, updateBalance } = useAuth();
  const [activeBet, setActiveBet] = useState(null);
  const [openBets, setOpenBets] = useState([]);
  const [activeTab, setActiveTab] = useState('betslip'); // 'betslip' | 'openbets'
  const [betSuccessMsg, setBetSuccessMsg] = useState('');

  const selectBet = (bet) => {
    setActiveBet({
      matchId: bet.matchId,
      matchName: bet.matchName,
      selection: bet.selection,
      type: bet.type || 'back', // 'back' or 'lay'
      odds: parseFloat(bet.odds) || 1.95,
      stake: 500,
      minStake: 100,
      maxStake: 100000
    });
    setActiveTab('betslip');
    setBetSuccessMsg('');
  };

  const updateOdds = (delta) => {
    if (!activeBet) return;
    const newOdds = Math.max(1.01, +(activeBet.odds + delta).toFixed(2));
    setActiveBet({ ...activeBet, odds: newOdds });
  };

  const setStake = (val) => {
    if (!activeBet) return;
    const num = Math.max(0, parseInt(val) || 0);
    setActiveBet({ ...activeBet, stake: num });
  };

  const addStake = (amount) => {
    if (!activeBet) return;
    setActiveBet({ ...activeBet, stake: (activeBet.stake || 0) + amount });
  };

  const cancelBet = () => {
    setActiveBet(null);
    setBetSuccessMsg('');
  };

  const placeBet = () => {
    if (!activeBet) return;
    if (!isLoggedIn) {
      loginDemo();
    }
    const potentialProfit = activeBet.type === 'back'
      ? Math.round(activeBet.stake * (activeBet.odds - 1))
      : activeBet.stake;

    const liability = activeBet.type === 'lay'
      ? Math.round(activeBet.stake * (activeBet.odds - 1))
      : activeBet.stake;

    const newBet = {
      id: 'BET-' + Date.now().toString().slice(-6),
      time: new Date().toLocaleTimeString(),
      ...activeBet,
      potentialProfit,
      liability
    };

    setOpenBets(prev => [newBet, ...prev]);
    updateBalance(-liability, liability);
    setBetSuccessMsg('Bet placed successfully!');
    setTimeout(() => {
      setActiveBet(null);
      setBetSuccessMsg('');
    }, 2000);
  };

  return (
    <BetSlipContext.Provider value={{
      activeBet,
      openBets,
      activeTab,
      setActiveTab,
      betSuccessMsg,
      selectBet,
      updateOdds,
      setStake,
      addStake,
      cancelBet,
      placeBet
    }}>
      {children}
    </BetSlipContext.Provider>
  );
};

export const useBetSlip = () => useContext(BetSlipContext);

