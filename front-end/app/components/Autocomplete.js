"use client";

import { useState, useCallback } from "react";
import { getPrefixes, getSelected } from "../server-actions/server-action";
import {
  useDebouncedFindFetch,
  useDebouncedSuggestFetch,
} from "../hooks/useDebouncedFetch";
import Entry from "./Entry";

export default function Autocomplete() {
  const [query, setQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState(null);
  const [highlight, setHighlight] = useState(-1);

  // Debounced fetches for suggestions
  const { data: suggestions = [], loading } = useDebouncedSuggestFetch(
    getPrefixes,
    query,
    250,
  );

  const { entries } = useDebouncedFindFetch(getSelected, selectedWord, 50);

  const isListboxOpen =
    suggestions.length > 0 && (!selectedWord || query !== selectedWord);

  const handleSelect = useCallback((wordData) => {
    setQuery(wordData);
    setSelectedWord(wordData);
    setHighlight(-1);
  }, []);

  const handleKeyDown = (e) => {
    if (!isListboxOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === "Enter") {
      if (highlight >= 0) {
        handleSelect(suggestions[highlight]);
      } else if (query === suggestions[0]) {
        handleSelect(suggestions[0]);
      }
    } else if (e.key === "Escape") {
      setHighlight(-1);
    }
  };

  return (
    <div className="w-full max-w-[780px] mx-auto font-sans">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-[var(--foreground)] text-lg shadow-sm"
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

        {/* Loader */}
        {loading && (
          <p className="absolute top-full mt-4 text-[var(--tertiary-color)] text-sm italic">
            Fetching suggestions…
          </p>
        )}

        {/* Suggestions */}
        {isListboxOpen && (
          <ul
            className="absolute z-10 w-full  mt-4 p-4 tracking-wider rounded-md bg-[var(--background-second)] shadow-lg"
            role="listbox"
            id="suggestions-listbox"
          >
            {suggestions.map((wordData, i) => (
              <li
                key={i}
                id={`suggestion-${i}`}
                role="option"
                aria-selected={i === highlight}
                className={`ml-3 py-2 px-4 rounded-2xl cursor-pointer text-[var(--foreground)] hover:bg-blue-500 hover:text-[var(--foreground)] ${
                  i === highlight ? "bg-blue-500 text-[var(--foreground)]" : ""
                }`}
                onMouseDown={() => handleSelect(wordData)}
              >
                {wordData}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Definitions */}
      <div className="mt-6 p-6 min-h-[150px]">
        {selectedWord && (
          <div>
            {/* Main headword */}
            <h2 className="font-bold text-3xl text-[var(--foreground)]">
              {selectedWord}
            </h2>

            {/* Blocks: each block is one header (marker) + its definitions */}
            <div className="font-sans tracking-wider">
              {entries.map((entry, i) => (
                <Entry
                  key={`${entry.pos}-${entry.header}-${i}`}
                  entry={entry}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
