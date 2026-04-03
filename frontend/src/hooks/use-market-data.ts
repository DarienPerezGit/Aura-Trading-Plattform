import { useEffect, useRef } from 'react'
import { useMarketStore, type MarketAsset } from '@/stores/market-store'
import {
  INITIAL_ASSETS,
  ASSET_NAMES,
  ASSET_SECTORS,
  ASSET_EXCHANGES,
  generatePriceTick,
  generateSparkline,
} from '@/data/generators/price-ticker'

export function useMarketData() {
  const { assets, setAssets, updateAsset, setMovers } = useMarketStore()
  const initialized = useRef(false)

  // Initialize assets
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

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
    setAssets(initial)

    // Compute movers
    const sorted = Object.values(initial)
    setMovers({
      gainers: [...sorted].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5),
      losers: [...sorted].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5),
      volume: [...sorted].sort((a, b) => b.volume - a.volume).slice(0, 5),
    })
  }, [setAssets, setMovers])

  // Live price updates
  useEffect(() => {
    const interval = setInterval(() => {
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

      // Update movers every tick
      const updated = useMarketStore.getState().assets
      const sorted = Object.values(updated)
      setMovers({
        gainers: [...sorted].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5),
        losers: [...sorted].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5),
        volume: [...sorted].sort((a, b) => b.volume - a.volume).slice(0, 5),
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [updateAsset, setMovers])

  return assets
}
