import { create } from 'zustand'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  cards?: AICard[]
}

export interface AICard {
  type: 'signal' | 'summary' | 'comparison' | 'alert'
  title: string
  data: Record<string, unknown>
}

export interface AISignal {
  id: string
  symbol: string
  direction: 'compra' | 'venta' | 'mantener'
  confidence: number
  rationale: string
  regime: string
  riskNote: string
  drivers: string[]
  timestamp: Date
}

interface AIState {
  messages: AIMessage[]
  signals: AISignal[]
  isGenerating: boolean
  marketSummary: string
  addMessage: (msg: Omit<AIMessage, 'id' | 'timestamp'>) => void
  setSignals: (signals: AISignal[]) => void
  setIsGenerating: (gen: boolean) => void
  setMarketSummary: (summary: string) => void
  clearMessages: () => void
}

export const useAIStore = create<AIState>((set) => ({
  messages: [],
  signals: [],
  isGenerating: false,
  marketSummary: '',

  addMessage: (msg) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { ...msg, id: crypto.randomUUID(), timestamp: new Date() },
      ],
    })),
  setSignals: (signals) => set({ signals }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setMarketSummary: (marketSummary) => set({ marketSummary }),
  clearMessages: () => set({ messages: [] }),
}))
