import { create } from 'zustand';

interface ListItem {
  id: string;
  mediaId: string;
  order: number;
  addedAt: string;
  // Included media details for display
  media?: {
    title: string;
    posterUrl?: string;
    type: string;
  };
}

interface List {
  id: string;
  name: string;
  description?: string;
  userId: string;
  items: ListItem[];
  createdAt: string;
  updatedAt: string;
}

interface ListState {
  lists: List[];
  activeList: List | null;
  isLoading: boolean;
  error: string | null;

  setLists: (lists: List[]) => void;
  setActiveList: (list: List) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Optimistic updates could be added here later
  addList: (list: List) => void;
  updateList: (id: string, updates: Partial<List>) => void;
  deleteList: (id: string) => void;
}

export const useListStore = create<ListState>((set) => ({
  lists: [],
  activeList: null,
  isLoading: false,
  error: null,

  setLists: (lists) => set({ lists }),
  setActiveList: (activeList) => set({ activeList }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  addList: (list) => set((state) => ({ lists: [...state.lists, list] })),
  updateList: (id, updates) =>
    set((state) => ({
      lists: state.lists.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      activeList: state.activeList?.id === id ? { ...state.activeList, ...updates } : state.activeList,
    })),
  deleteList: (id) =>
    set((state) => ({
      lists: state.lists.filter((l) => l.id !== id),
      activeList: state.activeList?.id === id ? null : state.activeList,
    })),
}));
