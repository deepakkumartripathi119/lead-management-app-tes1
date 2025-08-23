import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export default function AuthPage({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const email = e.target.elements.loginEmail.value;
    const password = e.target.elements.loginPassword.value;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Critical for httpOnly cookies
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 200) {
        // Success - JWT is now stored in httpOnly cookie
        const userData = await response.json();
        onLogin(userData); // Pass user data only, no token
      } else {
        // Handle different error cases
        const data = await response.json();
        if (response.status === 401) {
          setError('Invalid email or password');
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const email = e.target.elements.registerEmail.value;
    const password = e.target.elements.registerPassword.value;

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 201) {
        setSuccess('Registration successful! Please log in.');
        setIsRegistering(false);
      } else {
        const data = await response.json();
        if (response.status === 400) {
          setError('Please check your email and password requirements');
        } else if (response.status === 409) {
          setError('Email already exists. Please use a different email.');
        } else {
          setError(data.message || 'Registration failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="card">
          <div className="card__body">
            <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {!isRegistering ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="loginEmail"
                    className="form-control"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="loginPassword"
                    className="form-control"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn--primary btn--full-width"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="registerEmail"
                    className="form-control"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="registerPassword"
                    className="form-control"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    minLength="6"
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn--primary btn--full-width"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            <div className="auth-switch">
              {!isRegistering ? (
                <p>
                  Don't have an account?{' '}
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsRegistering(true);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Register here
                  </a>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsRegistering(false);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Login here
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}