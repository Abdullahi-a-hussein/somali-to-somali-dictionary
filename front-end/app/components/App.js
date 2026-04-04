"use-client";
import { useEffect } from "react";
import Autocomplete from "./Autocomplete";
import { DarkModeToggle } from "./DarkModeToggle";
import { health_check } from "../server-actions/server-action";

export default function App() {
  if (typeof window !== "undefined") {
    // Disable Chrome translation popup
    document.documentElement.setAttribute("translate", "no");

    // Attempt to remove existing translation banners injected by Google
    const observer = new MutationObserver(() => {
      const translateBar = document.querySelector(
        ".goog-te-banner-frame, .VIpgJd-ZVi9od-ORHb, .VIpgJd-ZVi9od-xl07Ob",
      );
      if (translateBar) translateBar.remove();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
  useEffect(() => {
    // run health check on API backend on load
    const warmup = () => {
      health_check().catch(() => {});
    };

    // then every 5 minutes
    const interval = setInterval(warmup, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="w-full max-w-[780px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-10 gap-4">
        <h1 className="text-3xl font-bold text-[var(--foreground)] text-center sm:text-left">
          Qaamuuska Soomaaliga
        </h1>
        {/* Dark Mode Toggle */}
        <div className="hidden sm:block">
          <DarkModeToggle />
        </div>
      </div>

      {/* Autocomplete Component */}
      <div className="w-full">
        <Autocomplete />
      </div>
    </div>
  );
}
