import { DataPanel } from '@/components/shared/DataPanel'
import { MetricCard } from '@/components/shared/MetricCard'
import { MOCK_NEWS, TOPIC_CLUSTERS } from '@/data/mock-news'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/format'

export function NewsSentimentPage() {
  const positiveCount = MOCK_NEWS.filter((n) => n.sentiment === 'positivo').length
  const negativeCount = MOCK_NEWS.filter((n) => n.sentiment === 'negativo').length
  const neutralCount = MOCK_NEWS.filter((n) => n.sentiment === 'neutral').length
  const total = MOCK_NEWS.length

  const posRatio = (positiveCount / total) * 100
  const neuRatio = (neutralCount / total) * 100
  const negRatio = (negativeCount / total) * 100

  // Asset impact: count how many times each symbol appears and avg sentiment
  const assetImpact = MOCK_NEWS.reduce<Record<string, { count: number; sentiment: number }>>((acc, item) => {
    const sentVal = item.sentiment === 'positivo' ? 1 : item.sentiment === 'negativo' ? -1 : 0
    for (const sym of item.symbols) {
      if (!acc[sym]) acc[sym] = { count: 0, sentiment: 0 }
      acc[sym].count++
      acc[sym].sentiment += sentVal
    }
    return acc
  }, {})

  const assetImpactList = Object.entries(assetImpact)
    .map(([symbol, data]) => ({ symbol, count: data.count, avgSentiment: data.sentiment / data.count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      {/* Top: Sentiment Dashboard */}
      <div className="shrink-0 flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          <MetricCard label="Positivo" value={positiveCount} trend="up" />
          <MetricCard label="Neutral" value={neutralCount} />
          <MetricCard label="Negativo" value={negativeCount} trend="down" />
        </div>
        {/* Sentiment Trend Bar */}
        <div className="panel-card p-2.5">
          <div className="text-[10px] text-fenix-text-muted uppercase mb-1.5 tracking-wider">
            Distribucion de Sentimiento
          </div>
          <div className="h-3 w-full rounded-full overflow-hidden flex">
            <div
              className="bg-fenix-bullish transition-all"
              style={{ width: `${posRatio}%` }}
              title={`Positivo: ${posRatio.toFixed(0)}%`}
            />
            <div
              className="bg-fenix-text-muted/40 transition-all"
              style={{ width: `${neuRatio}%` }}
              title={`Neutral: ${neuRatio.toFixed(0)}%`}
            />
            <div
              className="bg-fenix-bearish transition-all"
              style={{ width: `${negRatio}%` }}
              title={`Negativo: ${negRatio.toFixed(0)}%`}
            />
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-fenix-text-muted">
            <span className="text-fenix-bullish">{posRatio.toFixed(0)}% positivo</span>
            <span>{neuRatio.toFixed(0)}% neutral</span>
            <span className="text-fenix-bearish">{negRatio.toFixed(0)}% negativo</span>
          </div>
        </div>
      </div>

      {/* Main Content: 2 columns */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Left: News Stream */}
        <DataPanel title="Feed de Noticias" subtitle={`${total} noticias`} className="col-span-8">
          <div className="space-y-2">
            {MOCK_NEWS.map((item) => (
              <div key={item.id} className="panel-card p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={cn(
                      'text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase',
                      item.sentiment === 'positivo' && 'bg-fenix-bullish-bg text-fenix-bullish',
                      item.sentiment === 'negativo' && 'bg-fenix-bearish-bg text-fenix-bearish',
                      item.sentiment === 'neutral' && 'bg-fenix-card text-fenix-text-muted',
                    )}
                  >
                    {item.sentiment}
                  </span>
                  <span className="text-[10px] text-fenix-text-muted">{item.source}</span>
                  <span className="text-[10px] text-fenix-text-muted ml-auto">{formatTime(item.timestamp)}</span>
                </div>
                <p className="text-xs font-semibold text-fenix-text leading-relaxed mb-1.5">{item.headline}</p>
                {/* Relevance score bar */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] text-fenix-text-muted">Relevancia</span>
                  <div className="flex-1 h-1.5 rounded-full bg-fenix-card overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        item.relevance >= 80 ? 'bg-fenix-accent' : item.relevance >= 60 ? 'bg-fenix-warning' : 'bg-fenix-text-muted',
                      )}
                      style={{ width: `${item.relevance}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-fenix-text-secondary">{item.relevance}</span>
                </div>
                {/* Impacted symbols */}
                <div className="flex items-center gap-1">
                  {item.symbols.map((s) => (
                    <span key={s} className="text-[9px] bg-fenix-accent-bg text-fenix-accent px-1.5 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DataPanel>

        {/* Right: Topic Intelligence */}
        <div className="col-span-4 flex flex-col gap-3 min-h-0">
          <DataPanel title="Topic Intelligence" subtitle={`${TOPIC_CLUSTERS.length} clusters`} className="flex-1">
            <div className="space-y-2">
              {TOPIC_CLUSTERS.map((cluster) => (
                <div key={cluster.topic} className="panel-card p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-fenix-text">{cluster.topic}</span>
                      {cluster.trending && (
                        <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-fenix-accent-bg text-fenix-accent uppercase">
                          trending
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-fenix-text-muted">{cluster.count} noticias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-fenix-text-muted">Sentimiento</span>
                    <div className="flex-1 h-1.5 rounded-full bg-fenix-card overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          cluster.sentiment >= 0 ? 'bg-fenix-bullish' : 'bg-fenix-bearish',
                        )}
                        style={{ width: `${Math.abs(cluster.sentiment) * 100}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        'text-[9px] font-mono font-semibold',
                        cluster.sentiment >= 0 ? 'text-fenix-bullish' : 'text-fenix-bearish',
                      )}
                    >
                      {cluster.sentiment >= 0 ? '+' : ''}{cluster.sentiment.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DataPanel>

          <DataPanel title="Asset Impact" className="shrink-0">
            <div className="space-y-1.5">
              {assetImpactList.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between px-2 py-1.5 rounded bg-fenix-card/50">
                  <span className="text-[9px] bg-fenix-accent-bg text-fenix-accent px-1.5 py-0.5 rounded font-semibold">
                    {asset.symbol}
                  </span>
                  <span className="text-[10px] text-fenix-text-muted">{asset.count} menciones</span>
                  <span
                    className={cn(
                      'text-[10px] font-mono font-semibold',
                      asset.avgSentiment > 0 ? 'text-fenix-bullish' : asset.avgSentiment < 0 ? 'text-fenix-bearish' : 'text-fenix-text-muted',
                    )}
                  >
                    {asset.avgSentiment >= 0 ? '+' : ''}{asset.avgSentiment.toFixed(2)}
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
