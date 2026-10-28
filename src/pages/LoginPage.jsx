import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SITE_CONFIG } from '../data/mockData';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    login(username, password);
    navigate('/');
  };

  const handleDemoLogin = () => {
    loginDemo();
    navigate('/');
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center min-vh-100" style={{ background: '#121518' }}>
      <div className="login-box p-4 rounded shadow-lg" style={{ width: '100%', maxWidth: '420px', background: '#1c2227', border: '1px solid #2a343d' }}>
        {/* Logo */}
        <div className="logo-login text-center mb-4">
          <Link to="/">
            <img 
              src={SITE_CONFIG.logo} 
              alt={SITE_CONFIG.title} 
              style={{ maxHeight: '55px', height: 'auto' }} 
            />
          </Link>
        </div>

        {/* Login Form */}
        <div className="login-form mt-4">
          <h4 className="text-center login-title text-white mb-4">
            Login <i className="fas fa-hand-point-down text-warning ms-1"></i>
          </h4>

          {error && (
            <div className="alert alert-danger py-2 px-3 small mb-3">
              <i className="fas fa-exclamation-triangle me-1"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-4 input-group position-relative">
              <input 
                name="username" 
                type="text" 
                className="form-control" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <span className="input-group-text bg-dark text-muted border-secondary">
                <i className="fas fa-user"></i>
              </span>
            </div>

            {/* Password */}
            <div className="mb-4 input-group position-relative">
              <input 
                name="password" 
                type="password" 
                className="form-control" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="input-group-text bg-dark text-muted border-secondary">
                <i className="fas fa-key"></i>
              </span>
            </div>

            {/* Buttons */}
            <div className="d-grid gap-2">
              <button 
                type="submit" 
                className="btn btn-primary btn-block fw-bold py-2"
                style={{ background: 'var(--bg-primary, #04A1A6)', borderColor: '#04A1A6' }}
              >
                Login <i className="fas fa-sign-in-alt float-end mt-1"></i>
              </button>

              <button 
                type="button" 
                className="btn btn-warning btn-block fw-bold py-2 text-dark"
                onClick={handleDemoLogin}
              >
                Login with demo ID <i className="fas fa-sign-in-alt float-end mt-1"></i>
              </button>
            </div>

            <div className="text-center mt-3 text-muted small">
              Don't have an account? <Link to="/register" className="text-info fw-bold">Register here</Link>
            </div>

            {/* Footer Section */}
            <section className="footer footer-login mt-4 pt-3 border-top border-secondary">
              <div className="footer-top">
                <div className="footer-links mb-2 text-center">
                  <Link to="/terms-and-conditions" className="text-muted small me-2" target="_blank">
                    Terms and Conditions
                  </Link>
                  <span className="text-secondary">|</span>
                  <Link to="/responsible-gaming" className="text-muted small ms-2" target="_blank">
                    Responsible Gaming
                  </Link>
                </div>
                <div className="support-detail text-center">
                  <h6 className="text-warning small m-0">24X7 Support Available</h6>
                  <p className="text-muted small mb-0">Contact Telegram: @silverbhai_official</p>
                </div>
              </div>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
};
