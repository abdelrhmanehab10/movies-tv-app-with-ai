import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  parsePersistedResults,
  RESULTS_STORAGE_KEY,
  useResults,
} from "./useResults";
import type { FilmType } from "@/types";

const result: FilmType = {
  id: 42,
  media_type: "movie",
  original_title: "A film",
  overview: "A short synopsis.",
  vote_average: 8.2,
} as FilmType;

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe("useResults persistence", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    vi.stubGlobal("window", { localStorage: storage });
    useResults.setState({ results: [] });
  });

  it("persists and restores the latest recommendation", () => {
    useResults.getState().onResults([result]);
    expect(JSON.parse(storage.getItem(RESULTS_STORAGE_KEY)!)).toEqual({
      version: 1,
      results: [result],
    });

    useResults.setState({ results: [] });
    useResults.getState().hydrateResults();

    expect(useResults.getState().results).toEqual([result]);
  });

  it("ignores malformed, invalid, and unsupported versions", () => {
    expect(parsePersistedResults("not json")).toEqual([]);
    expect(parsePersistedResults(JSON.stringify({ version: 2, results: [result] }))).toEqual([]);
    expect(
      parsePersistedResults(JSON.stringify({ version: 1, results: [{ id: "bad" }] }))
    ).toEqual([]);
  });

  it("clears the in-memory and persisted recommendation", () => {
    useResults.getState().onResults([result]);

    useResults.getState().resetResults();

    expect(useResults.getState().results).toEqual([]);
    expect(storage.getItem(RESULTS_STORAGE_KEY)).toBeNull();
  });
});
