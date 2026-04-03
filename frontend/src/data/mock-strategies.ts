export interface Strategy {
  id: string
  name: string
  type: 'momentum' | 'mean_reversion' | 'breakout' | 'volatility' | 'sentiment' | 'ai_composite'
  description: string
  winRate: number
  sharpe: number
  maxDrawdown: number
  recentReturn: number
  signals: number
  active: boolean
}

export interface Opportunity {
  id: string
  symbol: string
  strategy: string
  direction: 'compra' | 'venta'
  confidence: number
  timestamp: Date
  regime: string
  expectedRisk: number
}

export const MOCK_STRATEGIES: Strategy[] = [
  {
    id: '1', name: 'Momentum Pro', type: 'momentum',
    description: 'Sigue tendencias usando EMA crossovers y RSI con filtro de volumen',
    winRate: 62.4, sharpe: 1.78, maxDrawdown: -8.5, recentReturn: 12.3,
    signals: 8, active: true,
  },
  {
    id: '2', name: 'Mean Reversion Alpha', type: 'mean_reversion',
    description: 'Detecta desviaciones extremas de la media y opera reversiones',
    winRate: 58.1, sharpe: 1.45, maxDrawdown: -6.2, recentReturn: 8.7,
    signals: 5, active: true,
  },
  {
    id: '3', name: 'Breakout Scanner', type: 'breakout',
    description: 'Identifica breakouts de rangos con confirmacion de volumen',
    winRate: 55.8, sharpe: 1.32, maxDrawdown: -11.0, recentReturn: 15.1,
    signals: 3, active: false,
  },
  {
    id: '4', name: 'Vol Crusher', type: 'volatility',
    description: 'Opera expansion/compresion de volatilidad usando Bollinger y ATR',
    winRate: 60.2, sharpe: 1.55, maxDrawdown: -7.8, recentReturn: 9.4,
    signals: 6, active: true,
  },
  {
    id: '5', name: 'Sentiment Edge', type: 'sentiment',
    description: 'Combina analisis de sentimiento de noticias y redes sociales',
    winRate: 57.5, sharpe: 1.28, maxDrawdown: -9.1, recentReturn: 7.2,
    signals: 4, active: false,
  },
  {
    id: '6', name: 'FENIX Composite AI', type: 'ai_composite',
    description: 'Modelo multimodal que combina todas las estrategias con pesos dinamicos',
    winRate: 65.8, sharpe: 2.12, maxDrawdown: -5.4, recentReturn: 18.6,
    signals: 12, active: true,
  },
]

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1', symbol: 'NVDA', strategy: 'Momentum Pro', direction: 'compra',
    confidence: 87, timestamp: new Date(Date.now() - 300000), regime: 'Tendencia alcista', expectedRisk: 3.2,
  },
  {
    id: '2', symbol: 'SOL', strategy: 'Breakout Scanner', direction: 'compra',
    confidence: 74, timestamp: new Date(Date.now() - 900000), regime: 'Breakout', expectedRisk: 5.8,
  },
  {
    id: '3', symbol: 'TSLA', strategy: 'Mean Reversion Alpha', direction: 'venta',
    confidence: 65, timestamp: new Date(Date.now() - 1500000), regime: 'Sobre-extendido', expectedRisk: 4.5,
  },
  {
    id: '4', symbol: 'BTC', strategy: 'FENIX Composite AI', direction: 'compra',
    confidence: 82, timestamp: new Date(Date.now() - 2100000), regime: 'Acumulacion', expectedRisk: 6.1,
  },
  {
    id: '5', symbol: 'AAPL', strategy: 'Sentiment Edge', direction: 'compra',
    confidence: 70, timestamp: new Date(Date.now() - 3600000), regime: 'Catalizador positivo', expectedRisk: 2.8,
  },
]
