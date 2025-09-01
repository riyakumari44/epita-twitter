import React, { useState } from 'react';
import '../styles/Signup.css';
import { authAPI } from '../services/api';

const Signup = ({ onClose, switchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register({ username, email, password });
      
      // Registration successful - the backend returns user data in payload
      if (response.payload && response.statusCode === 201) {
        // Show success state
        setSuccess(true);
        
        // Clear the form
        setUsername('');
        setEmail('');
        setPassword('');
        
        // Wait 2 seconds then switch to login
        setTimeout(() => {
          switchToLogin();
        }, 2000);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal">
      <button className="close-btn" onClick={onClose}>×</button>
      
      {success ? (
        <div className="success-screen app-style">
          <div className="success-avatar">
            <div className="bird-icon">🐦</div>
          </div>
          <div className="success-content">
            <h2>Welcome to Epita Twitter!</h2>
            <p>Account created successfully for <span className="username-highlight">@{username}</span></p>
            <div className="success-loader">
              <div className="loading-spinner"></div>
              <p>Preparing your login...</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h2>Create your account</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
          <p className="switch-auth">
            Already have an account?{' '}
            <button onClick={switchToLogin}>Log in</button>
          </p>
        </>
      )}
    </div>
  );
};

export default Signup;
