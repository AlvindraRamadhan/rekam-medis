'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  Loader2Icon,
  PillIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  Trash2Icon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

import { mockObat } from '@/data/mock/obat'
import { useAuthStore } from '@/store/auth-store'
import { useResepStore } from '@/store/resep-store'
import { cn } from '@/lib/utils'
import type { Alergi, DataObat, Kunjungan } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const FREKUENSI_OPTIONS = [
  '1x sehari',
  '2x sehari',
  '3x sehari',
  '4x sehari',
  'setiap 6 jam',
  'setiap 8 jam',
  'setiap 12 jam',
  'bila perlu',
]

const SATUAN_OPTIONS = ['tablet', 'kapsul', 'ml', 'tetes', 'unit', 'sachet', 'puff', 'suppositoria']

const FREKUENSI_PER_HARI: Record<string, number> = {
  '1x sehari': 1,
  '2x sehari': 2,
  '3x sehari': 3,
  '4x sehari': 4,
  'setiap 6 jam': 4,
  'setiap 8 jam': 3,
  'setiap 12 jam': 2,
  'bila perlu': 0,
}

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusAlergi = 'idle' | 'checking' | 'clear' | 'conflict' | 'overridden'

interface LocalItem {
  localId: string
  obat: DataObat | null
  dosis: string
  frekuensi: string
  jumlah: string
  satuan: string
  instruksi: string
  statusAlergi: StatusAlergi
  konflikAlergi: Alergi | null
  alasanOverride: string
  showOverrideForm: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createEmptyItem = (): LocalItem => ({
  localId: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  obat: null,
  dosis: '',
  frekuensi: '3x sehari',
  jumlah: '',
  satuan: 'tablet',
  instruksi: '',
  statusAlergi: 'idle',
  konflikAlergi: null,
  alasanOverride: '',
  showOverrideForm: false,
})

const cekKonflikAlergi = (obat: DataObat, alergiList: Alergi[]): Alergi | null => {
  const terms = [
    obat.namaGenerik.toLowerCase(),
    obat.namaPaten.toLowerCase(),
    obat.kandunganAktif.toLowerCase(),
    obat.golongan.toLowerCase(),
  ]
  for (const a of alergiList) {
    if (a.jenisAlergi !== 'obat') continue
    const allergen = a.namaAlergen.toLowerCase()
    if (terms.some((t) => t.includes(allergen) || allergen.includes(t.split(' ')[0]))) {
      return a
    }
  }
  return null
}

const hitungEstimasiHari = (jumlah: string, frekuensi: string): number => {
  const n = parseInt(jumlah, 10)
  if (isNaN(n) || n <= 0) return 0
  const perHari = FREKUENSI_PER_HARI[frekuensi] ?? 0
  return perHari > 0 ? Math.ceil(n / perHari) : 0
}

// ─── ObatCombobox ─────────────────────────────────────────────────────────────

interface ObatComboboxProps {
  value: DataObat | null
  onSelect: (obat: DataObat) => void
  disabled?: boolean
  hasError?: boolean
}

const ObatCombobox = ({ value, onSelect, disabled = false, hasError = false }: ObatComboboxProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState<DataObat[]>(mockObat.slice(0, 8))
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const q = query.toLowerCase().trim()
      setFiltered(
        q
          ? mockObat.filter(
              (o) =>
                o.namaGenerik.toLowerCase().includes(q) ||
                o.namaPaten.toLowerCase().includes(q) ||
                o.kandunganAktif.toLowerCase().includes(q),
            )
          : mockObat.slice(0, 8),
      )
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handleSelect = (obat: DataObat) => {
    onSelect(obat)
    setOpen(false)
    setQuery('')
  }

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
              hasError && 'border-red-500 ring-1 ring-red-400',
              !value && 'text-muted-foreground',
            )}
          />
        }
      >
        {value ? (
          <span className="truncate text-left flex items-center gap-2">
            <PillIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="font-medium">{value.namaGenerik}</span>
            <span className="text-muted-foreground text-xs">({value.namaPaten})</span>
            <span className="text-muted-foreground text-xs">· {value.kekuatan}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <SearchIcon className="size-3.5" />
            Cari nama obat atau kandungan...
          </span>
        )}
        <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[520px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Cari nama generik, paten, atau kandungan..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              <span className="text-sm text-muted-foreground">Obat tidak ditemukan.</span>
            </CommandEmpty>
            <CommandGroup heading={`${filtered.length} hasil`}>
              {filtered.map((obat) => (
                <CommandItem
                  key={obat.id}
                  value={obat.id}
                  onSelect={() => handleSelect(obat)}
                  className="flex items-start gap-3 py-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{obat.namaGenerik}</span>
                      <span className="text-xs text-muted-foreground">({obat.namaPaten})</span>
                      <span className="text-xs text-muted-foreground">· {obat.kekuatan}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {obat.bentukSediaan} · {obat.golongan}
                    </div>
                  </div>
                  {obat.adalahFornas ? (
                    <Badge className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-200 shrink-0">
                      Fornas
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-300 shrink-0"
                    >
                      Non-Fornas
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ─── ResepItemCard ────────────────────────────────────────────────────────────

interface ResepItemCardProps {
  item: LocalItem
  index: number
  isBPJS: boolean
  alergiPasien: Alergi[]
  onUpdate: (localId: string, updates: Partial<LocalItem>) => void
  onRemove: (localId: string) => void
  isDokter: boolean
}

const ResepItemCard = ({
  item,
  index,
  isBPJS,
  alergiPasien,
  onUpdate,
  onRemove,
  isDokter,
}: ResepItemCardProps) => {
  const allergyCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleObatSelect = useCallback(
    (obat: DataObat) => {
      onUpdate(item.localId, {
        obat,
        statusAlergi: 'checking',
        konflikAlergi: null,
        showOverrideForm: false,
        alasanOverride: '',
        // Auto-fill satuan from bentukSediaan
        satuan: obat.bentukSediaan.toLowerCase().includes('tablet')
          ? 'tablet'
          : obat.bentukSediaan.toLowerCase().includes('kapsul')
            ? 'kapsul'
            : obat.bentukSediaan.toLowerCase().includes('inhaler')
              ? 'puff'
              : 'tablet',
      })

      // Simulate 800ms delay for allergy check (FR-RE-003)
      if (allergyCheckRef.current) clearTimeout(allergyCheckRef.current)
      allergyCheckRef.current = setTimeout(() => {
        const konflik = cekKonflikAlergi(obat, alergiPasien)
        onUpdate(item.localId, {
          statusAlergi: konflik ? 'conflict' : 'clear',
          konflikAlergi: konflik,
        })
      }, 800)
    },
    [item.localId, alergiPasien, onUpdate],
  )

  useEffect(() => {
    return () => {
      if (allergyCheckRef.current) clearTimeout(allergyCheckRef.current)
    }
  }, [])

  const estimasiHari = hitungEstimasiHari(item.jumlah, item.frekuensi)
  const showBpjsWarning = isBPJS && estimasiHari > 30 && estimasiHari > 0

  const borderColor =
    item.statusAlergi === 'conflict'
      ? 'border-red-400 ring-1 ring-red-300'
      : item.statusAlergi === 'overridden'
        ? 'border-amber-400 ring-1 ring-amber-200'
        : 'border-border'

  return (
    <div className={cn('rounded-xl border-2 bg-card p-4 space-y-3 transition-colors', borderColor)}>
      {/* Item header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Obat {index + 1}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.localId)}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          aria-label="Hapus item obat"
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      {/* Drug search combobox */}
      <div className="space-y-1.5">
        <Label className="text-xs">Nama Obat</Label>
        <div className="relative">
          <ObatCombobox
            value={item.obat}
            onSelect={handleObatSelect}
            hasError={item.statusAlergi === 'conflict'}
          />
          {item.statusAlergi === 'checking' && (
            <div className="absolute right-9 top-1/2 -translate-y-1/2">
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Fornas / Non-Fornas badge */}
      {item.obat && item.statusAlergi !== 'checking' && (
        <div className="flex items-center gap-2">
          {item.obat.adalahFornas ? (
            <Badge className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200 gap-1">
              <ShieldCheckIcon className="size-3" />
              Fornas ✓
            </Badge>
          ) : (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300 gap-1"
              >
                <TriangleAlertIcon className="size-3" />
                Non-Fornas
              </Badge>
              {isBPJS && (
                <span className="text-xs text-yellow-700">
                  Obat ini tidak dalam Formularium Nasional BPJS
                </span>
              )}
            </div>
          )}

          {item.statusAlergi === 'overridden' && (
            <Badge
              variant="outline"
              className="text-xs bg-amber-50 text-amber-700 border-amber-300 gap-1"
            >
              <ShieldAlertIcon className="size-3" />
              Override — {item.alasanOverride.slice(0, 40)}
              {item.alasanOverride.length > 40 && '…'}
            </Badge>
          )}
        </div>
      )}

      {/* Allergy alert */}
      {item.statusAlergi === 'conflict' && item.konflikAlergi && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <ShieldAlertIcon className="size-4 text-red-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-red-800">⛔ Peringatan Alergi</p>
              <p className="text-sm text-red-700">
                Pasien alergi terhadap{' '}
                <strong>{item.konflikAlergi.namaAlergen}</strong> yang merupakan bagian dari
                obat ini. Reaksi sebelumnya:{' '}
                <strong>{item.konflikAlergi.reaksi}</strong>{' '}
                (Severity:{' '}
                <strong className="capitalize">{item.konflikAlergi.severity}</strong>).
              </p>
            </div>
          </div>

          {!item.showOverrideForm && (
            <div className="flex gap-2 pt-1">
              {isDokter && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-amber-400 text-amber-700 hover:bg-amber-50"
                  onClick={() => onUpdate(item.localId, { showOverrideForm: true })}
                >
                  Override Alergi
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => onUpdate(item.localId, { obat: null, statusAlergi: 'idle', konflikAlergi: null })}
              >
                Ganti Obat
              </Button>
            </div>
          )}

          {/* Inline override form (FR-RE-004) */}
          {item.showOverrideForm && (
            <div className="border border-amber-300 bg-amber-50 rounded-lg p-3 space-y-2 mt-2">
              <p className="text-xs font-semibold text-amber-800">Alasan Klinis Override Alergi</p>
              <Textarea
                rows={2}
                placeholder="Tulis alasan klinis mengapa obat ini tetap diberikan meskipun ada alergi..."
                value={item.alasanOverride}
                onChange={(e) => onUpdate(item.localId, { alasanOverride: e.target.value })}
                className="text-sm bg-white border-amber-300 focus-visible:ring-amber-400 resize-none"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={!item.alasanOverride.trim()}
                  onClick={() => {
                    if (!item.alasanOverride.trim()) return
                    onUpdate(item.localId, {
                      statusAlergi: 'overridden',
                      showOverrideForm: false,
                    })
                  }}
                >
                  <CheckCircle2Icon className="size-3 mr-1" />
                  Konfirmasi Override
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => onUpdate(item.localId, { showOverrideForm: false, alasanOverride: '' })}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dosis & Frekuensi */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`dosis-${item.localId}`} className="text-xs">
            Dosis
          </Label>
          <Input
            id={`dosis-${item.localId}`}
            placeholder="mis. 500 mg"
            value={item.dosis}
            onChange={(e) => onUpdate(item.localId, { dosis: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Frekuensi</Label>
          <Select
            value={item.frekuensi}
            onValueChange={(v) => v && onUpdate(item.localId, { frekuensi: v })}
          >
            <SelectTrigger className="h-9 w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {FREKUENSI_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jumlah & Satuan */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`jumlah-${item.localId}`} className="text-xs">
            Jumlah
          </Label>
          <Input
            id={`jumlah-${item.localId}`}
            type="number"
            min="1"
            placeholder="mis. 30"
            value={item.jumlah}
            onChange={(e) => onUpdate(item.localId, { jumlah: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Satuan</Label>
          <Select
            value={item.satuan}
            onValueChange={(v) => v && onUpdate(item.localId, { satuan: v })}
          >
            <SelectTrigger className="h-9 w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {SATUAN_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estimasi hari & BPJS warning (FR-RE-008) */}
      {estimasiHari > 0 && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-xs',
            showBpjsWarning
              ? 'bg-yellow-50 border border-yellow-300 text-yellow-800'
              : 'bg-muted/50 text-muted-foreground',
          )}
        >
          {showBpjsWarning ? (
            <>
              <TriangleAlertIcon className="size-3.5 shrink-0 text-yellow-600" />
              <span>
                <strong>Peringatan BPJS:</strong> Pemberian melebihi {estimasiHari} hari. Maksimal
                pemberian obat kronis BPJS adalah 30 hari.
              </span>
            </>
          ) : (
            <span>Estimasi supply: {estimasiHari} hari</span>
          )}
        </div>
      )}

      {/* Instruksi khusus */}
      <div className="space-y-1.5">
        <Label htmlFor={`instruksi-${item.localId}`} className="text-xs">
          Instruksi Khusus
        </Label>
        <Input
          id={`instruksi-${item.localId}`}
          placeholder="mis. Diminum sesudah makan, habiskan antibiotik..."
          value={item.instruksi}
          onChange={(e) => onUpdate(item.localId, { instruksi: e.target.value })}
          className="h-9 text-sm"
        />
      </div>
    </div>
  )
}

// ─── FormResep (main export) ──────────────────────────────────────────────────

interface FormResepProps {
  kunjungan: Kunjungan
  onSuccess?: (resepId: string) => void
}

export const FormResep = ({ kunjungan, onSuccess }: FormResepProps) => {
  const { user } = useAuthStore()
  const { tambahResep, updateStatus, setRetryPending, getByKunjungan } = useResepStore()

  const [items, setItems] = useState<LocalItem[]>([createEmptyItem()])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDokter = user?.role === 'dokter'
  const isBPJS = kunjungan.jenisKunjungan === 'bpjs' && !!kunjungan.pasien.bpjs?.statusAktif
  const alergiPasien = kunjungan.pasien.alergi ?? []

  // Pre-populate if resep already exists for this visit
  const existingResep = getByKunjungan(kunjungan.id)

  const updateItem = useCallback((localId: string, updates: Partial<LocalItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.localId === localId ? { ...item, ...updates } : item)),
    )
  }, [])

  const removeItem = useCallback((localId: string) => {
    setItems((prev) => {
      if (prev.length === 1) return prev // keep at least one
      return prev.filter((item) => item.localId !== localId)
    })
  }, [])

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()])
  }

  const handleSubmit = async () => {
    // Validate: every item must have an obat selected
    const invalid = items.some((item) => !item.obat)
    if (invalid) {
      toast.error('Pilih obat untuk semua item resep', {
        description: 'Setiap item resep harus memiliki obat yang dipilih.',
      })
      return
    }

    // Validate: no unresolved allergy conflicts
    const hasUnresolvedConflict = items.some((item) => item.statusAlergi === 'conflict')
    if (hasUnresolvedConflict) {
      toast.error('Ada konflik alergi yang belum diselesaikan', {
        description: 'Override alergi atau ganti obat sebelum menyimpan resep.',
      })
      return
    }

    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))

    // Simulate 90% success / 10% failure (FR-RE-005)
    const isSuccess = Math.random() > 0.1

    const resepItems = items.map((item, idx) => ({
      id: `ir-${Date.now()}-${idx}`,
      obatId: item.obat!.id,
      namaObat: `${item.obat!.namaGenerik} (${item.obat!.namaPaten}) ${item.obat!.kekuatan}`,
      kandunganAktif: item.obat!.kandunganAktif,
      dosis: item.dosis,
      frekuensi: item.frekuensi,
      jumlah: parseInt(item.jumlah, 10) || 1,
      satuan: item.satuan,
      instruksiKhusus: item.instruksi,
      adalahFornas: item.obat!.adalahFornas,
      adaKonflikAlergi: item.statusAlergi === 'overridden',
      alasanOverrideAlergi:
        item.statusAlergi === 'overridden' ? item.alasanOverride : undefined,
    }))

    const resepId = tambahResep({
      kunjunganId: kunjungan.id,
      pasienId: kunjungan.pasienId,
      pasienNama: kunjungan.pasien.nama,
      pasienNoRM: kunjungan.pasien.noRM,
      dokterId: kunjungan.dokterId,
      dokterNama: kunjungan.dokter.nama,
      jenisKunjungan: kunjungan.jenisKunjungan,
      isBPJS,
      items: resepItems,
      status: 'ditulis',
    })

    setIsSubmitting(false)

    if (isSuccess) {
      toast.success('Resep berhasil dikirim ke farmasi', {
        description: `No. Resep akan ditetapkan. Status: Ditulis → menunggu konfirmasi farmasi.`,
      })

      // Mock: auto-update to disiapkan after 30 seconds (FR-RE-006)
      setTimeout(() => {
        updateStatus(resepId, 'disiapkan')
        toast.info('Status resep diperbarui: Disiapkan', {
          description: 'Farmasi telah mengkonfirmasi persiapan obat.',
        })
      }, 30_000)

      onSuccess?.(resepId)
    } else {
      setRetryPending(resepId, true)
      toast.error('Koneksi farmasi gagal. Sistem akan retry otomatis.', {
        description: 'Resep tersimpan lokal. Akan dikirim ulang saat koneksi pulih.',
        duration: 6000,
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Header Resep ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <PillIcon className="size-4 text-purple-600" />
            Informasi Resep
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Pasien</span>
              <p className="font-medium mt-0.5">{kunjungan.pasien.nama}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">No. RM</span>
              <p className="font-mono font-medium mt-0.5">{kunjungan.pasien.noRM}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Dokter Penulis</span>
              <p className="font-medium mt-0.5">{kunjungan.dokter.nama}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Tanggal</span>
              <p className="font-medium mt-0.5">
                {format(new Date(kunjungan.tanggalKunjungan), 'd MMMM yyyy', { locale: idLocale })}
              </p>
            </div>
            {isBPJS && (
              <div className="col-span-2">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs gap-1">
                  <ShieldCheckIcon className="size-3" />
                  BPJS Aktif · {kunjungan.pasien.bpjs?.jenisKepesertaan}
                </Badge>
              </div>
            )}
          </div>

          {/* Allergy summary */}
          {alergiPasien.filter((a) => a.jenisAlergi === 'obat').length > 0 && (
            <>
              <Separator className="my-3" />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                  <AlertTriangleIcon className="size-3.5" />
                  Riwayat Alergi Obat
                </p>
                <div className="flex flex-wrap gap-2">
                  {alergiPasien
                    .filter((a) => a.jenisAlergi === 'obat')
                    .map((a) => (
                      <Badge
                        key={a.id}
                        variant="outline"
                        className="text-xs bg-red-50 text-red-700 border-red-300 gap-1"
                      >
                        {a.namaAlergen} — {a.reaksi}
                      </Badge>
                    ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Existing resep notice ────────────────────────────────────────── */}
      {existingResep && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <TriangleAlertIcon className="size-4 shrink-0" />
          <span>
            Kunjungan ini sudah memiliki resep{' '}
            <strong>{existingResep.noResep}</strong> dengan status{' '}
            <strong className="capitalize">{existingResep.status}</strong>. Menyimpan baru akan
            menambah resep terpisah.
          </span>
        </div>
      )}

      {/* ── Item Resep ────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            Daftar Obat
            <Badge variant="secondary" className="ml-2 text-xs">
              {items.length} item
            </Badge>
          </h3>
        </div>

        {items.map((item, idx) => (
          <ResepItemCard
            key={item.localId}
            item={item}
            index={idx}
            isBPJS={isBPJS}
            alergiPasien={alergiPasien}
            onUpdate={updateItem}
            onRemove={removeItem}
            isDokter={isDokter}
          />
        ))}

        <Button
          variant="outline"
          className="w-full border-dashed gap-2 text-muted-foreground hover:text-foreground"
          onClick={addItem}
        >
          <PlusIcon className="size-4" />
          Tambah Obat
        </Button>
      </div>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-2">
        <Button
          className="bg-purple-600 hover:bg-purple-700 gap-2 min-w-[200px]"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Mengirim ke farmasi...
            </>
          ) : (
            <>
              <RefreshCwIcon className="size-4" />
              Simpan &amp; Kirim ke Farmasi
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default FormResep
