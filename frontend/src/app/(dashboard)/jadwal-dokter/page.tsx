'use client'

import { useMemo, useState } from 'react'
import {
  CalendarDaysIcon,
  ListIcon,
  PlusIcon,
  StethoscopeIcon,
  SunIcon,
  SunMediumIcon,
  SunsetIcon,
  UsersIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-header'
import { FormJadwal } from '@/components/features/jadwal/form-jadwal'
import { useAuthStore } from '@/store/auth-store'
import { useJadwalStore } from '@/store/jadwal-store'
import { mockDokter } from '@/data/mock/dokter'
import { cn } from '@/lib/utils'
import type { JadwalDokter } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const HARI_ORDER = [
  'senin',
  'selasa',
  'rabu',
  'kamis',
  'jumat',
  'sabtu',
  'minggu',
] as const

const HARI_SHORT: Record<JadwalDokter['hari'], string> = {
  senin: 'Sen',
  selasa: 'Sel',
  rabu: 'Rab',
  kamis: 'Kam',
  jumat: 'Jum',
  sabtu: 'Sab',
  minggu: 'Min',
}

const HARI_FULL: Record<JadwalDokter['hari'], string> = {
  senin: 'Senin',
  selasa: 'Selasa',
  rabu: 'Rabu',
  kamis: 'Kamis',
  jumat: 'Jumat',
  sabtu: 'Sabtu',
  minggu: 'Minggu',
}

const SESI_ORDER = ['pagi', 'siang', 'sore'] as const

const SESI_LABEL: Record<JadwalDokter['sesi'], string> = {
  pagi: 'Pagi',
  siang: 'Siang',
  sore: 'Sore',
}

const HARI_MAP: Record<number, JadwalDokter['hari']> = {
  0: 'minggu',
  1: 'senin',
  2: 'selasa',
  3: 'rabu',
  4: 'kamis',
  5: 'jumat',
  6: 'sabtu',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCapacityColors = (terisi: number, maks: number) => {
  const ratio = maks > 0 ? terisi / maks : 0
  if (ratio >= 0.9)
    return {
      bar: 'bg-red-500',
      text: 'text-red-600',
      badgeCn: 'border-red-200 bg-red-100 text-red-700',
    }
  if (ratio >= 0.7)
    return {
      bar: 'bg-yellow-500',
      text: 'text-yellow-600',
      badgeCn: 'border-yellow-200 bg-yellow-100 text-yellow-800',
    }
  return {
    bar: 'bg-emerald-500',
    text: 'text-emerald-600',
    badgeCn: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  }
}

// ─── Weekly Grid Cell ─────────────────────────────────────────────────────────

interface JadwalCellProps {
  jadwal?: JadwalDokter
  hari: JadwalDokter['hari']
  sesi: JadwalDokter['sesi']
  isAdmin: boolean
  isLastRow: boolean
  isLastCol: boolean
  onClick: () => void
}

const JadwalCell = ({
  jadwal,
  isAdmin,
  isLastRow,
  isLastCol,
  onClick,
}: JadwalCellProps) => {
  if (!jadwal) {
    return (
      <div
        className={cn(
          'flex min-h-[110px] items-center justify-center border-b border-r bg-background',
          isLastRow && 'border-b-0',
          isLastCol && 'border-r-0',
          isAdmin && 'cursor-pointer transition-colors hover:bg-muted/40'
        )}
        onClick={isAdmin ? onClick : undefined}
        role={isAdmin ? 'button' : undefined}
        tabIndex={isAdmin ? 0 : undefined}
        onKeyDown={isAdmin ? (e) => e.key === 'Enter' && onClick() : undefined}
        aria-label={isAdmin ? 'Tambah jadwal' : undefined}
      >
        {isAdmin ? (
          <span className="text-[11px] text-muted-foreground/40 select-none">
            + Tambah
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground/25 select-none">—</span>
        )}
      </div>
    )
  }

  const terisi = jadwal.pasienTerisi ?? 0
  const maks = jadwal.kapasitasMaksimal
  const ratio = maks > 0 ? terisi / maks : 0
  const isFull = terisi >= maks
  const colors = getCapacityColors(terisi, maks)

  return (
    <div
      className={cn(
        'flex min-h-[110px] flex-col gap-1.5 border-b border-r p-2',
        isLastRow && 'border-b-0',
        isLastCol && 'border-r-0',
        jadwal.isLibur ? 'bg-muted/30' : 'bg-background',
        isAdmin && 'cursor-pointer transition-colors hover:bg-muted/20'
      )}
      onClick={isAdmin ? onClick : undefined}
      role={isAdmin ? 'button' : undefined}
      tabIndex={isAdmin ? 0 : undefined}
      onKeyDown={isAdmin ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Status badge */}
      {jadwal.isLibur ? (
        <Badge
          variant="outline"
          className="w-fit border-gray-200 bg-gray-100 px-1.5 text-[10px] text-gray-500"
        >
          Libur
        </Badge>
      ) : isFull ? (
        <Badge
          variant="outline"
          className="w-fit border-red-200 bg-red-100 px-1.5 text-[10px] text-red-700"
        >
          Penuh
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="w-fit border-emerald-200 bg-emerald-100 px-1.5 text-[10px] text-emerald-700"
        >
          Tersedia
        </Badge>
      )}

      {/* Time */}
      <p
        className={cn(
          'text-[11px] font-medium leading-tight',
          jadwal.isLibur ? 'text-muted-foreground/50' : 'text-foreground'
        )}
      >
        {jadwal.jamMulai}–{jadwal.jamSelesai}
      </p>

      {/* Capacity */}
      {!jadwal.isLibur && (
        <>
          <p className={cn('text-[11px]', colors.text)}>
            {terisi}/{maks} pasien
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all', colors.bar)}
              style={{ width: `${Math.min(ratio * 100, 100)}%` }}
            />
          </div>
        </>
      )}

      {/* Libur note */}
      {jadwal.isLibur && jadwal.keteranganLibur && (
        <p className="truncate text-[10px] italic text-muted-foreground/60">
          {jadwal.keteranganLibur}
        </p>
      )}
    </div>
  )
}

// ─── Weekly Grid ──────────────────────────────────────────────────────────────

interface WeeklyGridProps {
  filteredJadwal: JadwalDokter[]
  isAdmin: boolean
  onCellClick: (hari: JadwalDokter['hari'], sesi: JadwalDokter['sesi']) => void
}

const WeeklyGrid = ({ filteredJadwal, isAdmin, onCellClick }: WeeklyGridProps) => {
  const todayHari = HARI_MAP[new Date().getDay()]

  const getJadwal = (hari: JadwalDokter['hari'], sesi: JadwalDokter['sesi']) =>
    filteredJadwal.find((j) => j.hari === hari && j.sesi === sesi)

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <div className="grid min-w-[720px] grid-cols-[72px_repeat(7,1fr)]">
        {/* Corner */}
        <div className="border-b border-r bg-muted/60 p-2" />

        {/* Day headers */}
        {HARI_ORDER.map((hari, idx) => (
          <div
            key={hari}
            className={cn(
              'border-b border-r p-2 text-center',
              idx === HARI_ORDER.length - 1 && 'border-r-0',
              hari === todayHari
                ? 'bg-primary/10 text-primary'
                : 'bg-muted/60 text-muted-foreground'
            )}
          >
            <p className="text-xs font-semibold">{HARI_SHORT[hari]}</p>
            {hari === todayHari && (
              <p className="mt-0.5 text-[9px] font-normal">Hari ini</p>
            )}
          </div>
        ))}

        {/* Sesi rows */}
        {SESI_ORDER.map((sesi, sesiIdx) =>
          [
            // Sesi label cell
            <div
              key={`label-${sesi}`}
              className={cn(
                'flex items-center justify-center border-b border-r bg-muted/30 p-2',
                sesiIdx === SESI_ORDER.length - 1 && 'border-b-0'
              )}
            >
              <span
                className={cn(
                  '-rotate-90 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'
                )}
              >
                {SESI_LABEL[sesi]}
              </span>
            </div>,
            // Day cells for this sesi
            ...HARI_ORDER.map((hari, hariIdx) => (
              <JadwalCell
                key={`${hari}-${sesi}`}
                jadwal={getJadwal(hari, sesi)}
                hari={hari}
                sesi={sesi}
                isAdmin={isAdmin}
                isLastRow={sesiIdx === SESI_ORDER.length - 1}
                isLastCol={hariIdx === HARI_ORDER.length - 1}
                onClick={() => onCellClick(hari, sesi)}
              />
            )),
          ]
        )}
      </div>
    </div>
  )
}

// ─── Daily Card ───────────────────────────────────────────────────────────────

interface DailyCardProps {
  sesi: JadwalDokter['sesi']
  jadwal?: JadwalDokter
  isAdmin: boolean
  onClick: () => void
}

const SesiIcon = ({ sesi }: { sesi: JadwalDokter['sesi'] }) => {
  if (sesi === 'pagi') return <SunIcon className="size-5" />
  if (sesi === 'siang') return <SunMediumIcon className="size-5" />
  return <SunsetIcon className="size-5" />
}

const SESI_COLORS: Record<JadwalDokter['sesi'], string> = {
  pagi: 'bg-yellow-100 text-yellow-700',
  siang: 'bg-blue-100 text-blue-700',
  sore: 'bg-orange-100 text-orange-700',
}

const DailyCard = ({ sesi, jadwal, isAdmin, onClick }: DailyCardProps) => {
  const terisi = jadwal?.pasienTerisi ?? 0
  const maks = jadwal?.kapasitasMaksimal ?? 0
  const ratio = maks > 0 ? terisi / maks : 0
  const isFull = maks > 0 && terisi >= maks
  const colors = jadwal && !jadwal.isLibur ? getCapacityColors(terisi, maks) : null

  return (
    <Card
      className={cn(
        'transition-shadow',
        jadwal?.isLibur && 'opacity-70',
        isAdmin && jadwal && 'cursor-pointer hover:shadow-md',
        isAdmin && !jadwal && 'cursor-pointer border-dashed hover:border-primary/40 hover:bg-muted/20'
      )}
      onClick={isAdmin ? onClick : undefined}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: icon + title */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-xl',
                SESI_COLORS[sesi]
              )}
            >
              <SesiIcon sesi={sesi} />
            </div>
            <div>
              <p className="font-semibold text-foreground">Sesi {SESI_LABEL[sesi]}</p>
              {jadwal ? (
                <p className="text-sm text-muted-foreground">
                  {jadwal.jamMulai} – {jadwal.jamSelesai}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/50">Belum ada jadwal</p>
              )}
            </div>
          </div>

          {/* Right: status badge */}
          <div className="shrink-0">
            {!jadwal && isAdmin && (
              <Badge variant="outline" className="border-dashed text-xs">
                + Tambah
              </Badge>
            )}
            {jadwal?.isLibur && (
              <Badge
                variant="outline"
                className="border-gray-200 bg-gray-100 text-gray-600"
              >
                Libur
              </Badge>
            )}
            {jadwal && !jadwal.isLibur && isFull && (
              <Badge
                variant="outline"
                className="border-red-200 bg-red-100 text-red-700"
              >
                Penuh
              </Badge>
            )}
            {jadwal && !jadwal.isLibur && !isFull && (
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-100 text-emerald-700"
              >
                Tersedia
              </Badge>
            )}
          </div>
        </div>

        {/* Capacity bar */}
        {jadwal && !jadwal.isLibur && (
          <div className="mt-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Kapasitas terisi</span>
              <span className={cn('font-semibold', colors?.text)}>
                {terisi} / {maks} pasien
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full transition-all', colors?.bar)}
                style={{ width: `${Math.min(ratio * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(ratio * 100)}% terisi</span>
              <span>Sisa {Math.max(maks - terisi, 0)} slot</span>
            </div>
          </div>
        )}

        {/* Libur note */}
        {jadwal?.isLibur && jadwal.keteranganLibur && (
          <div className="mt-3 rounded-lg bg-muted/60 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Keterangan:</span> {jadwal.keteranganLibur}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Daily Timeline ───────────────────────────────────────────────────────────

interface DailyTimelineProps {
  filteredJadwal: JadwalDokter[]
  selectedHari: JadwalDokter['hari']
  onHariChange: (hari: JadwalDokter['hari']) => void
  isAdmin: boolean
  onCellClick: (hari: JadwalDokter['hari'], sesi: JadwalDokter['sesi']) => void
}

const DailyTimeline = ({
  filteredJadwal,
  selectedHari,
  onHariChange,
  isAdmin,
  onCellClick,
}: DailyTimelineProps) => {
  const todayHari = HARI_MAP[new Date().getDay()]

  return (
    <div className="flex flex-col gap-4">
      {/* Day selector */}
      <div className="flex flex-wrap gap-1.5">
        {HARI_ORDER.map((hari) => (
          <button
            key={hari}
            type="button"
            onClick={() => onHariChange(hari)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              selectedHari === hari
                ? 'border-primary bg-primary text-primary-foreground'
                : hari === todayHari
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground hover:bg-muted/50'
            )}
          >
            {HARI_FULL[hari]}
            {hari === todayHari && selectedHari !== hari && (
              <span className="ml-1 text-[10px] opacity-70">(Hari ini)</span>
            )}
          </button>
        ))}
      </div>

      {/* Session cards */}
      <div className="flex flex-col gap-3">
        {SESI_ORDER.map((sesi) => {
          const jadwal = filteredJadwal.find(
            (j) => j.hari === selectedHari && j.sesi === sesi
          )
          return (
            <DailyCard
              key={sesi}
              sesi={sesi}
              jadwal={jadwal}
              isAdmin={isAdmin}
              onClick={() => onCellClick(selectedHari, sesi)}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Dokter Summary Strip ─────────────────────────────────────────────────────

interface DokterSummaryProps {
  filteredJadwal: JadwalDokter[]
}

const DokterSummary = ({ filteredJadwal }: DokterSummaryProps) => {
  const todayHari = HARI_MAP[new Date().getDay()]
  const todayJadwal = filteredJadwal.filter((j) => j.hari === todayHari && !j.isLibur)
  const totalPasienHariIni = todayJadwal.reduce((s, j) => s + (j.pasienTerisi ?? 0), 0)
  const sesiAktif = todayJadwal.length
  const totalJadwalMingguan = filteredJadwal.filter((j) => !j.isLibur).length

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        {
          label: 'Pasien Hari Ini',
          value: totalPasienHariIni,
          icon: UsersIcon,
          color: 'text-primary',
        },
        {
          label: 'Sesi Aktif Hari Ini',
          value: sesiAktif,
          icon: StethoscopeIcon,
          color: 'text-emerald-600',
        },
        {
          label: 'Total Jadwal Mingguan',
          value: totalJadwalMingguan,
          icon: CalendarDaysIcon,
          color: 'text-blue-600',
        },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Icon className={cn('size-4', color)} />
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          <p className={cn('mt-1 text-3xl font-bold', color)}>{value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JadwalDokterPage() {
  const { user } = useAuthStore()
  const { jadwalList } = useJadwalStore()

  const isAdmin = user?.role === 'admin'
  const isDokter = user?.role === 'dokter'

  // Map dokter auth user to mock dokter entity (match by nama)
  const currentDokter = isDokter
    ? mockDokter.find((d) => d.nama === user?.nama)
    : null

  const [selectedDokterId, setSelectedDokterId] = useState<string>(
    () => (isAdmin ? mockDokter[0]?.id ?? '' : currentDokter?.id ?? '')
  )

  const [viewMode, setViewMode] = useState<'mingguan' | 'harian'>('mingguan')
  const [selectedHari, setSelectedHari] = useState<JadwalDokter['hari']>(
    () => HARI_MAP[new Date().getDay()] ?? 'senin'
  )

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogEditTarget, setDialogEditTarget] = useState<JadwalDokter | undefined>()
  const [dialogDefaultHari, setDialogDefaultHari] = useState<
    JadwalDokter['hari'] | undefined
  >()
  const [dialogDefaultSesi, setDialogDefaultSesi] = useState<
    JadwalDokter['sesi'] | undefined
  >()

  const filteredJadwal = useMemo(
    () => jadwalList.filter((j) => j.dokterId === selectedDokterId),
    [jadwalList, selectedDokterId]
  )

  const selectedDokterObj = mockDokter.find((d) => d.id === selectedDokterId)

  const handleCellClick = (
    hari: JadwalDokter['hari'],
    sesi: JadwalDokter['sesi']
  ) => {
    if (!isAdmin) return
    const jadwal = filteredJadwal.find((j) => j.hari === hari && j.sesi === sesi)
    setDialogEditTarget(jadwal)
    setDialogDefaultHari(hari)
    setDialogDefaultSesi(sesi)
    setDialogOpen(true)
  }

  const handleAddNew = () => {
    setDialogEditTarget(undefined)
    setDialogDefaultHari(undefined)
    setDialogDefaultSesi(undefined)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setDialogEditTarget(undefined)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Jadwal Dokter"
        subtitle={
          isDokter
            ? `Jadwal saya — ${selectedDokterObj?.spesialisasi ?? 'Dokter'}`
            : 'Kelola jadwal praktik dan kapasitas per sesi'
        }
        action={
          isAdmin ? (
            <Button onClick={handleAddNew}>
              <PlusIcon data-icon="inline-start" />
              Tambah Jadwal
            </Button>
          ) : undefined
        }
      />

      {/* ── Dokter Summary (dokter role only) ───────────────────────────────── */}
      {isDokter && <DokterSummary filteredJadwal={filteredJadwal} />}

      {/* ── Controls ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Label className="shrink-0 text-sm font-medium">Dokter:</Label>
            <Select
              value={selectedDokterId}
              onValueChange={(v) => v && setSelectedDokterId(v)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih dokter..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {mockDokter.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nama}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {selectedDokterObj && (
              <span className="text-sm text-muted-foreground">
                {selectedDokterObj.spesialisasi}
              </span>
            )}
          </div>
        )}

        {/* View toggle */}
        <div className="ml-auto flex items-center gap-1 rounded-lg border p-1">
          <Button
            variant={viewMode === 'mingguan' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('mingguan')}
          >
            <CalendarDaysIcon data-icon="inline-start" />
            Mingguan
          </Button>
          <Button
            variant={viewMode === 'harian' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('harian')}
          >
            <ListIcon data-icon="inline-start" />
            Harian
          </Button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      {viewMode === 'mingguan' ? (
        <WeeklyGrid
          filteredJadwal={filteredJadwal}
          isAdmin={isAdmin}
          onCellClick={handleCellClick}
        />
      ) : (
        <DailyTimeline
          filteredJadwal={filteredJadwal}
          selectedHari={selectedHari}
          onHariChange={setSelectedHari}
          isAdmin={isAdmin}
          onCellClick={handleCellClick}
        />
      )}

      {/* ── Legend ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Kapasitas:</span>
        {[
          { label: '< 70% terisi', dot: 'bg-emerald-500' },
          { label: '70–90% terisi', dot: 'bg-yellow-500' },
          { label: '> 90% / Penuh', dot: 'bg-red-500' },
        ].map(({ label, dot }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', dot)} />
            {label}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          Hari libur
        </div>
      </div>

      {/* ── Form Dialog (admin only) ──────────────────────────────────────────── */}
      {isAdmin && (
        <FormJadwal
          open={dialogOpen}
          onClose={handleCloseDialog}
          editTarget={dialogEditTarget}
          defaultHari={dialogDefaultHari}
          defaultSesi={dialogDefaultSesi}
          defaultDokterId={selectedDokterId}
        />
      )}
    </div>
  )
}
