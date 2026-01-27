"use client";

/**
 * Not Found Page
 *
 * Global 404 error page with CineMuse branding.
 */

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileQuestion, Home } from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

export default function NotFound() {
  const router = useRouter();
  const { currentPalette } = useTheme();

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
          <div
            className="h-20 w-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: `${currentPalette["--color-primary"]}20`,
            }}
          >
            <FileQuestion
              className="h-10 w-10"
              style={{ color: currentPalette["--color-primary"] }}
            />
          </div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            404
          </h1>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Page Not Found
          </h2>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
            The scene you're looking for seems to have been cut from the final
            edit.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="w-full"
            style={{
              backgroundColor: currentPalette["--color-primary"],
              color: "white",
            }}
          >
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Button>
        </motion.div>
      </GlassCard>
    </div>
  );
}
