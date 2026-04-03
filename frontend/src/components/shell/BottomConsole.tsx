import { useState, useEffect, useRef } from 'react'
import {
  Activity,
  ShoppingCart,
  Bell,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import { generateInitialEvents, generateRandomEvent, type MarketEvent } from '@/data/generators/event-generator'
import { formatTime } from '@/lib/format'

type ConsoleTab = 'eventos' | 'ordenes' | 'alertas' | 'logs'

const TAB_CONFIG: { id: ConsoleTab; label: string; icon: typeof Activity }[] = [
  { id: 'eventos', label: 'Eventos', icon: Activity },
  { id: 'ordenes', label: 'Ordenes', icon: ShoppingCart },
  { id: 'alertas', label: 'Alertas', icon: Bell },
  { id: 'logs', label: 'Logs', icon: Terminal },
]

export function BottomConsole() {
  const { bottomConsoleOpen, toggleBottomConsole } = useUIStore()
  const [activeTab, setActiveTab] = useState<ConsoleTab>('eventos')
  const [events, setEvents] = useState<MarketEvent[]>(() => generateInitialEvents(15))
  const scrollRef = useRef<HTMLDivElement>(null)

  // Generate new events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = generateRandomEvent()
      setEvents((prev) => [...prev, newEvent].slice(-50))
    }, 8000 + Math.random() * 7000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  return (
    <div
      className={cn(
        'bg-fenix-panel border-t border-fenix-border flex flex-col shrink-0 transition-all duration-200',
        bottomConsoleOpen ? 'h-48' : 'h-8',
      )}
    >
      {/* Tab Bar */}
      <div className="h-8 flex items-center px-2 gap-1 shrink-0 border-b border-fenix-border">
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                if (!bottomConsoleOpen) toggleBottomConsole()
              }}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer',
                activeTab === tab.id && bottomConsoleOpen
                  ? 'bg-fenix-accent-bg text-fenix-accent'
                  : 'text-fenix-text-muted hover:text-fenix-text-secondary',
              )}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          )
        })}

        <div className="flex-1" />

        <button
          onClick={toggleBottomConsole}
          className="p-1 rounded hover:bg-fenix-card text-fenix-text-muted cursor-pointer"
        >
          {bottomConsoleOpen ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Content */}
      {bottomConsoleOpen && (
        <div ref={scrollRef} className="flex-1 overflow-y-auto font-mono text-[11px] p-1">
          {activeTab === 'eventos' &&
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 px-2 py-0.5 hover:bg-fenix-card/50 rounded"
              >
                <span className="text-fenix-text-muted w-16 shrink-0">
                  {formatTime(event.timestamp)}
                </span>
                <span
                  className={cn(
                    'w-14 shrink-0 text-[10px] font-medium uppercase',
                    event.type === 'alerta' && 'text-fenix-warning',
                    event.type === 'senal' && 'text-fenix-ai',
                    event.type === 'orden' && 'text-fenix-accent',
                    event.type === 'mercado' && 'text-fenix-bullish',
                    event.type === 'sistema' && 'text-fenix-text-muted',
                  )}
                >
                  {event.type}
                </span>
                {event.symbol && (
                  <span className="text-fenix-accent w-10 shrink-0">{event.symbol}</span>
                )}
                <span
                  className={cn(
                    'text-fenix-text-secondary',
                    event.severity === 'critical' && 'text-fenix-bearish',
                    event.severity === 'warning' && 'text-fenix-warning',
                  )}
                >
                  {event.message}
                </span>
              </div>
            ))}

          {activeTab === 'ordenes' && (
            <div className="flex items-center justify-center h-full text-fenix-text-muted text-xs">
              No hay ordenes recientes
            </div>
          )}

          {activeTab === 'alertas' && (
            <div className="flex items-center justify-center h-full text-fenix-text-muted text-xs">
              Las alertas apareceran aqui
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-0.5 p-1">
              <LogLine level="INFO" msg="Sistema FENIX inicializado correctamente" />
              <LogLine level="INFO" msg="Conexion WebSocket establecida" />
              <LogLine level="INFO" msg="Feed de precios activo — 18 activos monitoreados" />
              <LogLine level="WARN" msg="Latencia elevada en feed de Binance (245ms)" />
              <LogLine level="INFO" msg="Motor de estrategias cargado — 6 estrategias activas" />
              <LogLine level="INFO" msg="AI Agent: Resumen de mercado generado" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LogLine({ level, msg }: { level: string; msg: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-0.5">
      <span className="text-fenix-text-muted w-16 shrink-0">
        {formatTime(new Date())}
      </span>
      <span
        className={cn(
          'w-10 shrink-0 text-[10px] font-bold',
          level === 'INFO' && 'text-fenix-bullish',
          level === 'WARN' && 'text-fenix-warning',
          level === 'ERROR' && 'text-fenix-bearish',
        )}
      >
        {level}
      </span>
      <span className="text-fenix-text-secondary">{msg}</span>
    </div>
  )
}
