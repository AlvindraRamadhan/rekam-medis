'use client'

import { useState, useMemo } from 'react'
import {
  CheckIcon,
  ClockIcon,
  SearchIcon,
  UserCheckIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAntrianStore } from '@/store/antrian-store'
import { cn } from '@/lib/utils'
import type { Kunjungan } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatWaktu = (date: Date) => {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CheckinPasienProps {
  open: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CheckinPasien = ({ open, onClose }: CheckinPasienProps) => {
  const { kunjunganList, updateStatus } = useAntrianStore()

  const [query, setQuery] = useState('')
  const [selectedKunjungan, setSelectedKunjungan] =
    useState<Kunjungan | null>(null)
  const [confirming, setConfirming] = useState(false)

  // Search among today's kunjungan that are menunggu (not yet checked in)
  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return kunjunganList.filter((k) => {
      const isRelevantStatus = k.status === 'menunggu'
      const matchNama = k.pasien.nama.toLowerCase().includes(q)
      const matchNoRM = k.pasien.noRM.toLowerCase().includes(q)
      const matchNoAntrian = k.noAntrian.toLowerCase().includes(q)
      return isRelevantStatus && (matchNama || matchNoRM || matchNoAntrian)
    })
  }, [kunjunganList, query])

  const handleSelect = (k: Kunjungan) => {
    setSelectedKunjungan(k)
  }

  const handleConfirm = async () => {
    if (!selectedKunjungan) return
    setConfirming(true)
    await new Promise((res) => setTimeout(res, 600))
    updateStatus(selectedKunjungan.id, 'hadir')
    toast.success(
      `Check-in berhasil! ${selectedKunjungan.pasien.nama} — Antrian ${selectedKunjungan.noAntrian}`
    )
    setConfirming(false)
    handleClose()
  }

  const handleClose = () => {
    setQuery('')
    setSelectedKunjungan(null)
    setConfirming(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Check-in Pasien</DialogTitle>
          <DialogDescription>
            Cari pasien berdasarkan nama, No RM, atau No Antrian, lalu
            konfirmasi kehadiran.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama, No RM, atau No Antrian..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedKunjungan(null)
              }}
              className="pl-8"
              autoFocus
            />
          </div>

          {/* Search Results */}
          {query.trim() && (
            <ScrollArea className="max-h-64">
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Tidak ada kunjungan yang ditemukan
                  <p className="mt-1 text-xs">
                    Pastikan pasien sudah terdaftar dan statusnya{' '}
                    <strong>Menunggu</strong>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {searchResults.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => handleSelect(k)}
                      className={cn(
                        'flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50',
                        selectedKunjungan?.id === k.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card'
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600">
                            {k.noAntrian}
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              k.jenisKunjungan === 'bpjs'
                                ? 'border-blue-200 bg-blue-100 text-blue-700'
                                : 'border-gray-200 bg-gray-100 text-gray-600'
                            )}
                          >
                            {k.jenisKunjungan === 'bpjs' ? 'BPJS' : 'Umum'}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {k.pasien.nama}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {k.pasien.noRM} · {k.dokter.nama} · {k.poli}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ClockIcon className="size-3" />
                          Daftar {formatWaktu(k.createdAt)}
                        </div>
                      </div>
                      {selectedKunjungan?.id === k.id && (
                        <CheckIcon className="size-4 shrink-0 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}

          {/* Selected Patient Confirmation */}
          {selectedKunjungan && (
            <>
              <Separator />
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
                <div className="flex items-start gap-2">
                  <UserCheckIcon className="mt-0.5 size-4 shrink-0 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-teal-800">
                      Konfirmasi Kehadiran
                    </p>
                    <p className="mt-0.5 text-xs text-teal-700">
                      <strong>{selectedKunjungan.pasien.nama}</strong> —
                      Antrian{' '}
                      <strong>{selectedKunjungan.noAntrian}</strong>
                    </p>
                    <p className="text-xs text-teal-700">
                      {selectedKunjungan.dokter.nama} · {selectedKunjungan.poli}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedKunjungan || confirming}
          >
            {confirming ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Memproses...
              </>
            ) : (
              <>
                <UserCheckIcon data-icon="inline-start" />
                Konfirmasi Kehadiran
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
