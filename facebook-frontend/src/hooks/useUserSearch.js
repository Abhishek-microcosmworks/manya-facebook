import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../lib/api'; 

export function useUserSearch(query, accessToken) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache to prevent duplicate API calls for the same query
  const cache = useRef(new Map());

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setResults([]);
      return;
    }

    // Return cached results instantly if they exist
    if (cache.current.has(trimmedQuery)) {
      setResults(cache.current.get(trimmedQuery));
      return;
    }

    // AbortController to cancel previous requests (prevents race conditions)
    const abortController = new AbortController();

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // You will need to modify your apiRequest helper to accept an abort signal if it doesn't already
        const data = await apiRequest(`/search?q=${encodeURIComponent(trimmedQuery)}`, {
          method: 'GET',
          token: accessToken,
          signal: abortController.signal 
        });
        
        cache.current.set(trimmedQuery, data); // Save to cache
        setResults(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to fetch results');
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API call
    const debounceId = setTimeout(fetchResults, 350);

    return () => {
      clearTimeout(debounceId);
      abortController.abort(); // Cancel the fetch if user keeps typing
    };
  }, [query, accessToken]);

  return { results, isLoading, error, setResults };
}