"use client";

/**
 * Theme Provider
 *
 * Manages UI theme based on mood palettes.
 * Applies CSS custom properties from the selected palette.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { palettes, Palette, PaletteName } from "./palettes";

const STORAGE_KEY = "cinemuse_theme";

// Apply palette CSS variables to document root
function applyPalette(palette: Palette) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  Object.entries(palette).forEach(([key, value]) => {
    if (key.startsWith("--")) {
      root.style.setProperty(key, value);
    }
  });
}

// Context
interface ThemeContextType {
  paletteName: PaletteName;
  currentPalette: Palette;
  setPalette: (name: PaletteName) => void;
  allPalettes: typeof palettes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [paletteName, setPaletteName] = useState<PaletteName>("noir");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load stored preference or default
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as PaletteName | null;
    if (stored && palettes[stored]) {
      setPaletteName(stored);
      applyPalette(palettes[stored]);
    } else {
      applyPalette(palettes.noir);
    }
    setIsLoaded(true);
  }, []);

  const setPalette = (name: PaletteName) => {
    setPaletteName(name);
    localStorage.setItem(STORAGE_KEY, name);
    applyPalette(palettes[name]);
  };

  // Prevent flash of unstyled content
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        paletteName,
        currentPalette: palettes[paletteName],
        setPalette,
        allPalettes: palettes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
