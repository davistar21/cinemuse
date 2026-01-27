"use client";

/**
 * Media Hooks
 *
 * Custom hooks for fetching individual media items.
 */

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface MediaItem {
  id: string;
  title: string;
  type: "movie" | "show" | "book" | "game";
  description: string | null;
  posterUrl: string | null;
  year: number | null;
  rating: number | null;
  genres: string[];
  tags: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface MediaResponse {
  success: boolean;
  data: MediaItem;
}

export function useMedia(id: string | null) {
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async (mediaId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<MediaResponse>(`/api/media/${mediaId}`);

      if (response.success && response.data) {
        setMedia(response.data);
      } else {
        setMedia(null);
        setError("Media not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch media");
      setMedia(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchMedia(id);
    }
  }, [id, fetchMedia]);

  return {
    media,
    isLoading,
    error,
    refetch: () => id && fetchMedia(id),
  };
}
