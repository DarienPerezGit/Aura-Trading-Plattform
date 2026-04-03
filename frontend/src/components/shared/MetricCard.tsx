import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  subValue?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function MetricCard({ label, value, subValue, icon, trend, className }: MetricCardProps) {
  return (
    <div className={cn('panel-card p-3 flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-medium text-fenix-text-muted tracking-wider">
          {label}
        </span>
        {icon && <span className="text-fenix-text-muted">{icon}</span>}
      </div>
      <div
        className={cn(
          'text-lg font-semibold font-mono',
          trend === 'up' && 'text-fenix-bullish',
          trend === 'down' && 'text-fenix-bearish',
          !trend && 'text-fenix-text',
        )}
      >
        {value}
      </div>
      {subValue && (
        <span
          className={cn(
            'text-[11px] font-mono',
            trend === 'up' && 'text-fenix-bullish',
            trend === 'down' && 'text-fenix-bearish',
            !trend && 'text-fenix-text-secondary',
          )}
        >
          {subValue}
        </span>
      )}
    </div>
  )
}
