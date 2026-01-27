# CineMuse Frontend

A cinematic, mood-driven interface designed for serendipitous discovery.

## 🛠️ Tech Stack

- **Next.js 15:** Latest app router and performance features.
- **Zustand:** Lightweight and fast state management.
- **Framer Motion:** High-fidelity animations and layout transitions.
- **Lucide React:** Consistent iconography.

## ✨ Visual Excellence

- **Mood Palettes:** The UI dynamically shifts between 5 distinct themes:
  - **Noir:** Dark, purple-accented atmospheric vibe.
  - **Sci-Fi:** High-contrast cyan and deep blues.
  - **Romance:** Soft pinks and crimson.
  - **Thriller:** High-alert reds and deep blacks.
  - **Fantasy:** Lush greens and gold.
- **Glassmorphism:** Elegant frosted-glass components using Backdrop Filters.
- **Parallax Media Cards:** 3D hover effects that bring media posters to life.

## 📂 Key Folders

- `src/app`: Routes and page layouts.
- `src/components`: UI primitives and composite features.
- `src/hooks`: Data fetching and search integration.
- `src/stores`: State management for Auth and Search.
- `src/lib/theme`: The logic behind the dynamic mood system.

## 🚀 Local Development

1. `npm install`
2. `npm run dev`
3. The app is proxied to expect the backend at `http://localhost:3002`.

## 🌐 API Proxy

This project uses Next.js rewrites to proxy all `/api/*` requests to the backend server. No CORS issues or separate base URLs required in production.
