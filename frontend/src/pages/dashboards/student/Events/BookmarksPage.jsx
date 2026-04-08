import React, { useState, useEffect } from "react";
import EventFeedGrid from "./EventFeedGrid";
import eventService from "../../../../services/eventService";
import toast from "react-hot-toast";

export default function BookmarksPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchBookmarks(1);
  }, []);

  const fetchBookmarks = async (pageNum) => {
    try {
      if (pageNum === 1) setLoading(true);
      const data = await eventService.getBookmarks(pageNum, 20);
      
      const loadedEvents = data.events || [];
      
      // Map all events to strictly be forced `initialBookmark: true` so the UI knows they are bookmarked
      const processedEvents = loadedEvents.map(e => ({...e, isBookmarked: true}));
      
      if (pageNum === 1) {
        setEvents(processedEvents);
      } else {
        setEvents(prev => [...prev, ...processedEvents]);
      }
      
      setHasMore(loadedEvents.length === 20);
    } catch (error) {
      toast.error(error.message || "Failed to load saved events");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBookmarks(nextPage);
  };

  return (
    <div className="bookmarks-route-container">
      <div className="absolute top-10 left-20 md:left-72 z-10 hidden sm:block">
        <span className="bg-blue-600/20 border border-blue-500 text-blue-400 text-xs font-black uppercase px-3 py-1 rounded-md">Saved Events View</span>
      </div>
      <EventFeedGrid 
        events={events} 
        loading={loading} 
        onLoadMore={hasMore ? handleLoadMore : null} 
      />
    </div>
  );
}
