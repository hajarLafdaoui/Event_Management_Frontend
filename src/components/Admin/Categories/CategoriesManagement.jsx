// src/components/Admin/CategoriesManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiX, FiSearch, FiFilter } from 'react-icons/fi';
import api from '../../../api/api';
import '../../../css/users/UserTable.css';
import '../../../css/users/UserPagination.css';
import '../../../css/categoryNavigation.css';
import '../../../css/EventContentClient.css';
import { Plus } from 'lucide-react';
import ConfirmDialog from '../../ReusableComponent/ConfirmDialog';
import Alert from '../../ReusableComponent/Alert';

const CategoriesManagement = () => {
    const [activeTab, setActiveTab] = useState('event');
    const [eventCategories, setEventCategories] = useState([]);
    const [vendorCategories, setVendorCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true
    });
    const [dropdownOpen, setDropdownOpen] = useState({ tab: null, id: null });

    // Alert and Confirmation states
    const [alert, setAlert] = useState(null);
    const [confirmAction, setConfirmAction] = useState({
        show: false,
        categoryId: null,
        action: null, // 'delete'
        message: '',
        tab: null, // 'event' or 'vendor'
    });

    // Search, filter, and sort states
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '', // 'active', 'inactive', or ''
    });
    const [sortOption, setSortOption] = useState({
        field: 'id',
        direction: 'asc'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showSort, setShowSort] = useState(false);

    // Show alert helper function
    const showAlert = (message, type, duration = 5000) => {
        setAlert({ message, type, duration });
        setTimeout(() => setAlert(null), duration);
    };

    // Show confirmation dialog
    const showConfirmDialog = (categoryId, action) => {
        let message = '';
        if (action === 'delete') {
            message = 'Are you sure you want to delete this category?';
        }

        setConfirmAction({
            show: true,
            categoryId,
            action,
            message,
            tab: activeTab
        });
    };

    // Handle confirmation action
    const handleConfirmAction = async () => {
        const { categoryId, action, tab } = confirmAction;

        try {
            if (action === 'delete') {
                if (tab === 'event') {
                    await api.delete(`/event-types/${categoryId}`);
                } else {
                    await api.delete(`/vendor-categories/${categoryId}`);
                }
                showAlert('Category deleted successfully', 'success');
                fetchCategories();
            }
        } catch (error) {
            showAlert(`Failed to delete category: ${error.message}`, 'error');
        } finally {
            setConfirmAction({
                show: false,
                categoryId: null,
                action: null,
                message: '',
                tab: null
            });
        }
    };

    // Fetch categories function
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'event') {
                const response = await api.get('/event-types');
                setEventCategories(response.data);
            } else {
                const response = await api.get('/vendor-categories');
                setVendorCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            showAlert('Failed to load categories', 'error');
        }
        setIsLoading(false);
    }, [activeTab]);

    // Fetch categories when activeTab changes
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCreate = async () => {
        try {
            if (activeTab === 'event') {
                await api.post('/event-types', {
                    type_name: formData.name,
                    description: formData.description,
                    is_active: formData.is_active
                });
            } else {
                await api.post('/vendor-categories', {
                    name: formData.name,
                    description: formData.description
                });
            }
            setShowCreateModal(false);
            fetchCategories();
            showAlert('Category created successfully', 'success');
        } catch (error) {
            console.error('Error creating category:', error);
            showAlert(`Failed to create category: ${error.message}`, 'error');
        }
    };

    const handleEdit = async () => {
        try {
            if (activeTab === 'event') {
                await api.put(`/event-types/${currentCategory.event_type_id}`, {
                    type_name: formData.name,
                    description: formData.description,
                    is_active: formData.is_active
                });
            } else {
                await api.put(`/vendor-categories/${currentCategory.id}`, {
                    name: formData.name,
                    description: formData.description
                });
            }
            setShowEditModal(false);
            fetchCategories();
            showAlert('Category updated successfully', 'success');
        } catch (error) {
            console.error('Error updating category:', error);
            showAlert(`Failed to update category: ${error.message}`, 'error');
        }
    };

    const openEditModal = (category) => {
        setCurrentCategory(category);
        setFormData({
            name: activeTab === 'event' ? category.type_name : category.name,
            description: category.description,
            is_active: activeTab === 'event' ? category.is_active : true
        });
        setShowEditModal(true);
    };

    const toggleDropdown = (categoryId) => {
        setDropdownOpen(
            dropdownOpen.id === categoryId && dropdownOpen.tab === activeTab
                ? { tab: null, id: null }
                : { tab: activeTab, id: categoryId }
        );
    };

    // Handle sorting
    const handleSort = (field) => {
        const direction = sortOption.field === field && sortOption.direction === 'asc' ? 'desc' : 'asc';
        setSortOption({ field, direction });
        setShowSort(false);
    };

    const filterAndSortCategories = (categories) => {
        let result = [...categories];

        // Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(cat =>
                (activeTab === 'event'
                    ? cat.type_name?.toLowerCase().includes(term)
                    : cat.name?.toLowerCase().includes(term)
                ) ||
                (cat.description?.toLowerCase().includes(term))
            );
        }

     

        // Sort
        result.sort((a, b) => {
            let aValue, bValue;
            if (sortOption.field === 'id') {
                aValue = activeTab === 'event' ? a.event_type_id : a.id;
                bValue = activeTab === 'event' ? b.event_type_id : b.id;
            } else if (sortOption.field === 'name') {
                aValue = activeTab === 'event' ? a.type_name : a.name;
                bValue = activeTab === 'event' ? b.type_name : b.name;
            }
            if (aValue < bValue) return sortOption.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOption.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    };

    return (
        <div className="categories-management">
            {alert && (
                <Alert
                    message={alert.message}
                    type={alert.type}
                    duration={alert.duration}
                    onClose={() => setAlert(null)}
                />
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                show={confirmAction.show}
                title="Confirm Action"
                message={confirmAction.message}
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirmAction({
                    show: false,
                    categoryId: null,
                    action: null,
                    message: '',
                    tab: null
                })}
                confirmText="Delete"
                type="delete"
            />

            {/* Tabs and rest of the component remains the same */}
            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'event' ? 'active' : ''}`}
                        onClick={() => setActiveTab('event')}
                    >
                        Event Categories
                    </button>
                    <button
                        className={`tab ${activeTab === 'vendor' ? 'active' : ''}`}
                        onClick={() => setActiveTab('vendor')}
                    >
                        Vendor Categories
                    </button>
                </div>
                <div className="tab-indicator-container">
                    <div
                        className="tab-indicator"
                        style={{
                            transform: `translateX(${activeTab === 'event' ? '0' : '100%'})`,
                        }}
                    />
                </div>
            </div>

            <div className="table-header">
                <h3>{activeTab === 'event' ? 'Event' : 'Vendor'} Categories</h3>
                <button onClick={() => {
                    setFormData({
                        name: '',
                        description: '',
                        is_active: true
                    });
                    setShowCreateModal(true);
                }} className="create-btn">
                    <Plus size={16} />
                    Create New {activeTab === 'event' ? 'Event' : 'Vendor'} Category
                </button>
            </div>

            <div className="search-filter-container">
                <div className="search-filter-content">
                    <div className="search-input-container">
                        <div className="search2-icon">
                            <FiSearch />
                        </div>
                        <input
                            type="text"
                            placeholder="Search categories..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-sort-container">
                       
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="loading">Loading categories...</div>
            ) : (
                <div className="users-table-container">
                    <div className="table-responsive">
                        <table className="users-table">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-header-id">ID</th>
                                    <th className="table-header-name">Name</th>
                                    <th className="table-header-email">Description</th>
                                    {activeTab === 'event' && <th className="table-header-status">Status</th>}
                                    <th className="table-header-actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {filterAndSortCategories(activeTab === 'event' ? eventCategories : vendorCategories).map(category => (
                                    <tr
                                        key={activeTab === 'event' ? category.event_type_id : category.id}
                                        className="table-row"
                                    >
                                        <td className="table-cell-id">
                                            {activeTab === 'event' ? category.event_type_id : category.id}
                                        </td>
                                        <td className="table-cell-name">
                                            <div className="user-name-container">
                                                <div className="user-name-details">
                                                    <div className="user-fullname">
                                                        {/* Use correct field based on category type */}
                                                        {activeTab === 'event' ? category.type_name : category.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell-email">
                                            {category.description || '-'}
                                        </td>
                                        {activeTab === 'event' && (
                                            <td className="table-cell-status">
                                                <span className={`status-badge ${category.is_active ? 'status-active' : 'status-inactive'}`}>
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        )}
                                        <td className="table-cell-actions">
                                            <div className="actions-dropdown-container">
                                                <button
                                                    className="actions-dropdown-toggle"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleDropdown(activeTab === 'event' ? category.event_type_id : category.id);
                                                    }}
                                                >
                                                    <FiMoreVertical />
                                                </button>

                                                {dropdownOpen.id === (activeTab === 'event' ? category.event_type_id : category.id) &&
                                                    dropdownOpen.tab === activeTab && (
                                                        <div className="actions-dropdown">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openEditModal(category);
                                                                    setDropdownOpen({ tab: null, id: null });
                                                                }}
                                                                className="actions-dropdown-item"
                                                            >
                                                                <FiEdit2 /> Edit
                                                            </button>
                                                            <div className="actions-dropdown-divider" />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    showConfirmDialog(activeTab === 'event' ? category.event_type_id : category.id, 'delete');
                                                                    setDropdownOpen({ tab: null, id: null });
                                                                }}
                                                                className="actions-dropdown-item danger"
                                                            >
                                                                <FiTrash2 /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Create {activeTab === 'event' ? 'Event' : 'Vendor'} Category</h3>
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowCreateModal(false)}
                            >
                                <FiX />
                            </button>
                        </div>

                        <div className="event-content">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleCreate();
                                }}
                                className="event-form"
                            >
                                <div className="form-section">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Description
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="form-input"
                                                style={{ minHeight: '100px' }}
                                            />
                                        </div>

                                        {/* Only show status for event categories */}
                                        {activeTab === 'event' && (
                                            <div className="form-group">
                                                <label className="form-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.is_active}
                                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                    />
                                                    Active
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn-primary-save"
                                    >
                                        Create
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="btn-secondary-save"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && currentCategory && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Edit {activeTab === 'event' ? 'Event' : 'Vendor'} Category</h3>
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowEditModal(false)}
                            >
                                <FiX />
                            </button>
                        </div>

                        <div className="event-content">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleEdit();
                                }}
                                className="event-form"
                            >
                                <div className="form-section">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Description
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="form-input"
                                                style={{ minHeight: '100px' }}
                                            />
                                        </div>

                                        {/* Only show status for event categories */}
                                        {activeTab === 'event' && (
                                            <div className="form-group">
                                                <label className="form-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.is_active}
                                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                    />
                                                    Active
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn-primary-save"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="btn-secondary-save"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesManagement;