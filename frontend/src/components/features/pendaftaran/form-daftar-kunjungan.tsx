'use client'

import { useState, useMemo } from 'react'
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  ClipboardIcon,
  Loader2Icon,
  ShieldCheckIcon,
  ShieldXIcon,
  UserIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
import { usePasienStore } from '@/store/pasien-store'
import { useAntrianStore } from '@/store/antrian-store'
import { mockJadwal } from '@/data/mock/jadwal'
import { cn } from '@/lib/utils'
import type { JadwalDokter, JenisKunjungan, Pasien } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HARI_MAP: Record<number, JadwalDokter['hari']> = {
  0: 'minggu',
  1: 'senin',
  2: 'selasa',
  3: 'rabu',
  4: 'kamis',
  5: 'jumat',
  6: 'sabtu',
}

const poliFromSpesialisasi = (spesialisasi: string): string => {
  if (spesialisasi.toLowerCase().includes('gigi')) return 'Poli Gigi'
  if (spesialisasi.toLowerCase().includes('anak')) return 'Poli Anak'
  if (spesialisasi.toLowerCase().includes('dalam')) return 'Poli Penyakit Dalam'
  return 'Poli Umum'
}

const JENIS_KUNJUNGAN_BPJS = [
  'Rawat Jalan Tingkat Lanjutan (RJTL)',
  'Rawat Inap Tingkat Lanjutan (RITL)',
  'Rawat Jalan Tingkat Pertama (RJTP)',
]

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({
  step,
  title,
}: {
  step: number
  title: string
}) => (
  <div className="flex items-center gap-2">
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {step}
    </span>
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
  </div>
)

// ─── Props ────────────────────────────────────────────────────────────────────

interface FormDaftarKunjunganProps {
  open: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export const FormDaftarKunjungan = ({
  open,
  onClose,
}: FormDaftarKunjunganProps) => {
  const { pasienList } = usePasienStore()
  const { tambahKunjungan, kunjunganList } = useAntrianStore()

  // Section 1
  const [comboOpen, setComboOpen] = useState(false)
  const [selectedPasien, setSelectedPasien] = useState<Pasien | null>(null)

  // Section 2
  const [selectedJadwalId, setSelectedJadwalId] = useState<string>('')

  // Section 3
  const [jenisKunjungan, setJenisKunjungan] = useState<JenisKunjungan>('umum')
  const [noRujukan, setNoRujukan] = useState('')
  const [tanggalRujukan, setTanggalRujukan] = useState('')
  const [jenisKunjunganBpjs, setJenisKunjunganBpjs] = useState('')
  const [kodePoli, setKodePoli] = useState('')

  // Section 4 – BPJS verification
  const [bpjsStatus, setBpjsStatus] = useState<
    'idle' | 'checking' | 'aktif' | 'tidak_aktif'
  >('idle')
  const [sepStatus, setSepStatus] = useState<
    'idle' | 'generating' | 'generated'
  >('idle')
  const [generatedSEP, setGeneratedSEP] = useState('')

  // ── Computed ────────────────────────────────────────────────────────────────

  const todayHari = HARI_MAP[new Date().getDay()]
  const jadwalHariIni = useMemo(() => {
    const filtered = mockJadwal.filter(
      (j) => j.hari === todayHari && !j.isLibur
    )
    // Fallback when running outside mock date: show all non-libur jadwal
    return filtered.length > 0
      ? filtered
      : mockJadwal.filter((j) => !j.isLibur)
  }, [todayHari])

  const jadwalWithCapacity = useMemo(
    () =>
      jadwalHariIni.map((j) => {
        const used = kunjunganList.filter(
          (k) => k.dokterId === j.dokterId && k.status !== 'batal'
        ).length
        return { ...j, kapasitasTersisa: Math.max(j.kapasitasMaksimal - used, 0) }
      }),
    [jadwalHariIni, kunjunganList]
  )

  const selectedJadwal = jadwalWithCapacity.find(
    (j) => j.id === selectedJadwalId
  )
  const selectedDokter = selectedJadwal?.dokter ?? null
  const poliName = selectedDokter
    ? poliFromSpesialisasi(selectedDokter.spesialisasi)
    : ''

  // ── Reset on close ──────────────────────────────────────────────────────────

  const handleClose = () => {
    setSelectedPasien(null)
    setSelectedJadwalId('')
    setJenisKunjungan('umum')
    setNoRujukan('')
    setTanggalRujukan('')
    setJenisKunjunganBpjs('')
    setKodePoli('')
    setBpjsStatus('idle')
    setSepStatus('idle')
    setGeneratedSEP('')
    setComboOpen(false)
    onClose()
  }

  // ── BPJS Verification ───────────────────────────────────────────────────────

  const handleCekBpjs = async () => {
    if (!selectedPasien) return
    setBpjsStatus('checking')
    await new Promise((res) => setTimeout(res, 2000))
    if (selectedPasien.bpjs?.statusAktif) {
      setBpjsStatus('aktif')
    } else {
      setBpjsStatus('tidak_aktif')
    }
  }

  const handleGenerateSEP = async () => {
    setSepStatus('generating')
    await new Promise((res) => setTimeout(res, 1500))
    const now = new Date()
    const sep = `SEP/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(Math.floor(Math.random() * 900) + 100)}`
    setGeneratedSEP(sep)
    setSepStatus('generated')
  }

  const handleLanjutUmum = () => {
    setJenisKunjungan('umum')
    setBpjsStatus('idle')
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!selectedPasien) {
      toast.error('Pilih pasien terlebih dahulu')
      return
    }
    if (!selectedDokter || !selectedJadwal) {
      toast.error('Pilih dokter terlebih dahulu')
      return
    }
    if (selectedJadwal.kapasitasTersisa === 0) {
      toast.error('Kapasitas dokter sudah penuh')
      return
    }
    if (jenisKunjungan === 'bpjs' && bpjsStatus !== 'aktif') {
      toast.error('Verifikasi kepesertaan BPJS terlebih dahulu')
      return
    }

    const noAntrian = tambahKunjungan({
      pasien: selectedPasien,
      dokter: selectedDokter,
      poli: poliName,
      jenisKunjungan,
      noSEP:
        jenisKunjungan === 'bpjs' && sepStatus === 'generated'
          ? generatedSEP
          : undefined,
    })

    toast.success(
      `Antrian ${noAntrian} berhasil dibuat untuk ${selectedPasien.nama}`
    )
    handleClose()
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>Daftar Kunjungan Baru</DialogTitle>
          <DialogDescription>
            Isi seluruh informasi untuk mendaftarkan pasien ke antrian hari ini.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="flex flex-col gap-6 px-1 py-2">
            {/* ── Section 1: Pilih Pasien ─────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              <SectionHeader step={1} title="Pilih Pasien" />

              <div className="flex flex-col gap-1.5">
                <Label>Cari Pasien</Label>
                <Popover open={comboOpen} onOpenChange={setComboOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboOpen}
                        className="w-full justify-between font-normal"
                      />
                    }
                  >
                    {selectedPasien ? (
                      <span className="flex items-center gap-2">
                        <UserIcon className="size-3.5 text-muted-foreground" />
                        {selectedPasien.nama}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Cari nama, NIK, atau No RM...
                      </span>
                    )}
                    <ChevronsUpDownIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0"
                    align="start"
                    style={{ width: 'var(--trigger-width, 400px)' }}
                  >
                    <Command>
                      <CommandInput placeholder="Cari nama, NIK, atau No RM..." />
                      <CommandList>
                        <CommandEmpty>Pasien tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {pasienList.map((p) => (
                            <CommandItem
                              key={p.id}
                              value={`${p.nama} ${p.nik} ${p.noRM}`}
                              onSelect={() => {
                                setSelectedPasien(p)
                                setComboOpen(false)
                                // Reset BPJS state when patient changes
                                setBpjsStatus('idle')
                                setSepStatus('idle')
                                setGeneratedSEP('')
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{p.nama}</span>
                                <span className="text-xs text-muted-foreground">
                                  {p.noRM} · NIK {p.nik.slice(0, 8)}****
                                </span>
                              </div>
                              {selectedPasien?.id === p.id && (
                                <CheckIcon className="ml-auto size-4 text-primary" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Pasien Info Card */}
              {selectedPasien && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {selectedPasien.nama}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {selectedPasien.noRM}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        NIK: {selectedPasien.nik.slice(0, 8)}****
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {selectedPasien.bpjs ? (
                        <Badge
                          variant="secondary"
                          className={cn(
                            selectedPasien.bpjs.statusAktif
                              ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                              : 'border-yellow-200 bg-yellow-100 text-yellow-800'
                          )}
                        >
                          BPJS{' '}
                          {selectedPasien.bpjs.statusAktif
                            ? 'Aktif'
                            : 'Tidak Aktif'}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="border-gray-200 bg-gray-100 text-gray-600"
                        >
                          Umum
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Alergi Warning */}
              {selectedPasien && selectedPasien.alergi.length > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Perhatian: Pasien memiliki riwayat alergi
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {selectedPasien.alergi.map((a) => (
                          <li
                            key={a.id}
                            className="text-xs text-yellow-700"
                          >
                            • {a.namaAlergen} ({a.jenisAlergi}) —{' '}
                            {a.reaksi}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* ── Section 2: Pilih Dokter ─────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              <SectionHeader step={2} title="Pilih Dokter & Jadwal" />

              <div className="flex flex-col gap-1.5">
                <Label>Dokter (Jadwal Hari Ini)</Label>
                <Select
                  value={selectedJadwalId}
                  onValueChange={(v) => v && setSelectedJadwalId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih dokter..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {jadwalWithCapacity.map((j) => (
                        <SelectItem
                          key={j.id}
                          value={j.id}
                          disabled={j.kapasitasTersisa === 0}
                        >
                          <div className="flex w-full items-center justify-between gap-4">
                            <span>
                              {j.dokter.nama}{' '}
                              <span className="text-xs text-muted-foreground">
                                ({j.sesi}, {j.jamMulai}–{j.jamSelesai})
                              </span>
                            </span>
                            <span
                              className={cn(
                                'ml-auto text-xs',
                                j.kapasitasTersisa === 0
                                  ? 'text-destructive'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {j.kapasitasTersisa === 0
                                ? 'Penuh'
                                : `Sisa ${j.kapasitasTersisa}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {selectedJadwal && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Poli</p>
                      <p className="font-medium text-foreground">{poliName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Spesialisasi</p>
                      <p className="font-medium text-foreground">
                        {selectedJadwal.dokter.spesialisasi}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Jam</p>
                      <p className="font-medium text-foreground">
                        {selectedJadwal.jamMulai} – {selectedJadwal.jamSelesai}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kapasitas Tersisa</p>
                      <p
                        className={cn(
                          'font-semibold',
                          selectedJadwal.kapasitasTersisa <= 3
                            ? 'text-destructive'
                            : 'text-emerald-600'
                        )}
                      >
                        {selectedJadwal.kapasitasTersisa} /{' '}
                        {selectedJadwal.kapasitasMaksimal}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* ── Section 3: Jenis Kunjungan ──────────────────────────────── */}
            <div className="flex flex-col gap-3">
              <SectionHeader step={3} title="Jenis Kunjungan" />

              <RadioGroup
                value={jenisKunjungan}
                onValueChange={(v) => {
                  setJenisKunjungan(v as JenisKunjungan)
                  setBpjsStatus('idle')
                  setSepStatus('idle')
                  setGeneratedSEP('')
                }}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="umum" id="jenis-umum" />
                  <Label htmlFor="jenis-umum" className="cursor-pointer">
                    Umum
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="bpjs"
                    id="jenis-bpjs"
                    disabled={!selectedPasien?.bpjs}
                  />
                  <Label
                    htmlFor="jenis-bpjs"
                    className={cn(
                      'cursor-pointer',
                      !selectedPasien?.bpjs && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    BPJS
                    {!selectedPasien?.bpjs && selectedPasien && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (pasien tidak terdaftar BPJS)
                      </span>
                    )}
                  </Label>
                </div>
              </RadioGroup>

              {/* BPJS Additional Fields */}
              {jenisKunjungan === 'bpjs' && (
                <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="noRujukan">
                      No. Referral FKTP
                      <span className="ml-1 text-xs text-muted-foreground">
                        (opsional)
                      </span>
                    </Label>
                    <Input
                      id="noRujukan"
                      placeholder="Contoh: 0001R010220250001"
                      value={noRujukan}
                      onChange={(e) => setNoRujukan(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="tanggalRujukan">Tanggal Rujukan</Label>
                      <Input
                        id="tanggalRujukan"
                        type="date"
                        value={tanggalRujukan}
                        onChange={(e) => setTanggalRujukan(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="kodePoli">Kode Poli BPJS</Label>
                      <Input
                        id="kodePoli"
                        placeholder="Contoh: INT"
                        value={kodePoli}
                        onChange={(e) => setKodePoli(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="jenisKunjunganBpjs">
                      Jenis Kunjungan BPJS
                    </Label>
                    <Select
                      value={jenisKunjunganBpjs}
                      onValueChange={(v) => v && setJenisKunjunganBpjs(v)}
                    >
                      <SelectTrigger id="jenisKunjunganBpjs">
                        <SelectValue placeholder="Pilih jenis kunjungan..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {JENIS_KUNJUNGAN_BPJS.map((j) => (
                            <SelectItem key={j} value={j}>
                              {j}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* ── Section 4: Verifikasi BPJS ──────────────────────────────── */}
            {jenisKunjungan === 'bpjs' && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <SectionHeader step={4} title="Verifikasi Kepesertaan BPJS" />

                  {/* Cek BPJS Button */}
                  {bpjsStatus === 'idle' && (
                    <Button
                      variant="outline"
                      onClick={handleCekBpjs}
                      disabled={!selectedPasien}
                      className="w-fit"
                    >
                      <ShieldCheckIcon data-icon="inline-start" />
                      Cek Kepesertaan BPJS
                    </Button>
                  )}

                  {bpjsStatus === 'checking' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2Icon className="size-4 animate-spin" />
                      Memeriksa kepesertaan BPJS...
                    </div>
                  )}

                  {/* BPJS Aktif */}
                  {bpjsStatus === 'aktif' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800">
                            Kepesertaan BPJS Aktif
                          </p>
                          {selectedPasien?.bpjs && (
                            <div className="mt-1 text-xs text-emerald-700">
                              <p>No. Kartu: {selectedPasien.bpjs.noKartu}</p>
                              <p>
                                Jenis: {selectedPasien.bpjs.jenisKepesertaan}
                              </p>
                              <p>
                                FKTP: {selectedPasien.bpjs.faskesTingkat1}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Generate SEP */}
                      {sepStatus === 'idle' && (
                        <Button
                          variant="outline"
                          onClick={handleGenerateSEP}
                          className="w-fit border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <ClipboardIcon data-icon="inline-start" />
                          Generate SEP
                        </Button>
                      )}
                      {sepStatus === 'generating' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2Icon className="size-4 animate-spin" />
                          Membuat Surat Eligibilitas Peserta...
                        </div>
                      )}
                      {sepStatus === 'generated' && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                          <p className="text-xs font-medium text-blue-700">
                            No. SEP Berhasil Digenerate
                          </p>
                          <p className="mt-1 font-mono text-sm font-semibold text-blue-900">
                            {generatedSEP}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BPJS Tidak Aktif */}
                  {bpjsStatus === 'tidak_aktif' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                        <ShieldXIcon className="mt-0.5 size-4 shrink-0 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Kepesertaan BPJS Tidak Aktif
                          </p>
                          <p className="mt-0.5 text-xs text-red-700">
                            Kepesertaan pasien sudah tidak aktif atau telah
                            berakhir. Tidak dapat melanjutkan kunjungan BPJS.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLanjutUmum}
                        >
                          Lanjut sebagai Pasien Umum
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCekBpjs}
                        >
                          Cek Ulang
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>Daftarkan ke Antrian</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
