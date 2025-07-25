import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEvents } from '../../context/EventContext';
import '../../css/EventContentClient.css';
import {FiTrash,FiRefreshCw } from 'react-icons/fi';
import {Plus} from 'lucide-react';
import ConfirmDialog from '../ReusableComponent/ConfirmDialog';
import Alert from '../ReusableComponent/Alert';
const EventContent = () => {
  const { events, eventTypes, loading, error, createEvent, updateEvent,deleteEvent } = useEvents();

  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [formError, setFormError] = useState(null);
 const [viewingEvent, setViewingEvent] = useState(null);
 const [closing, setClosing] = useState(false);
 const [alert, setAlert] = useState({ message: '', type: '' });
const [confirmDialog, setConfirmDialog] = useState({ show: false, onConfirm: null });

  const initialFormData = {
    event_type_id: '',
    event_name: '',
    event_description: '',
    start_datetime: '',
    end_datetime: '',
    location: '',
    venue_name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    budget: '',
    theme: '',
    notes: '',
    status: '' // only for editing
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
  }, []);

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setEditingEventId(null);
    setFormData(initialFormData);
    setFormError(null);
  };
const handleViewClick = (event) => {
  console.log('Clicked event:', event)
  setViewingEvent(event);
  setShowCreateForm(false);
  setEditingEventId(null);
  setFormError(null);
};
const handleClose = () => {
  setClosing(true);
  setTimeout(() => {
    setViewingEvent(null);
    setClosing(false);
  }, 400); // Duration matches the CSS animation
};

  const handleEditClick = (event) => {
    setShowCreateForm(true);
    setEditingEventId(event.event_id);
    setFormData({
      event_type_id: event.event_type?.event_type_id || '',
      event_name: event.event_name,
      event_description: event.event_description || '',
      start_datetime: event.start_datetime?.slice(0, 16) || '',
      end_datetime: event.end_datetime?.slice(0, 16) || '',
      location: event.location || '',
      venue_name: event.venue_name || '',
      address: event.address || '',
      city: event.city || '',
      state: event.state || '',
      country: event.country || '',
      postal_code: event.postal_code || '',
      budget: event.budget || '',
      theme: event.theme || '',
      notes: event.notes || '',
      status: event.status || ''
    });
    setFormError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateCreate = (data) => {
    const errors = {};
    if (!data.event_type_id) errors.event_type_id = 'Event type is required.';
    if (!data.event_name) errors.event_name = 'Event name is required.';
    if (!data.start_datetime) errors.start_datetime = 'Start date/time is required.';
    if (!data.end_datetime) errors.end_datetime = 'End date/time is required.';
    if (data.start_datetime && data.end_datetime && new Date(data.end_datetime) <= new Date(data.start_datetime)) {
      errors.end_datetime = 'End date/time must be after start date/time.';
    }
    if (!data.location) errors.location = 'Location is required.';
    return errors;
  };

  const validateUpdate = (data) => {
    const errors = validateCreate(data);
    const validStatuses = ['draft', 'planned', 'in_progress', 'completed', 'cancelled'];
    if (!data.status || !validStatuses.includes(data.status)) {
      errors.status = 'Please select a valid status.';
    }
    return errors;
  };
  const handleDelete = async (eventId) => {
    setConfirmDialog({
    show: true,
    onConfirm: async () => {
      setConfirmDialog({ show: false, onConfirm: null });
      const result = await deleteEvent(eventId);
      if (!result.success) {
        setAlert({ message: 'Failed to delete event: ' + result.error, type: 'error' });
      } else {
        setAlert({ message: 'Event deleted successfully.', type: 'success' });
      }
    }
  });
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const errors = editingEventId ? validateUpdate(formData) : validateCreate(formData);
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    try {
      if (editingEventId) {
        const result = await updateEvent(editingEventId, formData);
        if (!result.success) throw new Error(result.error);
        setAlert({ message: 'Event updated successfully.', type: 'success' });
      } else {
        const result = await createEvent(formData);
        if (!result.success) throw new Error(result.error);
        setAlert({ message: 'Event created successfully.', type: 'success' });
      }
      setShowCreateForm(false);
    } catch (err) {
      setFormError({ api: err.message });
    }
  };

  if (loading) return <p>Loading events...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const filteredEvents = events.filter((event) => {
  const matchesType = eventTypeFilter ? event.event_type?.type_name === eventTypeFilter : true;

  const startDate = startDateFilter ? new Date(startDateFilter) : null;
  const endDate = endDateFilter ? new Date(endDateFilter) : null;

  const eventStart = new Date(event.start_datetime);
  const eventEnd = new Date(event.end_datetime);

  // Check for date overlap if both filters set
  const matchesDateRange =
    (!startDate && !endDate) || // no filter, show all
    (startDate && endDate && eventStart <= endDate && eventEnd >= startDate) ||
    (startDate && !endDate && eventEnd >= startDate) ||
    (!startDate && endDate && eventStart <= endDate);

  return matchesType && matchesDateRange;
});

const resetDateFilters = () => {
  setStartDateFilter('');
  setEndDateFilter('');
};

  return (
    <div className="event-content">
      <h2 data-aos="fade-right">My Events</h2>
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
        onCancel={() => setConfirmDialog({ show: false, onConfirm: null })}
        message="Are you sure you want to delete this event?"
      />
      {!showCreateForm && (
        <>
          <div className="create-button-container" data-aos="fade-right">
            <button onClick={handleCreateClick} className="create-btn"><Plus size={16} />Create New Event</button>
          </div>
          <div className="event-filters" data-aos="fade-right">
            <select value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              {eventTypes.map(type => (
                <option key={type.event_type_id} value={type.type_name}>{type.type_name}</option>
              ))}
            </select>
            <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} />
            <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} />
            <FiRefreshCw
              size={20}
              className="refresh-icon"
              onClick={resetDateFilters}
              title="Reset Dates"
            />

          </div>
          <div className="event-container">
              <div className="event-list" data-aos="fade-up">
                {filteredEvents.length === 0 && <p>No events found.</p>}
                {filteredEvents.map(event => (
                  <React.Fragment key={event.event_id}>
                    <div className="event-card" onClick={() => handleViewClick(event)}>
                      <h3>{event.event_name}</h3>
                      <p>Type: {event.event_type?.type_name}</p>
                      <p>
                        {new Date(event.start_datetime).toLocaleString()} -{' '}
                        {new Date(event.end_datetime).toLocaleString()}
                      </p>
                      <p>Status: {event.status}</p>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(event.event_id);
                        }}
                      >
                        <FiTrash size={18} color="#714897" />
                      </button>
                    </div>

                    {viewingEvent?.event_id === event.event_id && (
                      <div className={`event-detail ${closing ? 'closing' : 'visible'}`}
                             data-aos={!closing ? "fade-down" : undefined}
                      >
                        <h3>{viewingEvent.event_name}</h3>
                        <div className="event-info-grid">
                          <p><strong>Type:</strong> {viewingEvent.event_type?.type_name}</p>
                          <p><strong>Description:</strong> {viewingEvent.event_description || 'N/A'}</p>
                          <p><strong>Start:</strong> {new Date(viewingEvent.start_datetime).toLocaleString()}</p>
                          <p><strong>End:</strong> {new Date(viewingEvent.end_datetime).toLocaleString()}</p>
                          <p><strong>Location:</strong> {viewingEvent.location}</p>
                          <p><strong>Venue Name:</strong> {viewingEvent.venue_name || 'N/A'}</p>
                          <p><strong>Address:</strong> {viewingEvent.address || 'N/A'}</p>
                          <p><strong>City:</strong> {viewingEvent.city || 'N/A'}</p>
                          <p><strong>State:</strong> {viewingEvent.state || 'N/A'}</p>
                          <p><strong>Country:</strong> {viewingEvent.country || 'N/A'}</p>
                          <p><strong>Postal Code:</strong> {viewingEvent.postal_code || 'N/A'}</p>
                          <p><strong>Budget:</strong> {viewingEvent.budget || 'N/A'}</p>
                          <p><strong>Theme:</strong> {viewingEvent.theme || 'N/A'}</p>
                          <p><strong>Notes:</strong> {viewingEvent.notes || 'N/A'}</p>
                          <p><strong>Status:</strong> {viewingEvent.status}</p>
                        </div>
                        <div className="button-group">
                          <button onClick={() => {
                            handleEditClick(viewingEvent);
                            setViewingEvent(null);
                          }}>Edit</button>
                          <button onClick={handleClose}>Close</button>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
          </div>
        </>
      )}


      {showCreateForm && (
        <form onSubmit={handleSubmit} className="event-form" data-aos="fade-up" noValidate>
          <h3>{editingEventId ? 'Edit Event' : 'Create New Event'}</h3>

          {formError?.api && <p className="error">{formError.api}</p>}

          <div>
            <label>Event Name*</label>
            <input
              type='text'
              name="event_name"
              placeholder="Event Name"
              value={formData.event_name}
              onChange={handleChange}
              required
            />
            {formError?.event_name && <small className="error">{formError.event_name}</small>}
          </div>

          <div>
            <label>Start Date & Time*</label>
            <input
              type="datetime-local"
              name="start_datetime"
              value={formData.start_datetime}
              onChange={handleChange}
              required
            />
            {formError?.start_datetime && <small className="error">{formError.start_datetime}</small>}
          </div>

          <div>
            <label>End Date & Time*</label>
            <input
              type="datetime-local"
              name="end_datetime"
              value={formData.end_datetime}
              onChange={handleChange}
              required
            />
            {formError?.end_datetime && <small className="error">{formError.end_datetime}</small>}
          </div>

          <div>
            <label>Location*</label>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              required
            />
            {formError?.location && <small className="error">{formError.location}</small>}
          </div>

          <div>
            <label>Event Type*</label>
            <select
              name="event_type_id"
              value={formData.event_type_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              {eventTypes.map(type => (
                <option key={type.event_type_id} value={type.event_type_id}>{type.type_name}</option>
              ))}
            </select>
            {formError?.event_type_id && <small className="error">{formError.event_type_id}</small>}
          </div>

          {editingEventId && (
            <div className="update-inputs-grid">
              <div>
                <label>Event Description</label>
                <textarea
                  name="event_description"
                  placeholder="Event Description"
                  value={formData.event_description}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Venue Name</label>
                <input
                  name="venue_name"
                  placeholder="Venue Name"
                  value={formData.venue_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Address</label>
                <input
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>City</label>
                <input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>State</label>
                <input
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Country</label>
                <input
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Postal Code</label>
                <input
                  name="postal_code"
                  placeholder="Postal Code"
                  value={formData.postal_code}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Budget</label>
                <input
                  name="budget"
                  placeholder="Budget"
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Theme</label>
                <input
                  name="theme"
                  placeholder="Theme"
                  value={formData.theme}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Notes</label>
                <textarea
                  name="notes"
                  placeholder="Notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Status*</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="draft">Draft</option>
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {formError?.status && <small className="error">{formError.status}</small>}
              </div>
            </div>

          )}
          <div className="button-row">
            <button type="submit" className='create-update-button'>{editingEventId ? 'Update Event' : 'Create Event'}</button>
            <button type="button" className='cancel-button'onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EventContent;