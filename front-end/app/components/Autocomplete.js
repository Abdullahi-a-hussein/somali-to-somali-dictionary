"use client";
import React, { useState, useEffect, useCallback } from "react";

export default function Autocomplete({ apiUrl }) {
  const [query, setQuery] = useState("");
  // suggestions will be an array of arrays: [[headword, definition], ...]
  const [suggestions, setSuggestions] = useState([]);
  // A single state to hold the fully selected word and its definition
  const [selectedWord, setSelectedWord] = useState(null);
  const [highlight, setHighlight] = useState(-1);
  const [isListboxOpen, setIsListboxOpen] = useState(false);

  // Fetches suggestions from the API as the user types.
  useEffect(() => {
    // Prevent fetching suggestions if the query already matches the selected word.
    if (
      selectedWord &&
      query.trim().toLowerCase() === selectedWord.headword.toLowerCase()
    ) {
      setIsListboxOpen(false);
      return;
    }

    if (!query.trim()) {
      setSuggestions([]);
      setIsListboxOpen(false);
      return;
    }
    const controller = new AbortController();
    const { signal } = controller;

    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`${apiUrl}/suggest/${query}`, { signal });
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
    }, 250); // Debounce to prevent API calls on every keystroke

    return () => {
      clearTimeout(debounceTimer);
      controller.abort(); // Cancel the request if the component unmounts or query changes
    };
  }, [query, apiUrl, selectedWord]);

  // Sets the selected word and its definition when a user chooses from the list.
  const handleSelect = useCallback((suggestion) => {
    // suggestion is an array: [headword, definition]
    const [headword, definition] = suggestion;
    setQuery(headword); // Update input field to show the selected word
    setSelectedWord({ headword, definition });
    setSuggestions([]);
    setIsListboxOpen(false);
  }, []);

  // Handles keyboard navigation within the suggestions list.
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
      e.preventDefault();
      handleSelect(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setIsListboxOpen(false);
    }
  };

  return (
    // Main container is now vertically aligned, wider, and centered.
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-4">
      {/* Search input and suggestions dropdown */}
      <div className="relative">
        <input
          type="text"
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
            className="absolute z-10 w-full border mt-1 rounded bg-white shadow-lg"
            role="listbox"
            id="suggestions-listbox"
          >
            {suggestions.map((suggestion, i) => (
              <li
                key={i}
                id={`suggestion-${i}`}
                role="option"
                aria-selected={i === highlight}
                className={`p-2 cursor-pointer ${
                  i === highlight ? "bg-blue-600 text-white" : "text-gray-900"
                }`}
                // Use onMouseDown to prevent the input from losing focus before the click registers
                onMouseDown={() => handleSelect(suggestion)}
              >
                {suggestion[0]} {/* Display only the headword in the list */}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Definition display area */}
      <div className="p-4 border rounded bg-gray-50 shadow-sm min-h-[150px]">
        {selectedWord ? (
          <div>
            <h2 className="font-bold text-2xl text-gray-900">
              {selectedWord.headword}
            </h2>
            <p className="text-gray-700 mt-2">{selectedWord.definition}</p>
          </div>
        ) : (
          <p className="text-gray-400">Select a word to see its definition.</p>
        )}
      </div>
    </div>
  );
}
