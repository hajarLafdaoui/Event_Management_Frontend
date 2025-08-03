import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import { FiEye, FiEdit, FiTrash, FiMoreVertical, FiX, FiPlus, FiChevronLeft, FiChevronRight, FiInfo } from 'react-icons/fi';
import ConfirmDialog from '../../ReusableComponent/ConfirmDialog';
import Alert from '../../ReusableComponent/Alert';

const initialForm = {
    event_type_id: '',
    template_name: '',
    task_name: '',
    task_description: '',
    default_days_before_event: '',
    default_priority: '',
    default_duration_hours: '',
    is_system_template: false
};

const TaskTemplateManager = ({ user }) => {
    const [templates, setTemplates] = useState([]);
    const [eventTypes, setEventTypes] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [alert, setAlert] = useState({ message: '', type: '' });
    const [confirmDialog, setConfirmDialog] = useState({
        show: false,
        onConfirm: null,
        message: ''
    });
    const [dropdownOpen, setDropdownOpen] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Fetch all data
    const fetchData = async (page = 1) => {
        try {
            setLoading(true);
            const [templatesRes, typesRes] = await Promise.all([
                api.get(`/task-templates?page=${page}&per_page=${itemsPerPage}`),
                api.get('/event-types')
            ]);
            setTemplates(templatesRes.data.data || templatesRes.data);
            setEventTypes(typesRes.data);

            // Set pagination metadata
            if (templatesRes.data.meta) {
                setTotalItems(templatesRes.data.meta.total);
                setTotalPages(templatesRes.data.meta.last_page);

                // Prevent loop by only setting if different
                if (templatesRes.data.meta.current_page !== currentPage) {
                    setCurrentPage(templatesRes.data.meta.current_page);
                }
            } else {
                setTotalItems(templatesRes.data.length);
                setTotalPages(Math.ceil(templatesRes.data.length / itemsPerPage));
            }

        } catch (err) {
            setAlert({
                message: 'Failed to load data. ' + (err.response?.data?.message || ''),
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchData(currentPage);
        }
    }, [user, currentPage]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEdit = (template) => {
        setEditingId(template.task_template_id);
        setForm({
            event_type_id: template.event_type_id,
            template_name: template.template_name,
            task_name: template.task_name,
            task_description: template.task_description || '',
            default_days_before_event: template.default_days_before_event || '',
            default_priority: template.default_priority || '',
            default_duration_hours: template.default_duration_hours || '',
            is_system_template: template.is_system_template
        });
        setShowForm(true);
        closeAllDropdowns();
    };

    const handleDelete = (id) => {
        closeAllDropdowns();
        setConfirmDialog({
            show: true,
            message: 'Are you sure you want to delete this task template?',
            onConfirm: async () => {
                try {
                    await api.delete(`/task-templates/${id}`);
                    setAlert({
                        message: 'Task template deleted successfully',
                        type: 'success'
                    });
                    fetchData(currentPage);
                } catch (err) {
                    setAlert({
                        message: 'Delete failed: ' + (err.response?.data?.message || ''),
                        type: 'error'
                    });
                } finally {
                    setConfirmDialog({ show: false, onConfirm: null, message: '' });
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/task-templates/${editingId}`, form);
                setAlert({
                    message: 'Task template updated successfully',
                    type: 'success'
                });
            } else {
                await api.post('/task-templates', form);
                setAlert({
                    message: 'Task template created successfully',
                    type: 'success'
                });
            }
            resetForm();
            fetchData(currentPage);
        } catch (err) {
            setAlert({
                message: 'Operation failed: ' + (err.response?.data?.message || ''),
                type: 'error'
            });
        }
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId(null);
        setShowForm(false);
    };

    const handleViewDetails = (template) => {
        setSelectedTemplate(template);
        closeAllDropdowns();
    };

    const closeDetails = () => {
        setSelectedTemplate(null);
    };

    // Toggle dropdown for actions (same logic as EventTemplateManager)
    const toggleDropdown = (templateId) => {
        setDropdownOpen(dropdownOpen === templateId ? null : templateId);
    };

    const closeAllDropdowns = () => {
        setDropdownOpen(null);
    };


    // Pagination handlers
    const handlePageChange = (page) => {
        setCurrentPage(page);
        closeAllDropdowns();
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = startPage + maxPagesToShow - 1;
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.actions-dropdown-container')) {
                setDropdownOpen(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (user?.role !== 'admin') {
        return (
            <div className="access-denied">
                <h3>Access Denied</h3>
                <p>You don't have permission to view this page</p>
            </div>
        );
    }

    if (loading) return <div>Loading task templates...</div>;

    return (
        <div className="task-template-manager">
            <div className="table-header">
                <h3>Task Templates</h3>
                <button
                    className="create-btn-cat"
                    onClick={() => setShowForm(true)}
                >
                    <FiPlus size={16} />
                    <span>Create New Task Template</span>
                </button>
            </div>

            {alert.message && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert({ message: '', type: '' })}
                />
            )}

            <ConfirmDialog
                show={confirmDialog.show}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ show: false, onConfirm: null, message: '' })}
                message={confirmDialog.message}
                type="delete"
            />

            {/* Details Modal */}
            {selectedTemplate && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Task Template Details</h3>
                            <button className="modal-close-btn" onClick={closeDetails}><FiX /></button>
                        </div>
                        <div className="detail-content">
                            <div className="detail-section">
                                <div className="detail-grid">
                                    <div className="detail-card">
                                        <div className="detail-row">
                                            <span className="detail-label">Template Name:</span>
                                            <span className="detail-value">{selectedTemplate.template_name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Task Name:</span>
                                            <span className="detail-value">{selectedTemplate.task_name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Event Type:</span>
                                            <span className="detail-value">
                                                <span className="category-badge">
                                                    <FiInfo className="detail-icon" />
                                                    {eventTypes.find(et => et.event_type_id === selectedTemplate.event_type_id)?.type_name || 'N/A'}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">System Template:</span>
                                            <span className="detail-value">
                                                <span className={`status-badge ${selectedTemplate.is_system_template ? 'status-active' : 'status-inactive'}`}>
                                                    {selectedTemplate.is_system_template ? 'Yes' : 'No'}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Priority:</span>
                                            <span className="detail-value">{selectedTemplate.default_priority || '-'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Days Before Event:</span>
                                            <span className="detail-value">{selectedTemplate.default_days_before_event || '-'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Duration (hours):</span>
                                            <span className="detail-value">{selectedTemplate.default_duration_hours || '-'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Description:</span>
                                            <span className="detail-value">{selectedTemplate.task_description || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="button-group"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingId ? 'Edit Task Template' : 'Create Task Template'}</h3>
                            <button
                                className="modal-close-btn"
                                onClick={resetForm}
                            >
                                <FiX />
                            </button>
                        </div>
                        <div className="event-content">
                            <form
                                onSubmit={handleSubmit}
                                className="event-form"
                            >
                                <div className="form-section">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Event Type *</label>
                                            <select
                                                name="event_type_id"
                                                value={form.event_type_id}
                                                onChange={handleChange}
                                                required
                                                className="form-input"
                                            >
                                                <option value="">Select type</option>
                                                {eventTypes.map(type => (
                                                    <option key={type.event_type_id} value={type.event_type_id}>
                                                        {type.type_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Template Name *</label>
                                            <input
                                                name="template_name"
                                                value={form.template_name}
                                                onChange={handleChange}
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Task Name *</label>
                                            <input
                                                name="task_name"
                                                value={form.task_name}
                                                onChange={handleChange}
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Task Description</label>
                                            <textarea
                                                name="task_description"
                                                value={form.task_description}
                                                onChange={handleChange}
                                                className="form-input"
                                                style={{ minHeight: '80px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Days Before Event</label>
                                            <input
                                                name="default_days_before_event"
                                                type="number"
                                                min="0"
                                                value={form.default_days_before_event}
                                                onChange={handleChange}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Priority</label>
                                            <select
                                                name="default_priority"
                                                value={form.default_priority}
                                                onChange={handleChange}
                                                className="form-input"
                                            >
                                                <option value="">Select priority</option>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Duration (hours)</label>
                                            <input
                                                name="default_duration_hours"
                                                type="number"
                                                min="0"
                                                value={form.default_duration_hours}
                                                onChange={handleChange}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                <input
                                                    type="checkbox"
                                                    name="is_system_template"
                                                    checked={form.is_system_template}
                                                    onChange={handleChange}
                                                />
                                                System Template
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn-primary-save"
                                    >
                                        {editingId ? 'Save Changes' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
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

            <div className="users-table-container">
                <div className="table-responsive">
                    <table className="users-table">
                        <thead className="table-header">
                            <tr>
                                <th className="table-header-id">ID</th>
                                <th className="table-header-name">Template Name</th>
                                <th className="table-header-role">Event Type</th>
                                <th className="table-header-email">Task Name</th>
                                <th className="table-header-status">Priority</th>
                                <th className="table-header-status">System</th>
                                <th className="table-header-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {templates.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-results">
                                        No task templates found
                                    </td>
                                </tr>
                            ) : (
                                templates.map(template => (
                                    <tr key={template.task_template_id} className="table-row">
                                        <td className="table-cell-id">{template.task_template_id}</td>
                                        <td className="table-cell-name">{template.template_name}</td>
                                        <td className="table-cell-role">
                                            <span className="role-badge">
                                                {eventTypes.find(et => et.event_type_id === template.event_type_id)?.type_name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="table-cell-email">{template.task_name}</td>
                                        <td className="table-cell-status">
                                            <span className={`status-badge ${template.default_priority}`}>
                                                {template.default_priority || '-'}
                                            </span>
                                        </td>
                                        <td className="table-cell-status">
                                            <span className={`status-badge ${template.is_system_template ? 'approved' : 'pending'}`}>
                                                {template.is_system_template ? 'System' : 'Custom'}
                                            </span>
                                        </td>
                                        <td className="table-cell-actions">
                                            <div className="actions-dropdown-container">
                                                <button
                                                    className="actions-dropdown-toggle"
                                                    onClick={() => toggleDropdown(template.task_template_id)}
                                                >
                                                    <FiMoreVertical />
                                                </button>
                                                {dropdownOpen === template.task_template_id && (
                                                    <div className="actions-dropdown">
                                                        <button
                                                            className="action-btn view-details"
                                                            onClick={() => { handleViewDetails(template); setDropdownOpen(null); }}
                                                        >
                                                            <FiEye className="action-icon" />
                                                            <span>View Details</span>
                                                        </button>
                                                        <button
                                                            className="action-btn edit"
                                                            onClick={() => { handleEdit(template); setDropdownOpen(null); }}
                                                        >
                                                            <FiEdit className="action-icon" />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => { handleDelete(template.task_template_id); setDropdownOpen(null); }}
                                                        >
                                                            <FiTrash className="action-icon" />
                                                            <span>Delete</span>
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination-container">
                        <div className="pagination-controls">
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <FiChevronLeft />
                            </button>
                            {renderPageNumbers()}
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                        <div className="pagination-info">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskTemplateManager;