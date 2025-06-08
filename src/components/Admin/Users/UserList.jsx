import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import UserShow from './UserShow';
import UserUpdate from './UserUpdate';
// import '../../../css/statics_user_cards.css';
import '../../../css/users/UserStats.css';
import '../../../css/users/UserTitle.css';
import '../../../css/users/UserSearch.css';
import '../../../css/users/UserFilter.css';
import '../../../css/users/UserSort.css';
import '../../../css/users/UserTable.css';
import '../../../css/users/UserPagination.css';

import group from '../../../uploads/icons/group.png';
import check from '../../../uploads/icons/check.png';
import addGroup from '../../../uploads/icons/addGroup.png';




import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import { FiSearch, FiFilter, FiUser, FiUserPlus, FiUserCheck, FiRefreshCw, FiMoreVertical, FiEdit2, FiEye, FiTrash2, FiCornerUpLeft } from 'react-icons/fi';


// import { AlertContainer } from '../../ReusableComponent/AlertToast';
import ConfirmDialog from '../../ReusableComponent/ConfirmDialog';
import Alert from '../../ReusableComponent/Alert';

const UserList = () => {
  const [users, setUsers] = useState([]);

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    role: '',
    status: '',
    dateRange: ''
  });
  const [confirmAction, setConfirmAction] = useState({
    show: false,
    userId: null,
    action: null,
    message: ''
  });
  const [showSort, setShowSort] = useState(false);
  const [sortOption, setSortOption] = useState({
    field: 'id',
    direction: 'asc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 4,
    total: 0
  });
  const [alert, setAlert] = useState(null);

  // Alert helper function
  const showAlert = (message, type, duration = 5000) => {
    setAlert({ message, type, duration });
    setTimeout(() => setAlert(null), duration);
  };

  // Deactivate action with alert
  const handleSoftDelete = async (userId) => {
    try {
      await api.delete(`auth/admin/users/${userId}`);
      showAlert('User deactivated successfully', 'success');
      fetchUsers();
    } catch (error) {
      showAlert(`Failed to deactivate user: ${error.message}`, 'error');
    }
  };

  // Restore action with alert
  const handleRestore = async (userId) => {
    try {
      await api.post(`auth/admin/users/${userId}/restore`);
      showAlert('User restored successfully', 'success');
      fetchUsers();
    } catch (error) {
      showAlert(`Failed to restore user: ${error.message}`, 'error');
    }
  };

  // Delete action with alert
  const handleForceDelete = async (userId) => {
    try {
      await api.delete(`auth/admin/users/${userId}/force`);
      showAlert('User permanently deleted', 'success');
      fetchUsers();
    } catch (error) {
      showAlert(`Failed to delete user: ${error.message}`, 'error');
    }
  };
  const handleDelete = async () => {
    try {
      // Your delete logic
      showAlert('User deleted successfully!', 'success');
    } catch (error) {
      showAlert('Failed to delete user!', 'error');
    }
  };


  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage]); // Add pagination dependency


  // Add these sort handler functions
  const handleSort = (field) => {
    const direction = sortOption.field === field && sortOption.direction === 'asc' ? 'desc' : 'asc';
    setSortOption({ field, direction });
    setShowSort(false);
  };

  const sortUsers = (users) => {
    return [...users].sort((a, b) => {
      let comparison = 0;

      if (sortOption.field === 'name') {
        const nameA = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase().trim();
        const nameB = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase().trim();
        comparison = nameA.localeCompare(nameB);
      } else if (sortOption.field === 'date') {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        comparison = dateA - dateB;
      } else {
        // Default sort by ID
        comparison = (a.id || 0) - (b.id || 0);
      }

      return sortOption.direction === 'asc' ? comparison : -comparison;
    });
  };

  // Add pagination handlers
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Add dropdown state for each user
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const toggleDropdown = (userId) => {
    setDropdownOpen(dropdownOpen === userId ? null : userId);
  };


  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filters, sortOption]); // All relevant dependencies
  const fetchUsers = async () => {
    try {
      const response = await api.get('auth/admin/users', {
        params: {
          page: pagination.currentPage,
          per_page: pagination.perPage
        }
      });

      setUsers(response.data.data.map(user => ({
        ...user,
        profile_picture: user.profile_picture
          ? user.profile_picture.startsWith('http')
            ? user.profile_picture
            : `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/storage/${user.profile_picture}`
          : null
      })));

      setPagination(prev => ({
        ...prev,
        total: response.data.meta?.total || 0
      }));

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      showAlert('Failed to load users', 'error');
    }
  };

  const filterUsers = () => {
    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user =>
        (user.first_name?.toLowerCase() || '').includes(term) ||
        (user.last_name?.toLowerCase() || '').includes(term) ||
        (user.email?.toLowerCase() || '').includes(term) ||
        (user.phone?.toLowerCase() || '').includes(term)
      );
    }

    // Apply role filter
    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }

    // Apply status filter
    if (filters.status) {
      if (filters.status === 'active') {
        result = result.filter(user => !user.deleted_at);
      } else {
        result = result.filter(user => user.deleted_at);
      }
    }

    // Apply date filter (example: last 7 days)
    if (filters.dateRange === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      result = result.filter(user => {
        const userDate = user.created_at ? new Date(user.created_at) : new Date(0);
        return userDate > oneWeekAgo;
      });
    }

    // Apply sorting after all filters
    result = sortUsers(result);

    setFilteredUsers(result);
  };

  // Calculate summary stats
  const totalUsers = users.length;
  const activeUsers = users.filter(user => !user.deleted_at).length;
  const newUsers = users.filter(user => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(user.created_at) > oneWeekAgo;
  }).length;




  // Soft delete a user

  // Confirm action dialog
  // Add this function to verify user existence before showing dialog
  const verifyUserExists = (userId) => {
    return users.some(user => user.id === userId);
  };

  // Update your showConfirmDialog function
  const showConfirmDialog = (userId, action) => {
    if (!verifyUserExists(userId)) {
      toast.error('User not found');
      return;
    }

    let message = '';
    switch (action) {
      case 'delete':
        message = 'Are you sure you want to deactivate this user?';
        break;
      case 'restore':
        message = 'Are you sure you want to restore this user?';
        break;
      case 'forceDelete':
        message = 'Are you sure you want to permanently delete this user? This cannot be undone.';
        break;
      default:
        return;
    }

    setConfirmAction({
      show: true,
      userId,
      action,
      message
    });
  };

  const handleConfirmAction = async () => {
    const { userId, action } = confirmAction;

    try {
      switch (action) {
        case 'delete':
          await handleSoftDelete(userId);
          break;
        case 'restore':
          await handleRestore(userId);
          break;
        case 'forceDelete':
          await handleForceDelete(userId);
          break;
        default:
          break;
      }
    } catch (error) {
      showAlert(`Action failed: ${error.message}`, 'error');
    } finally {
      setConfirmAction({ show: false, userId: null, action: null, message: '' });
    }
  };



  const handleShowUser = (user) => {
    setSelectedUser(user);
    setViewMode('show');
  };

  const handleUpdateUser = (user) => {
    setSelectedUser(user);
    setViewMode('update');
  };

// In UserList component
const handleBackToList = (shouldRefresh = false) => {
  setViewMode('table');
  setSelectedUser(null);
  if (shouldRefresh) {
    fetchUsers(); // Explicitly refresh the data
  }
};

// Update how you pass the onBack prop to UserUpdate
{viewMode === 'update' && (
  <UserUpdate 
    user={selectedUser} 
    onBack={(shouldRefresh) => handleBackToList(shouldRefresh)} 
  />
)}

  // ... (keep all your existing handler functions)

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="user-list-container">
      {/* Summary Cards */}
         {viewMode === 'table' && (
      <>
      <div className="stats-grid">
        <div className="stat-card stat-card-total">
          <div className="stat-content">
            <p className="stat-label">Total Users</p>
            <p className="stat-value">{totalUsers}</p>
          </div>
          <div className="stat-icon-container stat-icon-total">
            <img className='user-icon' src={group} alt="" />
          </div>

        </div>

        <div className="stat-card stat-card-active">
          <div className="stat-content">
            <p className="stat-label">Active Users</p>
            <p className="stat-value">{activeUsers}</p>
          </div>
          <div className="stat-icon-container stat-icon-active">
            <img className='user-icon' src={check} alt="" />

          </div>

        </div>

        <div className="stat-card stat-card-new">

          <div className="stat-content">
            <p className="stat-label">New Users (7d)</p>
            <p className="stat-value">{newUsers}</p>
          </div>
          <div className="stat-icon-container stat-icon-new">
            <img className='user-icon' src={addGroup} alt="" />

          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-container">
        <div className="search-filter-content">
          <p className='search-filter-content-title'>User list </p>

          {/* SEARCH */}
          <div className="search-input-container">
            <div className="search2-icon">
              <FiSearch />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* FILTER AND SORT  */}
          <div className="filter-sort-container">
            <div className="filter-dropdown-container">
              <button
                onClick={() => {
                  setShowFilters(!showFilters);
                  setShowSort(false);
                }}
                className="filter-button"
              >
                <FiFilter className="filter-icon" />
                Filters
              </button>
              {showFilters && (
                <div className="filter-dropdown-menu">
                  {/* Add the filter selects here */}
                  <div className="filter-dropdown-item">
                    <label className="filter-dropdown-label">Role</label>
                    <select
                      className="filter-dropdown-select"
                      value={filters.role}
                      onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    >
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="vendor">Vendor</option>
                      <option value="client">Client</option>
                    </select>
                  </div>

                  <div className="filter-dropdown-item">
                    <label className="filter-dropdown-label">Status</label>
                    <select
                      className="filter-dropdown-select"
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="filter-dropdown-item">
                    <label className="filter-dropdown-label">Date Range</label>
                    <select
                      className="filter-dropdown-select"
                      value={filters.dateRange}
                      onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                    >
                      <option value="">All Time</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setFilters({
                        role: '',
                        status: '',
                        dateRange: ''
                      });
                      setShowFilters(false);
                    }}
                    className="clear-filters-button"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>



            <div className="sort-dropdown-container">
              <button
                onClick={() => {
                  setShowSort(!showSort);
                  setShowFilters(false);
                }}
                className="sort-button"
              >
                <span>Sort by</span>
                <svg
                  className={`sort-icon ${showSort ? 'active' : ''}`}
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                >
                  <path
                    fill="currentColor"
                    d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z"
                  />
                </svg>
              </button>

              {showSort && (
                <div className="sort-dropdown-menu">
                  <button
                    onClick={() => handleSort('id')}
                    className={`sort-dropdown-item ${sortOption.field === 'id' ? 'active' : ''}`}
                  >
                    ID {sortOption.field === 'id' && (
                      <span>{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                  <button
                    onClick={() => handleSort('name')}
                    className={`sort-dropdown-item ${sortOption.field === 'name' ? 'active' : ''}`}
                  >
                    Name {sortOption.field === 'name' && (
                      <span>{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                  <button
                    onClick={() => handleSort('date')}
                    className={`sort-dropdown-item ${sortOption.field === 'date' ? 'active' : ''}`}
                  >
                    Date Created {sortOption.field === 'date' && (
                      <span>{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
 </>
    )}      {/* Main Table */}
      <div className="users-table-container">
        {viewMode === 'table' ? (
          <>
            <div className="table-responsive">
              <table className="users-table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-id">ID</th>
                    <th className="table-header-name">Name</th>
                    <th className="table-header-email">Email</th>
                    <th className="table-header-role">Role</th>
                    <th className="table-header-status">Status</th>
                    <th className="table-header-actions">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="table-row">
                      <td className="table-cell-id">{user.id}</td>
                      <td className="table-cell-name">
                        <div className="user-name-container">
                          <div className="user-avatar-container">
                            {user.profile_picture ? (
                              <img
                                src={user.profile_picture}
                                alt={`${user.first_name} ${user.last_name}`}
                                className="user-avatar"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '';
                                }}
                              />
                            ) : (
                              <div className="user-avatar-placeholder">
                                <span className="avatar-initialsS">
                                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="user-name-details">
                            <div className="user-fullname">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="user-phone">{user.phone || 'No phone'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell-email">
                        <a href={`mailto:${user.email}`} className="user-email-link">
                          {user.email}
                        </a>
                      </td>
                      <td className="table-cell-role">
                        <span className="role-badge">{user.role}</span>
                      </td>
                      <td className="table-cell-status">
                        <span className={`status-badge ${user.deleted_at ? 'status-inactive' : 'status-active'}`}>
                          {user.deleted_at ? 'Inactive' : 'Active'}
                        </span>

                      </td>
                      <td className="table-cell-actions">
                        <div className="actions-dropdown-container">
                          <button
                            className="actions-dropdown-toggle"
                            onClick={() => toggleDropdown(user.id)}
                          >
                            <FiMoreVertical />
                          </button>

                          {dropdownOpen === user.id && (
                            <div className="actions-dropdown">
                              <button
                                onClick={() => {
                                  handleShowUser(user);
                                  setDropdownOpen(null);
                                }}
                                className="actions-dropdown-item"
                              >
                                <FiEye /> View
                              </button>

                              <button
                                onClick={() => {
                                  handleUpdateUser(user);
                                  setDropdownOpen(null);
                                }}
                                className="actions-dropdown-item"
                              >
                                <FiEdit2 /> Edit
                              </button>

                              <div className="actions-dropdown-divider" />
                              {user.deleted_at ? (
                                <>
                                  <button
                                    onClick={() => {
                                      showConfirmDialog(user.id, 'restore');
                                      setDropdownOpen(null);
                                    }}
                                    className="actions-dropdown-item"
                                  >
                                    <FiCornerUpLeft /> Restore
                                  </button>

                                  <button
                                    onClick={() => {
                                      showConfirmDialog(user.id, 'forceDelete');
                                      setDropdownOpen(null);
                                    }}
                                    className="actions-dropdown-item danger"
                                  >
                                    <FiTrash2 /> Delete Permanently
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    showConfirmDialog(user.id, 'delete');
                                    setDropdownOpen(null);
                                  }}
                                  className="actions-dropdown-item danger"
                                >
                                  <FiTrash2 /> Deactivate
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length > 0 && (
              <div className="pagination-container">
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="pagination-button pagination-button-prev"
                  >
                    &lt;
                  </button>

                  {/* Always show first page if not already showing */}
                  {pagination.currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(1)}
                      className="pagination-button"
                    >
                      1
                    </button>
                  )}

                  {/* Show ellipsis if gap between first page and current page */}
                  {pagination.currentPage > 3 && (
                    <span className="pagination-dots">...</span>
                  )}

                  {/* Show previous page if not first page */}
                  {pagination.currentPage > 2 && (
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      className="pagination-button"
                    >
                      {pagination.currentPage - 1}
                    </button>
                  )}

                  {/* Current page */}
                  <button
                    className="pagination-button active"
                  >
                    {pagination.currentPage}
                  </button>

                  {/* Show next page if not last page */}
                  {pagination.currentPage < Math.ceil(pagination.total / pagination.perPage) - 1 && (
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      className="pagination-button"
                    >
                      {pagination.currentPage + 1}
                    </button>
                  )}

                  {/* Show ellipsis if gap between current page and last page */}
                  {pagination.currentPage < Math.ceil(pagination.total / pagination.perPage) - 2 && (
                    <span className="pagination-dots">...</span>
                  )}

                  {/* Always show last page if not already showing */}
                  {pagination.currentPage < Math.ceil(pagination.total / pagination.perPage) && (
                    <button
                      onClick={() => handlePageChange(Math.ceil(pagination.total / pagination.perPage))}
                      className="pagination-button"
                    >
                      {Math.ceil(pagination.total / pagination.perPage)}
                    </button>
                  )}

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
          </>
        ) : viewMode === 'show' ? (
          <UserShow user={selectedUser} onBack={handleBackToList} />
        ) : (
          <UserUpdate user={selectedUser} onBack={handleBackToList} />
        )}
      </div>


      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        // Add these props to prevent the error:
        closeButton={false}
        draggablePercent={60}
      // transition={Slide}
      />


       <ConfirmDialog
  show={confirmAction.show}
  title="Confirm Action"
  message={confirmAction.message}
  onConfirm={handleConfirmAction}
  onCancel={() => setConfirmAction({ show: false, userId: null, action: null, message: '' })}
  confirmText={
    confirmAction.action === 'forceDelete' ? 'Delete Permanently' :
    confirmAction.action === 'restore' ? 'Restore' : 
    'Deactivate'
  }
  type={
    confirmAction.action === 'forceDelete' ? 'delete' :
    confirmAction.action === 'restore' ? 'restore' : 
    'deactivate'
  }
/>

          {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          duration={alert.duration}
          onClose={() => setAlert(null)}
        />
      )}


    </div>
  );
};

export default UserList;