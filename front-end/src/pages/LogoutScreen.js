import React, { useState } from 'react';
import '../styles/LogoutScreen.css';

const LogoutScreen = ({ onCancel, onConfirmLogout }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    // Simulate logout API call
    try {
      // Here you would normally make an API call to logout
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Clear any stored tokens/user data
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      
      // Call the parent callback
      if (onConfirmLogout) {
        onConfirmLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="logout-overlay">
      <div className="logout-modal">
        <div className="logout-header">
          <div className="logout-logo">
            <svg viewBox="0 0 24 24" className="twitter-logo-logout">
              <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.122 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
            </svg>
          </div>
          
          <button className="close-logout-btn" onClick={onCancel}>
            ✕
          </button>
        </div>

        <div className="logout-content">
          <h2>Log out of Epita Twitter?</h2>

          <div className="logout-actions">
            <button 
              className="logout-btn"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Log out'
              )}
            </button>
            
            <button 
              className="cancel-btn"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutScreen;
