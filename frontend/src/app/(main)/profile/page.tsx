"use client";

/**
 * Profile Page
 */

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Mail, LogOut, Palette } from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { useTheme, palettes, PaletteName } from "@/lib/theme";
import { useAuthStore } from "@/stores/auth.store";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { paletteName, setPalette, currentPalette } = useTheme();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <User className="h-16 w-16" style={{ color: "var(--text-muted)" }} />
        <p style={{ color: "var(--text-muted)" }}>
          Sign in to view your profile
        </p>
        <Button
          onClick={() => router.push("/auth/login")}
          style={{
            backgroundColor: currentPalette["--color-primary"],
            color: "white",
          }}
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Profile
        </h1>
      </motion.div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${currentPalette["--color-primary"]}20`,
              }}
            >
              <User
                className="h-8 w-8"
                style={{ color: currentPalette["--color-primary"] }}
              />
            </div>
            <div>
              <h2
                className="text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {user.name || "User"}
              </h2>
              <p
                className="flex items-center gap-2"
                style={{ color: "var(--text-muted)" }}
              >
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Theme Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette
              className="h-5 w-5"
              style={{ color: currentPalette["--color-primary"] }}
            />
            <h3
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Theme
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(palettes).map(([key, palette]) => (
              <motion.button
                key={key}
                onClick={() => setPalette(key as PaletteName)}
                className="p-3 rounded-xl flex flex-col items-center gap-2 transition-all"
                style={{
                  backgroundColor:
                    paletteName === key
                      ? `${palette["--color-primary"]}20`
                      : "var(--bg-surface)",
                  border: `2px solid ${
                    paletteName === key
                      ? palette["--color-primary"]
                      : "transparent"
                  }`,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: palette["--color-primary"] }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {palette.name}
                </span>
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full"
          style={{
            borderColor: "#ef4444",
            color: "#ef4444",
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>
    </div>
  );
}
