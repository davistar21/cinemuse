"use client";

/**
 * Search Results Page
 *
 * Displays search results with filtering options.
 * // Re-trigger HMR
 */

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { MediaGrid } from "@/components/media-grid";
import { MemorySearch } from "@/components/memory-search";
import { useSearch } from "@/hooks/use-search";
import { useTheme } from "@/lib/theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const mediaType = searchParams.get("type") || null;
  const { results, isLoading, error, total, search } = useSearch();
  const { currentPalette } = useTheme();

  useEffect(() => {
    if (query) {
      search(query, mediaType);
    }
  }, [query, mediaType, search]);

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard className="p-4 md:p-6">
          <MemorySearch />
        </GlassCard>
      </motion.div>

      {/* Results Header */}
      {query && (
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {isLoading ? "Searching..." : `${total} results`}
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              for &quot;{query}&quot;
              {mediaType && ` in ${mediaType}s`}
            </p>
          </div>

          {/* Sort/Filter (placeholder for future) */}
          <div className="flex items-center gap-2">
            <Select defaultValue="relevance">
              <SelectTrigger
                className="w-[140px]"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
              >
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="text-center py-8 rounded-xl"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
          }}
        >
          <p>{error}</p>
        </div>
      )}

      {/* Results Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <MediaGrid
          items={results.map((r) => ({
            id: r.id,
            title: r.title,
            type: r.type,
            posterUrl: r.posterUrl,
            year: r.year,
            rating: r.rating,
            matchScore: r.score,
          }))}
          loading={isLoading}
        />
      </motion.div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div
            className="animate-spin rounded-full h-8 w-8 border-2"
            style={{
              borderColor: "var(--color-primary)",
              borderTopColor: "transparent",
            }}
          />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
