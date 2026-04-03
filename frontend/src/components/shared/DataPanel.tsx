import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface DataPanelProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function DataPanel({ title, subtitle, actions, children, className, noPadding }: DataPanelProps) {
  return (
    <div className={cn('panel flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-fenix-border shrink-0">
        <div>
          <h3 className="text-xs font-semibold text-fenix-text">{title}</h3>
          {subtitle && (
            <span className="text-[10px] text-fenix-text-muted">{subtitle}</span>
          )}
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>

      {/* Body */}
      <div className={cn('flex-1 min-h-0 overflow-y-auto', !noPadding && 'p-3')}>
        {children}
      </div>
    </div>
  )
}
