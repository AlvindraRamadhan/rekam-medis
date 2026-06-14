import { create } from 'zustand'
import { mockKunjungan } from '@/data/mock/kunjungan'
import type { Kunjungan, StatusKunjungan, JenisKunjungan, Pasien, Dokter } from '@/types'

export interface TambahKunjunganInput {
  pasien: Pasien
  dokter: Dokter
  poli: string
  jenisKunjungan: JenisKunjungan
  noSEP?: string
}

interface AntrianState {
  kunjunganList: Kunjungan[]
  nextAntrianNum: number
  updateStatus: (id: string, status: StatusKunjungan) => void
  tambahKunjungan: (input: TambahKunjunganInput) => string
}

const computeNextNum = (): number => {
  const nums = mockKunjungan
    .map((k) => k.noAntrian)
    .filter((n) => /^A-\d+$/.test(n))
    .map((n) => parseInt(n.slice(2), 10))
  return nums.length > 0 ? Math.max(...nums) + 1 : 1
}

export const useAntrianStore = create<AntrianState>((set, get) => ({
  kunjunganList: [...mockKunjungan],
  nextAntrianNum: computeNextNum(),

  updateStatus: (id, status) =>
    set((state) => ({
      kunjunganList: state.kunjunganList.map((k) =>
        k.id === id ? { ...k, status } : k
      ),
    })),

  tambahKunjungan: ({ pasien, dokter, poli, jenisKunjungan, noSEP }) => {
    const num = get().nextAntrianNum
    const noAntrian = `A-${String(num).padStart(3, '0')}`
    const newKunjungan: Kunjungan = {
      id: `knj-new-${Date.now()}`,
      noAntrian,
      pasienId: pasien.id,
      pasien,
      dokterId: dokter.id,
      dokter,
      poli,
      tanggalKunjungan: new Date(),
      jenisKunjungan,
      status: 'menunggu',
      noSEP,
      createdAt: new Date(),
    }
    set((state) => ({
      kunjunganList: [...state.kunjunganList, newKunjungan],
      nextAntrianNum: state.nextAntrianNum + 1,
    }))
    return noAntrian
  },
}))
