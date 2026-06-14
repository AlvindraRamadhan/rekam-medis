'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, PillIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { FormResep } from '@/components/features/resep/form-resep'
import { useAntrianStore } from '@/store/antrian-store'
import { mockKunjungan } from '@/data/mock/kunjungan'

export default function ResepFormPage({
  params,
}: {
  params: Promise<{ kunjunganId: string }>
}) {
  const { kunjunganId } = use(params)
  const router = useRouter()
  const { kunjunganList } = useAntrianStore()

  const kunjungan =
    kunjunganList.find((k) => k.id === kunjunganId) ??
    mockKunjungan.find((k) => k.id === kunjunganId)

  if (!kunjungan) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Sticky header ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3 px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/rekam-medis/${kunjunganId}`)}
            className="shrink-0"
          >
            <ArrowLeftIcon className="size-4" />
            Kembali ke SOAP
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2 min-w-0">
            <PillIcon className="size-4 text-purple-600 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-sm">Resep Elektronik</p>
              <p className="text-xs text-muted-foreground truncate">
                {kunjungan.noAntrian} · {kunjungan.pasien.nama} · {kunjungan.poli}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-6">
        <FormResep
          kunjungan={kunjungan}
          onSuccess={() => {
            setTimeout(() => router.push('/resep'), 1500)
          }}
        />
      </div>
    </div>
  )
}
