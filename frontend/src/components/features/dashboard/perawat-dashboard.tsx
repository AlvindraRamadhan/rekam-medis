"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ClipboardCheck,
  ClipboardList,
  Stethoscope,
  Users,
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
import { mockKunjungan } from "@/data/mock/kunjungan"
import { STATUS_KUNJUNGAN } from "@/lib/constants/status"
import { cn } from "@/lib/utils"

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

// ─── Skeleton sub-components ──────────────────────────────────────────────────

const TableSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="space-y-2 p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full" />
    ))}
  </div>
)

// ─── Perawat Dashboard ────────────────────────────────────────────────────────

const PerawatDashboard = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  // ── Derived data ───────────────────────────────────────────────────────────

  const belumScreening = mockKunjungan.filter(
    (k) => k.status === "menunggu" && !k.screening,
  )

  const sudahScreening = mockKunjungan.filter(
    (k) =>
      k.screening !== undefined ||
      k.status === "selesai",
  )

  const sedangDiproses = mockKunjungan.filter(
    (k) => k.status === "dipanggil" || k.status === "sedang_diperiksa",
  )

  const totalHariIni = mockKunjungan.filter((k) => k.status !== "batal").length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Perawat"
        subtitle="Kelola antrian dan screening pasien"
      />

      {/* ── Row 1: Stats ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          title="Menunggu Screening"
          value={loading ? "—" : belumScreening.length}
          subtitle="pasien antri"
          icon={<ClipboardList className="h-5 w-5" />}
          variant="warning"
          loading={loading}
        />
        <StatsCard
          title="Sudah Di-screening"
          value={loading ? "—" : sudahScreening.length}
          subtitle="selesai hari ini"
          icon={<ClipboardCheck className="h-5 w-5" />}
          variant="success"
          loading={loading}
        />
        <StatsCard
          title="Total Kunjungan"
          value={loading ? "—" : totalHariIni}
          subtitle="hari ini"
          icon={<Users className="h-5 w-5" />}
          variant="default"
          loading={loading}
        />
      </div>

      {/* ── Row 2: Tabel Antrian Belum Screening ──────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Antrian Belum Screening</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={5} />
          ) : belumScreening.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              Semua pasien sudah di-screening
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">No. Antrian</TableHead>
                    <TableHead>Pasien</TableHead>
                    <TableHead className="w-[80px]">Umur</TableHead>
                    <TableHead>Poli</TableHead>
                    <TableHead>Alergi</TableHead>
                    <TableHead className="w-[140px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {belumScreening.map((k) => {
                    const hasAlergi =
                      k.pasien.alergi && k.pasien.alergi.length > 0
                    const umur = hitungUmur(k.pasien.tanggalLahir)

                    return (
                      <TableRow key={k.id}>
                        <TableCell className="font-mono font-medium">
                          {k.noAntrian}
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
                        <TableCell className="text-sm">{k.poli}</TableCell>
                        <TableCell>
                          {hasAlergi ? (
                            <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {k.pasien.alergi.length} Alergi
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(`/antrian/${k.id}/screening`)
                            }
                          >
                            Mulai Screening
                          </Button>
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

      {/* ── Row 3: Pasien Sedang Diproses ─────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">
          Pasien Sedang Diproses ({sedangDiproses.length})
        </h2>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : sedangDiproses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tidak ada pasien yang sedang diproses.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sedangDiproses.map((k) => {
              const statusCfg = STATUS_KUNJUNGAN[k.status]
              const isScreening = k.status === "sedang_diperiksa"

              return (
                <div
                  key={k.id}
                  className={cn(
                    "rounded-xl border p-4 transition-colors",
                    isScreening
                      ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10"
                      : "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{k.pasien.nama}</p>
                      <p className="text-xs text-muted-foreground">
                        {k.noAntrian} · {k.dokter.nama}
                      </p>
                    </div>
                    <Badge
                      variant={statusCfg.variant}
                      className={cn(statusCfg.className, "shrink-0 text-[10px]")}
                    >
                      {statusCfg.label}
                    </Badge>
                  </div>
                  {k.screening && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      Keluhan: {k.screening.keluhanUtama}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Stethoscope className="h-3 w-3" />
                    <span>{k.poli}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export { PerawatDashboard }
