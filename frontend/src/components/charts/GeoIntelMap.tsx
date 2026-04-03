import { useState, useMemo } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps'
import { cn } from '@/lib/utils'
import { MOCK_REGIONS, type RegionData } from '@/data/mock-geo'
import { MOCK_SIGNALS } from '@/data/mock-signals'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Map region IDs to approximate coordinates for markers
const REGION_MARKERS: { regionId: string; coords: [number, number]; signals: number; events: string[] }[] = [
  { regionId: 'us', coords: [-95, 38], signals: 4, events: ['NVDA earnings beat', 'Fed rate decision', 'BTC ETF inflows record'] },
  { regionId: 'eu', coords: [10, 50], signals: 1, events: ['ECB policy review', 'DAX at resistance'] },
  { regionId: 'cn', coords: [105, 35], signals: 1, events: ['PMI contraction', 'Capital outflows', 'Property sector stress'] },
  { regionId: 'jp', coords: [138, 36], signals: 1, events: ['Nikkei rally +1.9%', 'BOJ yield curve control'] },
  { regionId: 'latam', coords: [-55, -15], signals: 0, events: ['Merval +2.15%', 'BRL stabilizing'] },
  { regionId: 'me', coords: [45, 28], signals: 0, events: ['Geopolitical tension', 'Oil supply risk'] },
  { regionId: 'in', coords: [78, 22], signals: 1, events: ['SENSEX +1.05%', 'FDI inflows rising'] },
]

// Map ISO country codes to region IDs for coloring
const COUNTRY_TO_REGION: Record<string, string> = {
  '840': 'us', '124': 'us', // USA, Canada
  '076': 'latam', '032': 'latam', '484': 'latam', '152': 'latam', '170': 'latam', '604': 'latam', // Brazil, Argentina, Mexico, Chile, Colombia, Peru
  '826': 'eu', '276': 'eu', '250': 'eu', '380': 'eu', '724': 'eu', '528': 'eu', '756': 'eu', '040': 'eu', '056': 'eu', '620': 'eu', '372': 'eu', '752': 'eu', '578': 'eu', '208': 'eu', '246': 'eu', '616': 'eu', '203': 'eu', '642': 'eu', '300': 'eu', // EU countries
  '156': 'cn', '344': 'cn', '158': 'cn', // China, Hong Kong, Taiwan
  '392': 'jp', // Japan
  '356': 'in', // India
  '682': 'me', '784': 'me', '364': 'me', '368': 'me', '792': 'me', '376': 'me', '400': 'me', // Saudi, UAE, Iran, Iraq, Turkey, Israel, Jordan
  '036': 'jp', '410': 'jp', '702': 'jp', '360': 'jp', // Australia, Korea, Singapore, Indonesia (Asia-Pacific)
  '643': 'eu', '804': 'eu', // Russia, Ukraine
  '818': 'me', // Egypt
  '566': 'latam', '710': 'latam', // Nigeria, South Africa (approximate)
}

function getRegionColor(region: RegionData | undefined): string {
  if (!region) return 'rgba(255,255,255,0.03)'
  const { riskLevel, marketPerformance, sentiment } = region

  // Base intensity from performance
  const perfAbs = Math.min(Math.abs(marketPerformance), 3)
  const baseOpacity = 0.08 + (perfAbs / 3) * 0.25

  if (riskLevel === 'alto') {
    return `rgba(255, 59, 92, ${(baseOpacity + 0.05).toFixed(2)})`
  }
  if (marketPerformance >= 0 && sentiment >= 0) {
    return `rgba(0, 200, 83, ${baseOpacity.toFixed(2)})`
  }
  if (marketPerformance < 0) {
    return `rgba(255, 59, 92, ${baseOpacity.toFixed(2)})`
  }
  return `rgba(0, 209, 255, ${(baseOpacity * 0.6).toFixed(2)})`
}

function getMarkerSize(region: RegionData): number {
  const vol = region.volume / 1e9
  return Math.max(4, Math.min(14, 4 + vol / 10))
}

function getMarkerColor(region: RegionData): string {
  if (region.riskLevel === 'alto') return '#FF3B5C'
  if (region.marketPerformance >= 1) return '#00C853'
  if (region.marketPerformance >= 0) return '#00D1FF'
  return '#FFB020'
}

interface GeoIntelMapProps {
  onRegionClick?: (regionId: string) => void
  className?: string
}

export function GeoIntelMap({ onRegionClick, className }: GeoIntelMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const regionMap = useMemo(() => {
    const map = new Map<string, RegionData>()
    for (const r of MOCK_REGIONS) map.set(r.id, r)
    return map
  }, [])

  const hoveredData = hoveredRegion ? regionMap.get(hoveredRegion) : null
  const hoveredMarker = hoveredRegion ? REGION_MARKERS.find((m) => m.regionId === hoveredRegion) : null

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 140, center: [10, 25] }}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryId = geo.id as string
                const regionId = COUNTRY_TO_REGION[countryId]
                const region = regionId ? regionMap.get(regionId) : undefined
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getRegionColor(region)}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={0.4}
                    onMouseEnter={(e) => {
                      if (regionId) {
                        setHoveredRegion(regionId)
                        setTooltipPos({ x: e.clientX, y: e.clientY })
                      }
                    }}
                    onMouseMove={(e) => {
                      setTooltipPos({ x: e.clientX, y: e.clientY })
                    }}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() => {
                      if (regionId && onRegionClick) onRegionClick(regionId)
                    }}
                    style={{
                      default: { outline: 'none', cursor: regionId ? 'pointer' : 'default' },
                      hover: {
                        outline: 'none',
                        fill: region
                          ? `rgba(0, 209, 255, 0.25)`
                          : 'rgba(255,255,255,0.06)',
                        stroke: 'rgba(0, 209, 255, 0.4)',
                        strokeWidth: 0.8,
                      },
                      pressed: { outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>

          {/* Activity markers */}
          {REGION_MARKERS.map((marker) => {
            const region = regionMap.get(marker.regionId)
            if (!region) return null
            const size = getMarkerSize(region)
            const color = getMarkerColor(region)
            const isHovered = hoveredRegion === marker.regionId
            const signalCount = MOCK_SIGNALS.filter((s) => {
              if (marker.regionId === 'us') return ['NVDA', 'AAPL', 'TSLA', 'GLD', 'SPY', 'QQQ'].includes(s.symbol)
              if (marker.regionId === 'cn') return false
              if (marker.regionId === 'jp') return false
              return false
            }).length || marker.signals

            return (
              <Marker key={marker.regionId} coordinates={marker.coords}>
                {/* Pulse ring */}
                <circle
                  r={size + 4}
                  fill="none"
                  stroke={color}
                  strokeWidth={1}
                  opacity={0.3}
                  className="animate-ping"
                  style={{ animationDuration: '3s' }}
                />
                {/* Core dot */}
                <circle
                  r={size}
                  fill={color}
                  opacity={isHovered ? 0.9 : 0.7}
                  stroke={color}
                  strokeWidth={isHovered ? 2 : 0}
                  className="transition-all duration-200"
                />
                {/* Signal count */}
                {signalCount > 0 && (
                  <text
                    textAnchor="middle"
                    y={-size - 6}
                    className="text-[9px] font-bold fill-aura-text"
                    style={{ fontSize: '9px', fontWeight: 700, fill: color }}
                  >
                    {signalCount} signals
                  </text>
                )}
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Rich Tooltip */}
      {hoveredData && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}
        >
          <div className="glass-strong rounded-lg border border-aura-border p-3 min-w-[220px] shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-aura-text">{hoveredData.name}</span>
              <span
                className={cn(
                  'text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase',
                  hoveredData.riskLevel === 'alto' && 'bg-aura-bearish/20 text-aura-bearish',
                  hoveredData.riskLevel === 'medio' && 'bg-aura-warning/20 text-aura-warning',
                  hoveredData.riskLevel === 'bajo' && 'bg-aura-bullish/20 text-aura-bullish',
                )}
              >
                Riesgo {hoveredData.riskLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] mb-2">
              <div>
                <span className="text-aura-text-muted">Performance</span>
                <div className={cn('font-mono font-semibold', hoveredData.marketPerformance >= 0 ? 'text-aura-bullish' : 'text-aura-bearish')}>
                  {hoveredData.marketPerformance >= 0 ? '+' : ''}{hoveredData.marketPerformance.toFixed(2)}%
                </div>
              </div>
              <div>
                <span className="text-aura-text-muted">Sentimiento</span>
                <div className={cn('font-mono font-semibold', hoveredData.sentiment >= 0 ? 'text-aura-bullish' : 'text-aura-bearish')}>
                  {hoveredData.sentiment >= 0 ? '+' : ''}{hoveredData.sentiment.toFixed(2)}
                </div>
              </div>
              <div>
                <span className="text-aura-text-muted">Volumen</span>
                <div className="font-mono font-semibold text-aura-text">${(hoveredData.volume / 1e9).toFixed(0)}B</div>
              </div>
              <div>
                <span className="text-aura-text-muted">Capital Flow</span>
                <div className={cn('font-mono font-semibold', hoveredData.capitalFlow >= 0 ? 'text-aura-bullish' : 'text-aura-bearish')}>
                  {hoveredData.capitalFlow >= 0 ? '+' : ''}${(hoveredData.capitalFlow / 1e9).toFixed(1)}B
                </div>
              </div>
            </div>

            {/* Top Movers */}
            <div className="border-t border-aura-border/50 pt-1.5">
              <span className="text-[9px] text-aura-text-muted uppercase font-semibold">Indices</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {hoveredData.majorIndices.map((idx) => (
                  <span key={idx.name} className="text-[9px] bg-aura-card/80 px-1.5 py-0.5 rounded">
                    <span className="text-aura-text-secondary">{idx.name}</span>{' '}
                    <span className={idx.change >= 0 ? 'text-aura-bullish' : 'text-aura-bearish'}>
                      {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}%
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Events */}
            {hoveredMarker && hoveredMarker.events.length > 0 && (
              <div className="border-t border-aura-border/50 pt-1.5 mt-1.5">
                <span className="text-[9px] text-aura-text-muted uppercase font-semibold">Eventos</span>
                <div className="space-y-0.5 mt-0.5">
                  {hoveredMarker.events.slice(0, 3).map((evt, i) => (
                    <div key={i} className="text-[9px] text-aura-text-secondary flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-aura-accent shrink-0" />
                      {evt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 glass rounded px-2 py-1.5 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-aura-bullish" />
          <span className="text-[8px] text-aura-text-muted">Bullish</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-aura-accent" />
          <span className="text-[8px] text-aura-text-muted">Neutral</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-aura-bearish" />
          <span className="text-[8px] text-aura-text-muted">High Risk</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-aura-warning" />
          <span className="text-[8px] text-aura-text-muted">Warning</span>
        </div>
      </div>
    </div>
  )
}
