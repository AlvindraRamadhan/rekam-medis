'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  AlertTriangleIcon,
  ClipboardListIcon,
  EyeIcon,
  FilterIcon,
  Loader2Icon,
  PillIcon,
  PrinterIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'

import { useResepStore, type ResepEntry } from '@/store/resep-store'
import { STATUS_RESEP } from '@/lib/constants/status'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTanggal = (date: Date) =>
  format(new Date(date), 'd MMM yyyy · HH:mm', { locale: idLocale })

// ─── Stats Cards ──────────────────────────────────────────────────────────────

const StatsBar = ({ resepList }: { resepList: ResepEntry[] }) => {
  const counts = {
    total: resepList.length,
    ditulis: resepList.filter((r) => r.status === 'ditulis').length,
    disiapkan: resepList.filter((r) => r.status === 'disiapkan').length,
    diserahkan: resepList.filter((r) => r.status === 'diserahkan').length,
    retry: resepList.filter((r) => r.retryPending).length,
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total Resep', value: counts.total, color: 'text-foreground' },
        { label: 'Ditulis', value: counts.ditulis, color: 'text-blue-700' },
        { label: 'Disiapkan', value: counts.disiapkan, color: 'text-amber-700' },
        { label: 'Diserahkan', value: counts.diserahkan, color: 'text-emerald-700' },
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

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: ResepEntry['status'] }) => {
  const cfg = STATUS_RESEP[status]
  return (
    <Badge variant="outline" className={cn('text-xs', cfg.className)}>
      {cfg.label}
    </Badge>
  )
}

// ─── Row Actions ─────────────────────────────────────────────────────────────

const RowActions = ({ resep, onView, onPrint }: {
  resep: ResepEntry
  onView: () => void
  onPrint: () => void
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={onView}>
        <EyeIcon className="size-3.5" />
        Lihat Detail
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs gap-1"
        onClick={onPrint}
      >
        <PrinterIcon className="size-3.5" />
        Cetak
      </Button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FilterStatus = 'semua' | 'ditulis' | 'disiapkan' | 'diserahkan'

export default function ResepPage() {
  const router = useRouter()
  const { resepList, setRetryPending } = useResepStore()

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('semua')
  const [printingId, setPrintingId] = useState<string | null>(null)

  const filtered =
    filterStatus === 'semua' ? resepList : resepList.filter((r) => r.status === filterStatus)

  const handleView = (resep: ResepEntry) => {
    router.push(`/resep/${resep.kunjunganId}`)
  }

  const handlePrint = async (resep: ResepEntry) => {
    setPrintingId(resep.id)
    await new Promise((r) => setTimeout(r, 1500))
    setPrintingId(null)
    toast.success('Resep berhasil dicetak', {
      description: `${resep.noResep}_${resep.pasienNama.replace(/\s/g, '_')}.pdf`,
    })
  }

  const handleRetry = async (resep: ResepEntry) => {
    await new Promise((r) => setTimeout(r, 1500))
    const isSuccess = Math.random() > 0.3
    if (isSuccess) {
      setRetryPending(resep.id, false)
      toast.success('Resep berhasil dikirim ulang ke farmasi')
    } else {
      toast.error('Retry gagal. Akan dicoba kembali secara otomatis.')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-100">
            <PillIcon className="size-5 text-purple-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Resep Elektronik</h1>
            <p className="text-sm text-muted-foreground">
              Kelola semua resep — {resepList.length} resep tercatat hari ini
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <StatsBar resepList={resepList} />

      {/* ── Retry pending alerts ──────────────────────────────────────────── */}
      {resepList.some((r) => r.retryPending) && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <ShieldAlertIcon className="size-4" />
            Resep Menunggu Retry ke Farmasi
          </div>
          {resepList
            .filter((r) => r.retryPending)
            .map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-amber-700">
                  {r.noResep} · {r.pasienNama}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-amber-400 text-amber-800 hover:bg-amber-100 gap-1"
                  onClick={() => handleRetry(r)}
                >
                  <RefreshCwIcon className="size-3" />
                  Retry Sekarang
                </Button>
              </div>
            ))}
        </div>
      )}

      {/* ── Table Card ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardListIcon className="size-4 text-muted-foreground" />
              Daftar Resep
              {filterStatus !== 'semua' && (
                <Badge variant="secondary" className="text-xs">
                  {filtered.length} hasil
                </Badge>
              )}
            </CardTitle>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <FilterIcon className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Filter status:</span>
              <Select
                value={filterStatus}
                onValueChange={(v) => v && setFilterStatus(v as FilterStatus)}
              >
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="semua">Semua Status</SelectItem>
                    <SelectItem value="ditulis">Ditulis</SelectItem>
                    <SelectItem value="disiapkan">Disiapkan</SelectItem>
                    <SelectItem value="diserahkan">Diserahkan</SelectItem>
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
                  <TableHead className="text-xs font-semibold">No. Resep</TableHead>
                  <TableHead className="text-xs font-semibold">Pasien</TableHead>
                  <TableHead className="text-xs font-semibold">Dokter</TableHead>
                  <TableHead className="text-xs font-semibold">Tanggal</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Item</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <ClipboardListIcon className="size-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Tidak ada resep ditemukan</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((resep) => (
                    <TableRow key={resep.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-mono">
                        <div className="space-y-1">
                          <span>{resep.noResep}</span>
                          {resep.retryPending && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-amber-50 text-amber-700 border-amber-300 block w-fit"
                            >
                              Retry pending
                            </Badge>
                          )}
                          {resep.isBPJS && (
                            <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 block w-fit">
                              BPJS
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm font-medium">{resep.pasienNama}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {resep.pasienNoRM}
                        </div>
                        {resep.items.some((i) => i.adaKonflikAlergi) && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-700 mt-0.5">
                            <AlertTriangleIcon className="size-3" />
                            Ada override alergi
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="text-sm">{resep.dokterNama}</span>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTanggal(resep.createdAt)}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-xs tabular-nums">
                          {resep.items.length}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={resep.status} />
                      </TableCell>

                      <TableCell>
                        {printingId === resep.id ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2Icon className="size-3.5 animate-spin" />
                            Mencetak...
                          </div>
                        ) : (
                          <RowActions
                            resep={resep}
                            onView={() => handleView(resep)}
                            onPrint={() => handlePrint(resep)}
                          />
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
    </div>
  )
}
