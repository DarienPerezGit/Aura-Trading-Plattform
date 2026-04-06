export interface TickerConfig {
  symbol: string
  basePrice: number
  volatility: number // 0-1, typical: 0.002 for stocks, 0.005 for crypto
}

export function generatePriceTick(current: number, volatility: number): number {
  const change = (Math.random() - 0.498) * volatility * current
  const meanReversion = (current > 0 ? -0.001 : 0.001) * current
  return Math.max(0.01, current + change + meanReversion)
}

export function generateSparkline(basePrice: number, points: number, volatility: number): number[] {
  const data: number[] = []
  let price = basePrice * (1 + (Math.random() - 0.5) * 0.05)
  for (let i = 0; i < points; i++) {
    price = generatePriceTick(price, volatility)
    data.push(price)
  }
  return data
}

export const INITIAL_ASSETS: TickerConfig[] = [
  // Acciones
  { symbol: 'AAPL', basePrice: 198.50, volatility: 0.002 },
  { symbol: 'MSFT', basePrice: 425.80, volatility: 0.002 },
  { symbol: 'GOOGL', basePrice: 178.30, volatility: 0.0025 },
  { symbol: 'AMZN', basePrice: 192.40, volatility: 0.0025 },
  { symbol: 'NVDA', basePrice: 885.20, volatility: 0.004 },
  { symbol: 'TSLA', basePrice: 172.60, volatility: 0.005 },
  { symbol: 'META', basePrice: 510.90, volatility: 0.003 },
  { symbol: 'JPM', basePrice: 198.70, volatility: 0.0015 },
  // Crypto
  { symbol: 'BTC', basePrice: 95420.00, volatility: 0.004 },
  { symbol: 'ETH', basePrice: 3680.50, volatility: 0.005 },
  { symbol: 'SOL', basePrice: 178.90, volatility: 0.007 },
  { symbol: 'BNB', basePrice: 612.30, volatility: 0.004 },
  // Indices/Macro
  { symbol: 'SPY', basePrice: 525.40, volatility: 0.001 },
  { symbol: 'QQQ', basePrice: 458.20, volatility: 0.0015 },
  { symbol: 'DXY', basePrice: 104.25, volatility: 0.0005 },
  { symbol: 'GLD', basePrice: 218.60, volatility: 0.001 },
  { symbol: 'VIX', basePrice: 14.80, volatility: 0.008 },
  { symbol: 'OIL', basePrice: 78.40, volatility: 0.003 },
]

export const ASSET_NAMES: Record<string, string> = {
  AAPL: 'Apple Inc.',
  MSFT: 'Microsoft Corp.',
  GOOGL: 'Alphabet Inc.',
  AMZN: 'Amazon.com Inc.',
  NVDA: 'NVIDIA Corp.',
  TSLA: 'Tesla Inc.',
  META: 'Meta Platforms',
  JPM: 'JPMorgan Chase',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
  BNB: 'Binance Coin',
  SPY: 'S&P 500 ETF',
  QQQ: 'Nasdaq 100 ETF',
  DXY: 'US Dollar Index',
  GLD: 'Gold ETF',
  VIX: 'Volatility Index',
  OIL: 'Crude Oil WTI',
}

export const ASSET_SECTORS: Record<string, string> = {
  AAPL: 'Tecnologia',
  MSFT: 'Tecnologia',
  GOOGL: 'Tecnologia',
  AMZN: 'Consumo',
  NVDA: 'Semiconductores',
  TSLA: 'Automotriz',
  META: 'Tecnologia',
  JPM: 'Finanzas',
  BTC: 'Crypto',
  ETH: 'Crypto',
  SOL: 'Crypto',
  BNB: 'Crypto',
  SPY: 'Indice',
  QQQ: 'Indice',
  DXY: 'Forex',
  GLD: 'Commodities',
  VIX: 'Volatilidad',
  OIL: 'Commodities',
}

export const ASSET_EXCHANGES: Record<string, string> = {
  AAPL: 'NASDAQ',
  MSFT: 'NASDAQ',
  GOOGL: 'NASDAQ',
  AMZN: 'NASDAQ',
  NVDA: 'NASDAQ',
  TSLA: 'NASDAQ',
  META: 'NASDAQ',
  JPM: 'NYSE',
  BTC: 'Binance',
  ETH: 'Binance',
  SOL: 'Binance',
  BNB: 'Binance',
  SPY: 'NYSE',
  QQQ: 'NASDAQ',
  DXY: 'ICE',
  GLD: 'NYSE',
  VIX: 'CBOE',
  OIL: 'NYMEX',
}
