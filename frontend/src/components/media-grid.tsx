"use client";

/**
 * Media Grid Component
 *
 * Responsive grid layout for displaying media cards.
 */

import { motion } from "framer-motion";
import { MediaCard } from "./media-card";

interface MediaItem {
  id: string;
  title: string;
  type: "movie" | "show" | "book" | "game";
  posterUrl?: string | null;
  year?: number | null;
  rating?: number | null;
  matchScore?: number;
}

interface MediaGridProps {
  items: MediaItem[];
  loading?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function MediaGrid({ items, loading }: MediaGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] rounded-xl animate-pulse"
            style={{ backgroundColor: "var(--bg-card)" }}
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
        <p className="text-lg">No media found</p>
        <p className="text-sm mt-2">Try a different search term</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {items.map((item) => (
        <motion.div key={item.id} variants={itemVariants}>
          <MediaCard {...item} />
        </motion.div>
      ))}
    </motion.div>
  );
}
