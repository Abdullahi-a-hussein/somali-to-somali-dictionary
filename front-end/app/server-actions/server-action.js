// utils/suggestWord.js
export async function SuggestWord(query, signal) {
  try {
    const response = await fetch(`/api/qaamuus/suggest/${query}`, {
      signal,
    });
    if (!response.ok) throw new Error("Server response is not okay!");
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Suggestion fetch failed:", error);
    }
    return [];
  }
}
