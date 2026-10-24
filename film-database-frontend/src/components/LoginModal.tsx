// src/components/LoginModal.tsx

import React, { useState } from 'react';
import '../styles/LoginModal.css';
import { login as apiLogin } from '../api/client';
import { LogIn } from 'lucide-react';
import useDialogFocus from './useDialogFocus';

interface LoginModalProps {
  onLoginSuccess: () => void;
  onReturnHome: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, onReturnHome }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const labEmail = process.env.REACT_APP_EAC_LAB_EMAIL;
  const dialogRef = useDialogFocus(true, onReturnHome);

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
      <div className="login-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="login-title" tabIndex={-1}>
        <LogIn className="dialog-symbol" size={25} aria-hidden="true" />
        <h2 id="login-title">Welcome back</h2>
        {error && <p className="error-message" role="alert">{error}</p>}
        <form onSubmit={(event) => { event.preventDefault(); handleLogin(); }}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            autoComplete="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            autoComplete="current-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="submit-button" type="submit">
          Sign in
        </button>
        <button className="close-button" type="button" onClick={onReturnHome}>
          Back to catalog
        </button>
        </form>
        <div className="additional-info">
          <p>
            Need access? {labEmail ? <>Contact <a href={`mailto:${labEmail}`}>{labEmail}</a> to request an account.</> : 'Contact your Lab administrator to request an account.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
