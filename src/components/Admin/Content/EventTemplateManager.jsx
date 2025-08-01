import React, { useEffect, useState } from 'react';
import api from '../../../api/api';
import { FiEye, FiEdit, FiTrash, FiMoreVertical, FiX, FiPlus } from 'react-icons/fi';

const initialForm = {
  event_type_id: '',
  template_name: '',
  template_description: '',
  default_budget: '',
  default_event_name: '',
  default_event_description: '',
  default_start_datetime: '',
  default_end_datetime: '',
  default_location: '',
  default_venue_name: '',
  default_address: '',
  default_city: '',
  default_state: '',
  default_country: '',
  default_postal_code: '',
  default_theme: '',
  default_notes: '',
  is_system_template: false
};

const EventTemplateManager = ({ user }) => {
  const [templates, setTemplates] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [templatesRes, typesRes] = await Promise.all([
        api.get('/event-templates'),
        api.get('/event-types')
      ]);
      setTemplates(templatesRes.data);
      setEventTypes(typesRes.data);
    } catch (err) {
      setError('Failed to load data. ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (template) => {
    setEditingId(template.template_id);
    setForm({
      event_type_id: template.event_type_id,
      template_name: template.template_name,
      template_description: template.template_description || '',
      default_budget: template.default_budget || '',
      default_event_name: template.default_event_name || '',
      default_event_description: template.default_event_description || '',
      default_start_datetime: template.default_start_datetime ? template.default_start_datetime.slice(0, 16) : '',
      default_end_datetime: template.default_end_datetime ? template.default_end_datetime.slice(0, 16) : '',
      default_location: template.default_location || '',
      default_venue_name: template.default_venue_name || '',
      default_address: template.default_address || '',
      default_city: template.default_city || '',
      default_state: template.default_state || '',
      default_country: template.default_country || '',
      default_postal_code: template.default_postal_code || '',
      default_theme: template.default_theme || '',
      default_notes: template.default_notes || '',
      is_system_template: template.is_system_template
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await api.delete(`/event-templates/${id}`);
      setSuccess('Template deleted successfully');
      fetchData();
    } catch (err) {
      setError('Delete failed: ' + (err.response?.data?.message || ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/event-templates/${editingId}`, form);
        setSuccess('Template updated successfully');
      } else {
        await api.post('/event-templates', form);
        setSuccess('Template created successfully');
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError('Operation failed: ' + (err.response?.data?.message || ''));
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleViewDetails = (template) => {
    setSelectedTemplate(template);
  };

  const closeDetails = () => {
    setSelectedTemplate(null);
  };

  const toggleDropdown = (templateId) => {
    setDropdownOpen(dropdownOpen === templateId ? null : templateId);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h3>Access Denied</h3>
        <p>You don't have permission to view this page</p>
      </div>
    );
  }

  if (loading) return <div>Loading templates...</div>;

  return (
    <div className="event-template-manager">

      <div className="table-header">
        <h3>Event Templates</h3>
        <button
          className="create-btn-cat"
          onClick={() => setShowForm(true)}
        >
          <FiPlus size={16} />
          <span>Create New Template</span>
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {selectedTemplate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Template Details</h3>
              <button className="modal-close-btn" onClick={closeDetails}><FiX /></button>
            </div>
            <div className="detail-section">
              <div className="detail-grid">
                <div className="detail-card">
                  <div className="detail-row"><span className="detail-label">Name:</span> <span className="detail-value">{selectedTemplate.template_name}</span></div>
                  <div className="detail-row"><span className="detail-label">Type:</span> <span className="detail-value">{eventTypes.find(et => et.event_type_id === selectedTemplate.event_type_id)?.type_name || 'N/A'}</span></div>
                  <div className="detail-row"><span className="detail-label">System Template:</span> <span className="detail-value">{selectedTemplate.is_system_template ? 'Yes' : 'No'}</span></div>
                  <div className="detail-row"><span className="detail-label">Budget:</span> <span className="detail-value">{selectedTemplate.default_budget ? `$${selectedTemplate.default_budget}` : '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">Theme:</span> <span className="detail-value">{selectedTemplate.default_theme || '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">Description:</span> <span className="detail-value">{selectedTemplate.template_description || '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">Notes:</span> <span className="detail-value">{selectedTemplate.default_notes || '-'}</span></div>
                </div>
                <div className="detail-card">
                  <div className="detail-row"><span className="detail-label">Default Event Name:</span> <span className="detail-value">{selectedTemplate.default_event_name || '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">Default Event Description:</span> <span className="detail-value">{selectedTemplate.default_event_description || '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">Default Start:</span> <span className="detail-value">{selectedTemplate.default_start_datetime || '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">Default End:</span> <span className="detail-value">{selectedTemplate.default_end_datetime || '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">Location:</span> <span className="detail-value">{selectedTemplate.default_location || '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">Venue Name:</span> <span className="detail-value">{selectedTemplate.default_venue_name || '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">Address:</span> <span className="detail-value">{selectedTemplate.default_address || '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">City:</span> <span className="detail-value">{selectedTemplate.default_city || '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">State:</span> <span className="detail-value">{selectedTemplate.default_state || '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">Country:</span> <span className="detail-value">{selectedTemplate.default_country || '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">Postal Code:</span> <span className="detail-value">{selectedTemplate.default_postal_code || '-'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Event Template' : 'Create Event Template'}</h3>
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
                      <label className="form-label">Description</label>
                      <textarea
                        name="template_description"
                        value={form.template_description}
                        onChange={handleChange}
                        className="form-input"
                        style={{ minHeight: '100px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default Event Name</label>
                      <input
                        name="default_event_name"
                        value={form.default_event_name}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default Event Description</label>
                      <textarea
                        name="default_event_description"
                        value={form.default_event_description}
                        onChange={handleChange}
                        className="form-input"
                        style={{ minHeight: '80px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default Start Date & Time</label>
                      <input
                        type="datetime-local"
                        name="default_start_datetime"
                        value={form.default_start_datetime}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default End Date & Time</label>
                      <input
                        type="datetime-local"
                        name="default_end_datetime"
                        value={form.default_end_datetime}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default Location</label>
                      <input
                        name="default_location"
                        value={form.default_location}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default Venue Name</label>
                      <input
                        name="default_venue_name"
                        value={form.default_venue_name}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default Address</label>
                      <input
                        name="default_address"
                        value={form.default_address}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default City</label>
                      <input
                        name="default_city"
                        value={form.default_city}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default State</label>
                      <input
                        name="default_state"
                        value={form.default_state}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default Country</label>
                      <input
                        name="default_country"
                        value={form.default_country}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default Postal Code</label>
                      <input
                        name="default_postal_code"
                        value={form.default_postal_code}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default Budget ($)</label>
                      <input
                        name="default_budget"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.default_budget}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default Theme</label>
                      <input
                        name="default_theme"
                        value={form.default_theme}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default Notes</label>
                      <textarea
                        name="default_notes"
                        value={form.default_notes}
                        onChange={handleChange}
                        className="form-input"
                        style={{ minHeight: '80px' }}
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
                  <th className="table-header-email">Budget</th>
                  <th className="table-header-status">System</th>
                  <th className="table-header-actions">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-results">
                      No templates found
                    </td>
                  </tr>
                ) : (
                  templates.map(template => (
                    <tr key={template.template_id} className="table-row">
                      <td className="table-cell-id">{template.template_id}</td>
                      <td className="table-cell-name">{template.template_name}</td>
                      <td className="table-cell-role">
                        <span className="role-badge">
                          {eventTypes.find(et => et.event_type_id === template.event_type_id)?.type_name || 'N/A'}
                        </span>
                      </td>
                      <td className="table-cell-email">
                        {template.default_budget ? `$${template.default_budget}` : '-'}
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
                            onClick={() => toggleDropdown(template.template_id)}
                          >
                            <FiMoreVertical />
                          </button>
                          {dropdownOpen === template.template_id && (
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
                                onClick={() => { handleDelete(template.template_id); setDropdownOpen(null); }}
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
        </div>
    
    </div>
  );
};

export default EventTemplateManager;