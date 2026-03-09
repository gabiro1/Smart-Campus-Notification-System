import { useState, useCallback } from 'react';
import eventService from '../services/eventService';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  /* =========================================================
     GET EVENTS WITH PAGINATION
  ========================================================== */
  const getEvents = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getEvents(page, limit);

      setEvents(data.events || []);
      setPagination({
        page: data.pagination?.currentPage || page,
        limit,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     SEARCH EVENTS
  ========================================================== */
  const searchEvents = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.searchEvents(query);
      setEvents(data.events || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error searching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     GET SINGLE EVENT DETAILS
  ========================================================== */
  const getEventDetails = useCallback(async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getEventDetails(eventId);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     CREATE EVENT
  ========================================================== */
  const createEvent = useCallback(async (eventData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.createEvent(eventData);
      setEvents(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     UPDATE EVENT
  ========================================================== */
  const updateEvent = useCallback(async (eventId, eventData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await eventService.updateEvent(eventId, eventData);
      setEvents(prev => prev.map(e => (e._id === eventId ? updated : e)));
      return updated;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     DELETE EVENT
  ========================================================== */
  const deleteEvent = useCallback(async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      await eventService.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e._id !== eventId));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     RATE EVENT
  ========================================================== */
  const rateEvent = useCallback(async (eventId, rating) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.rateEvent(eventId, rating);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     MARK INTERESTED / RSVP
  ========================================================== */
  const markInterested = useCallback(async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.markInterested(eventId);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    events,
    loading,
    error,
    pagination,
    getEvents,
    searchEvents,
    getEventDetails,
    createEvent,
    updateEvent,
    deleteEvent,
    rateEvent,
    markInterested,
  };
};