"use client";

import { useState, useCallback, useMemo } from "react";
import { SuggestWord } from "../server-actions/server-action";
import { useDebouncedFetch } from "../hooks/useDebouncedFetch";
import {
  customSplit,
  tokenizeDefinition,
  groupDefinitionsByHeader,
} from "../utils/utils";

function DefinitionBlock({ header, bodies }) {
  // Normalize definitions: split into multiple if separated by blank lines
  const normalizedBodies = bodies.flatMap((body) =>
    body
      .split(/\n{2,}/)
      .map((line) => line.trim())
      .filter(Boolean)
  );
  const useNumbers = normalizedBodies.length > 1;

  return (
    <div className="mb-4">
      {header && (
        <div className="font-semibold text-[var(--foreground)] mt-4 mb-4">
          {header}
        </div>
      )}

      <div className="space-y-3">
        {normalizedBodies.map((text, i) => (
          <div
            key={`${header ?? "nohdr"}-${i}`}
            className="flex items-start ml-4"
          >
            {useNumbers && (
              <span className="font-semibold text-[var(--foreground)] mr-2">
                {i + 1}.
              </span>
            )}
            <p className="leading-relaxed text-[14px] tracking-wider font-medium text-[var(--secondary-color)]">
              {text}
            </p>
          </div>
        ))}
      </div>

      <hr className="h-2 min-w-[150px] text-[var(--tertiary-color)] mt-3" />
    </div>
  );
}

export default function Autocomplete() {
  const [query, setQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState(null);
  const [highlight, setHighlight] = useState(-1);

  // Debounced fetch for suggestions
  const { data: suggestions = [], loading } = useDebouncedFetch(
    SuggestWord,
    query,
    250
  );

  const isListboxOpen =
    suggestions.length > 0 && (!selectedWord || query !== selectedWord[0]);

  const handleSelect = useCallback((wordData) => {
    setQuery(wordData[0]);
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
        (prev) => (prev - 1 + suggestions.length) % suggestions.length
      );
    } else if (e.key === "Enter") {
      if (highlight >= 0) {
        handleSelect(suggestions[highlight]);
      } else if (query === suggestions[0][0]) {
        handleSelect(suggestions[0]);
      }
    } else if (e.key === "Escape") {
      setHighlight(-1);
    }
  };

  // Build grouped & formatted definitions once per selected word
  const grouped = useMemo(() => {
    if (!selectedWord) return [];

    const [headword, rawDefinition] = selectedWord;
    const chunks = customSplit(headword, rawDefinition);

    // Tokenize each chunk to {header, body}
    const tokenized = chunks.map((chunk) =>
      tokenizeDefinition(headword, chunk)
    );

    // Group by header (null = no marker)
    return groupDefinitionsByHeader(tokenized);
  }, [selectedWord]);

  return (
    <div className="w-full max-w-full md:max-w-xl lg:max-w-[780px] mx-auto font-sans">
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
          <p className="absolute top-full mt-1 text-[var(--tertiary-color)] text-sm italic">
            Fetching suggestions…
          </p>
        )}

        {/* Suggestions */}
        {isListboxOpen && (
          <ul
            className="absolute z-10 w-full border mt-1 rounded-md bg-[var(--background)] shadow-lg"
            role="listbox"
            id="suggestions-listbox"
          >
            {suggestions.map((wordData, i) => (
              <li
                key={i}
                id={`suggestion-${i}`}
                role="option"
                aria-selected={i === highlight}
                className={`p-3 cursor-pointer text-[var(-foreground)] hover:bg-blue-500 hover:text-[var(--foreground)] ${
                  i === highlight ? "bg-blue-600 text-[var(-foreground)]" : ""
                }`}
                onMouseDown={() => handleSelect(wordData)}
              >
                {wordData[0]}
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
              {selectedWord[0]}
            </h2>

            {/* Blocks: each block is one header (marker) + its definitions */}
            <div className="font-sans tracking-wider">
              {grouped.map(({ header, bodies }, i) => (
                <DefinitionBlock
                  key={`block-${i}-${header ?? "nohdr"}`}
                  header={header}
                  bodies={bodies}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
