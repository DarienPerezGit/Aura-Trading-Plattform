import { useMemo } from 'react'
import { DataPanel } from '@/components/shared/DataPanel'
import { MetricCard } from '@/components/shared/MetricCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MOCK_STRATEGIES, MOCK_OPPORTUNITIES } from '@/data/mock-strategies'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/format'

export function StrategyLabPage() {
  const activeCount = MOCK_STRATEGIES.filter((s) => s.active).length
  const avgSharpe = MOCK_STRATEGIES.reduce((sum, s) => sum + s.sharpe, 0) / MOCK_STRATEGIES.length
  const avgWinRate = MOCK_STRATEGIES.reduce((sum, s) => sum + s.winRate, 0) / MOCK_STRATEGIES.length

  const typeLabels: Record<string, string> = useMemo(() => ({
    momentum: 'Momentum',
    mean_reversion: 'Mean Rev.',
    breakout: 'Breakout',
    volatility: 'Volatilidad',
    sentiment: 'Sentimiento',
    ai_composite: 'AI Comp.',
  }), [])

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      {/* Top: Summary Metrics */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        <MetricCard label="Total Estrategias" value={MOCK_STRATEGIES.length} />
        <MetricCard label="Activas" value={activeCount} trend="up" />
        <MetricCard label="Sharpe Promedio" value={avgSharpe.toFixed(2)} />
        <MetricCard label="Win Rate Promedio" value={`${avgWinRate.toFixed(1)}%`} />
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Left: Strategy Catalog */}
        <DataPanel
          title="Catalogo de Estrategias"
          subtitle={`${MOCK_STRATEGIES.length} estrategias`}
          className="col-span-7"
        >
          <div className="space-y-2">
            {MOCK_STRATEGIES.map((strategy) => (
              <div key={strategy.id} className="panel-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-fenix-text">{strategy.name}</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-fenix-accent-bg text-fenix-accent uppercase">
                      {typeLabels[strategy.type] ?? strategy.type}
                    </span>
                  </div>
                  {/* Active/Inactive toggle visual */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        'w-7 h-4 rounded-full relative transition-colors',
                        strategy.active ? 'bg-fenix-bullish' : 'bg-fenix-text-muted/30',
                      )}
                    >
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all',
                          strategy.active ? 'left-3.5' : 'left-0.5',
                        )}
                      />
                    </div>
                    <span className={cn(
                      'text-[9px] font-semibold uppercase',
                      strategy.active ? 'text-fenix-bullish' : 'text-fenix-text-muted',
                    )}>
                      {strategy.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-fenix-text-secondary mb-2">{strategy.description}</p>
                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <span className="text-[9px] text-fenix-text-muted uppercase">Sharpe</span>
                    <div className="text-xs font-mono font-semibold text-fenix-text">{strategy.sharpe.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-[9px] text-fenix-text-muted uppercase">Retorno</span>
                    <div
                      className={cn(
                        'text-xs font-mono font-semibold',
                        strategy.recentReturn >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish',
                      )}
                    >
                      {strategy.recentReturn >= 0 ? '+' : ''}{strategy.recentReturn.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-fenix-text-muted uppercase">Max DD</span>
                    <div className="text-xs font-mono font-semibold text-fenix-bearish">
                      {strategy.maxDrawdown.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-fenix-text-muted uppercase">Win Rate</span>
                    <div className="text-xs font-mono font-semibold text-fenix-text">
                      {strategy.winRate.toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-fenix-text-muted uppercase">Senales</span>
                    <div className="text-xs font-mono font-semibold text-fenix-accent">{strategy.signals}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DataPanel>

        {/* Right: Opportunity Feed */}
        <DataPanel
          title="Oportunidades Detectadas"
          subtitle={`${MOCK_OPPORTUNITIES.length} oportunidades`}
          className="col-span-5"
        >
          <div className="space-y-2">
            {MOCK_OPPORTUNITIES.map((opp) => (
              <div key={opp.id} className="panel-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-fenix-text">{opp.symbol}</span>
                    <StatusBadge status={opp.direction} />
                  </div>
                  <span className="text-[10px] text-fenix-text-muted">{formatTime(opp.timestamp)}</span>
                </div>
                <div className="text-[11px] text-fenix-text-secondary mb-2">{opp.strategy}</div>
                {/* Confidence bar */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] text-fenix-text-muted">Confianza</span>
                  <div className="flex-1 h-1.5 rounded-full bg-fenix-card overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        opp.confidence >= 80 ? 'bg-fenix-bullish' : opp.confidence >= 60 ? 'bg-fenix-accent' : 'bg-fenix-warning',
                      )}
                      style={{ width: `${opp.confidence}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono font-semibold text-fenix-text">{opp.confidence}%</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-fenix-text-muted">
                    Regimen: <span className="text-fenix-text-secondary">{opp.regime}</span>
                  </span>
                  <span className="text-fenix-text-muted">
                    Riesgo: <span className="text-fenix-bearish font-mono">{opp.expectedRisk.toFixed(1)}%</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DataPanel>
      </div>
    </div>
  )
}
