export interface MarketEvent {
  id: string
  type: 'orden' | 'alerta' | 'mercado' | 'sistema' | 'senal'
  message: string
  symbol?: string
  timestamp: Date
  severity: 'info' | 'warning' | 'critical'
}

const EVENT_TEMPLATES: Omit<MarketEvent, 'id' | 'timestamp'>[] = [
  { type: 'mercado', message: 'S&P 500 alcanzo maximo intradario', symbol: 'SPY', severity: 'info' },
  { type: 'alerta', message: 'BTC supero resistencia de $96,000', symbol: 'BTC', severity: 'warning' },
  { type: 'senal', message: 'Senal de compra detectada en NVDA', symbol: 'NVDA', severity: 'info' },
  { type: 'mercado', message: 'Volatilidad inusual en ETH (+15% volumen)', symbol: 'ETH', severity: 'warning' },
  { type: 'sistema', message: 'Feed de datos reconectado exitosamente', severity: 'info' },
  { type: 'orden', message: 'Orden simulada ejecutada: COMPRA AAPL x100', symbol: 'AAPL', severity: 'info' },
  { type: 'alerta', message: 'VIX supero umbral de 20 puntos', symbol: 'VIX', severity: 'critical' },
  { type: 'senal', message: 'Divergencia bajista detectada en TSLA', symbol: 'TSLA', severity: 'warning' },
  { type: 'mercado', message: 'Fed: Proxima decision de tasas en 48h', severity: 'warning' },
  { type: 'mercado', message: 'Earnings report: MSFT supera estimaciones', symbol: 'MSFT', severity: 'info' },
  { type: 'alerta', message: 'Drawdown del portafolio supero -2%', severity: 'critical' },
  { type: 'senal', message: 'Momentum alcista confirmado en SOL', symbol: 'SOL', severity: 'info' },
  { type: 'mercado', message: 'Apertura de mercados europeos con gap positivo', severity: 'info' },
  { type: 'sistema', message: 'Actualizacion de estrategia de momentum aplicada', severity: 'info' },
  { type: 'alerta', message: 'Correlacion BTC-SPY en maximos historicos', symbol: 'BTC', severity: 'warning' },
]

export function generateRandomEvent(): MarketEvent {
  const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)]
  return {
    ...template,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  }
}

export function generateInitialEvents(count: number): MarketEvent[] {
  const events: MarketEvent[] = []
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    const event = generateRandomEvent()
    event.timestamp = new Date(now - (count - i) * 30000)
    events.push(event)
  }
  return events
}
