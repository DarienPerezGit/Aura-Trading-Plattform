import { useState, useEffect } from 'react'
import {
  Search,
  Bell,
  Brain,
  CircleDot,
  AlertCircle,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useAlertsStore } from '@/stores/alerts-store'
import { MARKET_TABS } from '@/config/constants'
import { cn } from '@/lib/utils'

export function TopCommandBar() {
  const { activeMarketTab, setActiveMarketTab, setCommandPaletteOpen } = useUIStore()
  const { navigate } = useWorkspaceStore()
  const unreadCount = useAlertsStore((s) => s.unreadCount)
  const [time, setTime] = useState(new Date())
  const [feedsOk] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const localTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  // Simple NYSE open check (Mon-Fri 9:30-16:00 ET)
  const nyseOpen = (() => {
    const et = new Date(time.toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const day = et.getDay()
    const h = et.getHours()
    const m = et.getMinutes()
    const mins = h * 60 + m
    return day >= 1 && day <= 5 && mins >= 570 && mins < 960
  })()

  return (
    <header className="h-11 glass-strong border-b border-aura-border flex items-center px-3 shrink-0">
      {/* Zone A - Brand Block (12%) */}
      <div className="flex items-center gap-1.5 shrink-0" style={{ width: '12%' }}>
        <span className="font-bold text-aura-text tracking-widest text-sm">ATLAS</span>
        <span className="font-light text-aura-text-secondary tracking-wide text-xs">TERMINAL</span>
        <span className="ml-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-aura-warning-bg text-aura-warning leading-none">
          DEMO
        </span>
      </div>

      {/* Zone B - Global Search (28%) */}
      <div className="px-2" style={{ width: '28%' }}>
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 w-full bg-aura-card/60 rounded-md px-3 py-1.5 text-aura-text-muted hover:bg-aura-card hover:border-aura-border-light transition-colors cursor-pointer border border-aura-border"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs truncate">Search assets, commands...</span>
          <kbd className="ml-auto text-[10px] bg-aura-bg border border-aura-border rounded px-1.5 py-0.5 text-aura-text-muted font-mono shrink-0">
            &#8984;K
          </kbd>
        </button>
      </div>

      {/* Zone C - Context Tabs (20%) */}
      <nav className="flex items-center gap-0.5 px-2" style={{ width: '20%' }}>
        {MARKET_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveMarketTab(tab.id)}
            className={cn(
              'px-2 py-1.5 text-[11px] font-medium transition-colors cursor-pointer relative whitespace-nowrap',
              activeMarketTab === tab.id
                ? 'text-aura-accent'
                : 'text-aura-text-secondary hover:text-aura-text',
            )}
          >
            {tab.label}
            {activeMarketTab === tab.id && (
              <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-aura-accent rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Zone D - System Status (22%) */}
      <div className="flex items-center gap-3 px-2 justify-center" style={{ width: '22%' }}>
        {/* NYSE status */}
        <div className="flex items-center gap-1.5">
          <CircleDot className={cn('w-3 h-3', nyseOpen ? 'text-aura-bullish' : 'text-aura-neutral')} />
          <span className={cn('text-[11px] font-medium', nyseOpen ? 'text-aura-bullish' : 'text-aura-text-muted')}>
            {nyseOpen ? 'NYSE OPEN' : 'NYSE CLOSED'}
          </span>
        </div>

        {/* Local time */}
        <span className="text-[11px] font-mono text-aura-text-secondary">
          LOCAL {localTime}
        </span>

        {/* Feed health */}
        <div className="flex items-center gap-1">
          <span className={cn('w-1.5 h-1.5 rounded-full', feedsOk ? 'bg-aura-bullish' : 'bg-aura-bearish')} />
          <span className="text-[11px] text-aura-text-secondary">FEEDS OK</span>
        </div>

        {/* Alert count */}
        {unreadCount > 0 && (
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-aura-warning" />
            <span className="text-[11px] font-semibold text-aura-warning">{unreadCount}</span>
          </div>
        )}
      </div>

      {/* Zone E - Global Actions (18%) */}
      <div className="flex items-center gap-2 justify-end" style={{ width: '18%' }}>
        {/* AI Copilot */}
        <button
          onClick={() => navigate('/ai')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-aura-ai-bg text-aura-ai hover:bg-aura-ai/20 transition-colors cursor-pointer text-xs font-medium"
        >
          <Brain className="w-3.5 h-3.5" />
          AI Copilot
        </button>

        {/* Notifications */}
        <button className="relative p-1.5 rounded-md hover:bg-aura-card transition-colors cursor-pointer">
          <Bell className="w-4 h-4 text-aura-text-secondary" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-aura-bearish text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile avatar */}
        <button className="w-7 h-7 rounded-full bg-aura-accent flex items-center justify-center text-white text-[10px] font-bold cursor-pointer hover:ring-2 hover:ring-aura-accent/30 transition-shadow">
          JC
        </button>
      </div>
    </header>
  )
}
