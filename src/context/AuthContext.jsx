import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('silverbhai_logged_in') === 'true';
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('silverbhai_user');
    return saved ? JSON.parse(saved) : { uname: 'demouser', bal: 100000, exp: 0 };
  });

  useEffect(() => {
    localStorage.setItem('silverbhai_logged_in', isLoggedIn);
    localStorage.setItem('silverbhai_user', JSON.stringify(user));
  }, [isLoggedIn, user]);

  const login = (username, password) => {
    setIsLoggedIn(true);
    setUser({ uname: username || 'user101', bal: 50000, exp: 0 });
    return true;
  };

  const loginDemo = () => {
    setIsLoggedIn(true);
    setUser({ uname: 'demouser', bal: 100000, exp: 0, isDemo: true });
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('silverbhai_logged_in');
    localStorage.removeItem('silverbhai_user');
  };

  const updateBalance = (amount, exposureChange = 0) => {
    setUser(prev => ({
      ...prev,
      bal: (prev ? prev.bal : 100000) + amount,
      exp: (prev ? prev.exp : 0) + exposureChange
    }));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, loginDemo, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

