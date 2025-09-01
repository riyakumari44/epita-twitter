import React, { useState } from 'react';
import '../styles/Login.css';
import { authAPI } from '../services/api';

const Login = ({ onClose, switchToSignup }) => {
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
      console.log('Attempting login with:', { email }); // Debug log
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response); // Debug log
      
      // Store the JWT token and decode user info
      if (response && response.payload && response.payload.access_token) {
        localStorage.setItem('token', response.payload.access_token);
        
        // Decode JWT token to extract user info
        const token = response.payload.access_token;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        console.log('Decoded token:', decodedToken); // Debug log
        const userData = {
          id: decodedToken.sub,
          username: decodedToken.username,
          email: decodedToken.email
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User data stored:', userData); // Debug log
        
        // Show success state
        setSuccess(true);
        
        // Wait 2 seconds then close and redirect
        setTimeout(() => {
          onClose(); // Close the modal
          window.location.reload(); // Reload to update app state
        }, 2000);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
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
            <h2>Welcome back to Epita Twitter!</h2>
            <p>Successfully logged in as <span className="username-highlight">@{email.split('@')[0]}</span></p>
            <div className="success-loader">
              <div className="loading-spinner"></div>
              <p>Loading your dashboard...</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h2>Log in to Epita Twitter</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
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
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <p className="switch-auth">
            Don't have an account?{' '}
            <button onClick={switchToSignup}>Sign up</button>
          </p>
        </>
      )}
    </div>
  );
};

export default Login;
