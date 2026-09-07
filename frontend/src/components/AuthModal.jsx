import React, { useState } from 'react';
import { api } from '../services/api';
import '../styles/Auth.css';

export default function AuthModal({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('guest'); // 'guest' | 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (activeTab !== 'guest' && !password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (activeTab === 'guest') {
        res = await api.guestLogin(username.trim());
      } else if (activeTab === 'login') {
        res = await api.login(username.trim(), password);
      } else {
        res = await api.register(username.trim(), password);
      }

      if (res.token) {
        localStorage.setItem('chat_token', res.token);
      }
      localStorage.setItem('chat_user', JSON.stringify(res.user));
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">💬</div>
          <h1 className="auth-title">Welcome to PulseChat</h1>
          <p className="auth-subtitle">Real-time room-based messaging platform</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${activeTab === 'guest' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('guest');
              setError('');
            }}
          >
            Instant Guest
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('register');
              setError('');
            }}
          >
            Register
          </button>
        </div>

        <form className="auth-body" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. AlexMorgan"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              autoFocus
              required
            />
          </div>

          {activeTab !== 'guest' && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              'Authenticating...'
            ) : activeTab === 'guest' ? (
              'Start Chatting Now →'
            ) : activeTab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>

          {activeTab === 'guest' ? (
            <p className="auth-footer">
              No password required. Jump right into any room!
            </p>
          ) : activeTab === 'login' ? (
            <p className="auth-footer">
              Don't have an account?{' '}
              <button
                type="button"
                className="auth-link"
                onClick={() => setActiveTab('register')}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="auth-footer">
              Already have an account?{' '}
              <button
                type="button"
                className="auth-link"
                onClick={() => setActiveTab('login')}
              >
                Sign in
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
