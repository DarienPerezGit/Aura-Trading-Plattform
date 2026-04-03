import { useMemo } from 'react'
import {
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useMarketStore } from '@/stores/market-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { MarketCard } from '@/components/market/MarketCard'
import { DataPanel } from '@/components/shared/DataPanel'
import { MetricCard } from '@/components/shared/MetricCard'
import { SparklineChart } from '@/components/charts/SparklineChart'
import { cn } from '@/lib/utils'
import { formatNumber, formatPercent, formatVolume } from '@/lib/format'

const GLOBAL_INDICES = ['SPY', 'QQQ', 'DXY', 'BTC', 'ETH', 'GLD', 'OIL', 'VIX']

export function CommandCenterPage() {
  const assets = useMarketStore((s) => s.assets)
  const movers = useMarketStore((s) => s.movers)
  const watchlist = useMarketStore((s) => s.watchlist)
  const { navigate } = useWorkspaceStore()

  const globalAssets = useMemo(
    () => GLOBAL_INDICES.map((s) => assets[s]).filter(Boolean),
    [assets],
  )

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      {/* Top: Global Market Snapshot */}
      <div className="grid grid-cols-4 xl:grid-cols-8 gap-2 shrink-0">
        {globalAssets.map((asset) => (
          <button
            key={asset.symbol}
            onClick={() => navigate(`/activo/${asset.symbol}`)}
            className="panel-card p-2.5 hover:bg-fenix-card-hover transition-all cursor-pointer text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-fenix-text">{asset.symbol}</span>
              <SparklineChart
                data={asset.sparkline}
                width={40}
                height={14}
                positive={asset.changePercent >= 0}
              />
            </div>
            <div className="text-sm font-mono font-semibold text-fenix-text">
              ${formatNumber(asset.price)}
            </div>
            <div
              className={cn(
                'text-[10px] font-mono',
                asset.changePercent >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish',
              )}
            >
              {formatPercent(asset.changePercent)}
            </div>
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Left: Watchlist + Movers */}
        <div className="col-span-3 flex flex-col gap-3 min-h-0">
          {/* Watchlist */}
          <DataPanel title="Watchlist" subtitle={`${watchlist.length} activos`} className="flex-1">
            <div className="space-y-1">
              {watchlist.map((item) => {
                const asset = assets[item.symbol]
                if (!asset) return null
                return (
                  <MarketCard
                    key={item.symbol}
                    asset={asset}
                    compact
                    onClick={() => navigate(`/activo/${item.symbol}`)}
                  />
                )
              })}
            </div>
          </DataPanel>

          {/* Movers */}
          <DataPanel title="Top Movers" className="flex-1">
            <div className="space-y-3">
              {/* Gainers */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowUpRight className="w-3 h-3 text-fenix-bullish" />
                  <span className="text-[10px] font-semibold text-fenix-bullish uppercase">
                    Mayores subas
                  </span>
                </div>
                {movers.gainers.slice(0, 3).map((a) => (
                  <button
                    key={a.symbol}
                    onClick={() => navigate(`/activo/${a.symbol}`)}
                    className="flex items-center justify-between w-full px-2 py-1 rounded hover:bg-fenix-card transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-fenix-text">{a.symbol}</span>
                    <span className="text-xs font-mono text-fenix-bullish">
                      {formatPercent(a.changePercent)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Losers */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowDownRight className="w-3 h-3 text-fenix-bearish" />
                  <span className="text-[10px] font-semibold text-fenix-bearish uppercase">
                    Mayores bajas
                  </span>
                </div>
                {movers.losers.slice(0, 3).map((a) => (
                  <button
                    key={a.symbol}
                    onClick={() => navigate(`/activo/${a.symbol}`)}
                    className="flex items-center justify-between w-full px-2 py-1 rounded hover:bg-fenix-card transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-fenix-text">{a.symbol}</span>
                    <span className="text-xs font-mono text-fenix-bearish">
                      {formatPercent(a.changePercent)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </DataPanel>
        </div>

        {/* Center: Sector Heatmap / Market Grid */}
        <div className="col-span-6 flex flex-col gap-3 min-h-0">
          <DataPanel title="Mapa de Mercado" subtitle="Performance por sector" className="flex-1" noPadding>
            <SectorHeatmap assets={Object.values(assets)} onSelect={(s) => navigate(`/activo/${s}`)} />
          </DataPanel>

          {/* Bottom metrics */}
          <div className="grid grid-cols-4 gap-2 shrink-0">
            <MetricCard
              label="Mercado"
              value="Risk-On"
              subValue="Momentum alcista"
              trend="up"
            />
            <MetricCard
              label="Vol. Total"
              value={formatVolume(Object.values(assets).reduce((sum, a) => sum + a.volume, 0))}
              subValue="+12% vs promedio"
              trend="up"
            />
            <MetricCard
              label="Senales Activas"
              value="8"
              subValue="5 compra, 2 venta, 1 hold"
            />
            <MetricCard
              label="VIX"
              value={formatNumber(assets['VIX']?.price ?? 14.8)}
              subValue={assets['VIX'] ? formatPercent(assets['VIX'].changePercent) : ''}
              trend={assets['VIX']?.changePercent > 0 ? 'up' : 'down'}
            />
          </div>
        </div>

        {/* Right: Quick Stats */}
        <div className="col-span-3 flex flex-col gap-3 min-h-0">
          <DataPanel title="Activos Destacados" className="flex-1">
            <div className="space-y-2">
              {['NVDA', 'BTC', 'AAPL', 'ETH', 'TSLA', 'SOL'].map((symbol) => {
                const asset = assets[symbol]
                if (!asset) return null
                return (
                  <MarketCard
                    key={symbol}
                    asset={asset}
                    onClick={() => navigate(`/activo/${symbol}`)}
                  />
                )
              })}
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  )
}

/* Sector Heatmap Component */
function SectorHeatmap({
  assets,
  onSelect,
}: {
  assets: MarketAsset[]
  onSelect: (symbol: string) => void
}) {
  const sectors = useMemo(() => {
    const map: Record<string, MarketAsset[]> = {}
    for (const asset of assets) {
      const sector = asset.sector ?? 'Otro'
      ;(map[sector] ??= []).push(asset)
    }
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [assets])

  return (
    <div className="grid grid-cols-3 gap-1 p-2 h-full">
      {sectors.map(([sector, sectorAssets]) => (
        <div key={sector} className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-fenix-text-muted uppercase px-1">
            {sector}
          </span>
          <div className="flex flex-wrap gap-1">
            {sectorAssets.map((asset) => {
              const isUp = asset.changePercent >= 0
              return (
                <button
                  key={asset.symbol}
                  onClick={() => onSelect(asset.symbol)}
                  className={cn(
                    'px-2 py-1.5 rounded text-left transition-all cursor-pointer min-w-[70px] flex-1',
                    isUp
                      ? 'bg-fenix-bullish/10 hover:bg-fenix-bullish/20'
                      : 'bg-fenix-bearish/10 hover:bg-fenix-bearish/20',
                  )}
                >
                  <div className="text-[11px] font-semibold text-fenix-text">{asset.symbol}</div>
                  <div
                    className={cn(
                      'text-[10px] font-mono font-medium',
                      isUp ? 'text-fenix-bullish' : 'text-fenix-bearish',
                    )}
                  >
                    {formatPercent(asset.changePercent)}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

type MarketAsset = ReturnType<typeof useMarketStore.getState>['assets'][string]
