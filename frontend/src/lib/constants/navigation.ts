import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  Receipt,
  Shield,
  Activity,
  BarChart3,
  Stethoscope,
  FileText,
  Pill,
  FileCheck,
  History,
  Home,
  CalendarPlus,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/store/auth-store";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  readOnly?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navigationByRole: Record<UserRole, NavSection[]> = {
  admin: [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Manajemen Pasien",
      items: [
        { label: "Data Pasien", href: "/pasien", icon: Users },
        { label: "Pendaftaran & Antrian", href: "/antrian", icon: ClipboardList },
      ],
    },
    {
      title: "Jadwal & Operasional",
      items: [
        { label: "Jadwal Dokter", href: "/jadwal-dokter", icon: Calendar },
        { label: "Billing & Pembayaran", href: "/billing", icon: Receipt },
      ],
    },
    {
      title: "Integrasi",
      items: [
        { label: "Integrasi BPJS", href: "/integrasi/bpjs", icon: Shield },
        { label: "Integrasi SatuSehat", href: "/integrasi/satusehat", icon: Activity },
      ],
    },
    {
      title: "Laporan",
      items: [
        { label: "Laporan & Statistik", href: "/laporan", icon: BarChart3 },
      ],
    },
  ],

  perawat: [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Antrian Pasien", href: "/antrian", icon: ClipboardList },
        { label: "Screening Pasien", href: "/screening", icon: Stethoscope },
        { label: "Data Pasien", href: "/pasien", icon: Users, readOnly: true },
      ],
    },
  ],

  dokter: [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Antrian Pasien", href: "/antrian", icon: ClipboardList },
        { label: "Jadwal Saya", href: "/jadwal-dokter", icon: Calendar },
        { label: "Rekam Medis SOAP", href: "/rekam-medis", icon: FileText },
        { label: "Resep Elektronik", href: "/resep", icon: Pill },
        { label: "Surat & Rujukan", href: "/surat-rujukan", icon: FileCheck },
        { label: "Riwayat Pasien", href: "/riwayat", icon: History },
      ],
    },
  ],

  pasien: [
    {
      items: [
        { label: "Dashboard Saya", href: "/dashboard", icon: Home },
        { label: "Booking Kunjungan", href: "/booking", icon: CalendarPlus },
        { label: "Riwayat Kunjungan", href: "/riwayat", icon: History },
        { label: "Resep Saya", href: "/resep", icon: Pill },
        { label: "Tagihan", href: "/tagihan", icon: Receipt },
        { label: "Status BPJS", href: "/bpjs", icon: Shield },
      ],
    },
  ],
};
