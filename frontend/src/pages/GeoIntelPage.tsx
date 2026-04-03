import { useMemo } from 'react'
import { DataPanel } from '@/components/shared/DataPanel'
import { MOCK_REGIONS, type RegionData } from '@/data/mock-geo'
import { cn } from '@/lib/utils'

const RISK_ORDER: Record<string, number> = { alto: 0, medio: 1, bajo: 2 }

export function GeoIntelPage() {
  const regionsByRisk = useMemo(
    () => [...MOCK_REGIONS].sort((a, b) => RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel]),
    [],
  )

  const regionsByCapitalFlow = useMemo(
    () => [...MOCK_REGIONS].sort((a, b) => b.capitalFlow - a.capitalFlow),
    [],
  )

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      {/* Header */}
      <div className="panel p-3 shrink-0">
        <h1 className="text-lg font-bold text-fenix-text">Geo Inteligencia</h1>
        <p className="text-xs text-fenix-text-secondary mt-1">
          Performance de mercados globales y flujos de capital por region
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Left: Region Cards Grid */}
        <DataPanel title="Regiones" subtitle={`${MOCK_REGIONS.length} regiones`} className="col-span-8">
          <div className="grid grid-cols-2 gap-2">
            {MOCK_REGIONS.map((region: RegionData) => (
              <div
                key={region.id}
                className={cn(
                  'panel-card p-3',
                  region.riskLevel === 'alto' && 'border-l-2 border-l-fenix-bearish',
                  region.riskLevel === 'medio' && 'border-l-2 border-l-fenix-warning',
                  region.riskLevel === 'bajo' && 'border-l-2 border-l-fenix-bullish',
                )}
              >
                {/* Region header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-fenix-text">{region.name}</span>
                  <span
                    className={cn(
                      'text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase',
                      region.riskLevel === 'alto' && 'bg-fenix-bearish-bg text-fenix-bearish',
                      region.riskLevel === 'medio' && 'bg-fenix-warning-bg text-fenix-warning',
                      region.riskLevel === 'bajo' && 'bg-fenix-bullish-bg text-fenix-bullish',
                    )}
                  >
                    Riesgo {region.riskLevel}
                  </span>
                </div>

                {/* Performance */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-fenix-text-muted">Performance</span>
                  <span
                    className={cn(
                      'text-xs font-mono font-semibold',
                      region.marketPerformance >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish',
                    )}
                  >
                    {region.marketPerformance >= 0 ? '+' : ''}{region.marketPerformance.toFixed(2)}%
                  </span>
                </div>

                {/* Sentiment gauge: visual bar from -1 to 1 */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-fenix-text-muted">Sentimiento</span>
                    <span
                      className={cn(
                        'text-[9px] font-mono font-semibold',
                        region.sentiment >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish',
                      )}
                    >
                      {region.sentiment >= 0 ? '+' : ''}{region.sentiment.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full bg-fenix-card overflow-hidden">
                    {/* Center marker */}
                    <div className="absolute left-1/2 top-0 w-px h-full bg-fenix-text-muted/40 z-10" />
                    {/* Fill from center */}
                    {region.sentiment >= 0 ? (
                      <div
                        className="absolute top-0 h-full bg-fenix-bullish rounded-r-full"
                        style={{ left: '50%', width: `${region.sentiment * 50}%` }}
                      />
                    ) : (
                      <div
                        className="absolute top-0 h-full bg-fenix-bearish rounded-l-full"
                        style={{ right: '50%', width: `${Math.abs(region.sentiment) * 50}%` }}
                      />
                    )}
                  </div>
                </div>

                {/* Capital Flow */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-fenix-text-muted">Flujo Capital</span>
                  <span
                    className={cn(
                      'text-xs font-mono font-semibold',
                      region.capitalFlow >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish',
                    )}
                  >
                    {region.capitalFlow >= 0 ? '+' : ''}${(region.capitalFlow / 1e9).toFixed(1)}B
                  </span>
                </div>

                {/* Major Indices */}
                <div className="mb-2">
                  <span className="text-[9px] text-fenix-text-muted uppercase mb-1 block">Indices Principales</span>
                  <div className="flex flex-wrap gap-1">
                    {region.majorIndices.map((idx) => (
                      <span
                        key={idx.name}
                        className="text-[9px] bg-fenix-card px-1.5 py-0.5 rounded text-fenix-text-secondary"
                      >
                        {idx.name}:{' '}
                        <span className={idx.change >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish'}>
                          {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}%
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* News Intensity bar */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] text-fenix-text-muted">Intensidad Noticias</span>
                    <span className="text-[9px] font-mono text-fenix-text-secondary">{region.newsIntensity}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-fenix-card overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        region.newsIntensity >= 75 ? 'bg-fenix-accent' : region.newsIntensity >= 50 ? 'bg-fenix-warning' : 'bg-fenix-text-muted',
                      )}
                      style={{ width: `${region.newsIntensity}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DataPanel>

        {/* Right: Risk Heatmap Summary */}
        <div className="col-span-4 flex flex-col gap-3 min-h-0">
          <DataPanel title="Mapa de Riesgo" className="flex-1">
            <div className="space-y-1.5">
              {regionsByRisk.map((region: RegionData) => (
                <div key={region.id} className="flex items-center justify-between px-2 py-2 rounded bg-fenix-card/50">
                  <span className="text-xs text-fenix-text font-medium">{region.name}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-xs font-mono font-semibold',
                        region.marketPerformance >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish',
                      )}
                    >
                      {region.marketPerformance >= 0 ? '+' : ''}{region.marketPerformance.toFixed(2)}%
                    </span>
                    <span
                      className={cn(
                        'text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase',
                        region.riskLevel === 'alto' && 'bg-fenix-bearish-bg text-fenix-bearish',
                        region.riskLevel === 'medio' && 'bg-fenix-warning-bg text-fenix-warning',
                        region.riskLevel === 'bajo' && 'bg-fenix-bullish-bg text-fenix-bullish',
                      )}
                    >
                      {region.riskLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DataPanel>

          <DataPanel title="Ranking Flujo de Capital" className="flex-1">
            <div className="space-y-1.5">
              {regionsByCapitalFlow.map((region: RegionData, idx) => (
                <div key={region.id} className="flex items-center justify-between px-2 py-2 rounded bg-fenix-card/50">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-fenix-text-muted w-4">#{idx + 1}</span>
                    <span className="text-xs text-fenix-text font-medium">{region.name}</span>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-mono font-semibold',
                      region.capitalFlow >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish',
                    )}
                  >
                    {region.capitalFlow >= 0 ? '+' : ''}${(region.capitalFlow / 1e9).toFixed(1)}B
                  </span>
                </div>
              ))}
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  )
}
