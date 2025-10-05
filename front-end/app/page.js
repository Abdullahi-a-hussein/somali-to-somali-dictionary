import Autocomplete from "./components/Autocomplete";
import { DarkModeToggle } from "./components/DarkModeToggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-[var(--background">
      <div className="w-full md:max-w-md lg:max-w-[780px] mx-auto">
        <div className="flex justify-between mb-10">
          <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">
            Qaamuuska Soomaaliga
          </h1>
          <div className="">
            <DarkModeToggle />
          </div>
        </div>
        <Autocomplete />
      </div>
    </main>
  );
}
