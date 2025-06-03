import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX, FiInfo } from 'react-icons/fi';
import '../../css/users/Alert.css';

const Alert = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const alertTypeClasses = {
    success: 'alert-success',
    error: 'alert-error',
    warning: 'alert-warning',
    info: 'alert-info',
  };

  const alertIcons = {
    success: <FiCheckCircle className="alert-icon" size={22} />,
    error: <FiAlertCircle className="alert-icon" size={22} />,
    warning: <FiAlertCircle className="alert-icon" size={22} />,
    info: <FiInfo className="alert-icon" size={22} />,
  };

  return (
    <div className="alert-container">
      <div 
        className={`alert-content ${alertTypeClasses[type]} ${
          isClosing ? 'alert-fade-out' : 'alert-slide-in'
        }`}
        style={{ '--duration': `${duration}ms` }}
      >
        <div className="alert-icon-container">
          {alertIcons[type] || alertIcons.info}
        </div>
        <div className="alert-message">
          <p>{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="alert-close-button"
          aria-label="Close alert"
        >
          <FiX size={18} />
        </button>
        {duration > 0 && (
          <div className="alert-progress" style={{ animationDuration: `${duration}ms` }} />
        )}
      </div>
    </div>
  );
};

export default Alert;