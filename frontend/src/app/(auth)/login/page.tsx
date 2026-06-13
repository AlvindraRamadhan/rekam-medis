"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, mockUsers, type UserRole } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ROLE_OPTIONS: { role: UserRole; label: string; description: string }[] = [
  { role: "admin", label: "Admin", description: "Manajemen klinik penuh" },
  { role: "perawat", label: "Perawat", description: "Triase & antrian" },
  { role: "dokter", label: "Dokter", description: "Rekam medis & resep" },
  { role: "pasien", label: "Pasien", description: "Portal pasien" },
];

const LoginPage = () => {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("admin@smartclinic.id");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(mockUsers[role].email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate brief loading for UX
    await new Promise((r) => setTimeout(r, 600));

    setUser(mockUsers[selectedRole]);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-background p-4 dark:from-emerald-950/20">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <Package className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Smart Clinic</h1>
            <p className="text-sm text-muted-foreground">Rekam Medis Elektronik</p>
          </div>
        </div>

        <Card className="shadow-xl border-border/60">
          <CardHeader className="pb-2 pt-6 px-6">
            <h2 className="text-lg font-semibold text-foreground">Masuk ke Sistem</h2>
            <p className="text-sm text-muted-foreground">
              Pilih role dan masukkan kredensial Anda
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-6 space-y-5">
            {/* Role selector (dev mock) */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Mode Login (Dev)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map(({ role, label, description }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={cn(
                      "flex flex-col items-start rounded-lg border p-3 text-left transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selectedRole === role
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:border-muted-foreground/40 hover:bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium leading-tight",
                        selectedRole === role ? "text-primary" : "text-foreground",
                      )}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5 leading-tight">
                      {description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@smartclinic.id"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Memproses…" : "Masuk"}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Ini adalah sistem mock untuk pengembangan.{" "}
              <br />
              Semua data bersifat simulasi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
