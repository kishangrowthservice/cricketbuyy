import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // If user has explicitly logged out, keep them logged out ('false')
  // If first visit (null), default to true so users see the live exchange immediately
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('silverbhai_logged_in');
    if (saved === 'false') return false;
    return true;
  });

  const [user, setUser] = useState(() => {
    const savedStatus = localStorage.getItem('silverbhai_logged_in');
    if (savedStatus === 'false') return null;
    const savedUser = localStorage.getItem('silverbhai_user');
    return savedUser ? JSON.parse(savedUser) : { uname: 'demouser', bal: 100000, exp: 0, isDemo: true };
  });

  const [authNotification, setAuthNotification] = useState(null);

  useEffect(() => {
    localStorage.setItem('silverbhai_logged_in', String(isLoggedIn));
    if (isLoggedIn && user) {
      localStorage.setItem('silverbhai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('silverbhai_user');
    }
  }, [isLoggedIn, user]);

  const showNotification = (message, type = 'success') => {
    setAuthNotification({ message, type });
    setTimeout(() => {
      setAuthNotification(null);
    }, 3000);
  };

  const login = (username, password) => {
    const cleanName = (username || 'user101').trim();
    const newUser = { uname: cleanName, bal: 50000, exp: 0, isDemo: false };
    setIsLoggedIn(true);
    setUser(newUser);
    showNotification(`Welcome back, ${cleanName}!`);
    return true;
  };

  const loginDemo = () => {
    const demoUser = { uname: 'demouser', bal: 100000, exp: 0, isDemo: true };
    setIsLoggedIn(true);
    setUser(demoUser);
    showNotification('Logged in with Demo ID (₹1,00,000 balance)!');
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.setItem('silverbhai_logged_in', 'false');
    localStorage.removeItem('silverbhai_user');
    showNotification('You have logged out successfully.', 'info');
  };

  const updateBalance = (amount, exposureChange = 0) => {
    setUser(prev => {
      const currentBal = prev ? prev.bal : 100000;
      const currentExp = prev ? prev.exp : 0;
      return {
        ...prev,
        bal: currentBal + amount,
        exp: currentExp + exposureChange
      };
    });
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      user,
      login,
      loginDemo,
      logout,
      updateBalance,
      authNotification,
      dismissNotification: () => setAuthNotification(null)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
