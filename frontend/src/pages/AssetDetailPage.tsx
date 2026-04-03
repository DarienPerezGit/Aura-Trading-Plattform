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
import { getOHLCForTimeframe } from '@/data/generators/ohlc-generator'
import { MOCK_SIGNALS } from '@/data/mock-signals'
import { ASSET_EXCHANGES, INITIAL_ASSETS } from '@/data/generators/price-ticker'
import { TIMEFRAMES, type Timeframe } from '@/config/constants'
import { theme } from '@/config/theme'

interface AssetDetailPageProps {
  symbol: string
}

export function AssetDetailPage({ symbol }: AssetDetailPageProps) {
  const asset = useMarketStore((s) => s.assets[symbol])
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')
  const signal = MOCK_SIGNALS.find((s) => s.symbol === symbol)

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
          value={signal?.direction ?? 'N/A'}
          subValue={signal ? `Confianza: ${signal.confidence}%` : undefined}
          trend={signal?.direction === 'compra' ? 'up' : signal?.direction === 'venta' ? 'down' : undefined}
        />
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Left: Order Book + Stats */}
        <div className="col-span-2 flex flex-col gap-3 min-h-0">
          <DataPanel title="Order Book" className="flex-1">
            <OrderBookMock price={asset.price} />
          </DataPanel>
          <DataPanel title="Trades Recientes" className="flex-1">
            <TradesTapeMock price={asset.price} />
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
          <div className="flex-1 panel min-h-0">
            <CandlestickChartView symbol={symbol} price={asset.price} timeframe={timeframe} />
          </div>
        </div>

        {/* Right: AI Analysis + Order Panel */}
        <div className="col-span-3 flex flex-col gap-3 min-h-0">
          {signal ? (
            <DataPanel title="Analisis AI" className="flex-1">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={signal.direction} size="md" />
                  <span className="text-sm font-semibold text-aura-text">
                    Confianza: {signal.confidence}%
                  </span>
                </div>
                <div className="w-full bg-aura-card rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full',
                      signal.direction === 'compra' ? 'bg-aura-bullish' : signal.direction === 'venta' ? 'bg-aura-bearish' : 'bg-aura-warning',
                    )}
                    style={{ width: `${signal.confidence}%` }}
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-aura-text-muted font-semibold">Analisis</span>
                  <p className="text-xs text-aura-text-secondary mt-1 leading-relaxed">
                    {signal.rationale}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-aura-text-muted font-semibold">Regimen</span>
                  <p className="text-xs text-aura-text mt-1">{signal.regime}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-aura-text-muted font-semibold">Riesgo</span>
                  <p className="text-xs text-aura-warning mt-1">{signal.riskNote}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-aura-text-muted font-semibold">Drivers</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {signal.drivers.map((d, i) => (
                      <span key={i} className="text-[10px] bg-aura-card px-2 py-0.5 rounded text-aura-text-secondary">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </DataPanel>
          ) : (
            <DataPanel title="Analisis AI" className="flex-1">
              <div className="flex items-center justify-center h-full text-aura-text-muted text-xs">
                Sin senal activa para {symbol}
              </div>
            </DataPanel>
          )}

          {/* Order Panel */}
          <DataPanel title="Panel de Orden" subtitle="Simulado">
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

function CandlestickChartView({ symbol, price, timeframe }: { symbol: string; price: number; timeframe: Timeframe }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<IChartApi | null>(null)

  const config = INITIAL_ASSETS.find((a) => a.symbol === symbol)
  const volatility = config?.volatility ?? 0.003

  useEffect(() => {
    if (!chartRef.current) return

    // Cleanup previous chart
    if (chartInstance.current) {
      chartInstance.current.remove()
      chartInstance.current = null
    }

    const chart = createChart(chartRef.current, {
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

    const data = getOHLCForTimeframe(price, timeframe, 200, volatility)
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

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        chart.applyOptions({ width, height })
      }
    })
    resizeObserver.observe(chartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartInstance.current = null
    }
  }, [symbol, timeframe, price, volatility])

  return <div ref={chartRef} className="w-full h-full" />
}

function OrderBookMock({ price }: { price: number }) {
  const asks = Array.from({ length: 8 }, (_, i) => ({
    price: price + (i + 1) * price * 0.0003,
    size: Math.floor(100 + Math.random() * 2000),
  })).reverse()

  const bids = Array.from({ length: 8 }, (_, i) => ({
    price: price - (i + 1) * price * 0.0003,
    size: Math.floor(100 + Math.random() * 2000),
  }))

  const maxSize = Math.max(...asks.map((a) => a.size), ...bids.map((b) => b.size))

  return (
    <div className="space-y-0.5 font-mono text-[10px]">
      {asks.map((ask, i) => (
        <div key={`a${i}`} className="flex items-center justify-between relative px-1 py-0.5">
          <div
            className="absolute right-0 top-0 bottom-0 bg-aura-bearish/8"
            style={{ width: `${(ask.size / maxSize) * 100}%` }}
          />
          <span className="text-aura-bearish relative z-10">{formatNumber(ask.price)}</span>
          <span className="text-aura-text-muted relative z-10">{ask.size}</span>
        </div>
      ))}
      <div className="py-1 text-center text-xs font-semibold text-aura-text border-y border-aura-border">
        ${formatNumber(price)}
      </div>
      {bids.map((bid, i) => (
        <div key={`b${i}`} className="flex items-center justify-between relative px-1 py-0.5">
          <div
            className="absolute left-0 top-0 bottom-0 bg-aura-bullish/8"
            style={{ width: `${(bid.size / maxSize) * 100}%` }}
          />
          <span className="text-aura-bullish relative z-10">{formatNumber(bid.price)}</span>
          <span className="text-aura-text-muted relative z-10">{bid.size}</span>
        </div>
      ))}
    </div>
  )
}

function TradesTapeMock({ price }: { price: number }) {
  const trades = Array.from({ length: 15 }, (_, i) => ({
    price: price * (1 + (Math.random() - 0.5) * 0.002),
    size: Math.floor(10 + Math.random() * 500),
    side: Math.random() > 0.5 ? 'buy' : 'sell',
    time: new Date(Date.now() - i * 3000),
  }))

  return (
    <div className="space-y-0.5 font-mono text-[10px]">
      {trades.map((trade, i) => (
        <div key={i} className="flex items-center justify-between px-1 py-0.5">
          <span
            className={trade.side === 'buy' ? 'text-aura-bullish' : 'text-aura-bearish'}
          >
            {formatNumber(trade.price)}
          </span>
          <span className="text-aura-text-muted">{trade.size}</span>
          <span className="text-aura-text-muted">
            {trade.time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
        </div>
      ))}
    </div>
  )
}
