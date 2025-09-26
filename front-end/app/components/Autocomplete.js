"use client";

import { useState, useCallback } from "react";
import { SuggestWord } from "../server-actions/server-action";
import { useDebouncedFetch } from "../hooks/useDebouncedFetch";
import { customSplit } from "../utils/utils";
import { findMarkers } from "../utils/utils";
import { markersWithNodefinition } from "../utils/utils";

export default function Autocomplete() {
  const [query, setQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState(null);
  const [highlight, setHighlight] = useState(-1);

  // ✅ Use custom hook for fetching suggestions
  const { data: suggestions, loading } = useDebouncedFetch(
    SuggestWord,
    query,
    250
  );

  // ✅ Show dropdown only if we have suggestions
  const isListboxOpen =
    suggestions.length > 0 && (!selectedWord || query !== selectedWord[0]);

  const handleSelect = useCallback((wordData) => {
    setQuery(wordData[0]);
    setSelectedWord(wordData);
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
    } else if (
      e.key == "Enter" &&
      highlight < 0 &&
      query == suggestions[0][0]
    ) {
      handleSelect(suggestions[0]);
    } else if (e.key === "Escape") {
      setHighlight(-1);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto font-sans">
      {/* 🔍 Input */}
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

        {/* Loader */}
        {loading && (
          <p className="absolute top-full mt-1 text-gray-400 text-sm italic">
            Fetching suggestions…
          </p>
        )}

        {/* Suggestions dropdown */}
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

      {/* 📖 Definition section */}
      <div className="mt-6 p-6 min-h-[150px]">
        {selectedWord && (
          <div>
            <h2 className="font-bold text-2xl text-gray-800">
              {selectedWord[0]}
            </h2>
            <div className="font-sans tracking-wider">
              {customSplit(selectedWord[0], selectedWord[1]).map(
                (word, idx, arr) => (
                  <div className="my-2" key={`${word}-${idx}`}>
                    <div className="text-gray-700 text-lg">
                      {
                        <div className="font-semibold text-gray-900 pr-3 min-w-[24px] mb-2">
                          {arr.length > 1 && <span>{idx + 1}.</span>}

                          {findMarkers(word).length > 1 && (
                            <div className="inline ml-5">
                              {markersWithNodefinition(word).map(
                                (entry, current_index, items) => (
                                  <span
                                    key={`${current_index}-${entry}`}
                                    className="font-small text-[12px] text-gray-500"
                                  >
                                    {entry}{" "}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      }
                      <p className="leading-relaxed text-[15px] break-words pl-3 tracking-wider font-medium">
                        {findMarkers(word)[findMarkers(word).length - 1]}
                      </p>
                    </div>
                    <hr className="h-2 min-w-[150px] text-gray-200 mt-1 ml-3 pl-3" />
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
