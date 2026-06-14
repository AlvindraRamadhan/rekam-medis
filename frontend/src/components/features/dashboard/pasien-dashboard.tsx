"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  CalendarPlus,
  Clock,
  CreditCard,
  Hash,
  Stethoscope,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { mockKunjungan } from "@/data/mock/kunjungan"
import { STATUS_KUNJUNGAN } from "@/lib/constants/status"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/store/auth-store"

import { PageHeader } from "../../shared/page-header"

// ─── Mock kunjungan untuk pasien portal (demo) ────────────────────────────────
// Auth user pasien tidak ada di mockPasien, gunakan data kunjungan demo
const kunjunganPortal = mockKunjungan.find((k) => k.status === "menunggu")
const riwayatPortal = mockKunjungan
  .filter((k) => k.status === "selesai")
  .slice(0, 3)

// ─── Quick Action Item ─────────────────────────────────────────────────────────

interface QuickActionProps {
  icon: React.ReactNode
  label: string
  description: string
  href: string
  className?: string
}

const QuickAction = ({ icon, label, description, href, className }: QuickActionProps) => {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(href)}
      className={cn(
        "flex w-full items-start gap-4 rounded-xl border bg-card p-4 text-left transition-all hover:bg-accent hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={label}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
        {icon}
      </div>
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}

// ─── Pasien Dashboard ─────────────────────────────────────────────────────────

interface PasienDashboardProps {
  user: AuthUser
}

const PasienDashboard = ({ user }: PasienDashboardProps) => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const antrianAktif = kunjunganPortal
  const statusCfg = antrianAktif ? STATUS_KUNJUNGAN[antrianAktif.status] : null

  const estimasiMenit =
    antrianAktif?.status === "menunggu"
      ? "± 30 menit"
      : antrianAktif?.status === "dipanggil"
        ? "Silahkan masuk"
        : "Sedang diperiksa"

  return (
    <div className="space-y-6">
      {/* ── Row 1: Sambutan ───────────────────────────────────────────────── */}
      <PageHeader
        title={`Halo, ${user.nama}!`}
        subtitle="Selamat datang di portal pasien Smart Clinic"
      />

      {/* ── Row 2: Status Antrian ─────────────────────────────────────────── */}
      {loading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : antrianAktif ? (
        <Card
          className={cn(
            "overflow-hidden",
            antrianAktif.status === "dipanggil" && "ring-2 ring-blue-400 dark:ring-blue-600",
          )}
        >
          <CardHeader className="bg-emerald-600 dark:bg-emerald-800 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Status Antrian Hari Ini</CardTitle>
              {statusCfg && (
                <Badge className={cn(statusCfg.className, "border")}>
                  {statusCfg.label}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground">Nomor Antrian</p>
                <div className="mt-1 flex items-center gap-2">
                  <Hash className="h-6 w-6 text-emerald-500" />
                  <span className="font-mono text-4xl font-bold text-foreground">
                    {antrianAktif.noAntrian}
                  </span>
                </div>
              </div>

              <div className="h-px w-full bg-border sm:h-16 sm:w-px" />

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Dokter</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{antrianAktif.dokter.nama}</span>
                </div>
                <p className="text-xs text-muted-foreground">{antrianAktif.poli}</p>
              </div>

              <div className="h-px w-full bg-border sm:h-16 sm:w-px" />

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Estimasi</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{estimasiMenit}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Tidak ada antrian aktif hari ini
          </p>
        </div>
      )}

      {/* ── Row 3: Quick Actions ──────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">Layanan Cepat</h2>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <QuickAction
              icon={<CalendarPlus className="h-5 w-5" />}
              label="Booking Kunjungan Baru"
              description="Buat janji kunjungan ke dokter"
              href="/portal-pasien/booking"
            />
            <QuickAction
              icon={<BookOpen className="h-5 w-5" />}
              label="Lihat Riwayat"
              description="Riwayat kunjungan & rekam medis"
              href="/portal-pasien/riwayat"
            />
            <QuickAction
              icon={<CreditCard className="h-5 w-5" />}
              label="Lihat Tagihan"
              description="Invoice & status pembayaran"
              href="/portal-pasien/tagihan"
            />
          </div>
        )}
      </div>

      {/* ── Row 4: Kunjungan Terakhir ────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">
          Kunjungan Terakhir
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : riwayatPortal.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Belum ada riwayat kunjungan
          </div>
        ) : (
          <div className="space-y-3">
            {riwayatPortal.map((k) => {
              const tgl = new Date(k.tanggalKunjungan)
              const tglStr = tgl.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
              const statusCfg = STATUS_KUNJUNGAN[k.status]

              return (
                <div
                  key={k.id}
                  className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{tglStr}</p>
                      <Badge
                        variant={statusCfg.variant}
                        className={cn(statusCfg.className, "text-[10px]")}
                      >
                        {statusCfg.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {k.dokter.nama} · {k.poli}
                    </p>
                    {k.rekamMedis?.diagnosisUtama && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        Diagnosis:{" "}
                        <span className="text-foreground">
                          {k.rekamMedis.diagnosisUtama.deskripsi}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 font-mono text-xs text-muted-foreground">
                    {k.noAntrian}
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

export { PasienDashboard }
