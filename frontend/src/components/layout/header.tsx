"use client";

/**
 * Header Component
 *
 * Top navigation bar with logo, search toggle, and user menu.
 * Visible on all pages.
 */

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Palette, User, LogOut, Menu } from "lucide-react";
import { useTheme, palettes, PaletteName } from "@/lib/theme";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const router = useRouter();
  const { paletteName, setPalette, currentPalette } = useTheme();
  const { toggleSidebar, toggleSearchFocus } = useUIStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 px-4 md:px-6 flex items-center justify-between"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Left: Logo + Mobile Menu */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <motion.button
          className="flex items-center gap-2"
          onClick={() => router.push("/")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span
            className="text-xl font-bold"
            style={{ color: currentPalette["--color-primary"] }}
          >
            CineMuse
          </span>
        </motion.button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSearchFocus}
          className="hover:bg-white/10"
        >
          <Search
            className="h-5 w-5"
            style={{ color: "var(--text-secondary)" }}
          />
        </Button>

        {/* Theme Picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <Palette
                className="h-5 w-5"
                style={{ color: currentPalette["--color-primary"] }}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[160px]"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <DropdownMenuLabel style={{ color: "var(--text-muted)" }}>
              Choose Mood
            </DropdownMenuLabel>
            <DropdownMenuSeparator
              style={{ backgroundColor: "var(--border)" }}
            />
            {Object.entries(palettes).map(([key, palette]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setPalette(key as PaletteName)}
                className="flex items-center gap-2 cursor-pointer"
                style={{
                  backgroundColor:
                    paletteName === key ? "var(--bg-surface)" : "transparent",
                  color: "var(--text-primary)",
                }}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: palette["--color-primary"] }}
                />
                {palette.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <User
                  className="h-5 w-5"
                  style={{ color: "var(--text-secondary)" }}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <DropdownMenuLabel style={{ color: "var(--text-muted)" }}>
                {user.name || user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator
                style={{ backgroundColor: "var(--border)" }}
              />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="cursor-pointer"
                style={{ color: "var(--text-primary)" }}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
                style={{ color: "var(--text-primary)" }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/auth/login")}
            style={{ color: "var(--text-primary)" }}
          >
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
