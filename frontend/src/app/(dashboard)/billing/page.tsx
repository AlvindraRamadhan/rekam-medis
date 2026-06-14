'use client'

import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  BanknoteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  WalletIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { useTagihanStore } from '@/store/tagihan-store'
import { useAntrianStore } from '@/store/antrian-store'
import { formatRupiah, formatTanggal, cn } from '@/lib/utils'
import type { Tagihan } from '@/types'
import { FormTagihan } from '@/components/features/billing/form-tagihan'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isToday = (date: Date) => {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const TableSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 7 }).map((_, j) => (
          <TableCell key={j}>
            <Skeleton className="h-5 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const router = useRouter()
  const { tagihanList } = useTagihanStore()
  const { kunjunganList } = useAntrianStore()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('semua')
  const [filterJenis, setFilterJenis] = useState('semua')
  const [isLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Join tagihan with kunjungan for display data
  const enrichedTagihan = useMemo(() => {
    return tagihanList.map((tagihan) => {
      const kunjungan = kunjunganList.find((k) => k.id === tagihan.kunjunganId)
      return { tagihan, kunjungan }
    })
  }, [tagihanList, kunjunganList])

  // Summary stats
  const stats = useMemo(() => {
    const todayTagihan = tagihanList.filter((t) => isToday(t.createdAt))
    const totalPendapatanHariIni = todayTagihan
      .filter((t) => t.status === 'lunas')
      .reduce((sum, t) => sum + t.totalBiaya, 0)
    const belumLunas = tagihanList.filter((t) => t.status === 'belum_dibayar').length
    const lunasHariIni = todayTagihan.filter((t) => t.status === 'lunas').length
    return { totalPendapatanHariIni, belumLunas, lunasHariIni }
  }, [tagihanList])

  const filteredData = useMemo(() => {
    return enrichedTagihan.filter(({ tagihan, kunjungan }) => {
      const query = search.toLowerCase()
      const matchSearch =
        !search ||
        tagihan.nomorInvoice.toLowerCase().includes(query) ||
        (kunjungan?.pasien.nama.toLowerCase().includes(query) ?? false)

      const matchStatus =
        filterStatus === 'semua' || tagihan.status === filterStatus

      const matchJenis =
        filterJenis === 'semua' ||
        (filterJenis === 'bpjs' && !!tagihan.noSEP) ||
        (filterJenis === 'umum' && !tagihan.noSEP)

      return matchSearch && matchStatus && matchJenis
    })
  }, [enrichedTagihan, search, filterStatus, filterJenis])

  const columns: ColumnDef<(typeof filteredData)[0]>[] = useMemo(
    () => [
      {
        id: 'nomorInvoice',
        header: 'No Invoice',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-foreground">
            {row.original.tagihan.nomorInvoice}
          </span>
        ),
      },
      {
        id: 'pasien',
        header: 'Pasien',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">
              {row.original.kunjungan?.pasien.nama ?? '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.kunjungan?.pasien.noRM ?? ''}
            </p>
          </div>
        ),
      },
      {
        id: 'tanggal',
        header: 'Tanggal',
        cell: ({ row }) => (
          <span className="text-sm">
            {formatTanggal(row.original.tagihan.createdAt)}
          </span>
        ),
      },
      {
        id: 'total',
        header: 'Total',
        cell: ({ row }) => {
          const total = row.original.tagihan.totalBiaya
          return (
            <span className={cn('text-sm font-semibold', total === 0 && 'text-muted-foreground')}>
              {total === 0 ? 'BPJS' : formatRupiah(total)}
            </span>
          )
        },
      },
      {
        id: 'jenis',
        header: 'Jenis',
        cell: ({ row }) => (
          <span className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            row.original.tagihan.noSEP
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-700'
          )}>
            {row.original.tagihan.noSEP ? 'BPJS' : 'Umum'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge status={row.original.tagihan.status} />
        ),
      },
      {
        id: 'aksi',
        header: 'Aksi',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/billing/${row.original.tagihan.id}`)}
            >
              <EyeIcon data-icon="inline-start" />
              Detail
            </Button>
            {row.original.tagihan.status === 'belum_dibayar' && (
              <Button
                size="sm"
                onClick={() => router.push(`/billing/${row.original.tagihan.id}`)}
              >
                <BanknoteIcon data-icon="inline-start" />
                Bayar
              </Button>
            )}
          </div>
        ),
      },
    ],
    [router]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10, pageIndex: 0 } },
  })

  const { pageIndex } = table.getState().pagination
  const pageCount = table.getPageCount()
  const totalRows = filteredData.length
  const startRow = pageIndex * 10 + 1
  const endRow = Math.min((pageIndex + 1) * 10, totalRows)

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Billing & Pembayaran"
        subtitle={`${tagihanList.length} tagihan terdaftar`}
        action={
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Buat Tagihan
          </Button>
        }
      />

      {/* ── Summary Bar ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Total Pendapatan Hari Ini"
          value={formatRupiah(stats.totalPendapatanHariIni)}
          subtitle="hari ini"
          icon={<WalletIcon className="size-5" />}
          variant="success"
          loading={isLoading}
        />
        <StatsCard
          title="Tagihan Belum Lunas"
          value={stats.belumLunas}
          subtitle="tagihan menunggu"
          icon={<ClockIcon className="size-5" />}
          variant="warning"
          loading={isLoading}
        />
        <StatsCard
          title="Lunas Hari Ini"
          value={stats.lunasHariIni}
          subtitle="pembayaran konfirmasi"
          icon={<BanknoteIcon className="size-5" />}
          variant="default"
          loading={isLoading}
        />
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari no invoice atau nama pasien..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              table.setPageIndex(0)
            }}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
          <Select
            value={filterStatus}
            onValueChange={(val) => { setFilterStatus(val ?? 'semua'); table.setPageIndex(0) }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="belum_dibayar">Belum Dibayar</SelectItem>
                <SelectItem value="lunas">Lunas</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={filterJenis}
            onValueChange={(val) => { setFilterJenis(val ?? 'semua'); table.setPageIndex(0) }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="semua">Semua Jenis</SelectItem>
                <SelectItem value="bpjs">BPJS</SelectItem>
                <SelectItem value="umum">Umum</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Tabel ──────────────────────────────────────────────────────────── */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={8} />
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                  {search || filterStatus !== 'semua' || filterJenis !== 'semua'
                    ? 'Tidak ada tagihan yang sesuai dengan filter'
                    : 'Belum ada data tagihan'}
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

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {!isLoading && totalRows > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {startRow}–{endRow} dari {totalRows} tagihan
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

      {/* ── Form Buat Tagihan ──────────────────────────────────────────────── */}
      <FormTagihan
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  )
}
