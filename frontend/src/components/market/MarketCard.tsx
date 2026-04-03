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
        className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-fenix-card transition-colors cursor-pointer w-full"
      >
        <span className="text-xs font-medium text-fenix-text">{asset.symbol}</span>
        <span className="text-xs font-mono text-fenix-text-secondary">
          ${formatNumber(asset.price)}
        </span>
        <span
          className={cn(
            'text-[11px] font-mono',
            isUp ? 'text-fenix-bullish' : 'text-fenix-bearish',
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
      className="panel-card p-3 hover:bg-fenix-card-hover transition-all cursor-pointer w-full text-left group"
    >
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-xs font-semibold text-fenix-text">{asset.symbol}</span>
          <span className="text-[10px] text-fenix-text-muted ml-1.5">{asset.name}</span>
        </div>
        <div
          className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded',
            isUp ? 'bg-fenix-bullish-bg text-fenix-bullish' : 'bg-fenix-bearish-bg text-fenix-bearish',
          )}
        >
          {isUp ? 'Alcista' : 'Bajista'}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-base font-semibold font-mono text-fenix-text">
            ${formatNumber(asset.price)}
          </div>
          <div
            className={cn(
              'text-[11px] font-mono',
              isUp ? 'text-fenix-bullish' : 'text-fenix-bearish',
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
