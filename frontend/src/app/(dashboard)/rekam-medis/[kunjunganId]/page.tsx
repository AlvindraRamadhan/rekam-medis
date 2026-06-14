'use client'

import { use, useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { format, differenceInYears } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClipboardListIcon,
  DownloadIcon,
  FileTextIcon,
  HeartPulseIcon,
  Loader2Icon,
  LockIcon,
  PencilLineIcon,
  PhoneIcon,
  PlusIcon,
  RotateCcwIcon,
  SaveIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

import { mockICD10 } from '@/data/mock/icd10'
import { mockKunjungan } from '@/data/mock/kunjungan'
import { mockRekamMedis } from '@/data/mock/rekam-medis'
import { useAntrianStore } from '@/store/antrian-store'
import { useAuthStore } from '@/store/auth-store'
import { useRekamMedisStore, type SOAPFormData } from '@/store/rekam-medis-store'
import { cn } from '@/lib/utils'
import type { DiagnosisICD10, TindakanMedis, Kunjungan } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTanggal = (date: Date) =>
  format(new Date(date), 'd MMMM yyyy', { locale: idLocale })

const formatWaktuLengkap = (date: Date) =>
  format(new Date(date), 'd MMM yyyy · HH:mm', { locale: idLocale })

const hitungUmur = (tanggalLahir: Date) =>
  differenceInYears(new Date(), new Date(tanggalLahir))

const labelKesadaran: Record<string, string> = {
  composmentis: 'Composmentis',
  apatis: 'Apatis',
  somnolen: 'Somnolen',
  stupor: 'Stupor',
  koma: 'Koma',
}

const labelKondisiKeluar: Record<string, string> = {
  sembuh: 'Sembuh',
  membaik: 'Membaik',
  belum_sembuh: 'Belum Sembuh',
  meninggal: 'Meninggal',
}

const labelJenisRencana: Record<string, string> = {
  medikamentosa: 'Medikamentosa',
  non_medikamentosa: 'Non-Medikamentosa',
  rujukan: 'Rujukan',
  observasi: 'Observasi',
}

// ─── ICD-10 Combobox ──────────────────────────────────────────────────────────

interface ICD10ComboboxProps {
  value: DiagnosisICD10 | null
  onSelect: (val: DiagnosisICD10 | null) => void
  placeholder?: string
  disabled?: boolean
  isError?: boolean
}

const ICD10Combobox = ({
  value,
  onSelect,
  placeholder = 'Cari kode ICD-10...',
  disabled = false,
  isError = false,
}: ICD10ComboboxProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal',
              isError && 'border-red-500 ring-1 ring-red-400',
              !value && 'text-muted-foreground'
            )}
          />
        }
      >
        {value ? (
          <span className="truncate text-left">
            <span className="font-mono font-semibold text-emerald-700">{value.kode}</span>
            {' — '}
            {value.deskripsi}
          </span>
        ) : (
          placeholder
        )}
        <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[480px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari kode atau deskripsi..." />
          <CommandList>
            <CommandEmpty>Kode ICD-10 tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {mockICD10.map((d) => (
                <CommandItem
                  key={d.kode}
                  value={`${d.kode} ${d.deskripsi}`}
                  onSelect={() => {
                    onSelect(value?.kode === d.kode ? null : d)
                    setOpen(false)
                  }}
                  data-checked={value?.kode === d.kode}
                >
                  <span className="font-mono font-semibold text-emerald-700 w-16 shrink-0">
                    {d.kode}
                  </span>
                  <span className="ml-2 text-sm">{d.deskripsi}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ─── Panel Kiri: Profil Pasien ────────────────────────────────────────────────

interface ProfilCardProps {
  kunjungan: Kunjungan
}

const ProfilCard = ({ kunjungan }: ProfilCardProps) => {
  const { pasien } = kunjungan
  const umur = hitungUmur(pasien.tanggalLahir)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <UserIcon className="size-4 text-emerald-600" />
          Profil Pasien
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 text-sm">
        <div>
          <p className="text-lg font-semibold text-foreground leading-tight">{pasien.nama}</p>
          <p className="font-mono text-xs text-muted-foreground">{pasien.noRM}</p>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div>
            <p className="text-xs text-muted-foreground">Umur</p>
            <p className="font-medium">{umur} tahun</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Jenis Kelamin</p>
            <p className="font-medium">{pasien.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gol. Darah</p>
            <p className="font-medium">{pasien.golonganDarah}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">No. WA</p>
            <p className="font-medium flex items-center gap-1">
              <PhoneIcon className="size-3 text-muted-foreground" />
              {pasien.noTelepon}
            </p>
          </div>
        </div>

        {/* BPJS */}
        {pasien.bpjs ? (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-2.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheckIcon className="size-3.5 text-blue-600" />
              <p className="text-xs font-semibold text-blue-700">BPJS Aktif</p>
            </div>
            <p className="font-mono text-xs text-blue-800">{pasien.bpjs.noKartu}</p>
            <p className="text-xs text-blue-600">{pasien.bpjs.jenisKepesertaan}</p>
            {kunjungan.noSEP && (
              <div className="pt-1 border-t border-blue-200">
                <p className="text-xs text-muted-foreground">No. SEP</p>
                <p className="font-mono text-xs text-blue-800">{kunjungan.noSEP}</p>
              </div>
            )}
          </div>
        ) : (
          <Badge variant="secondary" className="text-xs">Umum (Non-BPJS)</Badge>
        )}

        {/* IHS Number */}
        {pasien.ihsNumber && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 flex items-center gap-2">
            <ZapIcon className="size-3.5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs text-emerald-600 font-medium">SatuSehat IHS</p>
              <p className="font-mono text-xs text-emerald-800">{pasien.ihsNumber}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Panel Kiri: Alergi ────────────────────────────────────────────────────────

const severityColor: Record<string, string> = {
  ringan: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  sedang: 'bg-orange-100 text-orange-700 border-orange-200',
  berat: 'bg-red-100 text-red-700 border-red-200',
}

const AlergiCard = ({ kunjungan }: ProfilCardProps) => {
  const { alergi } = kunjungan.pasien
  const hasAlergi = alergi.length > 0

  return (
    <Card className={cn(hasAlergi && 'border-red-300 shadow-red-100 shadow-sm')}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          'flex items-center gap-2 text-sm font-semibold',
          hasAlergi ? 'text-red-700' : 'text-foreground'
        )}>
          <AlertTriangleIcon className={cn('size-4', hasAlergi ? 'text-red-500' : 'text-muted-foreground')} />
          Alergi
          {hasAlergi && (
            <Badge className="ml-auto bg-red-100 text-red-700 border-red-200">
              {alergi.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {hasAlergi ? (
          <ul className="space-y-2">
            {alergi.map((a) => (
              <li key={a.id} className="rounded-lg bg-red-50 border border-red-200 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-red-800">{a.namaAlergen}</p>
                  <Badge
                    variant="outline"
                    className={cn('text-xs capitalize', severityColor[a.severity])}
                  >
                    {a.severity}
                  </Badge>
                </div>
                <p className="text-xs text-red-600">{a.reaksi}</p>
                <p className="text-xs text-muted-foreground capitalize">{a.jenisAlergi}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-xs py-1">Tidak ada alergi tercatat</p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Panel Kiri: Data Screening ────────────────────────────────────────────────

const ScreeningCard = ({ kunjungan }: ProfilCardProps) => {
  const scr = kunjungan.screening

  if (!scr) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <HeartPulseIcon className="size-4 text-emerald-600" />
            Data Screening
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Belum ada data screening dari perawat.</p>
        </CardContent>
      </Card>
    )
  }

  const nyeriColor =
    scr.skalaNyeri <= 3
      ? 'bg-green-100 text-green-700'
      : scr.skalaNyeri <= 6
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <HeartPulseIcon className="size-4 text-emerald-600" />
          Data Screening
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {format(new Date(scr.tanggalWaktu), 'HH:mm')}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Vital signs grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'TD', value: `${scr.tekananDarahSistolik}/${scr.tekananDarahDiastolik}`, unit: 'mmHg' },
            { label: 'Nadi', value: scr.nadiPerMenit, unit: 'x/mnt' },
            { label: 'Suhu', value: scr.suhuCelsius, unit: '°C' },
            { label: 'SpO₂', value: scr.saturasi, unit: '%' },
            { label: 'BB', value: scr.beratBadan, unit: 'kg' },
            { label: 'TB', value: scr.tinggiBadan, unit: 'cm' },
            { label: 'BMI', value: scr.bmi, unit: '' },
          ].map(({ label, value, unit }) => (
            <div key={label} className="rounded-md bg-muted/60 px-2 py-1.5">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-semibold text-foreground text-sm">
                {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
              </p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Keluhan */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Keluhan Utama</p>
          <p className="font-medium leading-snug">{scr.keluhanUtama}</p>
        </div>

        {/* Skala Nyeri */}
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">Skala Nyeri</p>
          <Badge className={cn('text-xs', nyeriColor)}>
            {scr.skalaNyeri}/10
          </Badge>
        </div>

        {/* Kesadaran */}
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">Kesadaran</p>
          <Badge variant="outline" className="text-xs">
            {labelKesadaran[scr.tingkatKesadaran]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Panel Kiri: Riwayat Kunjungan ───────────────────────────────────────────

const RiwayatCard = ({ kunjungan }: ProfilCardProps) => {
  const { kunjunganList } = useAntrianStore()

  const pasienKunjunganIds = [...kunjunganList, ...mockKunjungan]
    .filter((k) => k.pasienId === kunjungan.pasienId && k.id !== kunjungan.id)
    .map((k) => k.id)

  const riwayatRM = mockRekamMedis
    .filter((rm) => pasienKunjunganIds.includes(rm.kunjunganId) && rm.isFinalized)
    .sort((a, b) => new Date(b.tanggalWaktu).getTime() - new Date(a.tanggalWaktu).getTime())
    .slice(0, 5)

  const enriched = riwayatRM.map((rm) => {
    const knj = [...kunjunganList, ...mockKunjungan].find((k) => k.id === rm.kunjunganId)
    return { rm, knj }
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <RotateCcwIcon className="size-4 text-emerald-600" />
          Riwayat Kunjungan
          <Badge variant="secondary" className="ml-auto text-xs">5 terakhir</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {enriched.length === 0 ? (
          <p className="px-6 pb-4 text-xs text-muted-foreground">Belum ada riwayat kunjungan sebelumnya.</p>
        ) : (
          <Accordion className="px-3 pb-3">
            {enriched.map(({ rm, knj }, idx) => (
              <AccordionItem key={rm.id} value={rm.id} className="border-none">
                <AccordionTrigger className="py-2 text-xs hover:no-underline">
                  <div className="flex flex-col items-start gap-0.5 text-left min-w-0 pr-2">
                    <span className="font-medium text-foreground">
                      {formatTanggal(rm.tanggalWaktu)}
                    </span>
                    <span className="text-muted-foreground truncate max-w-full">
                      {knj?.dokter.nama ?? '—'}
                    </span>
                    <span className="font-mono text-[11px] text-emerald-700">
                      {rm.diagnosisUtama.kode}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <div className="rounded-lg bg-muted/60 p-2.5 space-y-2 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">
                        {rm.diagnosisUtama.kode} — {rm.diagnosisUtama.deskripsi}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">S:</p>
                      <p className="text-foreground leading-snug line-clamp-2">
                        {rm.keluhanSubjektif}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">A:</p>
                      <p className="text-foreground">
                        {rm.diagnosisUtama.deskripsi}
                        {rm.diagnosisSekunder.length > 0 && `, ${rm.diagnosisSekunder[0].deskripsi}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">P:</p>
                      <p className="text-foreground leading-snug line-clamp-2">
                        {rm.rencanaNonMediamentosa || rm.rencanaMediamentosa}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        rm.kondisiKeluar === 'sembuh'
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : rm.kondisiKeluar === 'meninggal'
                          ? 'border-gray-200 bg-gray-100 text-gray-600'
                          : 'border-blue-200 bg-blue-50 text-blue-700'
                      )}
                    >
                      {labelKondisiKeluar[rm.kondisiKeluar]}
                    </Badge>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Seksi S — Subjective ─────────────────────────────────────────────────────

interface SeksiProps {
  form: SOAPFormData
  onChange: <K extends keyof SOAPFormData>(field: K, value: SOAPFormData[K]) => void
  locked: boolean
}

const SeksiSubjective = ({ form, onChange, locked }: SeksiProps) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
          S
        </span>
        <span>Subjective</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {[
        {
          id: 'keluhanSubjektif',
          label: 'Keluhan Subjektif',
          placeholder: 'Keluhan utama yang disampaikan pasien...',
          rows: 3,
        },
        {
          id: 'riwayatPenyakitSekarang',
          label: 'Riwayat Penyakit Sekarang',
          placeholder: 'Deskripsi perjalanan penyakit, onset, durasi, kualitas...',
          rows: 3,
        },
        {
          id: 'riwayatPenyakitDahulu',
          label: 'Riwayat Penyakit Dahulu',
          placeholder: 'Riwayat penyakit, operasi, alergi obat sebelumnya...',
          rows: 2,
        },
        {
          id: 'riwayatPenyakitKeluarga',
          label: 'Riwayat Penyakit Keluarga',
          placeholder: 'DM, hipertensi, jantung, kanker dalam keluarga...',
          rows: 2,
        },
      ].map(({ id, label, placeholder, rows }) => (
        <div key={id} className="space-y-1.5">
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
          <Textarea
            id={id}
            rows={rows}
            placeholder={placeholder}
            value={(form[id as keyof SOAPFormData] as string) ?? ''}
            readOnly={locked}
            disabled={locked}
            onChange={(e) => onChange(id as keyof SOAPFormData, e.target.value as never)}
            className={cn('resize-y', locked && 'bg-muted cursor-not-allowed opacity-80')}
          />
        </div>
      ))}
    </CardContent>
  </Card>
)

// ─── Seksi O — Objective ──────────────────────────────────────────────────────

const SeksiObjective = ({ form, onChange, locked, kunjungan }: SeksiProps & { kunjungan: Kunjungan }) => {
  const scr = kunjungan.screening

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            O
          </span>
          <span>Objective</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tanda Vital (read-only dari screening) */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Tanda Vital
            <span className="ml-2 text-xs font-normal text-muted-foreground">(dari screening perawat)</span>
          </Label>
          {scr ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 rounded-lg border bg-muted/40 p-3">
              {[
                { label: 'TD', value: `${scr.tekananDarahSistolik}/${scr.tekananDarahDiastolik} mmHg` },
                { label: 'Nadi', value: `${scr.nadiPerMenit} x/mnt` },
                { label: 'Suhu', value: `${scr.suhuCelsius} °C` },
                { label: 'SpO₂', value: `${scr.saturasi}%` },
                { label: 'BB/TB', value: `${scr.beratBadan}kg / ${scr.tinggiBadan}cm` },
                { label: 'BMI', value: `${scr.bmi}` },
                { label: 'Kesadaran', value: labelKesadaran[scr.tingkatKesadaran] },
                { label: 'Nyeri', value: `${scr.skalaNyeri}/10` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Data screening belum tersedia</p>
            </div>
          )}
        </div>

        {/* Pemeriksaan Fisik */}
        <div className="space-y-1.5">
          <Label htmlFor="pemeriksaanFisik" className="text-sm font-medium">
            Pemeriksaan Fisik
          </Label>
          <Textarea
            id="pemeriksaanFisik"
            rows={6}
            placeholder="Kepala: normocepal, Mata: konjungtiva anemis -/-, sklera ikterik -/-&#10;Thorax: cor BJ I/II reguler, murmur (-), pulmo vesikuler, ronki (-), wheezing (-)&#10;Abdomen: soepel, bising usus normal, hepar/lien tidak teraba&#10;Ekstremitas: akral hangat, edema (-/-), CRT < 2 detik"
            value={form.pemeriksaanFisik}
            readOnly={locked}
            disabled={locked}
            onChange={(e) => onChange('pemeriksaanFisik', e.target.value)}
            className={cn('resize-y', locked && 'bg-muted cursor-not-allowed opacity-80')}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Seksi A — Assessment ─────────────────────────────────────────────────────

interface SeksiAssessmentProps extends SeksiProps {
  diagnosisError: boolean
}

const SeksiAssessment = ({ form, onChange, locked, diagnosisError }: SeksiAssessmentProps) => {
  const handleAddSekunder = () => {
    if (form.diagnosisSekunder.length >= 5) {
      toast.warning('Maksimal 5 diagnosis sekunder')
      return
    }
    onChange('diagnosisSekunder', [
      ...form.diagnosisSekunder,
      { kode: '', deskripsi: '' },
    ])
  }

  const handleUpdateSekunder = (idx: number, val: DiagnosisICD10 | null) => {
    const updated = [...form.diagnosisSekunder]
    if (val) {
      updated[idx] = val
    } else {
      updated.splice(idx, 1)
    }
    onChange('diagnosisSekunder', updated)
  }

  const handleRemoveSekunder = (idx: number) => {
    const updated = form.diagnosisSekunder.filter((_, i) => i !== idx)
    onChange('diagnosisSekunder', updated)
  }

  const handleAddTindakan = () => {
    onChange('tindakanMedis', [
      ...form.tindakanMedis,
      { kode: '', deskripsi: '' },
    ])
  }

  const handleUpdateTindakan = (idx: number, field: 'kode' | 'deskripsi', val: string) => {
    const updated = form.tindakanMedis.map((t, i) =>
      i === idx ? { ...t, [field]: val } : t
    )
    onChange('tindakanMedis', updated)
  }

  const handleRemoveTindakan = (idx: number) => {
    onChange('tindakanMedis', form.tindakanMedis.filter((_, i) => i !== idx))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
            A
          </span>
          <span>Assessment</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Diagnosis Utama */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">
              Diagnosis Utama
            </Label>
            <Badge className="text-[10px] bg-red-100 text-red-700 border-red-200">
              Wajib
            </Badge>
            {!form.diagnosisUtama && !locked && (
              <Badge variant="destructive" className="text-[10px] animate-pulse">
                Belum diisi
              </Badge>
            )}
          </div>
          <ICD10Combobox
            value={form.diagnosisUtama}
            onSelect={(val) => onChange('diagnosisUtama', val)}
            placeholder="Pilih diagnosis utama (ICD-10)..."
            disabled={locked}
            isError={diagnosisError && !form.diagnosisUtama}
          />
          {diagnosisError && !form.diagnosisUtama && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertTriangleIcon className="size-3" />
              Diagnosis utama harus diisi sebelum finalisasi
            </p>
          )}
        </div>

        {/* Diagnosis Sekunder */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Diagnosis Sekunder
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({form.diagnosisSekunder.length}/5)
              </span>
            </Label>
            {!locked && form.diagnosisSekunder.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSekunder}
                className="h-7 text-xs"
              >
                <PlusIcon className="size-3.5" />
                Tambah
              </Button>
            )}
          </div>
          {form.diagnosisSekunder.map((d, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="flex-1">
                <ICD10Combobox
                  value={d.kode ? d : null}
                  onSelect={(val) => handleUpdateSekunder(idx, val)}
                  placeholder={`Diagnosis sekunder ${idx + 1}...`}
                  disabled={locked}
                />
              </div>
              {!locked && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 text-muted-foreground hover:text-red-600"
                  onClick={() => handleRemoveSekunder(idx)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Tindakan Medis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Tindakan Medis</Label>
              <p className="text-xs text-muted-foreground">ICD-9-CM/ICOPIM — untuk klaim tindakan BPJS</p>
            </div>
            {!locked && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTindakan}
                className="h-7 text-xs"
              >
                <PlusIcon className="size-3.5" />
                Tambah
              </Button>
            )}
          </div>
          {form.tindakanMedis.length === 0 && (
            <p className="text-xs text-muted-foreground">Belum ada tindakan medis ditambahkan.</p>
          )}
          {form.tindakanMedis.map((t, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                placeholder="Kode (mis. 89.01)"
                value={t.kode}
                readOnly={locked}
                disabled={locked}
                onChange={(e) => handleUpdateTindakan(idx, 'kode', e.target.value)}
                className="w-32 shrink-0 font-mono text-sm"
              />
              <Input
                placeholder="Deskripsi tindakan..."
                value={t.deskripsi}
                readOnly={locked}
                disabled={locked}
                onChange={(e) => handleUpdateTindakan(idx, 'deskripsi', e.target.value)}
                className="flex-1 text-sm"
              />
              {!locked && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 text-muted-foreground hover:text-red-600"
                  onClick={() => handleRemoveTindakan(idx)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              )}
            </div>
          ))}
          {form.tindakanMedis.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Data ini digunakan untuk klaim tindakan ke BPJS
            </p>
          )}
        </div>

        <Separator />

        {/* Kondisi Keluar */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Kondisi Keluar Pasien</Label>
          <RadioGroup
            value={form.kondisiKeluar}
            onValueChange={(val) => !locked && onChange('kondisiKeluar', val as SOAPFormData['kondisiKeluar'])}
            className="grid grid-cols-2 gap-2 w-full"
          >
            {(['sembuh', 'membaik', 'belum_sembuh', 'meninggal'] as const).map((v) => (
              <label
                key={v}
                htmlFor={`kondisi-${v}`}
                className={cn(
                  'flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors text-sm',
                  form.kondisiKeluar === v
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'hover:bg-muted/60',
                  locked && 'cursor-not-allowed opacity-80'
                )}
              >
                <RadioGroupItem id={`kondisi-${v}`} value={v} disabled={locked} />
                {labelKondisiKeluar[v]}
              </label>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Seksi P — Plan ───────────────────────────────────────────────────────────

const SeksiPlan = ({ form, onChange, locked, onResepClick }: SeksiProps & { onResepClick?: () => void }) => {
  const toggleJenis = (jenis: SOAPFormData['jenisRencana'][number]) => {
    if (locked) return
    const current = form.jenisRencana
    const next = current.includes(jenis)
      ? current.filter((j) => j !== jenis)
      : [...current, jenis]
    onChange('jenisRencana', next)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
            P
          </span>
          <span>Plan</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Jenis Rencana */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Jenis Rencana</Label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: 'medikamentosa', label: 'Medikamentosa' },
                { value: 'non_medikamentosa', label: 'Non-Medikamentosa' },
                { value: 'rujukan', label: 'Rujukan' },
                { value: 'observasi', label: 'Observasi' },
              ] as const
            ).map(({ value, label }) => (
              <label
                key={value}
                htmlFor={`rencana-${value}`}
                className={cn(
                  'flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors text-sm',
                  form.jenisRencana.includes(value)
                    ? 'border-purple-400 bg-purple-50 text-purple-700'
                    : 'hover:bg-muted/60',
                  locked && 'cursor-not-allowed opacity-80'
                )}
              >
                <Checkbox
                  id={`rencana-${value}`}
                  checked={form.jenisRencana.includes(value)}
                  onCheckedChange={() => toggleJenis(value)}
                  disabled={locked}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Rencana Medikamentosa */}
        {form.jenisRencana.includes('medikamentosa') && (
          <div className="space-y-1.5 rounded-lg border border-purple-200 bg-purple-50/50 p-3">
            <Label className="text-sm font-medium text-purple-800">Rencana Medikamentosa</Label>
            <Textarea
              rows={3}
              placeholder="Daftar obat yang akan diberikan..."
              value={form.rencanaMedikamentosa}
              readOnly={locked}
              disabled={locked}
              onChange={(e) => onChange('rencanaMedikamentosa', e.target.value)}
              className={cn('bg-white resize-y', locked && 'bg-muted cursor-not-allowed opacity-80')}
            />
            {!locked && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-purple-300 text-purple-700"
                onClick={onResepClick}
              >
                <FileTextIcon className="size-3.5" />
                Lanjutkan ke Resep Elektronik
              </Button>
            )}
          </div>
        )}

        {/* Rencana Non-Medikamentosa */}
        {form.jenisRencana.includes('non_medikamentosa') && (
          <div className="space-y-1.5 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
            <Label className="text-sm font-medium text-blue-800">Rencana Non-Medikamentosa</Label>
            <Textarea
              rows={3}
              placeholder="Istirahat total 3 hari, fisioterapi, diet khusus..."
              value={form.rencanaNonMedikamentosa}
              readOnly={locked}
              disabled={locked}
              onChange={(e) => onChange('rencanaNonMedikamentosa', e.target.value)}
              className={cn('bg-white resize-y', locked && 'bg-muted cursor-not-allowed opacity-80')}
            />
          </div>
        )}

        {/* Surat Rujukan */}
        {form.jenisRencana.includes('rujukan') && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-2">
            <Label className="text-sm font-medium text-amber-800">Rujukan</Label>
            <p className="text-xs text-amber-700">
              Pasien akan dirujuk ke fasilitas kesehatan yang lebih tinggi.
            </p>
            <Button variant="outline" size="sm" className="h-7 text-xs border-amber-300 text-amber-700">
              <FileTextIcon className="size-3.5" />
              Buat Surat Rujukan
            </Button>
          </div>
        )}

        {/* Observasi */}
        {form.jenisRencana.includes('observasi') && (
          <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
            <Label className="text-sm font-medium text-green-800">Observasi</Label>
            <p className="mt-1 text-xs text-green-700">
              Pasien dalam observasi — pantau kondisi secara berkala.
            </p>
          </div>
        )}

        <Separator />

        {/* Catatan Diet */}
        <div className="space-y-1.5">
          <Label htmlFor="catatanDiet" className="text-sm font-medium">Catatan Diet</Label>
          <Textarea
            id="catatanDiet"
            rows={2}
            placeholder="Diet yang dianjurkan, pembatasan makanan, suplemen..."
            value={form.catatanDiet}
            readOnly={locked}
            disabled={locked}
            onChange={(e) => onChange('catatanDiet', e.target.value)}
            className={cn('resize-y', locked && 'bg-muted cursor-not-allowed opacity-80')}
          />
        </div>

        {/* Edukasi Pasien */}
        <div className="space-y-1.5">
          <Label htmlFor="edukasiPasien" className="text-sm font-medium">Edukasi Pasien</Label>
          <Textarea
            id="edukasiPasien"
            rows={3}
            placeholder="Informasi yang diberikan ke pasien: cara minum obat, gaya hidup, kapan kontrol..."
            value={form.edukasiPasien}
            readOnly={locked}
            disabled={locked}
            onChange={(e) => onChange('edukasiPasien', e.target.value)}
            className={cn('resize-y', locked && 'bg-muted cursor-not-allowed opacity-80')}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Dialog Finalisasi ────────────────────────────────────────────────────────

interface FinalisasiDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

const FinalisasiDialog = ({ open, onOpenChange, onConfirm }: FinalisasiDialogProps) => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  const triggerShake = useCallback(() => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (pin !== '123456') {
      setError('PIN tidak valid. Coba lagi.')
      triggerShake()
      setPin('')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    onConfirm()
    onOpenChange(false)
    setPin('')
    setError('')
  }, [pin, onConfirm, onOpenChange, triggerShake])

  useEffect(() => {
    if (pin.length === 6) {
      handleConfirm()
    }
  }, [pin, handleConfirm])

  const handleClose = () => {
    if (loading) return
    setPin('')
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockIcon className="size-5 text-emerald-600" />
            Finalisasi Rekam Medis
          </DialogTitle>
          <DialogDescription className="text-left">
            Setelah difinalisasi, data tidak dapat diubah. Gunakan addendum untuk koreksi di kemudian hari.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            <p className="font-medium">Perhatian!</p>
            <p className="text-xs mt-0.5">
              Pastikan semua data SOAP sudah benar sebelum finalisasi.
              Tindakan ini bersifat permanen.
            </p>
          </div>

          <div className={cn('space-y-3', shake && 'animate-shake')}>
            <Label className="text-sm font-medium block">Masukkan PIN 6 Digit</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={pin}
                onChange={setPin}
                disabled={loading}
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className={cn('size-11 text-base', error && 'border-red-400 bg-red-50')}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && (
              <p className="text-center text-sm text-red-600 font-medium">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Batal
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleConfirm}
            disabled={pin.length !== 6 || loading}
          >
            {loading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <LockIcon className="size-4" />
            )}
            Finalisasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Dialog Addendum ──────────────────────────────────────────────────────────

interface AddendumDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (isi: string) => void
}

const AddendumDialog = ({ open, onOpenChange, onSubmit }: AddendumDialogProps) => {
  const [isi, setIsi] = useState('')

  const handleSubmit = () => {
    if (!isi.trim()) {
      toast.error('Isi addendum tidak boleh kosong')
      return
    }
    onSubmit(isi.trim())
    setIsi('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilLineIcon className="size-5 text-amber-600" />
            Tambah Addendum
          </DialogTitle>
          <DialogDescription>
            Addendum digunakan untuk koreksi atau tambahan informasi pada rekam medis yang sudah difinalisasi.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label className="text-sm font-medium">Isi Addendum</Label>
          <Textarea
            rows={5}
            placeholder="Tulis koreksi atau tambahan informasi..."
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { setIsi(''); onOpenChange(false) }}>
            Batal
          </Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={handleSubmit}
          >
            <PencilLineIcon className="size-4" />
            Simpan Addendum
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RekamMedisPage({
  params,
}: {
  params: Promise<{ kunjunganId: string }>
}) {
  const { kunjunganId } = use(params)
  const router = useRouter()
  const { user } = useAuthStore()
  const { kunjunganList, updateStatus } = useAntrianStore()
  const { entries, initEntry, updateField, saveDraft, finalize, addAddendum } = useRekamMedisStore()

  const [isFinalisasiOpen, setIsFinalisasiOpen] = useState(false)
  const [isAddendumOpen, setIsAddendumOpen] = useState(false)
  const [diagnosisError, setDiagnosisError] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  // Resolve kunjungan
  const kunjungan =
    kunjunganList.find((k) => k.id === kunjunganId) ??
    mockKunjungan.find((k) => k.id === kunjunganId)

  // Initialize SOAP form from store
  useEffect(() => {
    if (kunjungan) {
      initEntry(kunjunganId, kunjungan)
    }
  }, [kunjunganId, kunjungan, initEntry])

  const form = entries[kunjunganId]

  // Navigation: find ordered list of diperiksa patients
  const allToday = [...kunjunganList, ...mockKunjungan]
    .filter((k, i, arr) => arr.findIndex((x) => x.id === k.id) === i)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const currentIdx = allToday.findIndex((k) => k.id === kunjunganId)
  const prevKunjungan = currentIdx > 0 ? allToday[currentIdx - 1] : null
  const nextKunjungan = currentIdx < allToday.length - 1 ? allToday[currentIdx + 1] : null

  const handleFieldChange = useCallback(
    <K extends keyof SOAPFormData>(field: K, value: SOAPFormData[K]) => {
      updateField(kunjunganId, field, value)
    },
    [kunjunganId, updateField]
  )

  const handleSaveDraft = () => {
    saveDraft(kunjunganId)
    toast.success('Draft berhasil disimpan', { description: 'Data SOAP tersimpan sebagai draft.' })
  }

  const handleFinalisasiClick = () => {
    if (!form?.diagnosisUtama) {
      setDiagnosisError(true)
      toast.error('Diagnosis utama belum diisi', {
        description: 'Pilih setidaknya satu diagnosis utama (ICD-10) sebelum finalisasi.',
        duration: 4000,
      })
      document.getElementById('diagnosis-utama-section')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    setDiagnosisError(false)
    setIsFinalisasiOpen(true)
  }

  const handleFinalisasiConfirm = () => {
    finalize(kunjunganId, user?.nama ?? 'Dokter')
    updateStatus(kunjunganId, 'selesai')
    toast.success('Rekam Medis berhasil difinalisasi', {
      description: 'Data terkirim ke SatuSehat. Status kunjungan diperbarui ke Selesai.',
      duration: 5000,
    })
  }

  const handleAddAddendum = (isi: string) => {
    addAddendum(kunjunganId, isi, user?.id ?? 'dok-001')
    toast.success('Addendum berhasil ditambahkan')
  }

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    setPdfLoading(false)
    toast.success('Rekam Medis PDF berhasil diunduh', {
      description: `RM_${kunjungan?.pasien.noRM}_${format(new Date(), 'yyyyMMdd')}.pdf`,
    })
  }

  // Loading state
  if (!kunjungan || !form) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-60 w-full rounded-xl" />
            <Skeleton className="h-60 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  const locked = form.isFinalized

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Header Navigasi ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/antrian')}
              className="shrink-0"
            >
              <ArrowLeftIcon className="size-4" />
              Antrian
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{kunjungan.pasien.nama}</p>
              <p className="text-xs text-muted-foreground">
                {kunjungan.noAntrian} · {kunjungan.poli}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:block">
              Pasien ke {currentIdx + 1} dari {allToday.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!prevKunjungan}
              onClick={() => prevKunjungan && router.push(`/rekam-medis/${prevKunjungan.id}`)}
            >
              <ArrowLeftIcon className="size-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!nextKunjungan}
              onClick={() => nextKunjungan && router.push(`/rekam-medis/${nextKunjungan.id}`)}
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Banner Finalisasi ────────────────────────────────────────────────── */}
      {locked && (
        <div className="bg-emerald-600 text-white px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="size-5 shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">Rekam Medis Difinalisasi</span>
              {' — '}
              <span>{form.finalizedBy}</span>
              {form.finalizedAt && (
                <span> · {formatWaktuLengkap(form.finalizedAt)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {form.satuSehatSynced && (
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                <ZapIcon className="size-3 mr-1" />
                Terkirim ke SatuSehat
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white h-8"
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
            >
              {pdfLoading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <DownloadIcon className="size-4" />
              )}
              Unduh PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white h-8"
              onClick={() => setIsAddendumOpen(true)}
            >
              <PencilLineIcon className="size-4" />
              Tambah Addendum
            </Button>
          </div>
        </div>
      )}

      {/* ── Main Layout ──────────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 pb-28">
        {/* ── Panel Kiri ──────────────────────────────────────────────────────── */}
        <div className="space-y-4 lg:sticky lg:top-[120px] lg:self-start lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto">
          <ProfilCard kunjungan={kunjungan} />
          <AlergiCard kunjungan={kunjungan} />
          <ScreeningCard kunjungan={kunjungan} />
          <RiwayatCard kunjungan={kunjungan} />
        </div>

        {/* ── Panel Kanan: Form SOAP ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <SeksiSubjective form={form} onChange={handleFieldChange} locked={locked} />
          <SeksiObjective form={form} onChange={handleFieldChange} locked={locked} kunjungan={kunjungan} />

          <div id="diagnosis-utama-section">
            <SeksiAssessment
              form={form}
              onChange={handleFieldChange}
              locked={locked}
              diagnosisError={diagnosisError}
            />
          </div>

          <SeksiPlan
            form={form}
            onChange={handleFieldChange}
            locked={locked}
            onResepClick={() => router.push(`/resep/${kunjunganId}`)}
          />

          {/* Addendum list */}
          {form.addendum && form.addendum.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <PencilLineIcon className="size-4 text-amber-600" />
                  Addendum
                  <Badge variant="outline" className="ml-auto text-xs">
                    {form.addendum.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.addendum.map((add) => (
                  <div
                    key={add.id}
                    className="border-l-4 border-amber-400 bg-amber-50 pl-4 pr-3 py-3 rounded-r-lg space-y-1"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-amber-800">
                        {user?.role === 'dokter' ? user.nama : 'Dokter'}
                      </span>
                      <span>·</span>
                      <span>{formatWaktuLengkap(add.timestamp)}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{add.isi}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Floating Action Bar ──────────────────────────────────────────────── */}
      {!locked && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur px-6 py-3">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {form.isDraft && (
                <Badge variant="secondary" className="text-xs">
                  <SaveIcon className="size-3 mr-1" />
                  Draft tersimpan
                </Badge>
              )}
              {!form.diagnosisUtama && (
                <Badge variant="outline" className="text-xs border-red-200 text-red-600">
                  <AlertTriangleIcon className="size-3 mr-1" />
                  Diagnosis utama belum diisi
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="gap-2"
              >
                <SaveIcon className="size-4" />
                Simpan Draft
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                onClick={handleFinalisasiClick}
              >
                <LockIcon className="size-4" />
                Finalisasi Rekam Medis
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dialogs ──────────────────────────────────────────────────────────── */}
      <FinalisasiDialog
        open={isFinalisasiOpen}
        onOpenChange={setIsFinalisasiOpen}
        onConfirm={handleFinalisasiConfirm}
      />
      <AddendumDialog
        open={isAddendumOpen}
        onOpenChange={setIsAddendumOpen}
        onSubmit={handleAddAddendum}
      />
    </div>
  )
}
