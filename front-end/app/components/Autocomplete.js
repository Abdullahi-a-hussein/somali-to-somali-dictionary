import { useState, useEffect, useCallback } from "react";

// Use an environment variable for the API URL.
// In Next.js, variables must start with NEXT_PUBLIC_ to be available in the browser.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Autocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isListboxOpen, setIsListboxOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  useEffect(() => {
    // Don't fetch if the query is empty or if it matches the currently selected word
    if (!query || (selectedWord && query === selectedWord[0])) {
      setSuggestions([]);
      setIsListboxOpen(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/suggest/${query}`, { signal });
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setSuggestions(data);
        setIsListboxOpen(data.length > 0);
        setHighlight(-1);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Suggestion fetch failed:", err);
        }
      }
    }, 250);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query, selectedWord]);

  const handleSelect = useCallback((wordData) => {
    // wordData is now an array: [headword, definition]
    setQuery(wordData[0]);
    setSelectedWord(wordData);
    setSuggestions([]);
    setIsListboxOpen(false);
  }, []);

  const handleKeyDown = (e) => {
    if (!isListboxOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length
      );
    } else if (e.key === "Enter" && highlight >= 0) {
      handleSelect(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setIsListboxOpen(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto font-sans">
      <div className="relative">
        <input
          type="text"
          className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-lg shadow-sm"
          placeholder="Raadi erey..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isListboxOpen}
          aria-controls="suggestions-listbox"
          aria-activedescendant={
            highlight >= 0 ? `suggestion-${highlight}` : undefined
          }
        />
        {isListboxOpen && (
          <ul
            className="absolute z-10 w-full border mt-1 rounded-md bg-white shadow-lg"
            role="listbox"
            id="suggestions-listbox"
          >
            {suggestions.map((wordData, i) => (
              <li
                key={i}
                id={`suggestion-${i}`}
                role="option"
                aria-selected={i === highlight}
                className={`p-3 cursor-pointer text-gray-900 hover:bg-blue-500 hover:text-white ${
                  i === highlight ? "bg-blue-600 text-white" : ""
                }`}
                onMouseDown={() => handleSelect(wordData)}
              >
                {wordData[0]}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 p-6 border rounded-lg bg-white shadow-sm min-h-[150px]">
        {selectedWord ? (
          <div>
            <h2 className="font-bold text-2xl text-gray-800">
              {selectedWord[0]}
            </h2>
            <p className="text-gray-700 mt-2 text-lg">{selectedWord[1]}</p>
          </div>
        ) : (
          <p className="text-gray-400">
            Erayga aad raadisay halkan ayuu ku soo baxayaa.
          </p>
        )}
      </div>
    </div>
  );
}
