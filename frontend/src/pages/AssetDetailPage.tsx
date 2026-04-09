import { useEffect, useRef, useState } from 'react'
import {
  Star, GitCompare, Bot, Bell, Play,
} from 'lucide-react'
import { createChart, type IChartApi, type Time, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts'
import { useMarketStore } from '@/stores/market-store'
import { DataPanel } from '@/components/shared/DataPanel'
import { MetricCard } from '@/components/shared/MetricCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriceChange } from '@/components/shared/PriceChange'
import { cn } from '@/lib/utils'
import { formatNumber, formatVolume } from '@/lib/format'
import {
  fetchStockBars, fetchCryptoOHLCV,
  fetchCompanyNews, fetchSentiment,
  fetchOrderBook, fetchRecentTrades,
  type OHLCBar,
  type NewsItem, type SentimentData,
  type OrderBook, type RecentTrade,
} from '@/lib/api'
import { ASSET_EXCHANGES } from '@/data/generators/price-ticker'
import { TIMEFRAMES, type Timeframe } from '@/config/constants'
import { theme } from '@/config/theme'

const CRYPTO_SYMBOLS = new Set(['BTC', 'ETH', 'SOL', 'BNB'])

// Map frontend timeframes to backend format
const TF_TO_ALPACA: Record<string, string> = {
  '1m': '1Min', '5m': '5Min', '15m': '15Min',
  '1h': '1Hour', '4h': '1Hour', '1D': '1Day', '1W': '1Week',
}
const TF_TO_CCXT: Record<string, string> = {
  '1m': '1m', '5m': '5m', '15m': '15m',
  '1h': '1h', '4h': '4h', '1D': '1d', '1W': '1w',
}

interface AssetDetailPageProps {
  symbol: string
}

export function AssetDetailPage({ symbol }: AssetDetailPageProps) {
  const asset = useMarketStore((s) => s.assets[symbol])
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')
  const [news, setNews] = useState<NewsItem[]>([])
  const [sentiment, setSentiment] = useState<SentimentData | null>(null)
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null)
  const [trades, setTrades] = useState<RecentTrade[]>([])
  const [newsError, setNewsError] = useState(false)
  const [sentimentError, setSentimentError] = useState(false)
  const [orderBookError, setOrderBookError] = useState(false)
  const [tradesError, setTradesError] = useState(false)
  const isCrypto = CRYPTO_SYMBOLS.has(symbol)

  // Noticias + sentimiento (solo stocks)
  useEffect(() => {
    if (isCrypto) return
    setNews([])
    setSentiment(null)
    setNewsError(false)
    setSentimentError(false)
    fetchCompanyNews(symbol).then(setNews).catch(() => setNewsError(true))
    fetchSentiment(symbol).then(setSentiment).catch(() => setSentimentError(true))
  }, [symbol, isCrypto])

  // Order book + trades reales (solo crypto via Binance)
  useEffect(() => {
    if (!isCrypto) return
    let cancelled = false

    const refresh = () => {
      if (cancelled) return
      fetchOrderBook(symbol)
        .then((b) => {
          if (!cancelled) {
            setOrderBook(b)
            setOrderBookError(false)
          }
        })
        .catch(() => { if (!cancelled) setOrderBookError(true) })
      fetchRecentTrades(symbol)
        .then((t) => {
          if (!cancelled) {
            setTrades(t)
            setTradesError(false)
          }
        })
        .catch(() => { if (!cancelled) setTradesError(true) })
    }

    refresh()
    const bookInterval = setInterval(refresh, 2000)
    const tradesInterval = setInterval(refresh, 5000)

    return () => {
      cancelled = true
      clearInterval(bookInterval)
      clearInterval(tradesInterval)
    }
  }, [symbol, isCrypto])

  if (!asset) {
    return (
      <div className="h-full flex items-center justify-center text-aura-text-muted">
        Cargando {symbol}...
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      {/* Asset Header */}
      <div className="panel p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-aura-text">{asset.symbol}</h1>
              <span className="text-sm text-aura-text-secondary">{asset.name}</span>
              <span className="text-[10px] bg-aura-card px-1.5 py-0.5 rounded text-aura-text-muted">
                {ASSET_EXCHANGES[symbol] ?? 'N/A'}
              </span>
              <StatusBadge status="live" />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <div className="text-2xl font-bold font-mono text-aura-text">
              ${formatNumber(asset.price)}
            </div>
            <PriceChange value={asset.change} percent={asset.changePercent} size="md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[
            { icon: Star, label: 'Watchlist' },
            { icon: GitCompare, label: 'Comparar' },
            { icon: Bot, label: 'AI' },
            { icon: Bell, label: 'Alerta' },
            { icon: Play, label: 'Simular' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              title={label}
              className="p-2 rounded hover:bg-aura-card text-aura-text-secondary hover:text-aura-text transition-colors cursor-pointer"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-6 gap-2 shrink-0">
        <MetricCard label="Rango diario" value={`$${formatNumber(asset.low24h)} — $${formatNumber(asset.high24h)}`} />
        <MetricCard label="Volumen" value={formatVolume(asset.volume)} />
        <MetricCard label="Market Cap" value={formatVolume(asset.marketCap)} />
        <MetricCard label="Spread" value={`$${formatNumber(asset.price * 0.001)}`} />
        <MetricCard label="Sector" value={asset.sector ?? 'N/A'} />
        <MetricCard
          label="Senal AI"
          value="No disponible"
          subValue="Sin backend real"
        />
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Left: Order Book + Trades */}
        <div className="col-span-2 flex flex-col gap-3 min-h-0">
          <DataPanel title="Order Book" subtitle={isCrypto ? 'Binance L2' : 'No aplica'} className="flex-1">
            {isCrypto && orderBook ? <OrderBookReal book={orderBook} /> : <UnavailablePanel message={orderBookError ? 'No disponible.' : 'Sin datos.'} />}
          </DataPanel>
          <DataPanel title="Trades Recientes" subtitle={isCrypto ? 'Live' : 'No aplica'} className="flex-1">
            {isCrypto && trades.length > 0 ? <TradesTapeReal trades={trades} /> : <UnavailablePanel message={tradesError ? 'No disponible.' : 'Sin datos.'} />}
          </DataPanel>
        </div>

        {/* Center: Chart */}
        <div className="col-span-7 flex flex-col gap-2 min-h-0">
          <div className="flex items-center gap-1 shrink-0">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  'px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer',
                  timeframe === tf
                    ? 'bg-aura-accent-bg text-aura-accent'
                    : 'text-aura-text-muted hover:text-aura-text-secondary hover:bg-aura-card',
                )}
              >
                {tf}
              </button>
            ))}
          </div>
          <div className="flex-1 panel min-h-0" style={{ minHeight: '300px' }}>
            <CandlestickChartView symbol={symbol} price={asset.price} timeframe={timeframe} />
          </div>
        </div>

        {/* Right: AI Analysis + Order Panel */}
        <div className="col-span-3 flex flex-col gap-3 min-h-0">
          <DataPanel title="Analisis AI" className="flex-1">
            <UnavailablePanel message="No disponible." />
          </DataPanel>

          {/* Sentiment */}
          {sentiment ? (
            <DataPanel title="Sentimiento Finnhub" className="shrink-0">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className={cn('text-sm font-bold font-mono', sentiment.score >= 0 ? 'text-aura-bullish' : 'text-aura-bearish')}>
                    {sentiment.score >= 0 ? '+' : ''}{sentiment.score.toFixed(2)}
                  </div>
                  <div className="text-[9px] text-aura-text-muted mt-0.5">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold font-mono text-aura-text">{sentiment.buzz.toFixed(2)}</div>
                  <div className="text-[9px] text-aura-text-muted mt-0.5">Buzz</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold font-mono text-aura-text">{sentiment.articles_count}</div>
                  <div className="text-[9px] text-aura-text-muted mt-0.5">Artículos</div>
                </div>
              </div>
            </DataPanel>
          ) : sentimentError ? (
            <DataPanel title="Sentimiento Finnhub" className="shrink-0">
              <UnavailablePanel message="No disponible." />
            </DataPanel>
          ) : null}

          {/* News Panel */}
          {news.length > 0 ? (
            <DataPanel title="Noticias Recientes" subtitle={`${news.length} artículos`} className="flex-1 overflow-hidden">
              <div className="space-y-2 overflow-y-auto max-h-full">
                {news.slice(0, 6).map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block panel-card p-2 hover:bg-aura-card-hover transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] text-aura-text-muted">{item.source}</span>
                      <span className="text-[9px] text-aura-text-muted ml-auto">
                        {new Date(item.timestamp).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-[10px] leading-snug text-aura-text-secondary line-clamp-2">
                      {item.headline}
                    </p>
                  </a>
                ))}
              </div>
            </DataPanel>
          ) : newsError ? (
            <DataPanel title="Noticias Recientes" subtitle="API" className="flex-1 overflow-hidden">
              <UnavailablePanel message="No disponible." />
            </DataPanel>
          ) : null}

          {/* Order Panel */}
          <DataPanel title="Panel de Orden" subtitle="Simulado" className="shrink-0">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button className="py-2 rounded bg-aura-bullish/20 text-aura-bullish text-xs font-semibold hover:bg-aura-bullish/30 transition-colors cursor-pointer">
                  COMPRA
                </button>
                <button className="py-2 rounded bg-aura-bearish/20 text-aura-bearish text-xs font-semibold hover:bg-aura-bearish/30 transition-colors cursor-pointer">
                  VENTA
                </button>
              </div>
              <div className="space-y-2">
                <InputField label="Cantidad" value="100" />
                <InputField label="Stop Loss" value={formatNumber(asset.price * 0.95)} />
                <InputField label="Take Profit" value={formatNumber(asset.price * 1.1)} />
              </div>
              <button className="w-full py-2 rounded bg-aura-accent text-white text-xs font-semibold hover:bg-aura-accent-hover transition-colors cursor-pointer">
                Simular Operacion
              </button>
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  )
}

function InputField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-[10px] text-aura-text-muted uppercase">{label}</label>
      <input
        type="text"
        defaultValue={value}
        className="w-full mt-0.5 bg-aura-card border border-aura-border rounded px-2 py-1.5 text-xs font-mono text-aura-text outline-none focus:border-aura-accent transition-colors"
      />
    </div>
  )
}

function CandlestickChartView({ symbol, price: _price, timeframe }: { symbol: string; price: number; timeframe: Timeframe }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<IChartApi | null>(null)
  const [bars, setBars] = useState<OHLCBar[] | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')

  useEffect(() => {
    let cancelled = false

    async function fetchBars() {
      setStatus('loading')
      setBars(null)

      try {
        const isCrypto = CRYPTO_SYMBOLS.has(symbol)
        const apiBars = isCrypto
          ? await fetchCryptoOHLCV(symbol, TF_TO_CCXT[timeframe] ?? '1d', 200)
          : await fetchStockBars(symbol, TF_TO_ALPACA[timeframe] ?? '1Day', 200)

        if (!cancelled && apiBars.length > 0) {
          setBars(apiBars)
          setStatus('ready')
          return
        }
      } catch {}

      if (!cancelled) {
        setStatus('unavailable')
      }
    }

    fetchBars()

    return () => {
      cancelled = true
    }
  }, [symbol, timeframe])

  useEffect(() => {
    if (status !== 'ready' || !bars || !chartRef.current) return
    if (chartInstance.current) {
      chartInstance.current.remove()
      chartInstance.current = null
    }

    const data = bars.map((bar) => ({
      time: Math.floor(new Date(bar.timestamp).getTime() / 1000),
      open: +bar.open.toFixed(2),
      high: +bar.high.toFixed(2),
      low: +bar.low.toFixed(2),
      close: +bar.close.toFixed(2),
      volume: bar.volume,
    }))

      const chart = createChart(chartRef.current!, {
        autoSize: true,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: theme.colors.textSecondary,
          fontSize: 11,
        },
        grid: {
          vertLines: { color: theme.chart.grid },
          horzLines: { color: theme.chart.grid },
        },
        crosshair: {
          vertLine: { color: theme.chart.crosshair, width: 1, style: 2 },
          horzLine: { color: theme.chart.crosshair, width: 1, style: 2 },
        },
        rightPriceScale: { borderColor: theme.colors.border },
        timeScale: { borderColor: theme.colors.border, timeVisible: true },
      })

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: theme.chart.upColor,
        downColor: theme.chart.downColor,
        borderUpColor: theme.chart.upColor,
        borderDownColor: theme.chart.downColor,
        wickUpColor: theme.chart.upColor,
        wickDownColor: theme.chart.downColor,
      })

      candleSeries.setData(data.map((bar) => ({ ...bar, time: bar.time as Time })))

      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      })

      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      })

      volumeSeries.setData(
        data.map((bar) => ({
          time: bar.time as Time,
          value: bar.volume,
          color: bar.close >= bar.open ? theme.chart.volumeUp : theme.chart.volumeDown,
        })),
      )

      chart.timeScale().fitContent()
      chartInstance.current = chart

    return () => {
      if (chartInstance.current) {
        chartInstance.current.remove()
        chartInstance.current = null
      }
    }
  }, [bars, status])

  if (status === 'loading') {
    return <UnavailablePanel message="Cargando velas..." />
  }

  if (status === 'unavailable') {
    return <UnavailablePanel message="No disponible." />
  }

  return <div ref={chartRef} style={{ width: '100%', height: '100%', minHeight: '300px' }} />
}

function UnavailablePanel({ message }: { message: string }) {
  return (
    <div className="h-full min-h-[160px] flex items-center justify-center text-xs text-aura-text-muted text-center px-4">
      {message}
    </div>
  )
}

function OrderBookReal({ book }: { book: OrderBook }) {
  const asks = [...book.asks].reverse() // mayor a menor para mostrar encima
  const maxSize = Math.max(
    ...book.bids.map((b) => b.size),
    ...book.asks.map((a) => a.size),
    1,
  )
  const midPrice = book.asks[0]
    ? (book.bids[0]?.price + book.asks[0].price) / 2
    : book.bids[0]?.price ?? 0

  return (
    <div className="space-y-0.5 font-mono text-[10px]">
      {asks.map((ask, i) => (
        <div key={`a${i}`} className="flex items-center justify-between relative px-1 py-0.5">
          <div
            className="absolute right-0 top-0 bottom-0 bg-aura-bearish/10"
            style={{ width: `${(ask.size / maxSize) * 100}%` }}
          />
          <span className="text-aura-bearish relative z-10">{formatNumber(ask.price)}</span>
          <span className="text-aura-text-muted relative z-10">{ask.size.toFixed(4)}</span>
        </div>
      ))}
      <div className="py-1 text-center text-xs font-semibold text-aura-text border-y border-aura-border">
        ${formatNumber(midPrice)}
      </div>
      {book.bids.map((bid, i) => (
        <div key={`b${i}`} className="flex items-center justify-between relative px-1 py-0.5">
          <div
            className="absolute left-0 top-0 bottom-0 bg-aura-bullish/10"
            style={{ width: `${(bid.size / maxSize) * 100}%` }}
          />
          <span className="text-aura-bullish relative z-10">{formatNumber(bid.price)}</span>
          <span className="text-aura-text-muted relative z-10">{bid.size.toFixed(4)}</span>
        </div>
      ))}
    </div>
  )
}

function TradesTapeReal({ trades }: { trades: RecentTrade[] }) {
  return (
    <div className="space-y-0.5 font-mono text-[10px]">
      {[...trades].reverse().map((trade, i) => (
        <div key={i} className="flex items-center justify-between px-1 py-0.5">
          <span className={trade.side === 'buy' ? 'text-aura-bullish' : 'text-aura-bearish'}>
            {formatNumber(trade.price)}
          </span>
          <span className="text-aura-text-muted">{trade.size.toFixed(4)}</span>
          <span className="text-aura-text-muted">
            {new Date(trade.timestamp).toLocaleTimeString('es-AR', {
              hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
            })}
          </span>
        </div>
      ))}
    </div>
  )
}

