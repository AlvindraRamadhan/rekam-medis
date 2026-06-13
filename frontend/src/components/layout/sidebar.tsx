"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import { useAuthStore } from "@/store/auth-store";
import { navigationByRole } from "@/lib/constants/navigation";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const Sidebar = () => {
  const { isOpen, isCollapsed, setOpen } = useSidebarStore();
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  const sections = user ? navigationByRole[user.role] : [];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px] md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-40 flex flex-col",
          "bg-sidebar border-r border-sidebar-border",
          "transition-[width,transform] duration-300 ease-in-out",
          isCollapsed ? "w-[72px]" : "w-72",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        )}
      >
        {/* Logo area */}
        <div
          className={cn(
            "flex h-[72px] items-center border-b border-sidebar-border shrink-0",
            isCollapsed ? "justify-center px-0" : "px-5 gap-3",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-sidebar-foreground leading-tight truncate">
                Smart Clinic
              </p>
              <p className="text-xs text-muted-foreground leading-tight truncate">
                Rekam Medis
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="mb-1">
              {section.title && !isCollapsed && (
                <p className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              )}

              {section.title && isCollapsed && sIdx > 0 && (
                <div className="mx-4 my-2 border-t border-sidebar-border" />
              )}

              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                const linkClassName = cn(
                  "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  isCollapsed
                    ? "mx-2 h-10 w-10 justify-center"
                    : "mx-2 h-10 px-3",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                );

                const linkNode = (
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={linkClassName}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger render={linkNode} />
                      <TooltipContent side="right" className="text-xs">
                        {item.label}
                        {item.readOnly && (
                          <span className="ml-1 text-muted-foreground/70">
                            (read-only)
                          </span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.href}>{linkNode}</div>;
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
