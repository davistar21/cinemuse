"use client";

/**
 * Global Loading State
 *
 * Shows a loading spinner while routes are transitioning.
 */

import { Loader2 } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function Loading() {
  const { currentPalette } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className="h-12 w-12 animate-spin"
          style={{
            color: currentPalette ? currentPalette["--color-primary"] : "white",
          }}
        />
        <p
          className="text-sm font-medium animate-pulse"
          style={{ color: "var(--text-secondary)" }}
        >
          Setting the scene...
        </p>
      </div>
    </div>
  );
}
