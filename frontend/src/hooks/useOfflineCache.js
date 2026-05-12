import { useState, useEffect } from "react";

export default function useOfflineCache() {
  const [timetable, setTimetable] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const baseUrl =
          (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
          "http://localhost:8000/api";

        const [timetableRes, deadlinesRes] = await Promise.all([
          fetch(`${baseUrl}/timetable`),
          fetch(`${baseUrl}/deadlines`),
        ]);

        if (!timetableRes.ok || !deadlinesRes.ok) throw new Error("Fetch failed");

        const timetableData = await timetableRes.json();
        const deadlinesData = await deadlinesRes.json();

        if (cancelled) return;

        const timetableItems = timetableData?.data || timetableData || [];
        const deadlineItems = deadlinesData?.data || deadlinesData || [];

        setTimetable(timetableItems);
        setDeadlines(deadlineItems);
        setIsOffline(false);

        try {
          localStorage.setItem("uninotify_timetable", JSON.stringify(timetableItems));
          localStorage.setItem("uninotify_deadlines", JSON.stringify(deadlineItems));
        } catch (e) {
          console.warn("Failed to cache data to localStorage", e);
        }
      } catch {
        if (cancelled) return;
        setIsOffline(true);

        try {
          const cachedTimetable = localStorage.getItem("uninotify_timetable");
          const cachedDeadlines = localStorage.getItem("uninotify_deadlines");

          if (cachedTimetable) setTimetable(JSON.parse(cachedTimetable));
          if (cachedDeadlines) setDeadlines(JSON.parse(cachedDeadlines));
        } catch (e) {
          console.warn("Failed to read from localStorage", e);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { timetable, deadlines, isOffline };
}
