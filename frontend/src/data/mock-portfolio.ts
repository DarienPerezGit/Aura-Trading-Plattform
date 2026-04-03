import type { Position, PortfolioStats } from '@/stores/portfolio-store'

export const MOCK_POSITIONS: Position[] = [
  {
    symbol: 'AAPL', name: 'Apple Inc.', quantity: 150, avgEntry: 185.20,
    currentPrice: 198.50, dailyPnl: 245.00, totalPnl: 1995.00,
    totalPnlPercent: 7.18, riskContribution: 12.5, sector: 'Tecnologia', assetClass: 'Acciones',
  },
  {
    symbol: 'NVDA', name: 'NVIDIA Corp.', quantity: 50, avgEntry: 780.00,
    currentPrice: 885.20, dailyPnl: -180.00, totalPnl: 5260.00,
    totalPnlPercent: 13.49, riskContribution: 18.2, sector: 'Semiconductores', assetClass: 'Acciones',
  },
  {
    symbol: 'BTC', name: 'Bitcoin', quantity: 0.85, avgEntry: 88500.00,
    currentPrice: 95420.00, dailyPnl: 1250.00, totalPnl: 5882.00,
    totalPnlPercent: 7.82, riskContribution: 25.0, sector: 'Crypto', assetClass: 'Crypto',
  },
  {
    symbol: 'ETH', name: 'Ethereum', quantity: 12.5, avgEntry: 3200.00,
    currentPrice: 3680.50, dailyPnl: 425.00, totalPnl: 6006.25,
    totalPnlPercent: 15.02, riskContribution: 15.8, sector: 'Crypto', assetClass: 'Crypto',
  },
  {
    symbol: 'MSFT', name: 'Microsoft', quantity: 80, avgEntry: 398.50,
    currentPrice: 425.80, dailyPnl: 320.00, totalPnl: 2184.00,
    totalPnlPercent: 6.85, riskContribution: 14.0, sector: 'Tecnologia', assetClass: 'Acciones',
  },
  {
    symbol: 'GLD', name: 'Gold ETF', quantity: 200, avgEntry: 205.30,
    currentPrice: 218.60, dailyPnl: -50.00, totalPnl: 2660.00,
    totalPnlPercent: 6.48, riskContribution: 8.5, sector: 'Commodities', assetClass: 'Commodities',
  },
  {
    symbol: 'JPM', name: 'JPMorgan Chase', quantity: 100, avgEntry: 188.40,
    currentPrice: 198.70, dailyPnl: 150.00, totalPnl: 1030.00,
    totalPnlPercent: 5.47, riskContribution: 6.0, sector: 'Finanzas', assetClass: 'Acciones',
  },
]

export const MOCK_STATS: PortfolioStats = {
  totalEquity: 285400.00,
  dailyPnl: 2160.00,
  dailyPnlPercent: 0.76,
  totalReturn: 25017.25,
  totalReturnPercent: 9.61,
  drawdown: -3.2,
  riskScore: 62,
  sharpe: 1.85,
}

export const MOCK_EQUITY_CURVE = Array.from({ length: 90 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (90 - i))
  const base = 250000
  const growth = base * (1 + i * 0.0012)
  const noise = growth * (Math.random() - 0.48) * 0.015
  return {
    date: date.toISOString().split('T')[0],
    value: +(growth + noise).toFixed(2),
  }
})
