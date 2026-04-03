import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles, TrendingUp, BarChart3, Bell, FileText } from 'lucide-react'
import { useAIStore, type AIMessage } from '@/stores/ai-store'
import { DataPanel } from '@/components/shared/DataPanel'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { cn } from '@/lib/utils'
import { MOCK_SIGNALS } from '@/data/mock-signals'
import { fetchMacroSignal, fetchMacroSnapshot, fetchMarketNews } from '@/lib/api'

const SUGGESTED_PROMPTS = [
  { text: 'Analiza NVDA', icon: TrendingUp },
  { text: 'Compara BTC vs ETH momentum', icon: BarChart3 },
  { text: 'Resumen del regimen de mercado', icon: Sparkles },
  { text: 'Activos con mayor cambio de sentimiento', icon: BarChart3 },
  { text: 'Por que esta senal es bajista en TSLA?', icon: Bot },
]

const AI_RESPONSES: Record<string, string> = {
  'analiza nvda': `**NVDA — Analisis Completo**

**Precio actual:** $885.20 | **Senal:** COMPRA (87% confianza)

**Analisis Tecnico:**
- Tendencia primaria: Alcista fuerte
- Soporte clave: $850 (EMA 20)
- Resistencia: $920 (maximo historico)
- RSI: 72 (sobrecompra leve, pero en tendencia fuerte es sostenible)
- MACD: Cruce alcista confirmado hace 3 sesiones

**Drivers Fundamentales:**
1. Earnings Q4 superaron estimaciones ($22.1B vs $20.4B est.)
2. Guia Q1 2026: $24B (por encima del consenso de $22.5B)
3. Demanda de chips AI sigue acelerando (GPU H100/H200)
4. Data center revenue +280% YoY

**Riesgo:** RSI elevado sugiere posible pullback de corto plazo (-3-5%). Stop recomendado: $838.

**Regimen:** Momentum alcista institucional. Mantener posicion larga.`,

  'compara btc vs eth momentum': `**Comparativa BTC vs ETH — Momentum**

| Metrica | BTC | ETH |
|---------|-----|-----|
| Precio | $95,420 | $3,680 |
| Cambio 7D | +8.2% | +5.4% |
| Cambio 30D | +22.1% | +18.7% |
| RSI (14) | 68 | 61 |
| Vol. relativo | 1.45x | 1.22x |
| Flujo neto ETF | +$2.4B/sem | +$420M/sem |
| Correlacion | — | 0.87 con BTC |

**Conclusion:** BTC lidera el momentum actual, impulsado por flujos institucionales via ETFs. ETH muestra momentum positivo pero rezagado. El ratio ETH/BTC esta en minimos de 6 meses — potencial de mean reversion favorable a ETH si el rally crypto se amplia.

**Recomendacion:** Sobreponderar BTC en el corto plazo. Acumular ETH para rotacion tardia del ciclo.`,

  'resumen del regimen de mercado': `**Regimen de Mercado Actual: RISK-ON**

**Caracteristicas:**
- Apetito por riesgo elevado
- Tech/Growth liderando
- Crypto en rally (BTC cerca de $100K)
- VIX contenido (~14.8)
- Spread de credito comprimido

**Macro Context:**
- Fed dovish: posible recorte Q3 2026
- Inflacion en tendencia bajista (CPI 2.8%)
- Empleo robusto (3.6% unemployment)
- China debil (headwind moderado)

**Sectores favorecidos:**
1. Semiconductores (+momentum, +earnings)
2. Crypto (+flujos institucionales)
3. Software/AI (+adopcion acelerando)

**Sectores en riesgo:**
1. Energia (demanda debil)
2. Real Estate (tasas altas)
3. Consumer Discretionary China-exposed

**Duracion estimada:** 4-8 semanas mientras la Fed mantenga postura dovish.`,
}

async function getAIResponse(query: string): Promise<string> {
  const normalized = query.toLowerCase().trim()

  // Try real API for regime/macro queries
  if (normalized.includes('regimen') || normalized.includes('macro') || normalized.includes('risk')) {
    try {
      const [signal, snapshot] = await Promise.all([
        fetchMacroSignal(),
        fetchMacroSnapshot().catch(() => null),
      ])
      const indicators = snapshot?.indicators
        .map((i) => `- **${i.name}** (${i.series_id}): ${i.value.toFixed(2)} ${i.unit} @ ${i.date}`)
        .join('\n') ?? 'Sin datos macro disponibles'

      return `**Regimen de Mercado Actual: ${signal.signal}** (confianza: ${(signal.confidence * 100).toFixed(0)}%)

${signal.reasoning}

**Factores clave:**
${signal.key_factors.map((f) => `- ${f}`).join('\n')}

**Indicadores Macro (FRED):**
${indicators}

**Snapshot:** ${signal.snapshot_date ?? 'N/A'}`
    } catch { /* fallback below */ }
  }

  // Try real API for news queries
  if (normalized.includes('noticias') || normalized.includes('sentimiento') || normalized.includes('news')) {
    try {
      const news = await fetchMarketNews()
      if (news.length > 0) {
        const top5 = news.slice(0, 5)
        return `**Ultimas Noticias del Mercado:**

${top5.map((n, i) => `${i + 1}. **${n.headline}** — ${n.source}
   _${n.summary}_
   Simbolos: ${n.symbols.join(', ') || 'General'}`).join('\n\n')}

Total de noticias recibidas: ${news.length}`
      }
    } catch { /* fallback */ }
  }

  // Static responses for specific queries
  for (const [key, response] of Object.entries(AI_RESPONSES)) {
    if (normalized.includes(key)) return response
  }

  return `He analizado tu consulta: "${query}".

**Resumen rapido:**
Basandome en los datos actuales del mercado y las senales de nuestro motor de analisis, puedo observar patrones relevantes. Para un analisis mas detallado, te sugiero especificar un activo o usar uno de los prompts sugeridos.

**Senales activas:** ${MOCK_SIGNALS.length} senales vigentes

Prueba preguntar algo mas especifico como "Analiza NVDA", "Resumen del regimen de mercado" o "Noticias del mercado".`
}

export function AICopilotPage() {
  const { messages, addMessage, isGenerating, setIsGenerating } = useAIStore()
  const { navigate } = useWorkspaceStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text?: string) => {
    const query = text ?? input
    if (!query.trim() || isGenerating) return

    addMessage({ role: 'user', content: query })
    setInput('')
    setIsGenerating(true)

    const response = await getAIResponse(query)
    addMessage({ role: 'assistant', content: response })
    setIsGenerating(false)
  }

  return (
    <div className="h-full flex gap-3 p-3">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-aura-ai-bg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-aura-ai" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-aura-text">FENIX AI Copilot</h2>
                  <p className="text-xs text-aura-text-secondary">
                    Tu analista senior embebido en la terminal
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 max-w-md w-full">
                {SUGGESTED_PROMPTS.map((prompt) => {
                  const Icon = prompt.icon
                  return (
                    <button
                      key={prompt.text}
                      onClick={() => handleSend(prompt.text)}
                      className="panel-card p-3 text-left hover:bg-aura-card-hover transition-all cursor-pointer group"
                    >
                      <Icon className="w-4 h-4 text-aura-ai mb-1.5 group-hover:text-aura-ai-hover" />
                      <span className="text-xs text-aura-text-secondary group-hover:text-aura-text">
                        {prompt.text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isGenerating && (
            <div className="flex items-start gap-3 px-4">
              <div className="w-7 h-7 rounded-lg bg-aura-ai-bg flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-aura-ai" />
              </div>
              <div className="panel-card p-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-aura-ai animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-aura-ai animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-aura-ai animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 panel p-3">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pregunta sobre mercados, activos, estrategias..."
              className="flex-1 bg-aura-card border border-aura-border rounded-lg px-4 py-2.5 text-sm text-aura-text placeholder:text-aura-text-muted outline-none focus:border-aura-ai transition-colors"
              disabled={isGenerating}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isGenerating}
              className="p-2.5 rounded-lg bg-aura-ai text-white hover:bg-aura-ai-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="w-56 flex flex-col gap-3 shrink-0">
        <DataPanel title="Acciones Rapidas">
          <div className="space-y-1.5">
            {[
              { label: 'Abrir activo', icon: TrendingUp, action: () => navigate('/activo/NVDA') },
              { label: 'Comparar simbolos', icon: BarChart3, action: () => {} },
              { label: 'Crear alerta', icon: Bell, action: () => {} },
              { label: 'Exportar resumen', icon: FileText, action: () => {} },
            ].map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs text-aura-text-secondary hover:text-aura-text hover:bg-aura-card transition-colors cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </DataPanel>

        <DataPanel title="Senales Activas" className="flex-1">
          <div className="space-y-2">
            {MOCK_SIGNALS.slice(0, 4).map((signal) => (
              <button
                key={signal.id}
                onClick={() => navigate(`/activo/${signal.symbol}`)}
                className="w-full panel-card p-2 text-left hover:bg-aura-card-hover transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-aura-text">{signal.symbol}</span>
                  <StatusBadge status={signal.direction} />
                </div>
                <div className="text-[10px] text-aura-text-muted">
                  Confianza: {signal.confidence}%
                </div>
              </button>
            ))}
          </div>
        </DataPanel>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex items-start gap-3 px-4', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
          isUser ? 'bg-aura-accent-bg' : 'bg-aura-ai-bg',
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-aura-accent" />
        ) : (
          <Bot className="w-4 h-4 text-aura-ai" />
        )}
      </div>
      <div
        className={cn(
          'max-w-[70%] rounded-lg p-3',
          isUser ? 'bg-aura-accent-bg' : 'panel-card',
        )}
      >
        <div className="text-xs text-aura-text leading-relaxed whitespace-pre-line">
          {message.content.split('**').map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="text-aura-text font-semibold">
                {part}
              </strong>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
