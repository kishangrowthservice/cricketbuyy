import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BetSlipProvider } from './context/BetSlipContext';

import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GameDetailsPage } from './pages/GameDetailsPage';
import { CasinoListPage } from './pages/CasinoListPage';
import { SportsListPage } from './pages/SportsListPage';
import { TermsPage, ResponsibleGamingPage } from './pages/StaticPages';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Exclude sidebars on auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="wrapper min-vh-100 d-flex flex-column">
      {/* Top Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main 3-Column Content Container */}
      <div className="main-container flex-grow-1">
        {/* Left Sports Navigation Sidebar */}
        <LeftSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Center Dynamic Page Content */}
        <div className="content-area flex-grow-1">
          {children}
        </div>

        {/* Right Bet Slip and Live Match TV Sidebar */}
        <RightSidebar />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BetSlipProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              {/* Core Home routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />

              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </BetSlipProvider>
    </AuthProvider>
  );
}

export default App;
