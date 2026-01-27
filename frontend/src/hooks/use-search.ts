"use client";

/**
 * Search Hooks
 *
 * Custom hooks for searching media via the API.
 */

import { useState, useCallback } from "react";
import { api } from "@/lib/api";

export interface SearchResult {
  id: string;
  title: string;
  type: "movie" | "show" | "book" | "game";
  posterUrl: string | null;
  year: number | null;
  rating: number | null;
  score: number;
  description: string | null;
}

interface SearchResponse {
  success: boolean;
  data: {
    results: SearchResult[];
    query: string;
    total: number;
  };
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const search = useCallback(
    async (query: string, mediaType?: string | null) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post<SearchResponse>("/search/memory", {
          query,
          type: mediaType || undefined,
        });

        if (response.success && response.data) {
          setResults(response.data.results);
          setTotal(response.data.total);
        } else {
          setResults([]);
          setTotal(0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setTotal(0);
  }, []);

  return {
    results,
    isLoading,
    error,
    total,
    search,
    clearResults,
  };
}
