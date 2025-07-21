import React, { useState, useEffect } from 'react';
import { FiX, FiFileText, FiClock, FiCheck, FiXCircle, FiArrowLeft, FiUser, FiImage, FiLayers, FiCalendar, FiClock as FiClockIcon, FiMapPin, FiGlobe, FiExternalLink, FiInfo } from 'react-icons/fi';
import { FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';
import '../../../css/VendorApprovals.css';

const VendorApprovalDetail = ({ vendor, onBack }) => {
  const [activeTab, setActiveTab] = useState('business');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userData, setUserData] = useState(null);

  // Format created_at timestamp
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Navigation for portfolio carousel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === vendor.portfolio.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? vendor.portfolio.length - 1 : prev - 1));
  };

  // Extract user data when vendor changes
  useEffect(() => {
    if (vendor && vendor.user) {
      // Handle both Laravel API resource wrapping and direct data
      setUserData(vendor.user.data || vendor.user);
    }
  }, [vendor]);

  // Render active tab content
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'business':
        return (
          <div className="detail-section">
            <h3 className="section-title">Business Information</h3>
            <div className="detail-grid">
              <div className="detail-card">
                <div className="detail-row">
                  <span className="detail-label">Business Name:</span>
                  <span className="detail-value">{vendor.business_name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{vendor.description || 'N/A'}</span>
                </div>

                {/* Vendor Category below description */}
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">
                    <span className="category-badge">
                      <FiInfo className="detail-icon" />
                      {vendor.category?.name || 'N/A'}
                    </span>
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Registration Date:</span>
                  <span className="detail-value">
                    <FiClockIcon className="detail-icon" />
                    {formatDate(vendor.created_at)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">
                    <span className={`status-badge ${vendor.status === 'approved' ? 'status-active' : vendor.status === 'rejected' ? 'status-inactive' : 'status-pending'}`}>
                      {vendor.status || 'pending'}
                    </span>
                  </span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-row">
                  <span className="detail-label">Website:</span>
                  <span className="detail-value">
                    {vendor.website ? (
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="detail-link">
                        <FiGlobe className="detail-icon" />
                        {vendor.website}
                      </a>
                    ) : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Country:</span>
                  <span className="detail-value">
                    <FiMapPin className="detail-icon" />
                    {vendor.country || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">City:</span>
                  <span className="detail-value">{vendor.city || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Street Address:</span>
                  <span className="detail-value">{vendor.street_address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Availabilities Section */}
            <div className="detail-section">
              <h3 className="section-title">Availability Schedule</h3>
              {vendor.availabilities?.length > 0 ? (
                <div className="availabilities-grid">
                  {vendor.availabilities.map((availability, index) => (
                    <div key={index} className="availability-card">
                      <div className="availability-date">
                        <FiCalendar className="availability-icon" />
                        {availability.date}
                      </div>
                      <div className="availability-time">
                        <FiClock className="availability-icon" />
                        {availability.start_time} - {availability.end_time}
                      </div>
                      <div className="availability-status">
                        <span className={`status-badge ${availability.is_available ? 'status-active' : 'status-inactive'}`}>
                          {availability.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No availability information found</div>
              )}
            </div>
          </div>
        );

      case 'created':
        return (
          <div className="detail-section">
            <h3 className="section-title">Created By</h3>

            {userData ? (
              <>

                <div className="user-avatar-container">

                  {userData.profile_picture ? (
                    <img
                      src={userData.profile_picture}
                      alt={`${userData.first_name} ${userData.last_name}`}
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatr-placeholder">
                      <span className="avatar-initials">
                        {userData.first_name?.charAt(0) || ''}
                        {userData.last_name?.charAt(0) || ''}
                      </span>
                    </div>
                  )}
                  <div className="user-name">
                    {userData?.first_name || ''} {userData?.last_name || 'N/A'}
                  </div>
                </div>


                <div className="user-info-section">
                  <div className="user-info-grid">
                    <div className="user-info-item">
                      <span className="info-label">ID:</span>
                      <span className="info-value">{userData.id || 'N/A'}</span>
                    </div>
                    <div className="user-info-item">
                      <span className="info-label">Gender:</span>
                      <span className="info-value">{userData.gender || 'N/A'}</span>
                    </div>
                    <div className="user-info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">
                        {userData.email ? (
                          <a href={`mailto:${userData.email}`} className="detail-link">
                            {userData.email}
                          </a>
                        ) : 'N/A'}
                      </span>
                    </div>
                    <div className="user-info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">
                        {userData.phone ? (
                          <a href={`tel:${userData.phone}`} className="detail-link">
                            {userData.phone}
                          </a>
                        ) : 'N/A'}
                      </span>
                    </div>
                    <div className="user-info-item">
                      <span className="info-label">Country:</span>
                      <span className="info-value">{userData.country || 'N/A'}</span>
                    </div>
                     <div className="user-info-item">
                      <span className="info-label">City:</span>
                      <span className="info-value">{userData.city || 'N/A'}</span>
                    </div>

                    <div className="user-info-item">
                      <span className="info-label">address:</span>
                      <span className="info-value">{userData.address || 'N/A'}</span>
                    </div>

                  </div>
                </div>

                {/* Social Links */}
                <h3 className="section-title">Social Media</h3>
                <div className="social-links-grid">
                  {userData.instagram_url && (
                    <a
                      href={userData.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link instagram"
                    >
                      <FaInstagram className="social-icon" />
                      <span>Instagram</span>
                      <FiExternalLink className="external-icon" />
                    </a>
                  )}
                  {userData.facebook_url && (
                    <a
                      href={userData.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link facebook"
                    >
                      <FaFacebook className="social-icon" />
                      <span>Facebook</span>
                      <FiExternalLink className="external-icon" />
                    </a>
                  )}
                  {userData.tiktok_url && (
                    <a
                      href={userData.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link tiktok"
                    >
                      <FaTiktok className="social-icon" />
                      <span>TikTok</span>
                      <FiExternalLink className="external-icon" />
                    </a>
                  )}
                  {!userData.instagram_url &&
                    !userData.facebook_url &&
                    !userData.tiktok_url && (
                      <div className="no-data">No social media links found</div>
                    )}
                </div>
              </>
            ) : (
              <div className="no-data">
                <FiUser className="no-data-icon" />
                No user information found
              </div>
            )}
          </div>
        );

      case 'portfolio':
        return (
          <div className="detail-section">
            <h3 className="section-title">Portfolio</h3>
            {vendor.portfolio?.length > 0 ? (
              <div className="portfolio-carousel">
                <button className="carousel-btn prev" onClick={prevSlide}>
                  &lt;
                </button>

                <div className="carousel-slide">
                  {vendor.portfolio[currentSlide].type === 'image' ? (
                    <img
                      src={vendor.portfolio[currentSlide].url}
                      alt={vendor.portfolio[currentSlide].caption || 'Portfolio item'}
                      className="portfolio-media"
                    />
                  ) : (
                    <video controls className="portfolio-media">
                      <source src={vendor.portfolio[currentSlide].url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <div className="portfolio-caption">
                    {vendor.portfolio[currentSlide].caption || 'No caption'}
                  </div>
                </div>

                <button className="carousel-btn next" onClick={nextSlide}>
                  &gt;
                </button>

                <div className="carousel-indicators">
                  {vendor.portfolio.map((_, index) => (
                    <span
                      key={index}
                      className={`indicator ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-data">No portfolio items found</div>
            )}
          </div>
        );

      case 'services':
        return (
          <div className="detail-section">
            <h3 className="section-title">Services & Packages</h3>
            {vendor.services?.length > 0 ? (
              <div className="services-container">
                {vendor.services.map((service, index) => (
                  <div key={index} className="service-card">
                    <div className="service-header">
                      <h4 className="service-name">{service.name}</h4>
                      <div className="service-description">{service.description}</div>
                    </div>

                    {service.pricingPackages?.length > 0 && (
                      <div className="packages-container">
                        {service.pricingPackages.map((pkg, pkgIndex) => (
                          <div key={pkgIndex} className="package-card">
                            <div className="package-header">
                              <h5 className="package-name">{pkg.name}</h5>
                              <div className="package-price">${pkg.price}</div>
                            </div>

                            {pkg.features?.length > 0 && (
                              <ul className="package-features">
                                {pkg.features.map((feature, featureIndex) => (
                                  <li key={featureIndex} className="feature-item">
                                    <FiCheck className="feature-icon" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No services found</div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="user-show-container">
      <div className="user-show-header">
        <div className="user-show-subheader">
          <p className="user-show-subtitle">View and manage vendor details</p>
          <div className="user-show-divider"></div>
        </div>
        <div className="event-content-header">
          <button onClick={onBack} className="back-to-list-btn">
            <FiArrowLeft className="back-icon" />
            <span className="back-text">Back to Vendor Applications</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs2-container">
        <div className="tabs2">
          <button
            className={`tab2 ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            <FiFileText className="tab2-icon" /> Business Details
          </button>
          <button
            className={`tab2 ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            <FiUser className="tab-icon" /> Created By
          </button>
          <button
            className={`tab2 ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <FiImage className="tab2-icon" /> Portfolio
          </button>
          <button
            className={`tab2 ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <FiLayers className="tab2-icon" /> Services
          </button>
        </div>
        <div className="tab2-indicator-container">
          <div
            className="tab2-indicator"
            style={{
              transform: `translateX(${activeTab === 'business' ? '0' :
                activeTab === 'created' ? '100%' :
                  activeTab === 'portfolio' ? '200%' :
                    '300%'
                })`,
              width: '25%'
            }}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="detail-content">
        {renderActiveTab()}

        {/* Location Section - Visible on all tabs */}
        <div className="detail-section location-section">
          <h3 className="section-title">Location</h3>
          <div className="location-grid">
            <div className="location-item">
              <FiMapPin className="location-icon" />
              <div>
                <div className="location-label">Country</div>
                <div className="location-value">{vendor.country || 'N/A'}</div>
              </div>
            </div>
            <div className="location-item">
              <FiMapPin className="location-icon" />
              <div>
                <div className="location-label">City</div>
                <div className="location-value">{vendor.city || 'N/A'}</div>
              </div>
            </div>
            <div className="location-item">
              <FiMapPin className="location-icon" />
              <div>
                <div className="location-label">Street Address</div>
                <div className="location-value">{vendor.street_address || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorApprovalDetail;