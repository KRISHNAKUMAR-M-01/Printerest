import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !email || !password) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Username or email might be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.4 7.62 11.17-.1-.95-.2-2.4.04-3.44.22-.94 1.4-5.95 1.4-5.95s-.36-.72-.36-1.77c0-1.66.96-2.9 2.17-2.9 1.02 0 1.51.77 1.51 1.7 0 1.03-.66 2.57-1 4a1.76 1.76 0 0 0 1.8 2.16c2.16 0 3.82-2.28 3.82-5.57 0-2.9-2.09-4.94-5.07-4.94-3.45 0-5.48 2.6-5.48 5.26 0 1.04.4 2.16.9 2.77.1.12.12.22.09.34l-.34 1.4c-.06.24-.18.28-.42.17C4.1 18.06 3 15.34 3 12.56c0-4.06 2.95-7.79 8.5-7.79 4.46 0 7.93 3.18 7.93 7.43 0 4.43-2.79 8-6.68 8-1.3 0-2.53-.68-2.95-1.48l-.8 3.06c-.29 1.1-.1 2.45.05 3.32C10.15 23.9 11.06 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
          </svg>
        </div>
        <h1 className="auth-title">Sign up to Printerest</h1>
        <p className="auth-subtitle">Create an account to start sharing ideas</p>

        {errorMsg && <div className="auth-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="auth-label">Username</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Pick a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Create a password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
