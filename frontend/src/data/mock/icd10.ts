import type { DiagnosisICD10 } from '@/types'

export const mockICD10: DiagnosisICD10[] = [
  // Infeksi Saluran Pernapasan
  { kode: 'J06.9', deskripsi: 'Infeksi Saluran Pernapasan Atas Akut, tidak spesifik' },
  { kode: 'J00', deskripsi: 'Nasofaringitis Akut (Pilek)' },
  { kode: 'J02.9', deskripsi: 'Faringitis Akut, tidak spesifik' },
  { kode: 'J03.9', deskripsi: 'Tonsilitis Akut, tidak spesifik' },
  { kode: 'J04.0', deskripsi: 'Laringitis Akut' },
  { kode: 'J18.9', deskripsi: 'Pneumonia, tidak spesifik' },
  { kode: 'J20.9', deskripsi: 'Bronkitis Akut, tidak spesifik' },
  { kode: 'J45.9', deskripsi: 'Asma, tidak spesifik' },
  { kode: 'J30.1', deskripsi: 'Rinitis Alergika Akibat Serbuk Sari' },
  { kode: 'J32.0', deskripsi: 'Sinusitis Maksilaris Kronis' },

  // Penyakit Jantung & Pembuluh Darah
  { kode: 'I10', deskripsi: 'Hipertensi Esensial (Primer)' },
  { kode: 'I20.9', deskripsi: 'Angina Pektoris, tidak spesifik' },
  { kode: 'I25.1', deskripsi: 'Penyakit Jantung Aterosklerotik' },
  { kode: 'I50.9', deskripsi: 'Gagal Jantung, tidak spesifik' },
  { kode: 'I63.9', deskripsi: 'Infark Serebral, tidak spesifik' },

  // Gangguan Pencernaan
  { kode: 'A09', deskripsi: 'Diare dan Gastroenteritis' },
  { kode: 'K29.7', deskripsi: 'Gastritis, tidak spesifik' },
  { kode: 'K04.0', deskripsi: 'Pulpitis' },
  { kode: 'K02.9', deskripsi: 'Karies Gigi, tidak spesifik' },
  { kode: 'K08.1', deskripsi: 'Kehilangan Gigi Akibat Kecelakaan' },
  { kode: 'K21.0', deskripsi: 'Penyakit Refluks Gastroesofageal dengan Esofagitis' },
  { kode: 'K57.3', deskripsi: 'Penyakit Divertikular Usus Besar tanpa Perforasi' },
  { kode: 'K80.2', deskripsi: 'Kolelitiasis dengan Kolesistitis Kronik' },
  { kode: 'R10.4', deskripsi: 'Nyeri Perut Lainnya dan Tidak Terlokalisasi' },

  // Penyakit Metabolik & Endokrin
  { kode: 'E11.9', deskripsi: 'Diabetes Melitus Tipe 2 tanpa Komplikasi' },
  { kode: 'E11.0', deskripsi: 'Diabetes Melitus Tipe 2 dengan Koma' },
  { kode: 'E78.5', deskripsi: 'Hiperlipidemia, tidak spesifik' },
  { kode: 'E03.9', deskripsi: 'Hipotiroidisme, tidak spesifik' },
  { kode: 'E05.9', deskripsi: 'Tirotoksikosis, tidak spesifik' },
  { kode: 'E86', deskripsi: 'Deplesi Volume (Dehidrasi)' },

  // Penyakit Muskuloskeletal
  { kode: 'M54.5', deskripsi: 'Nyeri Punggung Bawah' },
  { kode: 'M47.8', deskripsi: 'Spondilosis Lainnya' },
  { kode: 'M10.9', deskripsi: 'Gout, tidak spesifik' },
  { kode: 'M25.5', deskripsi: 'Nyeri Sendi' },
  { kode: 'M79.3', deskripsi: 'Panniculitis' },

  // Penyakit Kulit
  { kode: 'L30.9', deskripsi: 'Dermatitis, tidak spesifik' },
  { kode: 'L50.9', deskripsi: 'Urtikaria, tidak spesifik' },
  { kode: 'L20.9', deskripsi: 'Dermatitis Atopik, tidak spesifik' },
  { kode: 'B35.1', deskripsi: 'Tinea Unguium (Onikomikosis)' },
  { kode: 'B02.9', deskripsi: 'Zoster tanpa Komplikasi' },
  { kode: 'B01.9', deskripsi: 'Varisela (Cacar Air) tanpa Komplikasi' },

  // Infeksi Lainnya
  { kode: 'A15.0', deskripsi: 'Tuberkulosis Paru dengan Konfirmasi Sputum' },
  { kode: 'A90', deskripsi: 'Demam Berdarah Dengue' },
  { kode: 'B50.9', deskripsi: 'Malaria Akibat Plasmodium Falciparum, tidak spesifik' },
  { kode: 'A06.0', deskripsi: 'Disentri Ameba Akut' },

  // Urologi & Ginekologi
  { kode: 'N39.0', deskripsi: 'Infeksi Saluran Kemih, Tidak Terlokalisasi' },
  { kode: 'N20.0', deskripsi: 'Batu Ginjal' },
  { kode: 'N76.0', deskripsi: 'Vaginitis Akut' },

  // Gejala & Tanda Umum
  { kode: 'R51', deskripsi: 'Sakit Kepala' },
  { kode: 'R00.0', deskripsi: 'Takikardia, tidak spesifik' },
  { kode: 'R05', deskripsi: 'Batuk' },
]
