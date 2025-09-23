// hooks/useDebouncedFetch.js
import { useState, useEffect } from "react";

export function useDebouncedFetch(fetcher, query, delay = 300) {
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
