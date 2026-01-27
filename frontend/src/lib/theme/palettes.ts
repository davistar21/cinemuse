// CineMuse Theme Palettes
// 5 mood-based color schemes that adapt the entire UI

export interface Palette {
  name: string;
  "--bg-base": string;
  "--bg-surface": string;
  "--bg-card": string;
  "--color-primary": string;
  "--color-secondary": string;
  "--color-glow": string;
  "--text-primary": string;
  "--text-secondary": string;
  "--text-muted": string;
  "--border": string;
  "--radius": string;
}

export const noir: Palette = {
  name: "Noir",
  "--bg-base": "#0a0a0f",
  "--bg-surface": "#12121a",
  "--bg-card": "#1a1a24",
  "--color-primary": "#8b5cf6",
  "--color-secondary": "#6366f1",
  "--color-glow": "#a78bfa",
  "--text-primary": "#f8fafc",
  "--text-secondary": "#94a3b8",
  "--text-muted": "#64748b",
  "--border": "rgba(139, 92, 246, 0.2)",
  "--radius": "12px",
};

export const romance: Palette = {
  name: "Romance",
  "--bg-base": "#120a0f",
  "--bg-surface": "#1f1318",
  "--bg-card": "#2a1a22",
  "--color-primary": "#ec4899",
  "--color-secondary": "#f472b6",
  "--color-glow": "#f9a8d4",
  "--text-primary": "#fdf2f8",
  "--text-secondary": "#f9a8d4",
  "--text-muted": "#9d7a8a",
  "--border": "rgba(236, 72, 153, 0.2)",
  "--radius": "16px",
};

export const scifi: Palette = {
  name: "Sci-Fi",
  "--bg-base": "#0a1018",
  "--bg-surface": "#0f1a28",
  "--bg-card": "#142233",
  "--color-primary": "#06b6d4",
  "--color-secondary": "#22d3ee",
  "--color-glow": "#67e8f9",
  "--text-primary": "#ecfeff",
  "--text-secondary": "#a5f3fc",
  "--text-muted": "#6b8a99",
  "--border": "rgba(6, 182, 212, 0.2)",
  "--radius": "8px",
};

export const thriller: Palette = {
  name: "Thriller",
  "--bg-base": "#0f0808",
  "--bg-surface": "#1a1010",
  "--bg-card": "#241616",
  "--color-primary": "#ef4444",
  "--color-secondary": "#f87171",
  "--color-glow": "#fca5a5",
  "--text-primary": "#fef2f2",
  "--text-secondary": "#fca5a5",
  "--text-muted": "#8a6b6b",
  "--border": "rgba(239, 68, 68, 0.2)",
  "--radius": "6px",
};

export const fantasy: Palette = {
  name: "Fantasy",
  "--bg-base": "#080f0a",
  "--bg-surface": "#101a12",
  "--bg-card": "#18241a",
  "--color-primary": "#22c55e",
  "--color-secondary": "#4ade80",
  "--color-glow": "#86efac",
  "--text-primary": "#f0fdf4",
  "--text-secondary": "#86efac",
  "--text-muted": "#6b8a70",
  "--border": "rgba(34, 197, 94, 0.2)",
  "--radius": "14px",
};

export const palettes = {
  noir,
  romance,
  scifi,
  thriller,
  fantasy,
} as const;

export type PaletteName = keyof typeof palettes;
