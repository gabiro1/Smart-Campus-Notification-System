/**
 * usePagination Hook
 * Advanced pagination handling with caching and state management
 */

import { useState, useCallback, useMemo } from 'react';
import { PAGINATION } from '../utils/constants.js';

export const usePagination = (items = [], pageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
  const [currentPage, setCurrentPage] = useState(PAGINATION.DEFAULT_PAGE);

  // Validate page size
  const validPageSize = Math.max(
    PAGINATION.MIN_PAGE_SIZE,
    Math.min(pageSize, PAGINATION.MAX_PAGE_SIZE)
  );

  // Calculate pagination values
  const paginationData = useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / validPageSize);
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

    const startIndex = (validCurrentPage - 1) * validPageSize;
    const endIndex = Math.min(startIndex + validPageSize, totalItems);

    const currentItems = items.slice(startIndex, endIndex);

    return {
      currentPage: validCurrentPage,
      pageSize: validPageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentItems,
      hasNextPage: validCurrentPage < totalPages,
      hasPreviousPage: validCurrentPage > 1,
      itemsInPage: currentItems.length,
    };
  }, [items, validPageSize, currentPage]);

  // Navigation handlers
  const goToPage = useCallback((page) => {
    const pageNum = Math.max(1, Math.min(page, paginationData.totalPages || 1));
    setCurrentPage(pageNum);
  }, [paginationData.totalPages]);

  const nextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [paginationData.hasNextPage]);

  const previousPage = useCallback(() => {
    if (paginationData.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [paginationData.hasPreviousPage]);

  const reset = useCallback(() => {
    setCurrentPage(PAGINATION.DEFAULT_PAGE);
  }, []);

  return {
    ...paginationData,
    goToPage,
    nextPage,
    previousPage,
    reset,
  };
};

/**
 * useServerPagination Hook
 * Server-side pagination with API integration
 */
export const useServerPagination = (
  fetchFunc,
  pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
  deps = []
) => {
  const [currentPage, setCurrentPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalPages = Math.ceil(totalItems / pageSize);

  // Fetch data
  const fetchData = useCallback(async (page) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunc(page, pageSize);
      setItems(result.items || []);
      setTotalItems(result.total || 0);
    } catch (err) {
      setError(err);
      console.error('Pagination fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunc, pageSize]);

  // Load page
  const loadPage = useCallback(
    (page) => {
      const validPage = Math.max(1, Math.min(page, totalPages || 1));
      setCurrentPage(validPage);
      fetchData(validPage);
    },
    [fetchData, totalPages]
  );

  // Navigation
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      loadPage(currentPage + 1);
    }
  }, [currentPage, totalPages, loadPage]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  }, [currentPage, loadPage]);

  const goToPage = useCallback((page) => {
    loadPage(page);
  }, [loadPage]);

  const reset = useCallback(() => {
    loadPage(PAGINATION.DEFAULT_PAGE);
  }, [loadPage]);

  // Initial load
  React.useEffect(() => {
    loadPage(PAGINATION.DEFAULT_PAGE);
  }, deps);

  return {
    items,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    loading,
    error,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    nextPage,
    previousPage,
    goToPage,
    reset,
    refresh: () => loadPage(currentPage),
  };
};

/**
 * useCursorPagination Hook
 * Cursor-based pagination for large datasets
 */
export const useCursorPagination = (fetchFunc, pageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchMore = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunc(cursor, pageSize);
      setItems((prev) => [...prev, ...(result.items || [])]);
      setCursor(result.nextCursor || null);
      setHasMore(!!result.nextCursor);
    } catch (err) {
      setError(err);
      console.error('Cursor pagination error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunc, cursor, pageSize, hasMore, loading]);

  const reset = useCallback(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    items,
    loading,
    error,
    hasMore,
    cursor,
    fetchMore,
    reset,
  };
};

/**
 * useLocalPagination Hook
 * Client-side pagination with search/filter
 */
export const useLocalPagination = (
  allItems = [],
  pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
  filter = null
) => {
  const [currentPage, setCurrentPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and search
  const filteredItems = useMemo(() => {
    let result = allItems;

    // Apply filter function if provided
    if (filter && typeof filter === 'function') {
      result = result.filter(filter);
    }

    // Apply search filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const searchable = JSON.stringify(item).toLowerCase();
        return searchable.includes(lowerTerm);
      });
    }

    return result;
  }, [allItems, filter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredItems.length);
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Handlers
  const goToPage = useCallback((page) => {
    const validPage = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const search = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(PAGINATION.DEFAULT_PAGE);
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(PAGINATION.DEFAULT_PAGE);
    setSearchTerm('');
  }, []);

  return {
    items: currentItems,
    allItems: filteredItems,
    currentPage,
    pageSize,
    totalItems: filteredItems.length,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    searchTerm,
    search,
    goToPage,
    nextPage,
    previousPage,
    reset,
  };
};

export default {
  usePagination,
  useServerPagination,
  useCursorPagination,
  useLocalPagination,
};
