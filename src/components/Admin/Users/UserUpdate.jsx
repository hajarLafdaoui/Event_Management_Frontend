import React, { useState } from 'react';
import api from '../../../api/api';
import '../../../css/users/userUpdate.css';
import '../../../css/EventContentClient.css';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import Alert from '../../ReusableComponent/Alert.jsx';

const UserUpdate = ({ user, onBack }) => {
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'client',
    gender: user.gender || '',
    address: user.address || '',
    city: user.city || '',
    country: user.country || '',
    facebook_url: user.facebook_url || '',
    instagram_url: user.instagram_url || '',
    tiktok_url: user.tiktok_url || ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.first_name) errors.first_name = 'First name is required.';
    if (!data.last_name) errors.last_name = 'Last name is required.';
    if (!data.email) errors.email = 'Email is required.';
    if (!data.role) errors.role = 'Role is required.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    setFormError(null);
    setShowAlert(false);

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.put(`/auth/admin/users/${user.id}`, formData);
      setSuccessMessage('User updated successfully!');
      setShowAlert(true);

      // Wait for the alert animation to complete (assuming it takes about 3 seconds)
      setTimeout(() => {
        onBack(true);
      }, 3000);

    } catch (error) {
      const errorMsg = error.response?.data?.message ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors).join('\n')
          : 'Failed to update user');
      setErrorMessage(errorMsg);
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    if (successMessage) {
      onBack(true);
    }
  };

  return (
    <div className="event-content">

      <div className="div-end">
        <div className="user-update-subheader">
          <h3 className="user-update-title">Edit User Profile</h3>
          <p className="user-update-subtitle">Update the user information below</p>
        </div>
        <div className="event-content-header user-update-header-update">
          <button
            onClick={() => onBack(false)}
            className="back-to-list-btn"
          >
            <FiArrowLeft className="back-icon" />
            <span className="back-text">Back to Users List</span>
          </button>
        </div>
      </div>


      {showAlert && successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={handleAlertClose}
          autoClose={true}
          autoCloseDuration={3000}
        />
      )}

      {showAlert && errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => {
            setShowAlert(false);
            setErrorMessage('');
          }}
        />
      )}
      <form onSubmit={handleSubmit} className="event-form" noValidate>
        {/* Personal Information Section */}
        <div className="form-section">
          <h3 className="section-title">Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name*</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`form-input ${formError?.first_name ? 'error-input' : ''}`}
              />
              {formError?.first_name && <small className="error-text">{formError.first_name}</small>}
            </div>

            <div className="form-group">
              <label className="form-label">Last Name*</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`form-input ${formError?.last_name ? 'error-input' : ''}`}
              />
              {formError?.last_name && <small className="error-text">{formError.last_name}</small>}
            </div>

            <div className="form-group">
              <label className="form-label">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${formError?.email ? 'error-input' : ''}`}
              />
              {formError?.email && <small className="error-text">{formError.email}</small>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role*</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`form-input ${formError?.role ? 'error-input' : ''}`}
              >
                <option value="client">Client</option>
                <option value="vendor">Vendor</option>
              </select>
              {formError?.role && <small className="error-text">{formError.role}</small>}
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Information Section */}
        <div className="form-section">
          <h3 className="section-title">Address Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="form-section">
          <h3 className="section-title">Social Links</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Facebook URL</label>
              <input
                type="url"
                name="facebook_url"
                value={formData.facebook_url}
                onChange={handleChange}
                placeholder="https://facebook.com/username"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Instagram URL</label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                placeholder="https://instagram.com/username"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">TikTok URL</label>
              <input
                type="url"
                name="tiktok_url"
                value={formData.tiktok_url}
                onChange={handleChange}
                placeholder="https://tiktok.com/@username"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary-save"
            disabled={isSubmitting}
          >
            {/* <FiSave className="mr-3" /> */}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() => onBack(false)}
            className="btn-secondary-save"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserUpdate;