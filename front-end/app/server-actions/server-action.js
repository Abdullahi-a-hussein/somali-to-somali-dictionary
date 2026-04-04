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

export async function getSelected(query, signal) {
  try {
    const link = `/api/qaamuus/clean/find/${query}`;
    const response = await fetch(link, {
      signal,
    });
    if (!response.ok) {
      throw new Error("Server response is not okay!");
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Word fetch failed:", error);
    }
    return [];
  }
}

export async function getPrefixes(query, signal) {
  try {
    const link = `/api/qaamuus/clean/suggest/${query}`;
    const response = await fetch(link, {
      signal,
    });
    if (!response.ok) {
      throw new Error("Server response is not okay!");
    }
    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Prefix fetch failed: ", error);
    }
    return [];
  }
}

export async function health_check(signal = null) {
  const link = "/api/qaamuus/health";

  try {
    const response = await fetch(link, { signal });

    if (!response.ok) {
      throw new Error("Server health check failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Health check failed:", error);
    throw error; // ← IMPORTANT
  }
}
