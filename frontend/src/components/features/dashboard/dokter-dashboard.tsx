"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Pill,
  Stethoscope,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockDokter } from "@/data/mock/dokter"
import { mockJadwal } from "@/data/mock/jadwal"
import { mockKunjungan } from "@/data/mock/kunjungan"
import { STATUS_KUNJUNGAN } from "@/lib/constants/status"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/store/auth-store"

import { PageHeader } from "../../shared/page-header"
import { StatsCard } from "../../shared/stats-card"

// ─── Helper ───────────────────────────────────────────────────────────────────

const hitungUmur = (tanggalLahir: Date): number => {
  const today = new Date("2026-06-14")
  let age = today.getFullYear() - tanggalLahir.getFullYear()
  const m = today.getMonth() - tanggalLahir.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < tanggalLahir.getDate())) age--
  return age
}

const HARI_MAP: Record<string, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
  minggu: "Minggu",
}

const SESI_MAP: Record<string, string> = {
  pagi: "Pagi",
  siang: "Siang",
  sore: "Sore",
}

// ─── Skeleton sub-components ──────────────────────────────────────────────────

const TableSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="space-y-2 p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full" />
    ))}
  </div>
)

// ─── Dokter Dashboard ─────────────────────────────────────────────────────────

interface DokterDashboardProps {
  user: AuthUser
}

const DokterDashboard = ({ user }: DokterDashboardProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  // ── Cari dokter yang sesuai dengan user auth ───────────────────────────────
  const dokterData = mockDokter.find((d) => d.nama === user.nama)
  const dokterId = dokterData?.id

  // ── Kunjungan untuk dokter ini ─────────────────────────────────────────────
  const kunjunganDokter = mockKunjungan.filter((k) => k.dokterId === dokterId)

  const pasienMenunggu = kunjunganDokter.filter((k) => k.status === "menunggu").length
  const sudahDiperiksa = kunjunganDokter.filter((k) => k.status === "selesai").length
  const resepDitulis = kunjunganDokter.filter(
    (k) => k.resep && k.resep.length > 0,
  ).length

  // ── Jadwal hari ini (Sabtu) ────────────────────────────────────────────────
  const jadwalHariIni = mockJadwal.filter(
    (j) => j.dokterId === dokterId && j.hari === "sabtu",
  )

  const totalKapasitas = jadwalHariIni.reduce(
    (sum, j) => sum + j.kapasitasMaksimal,
    0,
  )
  const kapasitasTerisi = kunjunganDokter.filter(
    (k) => k.status !== "batal",
  ).length
  const kapasitaTersisa = Math.max(0, totalKapasitas - kapasitasTerisi)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Selamat Datang, ${user.nama}`}
        subtitle={dokterData ? `${dokterData.spesialisasi} · ${dokterData.nomorSIP}` : ""}
      />

      {/* ── Row 1: Stats ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          title="Pasien Menunggu"
          value={loading ? "—" : pasienMenunggu}
          subtitle="dalam antrian"
          icon={<Clock className="h-5 w-5" />}
          variant="warning"
          loading={loading}
        />
        <StatsCard
          title="Sudah Diperiksa"
          value={loading ? "—" : sudahDiperiksa}
          subtitle="selesai hari ini"
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
          loading={loading}
        />
        <StatsCard
          title="Resep Ditulis"
          value={loading ? "—" : resepDitulis}
          subtitle="resep hari ini"
          icon={<Pill className="h-5 w-5" />}
          variant="default"
          loading={loading}
        />
      </div>

      {/* ── Row 2: Antrian Dokter ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Antrian Pasien Saya</CardTitle>
            {!loading && (
              <span className="text-sm text-muted-foreground">
                {kunjunganDokter.length} total
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : kunjunganDokter.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              Tidak ada pasien dalam antrian hari ini
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">No. Antrian</TableHead>
                    <TableHead>Pasien</TableHead>
                    <TableHead className="w-[80px]">Umur</TableHead>
                    <TableHead>Keluhan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kunjunganDokter.map((k) => {
                    const statusCfg = STATUS_KUNJUNGAN[k.status]
                    const umur = hitungUmur(k.pasien.tanggalLahir)
                    const hasAlergiObat = k.pasien.alergi.some(
                      (a) => a.jenisAlergi === "obat",
                    )

                    return (
                      <TableRow key={k.id}>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-medium">
                              {k.noAntrian}
                            </span>
                            {hasAlergiObat && (
                              <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-1">
                                ALERGI
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{k.pasien.nama}</p>
                            <p className="text-xs text-muted-foreground">
                              {k.pasien.noRM}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{umur} th</TableCell>
                        <TableCell>
                          <p className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {k.screening?.keluhanUtama ?? (
                              <span className="italic">Belum screening</span>
                            )}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusCfg.variant}
                            className={statusCfg.className}
                          >
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {(k.status === "dipanggil" ||
                            k.status === "menunggu") && (
                            <Button
                              size="sm"
                              onClick={() =>
                                router.push(`/rekam-medis/${k.id}`)
                              }
                            >
                              Periksa
                            </Button>
                          )}
                          {k.status === "sedang_diperiksa" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(`/rekam-medis/${k.id}`)
                              }
                            >
                              Lanjutkan
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Row 3: Jadwal Hari Ini ────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">
          Jadwal Hari Ini — Sabtu, 14 Juni 2026
        </h2>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : jadwalHariIni.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Tidak ada jadwal praktek hari ini
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {jadwalHariIni.map((j) => {
              const terisi = kunjunganDokter.filter(
                (k) => k.status !== "batal",
              ).length
              const tersisa = Math.max(0, j.kapasitasMaksimal - terisi)
              const pctFull = Math.min(100, (terisi / j.kapasitasMaksimal) * 100)

              return (
                <div
                  key={j.id}
                  className={cn(
                    "rounded-xl border p-4 space-y-3",
                    j.isLibur
                      ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10"
                      : "border-border bg-card",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-semibold">
                          {SESI_MAP[j.sesi]} — {HARI_MAP[j.hari]}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {j.jamMulai} – {j.jamSelesai} WIB
                      </p>
                    </div>
                    {j.isLibur && (
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                        Libur
                      </Badge>
                    )}
                  </div>

                  {j.isLibur ? (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{j.keteranganLibur}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Kapasitas</span>
                        <span className="font-medium">
                          {terisi} / {j.kapasitasMaksimal} pasien
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            pctFull >= 80 ? "bg-red-500" : "bg-emerald-500",
                          )}
                          style={{ width: `${pctFull}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Stethoscope className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {tersisa} slot tersisa
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export { DokterDashboard }
