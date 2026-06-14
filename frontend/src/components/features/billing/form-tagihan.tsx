'use client'

import { useState, useMemo, useCallback } from 'react'
import { PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useTagihanStore } from '@/store/tagihan-store'
import { useAntrianStore } from '@/store/antrian-store'
import { formatRupiah, formatTanggal, cn } from '@/lib/utils'
import type { ItemTagihan, Tagihan } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type KategoriItem = ItemTagihan['kategori']

interface FormItem {
  id: string
  nama: string
  kategori: KategoriItem
  harga: number
  jumlah: number
}

interface FormTagihanProps {
  open: boolean
  onClose: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KATEGORI_LABELS: Record<KategoriItem, string> = {
  konsultasi: 'Konsultasi',
  tindakan: 'Tindakan',
  obat: 'Obat',
  lainnya: 'Lainnya',
}

const emptyItem = (): FormItem => ({
  id: `item-${Date.now()}-${Math.random()}`,
  nama: '',
  kategori: 'konsultasi',
  harga: 0,
  jumlah: 1,
})

// ─── Component ────────────────────────────────────────────────────────────────

export const FormTagihan = ({ open, onClose }: FormTagihanProps) => {
  const router = useRouter()
  const { masterTarif, tambahTagihan, tagihanList } = useTagihanStore()
  const { kunjunganList } = useAntrianStore()

  const [selectedKunjunganId, setSelectedKunjunganId] = useState<string>('')
  const [items, setItems] = useState<FormItem[]>([emptyItem()])
  const [diskon, setDiskon] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tarifPopoverOpen, setTarifPopoverOpen] = useState<string | null>(null)

  // Only selesai kunjungan that don't already have a tagihan
  const existingKunjunganIds = useMemo(
    () => new Set(tagihanList.map((t) => t.kunjunganId)),
    [tagihanList]
  )

  const kunjunganSelesai = useMemo(
    () =>
      kunjunganList.filter(
        (k) => k.status === 'selesai' && !existingKunjunganIds.has(k.id)
      ),
    [kunjunganList, existingKunjunganIds]
  )

  const selectedKunjungan = useMemo(
    () => kunjunganList.find((k) => k.id === selectedKunjunganId),
    [kunjunganList, selectedKunjunganId]
  )

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.harga * item.jumlah, 0),
    [items]
  )
  const total = Math.max(0, subtotal - diskon)

  const handleAddItemFromTarif = useCallback(
    (itemId: string, tarif: (typeof masterTarif)[0]) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, nama: tarif.nama, kategori: tarif.kategori, harga: tarif.harga }
            : item
        )
      )
      setTarifPopoverOpen(null)
    },
    []
  )

  const handleAddRow = () => setItems((prev) => [...prev, emptyItem()])

  const handleRemoveRow = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id))

  const handleItemChange = <K extends keyof FormItem>(
    id: string,
    field: K,
    value: FormItem[K]
  ) =>
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )

  const handleSubmit = async () => {
    if (!selectedKunjunganId) return
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))

    const nextNum = tagihanList.length + 1
    const nomorInvoice = `INV/2026/06/${String(nextNum).padStart(3, '0')}`
    const newTagihan: Tagihan = {
      id: `tgh-${Date.now()}`,
      kunjunganId: selectedKunjunganId,
      nomorInvoice,
      items: items.map((item) => ({
        id: `itm-${Date.now()}-${item.id}`,
        nama: item.nama,
        kategori: item.kategori,
        harga: item.harga,
        jumlah: item.jumlah,
      })),
      totalBiaya: total,
      status: 'belum_dibayar',
      noSEP: selectedKunjungan?.noSEP,
      createdAt: new Date(),
    }

    tambahTagihan(newTagihan)
    setIsSubmitting(false)
    handleClose()
    router.push(`/billing/${newTagihan.id}`)
  }

  const handleClose = () => {
    setSelectedKunjunganId('')
    setItems([emptyItem()])
    setDiskon(0)
    onClose()
  }

  const activeTarif = masterTarif.filter((t) => t.aktif)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Tagihan Baru</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* ── Pilih Kunjungan ──────────────────────────────────────────── */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <Label className="mb-2 block text-sm font-medium">
              Pilih Kunjungan (Status: Selesai)
            </Label>
            <Select
              value={selectedKunjunganId}
              onValueChange={(val) => setSelectedKunjunganId(val ?? '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kunjungan pasien yang sudah selesai..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {kunjunganSelesai.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      Tidak ada kunjungan selesai yang belum ditagih
                    </SelectItem>
                  ) : (
                    kunjunganSelesai.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.pasien.nama} — {k.poli} — {formatTanggal(k.tanggalKunjungan)}
                        {k.noSEP ? ' (BPJS)' : ' (Umum)'}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>

            {selectedKunjungan && (
              <div className="mt-3 grid grid-cols-2 gap-3 rounded-md bg-background p-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Pasien</p>
                  <p className="font-medium">{selectedKunjungan.pasien.nama}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dokter</p>
                  <p className="font-medium">{selectedKunjungan.dokter.nama}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Jenis</p>
                  <p className="font-medium">
                    {selectedKunjungan.jenisKunjungan === 'bpjs' ? 'BPJS' : 'Umum'}
                  </p>
                </div>
                {selectedKunjungan.noSEP && (
                  <div>
                    <p className="text-xs text-muted-foreground">No SEP</p>
                    <p className="font-mono text-xs">{selectedKunjungan.noSEP}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Item Tagihan ─────────────────────────────────────────────── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Item Tagihan</h3>
              <Button variant="outline" size="sm" onClick={handleAddRow}>
                <PlusIcon data-icon="inline-start" />
                Tambah Item
              </Button>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Nama Layanan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      {/* Nama: pilih dari tarif atau ketik manual */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Popover
                            open={tarifPopoverOpen === item.id}
                            onOpenChange={(o) =>
                              setTarifPopoverOpen(o ? item.id : null)
                            }
                          >
                            <PopoverTrigger
                              render={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 shrink-0 p-0"
                                  title="Pilih dari master tarif"
                                >
                                  <SearchIcon className="size-3" />
                                </Button>
                              }
                            />
                            <PopoverContent className="w-72 p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Cari layanan..." />
                                <CommandList>
                                  <CommandEmpty>Tidak ditemukan</CommandEmpty>
                                  <CommandGroup>
                                    {activeTarif.map((tarif) => (
                                      <CommandItem
                                        key={tarif.id}
                                        value={tarif.nama}
                                        onSelect={() =>
                                          handleAddItemFromTarif(item.id, tarif)
                                        }
                                      >
                                        <div className="flex w-full items-center justify-between">
                                          <span>{tarif.nama}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {formatRupiah(tarif.harga)}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <Input
                            value={item.nama}
                            onChange={(e) =>
                              handleItemChange(item.id, 'nama', e.target.value)
                            }
                            placeholder="Nama layanan..."
                            className="h-8 text-sm"
                          />
                        </div>
                      </TableCell>

                      {/* Kategori */}
                      <TableCell>
                        <Select
                          value={item.kategori}
                          onValueChange={(val) =>
                            handleItemChange(item.id, 'kategori', val as KategoriItem)
                          }
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(KATEGORI_LABELS) as KategoriItem[]).map((k) => (
                              <SelectItem key={k} value={k}>
                                {KATEGORI_LABELS[k]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Harga */}
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={item.harga}
                          onChange={(e) =>
                            handleItemChange(item.id, 'harga', Number(e.target.value))
                          }
                          className="h-8 w-28 text-sm"
                        />
                      </TableCell>

                      {/* Jumlah */}
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          value={item.jumlah}
                          onChange={(e) =>
                            handleItemChange(item.id, 'jumlah', Number(e.target.value))
                          }
                          className="h-8 w-16 text-sm"
                        />
                      </TableCell>

                      {/* Subtotal */}
                      <TableCell>
                        <span className="text-sm font-medium">
                          {formatRupiah(item.harga * item.jumlah)}
                        </span>
                      </TableCell>

                      {/* Hapus */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveRow(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* ── Ringkasan ─────────────────────────────────────────────────── */}
          <div className="ml-auto w-72 rounded-lg border bg-muted/30 p-4 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">Diskon</span>
              <Input
                type="number"
                min={0}
                max={subtotal}
                value={diskon}
                onChange={(e) => setDiskon(Number(e.target.value))}
                className="h-7 w-32 text-right text-sm"
              />
            </div>
            <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold">
              <span>Total</span>
              <span className="text-emerald-600">{formatRupiah(total)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedKunjunganId || items.some((i) => !i.nama) || isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Tagihan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
