import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Default to logged in as demo user so users opening the site see the full live exchange immediately
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('silverbhai_logged_in');
    return saved !== null ? saved === 'true' : true;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('silverbhai_user');
    return saved ? JSON.parse(saved) : { uname: 'demouser', bal: 100000, exp: 0, isDemo: true };
  });

  useEffect(() => {
    localStorage.setItem('silverbhai_logged_in', isLoggedIn);
    if (user) {
      localStorage.setItem('silverbhai_user', JSON.stringify(user));
    }
  }, [isLoggedIn, user]);

  const login = (username, password) => {
    setIsLoggedIn(true);
    const newUser = { uname: username || 'user101', bal: 50000, exp: 0, isDemo: false };
    setUser(newUser);
    return true;
  };

  const loginDemo = () => {
    setIsLoggedIn(true);
    const demoUser = { uname: 'demouser', bal: 100000, exp: 0, isDemo: true };
    setUser(demoUser);
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.setItem('silverbhai_logged_in', 'false');
    localStorage.removeItem('silverbhai_user');
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
    <AuthContext.Provider value={{ isLoggedIn, user, login, loginDemo, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
