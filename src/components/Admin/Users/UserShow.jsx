import React, { useState } from 'react';
import UserUpdate from './UserUpdate'; // Import the UserUpdate component
import '../../../css/users/userDetails.css';
import { FiArrowLeft } from 'react-icons/fi';

const UserShow = ({ user, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateClick = () => {
    setIsEditing(true);
  };

  const handleUpdateComplete = () => {
    setIsEditing(false);
    // You might want to refresh user data here if needed
  };

  // If in editing mode, show the UserUpdate component
  if (isEditing) {
    return <UserUpdate user={user} onBack={handleUpdateComplete} />;
  }

  // Otherwise, show the normal user details view
  return (
    <div className="user-show-container">

      <div className="user-show-header">
        <div className="user-show-subheader">
          <p className="user-show-subtitle">View and manage user details</p>
          <div className="user-show-divider"></div>
        </div>       <div className="event-content-header">
          <button
            onClick={() => onBack(false)}
            className="back-to-list-btn"
          >
            <FiArrowLeft className="back-icon" />
            <span className="back-text">Back to Users List</span>
          </button>
        </div>
      </div>

      <div className="user-show-content">
        {/* Left Column - Profile Image */}
        <div className="user-show-profile-col">
          {user.profile_picture ? (
            <div className="user-show-profile-img-container">
              <img
                src={user.profile_picture}
                alt={`${user.first_name} ${user.last_name}`}
                className="user-show-profile-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                  e.target.className = 'hidden';
                }}
              />
            </div>
          ) : (
            <div className="user-show-profile-initials">
              <span className="user-show-profile-initials-text">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </span>
            </div>
          )}
          <div className="user-show-actions">
            <span className="user-show-detail-value">{user.email}</span>
            <p className="user-show-profile-role">{user.role}</p>
          </div>

          <div className="user-show-detail-item">
            <span className="user-show-detail-label">Last Login:</span>
            <span className="user-show-detail-value">
              {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}
            </span>
          </div>

          {/* Action Links */}
          <div className="user-show-actions">
            <button
              className="user-show-action-btn user-show-action-update"
              onClick={handleUpdateClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Update Profile
            </button>


          </div>
        </div>

        {/* Right Column - User Details */}
        <div className="user-show-details-col">
          {/* Personal Information Section */}
          <div className="user-show-section">
            <h3 className="user-show-section-title">Personal Information</h3>
            <div className="user-show-section-content">
              <div className="user-show-details-grid">
                <div className="user-show-detail-item">
                  <span className="user-show-detail-label">First Name</span>
                  <span className="user-show-detail-value">{user.first_name}</span>
                </div>
                <div className="user-show-detail-item">
                  <span className="user-show-detail-label">Last Name</span>
                  <span className="user-show-detail-value">{user.last_name}</span>
                </div>
                <div className="user-show-detail-item">
                  <span className="user-show-detail-label">Email Verified</span>
                  <span className={`user-show-email-verified ${user.is_email_verified ? 'user-show-email-verified-yes' : 'user-show-email-verified-no'}`}>
                    {user.is_email_verified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="user-show-detail-item">
                  <span className="user-show-detail-label">Phone</span>
                  <span className="user-show-detail-value">{user.phone || 'N/A'}</span>
                </div>
                <div className="user-show-detail-item">
                  <span className="user-show-detail-label">Status</span>
                  <span className={`user-show-status ${user.deleted_at ? 'user-show-status-inactive' : 'user-show-status-active'}`}>
                    {user.deleted_at ? 'Inactive' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="user-show-section">
            <h3 className="user-show-section-title">Contact Information</h3>
            <div className="user-show-section-content">
              <div className="user-show-details-grid">
                <div className="user-show-detail-item">
                  <span className="user-show-detail-label">Address</span>
                  <span className="user-show-detail-value">{user.address || 'N/A'}</span>
                </div>
                <div className="user-show-detail-item">
                  <span className="user-show-detail-label">City</span>
                  <span className="user-show-detail-value">{user.city || 'N/A'}</span>
                </div>
                <div className="user-show-detail-item">
                  <span className="user-show-detail-label">Country</span>
                  <span className="user-show-detail-value">{user.country || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="user-show-section">
            <h3 className="user-show-section-title">Social Links</h3>
            <div className="user-show-section-content">
              <div className="user-show-social-links">
                {user.facebook_url ? (
                  <div className="user-show-detail-item">
                    <span className="user-show-detail-label">Facebook</span>
                    <a href={user.facebook_url} target="_blank" rel="noopener noreferrer" className="user-show-social-link">
                      {user.facebook_url}
                    </a>
                  </div>
                ) : null}
                {user.instagram_url ? (
                  <div className="user-show-detail-item">
                    <span className="user-show-detail-label">Instagram</span>
                    <a href={user.instagram_url} target="_blank" rel="noopener noreferrer" className="user-show-social-link">
                      {user.instagram_url}
                    </a>
                  </div>
                ) : null}
                {user.tiktok_url ? (
                  <div className="user-show-detail-item">
                    <span className="user-show-detail-label">TikTok</span>
                    <a href={user.tiktok_url} target="_blank" rel="noopener noreferrer" className="user-show-social-link">
                      {user.tiktok_url}
                    </a>
                  </div>
                ) : null}
                {!user.facebook_url && !user.instagram_url && !user.tiktok_url && (
                  <span className="user-show-no-social">No social links available</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserShow;