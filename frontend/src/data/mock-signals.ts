import type { AISignal } from '@/stores/ai-store'

export const MOCK_SIGNALS: AISignal[] = [
  {
    id: '1', symbol: 'NVDA', direction: 'compra', confidence: 87,
    rationale: 'Momentum fuerte con soporte en $850. Volumen institucional creciente. Earnings superaron estimaciones.',
    regime: 'Tendencia alcista', riskNote: 'RSI elevado (72), posible pullback corto plazo',
    drivers: ['Demanda AI acelerando', 'Data centers expandiendose', 'Guia positiva Q2'],
    timestamp: new Date(Date.now() - 600000),
  },
  {
    id: '2', symbol: 'BTC', direction: 'compra', confidence: 78,
    rationale: 'Breakout sobre $94K confirmado. Flujo institucional sostenido via ETFs. Halving effect en proceso.',
    regime: 'Acumulacion institucional', riskNote: 'Volatilidad historica alta, stop loss recomendado en $88K',
    drivers: ['ETF inflows record', 'Halving supply shock', 'Macro risk-on'],
    timestamp: new Date(Date.now() - 1200000),
  },
  {
    id: '3', symbol: 'TSLA', direction: 'venta', confidence: 65,
    rationale: 'Perdida de market share en EVs. Margenes comprimidos. Soporte en $165 en riesgo.',
    regime: 'Distribucion', riskNote: 'Potencial short squeeze si supera $180',
    drivers: ['Competencia BYD', 'Margenes decrecientes', 'Inventarios elevados'],
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: '4', symbol: 'ETH', direction: 'compra', confidence: 72,
    rationale: 'Acumulacion en rango $3,500-$3,700. ETH/BTC ratio mostrando base. Upgrade Dencun positivo.',
    regime: 'Consolidacion alcista', riskNote: 'Correlacion alta con BTC, riesgo sistematico',
    drivers: ['Layer 2 adoption', 'Staking yields', 'Institutional interest'],
    timestamp: new Date(Date.now() - 2400000),
  },
  {
    id: '5', symbol: 'GLD', direction: 'mantener', confidence: 55,
    rationale: 'Oro en rango lateral. Dependiente de decision de la Fed. Demanda de bancos centrales estable.',
    regime: 'Neutral', riskNote: 'Sensible a datos de inflacion esta semana',
    drivers: ['Fed policy uncertainty', 'Geopolitical hedge', 'Central bank buying'],
    timestamp: new Date(Date.now() - 3000000),
  },
  {
    id: '6', symbol: 'AAPL', direction: 'compra', confidence: 70,
    rationale: 'Alianza AI con OpenAI es catalizador. Soporte tecnico en $192. Buybacks sostenidos.',
    regime: 'Tendencia alcista moderada', riskNote: 'Valuacion elevada (P/E 31x)',
    drivers: ['AI integration iOS', 'Services growth', 'Share buybacks'],
    timestamp: new Date(Date.now() - 3600000),
  },
]

export const MOCK_AI_MARKET_SUMMARY = `**Sesion Risk-On** — Los mercados muestran apetito por riesgo con tech liderando. NVDA impulsa al Nasdaq tras earnings solidos. Crypto en modo rally con BTC acercandose a $100K.

**Drivers principales:**
- Earnings de semiconductores superando estimaciones
- Fed dovish: posible recorte en Q3
- Flujo institucional record hacia crypto ETFs

**Riesgos a monitorear:**
- RSI sobrecomprado en semiconductores (SOX > 75)
- Tension geopolitica en Medio Oriente
- Datos de inflacion el viernes

**Regimen:** Momentum alcista con volatilidad moderada.`
