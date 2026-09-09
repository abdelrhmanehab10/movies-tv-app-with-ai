import { NextRequest } from "next/server";

import { tmdbDetailParamsSchema } from "@/lib/tmdb-params";
import { fetchTmdb } from "@/lib/tmdb";
import { invalidParamsResponse, tmdbResponse } from "../response";

export async function GET(request: NextRequest) {
  const parsed = tmdbDetailParamsSchema.safeParse({
    type: request.nextUrl.searchParams.get("type"),
    id: request.nextUrl.searchParams.get("id"),
  });

  if (!parsed.success) return invalidParamsResponse();

  const { type, id } = parsed.data;
  return tmdbResponse(() => fetchTmdb(`${type}/${id}`, {}));
}
