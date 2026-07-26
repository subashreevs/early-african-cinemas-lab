import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  darkMode,
  setDarkMode,
  isLoggedIn,
  setIsLoggedIn,
  userRole,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => setDarkMode(!darkMode);

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
        <div className="navbar-logo">
          <Link to="/">Early African Films</Link>
        </div>
        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          {/* <li><Link to="/contact">Contact</Link></li> */}
          {isLoggedIn && userRole === 'admin' && (
            <li><Link to="/admin">Admin</Link></li>
          )}
        </ul>
        <div className="navbar-controls">
          
          {isLoggedIn ? (
            <button onClick={handleLogout} className="dark-mode-toggle">
              Logout
            </button>
          ) : (
            <button onClick={handleLoginClick} className="dark-mode-toggle">
              Login
            </button>
          )}
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
