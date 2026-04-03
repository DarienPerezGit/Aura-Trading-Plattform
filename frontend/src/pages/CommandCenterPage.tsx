import { useMemo } from 'react'
import {
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  BarChart3,
  Zap,
  Activity,
} from 'lucide-react'
import { useMarketStore } from '@/stores/market-store'
import type { MarketAsset } from '@/stores/market-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { MarketCard } from '@/components/market/MarketCard'
import { DataPanel } from '@/components/shared/DataPanel'
import { MetricCard } from '@/components/shared/MetricCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SparklineChart } from '@/components/charts/SparklineChart'
import { cn } from '@/lib/utils'
import { formatNumber, formatPercent, formatVolume } from '@/lib/format'
import { MOCK_SIGNALS, MOCK_AI_MARKET_SUMMARY } from '@/data/mock-signals'
import type { AISignal } from '@/stores/ai-store'

const GLOBAL_INDICES = ['SPY', 'QQQ', 'BTC', 'ETH', 'DXY', 'GLD', 'OIL', 'VIX']

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
      {/* Top Row: Market Snapshot */}
      <div className="grid grid-cols-4 xl:grid-cols-8 gap-2 shrink-0">
        {globalAssets.map((asset) => (
          <button
            key={asset.symbol}
            onClick={() => navigate(`/activo/${asset.symbol}`)}
            className="panel-card p-2.5 hover:bg-aura-card-hover transition-all cursor-pointer text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-aura-text">{asset.symbol}</span>
              <SparklineChart
                data={asset.sparkline}
                width={40}
                height={14}
                positive={asset.changePercent >= 0}
              />
            </div>
            <div className="text-sm font-mono font-semibold text-aura-text">
              ${formatNumber(asset.price)}
            </div>
            <div
              className={cn(
                'text-[10px] font-mono',
                asset.changePercent >= 0 ? 'text-aura-bullish' : 'text-aura-bearish',
              )}
            >
              {formatPercent(asset.changePercent)}
            </div>
          </button>
        ))}
      </div>

      {/* Main 3-column grid */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* LEFT: Watchlist + Top Movers (col-span-3) */}
        <div className="col-span-3 flex flex-col gap-3 min-h-0">
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

          <DataPanel title="Top Movers" className="flex-1">
            <div className="space-y-3">
              {/* Gainers */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowUpRight className="w-3 h-3 text-aura-bullish" />
                  <span className="text-[10px] font-semibold text-aura-bullish uppercase">
                    Mayores subas
                  </span>
                </div>
                {movers.gainers.slice(0, 3).map((a) => (
                  <button
                    key={a.symbol}
                    onClick={() => navigate(`/activo/${a.symbol}`)}
                    className="flex items-center justify-between w-full px-2 py-1 rounded hover:bg-aura-card transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-aura-text">{a.symbol}</span>
                    <span className="text-xs font-mono text-aura-bullish">
                      {formatPercent(a.changePercent)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Losers */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowDownRight className="w-3 h-3 text-aura-bearish" />
                  <span className="text-[10px] font-semibold text-aura-bearish uppercase">
                    Mayores bajas
                  </span>
                </div>
                {movers.losers.slice(0, 3).map((a) => (
                  <button
                    key={a.symbol}
                    onClick={() => navigate(`/activo/${a.symbol}`)}
                    className="flex items-center justify-between w-full px-2 py-1 rounded hover:bg-aura-card transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-aura-text">{a.symbol}</span>
                    <span className="text-xs font-mono text-aura-bearish">
                      {formatPercent(a.changePercent)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </DataPanel>
        </div>

        {/* CENTER: Sector Heatmap + Metrics (col-span-6) */}
        <div className="col-span-6 flex flex-col gap-3 min-h-0">
          <DataPanel
            title="Mapa de Mercado"
            subtitle="Performance por sector"
            className="flex-1"
            noPadding
          >
            <SectorHeatmap
              assets={Object.values(assets)}
              onSelect={(s) => navigate(`/activo/${s}`)}
            />
          </DataPanel>

          {/* Bottom metrics */}
          <div className="grid grid-cols-4 gap-2 shrink-0">
            <MetricCard
              label="Regimen"
              value="Risk-On"
              subValue="Momentum alcista"
              trend="up"
              icon={<Activity className="w-3.5 h-3.5" />}
            />
            <MetricCard
              label="Vol. Total"
              value={formatVolume(Object.values(assets).reduce((sum, a) => sum + a.volume, 0))}
              subValue="+12% vs promedio"
              trend="up"
              icon={<BarChart3 className="w-3.5 h-3.5" />}
            />
            <MetricCard
              label="Senales Activas"
              value={String(MOCK_SIGNALS.length)}
              subValue={`${MOCK_SIGNALS.filter((s) => s.direction === 'compra').length} compra, ${MOCK_SIGNALS.filter((s) => s.direction === 'venta').length} venta`}
              icon={<Zap className="w-3.5 h-3.5" />}
            />
            <MetricCard
              label="VIX"
              value={formatNumber(assets['VIX']?.price ?? 14.8)}
              subValue={assets['VIX'] ? formatPercent(assets['VIX'].changePercent) : ''}
              trend={assets['VIX']?.changePercent !== undefined
                ? assets['VIX'].changePercent > 0 ? 'up' : 'down'
                : undefined}
            />
          </div>
        </div>

        {/* RIGHT: Signals Panel + AI Summary (col-span-3) */}
        <div className="col-span-3 flex flex-col gap-3 min-h-0">
          <DataPanel
            title="Senales Activas"
            subtitle={`${MOCK_SIGNALS.length} senales`}
            className="flex-[2]"
          >
            <div className="space-y-2">
              {MOCK_SIGNALS.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          </DataPanel>

          <DataPanel
            title="AI Market Summary"
            className="flex-1"
            actions={<Brain className="w-3.5 h-3.5 text-aura-ai" />}
          >
            <div className="text-[11px] leading-relaxed text-aura-text-secondary whitespace-pre-line">
              {MOCK_AI_MARKET_SUMMARY.replace(/\*\*/g, '')}
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  )
}

/* ---- Signal Card ---- */
function SignalCard({ signal }: { signal: AISignal }) {
  return (
    <div className="panel-card p-2.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-aura-text">{signal.symbol}</span>
        <StatusBadge status={signal.direction} size="sm" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-aura-text-muted">{signal.regime}</span>
        <span
          className={cn(
            'text-[11px] font-mono font-semibold',
            signal.confidence >= 75
              ? 'text-aura-bullish'
              : signal.confidence >= 60
                ? 'text-aura-warning'
                : 'text-aura-text-muted',
          )}
        >
          {signal.confidence}%
        </span>
      </div>
    </div>
  )
}

/* ---- Sector Heatmap (visual centerpiece) ---- */
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

  function sectorAvgChange(sectorAssets: MarketAsset[]): number {
    if (sectorAssets.length === 0) return 0
    return sectorAssets.reduce((sum, a) => sum + a.changePercent, 0) / sectorAssets.length
  }

  function heatColor(changePercent: number): string {
    const abs = Math.abs(changePercent)
    const opacity = Math.min(0.5, 0.15 + (abs / 5) * 0.35)
    if (changePercent >= 0) {
      return `rgba(34, 197, 94, ${opacity.toFixed(2)})`
    }
    return `rgba(239, 68, 68, ${opacity.toFixed(2)})`
  }

  return (
    <div className="grid grid-cols-3 gap-2 p-3 h-full auto-rows-fr">
      {sectors.map(([sector, sectorAssets]) => {
        const avg = sectorAvgChange(sectorAssets)
        const isUp = avg >= 0
        return (
          <div key={sector} className="flex flex-col gap-1.5 min-h-0">
            <div className="flex items-center justify-between px-1.5">
              <span className="text-[10px] font-bold text-aura-text uppercase tracking-wide">
                {sector}
              </span>
              <span
                className={cn(
                  'text-[10px] font-mono font-semibold',
                  isUp ? 'text-aura-bullish' : 'text-aura-bearish',
                )}
              >
                {formatPercent(avg)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {sectorAssets.map((asset) => {
                const assetUp = asset.changePercent >= 0
                return (
                  <button
                    key={asset.symbol}
                    onClick={() => onSelect(asset.symbol)}
                    style={{ backgroundColor: heatColor(asset.changePercent) }}
                    className={cn(
                      'rounded-md px-3 py-3 text-left transition-all cursor-pointer min-w-[80px] flex-1',
                      'hover:ring-1 hover:ring-aura-border hover:brightness-110',
                      'flex flex-col justify-center',
                    )}
                  >
                    <div className="text-xs font-bold text-aura-text">{asset.symbol}</div>
                    <div className="text-[10px] text-aura-text-muted truncate">{asset.name}</div>
                    <div
                      className={cn(
                        'text-sm font-mono font-bold mt-1',
                        assetUp ? 'text-aura-bullish' : 'text-aura-bearish',
                      )}
                    >
                      {formatPercent(asset.changePercent)}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
