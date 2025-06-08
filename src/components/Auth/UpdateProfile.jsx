import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiGlobe, FiFacebook, FiInstagram, FiArrowLeft, FiSave } from 'react-icons/fi';
import Alert from '../ReusableComponent/Alert.jsx';

import '../../css/users/update-img.css'; // Assuming you have a CSS file for styling

const UpdateProfile = ({ user, onBack, onSuccess }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    address: '',
    city: '',
    country: '',
    facebook_url: '',
    instagram_url: '',
    tiktok_url: '',
    profile_picture: null,
    previewImage: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/me');
        const userData = response.data;
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          gender: userData.gender || '',
          address: userData.address || '',
          city: userData.city || '',
          country: userData.country || '',
          facebook_url: userData.facebook_url || '',
          instagram_url: userData.instagram_url || '',
          tiktok_url: userData.tiktok_url || '',
          profile_picture: null,
          previewImage: userData.profile_picture || null
        });

      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/admin/dashboard');
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profile_picture: reader.result,
          previewImage: URL.createObjectURL(file)
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = async () => {
    try {
      setIsLoading(true);
      await api.put('/auth/profile', { profile_picture: '' });
      setFormData(prev => ({ 
        ...prev, 
        profile_picture: null,
        previewImage: null 
      }));
      setMessage({ text: 'Profile picture removed successfully', type: 'success' });
      setShowAlert(true);
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to remove profile picture', 
        type: 'error' 
      });
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };
  
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setMessage({ text: '', type: '' });
  setShowAlert(false);

  try {
    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      gender: formData.gender,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      facebook_url: formData.facebook_url,
      instagram_url: formData.instagram_url,
      tiktok_url: formData.tiktok_url,
      profile_picture: formData.profile_picture
      
    };

    const response = await api.put('/auth/profile', payload);

      const updatedUser = {
            ...user,
            ...response.data // Assuming your API returns updated user data
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setShowAlert(true);
    // Changed this line to redirect to /admin/dashboard
setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);  } catch (error) {
    console.error('Error updating profile:', error);
    setMessage({
      text: error.response?.data?.message || 'Failed to update profile',
      type: 'error'
    });
    setShowAlert(true);
  } finally {
    setIsLoading(false);
  }
};

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}` || 'U';
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
        {/* Profile Picture Section */}
       {/* Profile Picture Section */}
<div className="form-section">
  {/* <h3 className="section-title">Profile Picture</h3> */}
  <div className="profile-picture-container">
    <div className="profile-picture-wrapper">
      <label htmlFor="profile-picture" className="profile-picture-label">
        <div className="profile-picture-preview">
          {formData.previewImage ? (
            <img 
              src={
                formData.previewImage.includes('http') 
                  ? formData.previewImage 
                  : `http://127.0.0.1:8000/storage/${formData.previewImage}`
              } 
              alt="Profile Preview" 
              className="profile-image"
            />
          ) : (
            <div className="profile-initials">
              {getInitials(formData.first_name, formData.last_name)}
            </div>
          )}
          <div className="profile-picture-overlay">
            <FiUser className="overlay-icon" />
            <span className="overlay-text">Change Photo</span>
          </div>
        </div>
        <input
          id="profile-picture"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="profile-picture-input"
        />
      </label>
      {formData.previewImage && (
        <button 
          type="button" 
          onClick={removeImage}
          className="btn-remove-photo"
          disabled={isLoading}
        >
          Remove Photo
        </button>
      )}
    </div>
    <div className="profile-picture-instructions">
      <p>Upload a clear photo of yourself</p>
      <p>Max file size: 5MB</p>
      <p>Supported formats: JPG, PNG</p>
    </div>
  </div>
</div>

        {/* Personal Information Section */}
        <div className="form-section">
          <h3 className="section-title">Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="form-input readonly"
              />
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
              
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="form-section">
          <h3 className="section-title">Contact Information</h3>
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

        {/* Social Media Section */}
        <div className="form-section">
          <h3 className="section-title">Social Media</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Facebook URL</label>
              <input
                type="url"
                name="facebook_url"
                value={formData.facebook_url}
                onChange={handleChange}
                className="form-input"
                placeholder="https://facebook.com/yourprofile"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Instagram URL</label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                className="form-input"
                placeholder="https://instagram.com/yourprofile"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">TikTok URL</label>
              <input
                type="url"
                name="tiktok_url"
                value={formData.tiktok_url}
                onChange={handleChange}
                className="form-input"
                placeholder="https://tiktok.com/@yourprofile"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary-save"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
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

export default UpdateProfile;