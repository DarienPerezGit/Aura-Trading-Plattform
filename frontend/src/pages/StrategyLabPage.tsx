import { DataPanel } from '@/components/shared/DataPanel'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MOCK_STRATEGIES } from '@/data/mock-strategies'
import { cn } from '@/lib/utils'

export function StrategyLabPage() {
  return (
    <div className="h-full flex flex-col gap-3 p-3">
      <div className="panel p-3 shrink-0">
        <h1 className="text-lg font-bold text-fenix-text">Laboratorio de Estrategias</h1>
        <p className="text-xs text-fenix-text-secondary mt-1">
          Backtesting, optimizacion y monitoreo de estrategias de trading
        </p>
      </div>

      <DataPanel title="Estrategias" subtitle={`${MOCK_STRATEGIES.length} estrategias`} className="flex-1">
        <div className="space-y-2">
          {MOCK_STRATEGIES.map((strategy) => (
            <div key={strategy.id} className="panel-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-fenix-text">{strategy.name}</span>
                  <StatusBadge status={strategy.active ? 'live' : 'delayed'} />
                </div>
                <span className="text-[10px] text-fenix-text-muted uppercase">{strategy.type}</span>
              </div>
              <p className="text-[11px] text-fenix-text-secondary mb-2">{strategy.description}</p>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <span className="text-[9px] text-fenix-text-muted uppercase">Sharpe</span>
                  <div className="text-xs font-mono font-semibold text-fenix-text">{strategy.sharpe.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-[9px] text-fenix-text-muted uppercase">Retorno</span>
                  <div className={cn(
                    'text-xs font-mono font-semibold',
                    strategy.recentReturn >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish',
                  )}>
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
              </div>
            </div>
          ))}
        </div>
      </DataPanel>
    </div>
  )
}
