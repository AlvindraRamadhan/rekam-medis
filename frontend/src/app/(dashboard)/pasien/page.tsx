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
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  EyeIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
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
import { useAuthStore } from '@/store/auth-store'
import { usePasienStore } from '@/store/pasien-store'
import { cn, hitungUmur } from '@/lib/utils'
import type { Pasien } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { FormTambahPasien } from '@/components/features/pasien/form-tambah-pasien'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const maskNIK = (nik: string) =>
  `${nik.substring(0, 4)}****${nik.substring(12)}`

const getBPJSStatus = (pasien: Pasien) => {
  if (!pasien.bpjs) return 'bpjs_umum'
  return pasien.bpjs.statusAktif ? 'bpjs_aktif' : 'bpjs_tidak_aktif'
}

// ─── Skeleton Rows ────────────────────────────────────────────────────────────

const TableSkeleton = ({ rows = 10 }: { rows?: number }) => (
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

export default function PasienPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { pasienList } = usePasienStore()

  const [search, setSearch] = useState('')
  const [filterJenis, setFilterJenis] = useState('semua')
  const [isLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const filteredData = useMemo(() => {
    return pasienList.filter((pasien) => {
      const query = search.toLowerCase()
      const matchSearch =
        !search ||
        pasien.nama.toLowerCase().includes(query) ||
        pasien.nik.includes(search) ||
        pasien.noRM.toLowerCase().includes(query)

      const matchFilter =
        filterJenis === 'semua' ||
        (filterJenis === 'bpjs' && !!pasien.bpjs) ||
        (filterJenis === 'umum' && !pasien.bpjs)

      return matchSearch && matchFilter
    })
  }, [pasienList, search, filterJenis])

  const columns: ColumnDef<Pasien>[] = useMemo(
    () => [
      {
        accessorKey: 'noRM',
        header: 'No RM',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-foreground">
            {row.original.noRM}
          </span>
        ),
      },
      {
        accessorKey: 'nama',
        header: 'Nama',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.nama}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'nik',
        header: 'NIK',
        cell: ({ row }) => (
          <span className="font-mono text-sm">{maskNIK(row.original.nik)}</span>
        ),
      },
      {
        id: 'umur',
        header: 'Umur',
        cell: ({ row }) => (
          <span className="text-sm">{hitungUmur(row.original.tanggalLahir)}</span>
        ),
      },
      {
        id: 'bpjs',
        header: 'BPJS',
        cell: ({ row }) => (
          <StatusBadge status={getBPJSStatus(row.original)} />
        ),
      },
      {
        id: 'alergi',
        header: 'Alergi',
        cell: ({ row }) =>
          row.original.alergi.length > 0 ? (
            <StatusBadge status="ada_alergi" />
          ) : null,
      },
      {
        id: 'aksi',
        header: 'Aksi',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/pasien/${row.original.id}`)}
            >
              <EyeIcon data-icon="inline-start" />
              Detail
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/pasien/${row.original.id}?tab=rekam-medis`)}
            >
              <ClipboardListIcon data-icon="inline-start" />
              RM Terbaru
            </Button>
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
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
    },
  })

  const { pageIndex } = table.getState().pagination
  const pageCount = table.getPageCount()
  const totalRows = filteredData.length
  const startRow = pageIndex * 10 + 1
  const endRow = Math.min((pageIndex + 1) * 10, totalRows)

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Data Pasien"
        subtitle={`${pasienList.length} pasien terdaftar`}
        action={
          user?.role === 'admin' ? (
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              Tambah Pasien
            </Button>
          ) : undefined
        }
      />

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIK, atau No RM..."
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
          <Select value={filterJenis} onValueChange={(val) => { setFilterJenis(val ?? 'semua'); table.setPageIndex(0) }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Jenis Kunjungan" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="semua">Semua</SelectItem>
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
              <TableSkeleton rows={10} />
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                  {search || filterJenis !== 'semua'
                    ? 'Tidak ada pasien yang sesuai dengan pencarian'
                    : 'Belum ada data pasien'}
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
            Menampilkan {startRow}–{endRow} dari {totalRows} pasien
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

      {/* ── Form Tambah Pasien ─────────────────────────────────────────────── */}
      <FormTambahPasien
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  )
}
