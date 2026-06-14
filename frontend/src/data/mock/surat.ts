import type { SuratEntry } from '@/store/surat-store'

export const mockSurat: SuratEntry[] = [
  // ─── SKD-001: Haris Munandar — Surat Ket. Dokter, FINAL ─────────────────────
  {
    id: 'srt-001',
    noSurat: 'SKD-2026-00001',
    kunjunganId: 'knj-013',
    pasienId: 'pas-017',
    pasienNama: 'Haris Munandar',
    pasienNoRM: 'RM-2026-00017',
    dokterId: 'dok-001',
    dokterNama: 'dr. Ahmad Fauzi',
    dokterSIP: 'SIP/001/2024/DU',
    jenis: 'keterangan_dokter',
    konten: {
      pasienNama: 'Haris Munandar',
      pasienUsia: 38,
      pasienNIK: '3201010101880001',
      diagnosis: 'J06.9 - Infeksi Saluran Pernapasan Atas Akut, tidak spesifik',
      keterangan: 'Tidak dapat bekerja selama 3 (tiga) hari terhitung mulai tanggal 14 Juni 2026',
      diperuntukkanUntuk: 'PT. Maju Bersama (Keperluan Izin Sakit)',
    },
    isFinalized: true,
    finalizedAt: new Date('2026-06-14T09:45:00'),
    createdAt: new Date('2026-06-14T09:30:00'),
  },

  // ─── SKS-001: Rina Safitri — Surat Ket. Sehat, FINAL ───────────────────────
  {
    id: 'srt-002',
    noSurat: 'SKS-2026-00001',
    kunjunganId: 'knj-007',
    pasienId: 'pas-004',
    pasienNama: 'Rina Safitri',
    pasienNoRM: 'RM-2026-00004',
    dokterId: 'dok-002',
    dokterNama: 'dr. Siti Rahayu',
    dokterSIP: 'SIP/002/2024/DU',
    jenis: 'keterangan_sehat',
    konten: {
      pasienNama: 'Rina Safitri',
      pasienUsia: 32,
      pasienNIK: '3201040404940002',
      keperluan: 'bekerja',
      catatanKondisiFisik:
        'Tekanan darah 120/80 mmHg, nadi 80 x/menit, tidak ditemukan kelainan fisik yang bermakna, pasien dalam kondisi sehat jasmani dan rohani.',
      berlakuHingga: '2026-09-14',
    },
    isFinalized: true,
    finalizedAt: new Date('2026-06-14T10:00:00'),
    createdAt: new Date('2026-06-14T09:50:00'),
  },

  // ─── SRE-001: Agus Firmansyah — Rujukan Eksternal, DRAFT ────────────────────
  {
    id: 'srt-003',
    noSurat: 'SRE-2026-00001',
    kunjunganId: 'knj-009',
    pasienId: 'pas-003',
    pasienNama: 'Agus Firmansyah',
    pasienNoRM: 'RM-2026-00003',
    dokterId: 'dok-001',
    dokterNama: 'dr. Ahmad Fauzi',
    dokterSIP: 'SIP/001/2024/DU',
    jenis: 'rujukan_eksternal',
    konten: {
      pasienNama: 'Agus Firmansyah',
      pasienUsia: 36,
      faskesTujuan: 'RS. Salak Bogor',
      dokterTujuan: 'dr. Sp. Paru',
      diagnosisUtama: 'J45.9 - Asma, tidak spesifik',
      ringkasanTerapi:
        'Pasien telah mendapat terapi bronkodilator (Salbutamol 2 mg 3x/hari) selama 2 minggu, respons belum optimal. Nebulisasi dilakukan 1x di klinik.',
      alasanRujukan:
        'Perlu evaluasi spirometri dan penatalaksanaan lebih lanjut oleh Spesialis Paru untuk optimasi terapi asma.',
    },
    isFinalized: false,
    createdAt: new Date('2026-06-14T10:30:00'),
  },

  // ─── SRB-001: Budi Hartono — Rujukan BPJS, FINAL ───────────────────────────
  {
    id: 'srt-004',
    noSurat: 'SRB-2026-00001',
    kunjunganId: 'knj-002',
    pasienId: 'pas-001',
    pasienNama: 'Budi Hartono',
    pasienNoRM: 'RM-2026-00001',
    dokterId: 'dok-001',
    dokterNama: 'dr. Ahmad Fauzi',
    dokterSIP: 'SIP/001/2024/DU',
    jenis: 'rujukan_bpjs',
    konten: {
      pasienNama: 'Budi Hartono',
      pasienUsia: 46,
      noSEP: 'SEP/2026/06/14/002',
      kodeICD10: 'I10',
      deskripsiICD10: 'Hipertensi Esensial (Primer)',
      fkrtlTujuan: 'RSUD Kota Bogor',
      kodiPoli: 'Poli Jantung',
      alasanRujukan:
        'Pasien dengan Hipertensi grade 2 tidak terkontrol meski sudah medikasi 3 bulan. Perlu evaluasi kardiologi lebih lanjut.',
    },
    isFinalized: true,
    finalizedAt: new Date('2026-06-14T11:00:00'),
    createdAt: new Date('2026-06-14T10:45:00'),
  },
]
