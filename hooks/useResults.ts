import { FilmType } from "@/types";
import { create } from "zustand";

export const RESULTS_STORAGE_KEY = "cinemotion:recommendation:v1";
const RESULTS_STORAGE_VERSION = 1;

type PersistedResults = {
  version: typeof RESULTS_STORAGE_VERSION;
  results: FilmType[];
};

interface ResultsStore {
  results: FilmType[];
  onResults: (results: FilmType[]) => void;
  hydrateResults: () => void;
  resetResults: () => void;
}

const getStorage = (): Storage | undefined => {
  if (typeof window === "undefined") return undefined;

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

const isFilm = (value: unknown): value is FilmType => {
  if (!value || typeof value !== "object") return false;

  const film = value as Partial<FilmType>;
  return (
    typeof film.id === "number" &&
    (film.media_type === "movie" || film.media_type === "tv") &&
    typeof film.vote_average === "number" &&
    typeof film.overview === "string" &&
    (typeof film.original_title === "string" || typeof film.name === "string")
  );
};

export const parsePersistedResults = (value: string | null): FilmType[] => {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);

    if (!parsed || typeof parsed !== "object") return [];

    const persisted = parsed as Partial<PersistedResults>;
    return persisted.version === RESULTS_STORAGE_VERSION &&
      Array.isArray(persisted.results) &&
      persisted.results.every(isFilm)
      ? persisted.results
      : [];
  } catch {
    return [];
  }
};

const persistResults = (results: FilmType[], storage = getStorage()) => {
  if (!storage) return;

  try {
    const value: PersistedResults = {
      version: RESULTS_STORAGE_VERSION,
      results,
    };
    storage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage can be unavailable or full; the in-memory store still works.
  }
};

const clearPersistedResults = (storage = getStorage()) => {
  if (!storage) return;

  try {
    storage.removeItem(RESULTS_STORAGE_KEY);
  } catch {
    // Storage can be unavailable; clearing the in-memory store still works.
  }
};

export const useResults = create<ResultsStore>((set) => ({
  results: [],
  onResults: (results) => {
    set({ results });
    persistResults(results);
  },
  hydrateResults: () => {
    const storage = getStorage();
    if (!storage) return;

    try {
      set({ results: parsePersistedResults(storage.getItem(RESULTS_STORAGE_KEY)) });
    } catch {
      set({ results: [] });
    }
  },
  resetResults: () => {
    set({ results: [] });
    clearPersistedResults();
  },
}));
