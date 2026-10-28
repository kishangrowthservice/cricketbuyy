import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SITE_CONFIG } from '../data/mockData';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referral: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Username and password are required.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    login(formData.username, formData.password);
    navigate('/');
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center min-vh-100" style={{ background: '#121518' }}>
      <div className="login-box p-4 rounded shadow-lg" style={{ width: '100%', maxWidth: '440px', background: '#1c2227', border: '1px solid #2a343d' }}>
        <div className="logo-login text-center mb-4">
          <Link to="/">
            <img src={SITE_CONFIG.logo} alt={SITE_CONFIG.title} style={{ maxHeight: '55px', height: 'auto' }} />
          </Link>
        </div>

        <div className="login-form mt-3">
          <h4 className="text-center login-title text-white mb-3">
            Create Account <i className="fas fa-user-plus text-info ms-1"></i>
          </h4>

          {error && (
            <div className="alert alert-danger py-2 px-3 small mb-3">
              <i className="fas fa-exclamation-triangle me-1"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3 input-group">
              <input 
                name="username" 
                type="text" 
                className="form-control" 
                placeholder="Choose Username" 
                value={formData.username}
                onChange={handleChange}
                required
              />
              <span className="input-group-text bg-dark text-muted border-secondary">
                <i className="fas fa-user"></i>
              </span>
            </div>

            <div className="mb-3 input-group">
              <input 
                name="phone" 
                type="tel" 
                className="form-control" 
                placeholder="Mobile Number" 
                value={formData.phone}
                onChange={handleChange}
              />
              <span className="input-group-text bg-dark text-muted border-secondary">
                <i className="fas fa-mobile-alt"></i>
              </span>
            </div>

            <div className="mb-3 input-group">
              <input 
                name="password" 
                type="password" 
                className="form-control" 
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span className="input-group-text bg-dark text-muted border-secondary">
                <i className="fas fa-key"></i>
              </span>
            </div>

            <div className="mb-3 input-group">
              <input 
                name="confirmPassword" 
                type="password" 
                className="form-control" 
                placeholder="Confirm Password" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <span className="input-group-text bg-dark text-muted border-secondary">
                <i className="fas fa-lock"></i>
              </span>
            </div>

            <div className="mb-3 input-group">
              <input 
                name="referral" 
                type="text" 
                className="form-control" 
                placeholder="Referral Code (Optional)" 
                value={formData.referral}
                onChange={handleChange}
              />
              <span className="input-group-text bg-dark text-muted border-secondary">
                <i className="fas fa-gift"></i>
              </span>
            </div>

            <div className="form-check mb-3 small text-white-50">
              <input className="form-check-input" type="checkbox" id="termsCheck" required defaultChecked />
              <label className="form-check-label" htmlFor="termsCheck">
                I am 18+ years of age and agree to the <Link to="/terms-and-conditions" className="text-info">Terms</Link>
              </label>
            </div>

            <div className="d-grid">
              <button 
                type="submit" 
                className="btn btn-primary fw-bold py-2"
                style={{ background: 'var(--bg-primary, #04A1A6)', borderColor: '#04A1A6' }}
              >
                Register Now <i className="fas fa-arrow-right ms-1"></i>
              </button>
            </div>

            <div className="text-center mt-3 text-muted small">
              Already have an account? <Link to="/login" className="text-info fw-bold">Login here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
