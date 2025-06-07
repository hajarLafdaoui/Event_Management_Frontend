import React, { useState } from 'react';
import { FiX, FiLock } from 'react-icons/fi';
import api from '../../api/api';
import Alert from '../ReusableComponent/Alert.jsx';

const UpdatePassword = ({ onBack }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    setShowAlert(false);

    try {
      await api.put('/auth/password', formData);
      setMessage({ 
        text: 'Password updated successfully!', 
        type: 'success' 
      });
      setShowAlert(true);
      setFormData({
        current_password: '',
        password: '',
        password_confirmation: ''
      });
      // Optionally close the modal after success
      setTimeout(() => onBack(), 1500);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to update password', 
        type: 'error' 
      });
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  return (
    <div className="event-content">
      {showAlert && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={handleAlertClose}
          autoClose={true}
          autoCloseDuration={3000}
        />
      )}

      <form onSubmit={handleSubmit} className="event-form" noValidate>
        <div className="form-section">
          <h3 className="section-title">Update Password</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <FiLock className="form-icon" /> Current Password
              </label>
              <input
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiLock className="form-icon" /> New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiLock className="form-icon" /> Confirm Password
              </label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary-save"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary-save"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePassword;