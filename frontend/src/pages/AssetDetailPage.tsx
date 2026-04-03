import { useEffect, useRef, useMemo, useState } from 'react'
import {
  Star, GitCompare, Bot, Bell, Play,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { createChart, type IChartApi, type ISeriesApi, ColorType } from 'lightweight-charts'
import { useMarketStore } from '@/stores/market-store'
import { DataPanel } from '@/components/shared/DataPanel'
import { MetricCard } from '@/components/shared/MetricCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriceChange } from '@/components/shared/PriceChange'
import { cn } from '@/lib/utils'
import { formatNumber, formatPercent, formatVolume } from '@/lib/format'
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
      <div className="h-full flex items-center justify-center text-fenix-text-muted">
        Cargando {symbol}...
      </div>
    )
  }

  const isUp = asset.changePercent >= 0

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      {/* Asset Header */}
      <div className="panel p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-fenix-text">{asset.symbol}</h1>
              <span className="text-sm text-fenix-text-secondary">{asset.name}</span>
              <span className="text-[10px] bg-fenix-card px-1.5 py-0.5 rounded text-fenix-text-muted">
                {ASSET_EXCHANGES[symbol] ?? 'N/A'}
              </span>
              <StatusBadge status="live" />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <div className="text-2xl font-bold font-mono text-fenix-text">
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
              className="p-2 rounded hover:bg-fenix-card text-fenix-text-secondary hover:text-fenix-text transition-colors cursor-pointer"
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
                    ? 'bg-fenix-accent-bg text-fenix-accent'
                    : 'text-fenix-text-muted hover:text-fenix-text-secondary hover:bg-fenix-card',
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
                  <span className="text-sm font-semibold text-fenix-text">
                    Confianza: {signal.confidence}%
                  </span>
                </div>
                <div className="w-full bg-fenix-card rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full',
                      signal.direction === 'compra' ? 'bg-fenix-bullish' : signal.direction === 'venta' ? 'bg-fenix-bearish' : 'bg-fenix-warning',
                    )}
                    style={{ width: `${signal.confidence}%` }}
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-fenix-text-muted font-semibold">Analisis</span>
                  <p className="text-xs text-fenix-text-secondary mt-1 leading-relaxed">
                    {signal.rationale}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-fenix-text-muted font-semibold">Regimen</span>
                  <p className="text-xs text-fenix-text mt-1">{signal.regime}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-fenix-text-muted font-semibold">Riesgo</span>
                  <p className="text-xs text-fenix-warning mt-1">{signal.riskNote}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-fenix-text-muted font-semibold">Drivers</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {signal.drivers.map((d, i) => (
                      <span key={i} className="text-[10px] bg-fenix-card px-2 py-0.5 rounded text-fenix-text-secondary">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </DataPanel>
          ) : (
            <DataPanel title="Analisis AI" className="flex-1">
              <div className="flex items-center justify-center h-full text-fenix-text-muted text-xs">
                Sin senal activa para {symbol}
              </div>
            </DataPanel>
          )}

          {/* Order Panel */}
          <DataPanel title="Panel de Orden" subtitle="Simulado">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button className="py-2 rounded bg-fenix-bullish/20 text-fenix-bullish text-xs font-semibold hover:bg-fenix-bullish/30 transition-colors cursor-pointer">
                  COMPRA
                </button>
                <button className="py-2 rounded bg-fenix-bearish/20 text-fenix-bearish text-xs font-semibold hover:bg-fenix-bearish/30 transition-colors cursor-pointer">
                  VENTA
                </button>
              </div>
              <div className="space-y-2">
                <InputField label="Cantidad" value="100" />
                <InputField label="Stop Loss" value={formatNumber(asset.price * 0.95)} />
                <InputField label="Take Profit" value={formatNumber(asset.price * 1.1)} />
              </div>
              <button className="w-full py-2 rounded bg-fenix-accent text-white text-xs font-semibold hover:bg-fenix-accent-hover transition-colors cursor-pointer">
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
      <label className="text-[10px] text-fenix-text-muted uppercase">{label}</label>
      <input
        type="text"
        defaultValue={value}
        className="w-full mt-0.5 bg-fenix-card border border-fenix-border rounded px-2 py-1.5 text-xs font-mono text-fenix-text outline-none focus:border-fenix-accent transition-colors"
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

    const candleSeries = chart.addCandlestickSeries({
      upColor: theme.chart.upColor,
      downColor: theme.chart.downColor,
      borderUpColor: theme.chart.upColor,
      borderDownColor: theme.chart.downColor,
      wickUpColor: theme.chart.upColor,
      wickDownColor: theme.chart.downColor,
    })

    const data = getOHLCForTimeframe(price, timeframe, 200, volatility)
    candleSeries.setData(data)

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    volumeSeries.setData(
      data.map((bar) => ({
        time: bar.time,
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
            className="absolute right-0 top-0 bottom-0 bg-fenix-bearish/8"
            style={{ width: `${(ask.size / maxSize) * 100}%` }}
          />
          <span className="text-fenix-bearish relative z-10">{formatNumber(ask.price)}</span>
          <span className="text-fenix-text-muted relative z-10">{ask.size}</span>
        </div>
      ))}
      <div className="py-1 text-center text-xs font-semibold text-fenix-text border-y border-fenix-border">
        ${formatNumber(price)}
      </div>
      {bids.map((bid, i) => (
        <div key={`b${i}`} className="flex items-center justify-between relative px-1 py-0.5">
          <div
            className="absolute left-0 top-0 bottom-0 bg-fenix-bullish/8"
            style={{ width: `${(bid.size / maxSize) * 100}%` }}
          />
          <span className="text-fenix-bullish relative z-10">{formatNumber(bid.price)}</span>
          <span className="text-fenix-text-muted relative z-10">{bid.size}</span>
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
            className={trade.side === 'buy' ? 'text-fenix-bullish' : 'text-fenix-bearish'}
          >
            {formatNumber(trade.price)}
          </span>
          <span className="text-fenix-text-muted">{trade.size}</span>
          <span className="text-fenix-text-muted">
            {trade.time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
        </div>
      ))}
    </div>
  )
}
