import { AppShell } from '@/components/shell/AppShell'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useMarketData } from '@/hooks/use-market-data'
import { CommandCenterPage } from '@/pages/CommandCenterPage'
import { AssetDetailPage } from '@/pages/AssetDetailPage'
import { AICopilotPage } from '@/pages/AICopilotPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { GeoIntelPage } from '@/pages/GeoIntelPage'
import { NewsSentimentPage } from '@/pages/NewsSentimentPage'
import { StrategyLabPage } from '@/pages/StrategyLabPage'
import { MarketUniversePage } from '@/pages/MarketUniversePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { LoginPage } from '@/pages/LoginPage'

function AppContent() {
  const currentView = useWorkspaceStore((s) => s.currentView)

  // Initialize market data feed
  useMarketData()

  // Simple route matching
  if (currentView === '/login') return <LoginPage />

  const assetMatch = currentView.match(/^\/activo\/(.+)$/)

  return (
    <AppShell>
      {currentView === '/' && <CommandCenterPage />}
      {currentView === '/mercados' && <MarketUniversePage />}
      {assetMatch && <AssetDetailPage symbol={assetMatch[1]} />}
      {currentView === '/portafolio' && <PortfolioPage />}
      {currentView === '/estrategias' && <StrategyLabPage />}
      {currentView === '/senales' && <StrategyLabPage />}
      {currentView === '/geo' && <GeoIntelPage />}
      {currentView === '/noticias' && <NewsSentimentPage />}
      {currentView === '/ai' && <AICopilotPage />}
      {currentView === '/configuracion' && <SettingsPage />}
    </AppShell>
  )
}

export default function App() {
  return <AppContent />
}
