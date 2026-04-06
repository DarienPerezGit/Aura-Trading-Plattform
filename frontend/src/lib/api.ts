/**
 * API Client — connects frontend to Aura Terminal backend
 * All endpoints go through Vite proxy: /api → http://localhost:8000
 */

const BASE = '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

// ── Types matching backend Pydantic models ──────────────────────────────────

export interface MacroIndicator {
  series_id: string
  name: string
  value: number
  date: string
  frequency: string
  unit: string
}

export interface MacroSnapshot {
  indicators: MacroIndicator[]
  fetched_at: string
}

export interface MacroSignal {
  signal: 'RISK_ON' | 'RISK_OFF'
  confidence: number
  reasoning: string
  key_factors: string[]
  snapshot_date: string | null
}

export interface NewsItem {
  id: string
  headline: string
  source: string
  url: string
  summary: string
  timestamp: string
  symbols: string[]
  sentiment: number | null
}

export interface QuoteData {
  symbol: string
  price: number
  change: number
  change_percent: number
  high: number
  low: number
  open: number
  prev_close: number
  timestamp: string
}

export interface CryptoTicker {
  symbol: string
  price: number
  change_24h: number
  change_percent_24h: number
  high_24h: number
  low_24h: number
  volume_24h: number
  timestamp: string
}

export interface OHLCBar {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface SentimentData {
  symbol: string
  score: number
  buzz: number
  articles_count: number
}

// ── API functions ───────────────────────────────────────────────────────────

// Macro (FRED)
export const fetchMacroSnapshot = (series?: string) =>
  get<MacroSnapshot>(series ? `/market/macro?series=${series}` : '/market/macro')

export const fetchMacroIndicator = (id: string) =>
  get<MacroIndicator>(`/market/macro/${id}`)

export const fetchMacroCatalog = () =>
  get<{ series: Array<{ id: string; name: string; frequency: string; unit: string }> }>('/market/macro/catalog/list')

// News & Sentiment (Finnhub)
export const fetchMarketNews = (category = 'general') =>
  get<NewsItem[]>(`/market/news?category=${category}`)

export const fetchCompanyNews = (symbol: string) =>
  get<NewsItem[]>(`/market/news/${symbol}`)

export const fetchSentiment = (symbol: string) =>
  get<SentimentData>(`/market/sentiment/${symbol}`)

// Stock quotes (Alpaca)
export const fetchStockQuote = (symbol: string) =>
  get<QuoteData>(`/market/quote/${symbol}`)

export const fetchStockQuotes = (symbols: string[]) =>
  get<QuoteData[]>(`/market/quotes?symbols=${symbols.join(',')}`)

export const fetchStockBars = (symbol: string, timeframe = '1Day', limit = 100) =>
  get<OHLCBar[]>(`/market/bars/${symbol}?timeframe=${timeframe}&limit=${limit}`)

// Crypto (CCXT/Binance)
export const fetchCryptoTicker = (symbol: string) =>
  get<CryptoTicker>(`/market/crypto/ticker/${symbol}`)

export const fetchCryptoTickers = (symbols = 'BTC,ETH,SOL') =>
  get<CryptoTicker[]>(`/market/crypto/tickers?symbols=${symbols}`)

export const fetchCryptoOHLCV = (symbol: string, timeframe = '1d', limit = 100) =>
  get<OHLCBar[]>(`/market/crypto/ohlcv/${symbol}?timeframe=${timeframe}&limit=${limit}`)

// Crypto Order Book & Trades (Binance via CCXT — no API key needed)
export interface OrderBookLevel {
  price: number
  size: number
}

export interface OrderBook {
  symbol: string
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  timestamp: string
}

export interface RecentTrade {
  price: number
  size: number
  side: 'buy' | 'sell'
  timestamp: string
}

export const fetchOrderBook = (symbol: string, limit = 20) =>
  get<OrderBook>(`/market/crypto/orderbook/${symbol}?limit=${limit}`)

export const fetchRecentTrades = (symbol: string, limit = 20) =>
  get<RecentTrade[]>(`/market/crypto/trades/${symbol}?limit=${limit}`)

// Market Indices (SPY, QQQ, GLD, VIX, DXY, OIL via Finnhub)
export const fetchIndices = () =>
  get<QuoteData[]>('/market/indices')

// AI Analysis
export const fetchMacroSignal = () =>
  get<MacroSignal>('/analysis/macro/signal')

// AI Chat
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  response: string
}

export const fetchChat = (message: string, history: ChatMessage[] = []) =>
  fetch(`${BASE}/analysis/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  }).then((res) => {
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
    return res.json() as Promise<ChatResponse>
  })
