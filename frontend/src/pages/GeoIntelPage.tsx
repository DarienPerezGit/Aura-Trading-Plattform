import { DataPanel } from '@/components/shared/DataPanel'
import { MOCK_REGIONS, type RegionData } from '@/data/mock-geo'
import { cn } from '@/lib/utils'

export function GeoIntelPage() {
  return (
    <div className="h-full flex flex-col gap-3 p-3">
      <div className="panel p-3 shrink-0">
        <h1 className="text-lg font-bold text-fenix-text">Geo Inteligencia</h1>
        <p className="text-xs text-fenix-text-secondary mt-1">
          Performance de mercados globales y flujos de capital por region
        </p>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        <div className="col-span-8 flex flex-col gap-3 min-h-0">
          <DataPanel title="Regiones" className="flex-1">
            <div className="space-y-2">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-fenix-text">{region.name}</span>
                    <span className={cn(
                      'text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase',
                      region.riskLevel === 'alto' && 'bg-fenix-bearish-bg text-fenix-bearish',
                      region.riskLevel === 'medio' && 'bg-fenix-warning-bg text-fenix-warning',
                      region.riskLevel === 'bajo' && 'bg-fenix-bullish-bg text-fenix-bullish',
                    )}>
                      Riesgo {region.riskLevel}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-[11px]">
                    <div>
                      <span className="text-fenix-text-muted">Performance</span>
                      <div className={cn('font-mono font-semibold', region.marketPerformance >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish')}>
                        {region.marketPerformance >= 0 ? '+' : ''}{region.marketPerformance.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-fenix-text-muted">Sentimiento</span>
                      <div className={cn('font-mono font-semibold', region.sentiment >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish')}>
                        {region.sentiment.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-fenix-text-muted">Flujo Capital</span>
                      <div className={cn('font-mono font-semibold', region.capitalFlow >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish')}>
                        ${(region.capitalFlow / 1e9).toFixed(1)}B
                      </div>
                    </div>
                    <div>
                      <span className="text-fenix-text-muted">Noticias</span>
                      <div className="font-mono font-semibold text-fenix-text">{region.newsIntensity}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {region.majorIndices.map((idx) => (
                      <span key={idx.name} className="text-[9px] bg-fenix-card px-1.5 py-0.5 rounded text-fenix-text-secondary">
                        {idx.name}: <span className={idx.change >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish'}>{idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DataPanel>
        </div>

        <div className="col-span-4 flex flex-col gap-3 min-h-0">
          <DataPanel title="Riesgo por Region" className="flex-1">
            <div className="space-y-2">
              {MOCK_REGIONS.map((region: RegionData) => (
                <div key={region.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-fenix-card/50">
                  <span className="text-xs text-fenix-text">{region.name}</span>
                  <span className={cn(
                    'text-[9px] font-semibold px-1.5 py-0.5 rounded',
                    region.riskLevel === 'alto' && 'bg-fenix-bearish-bg text-fenix-bearish',
                    region.riskLevel === 'medio' && 'bg-fenix-warning-bg text-fenix-warning',
                    region.riskLevel === 'bajo' && 'bg-fenix-bullish-bg text-fenix-bullish',
                  )}>
                    {region.riskLevel}
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
