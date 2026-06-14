import {
  BadgeCheckIcon,
  Building2Icon,
  CheckCircle2Icon,
  ChevronRightIcon,
  ClockIcon,
  GlobeIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from 'lucide-react'

import type { Tagihan, Kunjungan } from '@/types'
import { formatRupiah, formatTanggal, formatTanggalWaktu } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KATEGORI_LABELS: Record<string, string> = {
  konsultasi: 'Konsultasi',
  tindakan: 'Tindakan',
  obat: 'Obat',
  lainnya: 'Lainnya',
}

const METODE_LABELS: Record<string, string> = {
  tunai: 'Tunai (Cash)',
  transfer: 'Transfer Bank',
  qris: 'QRIS',
}

// ─── Icon helper: icon + text side by side ────────────────────────────────────

const IconText = ({
  icon,
  children,
  style,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  style?: React.CSSProperties
}) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', ...style }}>
    {icon}
    {children}
  </span>
)

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  page: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: '11px',
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    padding: '0',
    margin: '0',
    lineHeight: '1.5',
  } as React.CSSProperties,

  headerBar: {
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: '#ffffff',
    padding: '20px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,

  clinicName: {
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '-0.3px',
    margin: '0 0 2px 0',
  } as React.CSSProperties,

  clinicTagline: {
    fontSize: '10px',
    opacity: 0.85,
    margin: 0,
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  },

  headerRight: {
    textAlign: 'right' as const,
  },

  invoiceTitle: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '1px',
    margin: '0 0 4px 0',
  } as React.CSSProperties,

  invoiceSubtitle: {
    fontSize: '10px',
    opacity: 0.8,
    margin: 0,
  } as React.CSSProperties,

  addressBar: {
    backgroundColor: '#f0fdf4',
    borderBottom: '1px solid #bbf7d0',
    padding: '8px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    fontSize: '10px',
    color: '#065f46',
  } as React.CSSProperties,

  infoSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0',
    padding: '20px 28px',
    borderBottom: '1px solid #e5e7eb',
  } as React.CSSProperties,

  infoBlock: {
    paddingRight: '16px',
  } as React.CSSProperties,

  infoBlockRight: {
    paddingLeft: '16px',
    borderLeft: '1px solid #e5e7eb',
  } as React.CSSProperties,

  infoLabel: {
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '0.8px',
    textTransform: 'uppercase' as const,
    color: '#6b7280',
    marginBottom: '10px',
    display: 'block',
  } as React.CSSProperties,

  infoRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '4px',
  } as React.CSSProperties,

  infoKey: {
    color: '#6b7280',
    minWidth: '90px',
    flexShrink: 0,
  } as React.CSSProperties,

  infoValue: {
    fontWeight: '500',
    color: '#111827',
  } as React.CSSProperties,

  patientName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '6px',
  } as React.CSSProperties,

  tableSection: {
    padding: '0 28px 20px',
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '0.8px',
    textTransform: 'uppercase' as const,
    color: '#6b7280',
    padding: '14px 0 8px',
    borderBottom: '2px solid #059669',
    marginBottom: '0',
  } as React.CSSProperties,

  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  } as React.CSSProperties,

  th: {
    backgroundColor: '#f9fafb',
    padding: '8px 10px',
    textAlign: 'left' as const,
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
    color: '#6b7280',
    borderBottom: '1px solid #e5e7eb',
  } as React.CSSProperties,

  thRight: {
    backgroundColor: '#f9fafb',
    padding: '8px 10px',
    textAlign: 'right' as const,
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
    color: '#6b7280',
    borderBottom: '1px solid #e5e7eb',
  } as React.CSSProperties,

  tdEven: {
    padding: '8px 10px',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'top' as const,
    backgroundColor: '#fafafa',
  } as React.CSSProperties,

  tdOdd: {
    padding: '8px 10px',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'top' as const,
    backgroundColor: '#ffffff',
  } as React.CSSProperties,

  tdRight: (isEven: boolean) => ({
    padding: '8px 10px',
    borderBottom: '1px solid #f3f4f6',
    textAlign: 'right' as const,
    backgroundColor: isEven ? '#fafafa' : '#ffffff',
  } as React.CSSProperties),

  totalsSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0 28px 20px',
  } as React.CSSProperties,

  totalsBox: {
    width: '240px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
  } as React.CSSProperties,

  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '7px 14px',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '11px',
  } as React.CSSProperties,

  totalRowFinal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: '#059669',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '700',
  } as React.CSSProperties,

  totalLabel: {
    color: '#6b7280',
  } as React.CSSProperties,

  totalValue: {
    fontWeight: '600',
    color: '#111827',
  } as React.CSSProperties,

  diskonValue: {
    fontWeight: '600',
    color: '#059669',
  } as React.CSSProperties,

  paymentSection: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '20px',
    padding: '16px 28px',
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
    borderBottom: '1px solid #e5e7eb',
    alignItems: 'center',
  } as React.CSSProperties,

  paymentLabel: {
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '0.8px',
    textTransform: 'uppercase' as const,
    color: '#6b7280',
    marginBottom: '8px',
    display: 'block',
  } as React.CSSProperties,

  stamp: {
    border: '3px solid #059669',
    borderRadius: '6px',
    padding: '8px 20px',
    color: '#059669',
    fontWeight: '800',
    letterSpacing: '3px',
    textAlign: 'center' as const,
    transform: 'rotate(-5deg)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,

  bpjsStamp: {
    border: '3px solid #2563eb',
    borderRadius: '6px',
    padding: '8px 20px',
    color: '#2563eb',
    fontWeight: '800',
    letterSpacing: '3px',
    textAlign: 'center' as const,
    transform: 'rotate(-5deg)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,

  signatureSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    padding: '20px 28px',
    borderBottom: '1px solid #e5e7eb',
  } as React.CSSProperties,

  signatureBox: {
    textAlign: 'center' as const,
  } as React.CSSProperties,

  signatureLabel: {
    fontSize: '10px',
    color: '#6b7280',
    marginBottom: '40px',
    display: 'block',
  } as React.CSSProperties,

  signatureLine: {
    borderTop: '1px solid #1a1a1a',
    paddingTop: '4px',
    fontSize: '10px',
    fontWeight: '600',
    color: '#111827',
  } as React.CSSProperties,

  footerSection: {
    padding: '14px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
  } as React.CSSProperties,

  footerText: {
    fontSize: '9px',
    color: '#9ca3af',
    lineHeight: '1.8',
    margin: 0,
    listStyle: 'none',
    padding: 0,
  } as React.CSSProperties,

  footerRight: {
    textAlign: 'right' as const,
    fontSize: '9px',
    color: '#9ca3af',
    flexShrink: 0,
  } as React.CSSProperties,

  bpjsBanner: {
    backgroundColor: '#eff6ff',
    borderLeft: '4px solid #2563eb',
    padding: '10px 28px',
    margin: '0 28px 16px',
    borderRadius: '0 6px 6px 0',
    fontSize: '10px',
    color: '#1e40af',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  } as React.CSSProperties,
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InvoicePrintProps {
  tagihan: Tagihan
  kunjungan: Kunjungan | undefined
  metodePembayaran?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export const InvoicePrint = ({
  tagihan,
  kunjungan,
  metodePembayaran = 'tunai',
}: InvoicePrintProps) => {
  const subtotal = tagihan.items.reduce((s, i) => s + i.harga * i.jumlah, 0)
  const diskon = subtotal - tagihan.totalBiaya
  const isBPJS = !!tagihan.noSEP
  const isLunas = tagihan.status === 'lunas'

  return (
    <div id="invoice-print-root" aria-hidden="true">
      <div style={s.page}>

        {/* ── Header Bar ───────────────────────────────────────────────── */}
        <div style={s.headerBar}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '800', fontSize: '16px',
              }}>
                SC
              </div>
              <div>
                <p style={s.clinicName}>Smart Clinic RME</p>
                <p style={s.clinicTagline}>Rekam Medis Elektronik · Pelayanan Terpadu</p>
              </div>
            </div>
            <p style={{ margin: '0', fontSize: '10px', opacity: 0.75 }}>
              Jl. Kesehatan No. 1, Kota Sehat · Telp (021) 123-4567 · smartclinic@rme.id
            </p>
          </div>
          <div style={s.headerRight}>
            <p style={s.invoiceTitle}>INVOICE</p>
            <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: '600' }}>
              {tagihan.nomorInvoice}
            </p>
            <p style={s.invoiceSubtitle}>Tanggal: {formatTanggal(tagihan.createdAt)}</p>
          </div>
        </div>

        {/* ── Address / Contact bar ──────────────────────────────────── */}
        <div style={s.addressBar}>
          <IconText icon={<MapPinIcon size={10} color="#059669" />}>
            Jl. Kesehatan No. 1, Kota Sehat 12345
          </IconText>
          <IconText icon={<PhoneIcon size={10} color="#059669" />}>
            (021) 123-4567
          </IconText>
          <IconText icon={<GlobeIcon size={10} color="#059669" />}>
            www.smartclinic.id
          </IconText>
          {isBPJS && (
            <IconText
              icon={<ShieldCheckIcon size={11} color="#1d4ed8" />}
              style={{ marginLeft: 'auto', fontWeight: '600', color: '#1d4ed8' }}
            >
              Fasilitas BPJS Kesehatan
            </IconText>
          )}
        </div>

        {/* ── Info Section ──────────────────────────────────────────── */}
        <div style={s.infoSection}>
          {/* Billed To */}
          <div style={s.infoBlock}>
            <span style={s.infoLabel}>Ditagih Kepada</span>
            <p style={s.patientName}>{kunjungan?.pasien.nama ?? '—'}</p>
            <div style={s.infoRow}>
              <span style={s.infoKey}>No. Rekam Medis</span>
              <span style={s.infoValue}>{kunjungan?.pasien.noRM ?? '—'}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoKey}>NIK</span>
              <span style={s.infoValue}>
                {kunjungan?.pasien.nik
                  ? `${kunjungan.pasien.nik.slice(0, 4)}****${kunjungan.pasien.nik.slice(12)}`
                  : '—'}
              </span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoKey}>Jenis Pembayaran</span>
              <span style={{ ...s.infoValue, color: isBPJS ? '#1d4ed8' : '#059669', fontWeight: '700' }}>
                {isBPJS ? 'BPJS Kesehatan' : 'Umum (Bayar Sendiri)'}
              </span>
            </div>
            {tagihan.noSEP && (
              <div style={s.infoRow}>
                <span style={s.infoKey}>No. SEP</span>
                <span style={{ ...s.infoValue, fontFamily: 'monospace', fontSize: '10px' }}>
                  {tagihan.noSEP}
                </span>
              </div>
            )}
          </div>

          {/* Invoice Details */}
          <div style={s.infoBlockRight}>
            <span style={s.infoLabel}>Detail Kunjungan</span>
            <div style={s.infoRow}>
              <span style={s.infoKey}>No. Invoice</span>
              <span style={{ ...s.infoValue, fontFamily: 'monospace', fontSize: '10px' }}>
                {tagihan.nomorInvoice}
              </span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoKey}>Tanggal</span>
              <span style={s.infoValue}>{formatTanggal(tagihan.createdAt)}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoKey}>Dokter</span>
              <span style={s.infoValue}>{kunjungan?.dokter.nama ?? '—'}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoKey}>Spesialisasi</span>
              <span style={s.infoValue}>{kunjungan?.dokter.spesialisasi ?? '—'}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoKey}>Poli</span>
              <span style={s.infoValue}>{kunjungan?.poli ?? '—'}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoKey}>No. Antrian</span>
              <span style={s.infoValue}>{kunjungan?.noAntrian ?? '—'}</span>
            </div>
            {tagihan.paidAt && (
              <div style={s.infoRow}>
                <span style={s.infoKey}>Dibayar</span>
                <span style={{ ...s.infoValue, color: '#059669' }}>
                  {formatTanggalWaktu(tagihan.paidAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── BPJS Banner ──────────────────────────────────────────────── */}
        {isBPJS && (
          <div style={s.bpjsBanner}>
            <ShieldCheckIcon size={14} color="#2563eb" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>
              <strong>Catatan BPJS:</strong> Layanan ini ditanggung oleh BPJS Kesehatan.
              Biaya ditanggung sesuai hak peserta. No. SEP: <strong>{tagihan.noSEP}</strong>
            </span>
          </div>
        )}

        {/* ── Item Table ──────────────────────────────────────────────── */}
        <div style={s.tableSection}>
          <p style={s.sectionTitle}>Rincian Layanan</p>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: '32px' }}>No</th>
                <th style={s.th}>Nama Layanan / Tindakan</th>
                <th style={s.th}>Kategori</th>
                <th style={{ ...s.thRight, width: '36px' }}>Qty</th>
                <th style={{ ...s.thRight, width: '110px' }}>Harga Satuan</th>
                <th style={{ ...s.thRight, width: '110px' }}>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {tagihan.items.map((item, index) => {
                const isEven = index % 2 === 0
                const td = isEven ? s.tdEven : s.tdOdd
                return (
                  <tr key={item.id}>
                    <td style={{ ...td, color: '#9ca3af', textAlign: 'center' as const }}>
                      {index + 1}
                    </td>
                    <td style={{ ...td, fontWeight: '500' }}>{item.nama}</td>
                    <td style={{ ...td, color: '#6b7280' }}>
                      {KATEGORI_LABELS[item.kategori] ?? item.kategori}
                    </td>
                    <td style={{ ...s.tdRight(isEven), color: '#6b7280' }}>{item.jumlah}</td>
                    <td style={s.tdRight(isEven)}>
                      {isBPJS
                        ? <span style={{ color: '#2563eb', fontSize: '9px' }}>Ditanggung BPJS</span>
                        : formatRupiah(item.harga)
                      }
                    </td>
                    <td style={{ ...s.tdRight(isEven), fontWeight: '600' }}>
                      {isBPJS
                        ? <span style={{ color: '#2563eb', fontSize: '9px' }}>BPJS</span>
                        : formatRupiah(item.harga * item.jumlah)
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── Totals ──────────────────────────────────────────────────── */}
        <div style={s.totalsSection}>
          <div style={s.totalsBox}>
            <div style={s.totalRow}>
              <span style={s.totalLabel}>Subtotal ({tagihan.items.length} item)</span>
              <span style={s.totalValue}>
                {isBPJS ? 'Ditanggung BPJS' : formatRupiah(subtotal)}
              </span>
            </div>
            {diskon > 0 && (
              <div style={s.totalRow}>
                <span style={s.totalLabel}>Diskon</span>
                <span style={s.diskonValue}>- {formatRupiah(diskon)}</span>
              </div>
            )}
            {isBPJS && (
              <div style={s.totalRow}>
                <span style={s.totalLabel}>Tanggungan BPJS</span>
                <span style={{ color: '#2563eb', fontWeight: '600' }}>Rp 0</span>
              </div>
            )}
            <div style={s.totalRowFinal}>
              <IconText icon={<BadgeCheckIcon size={14} color="#ffffff" />}>
                TOTAL YANG DIBAYAR
              </IconText>
              <span>{isBPJS ? 'Rp 0' : formatRupiah(tagihan.totalBiaya)}</span>
            </div>
          </div>
        </div>

        {/* ── Payment Info + Stamp ────────────────────────────────────── */}
        <div style={s.paymentSection}>
          <div>
            <span style={s.paymentLabel}>Informasi Pembayaran</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={s.infoRow}>
                  <span style={s.infoKey}>Status</span>
                  <IconText
                    icon={
                      isLunas
                        ? <CheckCircle2Icon size={12} color="#059669" />
                        : <ClockIcon size={12} color="#ea580c" />
                    }
                    style={{
                      fontWeight: '700',
                      color: isLunas ? '#059669' : '#ea580c',
                    }}
                  >
                    {isLunas ? 'LUNAS' : 'BELUM DIBAYAR'}
                  </IconText>
                </div>
                <div style={s.infoRow}>
                  <span style={s.infoKey}>Metode</span>
                  <span style={s.infoValue}>
                    {METODE_LABELS[metodePembayaran] ?? metodePembayaran}
                  </span>
                </div>
                {tagihan.paidAt && (
                  <div style={s.infoRow}>
                    <span style={s.infoKey}>Tgl Bayar</span>
                    <span style={s.infoValue}>{formatTanggalWaktu(tagihan.paidAt)}</span>
                  </div>
                )}
              </div>
              <div>
                <div style={s.infoRow}>
                  <span style={s.infoKey}>Dibayar</span>
                  <span style={{ ...s.infoValue, fontWeight: '700', fontSize: '12px' }}>
                    {isBPJS ? 'Rp 0 (BPJS)' : formatRupiah(tagihan.totalBiaya)}
                  </span>
                </div>
                {isBPJS && tagihan.noSEP && (
                  <div style={s.infoRow}>
                    <span style={s.infoKey}>No. SEP</span>
                    <span style={{ ...s.infoValue, fontFamily: 'monospace', fontSize: '9px' }}>
                      {tagihan.noSEP}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stamp */}
          <div style={{ flexShrink: 0, padding: '4px' }}>
            {isLunas ? (
              <div style={s.stamp}>
                <BadgeCheckIcon size={28} color="#059669" />
                <span style={{ fontSize: '14px' }}>LUNAS</span>
              </div>
            ) : isBPJS ? (
              <div style={s.bpjsStamp}>
                <Building2Icon size={24} color="#2563eb" />
                <span style={{ fontSize: '14px' }}>BPJS</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Signature Section ────────────────────────────────────────── */}
        <div style={s.signatureSection}>
          <div style={s.signatureBox}>
            <span style={s.signatureLabel}>Pasien / Penerima Layanan</span>
            <div style={s.signatureLine}>{kunjungan?.pasien.nama ?? '—'}</div>
          </div>
          <div style={s.signatureBox}>
            <span style={s.signatureLabel}>Petugas Kasir / Admin</span>
            <div style={s.signatureLine}>Admin Smart Clinic</div>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div style={s.footerSection}>
          <ul style={s.footerText}>
            {[
              'Dokumen ini merupakan bukti pembayaran yang sah dari Smart Clinic RME.',
              'Harap simpan dokumen ini sebagai arsip Anda.',
              'Untuk pertanyaan, hubungi kami di (021) 123-4567 atau smartclinic@rme.id.',
            ].map((text) => (
              <li key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                <ChevronRightIcon
                  size={9}
                  color="#9ca3af"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                {text}
              </li>
            ))}
          </ul>
          <div style={s.footerRight}>
            <p style={{ margin: '0 0 2px' }}>Dicetak: {formatTanggalWaktu(new Date())}</p>
            <p style={{ margin: '0 0 2px' }}>No. Dokumen: {tagihan.nomorInvoice}</p>
            <p style={{ margin: 0 }}>Smart Clinic RME v1.0</p>
          </div>
        </div>

        {/* ── Bottom accent line ───────────────────────────────────────── */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #059669, #34d399, #059669)' }} />
      </div>
    </div>
  )
}
