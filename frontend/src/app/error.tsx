"use client";

/**
 * Global Error Page
 *
 * Handles runtime errors with a graceful UI.
 */

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { currentPalette } = useTheme();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard
        className="max-w-md w-full p-8 text-center"
        enableParallax={true}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-20 w-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-red-500/10">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Something went wrong!
          </h1>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
            We encountered an unexpected error. Our script supervisors are
            looking into it.
          </p>
          <Button
            onClick={() => reset()}
            className="w-full"
            style={{
              backgroundColor: currentPalette["--color-primary"],
              color: "white",
            }}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </motion.div>
      </GlassCard>
    </div>
  );
}
