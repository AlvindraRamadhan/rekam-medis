import { create } from 'zustand'
import { mockTagihan } from '@/data/mock/tagihan'
import { mockMasterTarif, type MasterTarif } from '@/data/mock/master-tarif'
import type { Tagihan, ItemTagihan, StatusTagihan } from '@/types'

export type MetodePembayaran = 'tunai' | 'transfer' | 'qris'
export type StatusKlaimBPJS = 'belum_diajukan' | 'diajukan' | 'diproses' | 'selesai' | 'ditolak'

export interface KlaimBPJS {
  tagihanId: string
  status: StatusKlaimBPJS
  diajukanAt?: Date
  nomorKlaim?: string
}

interface TagihanState {
  tagihanList: Tagihan[]
  masterTarif: MasterTarif[]
  klaimBPJS: Record<string, KlaimBPJS>

  tambahTagihan: (tagihan: Tagihan) => void
  updateTagihan: (id: string, data: Partial<Tagihan>) => void
  konfirmasiPembayaran: (id: string, metode: MetodePembayaran, jumlahBayar: number) => void
  getTagihanById: (id: string) => Tagihan | undefined
  getTagihanByKunjunganId: (kunjunganId: string) => Tagihan | undefined

  // Master tarif
  tambahTarif: (tarif: MasterTarif) => void
  updateTarif: (id: string, data: Partial<MasterTarif>) => void
  toggleAktifTarif: (id: string) => void

  // BPJS klaim
  ajukanKlaim: (tagihanId: string) => void
  cekStatusKlaim: (tagihanId: string) => void
}

const buildInitialKlaim = (): Record<string, KlaimBPJS> => {
  const result: Record<string, KlaimBPJS> = {}
  for (const tagihan of mockTagihan) {
    if (tagihan.noSEP) {
      result[tagihan.id] = {
        tagihanId: tagihan.id,
        status: tagihan.status === 'lunas' ? 'selesai' : 'belum_diajukan',
        diajukanAt: tagihan.status === 'lunas' ? tagihan.paidAt : undefined,
        nomorKlaim: tagihan.status === 'lunas' ? `KLM/${tagihan.nomorInvoice.replace('INV/', '')}` : undefined,
      }
    }
  }
  return result
}

export const useTagihanStore = create<TagihanState>((set, get) => ({
  tagihanList: [...mockTagihan],
  masterTarif: [...mockMasterTarif],
  klaimBPJS: buildInitialKlaim(),

  tambahTagihan: (tagihan) =>
    set((state) => ({ tagihanList: [tagihan, ...state.tagihanList] })),

  updateTagihan: (id, data) =>
    set((state) => ({
      tagihanList: state.tagihanList.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    })),

  konfirmasiPembayaran: (id, _metode, _jumlahBayar) =>
    set((state) => ({
      tagihanList: state.tagihanList.map((t) =>
        t.id === id
          ? { ...t, status: 'lunas' as StatusTagihan, paidAt: new Date() }
          : t
      ),
    })),

  getTagihanById: (id) => get().tagihanList.find((t) => t.id === id),

  getTagihanByKunjunganId: (kunjunganId) =>
    get().tagihanList.find((t) => t.kunjunganId === kunjunganId),

  tambahTarif: (tarif) =>
    set((state) => ({ masterTarif: [...state.masterTarif, tarif] })),

  updateTarif: (id, data) =>
    set((state) => ({
      masterTarif: state.masterTarif.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    })),

  toggleAktifTarif: (id) =>
    set((state) => ({
      masterTarif: state.masterTarif.map((t) =>
        t.id === id ? { ...t, aktif: !t.aktif } : t
      ),
    })),

  ajukanKlaim: (tagihanId) =>
    set((state) => ({
      klaimBPJS: {
        ...state.klaimBPJS,
        [tagihanId]: {
          tagihanId,
          status: 'diajukan',
          diajukanAt: new Date(),
        },
      },
    })),

  cekStatusKlaim: (tagihanId) => {
    const klaim = get().klaimBPJS[tagihanId]
    if (!klaim || klaim.status === 'belum_diajukan') return
    set((state) => ({
      klaimBPJS: {
        ...state.klaimBPJS,
        [tagihanId]: {
          ...klaim,
          status: 'diproses',
          nomorKlaim: klaim.nomorKlaim ?? `KLM/2026/06/${tagihanId.slice(-3)}`,
        },
      },
    }))
  },
}))
