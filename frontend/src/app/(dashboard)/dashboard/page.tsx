"use client"

import { AdminDashboard } from "@/components/features/dashboard/admin-dashboard"
import { DokterDashboard } from "@/components/features/dashboard/dokter-dashboard"
import { PasienDashboard } from "@/components/features/dashboard/pasien-dashboard"
import { PerawatDashboard } from "@/components/features/dashboard/perawat-dashboard"
import { useAuthStore } from "@/store/auth-store"

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sesi tidak ditemukan. Silakan login kembali.
      </div>
    )
  }

  if (user.role === "admin") return <AdminDashboard />
  if (user.role === "perawat") return <PerawatDashboard />
  if (user.role === "dokter") return <DokterDashboard user={user} />
  if (user.role === "pasien") return <PasienDashboard user={user} />

  return null
}
