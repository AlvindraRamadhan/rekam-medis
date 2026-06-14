import type { StatusKunjungan, StatusTagihan, StatusSinkronisasi, Resep } from '@/types'

export type StatusSurat = 'draft' | 'final'

export interface StatusConfig {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className: string
}

export const STATUS_KUNJUNGAN: Record<StatusKunjungan, StatusConfig> = {
  hadir: {
    label: 'Hadir',
    variant: 'outline',
    className: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  menunggu: {
    label: 'Menunggu',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  dipanggil: {
    label: 'Dipanggil',
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  sedang_diperiksa: {
    label: 'Sedang Diperiksa',
    variant: 'default',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  selesai: {
    label: 'Selesai',
    variant: 'outline',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  batal: {
    label: 'Batal',
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
}

export const STATUS_TAGIHAN: Record<StatusTagihan, StatusConfig> = {
  belum_dibayar: {
    label: 'Belum Dibayar',
    variant: 'destructive',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  lunas: {
    label: 'Lunas',
    variant: 'outline',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
}

export const STATUS_SINKRONISASI: Record<StatusSinkronisasi, StatusConfig> = {
  terkirim: {
    label: 'Terkirim',
    variant: 'outline',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  pending: {
    label: 'Pending',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  gagal: {
    label: 'Gagal',
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
}

export const STATUS_SURAT: Record<StatusSurat, StatusConfig> = {
  draft: {
    label: 'Draft',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  final: {
    label: 'Final',
    variant: 'outline',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
}

export const STATUS_RESEP: Record<Resep['status'], StatusConfig> = {
  ditulis: {
    label: 'Ditulis',
    variant: 'outline',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  disiapkan: {
    label: 'Disiapkan',
    variant: 'secondary',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  diserahkan: {
    label: 'Diserahkan',
    variant: 'outline',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
}
