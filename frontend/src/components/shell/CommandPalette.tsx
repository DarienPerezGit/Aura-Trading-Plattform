import { useEffect, useState, useRef } from 'react'
import {
  Search,
  TrendingUp,
  BarChart3,
  Bot,
  LayoutDashboard,
  Globe,
  Newspaper,
  Brain,
  Wallet,
  Settings,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { ASSET_NAMES } from '@/data/generators/price-ticker'

interface CommandItem {
  id: string
  label: string
  category: string
  icon: typeof Search
  action: () => void
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const { navigate } = useWorkspaceStore()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: CommandItem[] = [
    // Navigation
    { id: 'nav-cc', label: 'Centro de Comando', category: 'Navegacion', icon: LayoutDashboard, action: () => navigate('/') },
    { id: 'nav-markets', label: 'Mercados', category: 'Navegacion', icon: BarChart3, action: () => navigate('/mercados') },
    { id: 'nav-portfolio', label: 'Portafolio', category: 'Navegacion', icon: Wallet, action: () => navigate('/portafolio') },
    { id: 'nav-ai', label: 'AI Copilot', category: 'Navegacion', icon: Bot, action: () => navigate('/ai') },
    { id: 'nav-geo', label: 'Geo Inteligencia', category: 'Navegacion', icon: Globe, action: () => navigate('/geo') },
    { id: 'nav-news', label: 'Noticias y Sentimiento', category: 'Navegacion', icon: Newspaper, action: () => navigate('/noticias') },
    { id: 'nav-strat', label: 'Laboratorio de Estrategias', category: 'Navegacion', icon: Brain, action: () => navigate('/estrategias') },
    { id: 'nav-settings', label: 'Configuracion', category: 'Navegacion', icon: Settings, action: () => navigate('/configuracion') },
    // Assets
    ...Object.entries(ASSET_NAMES).map(([symbol, name]) => ({
      id: `asset-${symbol}`,
      label: `${symbol} — ${name}`,
      category: 'Activos',
      icon: TrendingUp,
      action: () => navigate(`/activo/${symbol}`),
    })),
  ]

  const filtered = query
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.category.toLowerCase().includes(query.toLowerCase()),
      )
    : commands

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    ;(acc[cmd.category] ??= []).push(cmd)
    return acc
  }, {})

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  if (!commandPaletteOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setCommandPaletteOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-lg bg-aura-panel border border-aura-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-aura-border">
          <Search className="w-4 h-4 text-aura-text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar activo, comando, pagina..."
            className="flex-1 bg-transparent text-sm text-aura-text placeholder:text-aura-text-muted outline-none"
          />
          <kbd className="text-[10px] bg-aura-card border border-aura-border rounded px-1.5 py-0.5 text-aura-text-muted">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto p-2">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-2">
              <div className="text-[10px] font-semibold uppercase text-aura-text-muted px-2 py-1">
                {category}
              </div>
              {items.slice(0, 8).map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action()
                      setCommandPaletteOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-aura-text-secondary hover:text-aura-text hover:bg-aura-card transition-colors cursor-pointer"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-aura-text-muted text-xs">
              Sin resultados para "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
