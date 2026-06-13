"use client";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Main content — offset by sidebar width on desktop */}
      <div
        className={cn(
          "flex flex-col min-h-screen",
          "transition-[margin-left] duration-300 ease-in-out",
          "md:ml-72",
          isCollapsed && "md:ml-[72px]",
        )}
      >
        <Header />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
