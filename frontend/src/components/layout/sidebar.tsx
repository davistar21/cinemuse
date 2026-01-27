"use client";

/**
 * Sidebar Component
 *
 * Desktop navigation sidebar with main links.
 * Hidden on mobile (BottomNav is used instead).
 */

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Search,
  Library,
  ListMusic,
  User,
  LucideIcon,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Library, label: "Discover", href: "/discover" },
  { icon: ListMusic, label: "My Lists", href: "/lists", requiresAuth: true },
  { icon: User, label: "Profile", href: "/profile", requiresAuth: true },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentPalette } = useTheme();
  const { isSidebarOpen } = useUIStore();
  const { user } = useAuthStore();

  const filteredItems = navItems.filter((item) => !item.requiresAuth || user);

  return (
    <motion.aside
      className="fixed left-0 top-16 bottom-0 w-64 hidden md:flex flex-col p-4 z-40"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
      }}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <nav className="flex flex-col gap-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-colors duration-200
              `}
              style={{
                backgroundColor: isActive ? "var(--bg-card)" : "transparent",
                color: isActive
                  ? currentPalette["--color-primary"]
                  : "var(--text-secondary)",
              }}
              whileHover={{
                backgroundColor: "var(--bg-card)",
                x: 4,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  className="ml-auto h-2 w-2 rounded-full"
                  style={{ backgroundColor: currentPalette["--color-primary"] }}
                  layoutId="sidebar-indicator"
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </motion.aside>
  );
}
