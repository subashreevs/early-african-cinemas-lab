import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import NotificationPopup from './NotificationPopup';
import ConfirmationDialog from './ConfirmationDialog';
import '../styles/Navbar.css';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  userRole: string | null;
}

const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn,
  setIsLoggedIn,
  userRole,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoState, setLogoState] = useState<'loading' | 'loaded' | 'missing'>('loading');
  const navigate = useNavigate();
  const logoUrl = `${process.env.PUBLIC_URL ?? ''}/eacl_logo.png`;
  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleModalClose = () => {
    setShowLoginModal(false);
    if (localStorage.getItem('accessToken')) {
      setIsLoggedIn(true);
      setShowNotification(true);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const doLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setShowLogoutConfirm(false);
    setShowNotification(true);
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-logo">
            <Link to="/" aria-label="Early African Films home">
              <span className="brand-logo-slot" aria-hidden="true">
                {logoState !== 'loaded' && <span className="brand-logo-placeholder">Logo</span>}
                {logoState !== 'missing' && (
                  <img
                    className={`brand-logo-image${logoState === 'loading' ? ' is-loading' : ''}`}
                    src={logoUrl}
                    alt=""
                    onLoad={() => setLogoState('loaded')}
                    onError={() => setLogoState('missing')}
                  />
                )}
              </span>
              <span className="brand-copy">
                <strong>Early African Films</strong>
                <small>Research database</small>
              </span>
            </Link>
          </div>
          <ul className="navbar-menu">
            <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Catalog</NavLink></li>
            {isLoggedIn && (userRole === 'admin' || userRole === 'editor') && (
              <li><NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>Administration</NavLink></li>
            )}
          </ul>
          <div className="navbar-controls">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="account-button secondary">Logout</button>
            ) : (
              <button onClick={handleLoginClick} className="account-button">Login</button>
            )}
          </div>
        </div>
      </nav>

      {showLoginModal && (
        <LoginModal
          onLoginSuccess={handleModalClose}
          onReturnHome={handleModalClose}
        />
      )}

      {showNotification && (
        <NotificationPopup
          message={isLoggedIn ? 'Successfully logged in!' : 'Successfully logged out!'}
          onClose={() => setShowNotification(false)}
        />
      )}

      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        message="Are you sure you want to log out?"
        onConfirm={doLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default Navbar;
