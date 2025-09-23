// utils/suggestWord.js
export async function SuggestWord(query, signal) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const response = await fetch(`${API_URL}/suggest/${query}`, { signal });
    if (!response.ok) {
      throw new Error("Server response is not okay!");
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Suggestion fetch failed:", error);
    }
    return []; // ✅ Always return an array
  }
}
