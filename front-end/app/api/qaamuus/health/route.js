import { NextResponse } from "next/server";

export async function GET() {
  const API_URL = process.env.API_URL;
  const API_KEY = process.env.API_KEY;
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
      },
      cache: "no-store",
    });

    return NextResponse.json(
      {
        ok: response.ok,
        status: response.status,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Warm-up route error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to wake backend",
      },
      { status: 500 },
    );
  }
}
