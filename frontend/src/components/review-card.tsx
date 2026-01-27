"use client";

/**
 * Review Card
 *
 * Displays a user review for a media item.
 */

import { Star, User } from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { useTheme } from "@/lib/theme";

interface ReviewCardProps {
  userName: string;
  rating: number;
  content: string;
  date: string;
}

export function ReviewCard({
  userName,
  rating,
  content,
  date,
}: ReviewCardProps) {
  const { currentPalette } = useTheme();

  return (
    <GlassCard className="p-4" enableParallax={false}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: `${currentPalette["--color-primary"]}20`,
            }}
          >
            <User
              className="h-4 w-4"
              style={{ color: currentPalette["--color-primary"] }}
            />
          </div>
          <span
            className="font-medium text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {userName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Star
            className="h-3 w-3 fill-current"
            style={{ color: currentPalette["--color-primary"] }}
          />
          <span
            className="text-sm font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {rating}
          </span>
        </div>
      </div>
      <p
        className="text-sm leading-relaxed mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        {content}
      </p>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {date}
      </p>
    </GlassCard>
  );
}
