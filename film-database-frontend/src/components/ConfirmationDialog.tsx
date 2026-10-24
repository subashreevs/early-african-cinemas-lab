// src/components/ConfirmationDialog.tsx
import React from 'react';
import { CircleHelp } from 'lucide-react';
import useDialogFocus from './useDialogFocus';
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
  const dialogRef = useDialogFocus(isOpen, onCancel);
  if (!isOpen) return null;
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog" ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-message" tabIndex={-1}>
        <CircleHelp className="dialog-symbol" size={25} aria-hidden="true" />
        <h2 id="confirmation-title">Confirm action</h2>
        <p id="confirmation-message">{message}</p>
        <div className="confirm-buttons">
          <button className="btn-cancel" data-initial-focus onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
