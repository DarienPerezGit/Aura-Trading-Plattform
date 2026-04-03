export interface RegionData {
  id: string
  name: string
  lat: number
  lng: number
  marketPerformance: number
  volume: number
  sentiment: number // -1 to 1
  riskLevel: 'bajo' | 'medio' | 'alto'
  capitalFlow: number // positive = inflow
  majorIndices: { name: string; change: number }[]
  newsIntensity: number // 0-100
}

export const MOCK_REGIONS: RegionData[] = [
  {
    id: 'us', name: 'Estados Unidos', lat: 39.8, lng: -98.5,
    marketPerformance: 1.24, volume: 85e9, sentiment: 0.65,
    riskLevel: 'bajo', capitalFlow: 12.5e9,
    majorIndices: [
      { name: 'S&P 500', change: 0.85 },
      { name: 'Nasdaq', change: 1.42 },
      { name: 'Dow Jones', change: 0.32 },
    ],
    newsIntensity: 92,
  },
  {
    id: 'eu', name: 'Europa', lat: 50.1, lng: 9.2,
    marketPerformance: 0.45, volume: 35e9, sentiment: 0.25,
    riskLevel: 'medio', capitalFlow: -2.1e9,
    majorIndices: [
      { name: 'Euro Stoxx 50', change: 0.52 },
      { name: 'DAX', change: 0.68 },
      { name: 'FTSE 100', change: 0.15 },
    ],
    newsIntensity: 65,
  },
  {
    id: 'cn', name: 'China', lat: 35.8, lng: 104.1,
    marketPerformance: -0.82, volume: 42e9, sentiment: -0.35,
    riskLevel: 'alto', capitalFlow: -8.3e9,
    majorIndices: [
      { name: 'Shanghai Comp.', change: -0.95 },
      { name: 'Hang Seng', change: -1.20 },
      { name: 'CSI 300', change: -0.78 },
    ],
    newsIntensity: 78,
  },
  {
    id: 'jp', name: 'Japon', lat: 36.2, lng: 138.2,
    marketPerformance: 1.85, volume: 28e9, sentiment: 0.55,
    riskLevel: 'bajo', capitalFlow: 5.2e9,
    majorIndices: [
      { name: 'Nikkei 225', change: 1.92 },
      { name: 'TOPIX', change: 1.45 },
    ],
    newsIntensity: 55,
  },
  {
    id: 'latam', name: 'Latinoamerica', lat: -15.7, lng: -56.0,
    marketPerformance: 0.65, volume: 8e9, sentiment: 0.15,
    riskLevel: 'medio', capitalFlow: 1.8e9,
    majorIndices: [
      { name: 'Bovespa', change: 0.78 },
      { name: 'Merval', change: 2.15 },
      { name: 'IPC Mexico', change: 0.42 },
    ],
    newsIntensity: 42,
  },
  {
    id: 'me', name: 'Medio Oriente', lat: 29.3, lng: 47.5,
    marketPerformance: -0.35, volume: 5e9, sentiment: -0.45,
    riskLevel: 'alto', capitalFlow: -1.2e9,
    majorIndices: [
      { name: 'Tadawul', change: -0.42 },
      { name: 'ADX', change: 0.18 },
    ],
    newsIntensity: 85,
  },
  {
    id: 'in', name: 'India', lat: 20.6, lng: 78.9,
    marketPerformance: 0.92, volume: 15e9, sentiment: 0.48,
    riskLevel: 'bajo', capitalFlow: 3.5e9,
    majorIndices: [
      { name: 'SENSEX', change: 1.05 },
      { name: 'Nifty 50', change: 0.98 },
    ],
    newsIntensity: 48,
  },
]
