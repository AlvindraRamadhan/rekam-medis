'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  LayoutDashboardIcon,
  ListIcon,
  PhoneCallIcon,
  PlusIcon,
  StethoscopeIcon,
  UserCheckIcon,
  XIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { useAuthStore } from '@/store/auth-store'
import { useAntrianStore } from '@/store/antrian-store'
import { cn } from '@/lib/utils'
import type { Kunjungan, StatusKunjungan } from '@/types'
import { FormDaftarKunjungan } from '@/components/features/pendaftaran/form-daftar-kunjungan'
import { CheckinPasien } from '@/components/features/pendaftaran/checkin-pasien'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatWaktu = (date: Date) => {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

interface KanbanCardProps {
  kunjungan: Kunjungan
  canPanggil: boolean
  canPeriksa: boolean
  onPanggil: () => void
  onMulaiPeriksa: () => void
  onSelesai: () => void
  onBatal: () => void
}

const KanbanCard = ({
  kunjungan,
  canPanggil,
  canPeriksa,
  onPanggil,
  onMulaiPeriksa,
  onSelesai,
  onBatal,
}: KanbanCardProps) => {
  const isSelesaiOrBatal =
    kunjungan.status === 'selesai' || kunjungan.status === 'batal'

  return (
    <Card className="border bg-card shadow-sm">
      <CardContent className="flex flex-col gap-3 p-4">
        {/* No Antrian + Badges */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-2xl font-bold text-emerald-600">
            {kunjungan.noAntrian}
          </span>
          <div className="flex flex-wrap items-center justify-end gap-1">
            <Badge
              variant="secondary"
              className={cn(
                kunjungan.jenisKunjungan === 'bpjs'
                  ? 'border-blue-200 bg-blue-100 text-blue-700'
                  : 'border-gray-200 bg-gray-100 text-gray-600'
              )}
            >
              {kunjungan.jenisKunjungan === 'bpjs' ? 'BPJS' : 'Umum'}
            </Badge>
            {kunjungan.pasien.alergi.length > 0 && (
              <Badge
                variant="destructive"
                className="border-red-200 bg-red-100 text-red-700"
              >
                <AlertTriangleIcon className="mr-0.5 size-3" />
                Alergi
              </Badge>
            )}
          </div>
        </div>

        {/* Pasien + Dokter */}
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {kunjungan.pasien.nama}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {kunjungan.dokter.nama}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {kunjungan.poli}
          </p>
        </div>

        {/* Status sub-badge for hadir */}
        {kunjungan.status === 'hadir' && (
          <Badge
            variant="outline"
            className="w-fit border-teal-200 bg-teal-100 text-teal-700"
          >
            <CheckIcon className="mr-0.5 size-3" />
            Hadir
          </Badge>
        )}

        {/* Waktu daftar */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ClockIcon className="size-3" />
          <span>{formatWaktu(kunjungan.createdAt)}</span>
        </div>

        {/* Action Buttons */}
        {!isSelesaiOrBatal && (
          <div className="flex flex-col gap-1.5">
            {(kunjungan.status === 'menunggu' || kunjungan.status === 'hadir') &&
              canPanggil && (
                <Button size="sm" className="w-full" onClick={onPanggil}>
                  <PhoneCallIcon data-icon="inline-start" />
                  Panggil
                </Button>
              )}

            {kunjungan.status === 'dipanggil' && (
              <>
                {canPeriksa && (
                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={onMulaiPeriksa}
                  >
                    <StethoscopeIcon data-icon="inline-start" />
                    Mulai Periksa
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={onBatal}
                >
                  <XIcon data-icon="inline-start" />
                  Batalkan
                </Button>
              </>
            )}

            {kunjungan.status === 'sedang_diperiksa' && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onSelesai}
              >
                <CheckIcon data-icon="inline-start" />
                Selesaikan
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  title: string
  count: number
  accentClass: string
  children: React.ReactNode
}

const KanbanColumn = ({
  title,
  count,
  accentClass,
  children,
}: KanbanColumnProps) => (
  <div className="flex min-w-[272px] flex-1 flex-col gap-3">
    <div
      className={cn(
        'flex items-center justify-between rounded-t-lg border-t-4 bg-muted/50 px-3 py-2',
        accentClass
      )}
    >
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <Badge variant="secondary" className="text-xs">
        {count}
      </Badge>
    </div>
    <ScrollArea className="h-[calc(100vh-260px)]">
      <div className="flex flex-col gap-2 pr-1">
        {count === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Tidak ada pasien
          </div>
        ) : (
          children
        )}
      </div>
    </ScrollArea>
  </div>
)

// ─── Board View ───────────────────────────────────────────────────────────────

interface BoardViewProps {
  grouped: Record<string, Kunjungan[]>
  canPanggil: boolean
  canPeriksa: boolean
  onUpdateStatus: (id: string, status: StatusKunjungan, kunjungan?: Kunjungan) => void
}

const BoardView = ({
  grouped,
  canPanggil,
  canPeriksa,
  onUpdateStatus,
}: BoardViewProps) => (
  <div className="flex gap-4 overflow-x-auto pb-4">
    <KanbanColumn
      title="Menunggu"
      count={grouped.menunggu.length}
      accentClass="border-yellow-400"
    >
      {grouped.menunggu.map((k) => (
        <KanbanCard
          key={k.id}
          kunjungan={k}
          canPanggil={canPanggil}
          canPeriksa={canPeriksa}
          onPanggil={() => onUpdateStatus(k.id, 'dipanggil', k)}
          onMulaiPeriksa={() => onUpdateStatus(k.id, 'sedang_diperiksa')}
          onSelesai={() => onUpdateStatus(k.id, 'selesai')}
          onBatal={() => onUpdateStatus(k.id, 'batal')}
        />
      ))}
    </KanbanColumn>

    <Separator orientation="vertical" className="hidden h-auto lg:block" />

    <KanbanColumn
      title="Dipanggil"
      count={grouped.dipanggil.length}
      accentClass="border-blue-400"
    >
      {grouped.dipanggil.map((k) => (
        <KanbanCard
          key={k.id}
          kunjungan={k}
          canPanggil={canPanggil}
          canPeriksa={canPeriksa}
          onPanggil={() => onUpdateStatus(k.id, 'dipanggil', k)}
          onMulaiPeriksa={() => onUpdateStatus(k.id, 'sedang_diperiksa')}
          onSelesai={() => onUpdateStatus(k.id, 'selesai')}
          onBatal={() => onUpdateStatus(k.id, 'batal')}
        />
      ))}
    </KanbanColumn>

    <Separator orientation="vertical" className="hidden h-auto lg:block" />

    <KanbanColumn
      title="Sedang Diperiksa"
      count={grouped.sedang_diperiksa.length}
      accentClass="border-emerald-400"
    >
      {grouped.sedang_diperiksa.map((k) => (
        <KanbanCard
          key={k.id}
          kunjungan={k}
          canPanggil={canPanggil}
          canPeriksa={canPeriksa}
          onPanggil={() => onUpdateStatus(k.id, 'dipanggil', k)}
          onMulaiPeriksa={() => onUpdateStatus(k.id, 'sedang_diperiksa')}
          onSelesai={() => onUpdateStatus(k.id, 'selesai')}
          onBatal={() => onUpdateStatus(k.id, 'batal')}
        />
      ))}
    </KanbanColumn>

    <Separator orientation="vertical" className="hidden h-auto lg:block" />

    <KanbanColumn
      title="Selesai / Batal"
      count={grouped.selesai.length}
      accentClass="border-gray-300"
    >
      {grouped.selesai.map((k) => (
        <KanbanCard
          key={k.id}
          kunjungan={k}
          canPanggil={canPanggil}
          canPeriksa={canPeriksa}
          onPanggil={() => onUpdateStatus(k.id, 'dipanggil', k)}
          onMulaiPeriksa={() => onUpdateStatus(k.id, 'sedang_diperiksa')}
          onSelesai={() => onUpdateStatus(k.id, 'selesai')}
          onBatal={() => onUpdateStatus(k.id, 'batal')}
        />
      ))}
    </KanbanColumn>
  </div>
)

// ─── Table View ───────────────────────────────────────────────────────────────

interface TableViewProps {
  data: Kunjungan[]
  canPanggil: boolean
  canPeriksa: boolean
  onUpdateStatus: (id: string, status: StatusKunjungan, kunjungan?: Kunjungan) => void
}

const TableView = ({
  data,
  canPanggil,
  canPeriksa,
  onUpdateStatus,
}: TableViewProps) => {
  const columns: ColumnDef<Kunjungan>[] = useMemo(
    () => [
      {
        accessorKey: 'noAntrian',
        header: 'No Antrian',
        cell: ({ row }) => (
          <span className="text-base font-bold text-emerald-600">
            {row.original.noAntrian}
          </span>
        ),
      },
      {
        id: 'pasien',
        header: 'Pasien',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">
              {row.original.pasien.nama}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {row.original.pasien.noRM}
            </p>
          </div>
        ),
      },
      {
        id: 'dokter',
        header: 'Dokter',
        cell: ({ row }) => (
          <div>
            <p className="text-sm text-foreground">{row.original.dokter.nama}</p>
            <p className="text-xs text-muted-foreground">{row.original.poli}</p>
          </div>
        ),
      },
      {
        id: 'jenis',
        header: 'Jenis',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <Badge
              variant="secondary"
              className={cn(
                row.original.jenisKunjungan === 'bpjs'
                  ? 'border-blue-200 bg-blue-100 text-blue-700'
                  : 'border-gray-200 bg-gray-100 text-gray-600'
              )}
            >
              {row.original.jenisKunjungan === 'bpjs' ? 'BPJS' : 'Umum'}
            </Badge>
            {row.original.pasien.alergi.length > 0 && (
              <Badge
                variant="destructive"
                className="border-red-200 bg-red-100 text-red-700"
              >
                <AlertTriangleIcon className="mr-0.5 size-3" />
                Alergi
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'waktu',
        header: 'Waktu Daftar',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatWaktu(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'noSEP',
        header: 'No SEP',
        cell: ({ row }) =>
          row.original.noSEP ? (
            <span className="font-mono text-xs text-muted-foreground">
              {row.original.noSEP}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        id: 'aksi',
        header: 'Aksi',
        cell: ({ row }) => {
          const k = row.original
          const isSelesaiOrBatal = k.status === 'selesai' || k.status === 'batal'
          if (isSelesaiOrBatal) return null

          return (
            <div className="flex items-center gap-1">
              {(k.status === 'menunggu' || k.status === 'hadir') && canPanggil && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(k.id, 'dipanggil', k)}
                >
                  <PhoneCallIcon data-icon="inline-start" />
                  Panggil
                </Button>
              )}
              {k.status === 'dipanggil' && canPeriksa && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(k.id, 'sedang_diperiksa')}
                >
                  <StethoscopeIcon data-icon="inline-start" />
                  Periksa
                </Button>
              )}
              {k.status === 'dipanggil' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(k.id, 'batal')}
                >
                  <XIcon data-icon="inline-start" />
                  Batal
                </Button>
              )}
              {k.status === 'sedang_diperiksa' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(k.id, 'selesai')}
                >
                  <CheckIcon data-icon="inline-start" />
                  Selesai
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [canPanggil, canPeriksa, onUpdateStatus]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15, pageIndex: 0 } },
  })

  const { pageIndex } = table.getState().pagination
  const pageCount = table.getPageCount()
  const totalRows = data.length
  const startRow = pageIndex * 15 + 1
  const endRow = Math.min((pageIndex + 1) * 15, totalRows)

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-16 text-center text-muted-foreground"
                >
                  Tidak ada kunjungan hari ini
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalRows > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {startRow}–{endRow} dari {totalRows} kunjungan
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon data-icon="inline-start" />
              Sebelumnya
            </Button>
            <span className="text-sm font-medium">
              {pageIndex + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Berikutnya
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AntrianPage() {
  const { user } = useAuthStore()
  const { kunjunganList, updateStatus } = useAntrianStore()

  const [viewMode, setViewMode] = useState<'papan' | 'tabel'>('papan')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCheckinOpen, setIsCheckinOpen] = useState(false)
  const [lastPoll, setLastPoll] = useState(new Date())

  const canPanggil = user?.role === 'admin' || user?.role === 'perawat'
  const canPeriksa = user?.role === 'perawat' || user?.role === 'admin'
  const canDaftar = user?.role === 'admin'

  // Mock polling: simulate refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastPoll(new Date())
    }, 10_000)
    return () => clearInterval(interval)
  }, [])

  // All kunjungan (mock represents today)
  const allKunjungan = kunjunganList

  const grouped = useMemo(
    () => ({
      menunggu: allKunjungan.filter(
        (k) => k.status === 'menunggu' || k.status === 'hadir'
      ),
      dipanggil: allKunjungan.filter((k) => k.status === 'dipanggil'),
      sedang_diperiksa: allKunjungan.filter(
        (k) => k.status === 'sedang_diperiksa'
      ),
      selesai: allKunjungan.filter(
        (k) => k.status === 'selesai' || k.status === 'batal'
      ),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allKunjungan, lastPoll]
  )

  const handleUpdateStatus = (
    id: string,
    status: StatusKunjungan,
    kunjungan?: Kunjungan
  ) => {
    updateStatus(id, status)

    if (status === 'dipanggil' && kunjungan) {
      toast(
        `Nomor antrian ${kunjungan.noAntrian} — ${kunjungan.pasien.nama} dipanggil ke ruang ${kunjungan.poli}`,
        {
          position: 'bottom-right',
          duration: 5000,
          icon: '📢',
        }
      )
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Antrian Pasien"
        subtitle={`${allKunjungan.length} kunjungan hari ini · diperbarui ${formatWaktu(lastPoll)}`}
        action={
          <div className="flex items-center gap-2">
            {canDaftar && (
              <Button
                variant="outline"
                onClick={() => setIsCheckinOpen(true)}
              >
                <UserCheckIcon data-icon="inline-start" />
                Check-in
              </Button>
            )}
            {canDaftar && (
              <Button onClick={() => setIsFormOpen(true)}>
                <PlusIcon data-icon="inline-start" />
                Daftar Pasien
              </Button>
            )}
          </div>
        }
      />

      {/* ── View Toggle ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 self-start rounded-lg border p-1">
        <Button
          variant={viewMode === 'papan' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('papan')}
        >
          <LayoutDashboardIcon data-icon="inline-start" />
          Papan
        </Button>
        <Button
          variant={viewMode === 'tabel' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('tabel')}
        >
          <ListIcon data-icon="inline-start" />
          Tabel
        </Button>
      </div>

      {/* ── Stats Strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Menunggu', count: grouped.menunggu.length, color: 'text-yellow-600' },
          { label: 'Dipanggil', count: grouped.dipanggil.length, color: 'text-blue-600' },
          { label: 'Diperiksa', count: grouped.sedang_diperiksa.length, color: 'text-emerald-600' },
          { label: 'Selesai/Batal', count: grouped.selesai.length, color: 'text-gray-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      {viewMode === 'papan' ? (
        <BoardView
          grouped={grouped}
          canPanggil={canPanggil}
          canPeriksa={canPeriksa}
          onUpdateStatus={handleUpdateStatus}
        />
      ) : (
        <TableView
          data={allKunjungan}
          canPanggil={canPanggil}
          canPeriksa={canPeriksa}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* ── Dialogs ──────────────────────────────────────────────────────────── */}
      <FormDaftarKunjungan
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
      <CheckinPasien
        open={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
      />
    </div>
  )
}
