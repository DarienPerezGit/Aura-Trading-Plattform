import { DataPanel } from '@/components/shared/DataPanel'
import { MOCK_NEWS } from '@/data/mock-news'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/format'

export function NewsSentimentPage() {
  const positiveCount = MOCK_NEWS.filter((n) => n.sentiment === 'positivo').length
  const negativeCount = MOCK_NEWS.filter((n) => n.sentiment === 'negativo').length
  const neutralCount = MOCK_NEWS.filter((n) => n.sentiment === 'neutral').length

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      <div className="panel p-3 shrink-0">
        <h1 className="text-lg font-bold text-fenix-text">Noticias y Sentimiento</h1>
        <p className="text-xs text-fenix-text-secondary mt-1">
          Feed de noticias financieras con analisis de sentimiento
        </p>
      </div>

      {/* Sentiment Summary */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        <div className="panel-card p-3 flex items-center justify-between">
          <span className="text-xs text-fenix-text-secondary">Positivo</span>
          <span className="text-sm font-bold text-fenix-bullish">{positiveCount}</span>
        </div>
        <div className="panel-card p-3 flex items-center justify-between">
          <span className="text-xs text-fenix-text-secondary">Neutral</span>
          <span className="text-sm font-bold text-fenix-text-muted">{neutralCount}</span>
        </div>
        <div className="panel-card p-3 flex items-center justify-between">
          <span className="text-xs text-fenix-text-secondary">Negativo</span>
          <span className="text-sm font-bold text-fenix-bearish">{negativeCount}</span>
        </div>
      </div>

      {/* News Feed */}
      <DataPanel title="Feed de Noticias" className="flex-1">
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
              <p className="text-xs text-fenix-text leading-relaxed">{item.headline}</p>
              <div className="flex items-center gap-1 mt-2">
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
    </div>
  )
}
