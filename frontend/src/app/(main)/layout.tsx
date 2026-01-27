"use client";

/**
 * Main App Layout
 *
 * Used for all authenticated/main app pages.
 * Includes Header, Sidebar (desktop), BottomNav (mobile), and ambient effects.
 */

import { ReactNode } from "react";
import { Header, Sidebar, BottomNav } from "@/components/layout";
import { CursorLight } from "@/components/cursor-light";
import { Threads } from "@/components/threads-background";

interface MainLayoutProps {
  children: ReactNode;
  /** Show ambient background effects */
  showAmbient?: boolean;
}

export default function MainLayout({
  children,
  showAmbient = true,
}: MainLayoutProps) {
  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* Ambient Effects */}
      {showAmbient && (
        <>
          <div className="fixed inset-0 z-0 overflow-hidden">
            <Threads lineCount={6} amplitude={15} />
          </div>
          <CursorLight size={500} opacity={0.1} />
        </>
      )}

      {/* Header */}
      <Header />

      {/* Sidebar (Desktop) */}
      <Sidebar />

      {/* Main Content */}
      <main
        className="
          pt-16 pb-20 md:pb-8
          md:pl-64
          min-h-screen
          relative z-10
        "
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">{children}</div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}
