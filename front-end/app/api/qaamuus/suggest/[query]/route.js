import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { query } = await params;
  const API_URL = process.env.API_URL;
  const API_KEY = process.env.API_KEY;

  try {
    const response = await fetch(`${API_URL}/qaamuus/suggest/${query}`, {
      headers: {
        "x-api-key": API_KEY,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Backend API error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal proxy error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
