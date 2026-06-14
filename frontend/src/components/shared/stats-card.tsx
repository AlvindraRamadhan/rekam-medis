"use client"

import type { ReactNode } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type StatsVariant = "default" | "success" | "warning" | "danger"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: ReactNode
  trend?: "up" | "down"
  trendValue?: string
  variant?: StatsVariant
  loading?: boolean
}

const variantStyles: Record<StatsVariant, { icon: string }> = {
  default: { icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
  success: { icon: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  warning: { icon: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  danger: { icon: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
}

const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = "default",
  loading = false,
}: StatsCardProps) => {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="mt-3 h-3 w-40" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground leading-snug">{title}</p>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            variantStyles[variant].icon,
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mb-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>

      {trendValue && (
        <div className="mt-2 flex items-center gap-1">
          {trend === "up" ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
          )}
          <p
            className={cn(
              "text-xs font-medium",
              trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
            )}
          >
            {trendValue}
          </p>
        </div>
      )}
    </div>
  )
}

export { StatsCard }
export type { StatsCardProps, StatsVariant }
