import type { ReactNode } from 'react'
import { TopCommandBar } from './TopCommandBar'
import { LeftNavRail } from './LeftNavRail'
import { RightIntelRail } from './RightIntelRail'
import { BottomConsole } from './BottomConsole'
import { CommandPalette } from './CommandPalette'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen w-screen flex flex-col bg-aura-bg overflow-hidden">
      {/* Top Command Bar */}
      <TopCommandBar />

      {/* Main Area: Left Nav + Content + Right Rail */}
      <div className="flex-1 flex min-h-0">
        {/* Left Navigation Rail */}
        <LeftNavRail />

        {/* Main Workspace */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>

        {/* Right Intelligence Rail */}
        <RightIntelRail />
      </div>

      {/* Bottom Activity Console */}
      <BottomConsole />

      {/* Command Palette (overlay) */}
      <CommandPalette />
    </div>
  )
}
