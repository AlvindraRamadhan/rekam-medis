'use client'

import { use, useState } from 'react'
import {
  ArrowLeftIcon,
  BanknoteIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  Loader2Icon,
  PrinterIcon,
  RefreshCwIcon,
  SendIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/status-badge'
import { InvoicePrint } from '@/components/features/billing/invoice-print'
import { useTagihanStore, type MetodePembayaran, type StatusKlaimBPJS } from '@/store/tagihan-store'
import { useAntrianStore } from '@/store/antrian-store'
import { formatRupiah, formatTanggal, formatTanggalWaktu, cn } from '@/lib/utils'

// ─── BPJS Klaim Badge ─────────────────────────────────────────────────────────

const KLAIM_STATUS_CONFIG: Record<StatusKlaimBPJS, { label: string; className: string }> = {
  belum_diajukan: { label: 'Belum Diajukan', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  diajukan: { label: 'Diajukan', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  diproses: { label: 'Diproses', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  selesai: { label: 'Selesai', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ditolak: { label: 'Ditolak', className: 'bg-red-100 text-red-700 border-red-200' },
}

const KlaimBadge = ({ status }: { status: StatusKlaimBPJS }) => {
  const cfg = KLAIM_STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={cn('text-xs', cfg.className)}>
      {cfg.label}
    </Badge>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const { tagihanList, konfirmasiPembayaran, klaimBPJS, ajukanKlaim, cekStatusKlaim } =
    useTagihanStore()
  const { kunjunganList } = useAntrianStore()

  const tagihan = tagihanList.find((t) => t.id === id)
  const kunjungan = kunjunganList.find((k) => k.id === tagihan?.kunjunganId)
  const klaim = tagihan ? klaimBPJS[tagihan.id] : undefined

  // Dialog konfirmasi
  const [dialogOpen, setDialogOpen] = useState(false)
  const [jumlahBayar, setJumlahBayar] = useState<number>(tagihan?.totalBiaya ?? 0)
  const [metode, setMetode] = useState<MetodePembayaran>('tunai')
  const [metodeTerpilih, setMetodeTerpilih] = useState<MetodePembayaran>('tunai')
  const [isConfirming, setIsConfirming] = useState(false)

  // BPJS loading
  const [isAjukanLoading, setIsAjukanLoading] = useState(false)
  const [isCekLoading, setIsCekLoading] = useState(false)

  const handleKonfirmasiPembayaran = async () => {
    if (!tagihan) return
    setIsConfirming(true)
    await new Promise((r) => setTimeout(r, 800))
    konfirmasiPembayaran(tagihan.id, metode, jumlahBayar)
    setMetodeTerpilih(metode)
    setIsConfirming(false)
    setDialogOpen(false)
    toast.success('Pembayaran dikonfirmasi', {
      description: `${tagihan.nomorInvoice} — ${formatRupiah(jumlahBayar)}`,
    })
  }

  const handleAjukanKlaim = async () => {
    if (!tagihan) return
    setIsAjukanLoading(true)
    await new Promise((r) => setTimeout(r, 3000))
    ajukanKlaim(tagihan.id)
    setIsAjukanLoading(false)
    toast.success('Klaim BPJS diajukan')
  }

  const handleCekStatusKlaim = async () => {
    if (!tagihan) return
    setIsCekLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    cekStatusKlaim(tagihan.id)
    setIsCekLoading(false)
  }

  const handleCetakInvoice = () => {
    window.print()
  }

  if (!tagihan) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const subtotal = tagihan.items.reduce((s, i) => s + i.harga * i.jumlah, 0)
  const diskon = subtotal - tagihan.totalBiaya
  const isLunas = tagihan.status === 'lunas'
  const isBPJS = !!tagihan.noSEP

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => router.back()}
          >
            <ArrowLeftIcon className="size-4" />
            Kembali
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {tagihan.nomorInvoice}
            </h1>
            <p className="text-sm text-muted-foreground">
              Detail tagihan pasien
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLunas && (
            <Button variant="outline" onClick={handleCetakInvoice}>
              <PrinterIcon data-icon="inline-start" />
              Cetak Invoice
            </Button>
          )}
          <StatusBadge status={tagihan.status} />
        </div>
      </div>

      {/* ── Grid utama ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Card Info Tagihan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileTextIcon className="size-4" />
              Informasi Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">No Invoice</p>
              <p className="font-mono font-medium">{tagihan.nomorInvoice}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tanggal Dibuat</p>
              <p className="font-medium">{formatTanggal(tagihan.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Jenis</p>
              <span className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                isBPJS ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
              )}>
                {isBPJS ? 'BPJS' : 'Umum'}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={tagihan.status} />
            </div>
            {tagihan.noSEP && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">No SEP</p>
                <p className="font-mono text-xs font-medium">{tagihan.noSEP}</p>
              </div>
            )}
            {tagihan.paidAt && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Dibayar Pada</p>
                <p className="font-medium">{formatTanggalWaktu(tagihan.paidAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card Info Pasien/Dokter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheckIcon className="size-4" />
              Informasi Kunjungan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Pasien</p>
              <p className="font-medium">{kunjungan?.pasien.nama ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{kunjungan?.pasien.noRM}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dokter</p>
              <p className="font-medium">{kunjungan?.dokter.nama ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Poli</p>
              <p className="font-medium">{kunjungan?.poli ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tanggal Kunjungan</p>
              <p className="font-medium">
                {kunjungan ? formatTanggal(kunjungan.tanggalKunjungan) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">No Kunjungan</p>
              <p className="font-mono text-xs">{kunjungan?.id ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">No Antrian</p>
              <p className="font-medium">{kunjungan?.noAntrian ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Item Tagihan ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Item Tagihan</CardTitle>
          <CardDescription>{tagihan.items.length} item</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Layanan</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tagihan.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>
                    <span className="capitalize text-sm text-muted-foreground">
                      {item.kategori}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {isBPJS ? (
                      <span className="text-muted-foreground">BPJS</span>
                    ) : (
                      formatRupiah(item.harga)
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm">{item.jumlah}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {isBPJS ? (
                      <span className="text-muted-foreground">BPJS</span>
                    ) : (
                      formatRupiah(item.harga * item.jumlah)
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Total Summary */}
          <div className="border-t p-4">
            <div className="ml-auto w-72 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{isBPJS ? 'Ditanggung BPJS' : formatRupiah(subtotal)}</span>
              </div>
              {diskon > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon</span>
                  <span>- {formatRupiah(diskon)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className={isBPJS ? 'text-blue-600' : 'text-foreground'}>
                  {isBPJS ? 'Rp 0 (BPJS)' : formatRupiah(tagihan.totalBiaya)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Konfirmasi Pembayaran ─────────────────────────────────────────── */}
      {!isLunas && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div>
              <p className="font-semibold text-orange-900">Tagihan Belum Dibayar</p>
              <p className="text-sm text-orange-700">
                Total yang harus dibayar:{' '}
                <strong>{isBPJS ? 'Rp 0 (BPJS)' : formatRupiah(tagihan.totalBiaya)}</strong>
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => {
                setJumlahBayar(tagihan.totalBiaya)
                setDialogOpen(true)
              }}
            >
              <BanknoteIcon data-icon="inline-start" />
              Konfirmasi Pembayaran
            </Button>
          </CardContent>
        </Card>
      )}

      {isLunas && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="size-8 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-900">Pembayaran Lunas</p>
                <p className="text-sm text-emerald-700">
                  Dibayar pada {tagihan.paidAt ? formatTanggalWaktu(tagihan.paidAt) : '—'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleCetakInvoice}>
              <PrinterIcon data-icon="inline-start" />
              Cetak Invoice
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Klaim BPJS ───────────────────────────────────────────────────── */}
      {isBPJS && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Klaim BPJS</CardTitle>
              {klaim && <KlaimBadge status={klaim.status} />}
            </div>
            {klaim?.nomorKlaim && (
              <CardDescription>No. Klaim: {klaim.nomorKlaim}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {klaim?.diajukanAt && (
              <p className="mb-3 text-sm text-muted-foreground">
                Diajukan: {formatTanggalWaktu(klaim.diajukanAt)}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={
                  isAjukanLoading ||
                  (klaim?.status !== 'belum_diajukan' && klaim !== undefined)
                }
                onClick={handleAjukanKlaim}
              >
                {isAjukanLoading ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Mengajukan...
                  </>
                ) : (
                  <>
                    <SendIcon data-icon="inline-start" />
                    Ajukan Klaim
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                disabled={
                  isCekLoading ||
                  !klaim ||
                  klaim.status === 'belum_diajukan'
                }
                onClick={handleCekStatusKlaim}
              >
                {isCekLoading ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Mengecek...
                  </>
                ) : (
                  <>
                    <RefreshCwIcon data-icon="inline-start" />
                    Cek Status Klaim
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Invoice (hidden on screen, visible on print) ─────────────────── */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm', pointerEvents: 'none' }}>
        <InvoicePrint
          tagihan={tagihan}
          kunjungan={kunjungan}
          metodePembayaran={metodeTerpilih}
        />
      </div>

      {/* ── Dialog Konfirmasi Pembayaran ─────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !isConfirming && setDialogOpen(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription>
              {tagihan.nomorInvoice} — {kunjungan?.pasien.nama}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div>
              <Label className="mb-1.5 block text-sm">Jumlah yang Dibayar</Label>
              <Input
                type="number"
                min={0}
                value={jumlahBayar}
                onChange={(e) => setJumlahBayar(Number(e.target.value))}
                className="font-mono text-lg"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Tagihan: {formatRupiah(tagihan.totalBiaya)}
              </p>
              {jumlahBayar > tagihan.totalBiaya && (
                <p className="mt-1 text-xs text-emerald-600">
                  Kembalian: {formatRupiah(jumlahBayar - tagihan.totalBiaya)}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1.5 block text-sm">Metode Pembayaran</Label>
              <Select
                value={metode}
                onValueChange={(val) => setMetode(val as MetodePembayaran)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="tunai">Tunai (Cash)</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="qris">QRIS</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Tagihan</span>
                <span className="font-semibold">{formatRupiah(tagihan.totalBiaya)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibayar</span>
                <span className="font-semibold">{formatRupiah(jumlahBayar)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Kembalian</span>
                <span className="font-semibold">
                  {formatRupiah(Math.max(0, jumlahBayar - tagihan.totalBiaya))}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isConfirming}
            >
              Batal
            </Button>
            <Button
              onClick={handleKonfirmasiPembayaran}
              disabled={isConfirming || jumlahBayar < tagihan.totalBiaya}
            >
              {isConfirming ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircleIcon data-icon="inline-start" />
                  Konfirmasi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
