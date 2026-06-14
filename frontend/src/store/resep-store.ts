import { create } from 'zustand'
import type { ItemResep, JenisKunjungan } from '@/types'
import { mockResep } from '@/data/mock/resep'

export interface ResepEntry {
  id: string
  noResep: string
  kunjunganId: string
  pasienId: string
  pasienNama: string
  pasienNoRM: string
  dokterId: string
  dokterNama: string
  jenisKunjungan: JenisKunjungan
  isBPJS: boolean
  items: ItemResep[]
  status: 'ditulis' | 'disiapkan' | 'diserahkan'
  retryPending: boolean
  createdAt: Date
}

interface ResepState {
  resepList: ResepEntry[]
  tambahResep: (data: Omit<ResepEntry, 'id' | 'noResep' | 'retryPending' | 'createdAt'>) => string
  updateStatus: (id: string, status: ResepEntry['status']) => void
  setRetryPending: (id: string, pending: boolean) => void
  getByKunjungan: (kunjunganId: string) => ResepEntry | undefined
}

export const useResepStore = create<ResepState>((set, get) => ({
  resepList: mockResep,

  tambahResep: (data) => {
    const id = `res-${Date.now()}`
    const idx = get().resepList.length + 1
    const noResep = `RX-${new Date().getFullYear()}-${String(idx).padStart(5, '0')}`
    const newResep: ResepEntry = {
      ...data,
      id,
      noResep,
      retryPending: false,
      createdAt: new Date(),
    }
    set((s) => ({ resepList: [newResep, ...s.resepList] }))
    return id
  },

  updateStatus: (id, status) =>
    set((s) => ({
      resepList: s.resepList.map((r) => (r.id === id ? { ...r, status } : r)),
    })),

  setRetryPending: (id, pending) =>
    set((s) => ({
      resepList: s.resepList.map((r) => (r.id === id ? { ...r, retryPending: pending } : r)),
    })),

  getByKunjungan: (kunjunganId) =>
    get().resepList.find((r) => r.kunjunganId === kunjunganId),
}))
