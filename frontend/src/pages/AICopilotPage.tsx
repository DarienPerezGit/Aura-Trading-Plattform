import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles, TrendingUp, BarChart3, Bell, FileText } from 'lucide-react'
import { useAIStore, type AIMessage } from '@/stores/ai-store'
import { DataPanel } from '@/components/shared/DataPanel'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { cn } from '@/lib/utils'
import { MOCK_SIGNALS } from '@/data/mock-signals'
import { fetchChat, type ChatMessage as APIChatMessage } from '@/lib/api'

const SUGGESTED_PROMPTS = [
  { text: 'Analiza NVDA', icon: TrendingUp },
  { text: 'Compara BTC vs ETH momentum', icon: BarChart3 },
  { text: 'Resumen del regimen de mercado', icon: Sparkles },
  { text: 'Activos con mayor cambio de sentimiento', icon: BarChart3 },
  { text: 'Por que esta senal es bajista en TSLA?', icon: Bot },
]

async function getAIResponse(query: string, history: APIChatMessage[]): Promise<string> {
  try {
    const res = await fetchChat(query, history)
    return res.response
  } catch (err) {
    console.error('Chat API error:', err)
    return `Error al conectar con el copiloto AI. Verifica que el backend esté corriendo y que ANTHROPIC_API_KEY esté configurada.\n\nError: ${err instanceof Error ? err.message : String(err)}`
  }
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

    // Construir historial para contexto conversacional
    const history: APIChatMessage[] = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const response = await getAIResponse(query, history)
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
