'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  ClipboardListIcon,
  EyeIcon,
  FileCheckIcon,
  FileTextIcon,
  FilterIcon,
  HeartPulseIcon,
  HospitalIcon,
  Loader2Icon,
  PlusIcon,
  PrinterIcon,
  ShieldCheckIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { TemplateSurat } from '@/components/features/surat/template-surat'
import { useSuratStore, type SuratEntry } from '@/store/surat-store'
import { useAuthStore } from '@/store/auth-store'
import { STATUS_SURAT } from '@/lib/constants/status'
import { cn } from '@/lib/utils'
import type { JenisSurat } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTanggal = (date: Date) =>
  format(new Date(date), 'd MMM yyyy · HH:mm', { locale: idLocale })

type FilterJenis = 'semua' | JenisSurat

const JENIS_LABEL: Record<JenisSurat, string> = {
  keterangan_dokter: 'Ket. Dokter',
  keterangan_sehat: 'Ket. Sehat',
  rujukan_eksternal: 'Rujukan Eksternal',
  rujukan_bpjs: 'Rujukan BPJS',
}

const JENIS_ICON: Record<JenisSurat, React.ReactNode> = {
  keterangan_dokter: <ClipboardListIcon className="size-3.5" />,
  keterangan_sehat: <HeartPulseIcon className="size-3.5" />,
  rujukan_eksternal: <HospitalIcon className="size-3.5" />,
  rujukan_bpjs: <ShieldCheckIcon className="size-3.5" />,
}

const JENIS_COLOR: Record<JenisSurat, string> = {
  keterangan_dokter: 'bg-blue-50 text-blue-700 border-blue-200',
  keterangan_sehat: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rujukan_eksternal: 'bg-purple-50 text-purple-700 border-purple-200',
  rujukan_bpjs: 'bg-teal-50 text-teal-700 border-teal-200',
}

// ─── Stats cards ──────────────────────────────────────────────────────────────

const StatsBar = ({ suratList }: { suratList: SuratEntry[] }) => {
  const total = suratList.length
  const final = suratList.filter((s) => s.isFinalized).length
  const draft = total - final

  const byJenis = {
    keterangan_dokter: suratList.filter((s) => s.jenis === 'keterangan_dokter').length,
    keterangan_sehat: suratList.filter((s) => s.jenis === 'keterangan_sehat').length,
    rujukan: suratList.filter(
      (s) => s.jenis === 'rujukan_eksternal' || s.jenis === 'rujukan_bpjs'
    ).length,
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total Surat', value: total, color: 'text-foreground' },
        { label: 'Final', value: final, color: 'text-emerald-700' },
        { label: 'Draft', value: draft, color: 'text-gray-500' },
        {
          label: 'Rujukan',
          value: byJenis.rujukan,
          color: 'text-purple-700',
        },
      ].map(({ label, value, color }) => (
        <Card key={label} className="py-3">
          <CardContent className="px-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn('text-2xl font-bold mt-0.5', color)}>{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ isFinalized }: { isFinalized: boolean }) => {
  const status = isFinalized ? 'final' : 'draft'
  const cfg = STATUS_SURAT[status]
  return (
    <Badge variant="outline" className={cn('text-xs gap-1', cfg.className)}>
      {isFinalized && <FileCheckIcon className="size-3" />}
      {cfg.label}
    </Badge>
  )
}

// ─── Jenis badge ─────────────────────────────────────────────────────────────

const JenisBadge = ({ jenis }: { jenis: JenisSurat }) => (
  <Badge
    variant="outline"
    className={cn('text-xs gap-1 whitespace-nowrap', JENIS_COLOR[jenis])}
  >
    {JENIS_ICON[jenis]}
    {JENIS_LABEL[jenis]}
  </Badge>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SuratRujukanPage() {
  const router = useRouter()
  const { suratList } = useSuratStore()
  const { user } = useAuthStore()

  const [filterJenis, setFilterJenis] = useState<FilterJenis>('semua')
  const [viewEntry, setViewEntry] = useState<SuratEntry | null>(null)
  const [printingId, setPrintingId] = useState<string | null>(null)

  const isDokter = user?.role === 'dokter'

  const filtered =
    filterJenis === 'semua'
      ? suratList
      : suratList.filter((s) => s.jenis === filterJenis)

  const handlePrint = async (surat: SuratEntry) => {
    if (!surat.isFinalized) {
      toast.error('Hanya surat yang sudah difinalisasi yang dapat dicetak')
      return
    }
    setPrintingId(surat.id)
    await new Promise((r) => setTimeout(r, 1500))
    setPrintingId(null)
    toast.success('Dokumen siap dicetak', {
      description: `${surat.noSurat} — ${surat.pasienNama}.pdf`,
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100">
            <FileTextIcon className="size-5 text-indigo-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Surat & Rujukan</h1>
            <p className="text-sm text-muted-foreground">
              {suratList.length} surat tercatat — {suratList.filter((s) => s.isFinalized).length} sudah difinalisasi
            </p>
          </div>
        </div>

        {isDokter && (
          <Button
            onClick={() => router.push('/surat-rujukan/baru')}
            className="gap-2"
          >
            <PlusIcon className="size-4" />
            Buat Surat Baru
          </Button>
        )}
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <StatsBar suratList={suratList} />

      {/* ── Table card ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardListIcon className="size-4 text-muted-foreground" />
              Daftar Surat
              {filterJenis !== 'semua' && (
                <Badge variant="secondary" className="text-xs">
                  {filtered.length} hasil
                </Badge>
              )}
            </CardTitle>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <FilterIcon className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Filter jenis:</span>
              <Select
                value={filterJenis}
                onValueChange={(v) => v && setFilterJenis(v as FilterJenis)}
              >
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="semua">Semua Jenis</SelectItem>
                    <SelectItem value="keterangan_dokter">Ket. Dokter</SelectItem>
                    <SelectItem value="keterangan_sehat">Ket. Sehat</SelectItem>
                    <SelectItem value="rujukan_eksternal">Rujukan Eksternal</SelectItem>
                    <SelectItem value="rujukan_bpjs">Rujukan BPJS</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-semibold">No. Surat</TableHead>
                  <TableHead className="text-xs font-semibold">Pasien</TableHead>
                  <TableHead className="text-xs font-semibold">Jenis Surat</TableHead>
                  <TableHead className="text-xs font-semibold">Tanggal</TableHead>
                  <TableHead className="text-xs font-semibold">Dokter</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-14 text-muted-foreground">
                      <FileTextIcon className="size-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Tidak ada surat ditemukan</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((surat) => (
                    <TableRow key={surat.id} className="hover:bg-muted/30">
                      {/* No. Surat */}
                      <TableCell className="text-xs font-mono font-semibold">
                        {surat.noSurat}
                      </TableCell>

                      {/* Pasien */}
                      <TableCell>
                        <div className="text-sm font-medium">{surat.pasienNama}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {surat.pasienNoRM}
                        </div>
                      </TableCell>

                      {/* Jenis */}
                      <TableCell>
                        <JenisBadge jenis={surat.jenis} />
                      </TableCell>

                      {/* Tanggal */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTanggal(surat.createdAt)}
                        </span>
                        {surat.isFinalized && surat.finalizedAt && (
                          <div className="text-[10px] text-emerald-600 mt-0.5">
                            Final: {formatTanggal(surat.finalizedAt)}
                          </div>
                        )}
                      </TableCell>

                      {/* Dokter */}
                      <TableCell>
                        <span className="text-sm">{surat.dokterNama}</span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge isFinalized={surat.isFinalized} />
                      </TableCell>

                      {/* Aksi */}
                      <TableCell>
                        {printingId === surat.id ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2Icon className="size-3.5 animate-spin" />
                            Mencetak...
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => setViewEntry(surat)}
                            >
                              <EyeIcon className="size-3.5" />
                              Lihat
                            </Button>
                            {surat.isFinalized && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => handlePrint(surat)}
                              >
                                <PrinterIcon className="size-3.5" />
                                Cetak
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Preview Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={!!viewEntry} onOpenChange={(open) => !open && setViewEntry(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileTextIcon className="size-5 text-indigo-600" />
              {viewEntry?.noSurat}
              {viewEntry?.isFinalized && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-300 text-xs gap-1"
                >
                  <FileCheckIcon className="size-3" />
                  Final — Read Only
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {viewEntry && (
            <div className="mt-2">
              <TemplateSurat surat={viewEntry} />
              {viewEntry.isFinalized && (
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => handlePrint(viewEntry)}
                    disabled={printingId === viewEntry.id}
                    className="gap-2"
                  >
                    {printingId === viewEntry.id ? (
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
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
