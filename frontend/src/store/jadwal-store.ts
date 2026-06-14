import { create } from 'zustand'
import { mockJadwal } from '@/data/mock/jadwal'
import type { JadwalDokter, Dokter } from '@/types'

export interface UpsertJadwalInput {
  dokterId: string
  dokter: Dokter
  hari: JadwalDokter['hari']
  sesi: JadwalDokter['sesi']
  jamMulai: string
  jamSelesai: string
  kapasitasMaksimal: number
  isLibur: boolean
  keteranganLibur?: string
}

interface JadwalState {
  jadwalList: JadwalDokter[]
  tambahJadwal: (input: UpsertJadwalInput) => void
  editJadwal: (id: string, input: UpsertJadwalInput) => void
  hapusJadwal: (id: string) => void
}

export const useJadwalStore = create<JadwalState>((set) => ({
  jadwalList: [...mockJadwal],

  tambahJadwal: (input) =>
    set((state) => ({
      jadwalList: [
        ...state.jadwalList,
        { id: `jdw-new-${Date.now()}`, pasienTerisi: 0, ...input },
      ],
    })),

  editJadwal: (id, input) =>
    set((state) => ({
      jadwalList: state.jadwalList.map((j) =>
        j.id === id ? { ...j, ...input } : j
      ),
    })),

  hapusJadwal: (id) =>
    set((state) => ({
      jadwalList: state.jadwalList.filter((j) => j.id !== id),
    })),
}))
