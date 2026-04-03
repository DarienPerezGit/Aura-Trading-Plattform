# FENIX Frontend — Progreso de Implementacion

> Archivo de contexto para retomar el trabajo donde se dejo.
> Ultima actualizacion: 2026-04-02

---

## Estado General: FASE 1 — Core Identity (en progreso)

### Fases del Plan

| Fase | Estado | Descripcion |
|------|--------|-------------|
| **FASE 1** | EN PROGRESO | Core Identity (App Shell) |
| FASE 2 | PENDIENTE | Core Screens (Command Center, Asset Detail, AI Copilot, Portfolio) |
| FASE 3 | PENDIENTE | Intelligence Layers (Geo, News, Strategy) |
| FASE 4 | PENDIENTE | Complementarios (Login, Market Universe, Settings) |

---

## Detalle FASE 1 — Core Identity

- [x] Scaffold Vite + React + TypeScript
- [ ] Instalar dependencias (Tailwind, shadcn/ui, Zustand, TanStack, etc.)
- [ ] Configurar Tailwind + tema dark FENIX
- [ ] Crear archivos de config (theme.ts, constants.ts, routes.ts)
- [ ] Crear Zustand stores base (ui, market, workspace, portfolio, alerts, ai)
- [ ] Crear generadores de datos mock (precios, OHLC, eventos)
- [ ] App Shell: AppShell.tsx (layout master CSS Grid)
- [ ] App Shell: TopCommandBar.tsx
- [ ] App Shell: LeftNavRail.tsx
- [ ] App Shell: RightIntelRail.tsx
- [ ] App Shell: BottomConsole.tsx
- [ ] App Shell: CommandPalette.tsx (Ctrl+K)
- [ ] Componentes shared base (StatusBadge, PriceChange, MetricCard, etc.)

## Detalle FASE 2 — Core Screens

- [ ] Frame 2: Global Command Center (CommandCenterPage.tsx)
- [ ] Frame 4: Asset Detail Terminal (AssetDetailPage.tsx)
- [ ] Frame 5: AI Copilot Workspace (AICopilotPage.tsx)
- [ ] Frame 9: Portfolio / Risk (PortfolioPage.tsx)
- [ ] Componentes charts (Candlestick, Sparkline, Area, Heatmap, Donut)
- [ ] Componentes market (MarketCard, Watchlist, OrderBook, etc.)
- [ ] Componentes AI (AIChatPanel, AISignalCard, etc.)
- [ ] Componentes portfolio (PositionsTable, AllocationChart, etc.)

## Detalle FASE 3 — Intelligence Layers

- [ ] Frame 6: Geo-Intelligence (GeoIntelPage.tsx)
- [ ] Frame 7: News / Sentiment (NewsSentimentPage.tsx)
- [ ] Frame 8: Strategy Lab (StrategyLabPage.tsx)

## Detalle FASE 4 — Complementarios

- [ ] Frame 1: Login / Access Gateway (LoginPage.tsx)
- [ ] Frame 3: Market Universe (MarketUniversePage.tsx)
- [ ] Frame 10: Settings (SettingsPage.tsx)

---

## Decisiones Tomadas

- **Mapa Geo**: Mapbox GL JS (requiere API key gratuita de mapbox.com)
- **AI Copilot**: Mock con typing effect (sin API real)
- **Idioma UI**: Espanol
- **Tech Stack**: React 18 + TS + Vite + Tailwind v4 + shadcn/ui + Zustand
- **Charts**: TradingView Lightweight Charts + Recharts
- **Tablas**: TanStack Table

---

## Archivos Clave Creados

- `frontend/` — Proyecto Vite React TypeScript (scaffold base)

---

## Como Retomar

1. Abrir este archivo para ver el estado actual
2. Revisar el plan completo en: `.claude/plans/agile-marinating-octopus.md`
3. Continuar con el primer item `[ ]` pendiente de la fase actual
