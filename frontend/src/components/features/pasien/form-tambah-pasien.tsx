'use client'

import { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CalendarIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { usePasienStore } from '@/store/pasien-store'
import { formatTanggal } from '@/lib/utils'
import type { Pasien } from '@/types'

// ─── Schema ───────────────────────────────────────────────────────────────────

const alergiSchema = z.object({
  jenisAlergi: z.enum(['obat', 'makanan', 'lainnya']),
  namaAlergen: z.string().min(1, 'Nama alergen wajib diisi'),
  reaksi: z.string().min(1, 'Reaksi wajib diisi'),
  severity: z.enum(['ringan', 'sedang', 'berat']),
})

const formSchema = z
  .object({
    nama: z.string().min(1, 'Nama wajib diisi'),
    nik: z
      .string()
      .length(16, 'NIK harus tepat 16 digit')
      .regex(/^\d+$/, 'NIK hanya boleh berisi angka'),
    tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
    jenisKelamin: z.enum(['L', 'P'], { message: 'Pilih jenis kelamin' }),
    golonganDarah: z.enum(['A', 'B', 'AB', 'O', '-']),
    alamat: z.string(),
    noTelepon: z.string(),
    isPasienBPJS: z.boolean(),
    noKartuBPJS: z.string(),
    faskesTingkat1: z.string(),
    jenisKepesertaan: z.string(),
    alergi: z.array(alergiSchema),
  })
  .superRefine((data, ctx) => {
    if (data.isPasienBPJS) {
      if (!data.noKartuBPJS || !/^\d{13}$/.test(data.noKartuBPJS)) {
        ctx.addIssue({
          code: 'custom',
          message: 'No kartu BPJS harus tepat 13 digit angka',
          path: ['noKartuBPJS'],
        })
      }
      if (!data.faskesTingkat1) {
        ctx.addIssue({
          code: 'custom',
          message: 'FKTP wajib diisi untuk pasien BPJS',
          path: ['faskesTingkat1'],
        })
      }
      if (!data.jenisKepesertaan) {
        ctx.addIssue({
          code: 'custom',
          message: 'Jenis kepesertaan wajib dipilih',
          path: ['jenisKepesertaan'],
        })
      }
    }
  })

type FormValues = z.infer<typeof formSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface FormTambahPasienProps {
  open: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export const FormTambahPasien = ({ open, onClose }: FormTambahPasienProps) => {
  const { pasienList, tambahPasien } = usePasienStore()
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: '',
      nik: '',
      tanggalLahir: '',
      jenisKelamin: 'L',
      golonganDarah: 'O',
      alamat: '',
      noTelepon: '',
      isPasienBPJS: false,
      noKartuBPJS: '',
      faskesTingkat1: '',
      jenisKepesertaan: '',
      alergi: [],
    },
  })

  const { fields: alergiFields, append, remove } = useFieldArray({
    control,
    name: 'alergi',
  })

  const isPasienBPJS = watch('isPasienBPJS')
  const tanggalLahirValue = watch('tanggalLahir')

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (data: FormValues) => {
    const nextIndex = pasienList.length + 1
    const tahun = new Date().getFullYear()
    const noRM = `RM-${tahun}-${String(nextIndex).padStart(5, '0')}`
    const id = `pas-${String(nextIndex).padStart(3, '0')}`

    const newPasien: Pasien = {
      id,
      noRM,
      nik: data.nik,
      nama: data.nama,
      tanggalLahir: new Date(data.tanggalLahir),
      jenisKelamin: data.jenisKelamin,
      alamat: data.alamat ?? '',
      noTelepon: data.noTelepon ?? '',
      golonganDarah: data.golonganDarah,
      alergi: data.alergi.map((a, i) => ({
        id: `alg-new-${Date.now()}-${i}`,
        ...a,
      })),
      bpjs: data.isPasienBPJS
        ? {
            noKartu: data.noKartuBPJS ?? '',
            faskesTingkat1: data.faskesTingkat1 ?? '',
            jenisKepesertaan: data.jenisKepesertaan ?? '',
            statusAktif: true,
          }
        : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    tambahPasien(newPasien)
    toast.success('Pasien berhasil didaftarkan', {
      description: `No RM: ${noRM}`,
    })
    handleClose()
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>Tambah Pasien Baru</SheetTitle>
          <SheetDescription>
            Isi data pasien. No RM akan dibuat otomatis.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <form
            id="form-tambah-pasien"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6 px-6 py-4"
          >
            {/* ── Section 1: Data Pribadi ─────────────────────────────────── */}
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Data Pribadi</h3>

              {/* Nama */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nama">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama"
                  placeholder="Nama lengkap pasien"
                  {...register('nama')}
                  aria-invalid={!!errors.nama}
                />
                {errors.nama && (
                  <p className="text-xs text-destructive">{errors.nama.message}</p>
                )}
              </div>

              {/* NIK */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nik">
                  NIK (16 digit) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nik"
                  placeholder="3201xxxxxxxxxx"
                  maxLength={16}
                  {...register('nik')}
                  aria-invalid={!!errors.nik}
                />
                {errors.nik && (
                  <p className="text-xs text-destructive">{errors.nik.message}</p>
                )}
              </div>

              {/* Tanggal Lahir */}
              <div className="flex flex-col gap-1.5">
                <Label>
                  Tanggal Lahir <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="tanggalLahir"
                  render={({ field }) => (
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !field.value ? 'text-muted-foreground' : ''
                            }`}
                          />
                        }
                      >
                        <CalendarIcon data-icon="inline-start" />
                        {field.value
                          ? formatTanggal(new Date(field.value))
                          : 'Pilih tanggal lahir'}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date ? date.toISOString() : '')
                            setDatePickerOpen(false)
                          }}
                          captionLayout="dropdown"
                          startMonth={new Date(1930, 0, 1)}
                          endMonth={new Date()}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.tanggalLahir && (
                  <p className="text-xs text-destructive">{errors.tanggalLahir.message}</p>
                )}
              </div>

              {/* Jenis Kelamin */}
              <div className="flex flex-col gap-1.5">
                <Label>
                  Jenis Kelamin <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="jenisKelamin"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-row gap-6"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="L" id="laki-laki" />
                        <Label htmlFor="laki-laki" className="cursor-pointer font-normal">
                          Laki-laki
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="P" id="perempuan" />
                        <Label htmlFor="perempuan" className="cursor-pointer font-normal">
                          Perempuan
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.jenisKelamin && (
                  <p className="text-xs text-destructive">{errors.jenisKelamin.message}</p>
                )}
              </div>

              {/* Golongan Darah */}
              <div className="flex flex-col gap-1.5">
                <Label>Golongan Darah</Label>
                <Controller
                  control={control}
                  name="golonganDarah"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih golongan darah" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {(['A', 'B', 'AB', 'O', '-'] as const).map((gol) => (
                            <SelectItem key={gol} value={gol}>
                              {gol === '-' ? 'Tidak Diketahui' : gol}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Alamat */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  placeholder="Alamat lengkap pasien"
                  rows={2}
                  {...register('alamat')}
                />
              </div>

              {/* No Telepon */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="noTelepon">No Telepon (WhatsApp)</Label>
                <Input
                  id="noTelepon"
                  placeholder="08xxxxxxxxxx"
                  {...register('noTelepon')}
                />
              </div>
            </section>

            <Separator />

            {/* ── Section 2: Data BPJS ────────────────────────────────────── */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Data BPJS</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor="toggle-bpjs" className="text-sm font-normal text-muted-foreground">
                    Pasien BPJS?
                  </Label>
                  <Controller
                    control={control}
                    name="isPasienBPJS"
                    render={({ field }) => (
                      <Switch
                        id="toggle-bpjs"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              {isPasienBPJS && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="noKartuBPJS">
                      No Kartu BPJS (13 digit) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="noKartuBPJS"
                      placeholder="0000000000000"
                      maxLength={13}
                      {...register('noKartuBPJS')}
                      aria-invalid={!!errors.noKartuBPJS}
                    />
                    {errors.noKartuBPJS && (
                      <p className="text-xs text-destructive">{errors.noKartuBPJS.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="faskesTingkat1">
                      FKTP Terdaftar <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="faskesTingkat1"
                      placeholder="Nama Puskesmas / Klinik FKTP"
                      {...register('faskesTingkat1')}
                      aria-invalid={!!errors.faskesTingkat1}
                    />
                    {errors.faskesTingkat1 && (
                      <p className="text-xs text-destructive">{errors.faskesTingkat1.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>
                      Jenis Kepesertaan <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="jenisKepesertaan"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih jenis kepesertaan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="PBI">PBI (Penerima Bantuan Iuran)</SelectItem>
                              <SelectItem value="Non-PBI">Non-PBI</SelectItem>
                              <SelectItem value="PPU">PPU (Pekerja Penerima Upah)</SelectItem>
                              <SelectItem value="PBPU">PBPU (Pekerja Bukan Penerima Upah)</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.jenisKepesertaan && (
                      <p className="text-xs text-destructive">{errors.jenisKepesertaan.message}</p>
                    )}
                  </div>
                </div>
              )}
            </section>

            <Separator />

            {/* ── Section 3: Alergi ───────────────────────────────────────── */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Riwayat Alergi</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      jenisAlergi: 'obat',
                      namaAlergen: '',
                      reaksi: '',
                      severity: 'ringan',
                    })
                  }
                >
                  <PlusIcon data-icon="inline-start" />
                  Tambah Alergi
                </Button>
              </div>

              {alergiFields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Tidak ada riwayat alergi. Klik &quot;Tambah Alergi&quot; untuk menambahkan.
                </p>
              )}

              {alergiFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Alergi #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(index)}
                      className="size-7 text-destructive hover:text-destructive"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label>Jenis Alergi</Label>
                      <Controller
                        control={control}
                        name={`alergi.${index}.jenisAlergi`}
                        render={({ field: f }) => (
                          <Select value={f.value} onValueChange={f.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="obat">Obat</SelectItem>
                                <SelectItem value="makanan">Makanan</SelectItem>
                                <SelectItem value="lainnya">Lainnya</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label>Severity</Label>
                      <Controller
                        control={control}
                        name={`alergi.${index}.severity`}
                        render={({ field: f }) => (
                          <Select value={f.value} onValueChange={f.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="ringan">Ringan</SelectItem>
                                <SelectItem value="sedang">Sedang</SelectItem>
                                <SelectItem value="berat">Berat</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`alergi-${index}-nama`}>Nama Alergen</Label>
                    <Input
                      id={`alergi-${index}-nama`}
                      placeholder="cth: Amoksisilin, Udang"
                      {...register(`alergi.${index}.namaAlergen`)}
                      aria-invalid={!!errors.alergi?.[index]?.namaAlergen}
                    />
                    {errors.alergi?.[index]?.namaAlergen && (
                      <p className="text-xs text-destructive">
                        {errors.alergi[index].namaAlergen?.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`alergi-${index}-reaksi`}>Reaksi</Label>
                    <Input
                      id={`alergi-${index}-reaksi`}
                      placeholder="cth: Ruam kulit, gatal-gatal"
                      {...register(`alergi.${index}.reaksi`)}
                      aria-invalid={!!errors.alergi?.[index]?.reaksi}
                    />
                    {errors.alergi?.[index]?.reaksi && (
                      <p className="text-xs text-destructive">
                        {errors.alergi[index].reaksi?.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </section>
          </form>
        </ScrollArea>

        <SheetFooter className="border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button
            type="submit"
            form="form-tambah-pasien"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Daftarkan Pasien'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
