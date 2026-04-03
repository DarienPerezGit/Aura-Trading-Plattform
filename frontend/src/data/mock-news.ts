export interface NewsItem {
  id: string
  headline: string
  source: string
  timestamp: Date
  symbols: string[]
  sentiment: 'positivo' | 'neutral' | 'negativo'
  relevance: number // 0-100
  topic: string
  summary: string
}

export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1', headline: 'NVIDIA supera estimaciones de ganancias por amplio margen',
    source: 'Bloomberg', timestamp: new Date(Date.now() - 1800000),
    symbols: ['NVDA'], sentiment: 'positivo', relevance: 95,
    topic: 'Earnings', summary: 'NVIDIA reporto ingresos de $22.1B, superando la estimacion de $20.4B. La demanda de chips AI sigue acelerandose.',
  },
  {
    id: '2', headline: 'Bitcoin se acerca a los $100K mientras institucionales incrementan posiciones',
    source: 'CoinDesk', timestamp: new Date(Date.now() - 3600000),
    symbols: ['BTC', 'ETH'], sentiment: 'positivo', relevance: 88,
    topic: 'Crypto', summary: 'El flujo institucional hacia Bitcoin ETFs alcanzo un record semanal de $2.4B.',
  },
  {
    id: '3', headline: 'Fed mantiene tasas estables, senala posible recorte en Q3',
    source: 'Reuters', timestamp: new Date(Date.now() - 7200000),
    symbols: ['SPY', 'DXY', 'GLD'], sentiment: 'positivo', relevance: 92,
    topic: 'Macro', summary: 'La Reserva Federal mantuvo las tasas en 5.25-5.50% pero insinuo flexibilidad para el tercer trimestre.',
  },
  {
    id: '4', headline: 'Tesla enfrenta presion por competencia china en EVs',
    source: 'Financial Times', timestamp: new Date(Date.now() - 10800000),
    symbols: ['TSLA'], sentiment: 'negativo', relevance: 78,
    topic: 'Automotriz', summary: 'BYD supero a Tesla en ventas globales de EVs por segundo trimestre consecutivo.',
  },
  {
    id: '5', headline: 'Apple anuncia alianza con OpenAI para integracion de AI en iOS',
    source: 'TechCrunch', timestamp: new Date(Date.now() - 14400000),
    symbols: ['AAPL'], sentiment: 'positivo', relevance: 85,
    topic: 'AI', summary: 'Apple integrara modelos avanzados de AI en Siri y aplicaciones nativas de iOS 19.',
  },
  {
    id: '6', headline: 'Sector semiconductores muestra senales de sobrecompra segun indicadores tecnicos',
    source: 'MarketWatch', timestamp: new Date(Date.now() - 18000000),
    symbols: ['NVDA', 'AAPL', 'MSFT'], sentiment: 'negativo', relevance: 72,
    topic: 'Semiconductores', summary: 'El SOX index muestra RSI por encima de 75, historicamente una senal de correccion inminente.',
  },
  {
    id: '7', headline: 'Solana TVL alcanza nuevo ATH impulsado por DeFi y memecoins',
    source: 'The Block', timestamp: new Date(Date.now() - 21600000),
    symbols: ['SOL'], sentiment: 'positivo', relevance: 70,
    topic: 'DeFi', summary: 'El valor total bloqueado en Solana supero los $8B, un incremento del 340% en el ano.',
  },
  {
    id: '8', headline: 'Petroleo cae ante preocupaciones de demanda global',
    source: 'CNBC', timestamp: new Date(Date.now() - 25200000),
    symbols: ['OIL'], sentiment: 'negativo', relevance: 65,
    topic: 'Commodities', summary: 'WTI cedio 2.3% ante datos debiles de manufactura en China y Europa.',
  },
]

export const TOPIC_CLUSTERS = [
  { topic: 'AI', count: 24, sentiment: 0.72, trending: true },
  { topic: 'Semiconductores', count: 18, sentiment: 0.45, trending: true },
  { topic: 'Crypto', count: 31, sentiment: 0.68, trending: true },
  { topic: 'Macro/Fed', count: 15, sentiment: 0.30, trending: false },
  { topic: 'Energia', count: 12, sentiment: -0.15, trending: false },
  { topic: 'Regulacion', count: 9, sentiment: -0.40, trending: false },
  { topic: 'Geopolitica', count: 8, sentiment: -0.55, trending: true },
  { topic: 'Earnings', count: 22, sentiment: 0.52, trending: false },
]
