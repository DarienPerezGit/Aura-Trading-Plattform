import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Wallet,
  Brain,
  Zap,
  Globe,
  Newspaper,
  Bot,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { cn } from '@/lib/utils'

const ICON_MAP = {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Wallet,
  Brain,
  Zap,
  Globe,
  Newspaper,
  Bot,
  Settings,
} as const

const NAV_ITEMS = [
  { id: 'command-center', label: 'Centro de Comando', icon: 'LayoutDashboard', path: '/' },
  { id: 'markets', label: 'Mercados', icon: 'BarChart3', path: '/mercados' },
  { id: 'assets', label: 'Activos', icon: 'TrendingUp', path: '/activo/AAPL' },
  { id: 'portfolio', label: 'Portafolio', icon: 'Wallet', path: '/portafolio' },
  { id: 'strategies', label: 'Estrategias', icon: 'Brain', path: '/estrategias' },
  { id: 'signals', label: 'Senales', icon: 'Zap', path: '/senales' },
  { id: 'geo', label: 'Geo Inteligencia', icon: 'Globe', path: '/geo' },
  { id: 'news', label: 'Noticias', icon: 'Newspaper', path: '/noticias' },
  { id: 'ai-copilot', label: 'AI Copilot', icon: 'Bot', path: '/ai' },
] as const

const BOTTOM_ITEMS = [
  { id: 'settings', label: 'Configuracion', icon: 'Settings', path: '/configuracion' },
] as const

export function LeftNavRail() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { currentView, navigate } = useWorkspaceStore()

  const renderItem = (item: (typeof NAV_ITEMS)[number] | (typeof BOTTOM_ITEMS)[number]) => {
    const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP]
    const isActive = currentView === item.path
    const isAI = item.id === 'ai-copilot'

    return (
      <button
        key={item.id}
        onClick={() => navigate(item.path)}
        title={item.label}
        className={cn(
          'flex items-center gap-3 rounded-lg transition-all cursor-pointer group',
          sidebarCollapsed ? 'w-10 h-10 justify-center' : 'w-full px-3 py-2',
          isActive
            ? isAI
              ? 'bg-fenix-ai-bg text-fenix-ai'
              : 'bg-fenix-accent-bg text-fenix-accent'
            : 'text-fenix-text-secondary hover:text-fenix-text hover:bg-fenix-card',
        )}
      >
        <IconComponent
          className={cn(
            'w-4.5 h-4.5 shrink-0',
            isActive && isAI && 'text-fenix-ai',
          )}
        />
        {!sidebarCollapsed && (
          <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
        )}
        {isActive && (
          <div
            className={cn(
              'absolute left-0 w-0.5 h-6 rounded-r',
              isAI ? 'bg-fenix-ai' : 'bg-fenix-accent',
            )}
          />
        )}
      </button>
    )
  }

  return (
    <nav
      className={cn(
        'bg-fenix-panel border-r border-fenix-border flex flex-col shrink-0 transition-all duration-200',
        sidebarCollapsed ? 'w-14' : 'w-48',
      )}
    >
      {/* Toggle */}
      <div className={cn('flex items-center p-2', sidebarCollapsed ? 'justify-center' : 'justify-end')}>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded hover:bg-fenix-card text-fenix-text-muted hover:text-fenix-text transition-colors cursor-pointer"
          title={sidebarCollapsed ? 'Expandir' : 'Colapsar'}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main nav */}
      <div className="flex-1 flex flex-col gap-1 px-2 relative">
        {NAV_ITEMS.map(renderItem)}
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-1 px-2 pb-3 border-t border-fenix-border pt-2 mt-2">
        {BOTTOM_ITEMS.map(renderItem)}
      </div>
    </nav>
  )
}
