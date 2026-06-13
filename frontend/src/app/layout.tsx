import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/layout/providers";

export const metadata: Metadata = {
  title: "Smart Clinic RME",
  description: "Rekam Medis Elektronik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className="h-full">
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
