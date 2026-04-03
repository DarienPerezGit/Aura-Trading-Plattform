export const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'] as const
export type Timeframe = (typeof TIMEFRAMES)[number]

export const MARKET_TABS = [
  { id: 'equities', label: 'Acciones' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'forex', label: 'Forex' },
  { id: 'macro', label: 'Macro' },
] as const

export const NAV_ITEMS = [
  { id: 'command-center', label: 'Centro de Comando', icon: 'LayoutDashboard', path: '/' },
  { id: 'markets', label: 'Mercados', icon: 'BarChart3', path: '/mercados' },
  { id: 'assets', label: 'Activos', icon: 'TrendingUp', path: '/activo' },
  { id: 'portfolio', label: 'Portafolio', icon: 'Wallet', path: '/portafolio' },
  { id: 'strategies', label: 'Estrategias', icon: 'Brain', path: '/estrategias' },
  { id: 'signals', label: 'Senales', icon: 'Zap', path: '/senales' },
  { id: 'geo', label: 'Geo Inteligencia', icon: 'Globe', path: '/geo' },
  { id: 'news', label: 'Noticias', icon: 'Newspaper', path: '/noticias' },
  { id: 'ai-copilot', label: 'AI Copilot', icon: 'Bot', path: '/ai' },
  { id: 'settings', label: 'Configuracion', icon: 'Settings', path: '/configuracion' },
] as const

export const SIGNAL_TYPES = ['compra', 'venta', 'mantener'] as const
export type SignalType = (typeof SIGNAL_TYPES)[number]

export const RISK_LEVELS = ['bajo', 'medio', 'alto', 'critico'] as const
export type RiskLevel = (typeof RISK_LEVELS)[number]

export const SENTIMENT_TYPES = ['positivo', 'neutral', 'negativo'] as const
export type SentimentType = (typeof SENTIMENT_TYPES)[number]

export const ORDER_TYPES = ['mercado', 'limite', 'stop'] as const
export type OrderType = (typeof ORDER_TYPES)[number]

export const ENVIRONMENTS = ['demo', 'live', 'paper'] as const
export type Environment = (typeof ENVIRONMENTS)[number]
