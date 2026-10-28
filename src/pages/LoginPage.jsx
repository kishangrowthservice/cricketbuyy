import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('This input is required.');
      return;
    }
    login(username, password);
    navigate('/home');
  };

  const handleDemoLogin = () => {
    loginDemo();
    navigate('/home');
  };

  return (
    <div className="wrapper">
      <div className="login-page">
        <div className="login-box">
          <div className="logo-login">
            <Link to="/">
              <img 
                src="https://sitethemedata.com/sitethemes/silverbhai.com/front/logo.png" 
                alt="SILVER EXCH" 
              />
            </Link>
          </div>
          <div className="login-form mt-4">
            <h4 className="text-center login-title">
              Login <i className="fas fa-hand-point-down"></i>
            </h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 input-group position-relative">
                <input
                  name="username"
                  type="text"
                  className="form-control"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                />
                <span className="input-group-text">
                  <i className="fas fa-user"></i>
                </span>
                {error && !username && <p className="error-form">{error}</p>}
              </div>

              <div className="mb-4 input-group position-relative">
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                />
                <span className="input-group-text">
                  <i className="fas fa-key"></i>
                </span>
                {error && !password && <p className="error-form">{error}</p>}
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-block">
                  Login<i className="fas fa-sign-in-alt float-end mt-1"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-block mt-2"
                  onClick={handleDemoLogin}
                >
                  Login with demo ID<i className="fas fa-sign-in-alt float-end mt-1"></i>
                </button>
              </div>

              <p className="mt-1"></p>

              <section className="footer footer-login">
                <div className="footer-top">
                  <div className="footer-links">
                    <nav className="navbar navbar-expand-sm">
                      <ul className="navbar-nav">
                        <li className="nav-item">
                          <Link className="nav-link" to="/terms-and-conditions" target="_blank">
                            Terms and Conditions
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link" to="/responsible-gaming" target="_blank">
                            Responsible Gaming
                          </Link>
                        </li>
                      </ul>
                    </nav>
                  </div>
                  <div className="support-detail">
                    <h2>24X7 Support</h2>
                    <p></p>
                  </div>
                  <div className="social-icons-box"></div>
                </div>
              </section>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
