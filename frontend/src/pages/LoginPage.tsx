import { useState } from 'react'
import { useWorkspaceStore } from '@/stores/workspace-store'

export function LoginPage() {
  const { navigate } = useWorkspaceStore()
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      navigate('/')
    }, 800)
  }

  return (
    <div className="h-screen w-screen bg-fenix-bg flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-fenix-text tracking-tight">FENIX</h1>
          <p className="text-xs text-fenix-text-secondary mt-1">Aura Trading Terminal</p>
        </div>

        <div className="panel p-6 space-y-4">
          <div>
            <label className="text-[10px] text-fenix-text-muted uppercase font-semibold">Usuario</label>
            <input
              type="text"
              defaultValue="trader@aura.io"
              className="w-full mt-1 bg-fenix-card border border-fenix-border rounded-lg px-3 py-2 text-sm text-fenix-text outline-none focus:border-fenix-accent transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] text-fenix-text-muted uppercase font-semibold">Contrasena</label>
            <input
              type="password"
              defaultValue="••••••••"
              className="w-full mt-1 bg-fenix-card border border-fenix-border rounded-lg px-3 py-2 text-sm text-fenix-text outline-none focus:border-fenix-accent transition-colors"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-fenix-accent text-white text-sm font-semibold hover:bg-fenix-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Conectando...' : 'Iniciar Sesion'}
          </button>
        </div>

        <p className="text-center text-[10px] text-fenix-text-muted mt-4">
          Aura Investments · Terminal v0.1.0
        </p>
      </div>
    </div>
  )
}
