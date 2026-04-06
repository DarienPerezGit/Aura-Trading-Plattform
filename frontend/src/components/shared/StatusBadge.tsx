import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'bullish' | 'bearish' | 'neutral' | 'live' | 'delayed' | 'ai' | 'anomaly' | 'compra' | 'venta' | 'mantener'
  size?: 'sm' | 'md'
}

const STATUS_STYLES: Record<string, string> = {
  bullish: 'bg-aura-bullish-bg text-aura-bullish',
  bearish: 'bg-aura-bearish-bg text-aura-bearish',
  neutral: 'bg-aura-card text-aura-text-muted',
  live: 'bg-aura-bullish-bg text-aura-bullish',
  delayed: 'bg-aura-warning-bg text-aura-warning',
  ai: 'bg-aura-ai-bg text-aura-ai',
  anomaly: 'bg-aura-bearish-bg text-aura-bearish',
  compra: 'bg-aura-bullish-bg text-aura-bullish',
  venta: 'bg-aura-bearish-bg text-aura-bearish',
  mantener: 'bg-aura-warning-bg text-aura-warning',
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
        <span className="w-1.5 h-1.5 rounded-full bg-aura-bullish mr-1 animate-pulse" />
      )}
      {STATUS_LABELS[status]}
    </span>
  )
}
