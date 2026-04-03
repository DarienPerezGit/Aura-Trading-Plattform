import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  rightRailOpen: boolean
  bottomConsoleOpen: boolean
  bottomConsoleHeight: number
  commandPaletteOpen: boolean
  activeMarketTab: string
  toggleSidebar: () => void
  toggleRightRail: () => void
  toggleBottomConsole: () => void
  setBottomConsoleHeight: (h: number) => void
  setCommandPaletteOpen: (open: boolean) => void
  setActiveMarketTab: (tab: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  rightRailOpen: true,
  bottomConsoleOpen: true,
  bottomConsoleHeight: 200,
  commandPaletteOpen: false,
  activeMarketTab: 'global',

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleRightRail: () => set((s) => ({ rightRailOpen: !s.rightRailOpen })),
  toggleBottomConsole: () => set((s) => ({ bottomConsoleOpen: !s.bottomConsoleOpen })),
  setBottomConsoleHeight: (h) => set({ bottomConsoleHeight: h }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setActiveMarketTab: (tab) => set({ activeMarketTab: tab }),
}))
