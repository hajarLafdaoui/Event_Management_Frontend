import React, { useState, useEffect } from 'react';
import { FiUserCheck, FiFileText, FiClock, FiCheck, FiX, FiSearch, FiMoreVertical, FiFilter } from 'react-icons/fi';
import api from '../../../api/api';
import '../../../css/users/UserStats.css';
import '../../../css/users/UserTitle.css';
import '../../../css/users/UserSearch.css';
import '../../../css/users/UserFilter.css';
import '../../../css/users/UserSort.css';
import '../../../css/users/UserTable.css';
import '../../../css/users/UserPagination.css';
import VendorApprovalDetail from './VendorApprovalDetail';

const VendorApprovals = () => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'show'
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
  const [filters, setFilters] = useState({
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch vendors only when pagination changes
  useEffect(() => {
    fetchVendors();
  }, [pagination.currentPage]);

  useEffect(() => {
    // Filter vendors based on search and status
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
  }, [vendors, searchTerm, filters]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendors', {
        params: {
          page: pagination.currentPage,
          per_page: pagination.perPage
        }
      });

      setVendors(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.meta?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId) => {
    try {
      await api.post(`/vendor-approvals/vendor/${vendorId}`, {
        action: 'approved'
      });

      // Update local state
      setVendors(prev => prev.map(v =>
        v.id === vendorId ? { ...v, status: 'approved' } : v
      ));

      setSelectedVendor(null);
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleReject = async (vendorId, reason) => {
    try {
      await api.post(`/vendor-approvals/vendor/${vendorId}`, {
        action: 'rejected',
        rejection_reason: reason
      });

      // Update local state
      setVendors(prev => prev.map(v =>
        v.id === vendorId ? { ...v, status: 'rejected' } : v
      ));

      setSelectedVendor(null);
    } catch (error) {
      console.error('Rejection failed:', error);
    }
  };

  const handleViewDetails = async (vendor) => {
    try {
      const response = await api.get(`/vendors/${vendor.id}`, {
        params: {
          with: 'availabilities,portfolios,services,user'
        }
      });

      // Normalize the response structure
      const vendorData = response.data.data;

      // If user data is nested under 'data', extract it
      if (vendorData.user && vendorData.user.data) {
        vendorData.user = vendorData.user.data;
      }

      setSelectedVendor(vendorData);
      setViewMode('show');

      // Log the data for debugging
      console.log("Vendor Data:", vendorData);
      console.log("User Data:", vendorData.user);
    } catch (error) {
      console.error('Error loading vendor details', error);
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
                <th className="table-header-actions">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-results">
                    No vendors found
                  </td>
                </tr>
              ) : (
                filteredVendors.map(vendor => (
                  <tr key={vendor.id} className="table-row">
                    <td className="table-cell-id">{vendor.id}</td>
                    <td className="table-cell-name">
                      <div className="user-name-container">
                        <div className="user-name-details">
                          <div className="user-fullname">
                            {vendor.business_name}
                          </div>
                          {/* Add this section for user details */}
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
                              onClick={() => handleViewDetails(vendor)}
                              className="actions-dropdown-item"
                            >
                              View Details
                            </button>
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