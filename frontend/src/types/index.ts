// ─── AUTH & USER ──────────────────────────────────────────────────────────────

export interface User {
  id: string
  nama: string
  email: string
  role: 'admin' | 'perawat' | 'dokter' | 'pasien'
  noWa: string
  aktif: boolean
  createdAt: Date
}

export interface Dokter extends User {
  spesialisasi: string
  nomorSIP: string
  foto?: string
}

// ─── PASIEN ───────────────────────────────────────────────────────────────────

export interface Alergi {
  id: string
  jenisAlergi: 'obat' | 'makanan' | 'lainnya'
  namaAlergen: string
  reaksi: string
  severity: 'ringan' | 'sedang' | 'berat'
}

export interface DataBPJS {
  noKartu: string
  faskesTingkat1: string
  jenisKepesertaan: string
  statusAktif: boolean
}

export interface Pasien {
  id: string
  noRM: string
  nik: string
  nama: string
  tanggalLahir: Date
  jenisKelamin: 'L' | 'P'
  alamat: string
  noTelepon: string
  golonganDarah: 'A' | 'B' | 'AB' | 'O' | '-'
  alergi: Alergi[]
  bpjs?: DataBPJS
  ihsNumber?: string
  createdAt: Date
  updatedAt: Date
}

// ─── KUNJUNGAN & ANTRIAN ──────────────────────────────────────────────────────

export type StatusKunjungan = 'hadir' | 'menunggu' | 'dipanggil' | 'sedang_diperiksa' | 'selesai' | 'batal'
export type JenisKunjungan = 'umum' | 'bpjs'

export interface Kunjungan {
  id: string
  noAntrian: string
  pasienId: string
  pasien: Pasien
  dokterId: string
  dokter: Dokter
  poli: string
  tanggalKunjungan: Date
  jenisKunjungan: JenisKunjungan
  status: StatusKunjungan
  noSEP?: string
  screening?: Screening
  rekamMedis?: RekamMedis
  resep?: Resep[]
  tagihan?: Tagihan
  createdAt: Date
}

// ─── SCREENING (PERAWAT) ──────────────────────────────────────────────────────

export interface Screening {
  id: string
  kunjunganId: string
  perawatId: string
  tanggalWaktu: Date
  tekananDarahSistolik: number
  tekananDarahDiastolik: number
  nadiPerMenit: number
  suhuCelsius: number
  saturasi: number
  beratBadan: number
  tinggiBadan: number
  bmi: number
  keluhanUtama: string
  anamnesis: string
  skalaNyeri: number
  tingkatKesadaran: 'composmentis' | 'apatis' | 'somnolen' | 'stupor' | 'koma'
  statusAlergiKonfirmasi: boolean
}

// ─── REKAM MEDIS SOAP ─────────────────────────────────────────────────────────

export interface DiagnosisICD10 {
  kode: string
  deskripsi: string
}

export interface TindakanMedis {
  kode: string
  deskripsi: string
}

export interface Addendum {
  id: string
  isi: string
  dokterId: string
  timestamp: Date
}

export interface RekamMedis {
  id: string
  kunjunganId: string
  dokterId: string
  tanggalWaktu: Date
  keluhanSubjektif: string
  pemeriksaanFisik: string
  diagnosisUtama: DiagnosisICD10
  diagnosisSekunder: DiagnosisICD10[]
  tindakanMedis: TindakanMedis[]
  rencanaMediamentosa: string
  rencanaNonMediamentosa: string
  jenisRencana: ('medikamentosa' | 'non_medikamentosa' | 'rujukan' | 'observasi')[]
  catatanDiet: string
  edukasiPasien: string
  kondisiKeluar: 'sembuh' | 'membaik' | 'belum_sembuh' | 'meninggal'
  isFinalized: boolean
  finalizedAt?: Date
  addendum?: Addendum[]
}

// ─── RESEP ELEKTRONIK ─────────────────────────────────────────────────────────

export interface ItemResep {
  id: string
  obatId: string
  namaObat: string
  kandunganAktif: string
  dosis: string
  frekuensi: string
  jumlah: number
  satuan: string
  instruksiKhusus: string
  adalahFornas: boolean
  adaKonflikAlergi: boolean
  alasanOverrideAlergi?: string
}

export interface Resep {
  id: string
  kunjunganId: string
  dokterId: string
  items: ItemResep[]
  status: 'ditulis' | 'disiapkan' | 'diserahkan'
  createdAt: Date
}

export interface DataObat {
  id: string
  namaGenerik: string
  namaPaten: string
  kandunganAktif: string
  bentukSediaan: string
  kekuatan: string
  golongan: string
  adalahFornas: boolean
}

// ─── SURAT & RUJUKAN ──────────────────────────────────────────────────────────

export type JenisSurat = 'keterangan_dokter' | 'keterangan_sehat' | 'rujukan_eksternal' | 'rujukan_bpjs'

export interface SuratDokumen {
  id: string
  kunjunganId: string
  jenis: JenisSurat
  konten: object
  isFinalized: boolean
  createdAt: Date
  pdfUrl?: string
}

// ─── BILLING ──────────────────────────────────────────────────────────────────

export type StatusTagihan = 'belum_dibayar' | 'lunas'

export interface ItemTagihan {
  id: string
  nama: string
  kategori: 'konsultasi' | 'tindakan' | 'obat' | 'lainnya'
  harga: number
  jumlah: number
}

export interface Tagihan {
  id: string
  kunjunganId: string
  nomorInvoice: string
  items: ItemTagihan[]
  totalBiaya: number
  status: StatusTagihan
  noSEP?: string
  createdAt: Date
  paidAt?: Date
}

// ─── JADWAL DOKTER ────────────────────────────────────────────────────────────

export interface JadwalDokter {
  id: string
  dokterId: string
  dokter: Dokter
  hari: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu'
  sesi: 'pagi' | 'siang' | 'sore'
  jamMulai: string
  jamSelesai: string
  kapasitasMaksimal: number
  pasienTerisi?: number
  isLibur: boolean
  keteranganLibur?: string
}

// ─── INTEGRASI ────────────────────────────────────────────────────────────────

export type StatusSinkronisasi = 'terkirim' | 'pending' | 'gagal'

export interface LogIntegrasi {
  id: string
  kunjunganId: string
  tipe: 'satusehat' | 'bpjs'
  status: StatusSinkronisasi
  timestamp: Date
  errorMessage?: string
  retryCount: number
}
