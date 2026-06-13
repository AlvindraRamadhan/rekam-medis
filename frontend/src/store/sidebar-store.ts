import { create } from "zustand";

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  toggleCollapse: () => void;
  setOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  isCollapsed: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  toggleCollapse: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
  setOpen: (open) => set({ isOpen: open }),
}));
