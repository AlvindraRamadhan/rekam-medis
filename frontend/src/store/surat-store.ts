import { create } from 'zustand'
import type { JenisSurat } from '@/types'
import { mockSurat } from '@/data/mock/surat'

// ─── Konten per Jenis ─────────────────────────────────────────────────────────

export interface KontenKeteranganDokter {
  pasienNama: string
  pasienUsia: number
  pasienNIK: string
  diagnosis: string
  keterangan: string
  diperuntukkanUntuk: string
}

export interface KontenKeteranganSehat {
  pasienNama: string
  pasienUsia: number
  pasienNIK: string
  keperluan: string
  catatanKondisiFisik: string
  berlakuHingga: string
}

export interface KontenRujiukanEksternal {
  pasienNama: string
  pasienUsia: number
  faskesTujuan: string
  dokterTujuan: string
  diagnosisUtama: string
  ringkasanTerapi: string
  alasanRujukan: string
}

export interface KontenRujiukanBPJS {
  pasienNama: string
  pasienUsia: number
  noSEP: string
  kodeICD10: string
  deskripsiICD10: string
  fkrtlTujuan: string
  kodiPoli: string
  alasanRujukan: string
}

export type KontenSurat =
  | KontenKeteranganDokter
  | KontenKeteranganSehat
  | KontenRujiukanEksternal
  | KontenRujiukanBPJS

// ─── Entry ────────────────────────────────────────────────────────────────────

export interface SuratEntry {
  id: string
  noSurat: string
  kunjunganId: string
  pasienId: string
  pasienNama: string
  pasienNoRM: string
  dokterId: string
  dokterNama: string
  dokterSIP: string
  jenis: JenisSurat
  konten: KontenSurat
  isFinalized: boolean
  finalizedAt?: Date
  createdAt: Date
}

// ─── Store ────────────────────────────────────────────────────────────────────

const PREFIX_MAP: Record<JenisSurat, string> = {
  keterangan_dokter: 'SKD',
  keterangan_sehat: 'SKS',
  rujukan_eksternal: 'SRE',
  rujukan_bpjs: 'SRB',
}

interface SuratState {
  suratList: SuratEntry[]
  tambahSurat: (data: Omit<SuratEntry, 'id' | 'noSurat' | 'isFinalized' | 'createdAt'>) => string
  finalisasi: (id: string) => void
  getById: (id: string) => SuratEntry | undefined
}

export const useSuratStore = create<SuratState>((set, get) => ({
  suratList: mockSurat,

  tambahSurat: (data) => {
    const id = `srt-${Date.now()}`
    const sameJenis = get().suratList.filter((s) => s.jenis === data.jenis)
    const prefix = PREFIX_MAP[data.jenis]
    const noSurat = `${prefix}-${new Date().getFullYear()}-${String(sameJenis.length + 1).padStart(5, '0')}`
    const entry: SuratEntry = {
      ...data,
      id,
      noSurat,
      isFinalized: false,
      createdAt: new Date(),
    }
    set((s) => ({ suratList: [entry, ...s.suratList] }))
    return id
  },

  finalisasi: (id) =>
    set((s) => ({
      suratList: s.suratList.map((srt) =>
        srt.id === id ? { ...srt, isFinalized: true, finalizedAt: new Date() } : srt
      ),
    })),

  getById: (id) => get().suratList.find((s) => s.id === id),
}))
