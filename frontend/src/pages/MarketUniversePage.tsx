import { useMemo, useState } from 'react'
import { useMarketStore } from '@/stores/market-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { SparklineChart } from '@/components/charts/SparklineChart'
import { formatNumber, formatPercent, formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils'

export function MarketUniversePage() {
  const assets = useMarketStore((s) => s.assets)
  const { navigate } = useWorkspaceStore()
  const [activeSector, setActiveSector] = useState<string | null>(null)

  const assetList = useMemo(() => Object.values(assets), [assets])

  const sectors = useMemo(() => {
    const set = new Set<string>()
    for (const asset of assetList) {
      set.add(asset.sector ?? 'Otro')
    }
    return Array.from(set).sort()
  }, [assetList])

  const filtered = useMemo(() => {
    const list = activeSector
      ? assetList.filter((a) => (a.sector ?? 'Otro') === activeSector)
      : assetList
    return list.sort((a, b) => a.symbol.localeCompare(b.symbol))
  }, [assetList, activeSector])

  const formatMktCap = (v: number): string => {
    if (v >= 1e12) return `${(v / 1e12).toFixed(2)}T`
    if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
    return formatNumber(v, 0)
  }

  return (
    <div className="h-full flex flex-col gap-2 p-3">
      {/* Top: Filter bar */}
      <div className="shrink-0 flex items-center gap-1.5 flex-wrap panel p-2">
        <button
          onClick={() => setActiveSector(null)}
          className={cn(
            'text-[10px] font-semibold px-2.5 py-1 rounded transition-colors',
            activeSector === null
              ? 'bg-fenix-accent text-white'
              : 'bg-fenix-card text-fenix-text-muted hover:text-fenix-text',
          )}
        >
          Todos ({assetList.length})
        </button>
        {sectors.map((sector) => (
          <button
            key={sector}
            onClick={() => setActiveSector(sector === activeSector ? null : sector)}
            className={cn(
              'text-[10px] font-semibold px-2.5 py-1 rounded transition-colors',
              activeSector === sector
                ? 'bg-fenix-accent text-white'
                : 'bg-fenix-card text-fenix-text-muted hover:text-fenix-text',
            )}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* Main: Dense table */}
      <div className="flex-1 min-h-0 panel overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10 bg-fenix-bg border-b border-fenix-border">
            <tr className="text-[10px] uppercase text-fenix-text-muted tracking-wider">
              <th className="text-left py-2 px-3 font-medium">Symbol</th>
              <th className="text-left py-2 px-2 font-medium">Nombre</th>
              <th className="text-right py-2 px-2 font-medium">Precio</th>
              <th className="text-right py-2 px-2 font-medium">% Cambio</th>
              <th className="text-right py-2 px-2 font-medium">Volumen</th>
              <th className="text-right py-2 px-2 font-medium">Market Cap</th>
              <th className="text-left py-2 px-2 font-medium">Sector</th>
              <th className="text-right py-2 px-3 font-medium">Sparkline</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset) => (
              <tr
                key={asset.symbol}
                onClick={() => navigate(`/activo/${asset.symbol}`)}
                className="border-b border-fenix-border/50 hover:bg-fenix-card-hover cursor-pointer transition-colors"
              >
                <td className="py-1.5 px-3 font-mono font-bold text-fenix-accent">{asset.symbol}</td>
                <td className="py-1.5 px-2 text-fenix-text-secondary truncate max-w-[160px]">{asset.name}</td>
                <td className="py-1.5 px-2 text-right font-mono font-semibold text-fenix-text">
                  ${formatNumber(asset.price)}
                </td>
                <td
                  className={cn(
                    'py-1.5 px-2 text-right font-mono font-semibold',
                    asset.changePercent >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish',
                  )}
                >
                  {formatPercent(asset.changePercent)}
                </td>
                <td className="py-1.5 px-2 text-right font-mono text-fenix-text-secondary">
                  {formatVolume(asset.volume)}
                </td>
                <td className="py-1.5 px-2 text-right font-mono text-fenix-text-secondary">
                  {formatMktCap(asset.marketCap)}
                </td>
                <td className="py-1.5 px-2">
                  <span className="text-[9px] bg-fenix-card px-1.5 py-0.5 rounded text-fenix-text-muted">
                    {asset.sector ?? 'Otro'}
                  </span>
                </td>
                <td className="py-1.5 px-3 text-right">
                  <SparklineChart
                    data={asset.sparkline}
                    width={48}
                    height={16}
                    positive={asset.changePercent >= 0}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-fenix-text-muted text-xs">
                  No hay activos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
