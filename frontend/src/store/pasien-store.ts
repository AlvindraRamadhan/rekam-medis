import { create } from 'zustand'
import { mockPasien } from '@/data/mock/pasien'
import type { Pasien } from '@/types'

interface PasienState {
  pasienList: Pasien[]
  tambahPasien: (pasien: Pasien) => void
  updatePasien: (id: string, data: Partial<Pasien>) => void
}

export const usePasienStore = create<PasienState>((set) => ({
  pasienList: [...mockPasien],
  tambahPasien: (pasien) =>
    set((state) => ({ pasienList: [pasien, ...state.pasienList] })),
  updatePasien: (id, data) =>
    set((state) => ({
      pasienList: state.pasienList.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
      ),
    })),
}))
