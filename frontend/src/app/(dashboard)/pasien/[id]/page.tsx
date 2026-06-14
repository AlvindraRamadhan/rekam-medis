'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  DownloadIcon,
  EditIcon,
  FileTextIcon,
  Loader2Icon,
  PlusIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  UserIcon,
  XCircleIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { mockKunjungan } from '@/data/mock/kunjungan'
import { mockRekamMedis } from '@/data/mock/rekam-medis'
import { mockTagihan } from '@/data/mock/tagihan'
import { useAuthStore } from '@/store/auth-store'
import { usePasienStore } from '@/store/pasien-store'
import { STATUS_KUNJUNGAN } from '@/lib/constants/status'
import {
  cn,
  formatRupiah,
  formatTanggal,
  formatTanggalWaktu,
  hitungUmur,
} from '@/lib/utils'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { FormEditPasien } from '@/components/features/pasien/form-edit-pasien'

// ─── Severity badge helper ─────────────────────────────────────────────────────

const SeverityBadge = ({ severity }: { severity: 'ringan' | 'sedang' | 'berat' }) => {
  const map = {
    ringan: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    sedang: 'bg-orange-100 text-orange-700 border-orange-200',
    berat: 'bg-red-100 text-red-700 border-red-200',
  }
  const label = { ringan: 'Ringan', sedang: 'Sedang', berat: 'Berat' }
  return (
    <Badge variant="outline" className={cn(map[severity])}>
      {label[severity]}
    </Badge>
  )
}

// ─── Info row helper ──────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
  <div className="grid grid-cols-5 gap-2 py-1.5">
    <span className="col-span-2 text-sm text-muted-foreground">{label}</span>
    <span className="col-span-3 text-sm font-medium text-foreground">{value}</span>
  </div>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DetailPasienPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { pasienList } = usePasienStore()

  const pasienId = params.id as string
  const pasien = pasienList.find((p) => p.id === pasienId)

  const activeTab = (() => {
    const tab = searchParams.get('tab')
    return ['data-diri', 'riwayat', 'rekam-medis', 'tagihan'].includes(tab ?? '')
      ? tab!
      : 'data-diri'
  })()

  const handleTabChange = (value: string) => {
    router.push(`/pasien/${pasienId}?tab=${value}`, { scroll: false })
  }

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [bpjsChecking, setBpjsChecking] = useState(false)
  const [bpjsCheckResult, setBpjsCheckResult] = useState<'aktif' | 'tidak_aktif' | null>(null)

  if (!pasien) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-20">
        <UserIcon className="size-12 text-muted-foreground" />
        <p className="text-muted-foreground">Pasien tidak ditemukan.</p>
        <Button variant="outline" onClick={() => router.push('/pasien')}>
          <ArrowLeftIcon data-icon="inline-start" />
          Kembali ke Daftar Pasien
        </Button>
      </div>
    )
  }

  // ─── Data derivations ──────────────────────────────────────────────────────

  const kunjunganPasien = mockKunjungan
    .filter((k) => k.pasienId === pasienId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const kunjunganIds = kunjunganPasien.map((k) => k.id)

  const rekamMedisPasien = mockRekamMedis
    .filter((rm) => kunjunganIds.includes(rm.kunjunganId))
    .sort((a, b) => b.tanggalWaktu.getTime() - a.tanggalWaktu.getTime())

  const tagihanPasien = mockTagihan
    .filter((t) => kunjunganIds.includes(t.kunjunganId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const getRekamMedisForKunjungan = (kunjunganId: string) =>
    mockRekamMedis.find((rm) => rm.kunjunganId === kunjunganId)

  const canEdit =
    user?.role === 'admin' || user?.role === 'perawat' || user?.role === 'dokter'

  const handleCekBPJS = () => {
    setBpjsChecking(true)
    setBpjsCheckResult(null)
    setTimeout(() => {
      setBpjsChecking(false)
      const result =
        Math.random() > 0.15
          ? pasien.bpjs?.statusAktif
            ? 'aktif'
            : 'tidak_aktif'
          : pasien.bpjs?.statusAktif
          ? 'tidak_aktif'
          : 'aktif'
      setBpjsCheckResult(result as 'aktif' | 'tidak_aktif')
    }, 2000)
  }

  const handleUnduhPDF = (noRM: string) => {
    toast.info('Mengunduh rekam medis...', { description: `No RM: ${noRM}` })
  }

  const handleLihatInvoice = (nomorInvoice: string) => {
    toast.info('Membuka invoice...', { description: nomorInvoice })
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push('/pasien')}>
          <ArrowLeftIcon />
        </Button>
        <PageHeader
          title={pasien.nama}
          subtitle={`${pasien.noRM} · ${hitungUmur(pasien.tanggalLahir)} · ${pasien.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}`}
          action={
            canEdit ? (
              <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                <EditIcon data-icon="inline-start" />
                Edit Data
              </Button>
            ) : undefined
          }
          className="flex-1"
        />
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="data-diri">
            <UserIcon data-icon="inline-start" />
            Data Diri
          </TabsTrigger>
          <TabsTrigger value="riwayat">
            <ClipboardListIcon data-icon="inline-start" />
            Riwayat Kunjungan
          </TabsTrigger>
          <TabsTrigger value="rekam-medis">
            <FileTextIcon data-icon="inline-start" />
            Rekam Medis
          </TabsTrigger>
          <TabsTrigger value="tagihan">
            <ShieldCheckIcon data-icon="inline-start" />
            Tagihan
          </TabsTrigger>
        </TabsList>

        {/* ═══ TAB 1: DATA DIRI ═════════════════════════════════════════════ */}
        <TabsContent value="data-diri" className="flex flex-col gap-4 pt-4">
          {/* Informasi Dasar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              <InfoRow label="Nama Lengkap" value={pasien.nama} />
              <Separator />
              <InfoRow label="NIK" value={<span className="font-mono">{pasien.nik}</span>} />
              <Separator />
              <InfoRow
                label="Tanggal Lahir"
                value={`${formatTanggal(pasien.tanggalLahir)} (${hitungUmur(pasien.tanggalLahir)})`}
              />
              <Separator />
              <InfoRow
                label="Jenis Kelamin"
                value={pasien.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              />
              <Separator />
              <InfoRow
                label="Golongan Darah"
                value={pasien.golonganDarah === '-' ? 'Tidak Diketahui' : pasien.golonganDarah}
              />
              <Separator />
              <InfoRow label="Alamat" value={pasien.alamat || '-'} />
              <Separator />
              <InfoRow label="No Telepon" value={pasien.noTelepon || '-'} />
              {pasien.ihsNumber && (
                <>
                  <Separator />
                  <InfoRow
                    label="IHS Number"
                    value={<span className="font-mono text-xs">{pasien.ihsNumber}</span>}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Data BPJS */}
          {pasien.bpjs ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">Data BPJS</CardTitle>
                  <CardDescription>Informasi kepesertaan BPJS Kesehatan</CardDescription>
                </div>
                <StatusBadge
                  status={pasien.bpjs.statusAktif ? 'bpjs_aktif' : 'bpjs_tidak_aktif'}
                />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <InfoRow
                    label="No Kartu"
                    value={<span className="font-mono">{pasien.bpjs.noKartu}</span>}
                  />
                  <Separator />
                  <InfoRow label="FKTP" value={pasien.bpjs.faskesTingkat1} />
                  <Separator />
                  <InfoRow label="Jenis Kepesertaan" value={pasien.bpjs.jenisKepesertaan} />
                </div>

                {/* BPJS Check */}
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <div className="flex-1">
                    {bpjsCheckResult === 'aktif' && (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2Icon className="size-4" />
                        <span className="text-sm font-medium">Status BPJS: Aktif</span>
                      </div>
                    )}
                    {bpjsCheckResult === 'tidak_aktif' && (
                      <div className="flex items-center gap-2 text-destructive">
                        <XCircleIcon className="size-4" />
                        <span className="text-sm font-medium">Status BPJS: Tidak Aktif</span>
                      </div>
                    )}
                    {bpjsCheckResult === null && !bpjsChecking && (
                      <span className="text-sm text-muted-foreground">
                        Klik tombol untuk memverifikasi status BPJS secara real-time
                      </span>
                    )}
                    {bpjsChecking && (
                      <span className="text-sm text-muted-foreground">
                        Memverifikasi ke server BPJS...
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCekBPJS}
                    disabled={bpjsChecking}
                  >
                    {bpjsChecking ? (
                      <Loader2Icon className="animate-spin" data-icon="inline-start" />
                    ) : (
                      <RefreshCwIcon data-icon="inline-start" />
                    )}
                    Cek Status BPJS
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data BPJS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pasien ini tidak terdaftar sebagai peserta BPJS (pasien umum).
                </p>
              </CardContent>
            </Card>
          )}

          {/* Alergi */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">Riwayat Alergi</CardTitle>
                <CardDescription>
                  {pasien.alergi.length > 0
                    ? `${pasien.alergi.length} alergi tercatat`
                    : 'Tidak ada riwayat alergi'}
                </CardDescription>
              </div>
              {(user?.role === 'perawat' || user?.role === 'dokter') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                >
                  <PlusIcon data-icon="inline-start" />
                  Tambah Alergi
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {pasien.alergi.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                  <CheckCircle2Icon className="size-4 text-emerald-500" />
                  Tidak ada riwayat alergi yang tercatat
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pasien.alergi.map((alergi) => (
                    <div
                      key={alergi.id}
                      className="flex items-start justify-between gap-4 rounded-lg border bg-red-50/50 p-3"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {alergi.namaAlergen}
                            </span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {alergi.jenisAlergi}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{alergi.reaksi}</p>
                        </div>
                      </div>
                      <SeverityBadge severity={alergi.severity} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 2: RIWAYAT KUNJUNGAN ═════════════════════════════════════ */}
        <TabsContent value="riwayat" className="flex flex-col gap-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Riwayat Kunjungan</CardTitle>
              <CardDescription>
                {kunjunganPasien.length} kunjungan tercatat (terbaru di atas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {kunjunganPasien.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada riwayat kunjungan
                </p>
              ) : (
                <div className="flex flex-col gap-0">
                  {kunjunganPasien.map((kunjungan, index) => {
                    const rm = getRekamMedisForKunjungan(kunjungan.id)
                    const statusConfig = STATUS_KUNJUNGAN[kunjungan.status]

                    return (
                      <div key={kunjungan.id}>
                        <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {index + 1}
                              </div>
                              {index < kunjunganPasien.length - 1 && (
                                <div className="mt-1 h-full w-px bg-border" />
                              )}
                            </div>
                            <div className="flex flex-col gap-1 pb-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                  {formatTanggalWaktu(kunjungan.tanggalKunjungan)}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={cn(statusConfig.className)}
                                >
                                  {statusConfig.label}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {kunjungan.jenisKunjungan === 'bpjs' ? 'BPJS' : 'Umum'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {kunjungan.poli} · {kunjungan.dokter.nama} · Antrian {kunjungan.noAntrian}
                              </p>
                              {rm && (
                                <p className="text-sm text-foreground">
                                  <span className="text-muted-foreground">Diagnosis: </span>
                                  {rm.diagnosisUtama.kode} — {rm.diagnosisUtama.deskripsi}
                                </p>
                              )}
                            </div>
                          </div>
                          {rm?.isFinalized && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                              onClick={() => router.push(`/pasien/${pasienId}?tab=rekam-medis`)}
                            >
                              <FileTextIcon data-icon="inline-start" />
                              Lihat Rekam Medis
                            </Button>
                          )}
                        </div>
                        {index < kunjunganPasien.length - 1 && <Separator />}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 3: REKAM MEDIS ═══════════════════════════════════════════ */}
        <TabsContent value="rekam-medis" className="flex flex-col gap-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rekam Medis</CardTitle>
              <CardDescription>
                {rekamMedisPasien.length} rekam medis tersimpan (terbaru di atas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rekamMedisPasien.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada rekam medis yang tercatat
                </p>
              ) : (
                <Accordion multiple className="w-full">
                  {rekamMedisPasien.map((rm) => {
                    const kunjungan = kunjunganPasien.find((k) => k.id === rm.kunjunganId)

                    return (
                      <AccordionItem key={rm.id} value={rm.id}>
                        <AccordionTrigger>
                          <div className="flex flex-col items-start gap-0.5 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {formatTanggalWaktu(rm.tanggalWaktu)}
                              </span>
                              {rm.isFinalized && (
                                <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                                  Final
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {rm.diagnosisUtama.kode} — {rm.diagnosisUtama.deskripsi}
                              {kunjungan && ` · ${kunjungan.poli}`}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-4">
                            {/* SOAP Summary */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  S — Subjektif
                                </span>
                                <p className="text-sm text-foreground">{rm.keluhanSubjektif}</p>
                              </div>
                              <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  O — Objektif
                                </span>
                                <p className="text-sm text-foreground">{rm.pemeriksaanFisik}</p>
                              </div>
                              <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  A — Diagnosis
                                </span>
                                <p className="text-sm font-medium text-foreground">
                                  [{rm.diagnosisUtama.kode}] {rm.diagnosisUtama.deskripsi}
                                </p>
                                {rm.diagnosisSekunder.map((d) => (
                                  <p key={d.kode} className="text-xs text-muted-foreground">
                                    [{d.kode}] {d.deskripsi}
                                  </p>
                                ))}
                              </div>
                              <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  P — Plan
                                </span>
                                <p className="text-sm text-foreground">
                                  {rm.rencanaMediamentosa}
                                </p>
                                {rm.rencanaNonMediamentosa && (
                                  <p className="text-sm text-muted-foreground">
                                    {rm.rencanaNonMediamentosa}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Addendum */}
                            {rm.addendum && rm.addendum.length > 0 && (
                              <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Addendum
                                </span>
                                {rm.addendum.map((add) => (
                                  <div
                                    key={add.id}
                                    className="rounded-lg border-l-2 border-primary bg-primary/5 p-3"
                                  >
                                    <p className="text-xs text-muted-foreground">
                                      {formatTanggalWaktu(add.timestamp)}
                                    </p>
                                    <p className="text-sm text-foreground">{add.isi}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnduhPDF(pasien.noRM)}
                              >
                                <DownloadIcon data-icon="inline-start" />
                                Unduh PDF
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 4: TAGIHAN ═══════════════════════════════════════════════ */}
        <TabsContent value="tagihan" className="flex flex-col gap-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tagihan</CardTitle>
              <CardDescription>
                Riwayat tagihan pasien (terbaru di atas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tagihanPasien.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada tagihan
                </p>
              ) : (
                <div className="flex flex-col gap-0">
                  {tagihanPasien.map((tagihan, index) => (
                    <div key={tagihan.id}>
                      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-medium text-foreground">
                              {tagihan.nomorInvoice}
                            </span>
                            <StatusBadge status={tagihan.status} />
                            {tagihan.noSEP && (
                              <Badge variant="secondary" className="text-xs">
                                BPJS
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatTanggalWaktu(tagihan.createdAt)}
                          </p>
                          <div className="flex flex-col gap-0.5">
                            {tagihan.items.map((item) => (
                              <span key={item.id} className="text-xs text-muted-foreground">
                                • {item.nama}
                                {item.harga > 0 && ` — ${formatRupiah(item.harga)}`}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="text-sm font-semibold text-foreground">
                              {tagihan.totalBiaya === 0
                                ? 'Ditanggung BPJS'
                                : formatRupiah(tagihan.totalBiaya)}
                            </p>
                            {tagihan.paidAt && (
                              <p className="text-xs text-muted-foreground">
                                Lunas {formatTanggal(tagihan.paidAt)}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLihatInvoice(tagihan.nomorInvoice)}
                          >
                            <FileTextIcon data-icon="inline-start" />
                            Invoice
                          </Button>
                        </div>
                      </div>
                      {index < tagihanPasien.length - 1 && <Separator />}
                    </div>
                  ))}

                  {/* Summary */}
                  <Separator />
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-muted-foreground">
                      Total {tagihanPasien.length} tagihan
                    </span>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Akumulasi Pembayaran</p>
                      <p className="text-base font-bold text-foreground">
                        {formatRupiah(
                          tagihanPasien.reduce((sum, t) => sum + t.totalBiaya, 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Form Edit ──────────────────────────────────────────────────────── */}
      <FormEditPasien
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        pasien={pasien}
      />
    </div>
  )
}
