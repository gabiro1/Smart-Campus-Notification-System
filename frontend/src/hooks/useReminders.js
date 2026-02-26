import { useState, useCallback } from 'react';
import reminderService from '../services/reminderService';

export const useReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getReminders = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reminderService.getReminders(page, limit);
      setReminders(data.reminders);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReminder = useCallback(async (reminderData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reminderService.createReminder(reminderData);
      setReminders([data, ...reminders]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [reminders]);

  const updateReminder = useCallback(async (reminderId, reminderData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await reminderService.updateReminder(reminderId, reminderData);
      setReminders(reminders.map((r) => (r._id === reminderId ? updated : r)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [reminders]);

  const deleteReminder = useCallback(async (reminderId) => {
    setLoading(true);
    setError(null);
    try {
      await reminderService.deleteReminder(reminderId);
      setReminders(reminders.filter((r) => r._id !== reminderId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [reminders]);

  const completeReminder = useCallback(async (reminderId) => {
    try {
      const updated = await reminderService.completeReminder(reminderId);
      setReminders(reminders.map((r) => (r._id === reminderId ? { ...r, completed: true } : r)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [reminders]);

  const uncompleteReminder = useCallback(async (reminderId) => {
    try {
      const updated = await reminderService.uncompleteReminder(reminderId);
      setReminders(reminders.map((r) => (r._id === reminderId ? { ...r, completed: false } : r)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [reminders]);

  return {
    reminders,
    loading,
    error,
    getReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    completeReminder,
    uncompleteReminder,
  };
};
