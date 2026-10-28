import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BetSlipProvider } from './context/BetSlipContext';

import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GameDetailsPage } from './pages/GameDetailsPage';
import { CasinoListPage } from './pages/CasinoListPage';
import { SportsListPage } from './pages/SportsListPage';
import { TermsPage, ResponsibleGamingPage } from './pages/StaticPages';

function AppRoutes() {
  const { isLoggedIn } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isStaticPage = 
    location.pathname === '/terms-and-conditions' || 
    location.pathname === '/responsible-gaming';

  // If not logged in, any visit to root or home or login renders LoginPage (matching target silverbhai.com behavior 1:1)
  if (!isLoggedIn && !isStaticPage && location.pathname !== '/register') {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  // If static page without auth
  if (!isLoggedIn && isStaticPage) {
    return (
      <Routes>
        <Route path="/terms-and-conditions" element={<TermsPage />} />
        <Route path="/responsible-gaming" element={<ResponsibleGamingPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  if (!isLoggedIn && location.pathname === '/register') {
    return (
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  // When authenticated, render the Exchange Dashboard layout
  return (
    <div className="wrapper min-vh-100 d-flex flex-column">
      {/* Top Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Container */}
      <div className="main-container flex-grow-1">
        {/* Left Sports Navigation Sidebar */}
        <LeftSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Router */}
        <Routes>
          {/* Core Home routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Navigate to="/home" replace />} />

          {/* Sports list & events */}
          <Route path="/all-sports" element={<SportsListPage />} />
          <Route path="/all-sports/:etId" element={<SportsListPage />} />
          <Route path="/sports/:etId" element={<SportsListPage />} />

          {/* Match details / Live exchange markets */}
          <Route path="/game-details/:etId/:gameId" element={<GameDetailsPage />} />
          <Route path="/gamedetails/:etId/:gameId" element={<GameDetailsPage />} />

          {/* Casino & Live dealer list */}
          <Route path="/casino-list" element={<CasinoListPage />} />
          <Route path="/live-casino-list" element={<CasinoListPage />} />
          <Route path="/slot-list" element={<CasinoListPage />} />
          <Route path="/fantasy-list" element={<CasinoListPage />} />
          <Route path="/aviator-list" element={<CasinoListPage />} />

          {/* Legal and information */}
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/responsible-gaming" element={<ResponsibleGamingPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BetSlipProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </BetSlipProvider>
    </AuthProvider>
  );
}

export default App;
