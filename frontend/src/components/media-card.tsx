"use client";

/**
 * Media Card Component
 *
 * Displays a single media item with poster, title, type, and hover effects.
 */

import { motion } from "framer-motion";
import { Film, Tv, BookOpen, Gamepad2, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";

interface MediaCardProps {
  id: string;
  title: string;
  type: "movie" | "show" | "book" | "game";
  posterUrl?: string | null;
  year?: number | null;
  rating?: number | null;
  matchScore?: number;
}

const typeIcons = {
  movie: Film,
  show: Tv,
  book: BookOpen,
  game: Gamepad2,
};

const typeLabels = {
  movie: "Movie",
  show: "TV Show",
  book: "Book",
  game: "Game",
};

export function MediaCard({
  id,
  title,
  type,
  posterUrl,
  year,
  rating,
  matchScore,
}: MediaCardProps) {
  const router = useRouter();
  const { currentPalette } = useTheme();
  const Icon = typeIcons[type];

  return (
    <motion.article
      className="relative group cursor-pointer rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
      onClick={() => router.push(`/media/${id}`)}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative overflow-hidden">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-surface)" }}
          >
            <Icon
              className="h-12 w-12 opacity-30"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Match Score Badge */}
        {matchScore !== undefined && matchScore > 0 && (
          <div
            className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: currentPalette["--color-primary"],
              color: "white",
            }}
          >
            {Math.round(matchScore * 100)}% Match
          </div>
        )}

        {/* Type Badge */}
        <div
          className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "var(--text-secondary)",
          }}
        >
          <Icon className="h-3 w-3" />
          {typeLabels[type]}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3
          className="font-semibold text-sm line-clamp-2 mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h3>

        <div className="flex items-center justify-between text-xs">
          {year && <span style={{ color: "var(--text-muted)" }}>{year}</span>}
          {rating && (
            <div className="flex items-center gap-1">
              <Star
                className="h-3 w-3"
                style={{ color: currentPalette["--color-primary"] }}
              />
              <span style={{ color: "var(--text-secondary)" }}>
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          boxShadow: `inset 0 0 30px ${currentPalette["--color-glow"]}20`,
        }}
      />
    </motion.article>
  );
}
