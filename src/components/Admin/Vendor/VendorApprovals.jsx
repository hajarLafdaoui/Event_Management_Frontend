import React, { useState, useEffect } from 'react';
import { FiUserCheck, FiFileText, FiClock, FiCheck, FiX, FiSearch, 
         FiMoreVertical, FiFilter, FiEye, FiRefreshCw } from 'react-icons/fi';
import api from '../../../api/api';
import '../../../css/users/UserStats.css';
import '../../../css/users/UserTitle.css';
import '../../../css/users/UserSearch.css';
import '../../../css/users/UserFilter.css';
import '../../../css/users/UserSort.css';
import '../../../css/users/UserTable.css';
import '../../../css/users/UserPagination.css';

// import '../../../css/users/RejectModal.css'; // New CSS file
import VendorApprovalDetail from './VendorApprovalDetail';
import Alert from '../../ReusableComponent/Alert';

const VendorApprovals = () => {
  const [viewMode, setViewMode] = useState('table');
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0
  });
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [filters, setFilters] = useState({ status: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingVendor, setRejectingVendor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Alert helper function
  const showAlert = (message, type, duration = 5000) => {
    setAlert({ message, type, duration });
    setTimeout(() => setAlert(null), duration);
  };

  // Fetch vendors
  useEffect(() => {
    fetchVendors();
  }, [pagination.currentPage]);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, filters]);

  const filterVendors = () => {
    let filtered = vendors.filter(vendor => {
      return (
        vendor.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    if (filters.status) {
      filtered = filtered.filter(vendor => vendor.status === filters.status);
    }

    setFilteredVendors(filtered);
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendors', {
        params: {
          page: pagination.currentPage,
          per_page: pagination.perPage,
          fields: 'id,business_name,contact_email,status,category,country,city,rejection_reason,user'
        }
      });

      setVendors(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.meta?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching vendors:', error);
      showAlert('Failed to load vendor applications', 'error');
    } finally {
      setLoading(false);
    }
  };

 const updateVendorStatus = async (vendorId, status, rejectionReason = '') => {
  try {
    // Update UI immediately
    setVendors(prev => prev.map(v =>
      v.id === vendorId ? { ...v, status } : v
    ));

    // Prepare request data
    const data = {
      action: status,
      notes: 'Status updated via admin panel'
    };

    // Add rejection reason only for rejected status
    if (status === 'rejected') {
      data.rejection_reason = rejectionReason;
    }

    // Use the correct endpoint
    await api.post(`/vendor-approvals/vendor/${vendorId}`, data);

    // Show success alert
    showAlert(`Vendor status updated to ${status}`, 'success');
    setDropdownOpen(null);
  } catch (error) {
    // Revert UI change on error
    setVendors(prev => prev.map(v => 
      v.id === vendorId ? { ...v, status: v.status } : v
    ));
    
    showAlert(`Failed to update status: ${error.response?.data?.message || error.message}`, 'error');
  }
};

  const handleRejectVendor = (vendor) => {
    setRejectingVendor(vendor);
    setShowRejectModal(true);
    setDropdownOpen(null);
  };

  const confirmRejection = () => {
    if (!rejectionReason.trim()) {
      showAlert('Please enter a rejection reason', 'error');
      return;
    }
    
    updateVendorStatus(rejectingVendor.id, 'rejected', rejectionReason);
    setShowRejectModal(false);
    setRejectionReason('');
  };

  const handleViewDetails = async (vendor) => {
    try {
      const response = await api.get(`/vendors/${vendor.id}`, {
        params: {
          with: 'availabilities,portfolios,services,user'
        }
      });

      const vendorData = response.data.data;
      if (vendorData.user && vendorData.user.data) {
        vendorData.user = vendorData.user.data;
      }

      setSelectedVendor(vendorData);
      setViewMode('show');
    } catch (error) {
      console.error('Error loading vendor details', error);
      showAlert('Failed to load vendor details', 'error');
    }
  };

  const toggleDropdown = (vendorId) => {
    setDropdownOpen(dropdownOpen === vendorId ? null : vendorId);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  if (viewMode === 'show') {
    return <VendorApprovalDetail vendor={selectedVendor} onBack={() => setViewMode('table')} />;
  }

  if (loading) return <div className="loading">Loading vendor applications...</div>;

  return (
    <div className="user-list-container">
      {/* Alert Container */}
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          duration={alert.duration}
          onClose={() => setAlert(null)}
        />
      )}

   {showRejectModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h3>Reject Vendor Application</h3>
        <button
          className="modal-close-btn"
          onClick={() => setShowRejectModal(false)}
        >
          <FiX />
        </button>
      </div>

      <div className="event-content">
        <div className="form-section">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Business Name
              </label>
              <div className="business-name-display">
                {rejectingVendor?.business_name}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this application is being rejected..."
                className="form-input"
                style={{ minHeight: '100px' }}
                required
              />
              {!rejectionReason.trim() && (
                <p className="error-hint">Please provide a rejection reason</p>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            className="btn-secondary-save"
            onClick={() => setShowRejectModal(false)}
          >
            Cancel
          </button>
          <button
            className="btn-primary-save"
            onClick={confirmRejection}
            disabled={!rejectionReason.trim()}
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Search and Filter Bar */}
      <div className="search-filter-container">
        <div className="search-filter-content">
          <p className='search-filter-content-title'>
            Vendor Applications
          </p>

          <div className="search-filter-row">
            <div className="search-input-container">
              <div className="search2-icon">
                <FiSearch />
              </div>
              <input
                type="text"
                placeholder="Search vendors..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-dropdown-container">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="filter-button"
                style={{ marginLeft: 8 }}
              >
                <FiFilter className="filter-icon" />
                Filter
              </button>
              {showFilters && (
                <div className="filter-dropdown-menu">
                  <div className="filter-dropdown-item">
                    <label className="filter-dropdown-label">Status</label>
                    <select
                      className="filter-dropdown-select"
                      value={filters.status}
                      onChange={e => {
                        setFilters({ ...filters, status: e.target.value });
                        setShowFilters(false);
                      }}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setFilters({ status: '' });
                      setShowFilters(false);
                    }}
                    className="clear-filters-button"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="users-table-container">
        <div className="table-responsive">
          <table className="users-table">
            <thead className="table-header">
              <tr>
                <th className="table-header-id">ID</th>
                <th className="table-header-name">Business</th>
                <th className="table-header-role">Category</th>
                <th className="table-header-email">Country/City</th>
                <th className="table-header-status">Status</th>
                <th className="table-header-reason">Rejection Reason</th>
                <th className="table-header-actions">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-results">
                    No vendors found
                  </td>
                </tr>
              ) : (
                filteredVendors.map(vendor => (
                  <tr key={`${vendor.id}-${vendor.status}`} className="table-row">
                    <td className="table-cell-id">{vendor.id}</td>
                    <td className="table-cell-name">
                      <div className="user-name-container">
                        <div className="user-name-details">
                          <div className="user-fullname">
                            {vendor.business_name}
                          </div>
                          {vendor.user && (
                            <div className="user-subtext">
                              Created by: {vendor.user.first_name} {vendor.user.last_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell-role">
                      <span className="role-badge">{vendor.category?.name || 'N/A'}</span>
                    </td>
                    <td className="table-cell-email">
                      <div className="user-fullname">
                        {vendor.country}, {vendor.city}
                      </div>
                    </td>
                    <td className="table-cell-status">
                      <span className={`status-badge ${vendor.status}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="table-cell-reason">
                      {vendor.rejection_reason ? (
                        <div className="rejection-reason-container">
                          <div className="rejection-reason-text">
                            {vendor.rejection_reason}
                          </div>
                        </div>
                      ) : (
                        <span className="no-reason">-</span>
                      )}
                    </td>
                    <td className="table-cell-actions">
                      <div className="actions-dropdown-container">
                        <button
                          className="actions-dropdown-toggle"
                          onClick={() => toggleDropdown(vendor.id)}
                        >
                          <FiMoreVertical />
                        </button>
                        {dropdownOpen === vendor.id && (
                          <div className="actions-dropdown">
                            <button 
                              className="action-btn view-details"
                              onClick={() => handleViewDetails(vendor)}
                            >
                              <FiEye className="action-icon" />
                              <span>View Details</span>
                            </button>
                            {vendor.status === 'pending' && (
                              <>
                                <button 
                                  className="action-btn approve"
                                  onClick={() => updateVendorStatus(vendor.id, 'approved')}
                                >
                                  <FiCheck className="action-icon" />
                                  <span>Approve</span>
                                </button>
                                <button 
                                  className="action-btn reject"
                                  onClick={() => handleRejectVendor(vendor)}
                                >
                                  <FiX className="action-icon" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
                            {/* {(vendor.status === 'approved' || vendor.status === 'rejected') && (
                              <button 
                                className="action-btn reset"
                                onClick={() => updateVendorStatus(vendor.id, 'pending')}
                              >
                                <FiRefreshCw className="action-icon" />
                                <span>Reset to Pending</span>
                              </button> */}
                            {/* )} */}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {vendors.length > 0 && (
          <div className="pagination-container">
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="pagination-button pagination-button-prev"
              >
                &lt;
              </button>
              {[...Array(Math.ceil(pagination.total / pagination.perPage)).keys()].map(page => (
                <button
                  onClick={() => handlePageChange(page + 1)}
                  key={page + 1}
                  className={`pagination-button ${pagination.currentPage === page + 1 ? 'active' : ''}`}
                >
                  {page + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === Math.ceil(pagination.total / pagination.perPage)}
                className="pagination-button pagination-button-next"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorApprovals;