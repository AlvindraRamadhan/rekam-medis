'use client'

import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type {
  SuratEntry,
  KontenKeteranganDokter,
  KontenKeteranganSehat,
  KontenRujiukanEksternal,
  KontenRujiukanBPJS,
} from '@/store/surat-store'
import type { JenisSurat } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTgl = (date: Date | string) =>
  format(new Date(date), "d MMMM yyyy", { locale: idLocale })

const JENIS_LABEL: Record<JenisSurat, string> = {
  keterangan_dokter: 'SURAT KETERANGAN DOKTER',
  keterangan_sehat: 'SURAT KETERANGAN SEHAT',
  rujukan_eksternal: 'SURAT RUJUKAN EKSTERNAL',
  rujukan_bpjs: 'SURAT RUJUKAN BPJS',
}

const KEPERLUAN_LABEL: Record<string, string> = {
  olahraga: 'Olahraga / Aktivitas Fisik',
  bekerja: 'Bekerja',
  sekolah: 'Kegiatan Sekolah / Pendidikan',
  ibadah: 'Ibadah / Kegiatan Keagamaan',
}

// ─── Letterhead ───────────────────────────────────────────────────────────────

const Letterhead = () => (
  <div className="border-b-2 border-blue-800 pb-4 mb-6">
    <div className="flex items-start gap-4">
      {/* Logo placeholder */}
      <div className="flex-shrink-0 size-16 rounded-xl bg-blue-700 flex items-center justify-center">
        <span className="text-white text-xs font-bold text-center leading-tight">
          SMART<br />CLINIC
        </span>
      </div>
      <div className="flex-1">
        <h1 className="text-xl font-bold text-blue-900 tracking-wide">KLINIK SMART CLINIC</h1>
        <p className="text-sm text-gray-700 mt-0.5">
          Jl. Kesehatan No. 1, Kota Bogor, Jawa Barat 16001
        </p>
        <p className="text-sm text-gray-600">
          Telp: (0251) 123-4567 &nbsp;|&nbsp; Email: info@smartclinic.id
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          SIP Klinik: PUSK-KLINIK/0251/2024/001
        </p>
      </div>
    </div>
  </div>
)

// ─── Signature Block ──────────────────────────────────────────────────────────

const SignatureBlock = ({
  dokterNama,
  dokterSIP,
  tanggal,
}: {
  dokterNama: string
  dokterSIP: string
  tanggal: Date
}) => (
  <div className="mt-10 flex justify-between items-end">
    <div className="text-sm text-gray-600">
      <p className="italic text-xs text-gray-400">
        * Surat ini sah dan berlaku tanpa tanda tangan basah
      </p>
      <p className="italic text-xs text-gray-400 mt-0.5">
        apabila memiliki stempel klinik yang sah.
      </p>
    </div>
    <div className="text-center min-w-[200px]">
      <p className="text-sm text-gray-700">
        Bogor, {formatTgl(tanggal)}
      </p>
      <div className="mt-14 border-t border-gray-500 pt-1">
        <p className="text-sm font-semibold text-gray-900">{dokterNama}</p>
        <p className="text-xs text-gray-600">SIP: {dokterSIP}</p>
      </div>
    </div>
  </div>
)

// ─── Field Row ────────────────────────────────────────────────────────────────

const Field = ({ label, value, className }: { label: string; value: string; className?: string }) => (
  <div className={`flex gap-2 text-sm leading-relaxed ${className ?? ''}`}>
    <span className="text-gray-600 min-w-[180px] shrink-0">{label}</span>
    <span className="text-gray-400 shrink-0">:</span>
    <span className="text-gray-900 font-medium">{value}</span>
  </div>
)

// ─── Body: Keterangan Dokter ──────────────────────────────────────────────────

const BodyKeteranganDokter = ({
  surat,
  konten,
}: {
  surat: SuratEntry
  konten: KontenKeteranganDokter
}) => (
  <div className="space-y-6">
    <div>
      <p className="text-sm text-gray-700 mb-3">
        Yang bertanda tangan di bawah ini:
      </p>
      <div className="space-y-1 pl-4">
        <Field label="Nama Dokter" value={surat.dokterNama} />
        <Field label="No. SIP" value={surat.dokterSIP} />
        <Field label="Instansi" value="Klinik Smart Clinic" />
      </div>
    </div>

    <div>
      <p className="text-sm text-gray-700 mb-3">
        Menerangkan dengan sebenarnya bahwa:
      </p>
      <div className="space-y-1 pl-4">
        <Field label="Nama Pasien" value={konten.pasienNama} />
        <Field label="Usia" value={`${konten.pasienUsia} tahun`} />
        <Field label="NIK" value={konten.pasienNIK} />
        <Field label="Diagnosis" value={konten.diagnosis} />
      </div>
    </div>

    <div>
      <p className="text-sm text-gray-700 mb-2">Keterangan:</p>
      <div className="pl-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-900">{konten.keterangan}</p>
      </div>
    </div>

    <div>
      <p className="text-sm text-gray-700 mb-3">
        Surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya, ditujukan kepada:
      </p>
      <div className="pl-4">
        <Field label="Diperuntukkan Untuk" value={konten.diperuntukkanUntuk} />
      </div>
    </div>

    <p className="text-sm text-gray-600 italic">
      Demikian surat keterangan ini dibuat dengan sebenarnya dan untuk dapat dipergunakan sebagaimana mestinya.
    </p>
  </div>
)

// ─── Body: Keterangan Sehat ───────────────────────────────────────────────────

const BodyKeteranganSehat = ({
  surat,
  konten,
}: {
  surat: SuratEntry
  konten: KontenKeteranganSehat
}) => (
  <div className="space-y-6">
    <div>
      <p className="text-sm text-gray-700 mb-3">
        Yang bertanda tangan di bawah ini:
      </p>
      <div className="space-y-1 pl-4">
        <Field label="Nama Dokter" value={surat.dokterNama} />
        <Field label="No. SIP" value={surat.dokterSIP} />
        <Field label="Instansi" value="Klinik Smart Clinic" />
      </div>
    </div>

    <div>
      <p className="text-sm text-gray-700 mb-3">
        Menerangkan bahwa pasien yang tersebut di bawah ini:
      </p>
      <div className="space-y-1 pl-4">
        <Field label="Nama Pasien" value={konten.pasienNama} />
        <Field label="Usia" value={`${konten.pasienUsia} tahun`} />
        <Field label="NIK" value={konten.pasienNIK} />
      </div>
    </div>

    <div>
      <p className="text-sm text-gray-700 mb-2">Hasil Pemeriksaan Fisik:</p>
      <div className="pl-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-900">{konten.catatanKondisiFisik}</p>
      </div>
    </div>

    <p className="text-sm text-gray-800">
      Berdasarkan pemeriksaan yang telah dilakukan, pasien tersebut dinyatakan{' '}
      <strong>SEHAT</strong> dan layak untuk keperluan:{' '}
      <strong>{KEPERLUAN_LABEL[konten.keperluan] ?? konten.keperluan}</strong>.
    </p>

    <div className="space-y-1 pl-4">
      <Field
        label="Berlaku Hingga"
        value={formatTgl(konten.berlakuHingga)}
      />
    </div>

    <p className="text-sm text-gray-600 italic">
      Surat keterangan ini dibuat berdasarkan hasil pemeriksaan klinis dan untuk digunakan sebagaimana mestinya.
    </p>
  </div>
)

// ─── Body: Rujukan Eksternal ──────────────────────────────────────────────────

const BodyRujiukanEksternal = ({
  surat,
  konten,
}: {
  surat: SuratEntry
  konten: KontenRujiukanEksternal
}) => (
  <div className="space-y-6">
    <div>
      <p className="text-sm text-gray-700 mb-3">
        Kepada Yth.{' '}
        <strong>{konten.dokterTujuan}</strong>
        <br />
        {konten.faskesTujuan}
        <br />
        di Tempat
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-700 mb-3">
        Dengan hormat, bersama ini kami merujuk pasien:
      </p>
      <div className="space-y-1 pl-4">
        <Field label="Nama Pasien" value={konten.pasienNama} />
        <Field label="Usia" value={`${konten.pasienUsia} tahun`} />
        <Field label="No. Rekam Medis" value={surat.pasienNoRM} />
        <Field label="Diagnosis Utama" value={konten.diagnosisUtama} />
      </div>
    </div>

    <div>
      <p className="text-sm text-gray-700 mb-2">Ringkasan Terapi yang Telah Diberikan:</p>
      <div className="pl-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-900">{konten.ringkasanTerapi}</p>
      </div>
    </div>

    <div>
      <p className="text-sm text-gray-700 mb-2">Alasan Rujukan:</p>
      <div className="pl-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">{konten.alasanRujukan}</p>
      </div>
    </div>

    <p className="text-sm text-gray-600 italic">
      Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.
    </p>
  </div>
)

// ─── Body: Rujukan BPJS ───────────────────────────────────────────────────────

const BodyRujiukanBPJS = ({
  surat,
  konten,
}: {
  surat: SuratEntry
  konten: KontenRujiukanBPJS
}) => (
  <div className="space-y-6">
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
        Data BPJS
      </p>
      <div className="space-y-1">
        <Field label="No. SEP" value={konten.noSEP} />
        <Field label="Kode ICD-10" value={`${konten.kodeICD10} — ${konten.deskripsiICD10}`} />
      </div>
    </div>

    <div>
      <p className="text-sm text-gray-700 mb-3">
        Dengan hormat, kami merujuk pasien berikut untuk mendapatkan pelayanan lanjutan:
      </p>
      <div className="space-y-1 pl-4">
        <Field label="Nama Pasien" value={konten.pasienNama} />
        <Field label="Usia" value={`${konten.pasienUsia} tahun`} />
        <Field label="No. Rekam Medis" value={surat.pasienNoRM} />
        <Field label="Diagnosis" value={`${konten.kodeICD10} — ${konten.deskripsiICD10}`} />
        <Field label="FKRTL Tujuan" value={konten.fkrtlTujuan} />
        <Field label="Poli Tujuan" value={konten.kodiPoli} />
      </div>
    </div>

    <div>
      <p className="text-sm text-gray-700 mb-2">Alasan Rujukan:</p>
      <div className="pl-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-900">{konten.alasanRujukan}</p>
      </div>
    </div>

    <p className="text-sm text-gray-600 italic">
      Surat rujukan ini diterbitkan sesuai prosedur BPJS Kesehatan. Mohon pasien dapat diterima dan ditangani lebih lanjut.
    </p>
  </div>
)

// ─── Main Template Component ──────────────────────────────────────────────────

interface TemplateSuratProps {
  surat: SuratEntry
}

export const TemplateSurat = ({ surat }: TemplateSuratProps) => {
  const tanggal = surat.finalizedAt ?? surat.createdAt

  const renderBody = () => {
    switch (surat.jenis) {
      case 'keterangan_dokter':
        return (
          <BodyKeteranganDokter
            surat={surat}
            konten={surat.konten as KontenKeteranganDokter}
          />
        )
      case 'keterangan_sehat':
        return (
          <BodyKeteranganSehat
            surat={surat}
            konten={surat.konten as KontenKeteranganSehat}
          />
        )
      case 'rujukan_eksternal':
        return (
          <BodyRujiukanEksternal
            surat={surat}
            konten={surat.konten as KontenRujiukanEksternal}
          />
        )
      case 'rujukan_bpjs':
        return (
          <BodyRujiukanBPJS
            surat={surat}
            konten={surat.konten as KontenRujiukanBPJS}
          />
        )
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-gray-900 font-sans max-w-[720px] mx-auto">
      <Letterhead />

      {/* Letter title & number */}
      <div className="text-center mb-8">
        <h2 className="text-base font-bold tracking-wider uppercase underline underline-offset-4">
          {JENIS_LABEL[surat.jenis]}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          No. {surat.noSurat}
        </p>
      </div>

      {/* Body */}
      {renderBody()}

      {/* Signature */}
      <SignatureBlock
        dokterNama={surat.dokterNama}
        dokterSIP={surat.dokterSIP}
        tanggal={tanggal}
      />

      {/* Footer stamp placeholder */}
      <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>Dicetak dari Sistem RME Smart Clinic</span>
        <span className="font-mono">{surat.noSurat}</span>
      </div>
    </div>
  )
}
