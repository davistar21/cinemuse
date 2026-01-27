"use client";

/**
 * Auth Layout
 *
 * Centered layout for login/register pages with ambient background.
 */

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { FloatingNodes } from "@/components/floating-nodes";
import { CursorLight } from "@/components/cursor-light";
import { useTheme } from "@/lib/theme";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { currentPalette } = useTheme();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0">
        <FloatingNodes nodeCount={30} connectionDistance={120} />
      </div>
      <CursorLight size={400} opacity={0.12} />

      {/* Logo */}
      <motion.div
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <a href="/" className="flex items-center gap-2">
          <span
            className="text-xl font-bold"
            style={{ color: currentPalette["--color-primary"] }}
          >
            CineMuse
          </span>
        </a>
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div>{children}</div>
      </motion.div>
    </div>
  );
}
