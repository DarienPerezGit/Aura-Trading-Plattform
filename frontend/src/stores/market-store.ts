import { create } from 'zustand'

export interface MarketAsset {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  high24h: number
  low24h: number
  sparkline: number[]
  signal: 'compra' | 'venta' | 'mantener'
  sentiment: 'positivo' | 'neutral' | 'negativo'
  sector?: string
  exchange?: string
}

export interface WatchlistItem {
  symbol: string
  name: string
}

interface MarketState {
  assets: Record<string, MarketAsset>
  watchlist: WatchlistItem[]
  selectedSymbol: string | null
  movers: {
    gainers: MarketAsset[]
    losers: MarketAsset[]
    volume: MarketAsset[]
  }
  setAssets: (assets: Record<string, MarketAsset>) => void
  updateAsset: (symbol: string, update: Partial<MarketAsset>) => void
  setSelectedSymbol: (symbol: string | null) => void
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (symbol: string) => void
  setMovers: (movers: MarketState['movers']) => void
}

export const useMarketStore = create<MarketState>((set) => ({
  assets: {},
  watchlist: [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'GOOGL', name: 'Alphabet' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
  ],
  selectedSymbol: null,
  movers: { gainers: [], losers: [], volume: [] },

  setAssets: (assets) => set({ assets }),
  updateAsset: (symbol, update) =>
    set((s) => ({
      assets: {
        ...s.assets,
        [symbol]: { ...s.assets[symbol], ...update },
      },
    })),
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  addToWatchlist: (item) =>
    set((s) => ({
      watchlist: s.watchlist.some((w) => w.symbol === item.symbol)
        ? s.watchlist
        : [...s.watchlist, item],
    })),
  removeFromWatchlist: (symbol) =>
    set((s) => ({
      watchlist: s.watchlist.filter((w) => w.symbol !== symbol),
    })),
  setMovers: (movers) => set({ movers }),
}))
