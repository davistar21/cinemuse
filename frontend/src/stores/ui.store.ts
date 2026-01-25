import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isSidebarOpen: boolean;
  isSearchFocused: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchFocused: (focused: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: false, // Mobile sidebar closed by default
      isSearchFocused: false,

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      setSearchFocused: (focused) => set({ isSearchFocused: focused }),
    }),
    {
      name: "cinemuse-ui",
    },
  ),
);
