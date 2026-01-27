"use client";

/**
 * Home Page
 *
 * Landing page with hero search and featured content.
 */

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { MemorySearch } from "@/components/memory-search";
import { useTheme } from "@/lib/theme";

export default function HomePage() {
  const { currentPalette } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{
            backgroundColor: `${currentPalette["--color-primary"]}20`,
            border: `1px solid ${currentPalette["--color-primary"]}40`,
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles
            className="h-4 w-4"
            style={{ color: currentPalette["--color-primary"] }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: currentPalette["--color-primary"] }}
          >
            AI-Powered Discovery
          </span>
        </motion.div>

        <h1
          className="text-4xl md:text-6xl font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Find media through{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${currentPalette["--color-primary"]}, ${currentPalette["--color-secondary"]})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            memories
          </span>
        </h1>

        <p
          className="text-lg md:text-xl max-w-2xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Describe how it made you feel, a scene you remember, or the vibe you
          are looking for.
        </p>
      </motion.div>

      {/* Search Card */}
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <GlassCard className="p-6 md:p-8">
          <MemorySearch />
        </GlassCard>
      </motion.div>

      {/* Quick Prompts */}
      <motion.div
        className="mt-8 flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[
          "A thriller that kept me guessing until the end",
          "Cozy fantasy adventure with found family",
          "Sci-fi with philosophical themes",
          "Dark romance with morally grey characters",
        ].map((prompt, i) => (
          <motion.button
            key={prompt}
            className="px-4 py-2 rounded-full text-sm transition-colors"
            style={{
              backgroundColor: "var(--bg-card)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
            whileHover={{
              backgroundColor: "var(--bg-surface)",
              color: currentPalette["--color-primary"],
              borderColor: currentPalette["--color-primary"],
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            {prompt}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
