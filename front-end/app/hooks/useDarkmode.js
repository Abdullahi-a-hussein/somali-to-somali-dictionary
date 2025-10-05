"use client";

import { useState, useEffect } from "react";

// Key for storing the preference in localStorage
const DARK_MODE_KEY = "darkModePreference";

export function useDarkMode() {
  // 1. Get initial state from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const storedPreference = localStorage.getItem(DARK_MODE_KEY);
    if (storedPreference !== null) {
      return storedPreference === "true";
    }

    // Fallback to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // 2. Effect to apply the class and save the preference
  useEffect(() => {
    const root = window.document.documentElement;

    // Apply or remove the 'dark' class
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Save the preference to localStorage
    localStorage.setItem(DARK_MODE_KEY, isDarkMode.toString());
  }, [isDarkMode]); // Re-run effect whenever isDarkMode changes

  // 3. Memoized handler for toggling the mode
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return [isDarkMode, toggleDarkMode];
}
