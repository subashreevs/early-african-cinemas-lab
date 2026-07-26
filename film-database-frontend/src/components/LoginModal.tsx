// src/components/LoginModal.tsx

import React, { useState } from 'react';
import '../styles/LoginModal.css';
import { login as apiLogin } from '../api/client';

interface LoginModalProps {
  onLoginSuccess: () => void;
  onReturnHome: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, onReturnHome }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const labEmail = process.env.REACT_APP_EAC_LAB_EMAIL;

  const handleLogin = async () => {
    try {
      const data = await apiLogin(username, password);
      localStorage.setItem('accessToken', data.access_token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <h2>Please Login</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="submit-button" onClick={handleLogin}>
          Login
        </button>
        <button className="close-button" onClick={onReturnHome}>
          Return Home
        </button>
        <div className="additional-info">
          <p>
            If you are not a member of the EAC lab, please reach out to&nbsp;
            <a href={`mailto:${labEmail}`}>
              {labEmail}
            </a>
              &nbsp;to get access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
