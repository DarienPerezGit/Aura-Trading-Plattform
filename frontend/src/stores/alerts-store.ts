import { create } from 'zustand'

export interface Alert {
  id: string
  type: 'precio' | 'volatilidad' | 'volumen' | 'noticias' | 'senal' | 'riesgo'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  symbol?: string
  timestamp: Date
  read: boolean
}

interface AlertsState {
  alerts: Alert[]
  unreadCount: number
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAlerts: () => void
}

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: [],
  unreadCount: 0,

  addAlert: (alert) =>
    set((s) => {
      const newAlert: Alert = {
        ...alert,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        read: false,
      }
      const alerts = [newAlert, ...s.alerts].slice(0, 100)
      return { alerts, unreadCount: s.unreadCount + 1 }
    }),
  markAsRead: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((s) => ({
      alerts: s.alerts.map((a) => ({ ...a, read: true })),
      unreadCount: 0,
    })),
  clearAlerts: () => set({ alerts: [], unreadCount: 0 }),
}))
