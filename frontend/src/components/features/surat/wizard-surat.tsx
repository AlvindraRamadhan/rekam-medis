'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  HeartPulseIcon,
  HospitalIcon,
  Loader2Icon,
  LockIcon,
  PrinterIcon,
  ShieldCheckIcon,
  XIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { TemplateSurat } from './template-surat'
import { useSuratStore } from '@/store/surat-store'
import { useAntrianStore } from '@/store/antrian-store'
import { useAuthStore } from '@/store/auth-store'
import { mockDokter } from '@/data/mock/dokter'
import { mockICD10 } from '@/data/mock/icd10'
import { cn } from '@/lib/utils'
import type { JenisSurat } from '@/types'
import type {
  SuratEntry,
  KontenKeteranganDokter,
  KontenKeteranganSehat,
  KontenRujiukanEksternal,
  KontenRujiukanBPJS,
  KontenSurat,
} from '@/store/surat-store'

// ─── Constants ────────────────────────────────────────────────────────────────

const FKRTL_OPTIONS = [
  'RSUD Kota Bogor',
  'RS. Salak Bogor',
  'RS. PMI Bogor',
  'RSUD Cibinong',
  'RS. Hermina Bogor',
  'RS. Azra Bogor',
  'RS. Ummi Bogor',
  'RSUP Fatmawati Jakarta',
  'RSPAD Gatot Subroto Jakarta',
]

const POLI_BPJS_OPTIONS = [
  'Poli Umum',
  'Poli Jantung',
  'Poli Paru',
  'Poli Saraf',
  'Poli Bedah',
  'Poli Obsgyn',
  'Poli Ortopedi',
  'Poli Kulit & Kelamin',
  'Poli Mata',
  'Poli THT',
  'Poli Gigi',
  'Poli Jiwa',
  'Poli Anak',
  'Poli Urologi',
]

const KEPERLUAN_OPTIONS = [
  { value: 'olahraga', label: 'Olahraga / Aktivitas Fisik' },
  { value: 'bekerja', label: 'Bekerja' },
  { value: 'sekolah', label: 'Kegiatan Sekolah / Pendidikan' },
  { value: 'ibadah', label: 'Ibadah / Kegiatan Keagamaan' },
]

// ─── Step 1 card definitions ──────────────────────────────────────────────────

interface JenisCard {
  jenis: JenisSurat
  label: string
  sublabel: string
  icon: React.ReactNode
  color: string
  border: string
  bg: string
}

const JENIS_CARDS: JenisCard[] = [
  {
    jenis: 'keterangan_dokter',
    label: 'Ket. Dokter',
    sublabel: 'Izin sakit, keperluan asuransi / instansi',
    icon: <ClipboardListIcon className="size-8" />,
    color: 'text-blue-700',
    border: 'border-blue-300',
    bg: 'bg-blue-50 hover:bg-blue-100',
  },
  {
    jenis: 'keterangan_sehat',
    label: 'Ket. Sehat',
    sublabel: 'Layak kerja, olahraga, sekolah, ibadah',
    icon: <HeartPulseIcon className="size-8" />,
    color: 'text-emerald-700',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50 hover:bg-emerald-100',
  },
  {
    jenis: 'rujukan_eksternal',
    label: 'Rujukan Eksternal',
    sublabel: 'Ke faskes / spesialis lain',
    icon: <HospitalIcon className="size-8" />,
    color: 'text-purple-700',
    border: 'border-purple-300',
    bg: 'bg-purple-50 hover:bg-purple-100',
  },
  {
    jenis: 'rujukan_bpjs',
    label: 'Rujukan BPJS',
    sublabel: 'SEP, ICD-10, FKRTL tujuan',
    icon: <ShieldCheckIcon className="size-8" />,
    color: 'text-teal-700',
    border: 'border-teal-300',
    bg: 'bg-teal-50 hover:bg-teal-100',
  },
]

// ─── Form state ───────────────────────────────────────────────────────────────

interface WizardForm {
  kunjunganId: string
  // Patient (auto-filled)
  pasienNama: string
  pasienUsia: number
  pasienNIK: string
  pasienNoRM: string
  pasienId: string
  // Keterangan Dokter
  diagnosis: string
  keterangan: string
  diperuntukkanUntuk: string
  // Keterangan Sehat
  keperluan: string
  catatanKondisiFisik: string
  berlakuHingga: Date | undefined
  // Rujukan Eksternal
  faskesTujuan: string
  dokterTujuan: string
  diagnosisUtama: string
  ringkasanTerapi: string
  alasanRujukan: string
  // Rujukan BPJS
  noSEP: string
  kodeICD10: string
  deskripsiICD10: string
  fkrtlTujuan: string
  kodiPoli: string
}

const EMPTY_FORM: WizardForm = {
  kunjunganId: '',
  pasienNama: '',
  pasienUsia: 0,
  pasienNIK: '',
  pasienNoRM: '',
  pasienId: '',
  diagnosis: '',
  keterangan: '',
  diperuntukkanUntuk: '',
  keperluan: '',
  catatanKondisiFisik: '',
  berlakuHingga: undefined,
  faskesTujuan: '',
  dokterTujuan: '',
  diagnosisUtama: '',
  ringkasanTerapi: '',
  alasanRujukan: '',
  noSEP: '',
  kodeICD10: '',
  deskripsiICD10: '',
  fkrtlTujuan: '',
  kodiPoli: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const computeUsia = (tanggalLahir: Date): number =>
  Math.floor((Date.now() - new Date(tanggalLahir).getTime()) / (365.25 * 24 * 3600 * 1000))

// ─── Step indicator ───────────────────────────────────────────────────────────

const StepIndicator = ({ current }: { current: 1 | 2 | 3 }) => (
  <div className="flex items-center gap-2 mb-6">
    {([1, 2, 3] as const).map((n, i) => (
      <div key={n} className="flex items-center gap-2">
        <div
          className={cn(
            'flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
            current === n
              ? 'bg-blue-600 text-white'
              : current > n
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-100 text-gray-400'
          )}
        >
          {current > n ? <CheckCircle2Icon className="size-4" /> : n}
        </div>
        <span
          className={cn(
            'text-xs font-medium',
            current === n ? 'text-blue-700' : current > n ? 'text-emerald-600' : 'text-gray-400'
          )}
        >
          {n === 1 ? 'Pilih Jenis' : n === 2 ? 'Isi Formulir' : 'Preview & Finalisasi'}
        </span>
        {i < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
      </div>
    ))}
  </div>
)

// ─── Step 1: Pilih Jenis ──────────────────────────────────────────────────────

const Step1PilihJenis = ({
  selected,
  onSelect,
}: {
  selected: JenisSurat | null
  onSelect: (j: JenisSurat) => void
}) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-lg font-bold">Pilih Jenis Surat</h2>
      <p className="text-sm text-muted-foreground mt-0.5">
        Pilih jenis surat yang akan diterbitkan untuk pasien.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-4 mt-4">
      {JENIS_CARDS.map((card) => (
        <button
          key={card.jenis}
          type="button"
          onClick={() => onSelect(card.jenis)}
          className={cn(
            'relative flex flex-col items-center gap-3 rounded-xl border-2 px-6 py-8 text-center transition-all cursor-pointer',
            card.bg,
            selected === card.jenis
              ? `${card.border} ring-2 ring-offset-1 ring-blue-400`
              : 'border-gray-200 hover:border-gray-300'
          )}
          aria-pressed={selected === card.jenis}
        >
          {selected === card.jenis && (
            <CheckCircle2Icon className="absolute top-3 right-3 size-4 text-blue-600" />
          )}
          <span className={cn('transition-colors', card.color)}>{card.icon}</span>
          <div>
            <p className={cn('font-semibold text-sm', card.color)}>{card.label}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.sublabel}</p>
          </div>
        </button>
      ))}
    </div>
  </div>
)

// ─── Step 2: Forms ────────────────────────────────────────────────────────────

// Kunjungan selector shared across all form types
const KunjunganSelector = ({
  form,
  kunjunganList,
  onChange,
}: {
  form: WizardForm
  kunjunganList: ReturnType<typeof useAntrianStore.getState>['kunjunganList']
  onChange: (updates: Partial<WizardForm>) => void
}) => {
  const handleKunjunganChange = (kunjunganId: string) => {
    const knj = kunjunganList.find((k) => k.id === kunjunganId)
    if (!knj) {
      onChange({ kunjunganId, pasienNama: '', pasienUsia: 0, pasienNIK: '', pasienNoRM: '', pasienId: '', noSEP: '' })
      return
    }
    const pasien = knj.pasien
    onChange({
      kunjunganId,
      pasienNama: pasien.nama,
      pasienUsia: computeUsia(pasien.tanggalLahir),
      pasienNIK: pasien.nik,
      pasienNoRM: pasien.noRM,
      pasienId: pasien.id,
      noSEP: knj.noSEP ?? '',
    })
  }

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-3">
      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
        Kaitkan dengan Kunjungan (Opsional — untuk auto-isi data pasien)
      </p>
      <div className="space-y-1">
        <Label htmlFor="kunjungan-select" className="text-xs">Pilih Kunjungan Hari Ini</Label>
        <Select
          value={form.kunjunganId}
          onValueChange={(v) => v && handleKunjunganChange(v)}
        >
          <SelectTrigger id="kunjungan-select" className="h-9 text-sm bg-white">
            <SelectValue placeholder="— Pilih kunjungan atau isi manual —" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {kunjunganList.map((knj) => (
                <SelectItem key={knj.id} value={knj.id}>
                  {knj.noAntrian} · {knj.pasien.nama}
                  {knj.noSEP ? ' (BPJS)' : ''}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Field wrapper
const FormField = ({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
    {children}
  </div>
)

const FormKeteranganDokter = ({
  form,
  onChange,
}: {
  form: WizardForm
  onChange: (u: Partial<WizardForm>) => void
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Nama Pasien" required>
        <Input
          value={form.pasienNama}
          onChange={(e) => onChange({ pasienNama: e.target.value })}
          placeholder="Nama lengkap pasien"
        />
      </FormField>
      <FormField label="Usia (tahun)" required>
        <Input
          type="number"
          min={0}
          max={150}
          value={form.pasienUsia || ''}
          onChange={(e) => onChange({ pasienUsia: Number(e.target.value) })}
          placeholder="0"
        />
      </FormField>
    </div>
    <FormField label="NIK" required>
      <Input
        value={form.pasienNIK}
        onChange={(e) => onChange({ pasienNIK: e.target.value })}
        placeholder="16 digit NIK"
        maxLength={16}
      />
    </FormField>
    <FormField label="Diagnosis" required>
      <Input
        value={form.diagnosis}
        onChange={(e) => onChange({ diagnosis: e.target.value })}
        placeholder="Misal: J06.9 - Infeksi Saluran Pernapasan Atas"
      />
    </FormField>
    <FormField label="Keterangan yang Diminta" required>
      <Textarea
        value={form.keterangan}
        onChange={(e) => onChange({ keterangan: e.target.value })}
        placeholder="Misal: Tidak dapat bekerja selama 3 (tiga) hari terhitung mulai tanggal ..."
        rows={3}
      />
    </FormField>
    <FormField label="Diperuntukkan Untuk" required>
      <Input
        value={form.diperuntukkanUntuk}
        onChange={(e) => onChange({ diperuntukkanUntuk: e.target.value })}
        placeholder="Misal: PT. Maju Bersama (Keperluan Izin Sakit)"
      />
    </FormField>
  </div>
)

const FormKeteranganSehat = ({
  form,
  onChange,
}: {
  form: WizardForm
  onChange: (u: Partial<WizardForm>) => void
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Nama Pasien" required>
        <Input
          value={form.pasienNama}
          onChange={(e) => onChange({ pasienNama: e.target.value })}
          placeholder="Nama lengkap pasien"
        />
      </FormField>
      <FormField label="Usia (tahun)" required>
        <Input
          type="number"
          min={0}
          max={150}
          value={form.pasienUsia || ''}
          onChange={(e) => onChange({ pasienUsia: Number(e.target.value) })}
          placeholder="0"
        />
      </FormField>
    </div>
    <FormField label="NIK" required>
      <Input
        value={form.pasienNIK}
        onChange={(e) => onChange({ pasienNIK: e.target.value })}
        placeholder="16 digit NIK"
        maxLength={16}
      />
    </FormField>
    <FormField label="Keperluan" required>
      <Select
        value={form.keperluan}
        onValueChange={(v) => v && onChange({ keperluan: v })}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Pilih keperluan..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {KEPERLUAN_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FormField>
    <FormField label="Catatan Kondisi Fisik" required>
      <Textarea
        value={form.catatanKondisiFisik}
        onChange={(e) => onChange({ catatanKondisiFisik: e.target.value })}
        placeholder="Misal: Tekanan darah 120/80 mmHg, nadi 80 x/menit, tidak ditemukan kelainan fisik..."
        rows={3}
      />
    </FormField>
    <FormField label="Berlaku Hingga" required>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal h-9',
                !form.berlakuHingga && 'text-muted-foreground'
              )}
            />
          }
        >
          {form.berlakuHingga
            ? format(form.berlakuHingga, 'd MMMM yyyy', { locale: idLocale })
            : 'Pilih tanggal...'}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={form.berlakuHingga}
            onSelect={(d) => onChange({ berlakuHingga: d })}
            disabled={(d) => d < new Date()}
          />
        </PopoverContent>
      </Popover>
    </FormField>
  </div>
)

const FormRujiukanEksternal = ({
  form,
  onChange,
}: {
  form: WizardForm
  onChange: (u: Partial<WizardForm>) => void
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Nama Pasien" required>
        <Input
          value={form.pasienNama}
          onChange={(e) => onChange({ pasienNama: e.target.value })}
          placeholder="Nama lengkap pasien"
        />
      </FormField>
      <FormField label="Usia (tahun)" required>
        <Input
          type="number"
          min={0}
          max={150}
          value={form.pasienUsia || ''}
          onChange={(e) => onChange({ pasienUsia: Number(e.target.value) })}
          placeholder="0"
        />
      </FormField>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Faskes Tujuan" required>
        <Select
          value={form.faskesTujuan}
          onValueChange={(v) => v && onChange({ faskesTujuan: v })}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Pilih faskes..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {FKRTL_OPTIONS.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Dokter / Spesialis Tujuan" required>
        <Input
          value={form.dokterTujuan}
          onChange={(e) => onChange({ dokterTujuan: e.target.value })}
          placeholder="Misal: dr. Sp. Paru"
        />
      </FormField>
    </div>
    <FormField label="Diagnosis Utama" required>
      <Input
        value={form.diagnosisUtama}
        onChange={(e) => onChange({ diagnosisUtama: e.target.value })}
        placeholder="Misal: J45.9 - Asma, tidak spesifik"
      />
    </FormField>
    <FormField label="Ringkasan Terapi yang Telah Diberikan" required>
      <Textarea
        value={form.ringkasanTerapi}
        onChange={(e) => onChange({ ringkasanTerapi: e.target.value })}
        placeholder="Deskripsikan terapi yang sudah diberikan di klinik ini..."
        rows={3}
      />
    </FormField>
    <FormField label="Alasan Rujukan" required>
      <Textarea
        value={form.alasanRujukan}
        onChange={(e) => onChange({ alasanRujukan: e.target.value })}
        placeholder="Jelaskan mengapa pasien perlu dirujuk..."
        rows={3}
      />
    </FormField>
  </div>
)

const FormRujiukanBPJS = ({
  form,
  onChange,
}: {
  form: WizardForm
  onChange: (u: Partial<WizardForm>) => void
}) => {
  const [icdOpen, setIcdOpen] = useState(false)
  const [icdSearch, setIcdSearch] = useState('')

  const filteredICD = icdSearch.length >= 2
    ? mockICD10.filter(
        (d) =>
          d.kode.toLowerCase().includes(icdSearch.toLowerCase()) ||
          d.deskripsi.toLowerCase().includes(icdSearch.toLowerCase())
      ).slice(0, 8)
    : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nama Pasien" required>
          <Input
            value={form.pasienNama}
            onChange={(e) => onChange({ pasienNama: e.target.value })}
            placeholder="Nama lengkap pasien"
          />
        </FormField>
        <FormField label="Usia (tahun)" required>
          <Input
            type="number"
            min={0}
            max={150}
            value={form.pasienUsia || ''}
            onChange={(e) => onChange({ pasienUsia: Number(e.target.value) })}
            placeholder="0"
          />
        </FormField>
      </div>
      <FormField label="No. SEP" required>
        <Input
          value={form.noSEP}
          onChange={(e) => onChange({ noSEP: e.target.value })}
          placeholder="Misal: SEP/2026/06/14/001"
          className="font-mono text-sm"
        />
      </FormField>
      <FormField label="Kode ICD-10" required>
        <Popover open={icdOpen} onOpenChange={setIcdOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-9',
                  !form.kodeICD10 && 'text-muted-foreground'
                )}
              />
            }
          >
            {form.kodeICD10
              ? `${form.kodeICD10} — ${form.deskripsiICD10}`
              : 'Cari kode ICD-10...'}
          </PopoverTrigger>
          <PopoverContent className="w-[420px] p-0" align="start">
            <div className="p-3 border-b">
              <Input
                value={icdSearch}
                onChange={(e) => setIcdSearch(e.target.value)}
                placeholder="Ketik kode atau diagnosis..."
                autoFocus
                className="h-8 text-sm"
              />
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
              {icdSearch.length < 2 ? (
                <p className="text-xs text-muted-foreground px-3 py-2">Ketik minimal 2 karakter...</p>
              ) : filteredICD.length === 0 ? (
                <p className="text-xs text-muted-foreground px-3 py-2">Tidak ditemukan</p>
              ) : (
                filteredICD.map((d) => (
                  <button
                    key={d.kode}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 flex gap-3 items-start"
                    onClick={() => {
                      onChange({ kodeICD10: d.kode, deskripsiICD10: d.deskripsi })
                      setIcdOpen(false)
                      setIcdSearch('')
                    }}
                  >
                    <span className="font-mono font-semibold text-blue-700 shrink-0 w-14">{d.kode}</span>
                    <span className="text-gray-700 leading-snug">{d.deskripsi}</span>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="FKRTL Tujuan" required>
          <Select
            value={form.fkrtlTujuan}
            onValueChange={(v) => v && onChange({ fkrtlTujuan: v })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Pilih FKRTL..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {FKRTL_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Kode Poli BPJS Tujuan" required>
          <Select
            value={form.kodiPoli}
            onValueChange={(v) => v && onChange({ kodiPoli: v })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Pilih poli..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {POLI_BPJS_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormField>
      </div>
      <FormField label="Alasan Rujukan" required>
        <Textarea
          value={form.alasanRujukan}
          onChange={(e) => onChange({ alasanRujukan: e.target.value })}
          placeholder="Jelaskan alasan pasien perlu dirujuk ke FKRTL tujuan..."
          rows={3}
        />
      </FormField>
    </div>
  )
}

// ─── Build SuratEntry from form ───────────────────────────────────────────────

const buildKonten = (jenis: JenisSurat, form: WizardForm): KontenSurat => {
  switch (jenis) {
    case 'keterangan_dokter':
      return {
        pasienNama: form.pasienNama,
        pasienUsia: form.pasienUsia,
        pasienNIK: form.pasienNIK,
        diagnosis: form.diagnosis,
        keterangan: form.keterangan,
        diperuntukkanUntuk: form.diperuntukkanUntuk,
      } satisfies KontenKeteranganDokter
    case 'keterangan_sehat':
      return {
        pasienNama: form.pasienNama,
        pasienUsia: form.pasienUsia,
        pasienNIK: form.pasienNIK,
        keperluan: form.keperluan,
        catatanKondisiFisik: form.catatanKondisiFisik,
        berlakuHingga: form.berlakuHingga
          ? format(form.berlakuHingga, 'yyyy-MM-dd')
          : '',
      } satisfies KontenKeteranganSehat
    case 'rujukan_eksternal':
      return {
        pasienNama: form.pasienNama,
        pasienUsia: form.pasienUsia,
        faskesTujuan: form.faskesTujuan,
        dokterTujuan: form.dokterTujuan,
        diagnosisUtama: form.diagnosisUtama,
        ringkasanTerapi: form.ringkasanTerapi,
        alasanRujukan: form.alasanRujukan,
      } satisfies KontenRujiukanEksternal
    case 'rujukan_bpjs':
      return {
        pasienNama: form.pasienNama,
        pasienUsia: form.pasienUsia,
        noSEP: form.noSEP,
        kodeICD10: form.kodeICD10,
        deskripsiICD10: form.deskripsiICD10,
        fkrtlTujuan: form.fkrtlTujuan,
        kodiPoli: form.kodiPoli,
        alasanRujukan: form.alasanRujukan,
      } satisfies KontenRujiukanBPJS
  }
}

const buildPreviewEntry = (
  jenis: JenisSurat,
  form: WizardForm,
  dokterNama: string,
  dokterSIP: string,
  dokterId: string
): SuratEntry => ({
  id: 'preview',
  noSurat: '___-____-_____',
  kunjunganId: form.kunjunganId,
  pasienId: form.pasienId,
  pasienNama: form.pasienNama,
  pasienNoRM: form.pasienNoRM,
  dokterId,
  dokterNama,
  dokterSIP,
  jenis,
  konten: buildKonten(jenis, form),
  isFinalized: false,
  createdAt: new Date(),
})

// ─── Validation ───────────────────────────────────────────────────────────────

const validateForm = (jenis: JenisSurat, form: WizardForm): string | null => {
  if (!form.pasienNama.trim()) return 'Nama pasien wajib diisi'
  if (!form.pasienUsia) return 'Usia pasien wajib diisi'

  switch (jenis) {
    case 'keterangan_dokter':
      if (!form.pasienNIK.trim()) return 'NIK wajib diisi'
      if (!form.diagnosis.trim()) return 'Diagnosis wajib diisi'
      if (!form.keterangan.trim()) return 'Keterangan wajib diisi'
      if (!form.diperuntukkanUntuk.trim()) return 'Kolom diperuntukkan wajib diisi'
      break
    case 'keterangan_sehat':
      if (!form.pasienNIK.trim()) return 'NIK wajib diisi'
      if (!form.keperluan) return 'Keperluan wajib dipilih'
      if (!form.catatanKondisiFisik.trim()) return 'Catatan kondisi fisik wajib diisi'
      if (!form.berlakuHingga) return 'Tanggal berlaku wajib dipilih'
      break
    case 'rujukan_eksternal':
      if (!form.faskesTujuan) return 'Faskes tujuan wajib dipilih'
      if (!form.dokterTujuan.trim()) return 'Dokter tujuan wajib diisi'
      if (!form.diagnosisUtama.trim()) return 'Diagnosis utama wajib diisi'
      if (!form.ringkasanTerapi.trim()) return 'Ringkasan terapi wajib diisi'
      if (!form.alasanRujukan.trim()) return 'Alasan rujukan wajib diisi'
      break
    case 'rujukan_bpjs':
      if (!form.noSEP.trim()) return 'No. SEP wajib diisi'
      if (!form.kodeICD10) return 'Kode ICD-10 wajib dipilih'
      if (!form.fkrtlTujuan) return 'FKRTL tujuan wajib dipilih'
      if (!form.kodiPoli) return 'Kode poli tujuan wajib dipilih'
      if (!form.alasanRujukan.trim()) return 'Alasan rujukan wajib diisi'
      break
  }
  return null
}

// ─── Main Wizard Component ────────────────────────────────────────────────────

export const WizardSurat = () => {
  const router = useRouter()
  const { tambahSurat, finalisasi } = useSuratStore()
  const { kunjunganList } = useAntrianStore()
  const { user } = useAuthStore()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [jenis, setJenis] = useState<JenisSurat | null>(null)
  const [form, setForm] = useState<WizardForm>(EMPTY_FORM)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [isFinalized, setIsFinalized] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Resolve doctor info from auth user
  const dokterInfo = mockDokter.find((d) => d.nama === user?.nama) ??
    mockDokter.find((d) => d.id === 'dok-001')!
  const dokterNama = dokterInfo.nama
  const dokterSIP = dokterInfo.nomorSIP
  const dokterId = dokterInfo.id

  const handleFormChange = useCallback((updates: Partial<WizardForm>) => {
    setForm((prev) => ({ ...prev, ...updates }))
    setFormError(null)
  }, [])

  const handleStep1Next = () => {
    if (!jenis) {
      toast.error('Pilih jenis surat terlebih dahulu')
      return
    }
    setStep(2)
  }

  const handleStep2Next = () => {
    if (!jenis) return
    const err = validateForm(jenis, form)
    if (err) {
      setFormError(err)
      toast.error(err)
      return
    }
    // Save draft entry to store when entering preview
    if (!savedId) {
      const id = tambahSurat({
        kunjunganId: form.kunjunganId,
        pasienId: form.pasienId,
        pasienNama: form.pasienNama,
        pasienNoRM: form.pasienNoRM,
        dokterId,
        dokterNama,
        dokterSIP,
        jenis,
        konten: buildKonten(jenis, form),
      })
      setSavedId(id)
    }
    setStep(3)
  }

  const handleFinalisasi = () => {
    if (!savedId) return
    finalisasi(savedId)
    setIsFinalized(true)
    setShowConfirm(false)
    toast.success('Surat berhasil difinalisasi', {
      description: 'Surat tidak dapat diubah setelah difinalisasi.',
    })
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    await new Promise((r) => setTimeout(r, 1500))
    setIsPrinting(false)
    toast.success('Dokumen siap dicetak', {
      description: `Surat ${jenis} telah disiapkan untuk dicetak.`,
    })
  }

  // Build preview entry
  const previewEntry: SuratEntry | null = jenis
    ? buildPreviewEntry(jenis, form, dokterNama, dokterSIP, dokterId)
    : null

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => (step === 1 ? router.push('/surat-rujukan') : setStep((s) => (s - 1) as 1 | 2 | 3))}
        >
          <ArrowLeftIcon className="size-4" />
          {step === 1 ? 'Kembali ke Daftar' : 'Kembali'}
        </Button>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-lg font-bold">Buat Surat Baru</h1>
      </div>

      {/* Step Indicator */}
      <StepIndicator current={step} />

      {/* ── STEP 1 ─────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-6 pb-6">
            <Step1PilihJenis selected={jenis} onSelect={setJenis} />
            <div className="flex justify-end mt-6">
              <Button onClick={handleStep1Next} disabled={!jenis} className="gap-2">
                Lanjutkan
                <ArrowRightIcon className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 2 ─────────────────────────────────────────────────────────── */}
      {step === 2 && jenis && (
        <Card>
          <CardContent className="pt-6 pb-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold">Isi Formulir Surat</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {jenis === 'keterangan_dokter' && 'Surat Keterangan Dokter'}
                {jenis === 'keterangan_sehat' && 'Surat Keterangan Sehat'}
                {jenis === 'rujukan_eksternal' && 'Surat Rujukan Eksternal'}
                {jenis === 'rujukan_bpjs' && 'Surat Rujukan BPJS'}
              </p>
            </div>

            {/* Kunjungan selector */}
            <KunjunganSelector
              form={form}
              kunjunganList={kunjunganList}
              onChange={handleFormChange}
            />

            {/* Conditional form */}
            {jenis === 'keterangan_dokter' && (
              <FormKeteranganDokter form={form} onChange={handleFormChange} />
            )}
            {jenis === 'keterangan_sehat' && (
              <FormKeteranganSehat form={form} onChange={handleFormChange} />
            )}
            {jenis === 'rujukan_eksternal' && (
              <FormRujiukanEksternal form={form} onChange={handleFormChange} />
            )}
            {jenis === 'rujukan_bpjs' && (
              <FormRujiukanBPJS form={form} onChange={handleFormChange} />
            )}

            {formError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <XIcon className="size-3.5 shrink-0" />
                {formError}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeftIcon className="size-4" />
                Kembali
              </Button>
              <Button onClick={handleStep2Next} className="gap-2">
                Lihat Preview
                <ArrowRightIcon className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 3 ─────────────────────────────────────────────────────────── */}
      {step === 3 && jenis && previewEntry && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Preview & Finalisasi</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Periksa isi surat sebelum difinalisasi. Setelah final, surat tidak dapat diubah.
                  </p>
                </div>
                {isFinalized && (
                  <Badge
                    variant="outline"
                    className="bg-emerald-100 text-emerald-700 border-emerald-300 gap-1.5"
                  >
                    <LockIcon className="size-3" />
                    Sudah Difinalisasi
                  </Badge>
                )}
              </div>

              {/* Letter preview */}
              <div className="bg-gray-50 rounded-xl p-4 overflow-y-auto max-h-[600px]">
                <TemplateSurat
                  surat={{
                    ...previewEntry,
                    isFinalized,
                    finalizedAt: isFinalized ? new Date() : undefined,
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={isFinalized}
                  className="gap-2"
                >
                  <ArrowLeftIcon className="size-4" />
                  Edit Formulir
                </Button>

                <div className="flex gap-2">
                  {!isFinalized ? (
                    <Button
                      onClick={() => setShowConfirm(true)}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <LockIcon className="size-4" />
                      Finalisasi Surat
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/surat-rujukan')}
                      >
                        Lihat Daftar Surat
                      </Button>
                      <Button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className="gap-2"
                      >
                        {isPrinting ? (
                          <>
                            <Loader2Icon className="size-4 animate-spin" />
                            Menyiapkan...
                          </>
                        ) : (
                          <>
                            <PrinterIcon className="size-4" />
                            Cetak / Unduh PDF
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Confirm Finalisasi Dialog ──────────────────────────────────────── */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LockIcon className="size-5 text-amber-600" />
              Finalisasi Surat?
            </DialogTitle>
            <DialogDescription>
              Setelah difinalisasi, surat <strong>tidak dapat diubah</strong> kembali.
              Pastikan semua data sudah benar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Batalkan
            </Button>
            <Button
              onClick={handleFinalisasi}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2Icon className="size-4" />
              Ya, Finalisasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
