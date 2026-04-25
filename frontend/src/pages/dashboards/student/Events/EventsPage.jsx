import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EventFeedGrid from "./EventFeedGrid";
import apiClient from "../../../../services/apiClient";
import toast from "react-hot-toast";
import eventService from "../../../../services/eventService";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(storedUser);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchEvents(1);
  }, [filter]);

  const fetchEvents = async (pageNum) => {
    try {
      if (pageNum === 1) setLoading(true);
      const response = await eventService.getFeed();
      const loadedEvents = Array.isArray(response) ? response : (response.events || []);
      console.log('[EventsPage] Loaded events:', loadedEvents.length);
      setEvents(loadedEvents);
      setHasMore(loadedEvents.length === 20);
    } catch (error) {
      console.error('[EventsPage] Error:', error);
      toast.error(error.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (event, star) => {
    try {
      const response = await apiClient.post(`/events/${event._id}/rate`, { rating: star });
      const data = response.data;
      console.log("Rating response:", data);
      
      if (data.ratings) {
        setEvents(prev => prev.map(e => 
          e._id === event._id ? { ...e, ratings: data.ratings, avgRating: data.avgRating, ratingCount: data.ratingCount } : e
        ));
      }
      toast.success(data.message || "Rating submitted!");
    } catch (err) {
      console.error("Rating error:", err);
      toast.error(err.response?.data?.message || "Rating failed");
    }
  };

  const filteredEvents = useMemo(() => {
    let result = events;
    if (searchQ.trim()) {
      const query = searchQ.toLowerCase();
      result = result.filter(e => 
        e.title?.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.tags?.some(t => t.toLowerCase().includes(query))
      );
    }
    switch (filter) {
      case "top":
        const sorted = [...result].sort((a, b) => b.aiMatchScore - a.aiMatchScore);
        const topThreshold = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.6)]?.aiMatchScore || 0 : 0;
        return sorted.filter(e => e.aiMatchScore >= topThreshold);
      case "interested":
        if (!user?.interests?.length) return result;
        return result.filter(e => 
          e.tags?.some(tag => user.interests.includes(tag)) ||
          e.aiMatchScore > 60
        );
      default:
        return result;
    }
  }, [events, filter, searchQ, user]);

const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage);
  };

  const handleDetails = (event) => {
    navigate(`/student/events/${event._id}`);
  };

  return (
    <EventFeedGrid
      events={filteredEvents}
      loading={loading}
      onRate={handleRate}
      onDetails={handleDetails}
      onLoadMore={hasMore ? handleLoadMore : null}
      searchQ={searchQ}
      setSearchQ={setSearchQ}
      eventFilter={filter}
      setEventFilter={setFilter}
    />
  );
}
