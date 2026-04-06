import { create } from 'zustand'

export interface Position {
  symbol: string
  name: string
  quantity: number
  avgEntry: number
  currentPrice: number
  dailyPnl: number
  totalPnl: number
  totalPnlPercent: number
  riskContribution: number
  sector: string
  assetClass: string
}

export interface PortfolioStats {
  totalEquity: number
  dailyPnl: number
  dailyPnlPercent: number
  totalReturn: number
  totalReturnPercent: number
  drawdown: number
  riskScore: number
  sharpe: number
}

interface PortfolioState {
  positions: Position[]
  stats: PortfolioStats
  equityCurve: { date: string; value: number }[]
  setPositions: (positions: Position[]) => void
  setStats: (stats: PortfolioStats) => void
  setEquityCurve: (curve: { date: string; value: number }[]) => void
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  positions: [],
  stats: {
    totalEquity: 0,
    dailyPnl: 0,
    dailyPnlPercent: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
    drawdown: 0,
    riskScore: 0,
    sharpe: 0,
  },
  equityCurve: [],
  setPositions: (positions) => set({ positions }),
  setStats: (stats) => set({ stats }),
  setEquityCurve: (equityCurve) => set({ equityCurve }),
}))
