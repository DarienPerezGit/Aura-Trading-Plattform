import { DataPanel } from '@/components/shared/DataPanel'

export function SettingsPage() {
  return (
    <div className="h-full flex flex-col gap-3 p-3">
      <div className="panel p-3 shrink-0">
        <h1 className="text-lg font-bold text-aura-text">Configuracion</h1>
        <p className="text-xs text-aura-text-secondary mt-1">
          Preferencias de la terminal y conexiones de datos
        </p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3">
        <DataPanel title="General">
          <div className="space-y-3">
            <SettingRow label="Tema" value="Oscuro" />
            <SettingRow label="Idioma" value="Espanol" />
            <SettingRow label="Zona horaria" value="America/Buenos_Aires" />
            <SettingRow label="Formato numerico" value="$1,234.56" />
          </div>
        </DataPanel>

        <DataPanel title="Datos y Conexiones">
          <div className="space-y-3">
            <SettingRow label="OpenBB Hub" value="localhost:6900" status="conectado" />
            <SettingRow label="Binance (CCXT)" value="Publico" status="conectado" />
            <SettingRow label="Finnhub" value="API Key configurada" status="conectado" />
            <SettingRow label="Alpaca" value="Paper Trading" status="desconectado" />
            <SettingRow label="Redis" value="localhost:6379" status="conectado" />
          </div>
        </DataPanel>

        <DataPanel title="Trading">
          <div className="space-y-3">
            <SettingRow label="Modo" value="Paper Trading (simulado)" />
            <SettingRow label="Riesgo maximo por operacion" value="2%" />
            <SettingRow label="Stop loss por defecto" value="5%" />
            <SettingRow label="Take profit por defecto" value="10%" />
          </div>
        </DataPanel>

        <DataPanel title="AI / Agentes">
          <div className="space-y-3">
            <SettingRow label="Modelo" value="Claude Opus 4" />
            <SettingRow label="Agentes activos" value="3 / 4" />
            <SettingRow label="Auto-analisis" value="Activado" />
            <SettingRow label="Frecuencia de senales" value="Cada 15 min" />
          </div>
        </DataPanel>
      </div>
    </div>
  )
}

function SettingRow({ label, value, status }: { label: string; value: string; status?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-aura-border/30 last:border-0">
      <span className="text-xs text-aura-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-aura-text">{value}</span>
        {status && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded ${status === 'conectado' ? 'bg-aura-bullish/15 text-aura-bullish' : 'bg-aura-bearish/15 text-aura-bearish'}`}>
            {status}
          </span>
        )}
      </div>
    </div>
  )
}
