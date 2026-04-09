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

export function useFindFetch(fetcher, query) {
  const [entries, setEntries] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!query) {
      setEntries([]);
      setFetching(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    async function runFetch() {
      setFetching(true);

      try {
        const response = await fetcher(query, signal);
        setEntries(response || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Fetch failed:", error);
          setEntries([]);
        }
      } finally {
        if (!signal.aborted) {
          setFetching(false);
        }
      }
    }

    runFetch();

    return () => {
      controller.abort();
    };
  }, [query, fetcher]);

  return { entries, fetching };
}
