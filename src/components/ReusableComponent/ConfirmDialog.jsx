// ConfirmDialog.js
import React from 'react';
import '../../css/users/ConfirmDialog.css';

const ConfirmDialog = ({ 
  show, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'delete' // 'delete', 'restore', 'deactivate', 'warning', 'success'
}) => {
  if (!show) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className={`confirm-dialog confirm-dialog-type-${type}`}>
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-buttons">
          <button 
            onClick={onCancel}
            className="confirm-dialog-button confirm-dialog-button-cancel"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="confirm-dialog-button confirm-dialog-button-confirm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;