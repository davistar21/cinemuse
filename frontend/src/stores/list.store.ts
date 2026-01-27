import { create } from "zustand";
import { api } from "@/lib/api";

interface ListItem {
  id: string;
  mediaId: string;
  addedAt: string;
  media?: {
    id: string;
    title: string;
    type: string;
    posterUrl: string | null;
  };
}

interface List {
  id: string;
  name: string;
  description: string | null;
  items?: ListItem[];
  createdAt: string;
}

interface ListState {
  lists: List[];
  currentList: List | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLists: (lists: List[]) => void;
  setCurrentList: (list: List | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addList: (list: List) => void;
  removeList: (id: string) => void;

  // Async actions
  fetchLists: () => Promise<void>;
  fetchList: (id: string) => Promise<void>;
  createList: (name: string, description?: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  addItemToList: (listId: string, mediaId: string) => Promise<void>;
  removeItemFromList: (listId: string, itemId: string) => Promise<void>;
}

export const useListStore = create<ListState>((set, get) => ({
  lists: [],
  currentList: null,
  isLoading: false,
  error: null,

  setLists: (lists) => set({ lists }),
  setCurrentList: (list) => set({ currentList: list }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  addList: (list) => set((state) => ({ lists: [...state.lists, list] })),
  removeList: (id) =>
    set((state) => ({
      lists: state.lists.filter((l) => l.id !== id),
    })),

  fetchLists: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: List[] }>(
        "/api/lists",
      );
      if (response.success && response.data) {
        set({ lists: response.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch lists",
        isLoading: false,
      });
    }
  },

  fetchList: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: List }>(
        `/api/lists/${id}`,
      );
      if (response.success && response.data) {
        set({ currentList: response.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch list",
        isLoading: false,
      });
    }
  },

  createList: async (name: string, description?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ success: boolean; data: List }>(
        "/api/lists",
        { name, description },
      );
      if (response.success && response.data) {
        set((state) => ({
          lists: [...state.lists, response.data],
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to create list",
        isLoading: false,
      });
    }
  },

  deleteList: async (id: string) => {
    try {
      await api.delete(`/api/lists/${id}`);
      set((state) => ({
        lists: state.lists.filter((l) => l.id !== id),
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete list",
      });
    }
  },

  addItemToList: async (listId: string, mediaId: string) => {
    try {
      const response = await api.post<{ success: boolean; data: ListItem }>(
        `/api/lists/${listId}/items`,
        { mediaId },
      );
      if (response.success && response.data) {
        const { currentList } = get();
        if (currentList && currentList.id === listId) {
          set({
            currentList: {
              ...currentList,
              items: [...(currentList.items || []), response.data],
            },
          });
        }
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to add item",
      });
    }
  },

  removeItemFromList: async (listId: string, itemId: string) => {
    try {
      await api.delete(`/api/lists/${listId}/items/${itemId}`);
      const { currentList } = get();
      if (currentList && currentList.id === listId) {
        set({
          currentList: {
            ...currentList,
            items: (currentList.items || []).filter((i) => i.id !== itemId),
          },
        });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to remove item",
      });
    }
  },
}));
