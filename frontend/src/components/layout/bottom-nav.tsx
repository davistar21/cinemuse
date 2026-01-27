"use client";

/**
 * Bottom Navigation
 *
 * Mobile navigation bar fixed at the bottom of the screen.
 * Visible only on mobile devices.
 */

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, Library, ListMusic, User } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuthStore } from "@/stores/auth.store";

interface NavItem {
  icon: any;
  label: string;
  href: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Library, label: "Discover", href: "/discover" },
  { icon: ListMusic, label: "Lists", href: "/lists", requiresAuth: true },
  { icon: User, label: "Profile", href: "/profile", requiresAuth: true },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentPalette } = useTheme();
  const { user } = useAuthStore();

  const filteredItems = navItems.filter((item) => !item.requiresAuth || user);

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around md:hidden z-50 px-2"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {filteredItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl relative"
            whileTap={{ scale: 0.9 }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  backgroundColor: `${currentPalette["--color-primary"]}20`,
                }}
                layoutId="bottom-nav-indicator"
              />
            )}
            <Icon
              className="h-5 w-5 relative z-10"
              style={{
                color: isActive
                  ? currentPalette["--color-primary"]
                  : "var(--text-muted)",
              }}
            />
            <span
              className="text-[10px] font-medium relative z-10"
              style={{
                color: isActive
                  ? currentPalette["--color-primary"]
                  : "var(--text-muted)",
              }}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
