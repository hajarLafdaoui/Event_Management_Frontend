import React, { useEffect, useState } from 'react';
import api from '../../../api/api';

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
      <div className="header">
        <h3>Event Templates</h3>
        <button
          className="btn-create"
          onClick={() => setShowForm(true)}
        >
          Create New Template
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {showForm ? (
        <form onSubmit={handleSubmit} className="template-form">
          <div className="form-group">
            <label>Event Type*</label>
            <select
              name="event_type_id"
              value={form.event_type_id}
              onChange={handleChange}
              required
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
            <label>Template Name*</label>
            <input
              name="template_name"
              value={form.template_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="template_description"
              value={form.template_description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Default Event Name</label>
            <input
              name="default_event_name"
              value={form.default_event_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Default Event Description</label>
            <textarea
              name="default_event_description"
              value={form.default_event_description}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Default Start Date & Time</label>
            <input
              type="datetime-local"
              name="default_start_datetime"
              value={form.default_start_datetime}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Default End Date & Time</label>
            <input
              type="datetime-local"
              name="default_end_datetime"
              value={form.default_end_datetime}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Default Location</label>
            <input
              name="default_location"
              value={form.default_location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Default Venue Name</label>
            <input
              name="default_venue_name"
              value={form.default_venue_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Default Address</label>
            <input
              name="default_address"
              value={form.default_address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Default City</label>
            <input
              name="default_city"
              value={form.default_city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Default State</label>
            <input
              name="default_state"
              value={form.default_state}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Default Country</label>
            <input
              name="default_country"
              value={form.default_country}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Default Postal Code</label>
            <input
              name="default_postal_code"
              value={form.default_postal_code}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Default Budget ($)</label>
            <input
              name="default_budget"
              type="number"
              min="0"
              step="0.01"
              value={form.default_budget}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Default Theme</label>
            <input
              name="default_theme"
              value={form.default_theme}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Default Notes</label>
            <textarea
              name="default_notes"
              value={form.default_notes}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <div className="form-check">
            <label>
              <input
                type="checkbox"
                name="is_system_template"
                checked={form.is_system_template}
                onChange={handleChange}
              />
              System Template
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save">
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="template-list">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Event Type</th>
                <th>Budget</th>
                <th>System</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.length > 0 ? (
                templates.map(t => (
                  <tr key={t.template_id}>
                    <td>{t.template_name}</td>
                    <td>
                      {eventTypes.find(et => et.event_type_id === t.event_type_id)?.type_name || 'N/A'}
                    </td>
                    <td>{t.default_budget ? `$${t.default_budget}` : '-'}</td>
                    <td>{t.is_system_template ? 'Yes' : 'No'}</td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(t)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(t.template_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No templates found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventTemplateManager;