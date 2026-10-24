// NotificationPopup.tsx
import React from 'react';
import { Info } from 'lucide-react';
import useDialogFocus from './useDialogFocus';
import '../styles/NotificationPopup.css';

interface NotificationPopupProps {
  message: string;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ message, onClose }) => {
  const dialogRef = useDialogFocus(true, onClose);
  return (
    <div className="notification-overlay">
      <div className="notification-popup" ref={dialogRef} role="dialog" aria-modal="true" aria-label="Notification" aria-describedby="notification-message" tabIndex={-1}>
        <Info className="dialog-symbol" size={25} aria-hidden="true" />
        <p id="notification-message">{message}</p>
        <button className="notification-close" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default NotificationPopup;
