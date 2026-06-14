export interface MasterTarif {
  id: string
  nama: string
  kategori: 'konsultasi' | 'tindakan' | 'obat' | 'lainnya'
  harga: number
  aktif: boolean
}

export const mockMasterTarif: MasterTarif[] = [
  { id: 'tar-001', nama: 'Konsultasi Dokter Umum', kategori: 'konsultasi', harga: 50000, aktif: true },
  { id: 'tar-002', nama: 'Konsultasi Dokter Gigi', kategori: 'konsultasi', harga: 75000, aktif: true },
  { id: 'tar-003', nama: 'Konsultasi Dokter Spesialis', kategori: 'konsultasi', harga: 150000, aktif: true },
  { id: 'tar-004', nama: 'Tindakan Infus', kategori: 'tindakan', harga: 150000, aktif: true },
  { id: 'tar-005', nama: 'EKG (Elektrokardiogram)', kategori: 'tindakan', harga: 75000, aktif: true },
  { id: 'tar-006', nama: 'Nebulisasi', kategori: 'tindakan', harga: 75000, aktif: true },
  { id: 'tar-007', nama: 'Cabut Gigi Susu', kategori: 'tindakan', harga: 100000, aktif: true },
  { id: 'tar-008', nama: 'Cabut Gigi Dewasa', kategori: 'tindakan', harga: 200000, aktif: true },
  { id: 'tar-009', nama: 'Pemeriksaan Gula Darah Sewaktu', kategori: 'tindakan', harga: 25000, aktif: true },
  { id: 'tar-010', nama: 'Pemeriksaan Tekanan Darah', kategori: 'tindakan', harga: 15000, aktif: true },
  { id: 'tar-011', nama: 'Rontgen Thorax', kategori: 'tindakan', harga: 200000, aktif: true },
  { id: 'tar-012', nama: 'USG Abdomen', kategori: 'tindakan', harga: 250000, aktif: true },
  { id: 'tar-013', nama: 'Rawat Luka Ringan', kategori: 'tindakan', harga: 50000, aktif: true },
  { id: 'tar-014', nama: 'Injeksi / Suntikan', kategori: 'tindakan', harga: 35000, aktif: true },
  { id: 'tar-015', nama: 'Administrasi & Rekam Medis', kategori: 'lainnya', harga: 10000, aktif: false },
]
