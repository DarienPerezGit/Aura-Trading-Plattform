import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  BarChart3,
  Zap,
  Activity,
} from 'lucide-react'
import { useMarketStore } from '@/stores/market-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { MarketCard } from '@/components/market/MarketCard'
import { DataPanel } from '@/components/shared/DataPanel'
import { MetricCard } from '@/components/shared/MetricCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SparklineChart } from '@/components/charts/SparklineChart'
import { GeoIntelMap } from '@/components/charts/GeoIntelMap'
import { cn } from '@/lib/utils'
import { formatNumber, formatPercent, formatVolume } from '@/lib/format'
import { MOCK_SIGNALS, MOCK_AI_MARKET_SUMMARY } from '@/data/mock-signals'
import { fetchMacroSignal } from '@/lib/api'
import type { AISignal } from '@/stores/ai-store'

const GLOBAL_INDICES = ['SPY', 'QQQ', 'BTC', 'ETH', 'DXY', 'GLD', 'OIL', 'VIX']

export function CommandCenterPage() {
  const assets = useMarketStore((s) => s.assets)
  const movers = useMarketStore((s) => s.movers)
  const watchlist = useMarketStore((s) => s.watchlist)
  const { navigate } = useWorkspaceStore()

  const [regime, setRegime] = useState<string>('Risk-On')
  const [regimeDetail, setRegimeDetail] = useState<string>('Momentum alcista')
  const [aiSummary, setAiSummary] = useState<string>(MOCK_AI_MARKET_SUMMARY)

  useEffect(() => {
    fetchMacroSignal()
      .then((signal) => {
        const label = signal.signal === 'RISK_ON' ? 'Risk-On' : 'Risk-Off'
        setRegime(label)
        setRegimeDetail(`Confianza: ${(signal.confidence * 100).toFixed(0)}%`)
        const summary = `**Sesion ${label}** (${(signal.confidence * 100).toFixed(0)}%) — ${signal.reasoning}

**Factores clave:**
${signal.key_factors.map((f) => `- ${f}`).join('\n')}

**Senal:** ${signal.signal}`
        setAiSummary(summary)
      })
      .catch(() => {})
  }, [])

  const globalAssets = useMemo(
    () => GLOBAL_INDICES.map((s) => assets[s]).filter(Boolean),
    [assets],
  )

  return (
    <div className="h-full flex flex-col gap-2 p-3">
      {/* Top Row: Market KPIs */}
      <div className="grid grid-cols-4 xl:grid-cols-8 gap-2 shrink-0">
        {globalAssets.map((asset) => (
          <button
            key={asset.symbol}
            onClick={() => navigate(`/activo/${asset.symbol}`)}
            className="panel-card p-2 hover:bg-aura-card-hover transition-all cursor-pointer text-left"
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-semibold text-aura-text">{asset.symbol}</span>
              <SparklineChart
                data={asset.sparkline}
                width={36}
                height={12}
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

      {/* Main Grid: Signals | GEO MAP (center) | AI Insights */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        {/* LEFT: Signals Panel (col-span-2) */}
        <div className="col-span-2 flex flex-col gap-2 min-h-0">
          <DataPanel
            title="Senales"
            subtitle={`${MOCK_SIGNALS.length} activas`}
            className="flex-1"
          >
            <div className="space-y-1.5">
              {MOCK_SIGNALS.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  onClick={() => navigate(`/activo/${signal.symbol}`)}
                />
              ))}
            </div>
          </DataPanel>

          {/* Quick Movers */}
          <DataPanel title="Top Movers" className="shrink-0">
            <div className="space-y-1">
              {movers.gainers.slice(0, 2).map((a) => (
                <button
                  key={a.symbol}
                  onClick={() => navigate(`/activo/${a.symbol}`)}
                  className="flex items-center justify-between w-full px-1.5 py-0.5 rounded hover:bg-aura-card transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-2.5 h-2.5 text-aura-bullish" />
                    <span className="text-[11px] text-aura-text">{a.symbol}</span>
                  </div>
                  <span className="text-[11px] font-mono text-aura-bullish">
                    {formatPercent(a.changePercent)}
                  </span>
                </button>
              ))}
              {movers.losers.slice(0, 2).map((a) => (
                <button
                  key={a.symbol}
                  onClick={() => navigate(`/activo/${a.symbol}`)}
                  className="flex items-center justify-between w-full px-1.5 py-0.5 rounded hover:bg-aura-card transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-2.5 h-2.5 text-aura-bearish" />
                    <span className="text-[11px] text-aura-text">{a.symbol}</span>
                  </div>
                  <span className="text-[11px] font-mono text-aura-bearish">
                    {formatPercent(a.changePercent)}
                  </span>
                </button>
              ))}
            </div>
          </DataPanel>
        </div>

        {/* CENTER: Geo-Intelligence Map (col-span-7) — THE CENTERPIECE */}
        <div className="col-span-7 flex flex-col gap-2 min-h-0">
          <DataPanel
            title="Global Intelligence"
            subtitle="Real-time market activity & risk"
            className="flex-1"
            noPadding
          >
            <GeoIntelMap
              onRegionClick={() => {
                navigate('/geo')
              }}
            />
          </DataPanel>

          {/* Bottom metrics row */}
          <div className="grid grid-cols-4 gap-2 shrink-0">
            <MetricCard
              label="Regimen"
              value={regime}
              subValue={regimeDetail}
              trend={regime === 'Risk-On' ? 'up' : 'down'}
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

        {/* RIGHT: AI Insights + Watchlist (col-span-3) */}
        <div className="col-span-3 flex flex-col gap-2 min-h-0">
          {/* AI Market Summary */}
          <DataPanel
            title="AI Insights"
            className="shrink-0"
            actions={<Brain className="w-3.5 h-3.5 text-aura-ai" />}
          >
            <div className="text-[10px] leading-relaxed text-aura-text-secondary whitespace-pre-line">
              {aiSummary.split('**').map((part, i) =>
                i % 2 === 1 ? (
                  <strong key={i} className="text-aura-text font-semibold">{part}</strong>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
            </div>
          </DataPanel>

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
        </div>
      </div>
    </div>
  )
}

/* ---- Signal Card ---- */
function SignalCard({ signal, onClick }: { signal: AISignal; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full panel-card p-2 text-left hover:bg-aura-card-hover transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[11px] font-bold text-aura-text">{signal.symbol}</span>
        <StatusBadge status={signal.direction} size="sm" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-aura-text-muted truncate mr-2">{signal.regime}</span>
        <span
          className={cn(
            'text-[10px] font-mono font-semibold',
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
    </button>
  )
}
