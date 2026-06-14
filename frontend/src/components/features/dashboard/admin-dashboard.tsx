"use client"

import { useEffect, useState } from "react"
import {
  Activity,
  Banknote,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react"
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { toast } from "sonner"

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
import { mockTagihan } from "@/data/mock/tagihan"
import { STATUS_KUNJUNGAN } from "@/lib/constants/status"
import { cn } from "@/lib/utils"
import type { Kunjungan, StatusKunjungan } from "@/types"

import { PageHeader } from "../../shared/page-header"
import { StatsCard } from "../../shared/stats-card"

// ─── Mock data untuk grafik ───────────────────────────────────────────────────

const lineChartData = [
  { tanggal: "08 Jun", kunjungan: 12 },
  { tanggal: "09 Jun", kunjungan: 18 },
  { tanggal: "10 Jun", kunjungan: 15 },
  { tanggal: "11 Jun", kunjungan: 22 },
  { tanggal: "12 Jun", kunjungan: 19 },
  { tanggal: "13 Jun", kunjungan: 14 },
  { tanggal: "14 Jun", kunjungan: 15 },
]

const PIE_COLORS = ["#10b981", "#3b82f6"]

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

// ─── Komponen Tabel Skeleton ─────────────────────────────────────────────────

const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-2 p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full" />
    ))}
  </div>
)

// ─── Komponen Chart Skeleton ──────────────────────────────────────────────────

const ChartSkeleton = () => (
  <div className="flex h-[280px] items-center justify-center">
    <Skeleton className="h-[240px] w-full rounded-lg" />
  </div>
)

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [antrian, setAntrian] = useState<Kunjungan[]>([...mockKunjungan])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  // ── Derived stats ──────────────────────────────────────────────────────────

  const totalKunjungan = antrian.filter((k) => k.status !== "batal").length

  const antrianAktif = antrian.filter(
    (k) => k.status === "menunggu" || k.status === "dipanggil",
  ).length

  const today = new Date("2026-06-14")
  const pendapatanHariIni = mockTagihan
    .filter((t) => {
      if (t.status !== "lunas" || !t.paidAt) return false
      const paid = new Date(t.paidAt)
      return (
        paid.getFullYear() === today.getFullYear() &&
        paid.getMonth() === today.getMonth() &&
        paid.getDate() === today.getDate()
      )
    })
    .reduce((sum, t) => sum + t.totalBiaya, 0)

  const klaimBPJSPending = antrian.filter(
    (k) => k.jenisKunjungan === "bpjs" && k.status !== "selesai" && k.status !== "batal",
  ).length

  const pieData = [
    { name: "BPJS", value: antrian.filter((k) => k.jenisKunjungan === "bpjs").length },
    { name: "Umum", value: antrian.filter((k) => k.jenisKunjungan === "umum").length },
  ]

  // ── Actions ────────────────────────────────────────────────────────────────

  const handlePanggil = (id: string, namaPasien: string) => {
    setAntrian((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, status: "dipanggil" as StatusKunjungan } : k,
      ),
    )
    toast.success(`Pasien ${namaPasien} berhasil dipanggil`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Admin"
        subtitle="Pantau aktivitas klinik secara real-time"
      />

      {/* ── Row 1: Stats Cards ──────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Kunjungan Hari Ini"
          value={loading ? "—" : totalKunjungan}
          subtitle="kunjungan"
          icon={<Activity className="h-5 w-5" />}
          trend="up"
          trendValue="+3 dari kemarin"
          variant="default"
          loading={loading}
        />
        <StatsCard
          title="Antrian Aktif"
          value={loading ? "—" : antrianAktif}
          subtitle="menunggu & dipanggil"
          icon={<Users className="h-5 w-5" />}
          variant="warning"
          loading={loading}
        />
        <StatsCard
          title="Pendapatan Hari Ini"
          value={loading ? "—" : formatRupiah(pendapatanHariIni)}
          subtitle="dari tagihan lunas"
          icon={<Banknote className="h-5 w-5" />}
          trend="up"
          trendValue="+12% dari minggu lalu"
          variant="success"
          loading={loading}
        />
        <StatsCard
          title="Klaim BPJS Pending"
          value={loading ? "—" : klaimBPJSPending}
          subtitle="belum selesai"
          icon={<ClipboardList className="h-5 w-5" />}
          variant="danger"
          loading={loading}
        />
      </div>

      {/* ── Row 2: Tabel Antrian Real-time ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Antrian Real-time</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={6} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">No. Antrian</TableHead>
                    <TableHead>Pasien</TableHead>
                    <TableHead>Dokter</TableHead>
                    <TableHead>Poli</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {antrian.map((k) => {
                    const statusCfg = STATUS_KUNJUNGAN[k.status]
                    return (
                      <TableRow key={k.id}>
                        <TableCell className="font-mono font-medium">
                          {k.noAntrian}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{k.pasien.nama}</p>
                            <p className="text-xs text-muted-foreground">
                              {k.jenisKunjungan === "bpjs" ? "BPJS" : "Umum"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{k.dokter.nama}</TableCell>
                        <TableCell className="text-sm">{k.poli}</TableCell>
                        <TableCell>
                          <Badge
                            variant={statusCfg.variant}
                            className={statusCfg.className}
                          >
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {k.status === "menunggu" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePanggil(k.id, k.pasien.nama)}
                            >
                              Panggil
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

      {/* ── Row 3: Charts ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Kunjungan 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={lineChartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="tanggal"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="kunjungan"
                    name="Kunjungan"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Jenis Kunjungan</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 4: Status Integrasi ─────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* SatuSehat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-emerald-500" />
              Status Integrasi SatuSehat
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Sinkronisasi Berhasil
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Terakhir sinkronisasi: 14 Jun 2026, 09:00 WIB
                </p>
                <p className="text-sm text-muted-foreground">
                  11 rekam medis berhasil dikirim hari ini
                </p>
                <div className="mt-1 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Semua data pasien telah tersinkronisasi dengan platform SatuSehat
                    Kemenkes.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BPJS Klaim Terbaru */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-500" />
              BPJS Klaim Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {antrian
                  .filter((k) => k.jenisKunjungan === "bpjs")
                  .slice(0, 4)
                  .map((k) => {
                    const statusCfg = STATUS_KUNJUNGAN[k.status]
                    return (
                      <div
                        key={k.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{k.pasien.nama}</p>
                          <p className="text-xs text-muted-foreground">
                            SEP: {k.noSEP ?? "Belum dibuat"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {k.status === "selesai" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-amber-500" />
                          )}
                          <Badge
                            variant={statusCfg.variant}
                            className={cn(statusCfg.className, "text-[10px]")}
                          >
                            {statusCfg.label}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { AdminDashboard }
