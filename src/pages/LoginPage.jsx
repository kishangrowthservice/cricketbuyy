import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SITE_CONFIG } from '../data/mockData';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(username.trim(), password);
      setIsLoading(false);
      navigate('/');
    }, 300);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginDemo();
      setIsLoading(false);
      navigate('/');
    }, 200);
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center min-vh-100" style={{ background: '#0e1215', padding: '20px' }}>
      <div
        className="login-box p-4 rounded shadow-lg"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#181d22',
          border: '1px solid #2a333c'
        }}
      >
        {/* Brand Logo */}
        <div className="logo-login text-center mb-4">
          <Link to="/">
            <img 
              src={SITE_CONFIG.logo} 
              alt={SITE_CONFIG.title}
              style={{ height: '48px', maxWidth: '240px', objectFit: 'contain' }}
              onError={(e) => { e.target.src = '/logo.png'; }}
            />
          </Link>
        </div>

        <div className="login-form mt-2">
          <div className="text-center mb-4">
            <h4 className="text-white fw-bold m-0" style={{ fontSize: '20px' }}>
              Sign In to Your Account
            </h4>
            <p className="text-muted small mt-1 mb-0">
              Access live cricket markets, casino & instant payouts
            </p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center gap-2">
              <i className="fas fa-exclamation-circle text-danger"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold mb-1">Username / ID</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-muted">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  name="username"
                  type="text"
                  required
                  autoFocus
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label text-muted small fw-bold mb-0">Password</label>
                <span className="text-muted" style={{ fontSize: '11px' }}>Encrypted</span>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-muted">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                />
                <button
                  type="button"
                  className="btn btn-dark border-secondary text-muted"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-2 mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn fw-bold py-2 text-white"
                style={{
                  background: 'var(--bg-primary, #941b2c)',
                  borderColor: 'var(--bg-primary, #941b2c)',
                  boxShadow: '0 2px 8px rgba(148, 27, 44, 0.4)'
                }}
              >
                {isLoading ? (
                  <span><i className="fas fa-spinner fa-spin me-2"></i>Signing in...</span>
                ) : (
                  <span>Sign In <i className="fas fa-sign-in-alt ms-1"></i></span>
                )}
              </button>

              <button
                type="button"
                className="btn btn-warning fw-bold py-2 text-dark"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                <i className="fas fa-play-circle me-1"></i> 1-Click Demo Login (₹1,00,000)
              </button>
            </div>

            {/* Register / Back Link */}
            <div className="mt-4 pt-3 border-top border-secondary text-center small text-muted">
              <div>
                Don't have an account?{' '}
                <Link to="/register" className="text-warning text-decoration-none fw-bold">
                  Register Now
                </Link>
              </div>
              <div className="mt-2">
                <Link to="/" className="text-light text-decoration-none">
                  <i className="fas fa-arrow-left me-1"></i> Back to Live Exchange
                </Link>
              </div>
            </div>

            {/* Legal Links */}
            <div className="mt-4 text-center small" style={{ fontSize: '11px' }}>
              <Link to="/terms-and-conditions" className="text-muted text-decoration-none me-3">
                Terms &amp; Conditions
              </Link>
              <Link to="/responsible-gaming" className="text-muted text-decoration-none">
                Responsible Gaming
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
