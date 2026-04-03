import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Wallet,
  Bot,
  Zap,
  Brain,
  Globe,
  Newspaper,
  Settings,
} from 'lucide-react'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  path: string
}

const CORE_NAV: NavItem[] = [
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard, path: '/' },
  { id: 'markets', label: 'Markets', icon: BarChart3, path: '/mercados' },
  { id: 'assets', label: 'Assets', icon: TrendingUp, path: '/activos' },
  { id: 'portfolio', label: 'Portfolio', icon: Wallet, path: '/portafolio' },
]

const INTEL_NAV: NavItem[] = [
  { id: 'ai-copilot', label: 'AI Copilot', icon: Bot, path: '/ai' },
  { id: 'signals', label: 'Signals', icon: Zap, path: '/senales' },
  { id: 'strategy-lab', label: 'Strategy Lab', icon: Brain, path: '/estrategias' },
  { id: 'geo-intel', label: 'Geo Intel', icon: Globe, path: '/geo' },
  { id: 'news', label: 'News', icon: Newspaper, path: '/noticias' },
]

const UTILITY_NAV: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, path: '/configuracion' },
]

export function LeftNavRail() {
  const { currentView, navigate } = useWorkspaceStore()

  const renderItem = (item: NavItem) => {
    const Icon = item.icon
    const isActive = currentView === item.path

    return (
      <button
        key={item.id}
        onClick={() => navigate(item.path)}
        title={item.label}
        className={cn(
          'relative w-10 h-10 flex items-center justify-center rounded-md transition-colors cursor-pointer group',
          isActive
            ? 'bg-aura-accent-bg text-aura-accent'
            : 'text-aura-text-secondary hover:text-aura-text hover:bg-aura-card',
        )}
      >
        {/* Active left border indicator */}
        {isActive && (
          <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-aura-accent" />
        )}
        <Icon className="w-[18px] h-[18px]" />
        {/* Tooltip */}
        <span className="absolute left-full ml-2 px-2 py-1 rounded bg-aura-card text-aura-text text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-aura-border">
          {item.label}
        </span>
      </button>
    )
  }

  const renderBlock = (items: NavItem[]) => (
    <div className="flex flex-col items-center gap-1 py-2">
      {items.map(renderItem)}
    </div>
  )

  return (
    <nav className="w-14 bg-aura-panel border-r border-aura-border flex flex-col shrink-0">
      {/* Block 1 - Core Navigation */}
      {renderBlock(CORE_NAV)}

      <div className="mx-3 border-t border-aura-border" />

      {/* Block 2 - Intelligence */}
      {renderBlock(INTEL_NAV)}

      <div className="mx-3 border-t border-aura-border" />

      {/* Spacer */}
      <div className="flex-1" />

      <div className="mx-3 border-t border-aura-border" />

      {/* Block 3 - Utility */}
      {renderBlock(UTILITY_NAV)}
    </nav>
  )
}
