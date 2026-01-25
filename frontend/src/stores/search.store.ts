import { create } from "zustand";

// Placeholder types until we have the full shared types
interface MediaItem {
  id: string;
  title: string;
  type: "MOVIE" | "SHOW" | "BOOK" | "GAME";
  posterUrl?: string;
  releaseYear?: number;
}

interface SearchState {
  query: string;
  results: MediaItem[];
  isSearching: boolean;
  filters: {
    type: "MOVIE" | "SHOW" | "BOOK" | "GAME" | null;
    year: number | null;
    mood: string | null;
  };

  setQuery: (query: string) => void;
  setResults: (results: MediaItem[]) => void;
  setSearching: (isSearching: boolean) => void;
  setFilter: (key: keyof SearchState["filters"], value: any) => void;
  clearFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  results: [],
  isSearching: false,
  filters: {
    type: null,
    year: null,
    mood: null,
  },

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setSearching: (isSearching) => set({ isSearching }),
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  clearFilters: () =>
    set({
      filters: { type: null, year: null, mood: null },
    }),
}));
