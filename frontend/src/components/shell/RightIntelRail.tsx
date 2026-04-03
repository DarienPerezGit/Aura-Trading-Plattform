import { useState } from 'react'
import {
  Brain,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Zap,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useAlertsStore } from '@/stores/alerts-store'
import { cn } from '@/lib/utils'
import { MOCK_AI_MARKET_SUMMARY } from '@/data/mock-signals'
import { MOCK_NEWS } from '@/data/mock-news'

type Tab = 'ai' | 'alertas' | 'noticias'

export function RightIntelRail() {
  const { rightRailOpen, toggleRightRail } = useUIStore()
  const alerts = useAlertsStore((s) => s.alerts)
  const [activeTab, setActiveTab] = useState<Tab>('ai')

  if (!rightRailOpen) {
    return (
      <button
        onClick={toggleRightRail}
        className="w-8 bg-aura-panel border-l border-aura-border flex items-center justify-center hover:bg-aura-card transition-colors cursor-pointer shrink-0"
        title="Abrir panel de inteligencia"
      >
        <ChevronLeft className="w-4 h-4 text-aura-text-muted" />
      </button>
    )
  }

  return (
    <aside className="w-72 bg-aura-panel border-l border-aura-border flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-aura-border">
        <div className="flex items-center gap-1">
          {(['ai', 'alertas', 'noticias'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer capitalize',
                activeTab === tab
                  ? tab === 'ai'
                    ? 'bg-aura-ai-bg text-aura-ai'
                    : 'bg-aura-accent-bg text-aura-accent'
                  : 'text-aura-text-muted hover:text-aura-text-secondary',
              )}
            >
              {tab === 'ai' ? 'AI' : tab}
            </button>
          ))}
        </div>
        <button
          onClick={toggleRightRail}
          className="p-1 rounded hover:bg-aura-card text-aura-text-muted cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'ai' && <AITab />}
        {activeTab === 'alertas' && <AlertsTab alerts={alerts} />}
        {activeTab === 'noticias' && <NewsTab />}
      </div>
    </aside>
  )
}

function AITab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-aura-ai text-xs font-medium">
        <Brain className="w-3.5 h-3.5" />
        Resumen del Mercado
      </div>
      <div className="panel-card p-3">
        <div className="text-xs text-aura-text leading-relaxed whitespace-pre-line">
          {MOCK_AI_MARKET_SUMMARY.split('**').map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="text-aura-text font-semibold">
                {part}
              </strong>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </div>
      </div>
    </div>
  )
}

function AlertsTab({ alerts }: { alerts: ReturnType<typeof useAlertsStore.getState>['alerts'] }) {
  const displayAlerts = alerts.length > 0 ? alerts.slice(0, 10) : PLACEHOLDER_ALERTS

  return (
    <div className="space-y-2">
      {displayAlerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            'panel-card p-2.5 flex items-start gap-2',
            !alert.read && 'border-l-2 border-l-aura-accent',
          )}
        >
          <div className="shrink-0 mt-0.5">
            {alert.severity === 'critical' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-aura-bearish" />
            ) : alert.severity === 'warning' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-aura-warning" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-aura-accent" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-aura-text leading-tight">{alert.title}</p>
            <p className="text-[10px] text-aura-text-muted mt-0.5">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function NewsTab() {
  const news = MOCK_NEWS.slice(0, 6)

  return (
    <div className="space-y-2">
      {news.map((item) => (
        <div key={item.id} className="panel-card p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={cn(
                'text-[9px] font-semibold px-1.5 py-0.5 rounded',
                item.sentiment === 'positivo' && 'bg-aura-bullish-bg text-aura-bullish',
                item.sentiment === 'negativo' && 'bg-aura-bearish-bg text-aura-bearish',
                item.sentiment === 'neutral' && 'bg-aura-card text-aura-text-muted',
              )}
            >
              {item.sentiment}
            </span>
            <span className="text-[9px] text-aura-text-muted">{item.source}</span>
          </div>
          <p className="text-[11px] text-aura-text leading-tight">{item.headline}</p>
          <div className="flex items-center gap-1 mt-1.5">
            {item.symbols.map((s) => (
              <span
                key={s}
                className="text-[9px] bg-aura-accent-bg text-aura-accent px-1.5 py-0.5 rounded"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const PLACEHOLDER_ALERTS = [
  {
    id: '1', type: 'precio' as const, severity: 'warning' as const,
    title: 'BTC supero $95,000', message: 'Resistencia clave alcanzada',
    symbol: 'BTC', timestamp: new Date(), read: false,
  },
  {
    id: '2', type: 'senal' as const, severity: 'info' as const,
    title: 'Senal de compra: NVDA', message: 'Confidence: 87%',
    symbol: 'NVDA', timestamp: new Date(), read: false,
  },
  {
    id: '3', type: 'riesgo' as const, severity: 'critical' as const,
    title: 'VIX sobre 20', message: 'Volatilidad elevada detectada',
    symbol: 'VIX', timestamp: new Date(), read: true,
  },
  {
    id: '4', type: 'volumen' as const, severity: 'warning' as const,
    title: 'Volumen inusual: ETH', message: '+180% vs promedio 20D',
    symbol: 'ETH', timestamp: new Date(), read: true,
  },
]
