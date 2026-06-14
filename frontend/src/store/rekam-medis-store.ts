import { create } from 'zustand'
import { mockRekamMedis } from '@/data/mock/rekam-medis'
import type { DiagnosisICD10, TindakanMedis, Addendum, Kunjungan } from '@/types'

export type JenisRencana = 'medikamentosa' | 'non_medikamentosa' | 'rujukan' | 'observasi'
export type KondisiKeluar = 'sembuh' | 'membaik' | 'belum_sembuh' | 'meninggal'

export interface SOAPFormData {
  keluhanSubjektif: string
  riwayatPenyakitSekarang: string
  riwayatPenyakitDahulu: string
  riwayatPenyakitKeluarga: string
  pemeriksaanFisik: string
  diagnosisUtama: DiagnosisICD10 | null
  diagnosisSekunder: DiagnosisICD10[]
  tindakanMedis: TindakanMedis[]
  jenisRencana: JenisRencana[]
  rencanaMedikamentosa: string
  rencanaNonMedikamentosa: string
  catatanDiet: string
  edukasiPasien: string
  kondisiKeluar: KondisiKeluar
  isFinalized: boolean
  finalizedAt?: Date
  finalizedBy?: string
  addendum: Addendum[]
  satuSehatSynced: boolean
  isDraft: boolean
}

const EMPTY_FORM: SOAPFormData = {
  keluhanSubjektif: '',
  riwayatPenyakitSekarang: '',
  riwayatPenyakitDahulu: '',
  riwayatPenyakitKeluarga: '',
  pemeriksaanFisik: '',
  diagnosisUtama: null,
  diagnosisSekunder: [],
  tindakanMedis: [],
  jenisRencana: [],
  rencanaMedikamentosa: '',
  rencanaNonMedikamentosa: '',
  catatanDiet: '',
  edukasiPasien: '',
  kondisiKeluar: 'membaik',
  isFinalized: false,
  addendum: [],
  satuSehatSynced: false,
  isDraft: false,
}

interface RekamMedisState {
  entries: Record<string, SOAPFormData>
  initEntry: (kunjunganId: string, kunjungan: Kunjungan) => void
  updateField: <K extends keyof SOAPFormData>(kunjunganId: string, field: K, value: SOAPFormData[K]) => void
  saveDraft: (kunjunganId: string) => void
  finalize: (kunjunganId: string, dokterNama: string) => void
  addAddendum: (kunjunganId: string, isi: string, dokterId: string) => void
}

const buildInitialEntries = (): Record<string, SOAPFormData> => {
  const entries: Record<string, SOAPFormData> = {}
  for (const rm of mockRekamMedis) {
    entries[rm.kunjunganId] = {
      keluhanSubjektif: rm.keluhanSubjektif,
      riwayatPenyakitSekarang: '',
      riwayatPenyakitDahulu: '',
      riwayatPenyakitKeluarga: '',
      pemeriksaanFisik: rm.pemeriksaanFisik,
      diagnosisUtama: rm.diagnosisUtama,
      diagnosisSekunder: rm.diagnosisSekunder,
      tindakanMedis: rm.tindakanMedis,
      jenisRencana: rm.jenisRencana as JenisRencana[],
      rencanaMedikamentosa: rm.rencanaMediamentosa,
      rencanaNonMedikamentosa: rm.rencanaNonMediamentosa,
      catatanDiet: rm.catatanDiet,
      edukasiPasien: rm.edukasiPasien,
      kondisiKeluar: rm.kondisiKeluar as KondisiKeluar,
      isFinalized: rm.isFinalized,
      finalizedAt: rm.finalizedAt,
      finalizedBy: 'Dokter',
      addendum: rm.addendum ?? [],
      satuSehatSynced: rm.isFinalized,
      isDraft: false,
    }
  }
  return entries
}

export const useRekamMedisStore = create<RekamMedisState>((set, get) => ({
  entries: buildInitialEntries(),

  initEntry: (kunjunganId, kunjungan) => {
    if (get().entries[kunjunganId]) return
    set((state) => ({
      entries: {
        ...state.entries,
        [kunjunganId]: {
          ...EMPTY_FORM,
          keluhanSubjektif: kunjungan.screening?.keluhanUtama ?? '',
        },
      },
    }))
  },

  updateField: (kunjunganId, field, value) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [kunjunganId]: { ...state.entries[kunjunganId], [field]: value },
      },
    })),

  saveDraft: (kunjunganId) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [kunjunganId]: { ...state.entries[kunjunganId], isDraft: true },
      },
    })),

  finalize: (kunjunganId, dokterNama) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [kunjunganId]: {
          ...state.entries[kunjunganId],
          isFinalized: true,
          finalizedAt: new Date(),
          finalizedBy: dokterNama,
          satuSehatSynced: true,
          isDraft: false,
        },
      },
    })),

  addAddendum: (kunjunganId, isi, dokterId) => {
    const newAddendum: Addendum = {
      id: `add-${Date.now()}`,
      isi,
      dokterId,
      timestamp: new Date(),
    }
    set((state) => ({
      entries: {
        ...state.entries,
        [kunjunganId]: {
          ...state.entries[kunjunganId],
          addendum: [...(state.entries[kunjunganId]?.addendum ?? []), newAddendum],
        },
      },
    }))
  },
}))
