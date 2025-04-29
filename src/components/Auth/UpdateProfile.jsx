import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    profile_picture: null,
    previewImage: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/me');
        const userData = response.data;
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          profile_picture: null,
          previewImage: userData.profile_picture || null
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/signin');
      }
    };
    fetchUserData();
  }, [navigate]); // Ensure this only runs when `navigate` changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
console.log('Profile Picture Base64:', formData.profile_picture);const handleImageChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        profile_picture: reader.result, // Ensure this is a valid Base64 string
        previewImage: URL.createObjectURL(file), // For preview
      }));
    };
    reader.readAsDataURL(file);
  }
};
      // Convert the file to a Base64 string
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profile_picture: reader.result, // Base64 string
          previewImage: URL.createObjectURL(file), // For preview
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = async () => {
    try {
      setIsLoading(true);
      // Send empty string to indicate removal
      const response = await api.put('/auth/profile', {
        profile_picture: '' // This tells backend to remove the image
      });

      setFormData(prev => ({ 
        ...prev, 
        profile_picture: null,
        previewImage: null 
      }));

      setMessage({ text: 'Profile picture removed successfully', type: 'success' });
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to remove profile picture', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('phone', formData.phone);
  
      if (formData.profile_picture) {
        formDataToSend.append('profile_picture', formData.profile_picture);
      }
  
      const response = await api.put('/auth/profile', formDataToSend, {
      
      });
  
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
  
      navigate('/user-details'); // Redirect to user details page after successful update
      // Update state with the response data
      setFormData(prev => ({
        ...prev,
        first_name: response.data.first_name || prev.first_name,
        last_name: response.data.last_name || prev.last_name,
        phone: response.data.phone || prev.phone,
        previewImage: response.data.profile_picture || prev.previewImage,
        profile_picture: null
      }));
  
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        text: error.response?.data?.message || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}` || 'U';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Update Profile</h1>
      
      {message.text && (
        <div style={{ 
          padding: '10px', 
          margin: '10px 0', 
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Profile Picture Upload */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <label htmlFor="profile-picture" style={{ cursor: 'pointer' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              backgroundColor: formData.previewImage ? 'transparent' : '#4CAF50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: formData.previewImage ? 'transparent' : 'white',
              fontSize: '48px',
              fontWeight: 'bold',
              margin: '0 auto 10px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {formData.previewImage ? (
                <img 
                  src={
                    formData.previewImage.includes('http') 
                      ? formData.previewImage 
                      : `http://127.0.0.1:8000/storage/${formData.previewImage}`
                  } 
                  alt="Profile Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(formData.first_name, formData.last_name)
              )}
            </div>
            <div style={{ marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={() => document.getElementById('profile-picture').click()}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Change Photo
              </button>
              {formData.previewImage && (
                <button 
                  type="button" 
                  onClick={removeImage}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#721c24'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              id="profile-picture"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Form Fields */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            First Name
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Last Name
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Phone Number
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }}
          />
        </div>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;