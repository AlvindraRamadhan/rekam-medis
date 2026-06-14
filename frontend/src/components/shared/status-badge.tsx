import { Badge } from '@/components/ui/badge'
import {
  STATUS_KUNJUNGAN,
  STATUS_TAGIHAN,
  STATUS_SINKRONISASI,
} from '@/lib/constants/status'
import { cn } from '@/lib/utils'

const EXTENDED_STATUS_MAP: Record<
  string,
  {
    label: string
    className: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  ...STATUS_KUNJUNGAN,
  ...STATUS_TAGIHAN,
  ...STATUS_SINKRONISASI,
  bpjs_aktif: {
    label: 'Aktif',
    variant: 'outline',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  bpjs_tidak_aktif: {
    label: 'Tidak Aktif',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  bpjs_umum: {
    label: 'Umum',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  ada_alergi: {
    label: 'Ada Alergi',
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
}

interface StatusBadgeProps {
  status: string
  variant?: 'filled' | 'outline'
  className?: string
}

const StatusBadge = ({ status, variant, className }: StatusBadgeProps) => {
  const config = EXTENDED_STATUS_MAP[status]
  if (!config) return null

  return (
    <Badge
      variant={variant === 'outline' ? 'outline' : config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

export { StatusBadge }
export type { StatusBadgeProps }
