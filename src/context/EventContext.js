import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        };

        const [eventsRes, typesRes] = await Promise.all([
          axios.get('http://localhost:8000/api/events', { headers }),
          axios.get('http://localhost:8000/api/event-types', { headers }),
        ]);

        setEvents(eventsRes.data);
        setEventTypes(typesRes.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch events or event types.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setError('No token provided.');
      setLoading(false);
    }
  }, [token]);

  // Create new event
  const createEvent = async (eventData) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };
      const response = await axios.post('http://localhost:8000/api/events', eventData, { headers });
      setEvents((prev) => [...prev, response.data]);
      return { success: true, event: response.data };
    } catch (err) {
      console.error('Create event error:', err);
      return { success: false, error: err.response?.data?.message || 'Create event failed.' };
    }
  };
  // Delete event
    const deleteEvent = async (eventId) => {
    try {
        const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        };
        await axios.delete(`http://localhost:8000/api/events/${eventId}`, { headers });
        // Remove the deleted event from the state
        setEvents((prev) => prev.filter((ev) => ev.event_id !== eventId));
        return { success: true };
    } catch (err) {
        console.error('Delete event error:', err);
        return { success: false, error: err.response?.data?.message || 'Delete event failed.' };
    }
    };


  // Update existing event
  const updateEvent = async (eventId, eventData) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };
      const response = await axios.put(`http://localhost:8000/api/events/${eventId}`, eventData, { headers });
      setEvents((prev) =>
        prev.map((ev) => (ev.event_id === eventId ? response.data : ev))
      );
      return { success: true, event: response.data };
    } catch (err) {
      console.error('Update event error:', err);
      return { success: false, error: err.response?.data?.message || 'Update event failed.' };
    }
  };

  return (
    <EventContext.Provider
      value={{ events, eventTypes, loading, error, createEvent, updateEvent, deleteEvent }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);
