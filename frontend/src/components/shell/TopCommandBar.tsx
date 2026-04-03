import { useState, useEffect } from 'react'
import {
  Search,
  Bell,
  Bot,
  Wifi,
  WifiOff,
  ChevronDown,
  Flame,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useAlertsStore } from '@/stores/alerts-store'
import { MARKET_TABS } from '@/config/constants'
import { cn } from '@/lib/utils'

export function TopCommandBar() {
  const { activeMarketTab, setActiveMarketTab, setCommandPaletteOpen } = useUIStore()
  const unreadCount = useAlertsStore((s) => s.unreadCount)
  const [time, setTime] = useState(new Date())
  const [connected, setConnected] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Simulate connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setConnected(Math.random() > 0.05)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-12 bg-fenix-panel border-b border-fenix-border flex items-center px-4 gap-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <Flame className="w-5 h-5 text-fenix-accent" />
        <span className="font-semibold text-fenix-text tracking-wide text-sm">
          FENIX
        </span>
      </div>

      {/* Search */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 bg-fenix-card border border-fenix-border rounded-md px-3 py-1.5 text-fenix-text-muted hover:border-fenix-border-light transition-colors cursor-pointer min-w-[200px] max-w-[320px] flex-1"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs">Buscar activo, comando...</span>
        <kbd className="ml-auto text-[10px] bg-fenix-bg border border-fenix-border rounded px-1.5 py-0.5 text-fenix-text-muted">
          Ctrl+K
        </kbd>
      </button>

      {/* Market Tabs */}
      <nav className="flex items-center gap-1 ml-2">
        {MARKET_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveMarketTab(tab.id)}
            className={cn(
              'px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer',
              activeMarketTab === tab.id
                ? 'bg-fenix-accent-bg text-fenix-accent'
                : 'text-fenix-text-secondary hover:text-fenix-text hover:bg-fenix-card',
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Connection Status */}
      <div className="flex items-center gap-1.5 text-xs">
        {connected ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-fenix-bullish" />
            <span className="text-fenix-bullish">Conectado</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-fenix-bearish" />
            <span className="text-fenix-bearish">Reconectando...</span>
          </>
        )}
      </div>

      {/* Clock */}
      <div className="flex items-center gap-2 text-xs font-mono text-fenix-text-secondary shrink-0">
        <span>
          {time.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })}
        </span>
        <span className="text-fenix-text-muted">UTC-3</span>
      </div>

      {/* Notifications */}
      <button className="relative p-1.5 rounded hover:bg-fenix-card transition-colors cursor-pointer">
        <Bell className="w-4 h-4 text-fenix-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-fenix-bearish text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* AI Button */}
      <button className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-fenix-ai-bg text-fenix-ai hover:bg-fenix-ai/20 transition-colors cursor-pointer text-xs font-medium">
        <Bot className="w-3.5 h-3.5" />
        AI
      </button>

      {/* Profile */}
      <button className="flex items-center gap-1.5 cursor-pointer hover:bg-fenix-card rounded px-2 py-1 transition-colors">
        <div className="w-6 h-6 rounded-full bg-fenix-accent flex items-center justify-center text-white text-[10px] font-bold">
          FX
        </div>
        <ChevronDown className="w-3 h-3 text-fenix-text-muted" />
      </button>
    </header>
  )
}
