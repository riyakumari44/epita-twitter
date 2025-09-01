import React, { useState } from 'react';
import '../styles/SplashScreen.css';
import Login from './Login';
import Signup from './Signup';

const SplashScreen = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="splash-container">
      <div className="splash-content">
        {/* Main Content */}
        <div className="main-content">
          <div className="logo-container">
            <svg viewBox="0 0 24 24" className="twitter-logo">
              <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.122 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
            </svg>
            <h1>Epita Twitter</h1>
          </div>

          <div className="auth-buttons">
            {!showLogin && !showSignup && (
              <>
                <button 
                  className="login-btn"
                  onClick={() => setShowLogin(true)}
                >
                  Log in
                </button>
                <button 
                  className="signup-btn"
                  onClick={() => setShowSignup(true)}
                >
                  Sign up
                </button>
              </>
            )}

            {showLogin && (
              <Login 
                onClose={() => setShowLogin(false)} 
                switchToSignup={() => {
                  setShowLogin(false);
                  setShowSignup(true);
                }}
              />
            )}

            {showSignup && (
              <Signup 
                onClose={() => setShowSignup(false)} 
                switchToLogin={() => {
                  setShowSignup(false);
                  setShowLogin(true);
                }}
              />
            )}
          </div>

          {/* Introduction Section - Now aligned with auth buttons */}
          <div className="intro-section">
            <h2>About Epita Twitter</h2>
            <p className="intro-description">
              Connect with friends, share your thoughts, and discover what's happening around the world. 
              Join the conversation and be part of a vibrant community where every voice matters.
            </p>
            
            <p className="join-text">
              Join thousands of users already making their mark on Epita Twitter. 
              <strong> Your voice, your community, your platform.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;