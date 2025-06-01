import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEvents } from '../../context/EventContext';
import '../../css/EventContent.css';
import {FiTrash} from 'react-icons/fi';
const EventContent = () => {
  const { events, eventTypes, loading, error, createEvent, updateEvent,deleteEvent } = useEvents();

  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [formError, setFormError] = useState(null);

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
    if (window.confirm('Are you sure you want to delete this event?')) {
      const result = await deleteEvent(eventId);
      if (!result.success) {
        alert('Failed to delete event: ' + result.error);
      }
    }
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
      } else {
        const result = await createEvent(formData);
        if (!result.success) throw new Error(result.error);
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
    const eventDate = new Date(event.start_datetime);
    return matchesType && (!startDate || eventDate >= startDate) && (!endDate || eventDate <= endDate);
  });

  return (
    <div className="event-content">
      <h2 data-aos="fade-right">My Events</h2>
      <div className="create-button-container" data-aos="fade-right">
        <button onClick={handleCreateClick} className="create-btn">+ Create New Event</button>
      </div>
      {!showCreateForm && (
        <>
          <div className="event-filters" data-aos="fade-right">
            <select value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              {eventTypes.map(type => (
                <option key={type.event_type_id} value={type.type_name}>{type.type_name}</option>
              ))}
            </select>
            <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} />
            <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} />
          </div>

          <div className="event-list" data-aos="fade-up">
            {filteredEvents.length === 0 && <p>No events found.</p>}
            {filteredEvents.map(event => (
              <div key={event.event_id} className="event-card" onClick={() => handleEditClick(event)}>
                <h3>{event.event_name}</h3>
                <p>Type: {event.event_type?.type_name}</p>
                <p>{new Date(event.start_datetime).toLocaleString()} - {new Date(event.end_datetime).toLocaleString()}</p>
                <p>Status: {event.status}</p>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent triggering edit
                    handleDelete(event.event_id);
                  }}
                >
                  <FiTrash size={18} color="#714897" />
                </button>
              </div>
            ))}
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
            <>
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
            </>
          )}

          <button type="submit">{editingEventId ? 'Update Event' : 'Create Event'}</button>
          <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default EventContent;
