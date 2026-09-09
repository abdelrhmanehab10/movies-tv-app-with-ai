import { describe, expect, it } from "vitest";

import {
  tmdbDetailParamsSchema,
  tmdbMoviesParamsSchema,
  tmdbSearchParamsSchema,
} from "./tmdb-params";

describe("TMDB route parameters", () => {
  it("accepts supported search parameters and defaults to the first page", () => {
    expect(
      tmdbSearchParamsSchema.parse({ type: "movie", query: "Alien" })
    ).toEqual({ type: "movie", query: "Alien", page: 1 });
  });

  it("rejects unsupported search types, blank queries, and invalid pages", () => {
    expect(
      tmdbSearchParamsSchema.safeParse({ type: "person", query: "Alien" })
        .success
    ).toBe(false);
    expect(
      tmdbSearchParamsSchema.safeParse({ type: "movie", query: "   " })
        .success
    ).toBe(false);
    expect(
      tmdbSearchParamsSchema.safeParse({
        type: "movie",
        query: "Alien",
        page: "0",
      }).success
    ).toBe(false);
  });

  it("accepts numeric detail IDs and rejects path-like IDs", () => {
    expect(tmdbDetailParamsSchema.parse({ type: "tv", id: "1399" })).toEqual(
      { type: "tv", id: 1399 }
    );
    expect(
      tmdbDetailParamsSchema.safeParse({ type: "movie", id: "1/credits" })
        .success
    ).toBe(false);
  });

  it("allows only the movie lists used by the UI", () => {
    expect(
      tmdbMoviesParamsSchema.parse({ status: "now_playing", page: "2" })
    ).toEqual({ status: "now_playing", page: 2 });
    expect(
      tmdbMoviesParamsSchema.safeParse({ status: "changes" }).success
    ).toBe(false);
  });
});
