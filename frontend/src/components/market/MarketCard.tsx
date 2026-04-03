import { cn } from '@/lib/utils'
import { formatNumber, formatPercent } from '@/lib/format'
import { SparklineChart } from '@/components/charts/SparklineChart'
import type { MarketAsset } from '@/stores/market-store'

interface MarketCardProps {
  asset: MarketAsset
  onClick?: () => void
  compact?: boolean
}

export function MarketCard({ asset, onClick, compact }: MarketCardProps) {
  const isUp = asset.changePercent >= 0

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-aura-card transition-colors cursor-pointer w-full"
      >
        <span className="text-xs font-medium text-aura-text">{asset.symbol}</span>
        <span className="text-xs font-mono text-aura-text-secondary">
          ${formatNumber(asset.price)}
        </span>
        <span
          className={cn(
            'text-[11px] font-mono',
            isUp ? 'text-aura-bullish' : 'text-aura-bearish',
          )}
        >
          {formatPercent(asset.changePercent)}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="panel-card p-3 hover:bg-aura-card-hover transition-all cursor-pointer w-full text-left group"
    >
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-xs font-semibold text-aura-text">{asset.symbol}</span>
          <span className="text-[10px] text-aura-text-muted ml-1.5">{asset.name}</span>
        </div>
        <div
          className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded',
            isUp ? 'bg-aura-bullish-bg text-aura-bullish' : 'bg-aura-bearish-bg text-aura-bearish',
          )}
        >
          {isUp ? 'Alcista' : 'Bajista'}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-base font-semibold font-mono text-aura-text">
            ${formatNumber(asset.price)}
          </div>
          <div
            className={cn(
              'text-[11px] font-mono',
              isUp ? 'text-aura-bullish' : 'text-aura-bearish',
            )}
          >
            {isUp ? '+' : ''}{formatNumber(asset.change)} ({formatPercent(asset.changePercent)})
          </div>
        </div>
        <SparklineChart data={asset.sparkline} positive={isUp} width={70} height={24} />
      </div>
    </button>
  )
}
