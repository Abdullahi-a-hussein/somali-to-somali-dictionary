"use client";
import App from "./components/App";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-[var(--background)] transition-all duration-300">
      <App />
    </main>
  );
}
