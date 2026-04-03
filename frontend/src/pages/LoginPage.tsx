import { useState } from 'react'
import { useWorkspaceStore } from '@/stores/workspace-store'

type Environment = 'LIVE' | 'PAPER' | 'DEMO'

export function LoginPage() {
  const { navigate } = useWorkspaceStore()
  const [loading, setLoading] = useState(false)
  const [env, setEnv] = useState<Environment>('DEMO')

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      navigate('/')
    }, 1200)
  }

  return (
    <div className="h-screen w-screen bg-aura-bg relative overflow-hidden flex items-center justify-center">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,209,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          animation: 'gridDrift 20s linear infinite',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 600px 400px at 50% 45%, rgba(0,209,255,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Glass panel */}
      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-xl border border-aura-border-light p-8"
          style={{
            background: 'rgba(17, 21, 24, 0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow:
              '0 0 80px rgba(0,209,255,0.04), 0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Brand block */}
          <div className="text-center mb-8">
            <div className="mb-3">
              <h1
                className="text-5xl font-bold tracking-[0.25em] text-aura-text"
                style={{ textShadow: '0 0 40px rgba(0,209,255,0.15)' }}
              >
                ATLAS
              </h1>
              <div className="flex items-center justify-center gap-3 mt-1">
                <span className="h-px w-8 bg-aura-accent/30" />
                <span className="text-[11px] font-semibold tracking-[0.35em] text-aura-accent uppercase">
                  Terminal
                </span>
                <span className="h-px w-8 bg-aura-accent/30" />
              </div>
            </div>
            <p className="text-[11px] text-aura-text-muted tracking-wide">
              Institutional Trading Intelligence
            </p>
          </div>

          {/* Environment selector */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {(['LIVE', 'PAPER', 'DEMO'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setEnv(option)}
                className={`
                  px-4 py-1.5 rounded text-[10px] font-bold tracking-wider
                  transition-all duration-200 cursor-pointer
                  ${
                    env === option
                      ? option === 'LIVE'
                        ? 'bg-aura-bearish/15 text-aura-bearish border border-aura-bearish/30'
                        : option === 'PAPER'
                          ? 'bg-aura-warning/15 text-aura-warning border border-aura-warning/30'
                          : 'bg-aura-accent/15 text-aura-accent border border-aura-accent/30'
                      : 'bg-transparent text-aura-text-muted border border-aura-border hover:border-aura-border-light hover:text-aura-text-secondary'
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] text-aura-text-muted uppercase font-semibold tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                defaultValue="trader@aura.io"
                className="w-full bg-aura-bg/60 border border-aura-border rounded-lg px-3.5 py-2.5 text-sm text-aura-text font-mono outline-none focus:border-aura-accent/50 placeholder:text-aura-text-muted transition-colors"
                placeholder="user@institution.com"
              />
            </div>

            <div>
              <label className="block text-[9px] text-aura-text-muted uppercase font-semibold tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                defaultValue="terminal2026"
                className="w-full bg-aura-bg/60 border border-aura-border rounded-lg px-3.5 py-2.5 text-sm text-aura-text font-mono outline-none focus:border-aura-accent/50 placeholder:text-aura-text-muted transition-colors"
                placeholder="Enter credentials"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className={`
                w-full py-3 rounded-lg text-sm font-bold tracking-wider
                transition-all duration-300 cursor-pointer relative overflow-hidden
                ${
                  loading
                    ? 'bg-aura-accent/20 text-aura-accent border border-aura-accent/30'
                    : 'bg-aura-accent text-aura-bg hover:shadow-[0_0_24px_rgba(0,209,255,0.25)] active:scale-[0.98]'
                }
                disabled:cursor-not-allowed
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-3.5 h-3.5 border-2 border-aura-accent/30 border-t-aura-accent rounded-full"
                    style={{ animation: 'spin 0.8s linear infinite' }}
                  />
                  Authenticating...
                </span>
              ) : (
                'Access Terminal'
              )}
            </button>
          </div>

          {/* Security indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <span className="w-1.5 h-1.5 rounded-full bg-aura-bullish animate-pulse" />
            <span className="text-[9px] text-aura-text-muted tracking-wide">
              {env === 'LIVE' ? 'PRODUCTION' : env === 'PAPER' ? 'PAPER TRADING' : 'DEMO'} ENVIRONMENT
              {' '}&middot; TLS 1.3 &middot; E2E ENCRYPTED
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-aura-text-muted mt-6 tracking-wide">
          Aura Investments &middot; Departamento I+D &middot; 2026
        </p>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes gridDrift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
