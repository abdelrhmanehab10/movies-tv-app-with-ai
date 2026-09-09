import "server-only";

import axios from "axios";

import { getTmdbAuthConfig } from "@/lib/tmdb-auth";

const TMDB_API_URL = "https://api.themoviedb.org/3";

export class TmdbConfigError extends Error {
  constructor() {
    super("TMDB_API_KEY is not configured.");
    this.name = "TmdbConfigError";
  }
}

export async function fetchTmdb<T>(
  path: string,
  params: Record<string, string | number | boolean>
): Promise<T> {
  const credential = process.env.TMDB_API_KEY;

  if (!credential) {
    throw new TmdbConfigError();
  }

  const auth = getTmdbAuthConfig(credential);
  const response = await axios.get<T>(`${TMDB_API_URL}/${path}`, {
    ...auth,
    params: { ...params, ...auth.params },
  });

  return response.data;
}
