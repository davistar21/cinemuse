"use client";

/**
 * Providers
 *
 * Wraps the app with all necessary context providers.
 */

import { ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme";

export function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
