import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { query } = params;
  const API_URL = process.env.API_URL;
  const API_KEY = process.env.API_KEY;

  try {
    const response = await fetch(`${API_URL}/qaamuus/suggest/${query}`, {
      headers: {
        "x-api-key": API_KEY,
      },
      cache: "no-store",
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
