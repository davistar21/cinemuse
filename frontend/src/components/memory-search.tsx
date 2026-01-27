"use client";

/**
 * Memory Search Component
 *
 * The main search input for describing memories/vibes.
 * Triggers search on button click.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Loader2, Film, Tv, BookOpen, Gamepad2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { useSearchStore } from "@/stores/search.store";

const mediaTypes = [
  { id: "all", label: "All", icon: null },
  { id: "movie", label: "Movies", icon: Film },
  { id: "show", label: "Shows", icon: Tv },
  { id: "book", label: "Books", icon: BookOpen },
  { id: "game", label: "Games", icon: Gamepad2 },
] as const;

export function MemorySearch() {
  const router = useRouter();
  const { currentPalette } = useTheme();
  const { setQuery, setFilter, filters, isSearching, setSearching } =
    useSearchStore();
  const mediaType = filters.type;
  const setMediaType = (type: string | null) => setFilter("type", type);

  const [localQuery, setLocalQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>(mediaType || "all");

  const handleSearch = async () => {
    if (!localQuery.trim()) return;

    setSearching(true);
    setQuery(localQuery);
    setMediaType(selectedType === "all" ? null : selectedType);

    // Navigate to search results
    const params = new URLSearchParams({ q: localQuery });
    if (selectedType !== "all") {
      params.set("type", selectedType);
    }

    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Media Type Selector */}
      <div className="flex flex-wrap gap-2">
        {mediaTypes.map((type) => {
          const isActive = selectedType === type.id;
          const Icon = type.icon;

          return (
            <motion.button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive
                  ? `${currentPalette["--color-primary"]}20`
                  : "transparent",
                color: isActive
                  ? currentPalette["--color-primary"]
                  : "var(--text-muted)",
                border: `1px solid ${
                  isActive ? currentPalette["--color-primary"] : "transparent"
                }`,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {type.label}
            </motion.button>
          );
        })}
      </div>

      {/* Search Input */}
      <Textarea
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe how it made you feel, a scene you remember, or the vibe you're looking for..."
        className="min-h-[120px] resize-none text-base"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
        }}
      />

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        disabled={!localQuery.trim() || isSearching}
        className="w-full p-4 rounded text-sm font-medium"
        style={{
          backgroundColor: currentPalette["--color-primary"],
          color: "white",
        }}
      >
        {isSearching ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Searching memories...
          </>
        ) : (
          <>
            <Search className="h-5 w-5 mr-2" />
            Find Media
          </>
        )}
      </Button>
    </div>
  );
}
