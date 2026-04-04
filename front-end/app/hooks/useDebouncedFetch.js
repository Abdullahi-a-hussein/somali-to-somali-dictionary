// hooks/useDebouncedFetch.js
import { useState, useEffect } from "react";

export function useDebouncedSuggestFetch(fetcher, query, delay = 300) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const result = await fetcher(query, signal);
        setData(result || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch failed:", err);
        }
        setData([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, delay, fetcher]);

  return { data, loading };
}

export function useDebouncedFindFetch(fetcher, query, delay = 300) {
  const [entries, setEntries] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!query) {
      setEntries([]);
      setFetching(false);
      return;
    }
    const controlller = new AbortController();
    const { signal } = controlller;
    setFetching(true);

    const timer = setTimeout(async () => {
      try {
        const response = await fetcher(query, signal);
        setEntries(response || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Fetch Failed: ", error);
        }
        setEntries([]);
      } finally {
        setFetching(false);
      }
    }, delay);
    return () => {
      clearTimeout(timer);
      controlller.abort;
    };
  }, [query, delay, fetcher]);
  return { entries, fetching };
}
