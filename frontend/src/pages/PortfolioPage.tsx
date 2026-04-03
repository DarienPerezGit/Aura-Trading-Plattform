import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts'
import { DataPanel } from '@/components/shared/DataPanel'
import { MetricCard } from '@/components/shared/MetricCard'
import { PriceChange } from '@/components/shared/PriceChange'
import { MOCK_POSITIONS, MOCK_STATS, MOCK_EQUITY_CURVE } from '@/data/mock-portfolio'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { formatNumber, formatCompactCurrency } from '@/lib/format'
import { theme } from '@/config/theme'

const SECTOR_COLORS: Record<string, string> = {
  Tecnologia: '#00D1FF',
  Semiconductores: '#A855F7',
  Crypto: '#FFB020',
  Commodities: '#00C853',
  Finanzas: '#FF3B5C',
}

interface SectorAllocation {
  name: string
  value: number
  color: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name?: string; payload?: { name?: string; date?: string } }>
}

function AllocationTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-aura-panel border border-aura-border rounded-md px-3 py-2 text-xs shadow-lg">
      <p className="text-aura-text font-medium">{entry.payload?.name}</p>
      <p className="text-aura-text-secondary font-mono mt-0.5">
        {formatCompactCurrency(entry.value)}
      </p>
    </div>
  )
}

function EquityCurveTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-aura-panel border border-aura-border rounded-md px-3 py-2 text-xs shadow-lg">
      <p className="text-aura-text-muted">{entry.payload?.date}</p>
      <p className="text-aura-text font-mono font-semibold mt-0.5">
        {formatCompactCurrency(entry.value)}
      </p>
    </div>
  )
}

export function PortfolioPage() {
  const { navigate } = useWorkspaceStore()
  const stats = MOCK_STATS

  const sectorData = useMemo<SectorAllocation[]>(() => {
    const grouped: Record<string, number> = {}
    for (const pos of MOCK_POSITIONS) {
      const notional = pos.currentPrice * pos.quantity
      grouped[pos.sector] = (grouped[pos.sector] ?? 0) + notional
    }
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value: +value.toFixed(2),
      color: SECTOR_COLORS[name] ?? '#6B7B8D',
    }))
  }, [])

  const benchmarkCurve = useMemo(() => {
    return MOCK_EQUITY_CURVE.map((pt, i) => {
      const base = 250000
      const benchGrowth = base * (1 + i * 0.0008)
      return {
        ...pt,
        benchmark: +benchGrowth.toFixed(2),
      }
    })
  }, [])

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      {/* Header Metrics */}
      <div className="grid grid-cols-6 gap-2 shrink-0">
        <MetricCard
          label="Total Equity"
          value={formatCompactCurrency(stats.totalEquity)}
        />
        <MetricCard
          label="Daily P&L"
          value={`$${formatNumber(stats.dailyPnl)}`}
          subValue={`${stats.dailyPnlPercent >= 0 ? '+' : ''}${stats.dailyPnlPercent.toFixed(2)}%`}
          trend={stats.dailyPnl >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          label="Total Return"
          value={`$${formatNumber(stats.totalReturn)}`}
          subValue={`${stats.totalReturnPercent >= 0 ? '+' : ''}${stats.totalReturnPercent.toFixed(2)}%`}
          trend={stats.totalReturn >= 0 ? 'up' : 'down'}
        />
        <MetricCard label="Sharpe Ratio" value={stats.sharpe.toFixed(2)} />
        <MetricCard
          label="Max Drawdown"
          value={`${stats.drawdown}%`}
          trend="down"
        />
        <MetricCard
          label="Risk Score"
          value={`${stats.riskScore}/100`}
          trend={stats.riskScore > 70 ? 'down' : stats.riskScore > 40 ? 'neutral' : 'up'}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Left Column: Allocation + Risk */}
        <div className="col-span-4 flex flex-col gap-3 min-h-0">
          <DataPanel title="Sector Allocation" subtitle="By notional value" className="flex-1" noPadding>
            <div className="flex flex-col items-center justify-center h-full px-3 py-2">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {sectorData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<AllocationTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
                {sectorData.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-[10px]">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-aura-text-secondary">{s.name}</span>
                    <span className="text-aura-text-muted font-mono">
                      {formatCompactCurrency(s.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DataPanel>

          {/* Risk Module */}
          <DataPanel title="Risk Module" subtitle="Portfolio risk metrics">
            <div className="grid grid-cols-1 gap-3">
              <RiskMetric
                label="Value at Risk (95%)"
                value={`-$${formatNumber(stats.totalEquity * 0.018)}`}
                detail="1-day, parametric"
                severity="warning"
              />
              <RiskMetric
                label="Concentration Risk"
                value={`${MOCK_POSITIONS.reduce((max, p) => Math.max(max, p.riskContribution), 0).toFixed(1)}%`}
                detail={`Top position: ${MOCK_POSITIONS.reduce((top, p) => p.riskContribution > top.riskContribution ? p : top, MOCK_POSITIONS[0]).symbol}`}
                severity="high"
              />
              <RiskMetric
                label="Volatility Exposure"
                value="14.2%"
                detail="Annualized portfolio vol"
                severity="normal"
              />
            </div>
          </DataPanel>
        </div>

        {/* Center Column: Equity Curve + Benchmark */}
        <div className="col-span-5 flex flex-col gap-3 min-h-0">
          <DataPanel title="Equity Curve" subtitle="90-day performance" className="flex-1" noPadding>
            <div className="h-full w-full px-2 py-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_EQUITY_CURVE} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.colors.bullish} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={theme.colors.bullish} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.textMuted, fontSize: 10 }}
                    tickFormatter={(d: string) => d.slice(5)}
                    interval="preserveStartEnd"
                    minTickGap={40}
                  />
                  <YAxis
                    domain={['dataMin - 2000', 'dataMax + 2000']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.textMuted, fontSize: 10 }}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                    width={42}
                  />
                  <RechartsTooltip content={<EquityCurveTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={theme.colors.bullish}
                    strokeWidth={1.5}
                    fill="url(#equityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DataPanel>

          {/* Performance vs Benchmark */}
          <DataPanel title="Performance vs Benchmark" subtitle="Portfolio vs S&P 500 proxy" noPadding>
            <div className="h-[160px] w-full px-2 py-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={benchmarkCurve} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="benchGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.colors.accent} stopOpacity={0.12} />
                      <stop offset="100%" stopColor={theme.colors.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.textMuted, fontSize: 10 }}
                    tickFormatter={(d: string) => d.slice(5)}
                    interval="preserveStartEnd"
                    minTickGap={60}
                  />
                  <YAxis
                    domain={['dataMin - 2000', 'dataMax + 2000']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.textMuted, fontSize: 10 }}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                    width={42}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={theme.colors.bullish}
                    strokeWidth={1.5}
                    fill="url(#benchGradient)"
                    name="Portfolio"
                  />
                  <Area
                    type="monotone"
                    dataKey="benchmark"
                    stroke={theme.colors.textSecondary}
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    fill="none"
                    name="Benchmark"
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="bg-aura-panel border border-aura-border rounded-md px-3 py-2 text-xs shadow-lg">
                          <p className="text-aura-text-muted">{payload[0]?.payload?.date}</p>
                          <p className="text-aura-bullish font-mono mt-0.5">
                            Port: {formatCompactCurrency(payload[0]?.value as number)}
                          </p>
                          {payload[1] && (
                            <p className="text-aura-text-secondary font-mono">
                              Bench: {formatCompactCurrency(payload[1]?.value as number)}
                            </p>
                          )}
                        </div>
                      )
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 px-3 pb-2 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded bg-aura-bullish" />
                <span className="text-aura-text-secondary">Portfolio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded bg-aura-text-secondary opacity-60" />
                <span className="text-aura-text-secondary">S&P 500</span>
              </div>
            </div>
          </DataPanel>
        </div>

        {/* Right Column: Positions Table */}
        <div className="col-span-3 min-h-0">
          <DataPanel
            title="Positions"
            subtitle={`${MOCK_POSITIONS.length} assets`}
            className="h-full"
            noPadding
          >
            <div className="overflow-auto h-full">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-aura-panel z-10">
                  <tr className="text-aura-text-muted text-[9px] uppercase tracking-wider border-b border-aura-border">
                    <th className="text-left py-2 px-2">Symbol</th>
                    <th className="text-right py-2 px-2">Qty</th>
                    <th className="text-right py-2 px-2">Entry</th>
                    <th className="text-right py-2 px-2">Price</th>
                    <th className="text-right py-2 px-2">Daily</th>
                    <th className="text-right py-2 px-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_POSITIONS.map((pos) => (
                    <tr
                      key={pos.symbol}
                      onClick={() => navigate(`/activo/${pos.symbol}`)}
                      className="border-b border-aura-border/30 hover:bg-aura-card-hover cursor-pointer transition-colors"
                    >
                      <td className="py-1.5 px-2">
                        <div className="font-semibold text-aura-text leading-tight">{pos.symbol}</div>
                        <div className="text-[9px] text-aura-text-muted leading-tight truncate max-w-[70px]">
                          {pos.name}
                        </div>
                      </td>
                      <td className="text-right py-1.5 px-2 font-mono text-aura-text-secondary">
                        {pos.quantity}
                      </td>
                      <td className="text-right py-1.5 px-2 font-mono text-aura-text-muted">
                        ${formatNumber(pos.avgEntry)}
                      </td>
                      <td className="text-right py-1.5 px-2 font-mono text-aura-text">
                        ${formatNumber(pos.currentPrice)}
                      </td>
                      <td className="text-right py-1.5 px-2">
                        <PriceChange value={pos.dailyPnl} size="sm" showIcon={false} />
                      </td>
                      <td className="text-right py-1.5 px-2">
                        <PriceChange
                          value={pos.totalPnl}
                          percent={pos.totalPnlPercent}
                          size="sm"
                          showIcon={false}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  )
}

/* Risk Metric sub-component */

interface RiskMetricProps {
  label: string
  value: string
  detail: string
  severity: 'normal' | 'warning' | 'high'
}

function RiskMetric({ label, value, detail, severity }: RiskMetricProps) {
  const severityColor = {
    normal: 'text-aura-bullish',
    warning: 'text-aura-warning',
    high: 'text-aura-bearish',
  }

  const severityDot = {
    normal: 'bg-aura-bullish',
    warning: 'bg-aura-warning',
    high: 'bg-aura-bearish',
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${severityDot[severity]}`} />
        <div>
          <p className="text-[11px] text-aura-text">{label}</p>
          <p className="text-[9px] text-aura-text-muted">{detail}</p>
        </div>
      </div>
      <span className={`text-xs font-mono font-semibold ${severityColor[severity]}`}>
        {value}
      </span>
    </div>
  )
}
