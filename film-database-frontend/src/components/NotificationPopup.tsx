// NotificationPopup.tsx
import React from 'react';
import '../styles/NotificationPopup.css';

interface NotificationPopupProps {
  message: string;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ message, onClose }) => {
  return (
    <div className="notification-overlay">
      <div className="notification-popup">
        <p>{message}</p>
        <button className="notification-close" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default NotificationPopup;
