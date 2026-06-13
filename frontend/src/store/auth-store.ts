import { create } from "zustand";

export type UserRole = "admin" | "perawat" | "dokter" | "pasien";

export interface AuthUser {
  id: string;
  nama: string;
  role: UserRole;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const mockUsers: Record<UserRole, AuthUser> = {
  admin: {
    id: "1",
    nama: "Admin Klinik",
    role: "admin",
    email: "admin@smartclinic.id",
  },
  perawat: {
    id: "2",
    nama: "Sari Perawat",
    role: "perawat",
    email: "perawat@smartclinic.id",
  },
  dokter: {
    id: "3",
    nama: "dr. Budi Santoso",
    role: "dokter",
    email: "dokter@smartclinic.id",
  },
  pasien: {
    id: "4",
    nama: "Pasien Umum",
    role: "pasien",
    email: "pasien@smartclinic.id",
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: mockUsers.admin,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
