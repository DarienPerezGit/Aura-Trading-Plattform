import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPercent, formatNumber } from '@/lib/format'

interface PriceChangeProps {
  value: number
  percent?: number
  showIcon?: boolean
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function PriceChange({
  value,
  percent,
  showIcon = true,
  showValue = true,
  size = 'sm',
}: PriceChangeProps) {
  const isPositive = value > 0
  const isNeutral = value === 0

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-medium',
  }

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono',
        sizeClasses[size],
        isNeutral
          ? 'text-fenix-neutral'
          : isPositive
            ? 'text-fenix-bullish'
            : 'text-fenix-bearish',
      )}
    >
      {showIcon && (
        isNeutral ? (
          <Minus className={iconSize[size]} />
        ) : isPositive ? (
          <TrendingUp className={iconSize[size]} />
        ) : (
          <TrendingDown className={iconSize[size]} />
        )
      )}
      {showValue && (
        <span>{isPositive ? '+' : ''}{formatNumber(value)}</span>
      )}
      {percent !== undefined && (
        <span className="opacity-80">({formatPercent(percent)})</span>
      )}
    </span>
  )
}
