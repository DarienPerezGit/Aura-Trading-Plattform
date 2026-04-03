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
        <span className="text-[10px] uppercase font-medium text-aura-text-muted tracking-wider">
          {label}
        </span>
        {icon && <span className="text-aura-text-muted">{icon}</span>}
      </div>
      <div
        className={cn(
          'text-lg font-semibold font-mono',
          trend === 'up' && 'text-aura-bullish',
          trend === 'down' && 'text-aura-bearish',
          !trend && 'text-aura-text',
        )}
      >
        {value}
      </div>
      {subValue && (
        <span
          className={cn(
            'text-[11px] font-mono',
            trend === 'up' && 'text-aura-bullish',
            trend === 'down' && 'text-aura-bearish',
            !trend && 'text-aura-text-secondary',
          )}
        >
          {subValue}
        </span>
      )}
    </div>
  )
}
