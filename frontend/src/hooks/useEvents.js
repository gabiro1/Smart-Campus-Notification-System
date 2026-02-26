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
  });

  const getEvents = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getEvents(page, limit);
      setEvents(data.events);
      setPagination({ page, limit, total: data.total });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchEvents = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.searchEvents(query);
      setEvents(data.events);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getEventDetails = useCallback(async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getEventDetails(eventId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (eventData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.createEvent(eventData);
      setEvents([data, ...events]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [events]);

  const updateEvent = useCallback(async (eventId, eventData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await eventService.updateEvent(eventId, eventData);
      setEvents(events.map((e) => (e._id === eventId ? updated : e)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [events]);

  const deleteEvent = useCallback(async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      await eventService.deleteEvent(eventId);
      setEvents(events.filter((e) => e._id !== eventId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [events]);

  const rateEvent = useCallback(async (eventId, rating) => {
    try {
      const data = await eventService.rateEvent(eventId, rating);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const markInterested = useCallback(async (eventId) => {
    try {
      const data = await eventService.markInterested(eventId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
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
