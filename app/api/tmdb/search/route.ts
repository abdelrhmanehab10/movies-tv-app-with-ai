import { NextRequest } from "next/server";

import { tmdbSearchParamsSchema } from "@/lib/tmdb-params";
import { fetchTmdb } from "@/lib/tmdb";
import { invalidParamsResponse, tmdbResponse } from "../response";

export async function GET(request: NextRequest) {
  const parsed = tmdbSearchParamsSchema.safeParse({
    type: request.nextUrl.searchParams.get("type"),
    query: request.nextUrl.searchParams.get("query"),
    page: request.nextUrl.searchParams.get("page") ?? undefined,
  });

  if (!parsed.success) return invalidParamsResponse();

  const { type, query, page } = parsed.data;
  return tmdbResponse(() =>
    fetchTmdb(`search/${type}`, {
      query,
      page,
      include_adult: false,
      language: "en-US",
    })
  );
}
