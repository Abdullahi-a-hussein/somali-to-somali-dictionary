// utils/suggestWord.js
//server actions
export async function SuggestWord(query, signal) {
  const API_URL = process.env.API_URL;
  console.log(API_URL);
  const headers = {
    "x-api-key": process.env.API_KEY,
  };
  try {
    const response = await fetch(`${API_URL}/qaamuus/suggest/${query}`, {
      headers,
      signal,
    });
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
