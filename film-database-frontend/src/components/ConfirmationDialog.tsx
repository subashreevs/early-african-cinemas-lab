// src/components/ConfirmationDialog.tsx
import React from 'react';
import '../styles/ConfirmationDialog.css';

interface Props {
  message: string;
  isOpen: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<Props> = ({
  message,
  isOpen,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <p>{message}</p>
        <div className="confirm-buttons">
          <button className="btn-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
