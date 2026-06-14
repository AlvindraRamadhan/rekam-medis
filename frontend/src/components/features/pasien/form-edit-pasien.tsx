'use client'

import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon, PlusIcon, Trash2Icon } from 'lucide-react'
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
import { useAuthStore } from '@/store/auth-store'
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
    jenisKelamin: z.enum(['L', 'P']),
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

interface FormEditPasienProps {
  open: boolean
  onClose: () => void
  pasien: Pasien | null
}

// ─── ReadOnly Field ────────────────────────────────────────────────────────────

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1.5">
    <Label className="text-muted-foreground">{label}</Label>
    <div className="flex h-8 items-center rounded-lg border border-dashed bg-muted/40 px-2.5 text-sm text-muted-foreground">
      {value}
    </div>
  </div>
)

// ─── Component ────────────────────────────────────────────────────────────────

export const FormEditPasien = ({ open, onClose, pasien }: FormEditPasienProps) => {
  const { user } = useAuthStore()
  const { updatePasien } = usePasienStore()
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const isAdmin = user?.role === 'admin'
  const canEditDemografi = isAdmin
  const canEditAlergi = user?.role === 'admin' || user?.role === 'perawat' || user?.role === 'dokter'

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

  useEffect(() => {
    if (pasien && open) {
      reset({
        nama: pasien.nama,
        nik: pasien.nik,
        tanggalLahir: pasien.tanggalLahir.toISOString(),
        jenisKelamin: pasien.jenisKelamin,
        golonganDarah: pasien.golonganDarah,
        alamat: pasien.alamat,
        noTelepon: pasien.noTelepon,
        isPasienBPJS: !!pasien.bpjs,
        noKartuBPJS: pasien.bpjs?.noKartu ?? '',
        faskesTingkat1: pasien.bpjs?.faskesTingkat1 ?? '',
        jenisKepesertaan: pasien.bpjs?.jenisKepesertaan ?? '',
        alergi: pasien.alergi.map((a) => ({
          jenisAlergi: a.jenisAlergi,
          namaAlergen: a.namaAlergen,
          reaksi: a.reaksi,
          severity: a.severity,
        })),
      })
    }
  }, [pasien, open, reset])

  const isPasienBPJS = watch('isPasienBPJS')

  const handleClose = () => {
    onClose()
  }

  const onSubmit = (data: FormValues) => {
    if (!pasien) return

    updatePasien(pasien.id, {
      nama: data.nama,
      nik: data.nik,
      tanggalLahir: new Date(data.tanggalLahir),
      jenisKelamin: data.jenisKelamin,
      golonganDarah: data.golonganDarah,
      alamat: data.alamat ?? '',
      noTelepon: data.noTelepon ?? '',
      bpjs: data.isPasienBPJS
        ? {
            noKartu: data.noKartuBPJS ?? '',
            faskesTingkat1: data.faskesTingkat1 ?? '',
            jenisKepesertaan: data.jenisKepesertaan ?? '',
            statusAktif: pasien.bpjs?.statusAktif ?? true,
          }
        : undefined,
      alergi: data.alergi.map((a, i) => ({
        id: pasien.alergi[i]?.id ?? `alg-upd-${Date.now()}-${i}`,
        ...a,
      })),
    })

    toast.success('Data pasien berhasil diperbarui')
    handleClose()
  }

  if (!pasien) return null

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>Edit Data Pasien</SheetTitle>
          <SheetDescription>
            {isAdmin
              ? 'Edit data demografis dan alergi pasien.'
              : 'Anda hanya dapat mengubah data alergi pasien.'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <form
            id="form-edit-pasien"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6 px-6 py-4"
          >
            {/* ── Info pasien (always read-only) ─────────────────────────── */}
            <div className="rounded-lg bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">No RM</p>
              <p className="font-mono text-sm font-medium">{pasien.noRM}</p>
            </div>

            {/* ── Section 1: Data Pribadi ─────────────────────────────────── */}
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Data Pribadi</h3>

              {canEditDemografi ? (
                <>
                  {/* Nama - editable */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-nama">
                      Nama Lengkap <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-nama"
                      {...register('nama')}
                      aria-invalid={!!errors.nama}
                    />
                    {errors.nama && (
                      <p className="text-xs text-destructive">{errors.nama.message}</p>
                    )}
                  </div>

                  {/* NIK */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-nik">
                      NIK (16 digit) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-nik"
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
                    <Label>Jenis Kelamin</Label>
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
                            <RadioGroupItem value="L" id="edit-laki-laki" />
                            <Label htmlFor="edit-laki-laki" className="cursor-pointer font-normal">
                              Laki-laki
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="P" id="edit-perempuan" />
                            <Label htmlFor="edit-perempuan" className="cursor-pointer font-normal">
                              Perempuan
                            </Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
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
                            <SelectValue />
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
                    <Label htmlFor="edit-alamat">Alamat</Label>
                    <Textarea
                      id="edit-alamat"
                      rows={2}
                      {...register('alamat')}
                    />
                  </div>

                  {/* No Telepon */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-noTelepon">No Telepon (WhatsApp)</Label>
                    <Input id="edit-noTelepon" {...register('noTelepon')} />
                  </div>
                </>
              ) : (
                /* Read-only untuk non-Admin */
                <div className="flex flex-col gap-3">
                  <ReadOnlyField label="Nama Lengkap" value={pasien.nama} />
                  <ReadOnlyField label="NIK" value={pasien.nik} />
                  <ReadOnlyField
                    label="Tanggal Lahir"
                    value={formatTanggal(pasien.tanggalLahir)}
                  />
                  <ReadOnlyField
                    label="Jenis Kelamin"
                    value={pasien.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  />
                  <ReadOnlyField
                    label="Golongan Darah"
                    value={pasien.golonganDarah === '-' ? 'Tidak Diketahui' : pasien.golonganDarah}
                  />
                  <ReadOnlyField label="Alamat" value={pasien.alamat || '-'} />
                  <ReadOnlyField label="No Telepon" value={pasien.noTelepon || '-'} />
                </div>
              )}
            </section>

            {/* ── Section 2: Data BPJS ─────────────────────────────────────── */}
            {canEditDemografi && (
              <>
                <Separator />
                <section className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Data BPJS</h3>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="edit-toggle-bpjs" className="text-sm font-normal text-muted-foreground">
                        Pasien BPJS?
                      </Label>
                      <Controller
                        control={control}
                        name="isPasienBPJS"
                        render={({ field }) => (
                          <Switch
                            id="edit-toggle-bpjs"
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
                        <Label htmlFor="edit-noKartuBPJS">
                          No Kartu BPJS (13 digit) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="edit-noKartuBPJS"
                          maxLength={13}
                          {...register('noKartuBPJS')}
                          aria-invalid={!!errors.noKartuBPJS}
                        />
                        {errors.noKartuBPJS && (
                          <p className="text-xs text-destructive">{errors.noKartuBPJS.message}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-faskes">
                          FKTP Terdaftar <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="edit-faskes"
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
              </>
            )}

            <Separator />

            {/* ── Section 3: Alergi ───────────────────────────────────────── */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Riwayat Alergi</h3>
                {canEditAlergi && (
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
                )}
              </div>

              {alergiFields.length === 0 && (
                <p className="text-sm text-muted-foreground">Tidak ada riwayat alergi.</p>
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
                    {canEditAlergi && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => remove(index)}
                        className="size-7 text-destructive hover:text-destructive"
                      >
                        <Trash2Icon />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label>Jenis Alergi</Label>
                      {canEditAlergi ? (
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
                      ) : (
                        <div className="flex h-8 items-center rounded-lg border border-dashed bg-muted/40 px-2.5 text-sm capitalize text-muted-foreground">
                          {pasien.alergi[index]?.jenisAlergi ?? '-'}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label>Severity</Label>
                      {canEditAlergi ? (
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
                      ) : (
                        <div className="flex h-8 items-center rounded-lg border border-dashed bg-muted/40 px-2.5 text-sm capitalize text-muted-foreground">
                          {pasien.alergi[index]?.severity ?? '-'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Nama Alergen</Label>
                    {canEditAlergi ? (
                      <>
                        <Input
                          {...register(`alergi.${index}.namaAlergen`)}
                          aria-invalid={!!errors.alergi?.[index]?.namaAlergen}
                        />
                        {errors.alergi?.[index]?.namaAlergen && (
                          <p className="text-xs text-destructive">
                            {errors.alergi[index].namaAlergen?.message}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex h-8 items-center rounded-lg border border-dashed bg-muted/40 px-2.5 text-sm text-muted-foreground">
                        {pasien.alergi[index]?.namaAlergen ?? '-'}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Reaksi</Label>
                    {canEditAlergi ? (
                      <>
                        <Input
                          {...register(`alergi.${index}.reaksi`)}
                          aria-invalid={!!errors.alergi?.[index]?.reaksi}
                        />
                        {errors.alergi?.[index]?.reaksi && (
                          <p className="text-xs text-destructive">
                            {errors.alergi[index].reaksi?.message}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex h-8 items-center rounded-lg border border-dashed bg-muted/40 px-2.5 text-sm text-muted-foreground">
                        {pasien.alergi[index]?.reaksi ?? '-'}
                      </div>
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
            form="form-edit-pasien"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
