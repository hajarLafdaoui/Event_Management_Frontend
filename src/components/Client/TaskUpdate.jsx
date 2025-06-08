import React, { useState, useEffect } from 'react';
import api from '../../api/api';
// import '../../../css/tasks/taskUpdate.css';
import '../../css/users/userUpdate.css';
import { FiSave, FiArrowLeft, FiCalendar, FiFlag } from 'react-icons/fi';
import Alert from '../ReusableComponent/Alert';

const TaskUpdate = ({ task, onBack }) => {
  const [formData, setFormData] = useState({
    task_name: task.task_name || '',
    task_description: task.task_description || '',
    assigned_to: task.assigned_to || 'none',
    due_date: task.due_date || '',
    priority: task.priority || 'medium',
    status: task.status || 'not_started',
    progress_percentage: task.progress_percentage || 0,
    event_id: task.event_id || '',
    template_id: task.template_id || ''
  });

  const [events, setEvents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Fetch events and templates for dropdowns
    const fetchData = async () => {
      try {
        const eventsResponse = await api.get('events');
        const templatesResponse = await api.get('task-templates');
        setEvents(eventsResponse.data);
        setTemplates(templatesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.task_name) errors.task_name = 'Task name is required.';
    if (data.progress_percentage < 0 || data.progress_percentage > 100) {
      errors.progress_percentage = 'Progress must be between 0 and 100.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    setFormError(null);
    setShowAlert(false);

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.put(`/event-tasks/${task.task_id}`, formData);
      setSuccessMessage('Task updated successfully!');
      setShowAlert(true);

      setTimeout(() => {
        onBack(true);
      }, 3000);

    } catch (error) {
      const errorMsg = error.response?.data?.message ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors).join('\n')
          : 'Failed to update task');
      setErrorMessage(errorMsg);
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    if (successMessage) {
      onBack(true);
    }
  };

  return (
    <div className="user-update-container">
      <div className="div-end">
        <div className="user-update-subheader">
          <h3 className="user-update-title">Edit Task</h3>
          <p className="user-update-subtitle">Update the task information below</p>
        </div>
        <div className="event-content-header user-update-header-update">
          <button
            onClick={() => onBack(false)}
            className="back-to-list-btn"
          >
            <FiArrowLeft className="back-icon" />
            <span className="back-text">Back to Tasks List</span>
          </button>
        </div>
      </div>

      {showAlert && successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={handleAlertClose}
          autoClose={true}
          autoCloseDuration={3000}
        />
      )}

      {showAlert && errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => {
            setShowAlert(false);
            setErrorMessage('');
          }}
        />
      )}

      <form onSubmit={handleSubmit} className="event-form" noValidate>
        {/* Basic Information Section */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Task Name*</label>
              <input
                type="text"
                name="task_name"
                value={formData.task_name}
                onChange={handleChange}
                className={`form-input ${formError?.task_name ? 'error-input' : ''}`}
              />
              {formError?.task_name && <small className="error-text">{formError.task_name}</small>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="task_description"
                value={formData.task_description}
                onChange={handleChange}
                className="form-input"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Event</label>
              <select
                name="event_id"
                value={formData.event_id}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Event</option>
                {events.map(event => (
                  <option key={event.event_id} value={event.event_id}>
                    {event.event_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Task Details Section */}
        <div className="form-section">
          <h3 className="section-title">Task Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <div className="priority-select-container">
                <FiFlag className={`priority-icon priority-${formData.priority}`} />
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="form-input"
              >
                <option value="none">Unassigned</option>
                <option value="client">Client</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <div className="date-input-container">
                <FiCalendar className="date-icon" />
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date ? formData.due_date.split('T')[0] : ''}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Progress (%)</label>
              <input
                type="number"
                name="progress_percentage"
                min="0"
                max="100"
                value={formData.progress_percentage}
                onChange={handleChange}
                className={`form-input ${formError?.progress_percentage ? 'error-input' : ''}`}
              />
              {formError?.progress_percentage && (
                <small className="error-text">{formError.progress_percentage}</small>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary-save"
            disabled={isSubmitting}
          >
            {/* <FiSave className="mr-2" /> */}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() => onBack(false)}
            className="btn-secondary-save"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskUpdate;