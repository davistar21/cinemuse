"use client";

/**
 * Cursor Light
 *
 * A soft radial glow that follows the mouse cursor.
 * Creates depth and atmosphere.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

interface CursorLightProps {
  /** Size of the glow in px */
  size?: number;
  /** Opacity of the glow (0-1) */
  opacity?: number;
}

export function CursorLight({ size = 400, opacity = 0.15 }: CursorLightProps) {
  const { currentPalette } = useTheme();
  const glowColor = currentPalette["--color-glow"] || "#a78bfa";

  const [position, setPosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-0"
      animate={{
        left: position.x - size / 2,
        top: position.y - size / 2,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        opacity,
        filter: "blur(40px)",
      }}
    />
  );
}
