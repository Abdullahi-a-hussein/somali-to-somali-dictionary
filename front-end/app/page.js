import Autocomplete from "./components/Autocomplete";
import { DarkModeToggle } from "./components/DarkModeToggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-[var(--background)] transition-all duration-300">
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
    </main>
  );
}
