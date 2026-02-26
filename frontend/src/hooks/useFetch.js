import { useState, useEffect, useCallback } from 'react';

export const useFetch = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetchData();
  }, [...dependencies]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};
