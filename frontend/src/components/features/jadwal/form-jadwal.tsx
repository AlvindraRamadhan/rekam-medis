'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

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
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useJadwalStore } from '@/store/jadwal-store'
import { mockDokter } from '@/data/mock/dokter'
import type { JadwalDokter } from '@/types'

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z
  .object({
    dokterId: z.string().min(1, 'Pilih dokter'),
    hari: z.enum([
      'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu',
    ]),
    sesi: z.enum(['pagi', 'siang', 'sore']),
    jamMulai: z.string().min(1, 'Jam mulai wajib diisi'),
    jamSelesai: z.string().min(1, 'Jam selesai wajib diisi'),
    kapasitasMaksimal: z
      .number()
      .min(1, 'Minimal 1 pasien')
      .max(50, 'Maksimal 50 pasien'),
    isLibur: z.boolean(),
    keteranganLibur: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.jamSelesai && data.jamMulai && data.jamSelesai <= data.jamMulai) {
      ctx.addIssue({
        code: 'custom',
        path: ['jamSelesai'],
        message: 'Jam selesai harus setelah jam mulai',
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

// ─── Constants ────────────────────────────────────────────────────────────────

const HARI_OPTIONS: { value: JadwalDokter['hari']; label: string }[] = [
  { value: 'senin', label: 'Senin' },
  { value: 'selasa', label: 'Selasa' },
  { value: 'rabu', label: 'Rabu' },
  { value: 'kamis', label: 'Kamis' },
  { value: 'jumat', label: 'Jumat' },
  { value: 'sabtu', label: 'Sabtu' },
  { value: 'minggu', label: 'Minggu' },
]

const SESI_OPTIONS: { value: JadwalDokter['sesi']; label: string; hint: string }[] = [
  { value: 'pagi', label: 'Pagi', hint: '08:00–12:00' },
  { value: 'siang', label: 'Siang', hint: '13:00–17:00' },
  { value: 'sore', label: 'Sore', hint: '17:00–20:00' },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface FormJadwalProps {
  open: boolean
  onClose: () => void
  editTarget?: JadwalDokter
  defaultHari?: JadwalDokter['hari']
  defaultSesi?: JadwalDokter['sesi']
  defaultDokterId?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export const FormJadwal = ({
  open,
  onClose,
  editTarget,
  defaultHari,
  defaultSesi,
  defaultDokterId,
}: FormJadwalProps) => {
  const { jadwalList, tambahJadwal, editJadwal, hapusJadwal } = useJadwalStore()
  const isEdit = !!editTarget

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dokterId: editTarget?.dokterId ?? defaultDokterId ?? mockDokter[0]?.id ?? '',
      hari: editTarget?.hari ?? defaultHari,
      sesi: editTarget?.sesi ?? defaultSesi,
      jamMulai: editTarget?.jamMulai ?? '',
      jamSelesai: editTarget?.jamSelesai ?? '',
      kapasitasMaksimal: editTarget?.kapasitasMaksimal ?? 15,
      isLibur: editTarget?.isLibur ?? false,
      keteranganLibur: editTarget?.keteranganLibur ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        dokterId: editTarget?.dokterId ?? defaultDokterId ?? mockDokter[0]?.id ?? '',
        hari: editTarget?.hari ?? defaultHari,
        sesi: editTarget?.sesi ?? defaultSesi,
        jamMulai: editTarget?.jamMulai ?? '',
        jamSelesai: editTarget?.jamSelesai ?? '',
        kapasitasMaksimal: editTarget?.kapasitasMaksimal ?? 15,
        isLibur: editTarget?.isLibur ?? false,
        keteranganLibur: editTarget?.keteranganLibur ?? '',
      })
    }
  }, [open, editTarget, defaultHari, defaultSesi, defaultDokterId, reset])

  const isLibur = watch('isLibur')

  const onSubmit = (data: FormValues) => {
    const isDuplicate = jadwalList.some(
      (j) =>
        j.dokterId === data.dokterId &&
        j.hari === data.hari &&
        j.sesi === data.sesi &&
        j.id !== editTarget?.id
    )
    if (isDuplicate) {
      toast.error('Jadwal untuk dokter, hari, dan sesi ini sudah ada')
      return
    }

    const selectedDokter = mockDokter.find((d) => d.id === data.dokterId)
    if (!selectedDokter) return

    if (isEdit && editTarget) {
      editJadwal(editTarget.id, { ...data, dokter: selectedDokter })
      toast.success('Jadwal berhasil diperbarui')
    } else {
      tambahJadwal({ ...data, dokter: selectedDokter })
      toast.success('Jadwal berhasil ditambahkan')
    }
    onClose()
  }

  const handleDelete = () => {
    if (!editTarget) return
    hapusJadwal(editTarget.id)
    toast.success('Jadwal berhasil dihapus')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Ubah detail jadwal atau tandai sebagai hari libur.'
              : 'Isi informasi jadwal praktik dokter.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <form
            id="form-jadwal"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 px-1 py-2"
          >
            {/* Dokter */}
            <div className="flex flex-col gap-1.5">
              <Label>Dokter</Label>
              <Controller
                control={control}
                name="dokterId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => v && field.onChange(v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih dokter..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {mockDokter.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            <span>{d.nama}</span>
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({d.spesialisasi})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.dokterId && (
                <p className="text-xs text-destructive">{errors.dokterId.message}</p>
              )}
            </div>

            {/* Hari */}
            <div className="flex flex-col gap-1.5">
              <Label>Hari</Label>
              <Controller
                control={control}
                name="hari"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => v && field.onChange(v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih hari..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {HARI_OPTIONS.map((h) => (
                          <SelectItem key={h.value} value={h.value}>
                            {h.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.hari && (
                <p className="text-xs text-destructive">{errors.hari.message}</p>
              )}
            </div>

            {/* Sesi */}
            <div className="flex flex-col gap-1.5">
              <Label>Sesi</Label>
              <Controller
                control={control}
                name="sesi"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => v && field.onChange(v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih sesi..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SESI_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            <span>{s.label}</span>
                            <span className="ml-1.5 text-xs text-muted-foreground">
                              — biasanya {s.hint}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.sesi && (
                <p className="text-xs text-destructive">{errors.sesi.message}</p>
              )}
            </div>

            {/* Jam */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="jamMulai">Jam Mulai</Label>
                <Input id="jamMulai" type="time" {...register('jamMulai')} />
                {errors.jamMulai && (
                  <p className="text-xs text-destructive">{errors.jamMulai.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="jamSelesai">Jam Selesai</Label>
                <Input id="jamSelesai" type="time" {...register('jamSelesai')} />
                {errors.jamSelesai && (
                  <p className="text-xs text-destructive">{errors.jamSelesai.message}</p>
                )}
              </div>
            </div>

            {/* Kapasitas */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kapasitasMaksimal">Kapasitas Maksimal Pasien</Label>
              <Input
                id="kapasitasMaksimal"
                type="number"
                min={1}
                max={50}
                {...register('kapasitasMaksimal', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">Antara 1 – 50 pasien per sesi</p>
              {errors.kapasitasMaksimal && (
                <p className="text-xs text-destructive">{errors.kapasitasMaksimal.message}</p>
              )}
            </div>

            <Separator />

            {/* Toggle Hari Libur */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="isLibur" className="cursor-pointer">
                  Tandai sebagai Hari Libur / Cuti
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Slot ini tidak akan menerima pendaftaran pasien
                </p>
              </div>
              <Controller
                control={control}
                name="isLibur"
                render={({ field }) => (
                  <Switch
                    id="isLibur"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Keterangan Libur */}
            {isLibur && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="keteranganLibur">Keterangan Libur</Label>
                <Textarea
                  id="keteranganLibur"
                  placeholder="Contoh: Cuti tahunan, Pelatihan nasional, Seminar dokter..."
                  rows={2}
                  {...register('keteranganLibur')}
                />
              </div>
            )}
          </form>
        </ScrollArea>

        <DialogFooter className="flex-row gap-2">
          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              className="mr-auto"
              onClick={handleDelete}
            >
              <Trash2Icon data-icon="inline-start" />
              Hapus Jadwal
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="form-jadwal">
            {isEdit ? 'Simpan Perubahan' : 'Tambah Jadwal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
