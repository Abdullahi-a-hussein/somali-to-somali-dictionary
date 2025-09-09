import Autocomplete from "./components/Autocomplete";

export default function Home() {
  return (
    // ACCESSIBILITY: Use the <main> tag for the primary content of the page.
    // Also, declare the primary language of the page as Somali ("so").
    <main
      lang="so"
      className="min-h-screen p-4 bg-gray-100 flex flex-col items-center"
    >
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Qaamuuska Soomaaliga
        </h1>
        <Autocomplete />
      </div>
    </main>
  );
}
