import "server-only";

import axios from "axios";
import { NextResponse } from "next/server";

import { TmdbConfigError } from "@/lib/tmdb";

export function invalidParamsResponse() {
  return NextResponse.json(
    { error: "Invalid TMDB request parameters." },
    { status: 400 }
  );
}

export async function tmdbResponse<T>(request: () => Promise<T>) {
  try {
    return NextResponse.json(await request());
  } catch (error) {
    if (error instanceof TmdbConfigError) {
      console.error(error.message);
      return NextResponse.json(
        { error: "Movie data service is not configured." },
        { status: 503 }
      );
    }

    console.error("TMDB request failed", {
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });
    return NextResponse.json(
      { error: "Movie data is temporarily unavailable." },
      { status: 502 }
    );
  }
}
