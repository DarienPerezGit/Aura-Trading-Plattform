import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'bullish' | 'bearish' | 'neutral' | 'live' | 'delayed' | 'ai' | 'anomaly' | 'compra' | 'venta' | 'mantener'
  size?: 'sm' | 'md'
}

const STATUS_STYLES: Record<string, string> = {
  bullish: 'bg-fenix-bullish-bg text-fenix-bullish',
  bearish: 'bg-fenix-bearish-bg text-fenix-bearish',
  neutral: 'bg-fenix-card text-fenix-text-muted',
  live: 'bg-fenix-bullish-bg text-fenix-bullish',
  delayed: 'bg-fenix-warning-bg text-fenix-warning',
  ai: 'bg-fenix-ai-bg text-fenix-ai',
  anomaly: 'bg-fenix-bearish-bg text-fenix-bearish',
  compra: 'bg-fenix-bullish-bg text-fenix-bullish',
  venta: 'bg-fenix-bearish-bg text-fenix-bearish',
  mantener: 'bg-fenix-warning-bg text-fenix-warning',
}

const STATUS_LABELS: Record<string, string> = {
  bullish: 'Alcista',
  bearish: 'Bajista',
  neutral: 'Neutral',
  live: 'En vivo',
  delayed: 'Diferido',
  ai: 'AI',
  anomaly: 'Anomalia',
  compra: 'Compra',
  venta: 'Venta',
  mantener: 'Mantener',
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded',
        STATUS_STYLES[status],
        size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5',
      )}
    >
      {status === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-fenix-bullish mr-1 animate-pulse" />
      )}
      {STATUS_LABELS[status]}
    </span>
  )
}
