import { useState, useCallback } from "react";
import { api } from "../api/client";
import { MOCK_REMINDERS } from "../constants/mockData";

export function useReminders(token) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/reminders", {}, token);
      setReminders(data.reminders || data.data || data || MOCK_REMINDERS);
    } catch {
      setReminders(MOCK_REMINDERS);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createReminder = async (form) => {
    try {
      const data = await api(
        "/reminders",
        { method: "POST", body: JSON.stringify(form) },
        token
      );
      setReminders((p) => [data.reminder || data.data || { ...form, _id: Date.now().toString(), completed: false }, ...p]);
    } catch {
      setReminders((p) => [{ ...form, _id: Date.now().toString(), completed: false }, ...p]);
    }
  };

  const updateReminder = async (reminder) => {
    try {
      await api(
        `/reminders/${reminder._id}`,
        { method: "PUT", body: JSON.stringify(reminder) },
        token
      );
    } catch {}
    setReminders((p) => p.map((x) => (x._id === reminder._id ? reminder : x)));
  };

  const deleteReminder = async (id) => {
    try {
      await api(`/reminders/${id}`, { method: "DELETE" }, token);
    } catch {}
    setReminders((p) => p.filter((x) => x._id !== id));
  };

  const toggleComplete = async (r) => {
    const endpoint = r.completed
      ? `/reminders/${r._id}/uncomplete`
      : `/reminders/${r._id}/complete`;
    try {
      await api(endpoint, { method: "POST" }, token);
    } catch {}
    setReminders((p) =>
      p.map((x) => (x._id === r._id ? { ...x, completed: !x.completed } : x))
    );
  };

  const pendingCount = reminders.filter((r) => !r.completed).length;

  return {
    reminders,
    loading,
    pendingCount,
    fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleComplete,
  };
}