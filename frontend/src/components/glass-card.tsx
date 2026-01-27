"use client";

/**
 * Glass Card
 *
 * A floating glass-like container with subtle parallax on mouse move.
 * Used for search boxes, auth forms, and featured content.
 */

import { useRef, useEffect, useState, ReactNode } from "react";
import { useTheme } from "@/lib/theme";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  enableParallax?: boolean;
  glowColor?: string;
}

export function GlassCard({
  children,
  className = "",
  enableParallax = true,
  glowColor,
}: GlassCardProps) {
  const { currentPalette } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });

  const glow = glowColor || currentPalette["--color-glow"];

  useEffect(() => {
    if (!enableParallax) return;

    const handleMouseMove = (e: MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate rotation based on mouse position relative to card center
      const rotateY = ((e.clientX - centerX) / rect.width) * 4;
      const rotateX = -((e.clientY - centerY) / rect.height) * 4;

      setTransform({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
      setTransform({ rotateX: 0, rotateY: 0 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enableParallax]);

  return (
    <div
      ref={cardRef}
      className={`
        relative z-10
        bg-gradient-to-br from-white/[0.08] to-white/[0.02]
        backdrop-blur-xl
        border border-white/10
        rounded-2xl
        shadow-2xl
        transition-transform duration-200 ease-out
        ${className}
      `}
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        boxShadow: `
          0 25px 50px -12px rgba(0, 0, 0, 0.5),
          0 0 0 1px rgba(255, 255, 255, 0.05),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.1)
        `,
      }}
    >
      {/* Inner glow effect */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${glow}15 0%, transparent 50%)`,
        }}
      />
      {children}
    </div>
  );
}
