import Autocomplete from "./components/Autocomplete";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-100">
      <div className="w-full md:max-w-md lg:max-w-[780px] mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Qaamuuska Soomaaliga
        </h1>
        <Autocomplete />
      </div>
    </main>
  );
}
