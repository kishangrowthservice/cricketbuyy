import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { 
  AccountStatementPage, 
  CurrentBetsPage, 
  CasinoResultsPage, 
  StatementPage 
} from './pages/ReportPage';

function ExchangeLayout({ sidebarOpen, setSidebarOpen, children }) {
  return (
    <div className="wrapper min-vh-100 d-flex flex-column">
      {/* Top Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Container */}
      <div className="main-container flex-grow-1">
        {/* Left Sports Navigation Sidebar */}
        <LeftSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Dynamic Center Container */}
        {children}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function AppRoutes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      {/* Dedicated Login & Register Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Static Legal Pages */}
      <Route path="/terms-and-conditions" element={<TermsPage />} />
      <Route path="/responsible-gaming" element={<ResponsibleGamingPage />} />

      {/* Exchange Core Pages with Main Layout */}
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
              <HomePage />
            </ExchangeLayout>
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/home"
        element={
          isLoggedIn ? (
            <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
              <HomePage />
            </ExchangeLayout>
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Sports listing */}
      <Route
        path="/all-sports"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <SportsListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/all-sports/:etId"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <SportsListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/sports/:etId"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <SportsListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/sports-book/:cId"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <SportsListPage />
          </ExchangeLayout>
        }
      />

      {/* Game Details Market */}
      <Route
        path="/game-details/:etId/:gameId"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <GameDetailsPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/gamedetails/:etId/:gameId"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <GameDetailsPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/cricketv/:etId/:gameId"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <GameDetailsPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/virtual-cricket/:etId/:gameId"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <GameDetailsPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/tp-virtual-cricket/:etId/:gameId"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <GameDetailsPage />
          </ExchangeLayout>
        }
      />

      {/* Casino Games */}
      <Route
        path="/casino-list"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/casino-list/:cType"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/casino-list/:cType/:type"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/casino-list/:cType/:type/:tabId"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/casino/:gType"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/live-casino-list"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/live-casino-list/:cType"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/slot-list"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/slot-list/:cType"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/fantasy-list"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/fantasy-list/:gameName"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoListPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/aviator-list"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoListPage />
          </ExchangeLayout>
        }
      />

      {/* Reports and Account */}
      <Route
        path="/account-statement"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <AccountStatementPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/activity-log"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <AccountStatementPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/profit-loss"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <AccountStatementPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/statement"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <AccountStatementPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/current-bet"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CurrentBetsPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/bet-history"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CurrentBetsPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/live-casino-bets"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CurrentBetsPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/casino-results"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoResultsPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/casino-results/:type"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <CasinoResultsPage />
          </ExchangeLayout>
        }
      />
      <Route
        path="/deposit"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <StatementPage type="Deposit" />
          </ExchangeLayout>
        }
      />
      <Route
        path="/withdraw"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <StatementPage type="Withdraw" />
          </ExchangeLayout>
        }
      />
      <Route
        path="/deposit-statement"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <StatementPage type="Deposit" />
          </ExchangeLayout>
        }
      />
      <Route
        path="/withdraw-statement"
        element={
          <ExchangeLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <StatementPage type="Withdraw" />
          </ExchangeLayout>
        }
      />

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BetSlipProvider>
          <AppRoutes />
        </BetSlipProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
