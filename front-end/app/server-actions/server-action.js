"use server";

export async function SuggestWord(query, signal) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const response = await fetch(`${API_URL}/suggest/${query}`, { signal });
  } catch (error) {
    console.log(error);
  }
}
