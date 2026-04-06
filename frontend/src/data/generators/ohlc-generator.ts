export interface OHLCBar {
  time: number // unix timestamp
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function generateOHLCHistory(
  basePrice: number,
  bars: number,
  intervalMs: number,
  volatility: number = 0.003,
): OHLCBar[] {
  const data: OHLCBar[] = []
  const now = Date.now()
  let price = basePrice * (1 + (Math.random() - 0.5) * 0.1)

  for (let i = bars; i > 0; i--) {
    const open = price
    const moves = Array.from({ length: 10 }, () =>
      price * (1 + (Math.random() - 0.498) * volatility),
    )
    const high = Math.max(open, ...moves)
    const low = Math.min(open, ...moves)
    const close = moves[moves.length - 1]
    const volume = Math.floor(1e6 + Math.random() * 5e6)

    data.push({
      time: Math.floor((now - i * intervalMs) / 1000),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    })

    price = close
  }

  return data
}

const INTERVAL_MS: Record<string, number> = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '1D': 24 * 60 * 60 * 1000,
  '1W': 7 * 24 * 60 * 60 * 1000,
}

export function getOHLCForTimeframe(
  basePrice: number,
  timeframe: string,
  bars: number = 200,
  volatility: number = 0.003,
): OHLCBar[] {
  const interval = INTERVAL_MS[timeframe] ?? INTERVAL_MS['1D']
  return generateOHLCHistory(basePrice, bars, interval, volatility)
}
