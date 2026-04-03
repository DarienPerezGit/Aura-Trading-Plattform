import { useMemo } from 'react'
import { useMarketStore } from '@/stores/market-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { DataPanel } from '@/components/shared/DataPanel'
import { SparklineChart } from '@/components/charts/SparklineChart'
import { formatNumber, formatPercent, formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils'

export function MarketUniversePage() {
  const assets = useMarketStore((s) => s.assets)
  const { navigate } = useWorkspaceStore()

  const sectors = useMemo(() => {
    const map: Record<string, (typeof assetList)[number][]> = {}
    const assetList = Object.values(assets)
    for (const asset of assetList) {
      const sector = asset.sector ?? 'Otro'
      ;(map[sector] ??= []).push(asset)
    }
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [assets])

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      <div className="panel p-3 shrink-0">
        <h1 className="text-lg font-bold text-fenix-text">Universo de Mercados</h1>
        <p className="text-xs text-fenix-text-secondary mt-1">
          Todos los activos monitoreados organizados por sector
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {sectors.map(([sector, sectorAssets]) => (
          <DataPanel key={sector} title={sector} subtitle={`${sectorAssets.length} activos`}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {sectorAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => navigate(`/activo/${asset.symbol}`)}
                  className="panel-card p-2.5 text-left hover:bg-fenix-card-hover transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-fenix-text">{asset.symbol}</span>
                    <SparklineChart data={asset.sparkline} width={40} height={14} positive={asset.changePercent >= 0} />
                  </div>
                  <div className="text-sm font-mono font-semibold text-fenix-text">
                    ${formatNumber(asset.price)}
                  </div>
                  <div className={cn(
                    'text-[10px] font-mono',
                    asset.changePercent >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish',
                  )}>
                    {formatPercent(asset.changePercent)}
                  </div>
                  <div className="text-[9px] text-fenix-text-muted mt-0.5">
                    Vol: {formatVolume(asset.volume)}
                  </div>
                </button>
              ))}
            </div>
          </DataPanel>
        ))}
      </div>
    </div>
  )
}
