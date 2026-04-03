import { DataPanel } from '@/components/shared/DataPanel'
import { MetricCard } from '@/components/shared/MetricCard'
import { PriceChange } from '@/components/shared/PriceChange'
import { MOCK_POSITIONS, MOCK_STATS } from '@/data/mock-portfolio'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { formatNumber, formatVolume } from '@/lib/format'

export function PortfolioPage() {
  const { navigate } = useWorkspaceStore()
  const stats = MOCK_STATS

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      {/* Summary Row */}
      <div className="grid grid-cols-5 gap-2 shrink-0">
        <MetricCard label="Equity Total" value={`$${formatVolume(stats.totalEquity)}`} />
        <MetricCard
          label="P&L Diario"
          value={`$${formatNumber(stats.dailyPnl)}`}
          subValue={`${stats.dailyPnlPercent >= 0 ? '+' : ''}${stats.dailyPnlPercent.toFixed(2)}%`}
          trend={stats.dailyPnl >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          label="Retorno Total"
          value={`$${formatNumber(stats.totalReturn)}`}
          subValue={`${stats.totalReturnPercent >= 0 ? '+' : ''}${stats.totalReturnPercent.toFixed(2)}%`}
          trend={stats.totalReturn >= 0 ? 'up' : 'down'}
        />
        <MetricCard label="Sharpe" value={stats.sharpe.toFixed(2)} />
        <MetricCard label="Drawdown" value={`${stats.drawdown}%`} trend="down" />
      </div>

      {/* Holdings Table */}
      <DataPanel title="Posiciones" subtitle={`${MOCK_POSITIONS.length} activos`} className="flex-1">
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-fenix-text-muted text-[10px] uppercase border-b border-fenix-border">
                <th className="text-left py-2 px-2">Activo</th>
                <th className="text-right py-2 px-2">Cantidad</th>
                <th className="text-right py-2 px-2">Precio Actual</th>
                <th className="text-right py-2 px-2">Entrada Prom.</th>
                <th className="text-right py-2 px-2">P&L Diario</th>
                <th className="text-right py-2 px-2">P&L Total</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_POSITIONS.map((pos) => (
                <tr
                  key={pos.symbol}
                  onClick={() => navigate(`/activo/${pos.symbol}`)}
                  className="border-b border-fenix-border/50 hover:bg-fenix-card/50 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-2">
                    <span className="font-semibold text-fenix-text">{pos.symbol}</span>
                    <span className="text-fenix-text-muted ml-1.5">{pos.name}</span>
                  </td>
                  <td className="text-right py-2 px-2 font-mono text-fenix-text-secondary">{pos.quantity}</td>
                  <td className="text-right py-2 px-2 font-mono text-fenix-text">
                    ${formatNumber(pos.currentPrice)}
                  </td>
                  <td className="text-right py-2 px-2 font-mono text-fenix-text-secondary">
                    ${formatNumber(pos.avgEntry)}
                  </td>
                  <td className="text-right py-2 px-2">
                    <PriceChange value={pos.dailyPnl} percent={0} size="sm" />
                  </td>
                  <td className="text-right py-2 px-2">
                    <PriceChange value={pos.totalPnl} percent={pos.totalPnlPercent} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataPanel>
    </div>
  )
}
