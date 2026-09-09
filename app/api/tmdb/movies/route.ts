import { NextRequest } from "next/server";

import { tmdbMoviesParamsSchema } from "@/lib/tmdb-params";
import { fetchTmdb } from "@/lib/tmdb";
import { invalidParamsResponse, tmdbResponse } from "../response";

export async function GET(request: NextRequest) {
  const parsed = tmdbMoviesParamsSchema.safeParse({
    status: request.nextUrl.searchParams.get("status"),
    page: request.nextUrl.searchParams.get("page") ?? undefined,
  });

  if (!parsed.success) return invalidParamsResponse();

  const { status, page } = parsed.data;
  return tmdbResponse(() => fetchTmdb(`movie/${status}`, { page }));
}
