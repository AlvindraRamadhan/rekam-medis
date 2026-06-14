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
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
  PlusIcon,
  SearchIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useTagihanStore } from '@/store/tagihan-store'
import { formatRupiah, cn } from '@/lib/utils'
import type { MasterTarif } from '@/data/mock/master-tarif'

// ─── Types ────────────────────────────────────────────────────────────────────

type KategoriTarif = MasterTarif['kategori']

const KATEGORI_LABELS: Record<KategoriTarif, string> = {
  konsultasi: 'Konsultasi',
  tindakan: 'Tindakan',
  obat: 'Obat',
  lainnya: 'Lainnya',
}

const KATEGORI_COLORS: Record<KategoriTarif, string> = {
  konsultasi: 'bg-blue-100 text-blue-800',
  tindakan: 'bg-purple-100 text-purple-800',
  obat: 'bg-amber-100 text-amber-800',
  lainnya: 'bg-gray-100 text-gray-700',
}

const emptyForm = (): Omit<MasterTarif, 'id'> => ({
  nama: '',
  kategori: 'konsultasi',
  harga: 0,
  aktif: true,
})

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const TableSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 5 }).map((_, j) => (
          <TableCell key={j}>
            <Skeleton className="h-5 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MasterTarifPage() {
  const router = useRouter()
  const { masterTarif, tambahTarif, updateTarif, toggleAktifTarif } = useTagihanStore()

  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState('semua')
  const [filterStatus, setFilterStatus] = useState('semua')
  const [isLoading] = useState(false)

  // Form state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<MasterTarif, 'id'>>(emptyForm())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredData = useMemo(() => {
    return masterTarif.filter((tarif) => {
      const query = search.toLowerCase()
      const matchSearch = !search || tarif.nama.toLowerCase().includes(query)
      const matchKategori = filterKategori === 'semua' || tarif.kategori === filterKategori
      const matchStatus =
        filterStatus === 'semua' ||
        (filterStatus === 'aktif' && tarif.aktif) ||
        (filterStatus === 'nonaktif' && !tarif.aktif)
      return matchSearch && matchKategori && matchStatus
    })
  }, [masterTarif, search, filterKategori, filterStatus])

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  const handleOpenEdit = (tarif: MasterTarif) => {
    setEditingId(tarif.id)
    setForm({ nama: tarif.nama, kategori: tarif.kategori, harga: tarif.harga, aktif: tarif.aktif })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    if (editingId) {
      updateTarif(editingId, form)
    } else {
      tambahTarif({ id: `tar-${Date.now()}`, ...form })
    }
    setIsSubmitting(false)
    setDialogOpen(false)
  }

  const columns: ColumnDef<MasterTarif>[] = useMemo(
    () => [
      {
        accessorKey: 'nama',
        header: 'Nama Layanan',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.nama}</span>
        ),
      },
      {
        accessorKey: 'kategori',
        header: 'Kategori',
        cell: ({ row }) => (
          <span className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            KATEGORI_COLORS[row.original.kategori]
          )}>
            {KATEGORI_LABELS[row.original.kategori]}
          </span>
        ),
      },
      {
        accessorKey: 'harga',
        header: 'Harga',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-semibold">
            {formatRupiah(row.original.harga)}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              row.original.aktif
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            )}
          >
            {row.original.aktif ? 'Aktif' : 'Nonaktif'}
          </Badge>
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
              onClick={() => handleOpenEdit(row.original)}
            >
              <EditIcon data-icon="inline-start" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                row.original.aktif
                  ? 'text-muted-foreground hover:text-destructive'
                  : 'text-emerald-600 hover:text-emerald-700'
              )}
              onClick={() => toggleAktifTarif(row.original.id)}
            >
              {row.original.aktif ? (
                <>
                  <ToggleLeftIcon data-icon="inline-start" />
                  Nonaktifkan
                </>
              ) : (
                <>
                  <ToggleRightIcon data-icon="inline-start" />
                  Aktifkan
                </>
              )}
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toggleAktifTarif]
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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/billing')}>
          <ArrowLeftIcon className="size-4 mr-1" />
          Billing
        </Button>
        <span className="text-muted-foreground">/</span>
        <PageHeader
          title="Master Tarif"
          subtitle={`${masterTarif.length} layanan terdaftar`}
          action={
            <Button onClick={handleOpenAdd}>
              <PlusIcon data-icon="inline-start" />
              Tambah Tarif
            </Button>
          }
        />
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama layanan..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              table.setPageIndex(0)
            }}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filterKategori}
            onValueChange={(val) => { setFilterKategori(val ?? 'semua'); table.setPageIndex(0) }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="semua">Semua Kategori</SelectItem>
                <SelectItem value="konsultasi">Konsultasi</SelectItem>
                <SelectItem value="tindakan">Tindakan</SelectItem>
                <SelectItem value="obat">Obat</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={(val) => { setFilterStatus(val ?? 'semua'); table.setPageIndex(0) }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
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
                <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                  {search || filterKategori !== 'semua' || filterStatus !== 'semua'
                    ? 'Tidak ada tarif yang sesuai filter'
                    : 'Belum ada data master tarif'}
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
            Menampilkan {startRow}–{endRow} dari {totalRows} tarif
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

      {/* ── Dialog Tambah / Edit Tarif ──────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !isSubmitting && setDialogOpen(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Tarif' : 'Tambah Tarif Baru'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div>
              <Label className="mb-1.5 block text-sm">Nama Layanan</Label>
              <Input
                value={form.nama}
                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                placeholder="contoh: Konsultasi Dokter Umum"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-sm">Kategori</Label>
              <Select
                value={form.kategori}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, kategori: val as KategoriTarif }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(Object.keys(KATEGORI_LABELS) as KategoriTarif[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {KATEGORI_LABELS[k]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block text-sm">Harga (Rp)</Label>
              <Input
                type="number"
                min={0}
                value={form.harga}
                onChange={(e) =>
                  setForm((f) => ({ ...f, harga: Number(e.target.value) }))
                }
                placeholder="0"
                className="font-mono"
              />
              {form.harga > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatRupiah(form.harga)}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1.5 block text-sm">Status</Label>
              <Select
                value={form.aktif ? 'aktif' : 'nonaktif'}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, aktif: val === 'aktif' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="nonaktif">Nonaktif</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.nama || isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Tarif'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
