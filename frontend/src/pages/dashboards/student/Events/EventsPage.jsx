import React, { useState, useEffect } from "react";
import EventFeedGrid from "./EventFeedGrid";
import apiClient from "../../../../services/apiClient";
import toast from "react-hot-toast";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchEvents(1);
  }, []);

  const fetchEvents = async (pageNum) => {
    try {
      if (pageNum === 1) setLoading(true);

      // Use the public /events endpoint — no status filter, returns all events
      const response = await apiClient.get('/events', {
        params: { page: pageNum, limit: 20 }
      });

      const data = response.data;
      const loadedEvents = Array.isArray(data) ? data : (data.events || []);

      console.log('[EventsPage] Loaded events:', loadedEvents.length, loadedEvents);

      if (pageNum === 1) {
        setEvents(loadedEvents);
      } else {
        setEvents(prev => [...prev, ...loadedEvents]);
      }

      setHasMore(loadedEvents.length === 20);
    } catch (error) {
      console.error('[EventsPage] Error:', error);
      toast.error(error.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage);
  };

  return (
    <EventFeedGrid 
      events={events} 
      loading={loading} 
      onLoadMore={hasMore ? handleLoadMore : null} 
    />
  );
}
