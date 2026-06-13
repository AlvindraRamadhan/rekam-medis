import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const NAMA_BULAN_PENDEK = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

export const formatTanggal = (date: Date): string => {
  const d = new Date(date)
  return `${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`
}

export const formatTanggalWaktu = (date: Date): string => {
  const d = new Date(date)
  const jam = String(d.getHours()).padStart(2, '0')
  const menit = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${NAMA_BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}, ${jam}:${menit}`
}

export const hitungUmur = (tanggalLahir: Date): string => {
  const lahir = new Date(tanggalLahir)
  const sekarang = new Date()
  let umur = sekarang.getFullYear() - lahir.getFullYear()
  const belumUlangTahun =
    sekarang.getMonth() < lahir.getMonth() ||
    (sekarang.getMonth() === lahir.getMonth() && sekarang.getDate() < lahir.getDate())
  if (belumUlangTahun) umur--
  return `${umur} tahun`
}

export const hitungBMI = (beratBadan: number, tinggiBadan: number): number => {
  const tinggiMeter = tinggiBadan / 100
  return Math.round((beratBadan / (tinggiMeter * tinggiMeter)) * 10) / 10
}

export const formatRupiah = (angka: number): string => {
  return `Rp ${angka.toLocaleString('id-ID')}`
}

export const formatNoRM = (noRM: string): string => noRM

export const getInisial = (nama: string): string => {
  return nama
    .replace(/^(dr\.|drg\.|prof\.|dr\.?)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}
