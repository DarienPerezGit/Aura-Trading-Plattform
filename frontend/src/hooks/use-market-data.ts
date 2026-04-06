import { useEffect, useRef, useCallback } from 'react'
import { useMarketStore, type MarketAsset } from '@/stores/market-store'
import {
  fetchStockQuotes,
  fetchCryptoTickers,
  fetchIndices,
  type QuoteData,
  type CryptoTicker,
} from '@/lib/api'
import {
  INITIAL_ASSETS,
  ASSET_NAMES,
  ASSET_SECTORS,
  ASSET_EXCHANGES,
  generatePriceTick,
  generateSparkline,
} from '@/data/generators/price-ticker'

const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'JPM']
const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB']
const POLL_INTERVAL = 10_000 // 10s

function stockQuoteToAsset(q: QuoteData, prev?: MarketAsset): MarketAsset {
  const sparkline = prev?.sparkline
    ? [...prev.sparkline.slice(1), q.price]
    : [q.price]
  return {
    symbol: q.symbol,
    name: ASSET_NAMES[q.symbol] ?? q.symbol,
    price: q.price,
    change: q.change,
    changePercent: q.change_percent,
    volume: prev?.volume ?? Math.floor(1e6 + Math.random() * 50e6),
    marketCap: prev?.marketCap ?? q.price * (1e8 + Math.random() * 1e10),
    high24h: q.high || prev?.high24h || q.price,
    low24h: q.low || prev?.low24h || q.price,
    sparkline,
    signal: prev?.signal ?? 'mantener',
    sentiment: prev?.sentiment ?? 'neutral',
    sector: ASSET_SECTORS[q.symbol],
    exchange: ASSET_EXCHANGES[q.symbol],
  }
}

function cryptoTickerToAsset(t: CryptoTicker, prev?: MarketAsset): MarketAsset {
  const symbol = t.symbol.replace('/USDT', '')
  const sparkline = prev?.sparkline
    ? [...prev.sparkline.slice(1), t.price]
    : [t.price]
  return {
    symbol,
    name: ASSET_NAMES[symbol] ?? symbol,
    price: t.price,
    change: t.change_24h,
    changePercent: t.change_percent_24h,
    volume: t.volume_24h,
    marketCap: prev?.marketCap ?? t.price * 1e7,
    high24h: t.high_24h,
    low24h: t.low_24h,
    sparkline,
    signal: prev?.signal ?? 'mantener',
    sentiment: prev?.sentiment ?? 'neutral',
    sector: 'Crypto',
    exchange: 'Binance',
  }
}

function buildMockAssets(): Record<string, MarketAsset> {
  const initial: Record<string, MarketAsset> = {}
  for (const config of INITIAL_ASSETS) {
    const sparkline = generateSparkline(config.basePrice, 20, config.volatility)
    const price = sparkline[sparkline.length - 1]
    const change = price - config.basePrice
    const changePercent = (change / config.basePrice) * 100
    initial[config.symbol] = {
      symbol: config.symbol,
      name: ASSET_NAMES[config.symbol] ?? config.symbol,
      price,
      change,
      changePercent,
      volume: Math.floor(1e6 + Math.random() * 50e6),
      marketCap: config.basePrice * (1e8 + Math.random() * 1e10),
      high24h: price * (1 + Math.random() * 0.03),
      low24h: price * (1 - Math.random() * 0.03),
      sparkline,
      signal: (['compra', 'venta', 'mantener'] as const)[Math.floor(Math.random() * 3)],
      sentiment: (['positivo', 'neutral', 'negativo'] as const)[Math.floor(Math.random() * 3)],
      sector: ASSET_SECTORS[config.symbol],
      exchange: ASSET_EXCHANGES[config.symbol],
    }
  }
  return initial
}

function computeMovers(assets: Record<string, MarketAsset>) {
  const sorted = Object.values(assets)
  return {
    gainers: [...sorted].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5),
    losers: [...sorted].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5),
    volume: [...sorted].sort((a, b) => b.volume - a.volume).slice(0, 5),
  }
}

export function useMarketData() {
  const { assets, setAssets, updateAsset, setMovers } = useMarketStore()
  const initialized = useRef(false)
  const usingAPI = useRef(false)

  // Try to fetch from real APIs, fall back to mock
  const fetchRealData = useCallback(async () => {
    const current = useMarketStore.getState().assets

    try {
      const [stockQuotes, cryptoTickers, indices] = await Promise.all([
        fetchStockQuotes(STOCK_SYMBOLS).catch(() => [] as QuoteData[]),
        fetchCryptoTickers(CRYPTO_SYMBOLS.join(',')).catch(() => [] as CryptoTicker[]),
        fetchIndices().catch(() => [] as QuoteData[]),
      ])

      if (stockQuotes.length === 0 && cryptoTickers.length === 0 && indices.length === 0) {
        return false // API not available
      }

      usingAPI.current = true

      for (const q of stockQuotes) {
        updateAsset(q.symbol, stockQuoteToAsset(q, current[q.symbol]))
      }
      for (const t of cryptoTickers) {
        const sym = t.symbol.replace('/USDT', '')
        updateAsset(sym, cryptoTickerToAsset(t, current[sym]))
      }
      // Índices: SPY, QQQ, GLD, VIX, DXY, OIL via Finnhub
      for (const q of indices) {
        updateAsset(q.symbol, stockQuoteToAsset(q, current[q.symbol]))
      }

      const updated = useMarketStore.getState().assets
      setMovers(computeMovers(updated))
      return true
    } catch {
      return false
    }
  }, [updateAsset, setMovers])

  // Initialize
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Start with mock data immediately so UI isn't empty
    const mock = buildMockAssets()
    setAssets(mock)
    setMovers(computeMovers(mock))

    // Then try real API
    fetchRealData()
  }, [setAssets, setMovers, fetchRealData])

  // Polling: real API every 10s, or mock tick every 2s
  useEffect(() => {
    // Real API polling
    const apiInterval = setInterval(() => {
      fetchRealData()
    }, POLL_INTERVAL)

    // Mock fallback ticking (only updates if API is not working)
    const mockInterval = setInterval(() => {
      if (usingAPI.current) return

      const currentAssets = useMarketStore.getState().assets
      for (const config of INITIAL_ASSETS) {
        const asset = currentAssets[config.symbol]
        if (!asset) continue

        const newPrice = generatePriceTick(asset.price, config.volatility)
        const change = newPrice - config.basePrice
        const changePercent = (change / config.basePrice) * 100
        const newSparkline = [...asset.sparkline.slice(1), newPrice]

        updateAsset(config.symbol, {
          price: newPrice,
          change,
          changePercent,
          sparkline: newSparkline,
          high24h: Math.max(asset.high24h, newPrice),
          low24h: Math.min(asset.low24h, newPrice),
        })
      }

      const updated = useMarketStore.getState().assets
      setMovers(computeMovers(updated))
    }, 2000)

    return () => {
      clearInterval(apiInterval)
      clearInterval(mockInterval)
    }
  }, [updateAsset, setMovers, fetchRealData])

  return assets
}
