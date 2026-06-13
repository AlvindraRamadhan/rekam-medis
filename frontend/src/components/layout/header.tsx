"use client";

import { Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  User,
  Settings,
  LogOut,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import { useAuthStore, mockUsers, type UserRole } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  pasien: "Pasien",
  antrian: "Antrian",
  pendaftaran: "Pendaftaran",
  "jadwal-dokter": "Jadwal Dokter",
  billing: "Billing",
  "rekam-medis": "Rekam Medis",
  resep: "Resep",
  "surat-rujukan": "Surat & Rujukan",
  laporan: "Laporan",
  integrasi: "Integrasi",
  bpjs: "BPJS",
  satusehat: "SatuSehat",
  portal: "Portal Pasien",
  screening: "Screening",
  riwayat: "Riwayat",
  booking: "Booking",
  tagihan: "Tagihan",
  settings: "Pengaturan",
  profil: "Profil",
};

const getInitials = (nama: string) =>
  nama
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  perawat: "Perawat",
  dokter: "Dokter",
  pasien: "Pasien",
};

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toggle, toggleCollapse } = useSidebarStore();
  const { user, setUser, logout } = useAuthStore();

  const segments = pathname.split("/").filter(Boolean);

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      toggle();
    } else {
      toggleCollapse();
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSwitchRole = (role: UserRole) => {
    setUser(mockUsers[role]);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-[72px] items-center gap-4 px-6",
        "bg-background/95 backdrop-blur",
        "shadow-[0_3px_6px_rgba(0,0,0,0.12)]",
        "border-b border-border/50",
      )}
    >
      {/* Left: toggle + breadcrumb */}
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          aria-label="Toggle sidebar"
          className="h-9 w-9 shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Breadcrumb className="hidden sm:flex min-w-0">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-muted-foreground text-sm">
                Beranda
              </BreadcrumbLink>
            </BreadcrumbItem>

            {segments.map((segment, idx) => {
              const label = SEGMENT_LABELS[segment] ?? segment;
              const isLast = idx === segments.length - 1;
              const href = "/" + segments.slice(0, idx + 1).join("/");

              return (
                <Fragment key={segment}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-sm font-medium">
                        {label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href} className="text-muted-foreground text-sm">
                        {label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: theme toggle + notifications + user menu */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative overflow-hidden"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-md",
              "hover:bg-accent transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="Notifikasi"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-72">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Belum ada notifikasi baru
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2 py-1.5",
              "hover:bg-accent transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="Menu pengguna"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {user ? getInitials(user.nama) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left min-w-0">
              <p
                className="text-sm font-medium text-foreground truncate leading-tight"
                style={{ maxWidth: "180px" }}
              >
                {user?.nama ?? "Pengguna"}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                {user ? ROLE_LABELS[user.role] : ""}
              </p>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="font-medium text-sm truncate">{user?.nama}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => router.push("/profil")}>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Pengaturan
            </DropdownMenuItem>

            {process.env.NODE_ENV === "development" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Ganti Role
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {(["admin", "perawat", "dokter", "pasien"] as UserRole[]).map(
                      (role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => handleSwitchRole(role)}
                          className={cn(
                            user?.role === role && "text-primary font-medium",
                          )}
                        >
                          {ROLE_LABELS[role]}
                          {user?.role === role && (
                            <span className="ml-auto text-xs text-primary">
                              aktif
                            </span>
                          )}
                        </DropdownMenuItem>
                      ),
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              variant="destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
