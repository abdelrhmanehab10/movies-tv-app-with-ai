import { FilmType } from "@/types";
import { create } from "zustand";

interface ResultsStore {
  results: FilmType[];
  onResults: (results: FilmType[]) => void;
}

export const useResults = create<ResultsStore>((set) => ({
  results: [],
  onResults: (results: FilmType[]) => set({ results }),
}));
