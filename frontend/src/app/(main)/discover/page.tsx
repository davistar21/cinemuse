"use client";

/**
 * Discover Page
 *
 * Browse media by categories, genres, and moods.
 */

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Film,
  Tv,
  BookOpen,
  Gamepad2,
  Heart,
  Skull,
  Sparkles,
  Rocket,
  Ghost,
} from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { useTheme } from "@/lib/theme";

const categories = [
  { id: "movie", label: "Movies", icon: Film, color: "#ef4444" },
  { id: "show", label: "TV Shows", icon: Tv, color: "#3b82f6" },
  { id: "book", label: "Books", icon: BookOpen, color: "#22c55e" },
  { id: "game", label: "Games", icon: Gamepad2, color: "#f59e0b" },
];

const moods = [
  {
    id: "romance",
    label: "Romantic",
    icon: Heart,
    query: "romantic love story",
  },
  {
    id: "thriller",
    label: "Thrilling",
    icon: Skull,
    query: "intense thriller suspense",
  },
  {
    id: "fantasy",
    label: "Magical",
    icon: Sparkles,
    query: "magical fantasy adventure",
  },
  {
    id: "scifi",
    label: "Futuristic",
    icon: Rocket,
    query: "sci-fi futuristic technology",
  },
  {
    id: "horror",
    label: "Scary",
    icon: Ghost,
    query: "scary horror terrifying",
  },
];

export default function DiscoverPage() {
  const router = useRouter();
  const { currentPalette } = useTheme();

  const handleCategoryClick = (type: string) => {
    router.push(`/search?type=${type}`);
  };

  const handleMoodClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Discover
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Explore media by category or mood
        </p>
      </motion.div>

      {/* Categories */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                <GlassCard
                  className="p-6 cursor-pointer group"
                  glowColor={cat.color}
                >
                  <motion.button
                    onClick={() => handleCategoryClick(cat.id)}
                    className="w-full flex flex-col items-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="p-4 rounded-2xl transition-colors"
                      style={{
                        backgroundColor: `${cat.color}20`,
                      }}
                    >
                      <Icon
                        className="h-8 w-8 transition-colors"
                        style={{ color: cat.color }}
                      />
                    </div>
                    <span
                      className="font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {cat.label}
                    </span>
                  </motion.button>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Moods */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Explore by Mood
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {moods.map((mood, i) => {
            const Icon = mood.icon;
            return (
              <motion.button
                key={mood.id}
                onClick={() => handleMoodClick(mood.query)}
                className="flex items-center gap-2 p-4 rounded-xl transition-all"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
                whileHover={{
                  backgroundColor: `${currentPalette["--color-primary"]}15`,
                  borderColor: currentPalette["--color-primary"],
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
              >
                <Icon
                  className="h-5 w-5"
                  style={{ color: currentPalette["--color-primary"] }}
                />
                <span
                  className="font-medium text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {mood.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
