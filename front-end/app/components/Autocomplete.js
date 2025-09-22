"use client";

import { useState, useEffect, useCallback } from "react";
import { SuggestWord } from "../server-actions/server-action";

// Use an environment variable for the API URL.
// In Next.js, variables must start with NEXT_PUBLIC_ to be available in the browser.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Autocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isListboxOpen, setIsListboxOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  function customSplit(word, text) {
    // Step 1: Replace " 1. " with a space
    text = text.replace(/\s1\.\s/g, " ");

    // Step 2: Pattern for either "{number}. " (2–99) or "{word}: "
    // No leading space required before word:
    const pattern = new RegExp(`(?: [2-9]\\d?\\. |${word}: )`, "g");

    // Step 3: Split text on the pattern
    let parts = text.split(pattern);

    // Step 4: Clean up whitespace and empties
    let substrings = parts.map((p) => p.trim()).filter((p) => p.length > 0);

    return substrings;
  }

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
      const data = await SuggestWord(query, signal);
      setSuggestions(data);
      setIsListboxOpen(data.length > 0);
      setHighlight(-1);
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

      <div className="mt-6 p-6 min-h-[150px]">
        {selectedWord ? (
          <div>
            <h2 className="font-bold text-2xl text-gray-800">
              {selectedWord[0]}
            </h2>
            <div className="font-sans tracking-wider">
              {customSplit(selectedWord[0], selectedWord[1]).map(
                (word, idx) => (
                  <div className="mt-2 mb-2" key={idx}>
                    <div className="flex">
                      {customSplit(selectedWord[0], selectedWord[1]).length >
                        1 && (
                        <span className="w-6 shrink-0 font-semibold text-gray-800 ">
                          {idx + 1}
                        </span>
                      )}
                      <span className="flex-1 font-serif text-[16px] leading-8 text-gray-900">
                        {word}
                      </span>
                    </div>
                    <hr className="h-2 min-w-[150px] text-gray-300 mt-1 ml-3" />
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-300">Michuhu halkan ayuu kasoo bixi.</p>
        )}
      </div>
    </div>
  );
}
