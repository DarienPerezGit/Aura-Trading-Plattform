1. PRINCIPIO RECTOR DEL PRODUCTO
La terminal no debe sentirse como una web común.
Debe sentirse como:
un sistema operativo financiero,
una cabina de mando,
una plataforma donde el usuario observa, interpreta y actúa.
Entonces la UX no se diseña como “home + páginas”, sino como:
workspace persistente,
módulos desacoplados,
paneles reordenables,
navegación por contexto,
alta densidad de información,
velocidad de lectura y decisión.
ADN visual y funcional
La terminal debe transmitir:
precisión,
inmediatez,
autoridad,
profundidad analítica,
sensación de infraestructura institucional.

2. ARQUITECTURA MADRE DE LA TERMINAL
Antes de hablar de frames, la terminal necesita una arquitectura base.
2.1 Estructura global
Toda la app debería poder organizarse así:
APP SHELL
├── Top Command Bar
├── Left Navigation Rail
├── Main Workspace
│   ├── Dynamic Frames / Views
│   ├── Dockable Panels
│   └── Overlay Modules
├── Right Intelligence Rail
└── Bottom Event / Activity Console
2.2 Componentes persistentes
Hay piezas que idealmente viven siempre en pantalla, aunque cambie el contenido central:
Top Command Bar
Es la barra superior de comando. No es decorativa. Es operativa.
Debe contener:
logo / nombre de la terminal,
buscador global,
selector de mercado,
selector de workspace,
reloj global,
estado de conexión,
alertas activas,
acceso al AI Copilot,
perfil / settings.
Left Navigation Rail
No es un sidebar tradicional. Es una barra de misión.
Debe contener accesos a:
Command Center
Markets
Assets
Portfolio
Strategies
Signals
Geo Intelligence
News / Sentiment
Screener
Risk
Settings
Right Intelligence Rail
Es un carril contextual.
Muestra:
insights automáticos,
alertas,
AI summaries,
noticias vinculadas al contexto actual,
comparables,
anomalías.
Bottom Activity Console
Una especie de terminal/log/event stream.
Muestra:
actividad reciente,
órdenes,
alerts,
system logs,
eventos de mercado,
acciones del usuario.

3. FRAMES MAESTROS DEL SOFTWARE
Acá está el corazón. Para una terminal seria, yo la estructuraría en 10 frames principales.
Login / Access Gateway
Global Command Center
Market Universe / Market Overview
Asset Detail Terminal
AI Copilot Workspace
Geo-Intelligence View
News / Sentiment Intelligence
Strategy Lab / Signal Engine
Portfolio / Positions / Risk
Settings / Data / Integrations
Ahora sí, detalle por detalle.

4. FRAME 1 — LOGIN / ACCESS GATEWAY
No es solo login. Es la puerta de entrada institucional.
Objetivo
Dar sensación de producto premium, seguro y de misión crítica.
Layout
Pantalla full dark, minimal, con branding fuerte y una preview del sistema detrás.
Módulos
A. Brand Block
logo
nombre del producto
tagline breve
subtítulo institucional
B. Access Form
email / username
password
MFA / código
botón “Access Terminal”
C. Quick Environment Select
demo environment
live environment
paper environment
D. Background Intelligence Layer
Visual sutil:
mapa global tenue,
grid financiero,
pequeños ticks/quotes,
pulsos de datos.
Estados
normal
cargando
error credenciales
reconexión
maintenance mode

5. FRAME 2 — GLOBAL COMMAND CENTER
Este es el frame más importante. La primera impresión.
Objetivo
Mostrar una vista macro de todo el sistema y permitir navegación inmediata hacia zonas críticas.
Estructura del frame
A. Top Command Bar
Elementos:
logo
terminal name
universal search
tabs de mercados: equities / crypto / forex / macro
market status
UTC/local time
notifications
AI button
B. Left Macro Panel — Market Pulse
Módulos:
1. Global Market Snapshot
Cards compactas con:
S&P 500
Nasdaq
DXY
BTC
ETH
Gold
Oil
VIX
Cada card:
valor
cambio diario
sparkline
estado: bullish / neutral / bearish
2. Watchlist
lista editable
agrupable por sector / mercado
color coding
quick open
3. Movers
top gainers
top losers
unusual volume
volatility spikes
C. Center Core — Global Visual Engine
Acá vive el “wow”.
Puede ser uno de estos dos enfoques:
globo 3D institucional,
mapa 2D/2.5D premium estilo command center.
Capas del globo/mapa
exchanges
capital flow
macro stress
volume concentration
asset activity
geopolitical layer
Interacciones
hover: KPIs resumidos
click nodo: abre panel contextual
zoom: global → región → país
drag: rotación
filters: asset class / timeframe / signal intensity
D. Right Intelligence Panel
1. AI Market Summary
Resumen corto:
“risk-on session”
“unusual activity in semis”
“crypto leading momentum”
2. Event Feed
earnings
macro releases
Fed / central banks
big moves
3. Alerts
price threshold
anomaly
news shock
strategy trigger
E. Bottom Activity Strip
Tabs:
market events
user actions
live logs
alerts history
execution events
Estados del frame
default macro mode
crypto mode
crisis mode
overnight mode
low-liquidity mode

6. FRAME 3 — MARKET UNIVERSE / MARKET OVERVIEW
Este frame sirve para explorar el mercado de manera amplia.
Objetivo
Permitir screening, comparación y descubrimiento.
Estructura
A. Filters Bar
market
region
sector
exchange
market cap
volatility
volume
performance
sentiment
AI score
B. Main Table / Grid
Una tabla densa, estilo terminal, muy Bloomberg.
Columnas:
symbol
asset name
last price
% change
volume
market cap
volatility
signal
sentiment
trend score
C. Mini Visual Panels
A la derecha o abajo:
sector heatmap
breadth indicators
correlation snapshot
regime indicator
D. Smart Ranking Module
Rankings por:
strongest momentum
highest mean reversion probability
biggest anomaly
most discussed
best AI conviction
Interacciones
click row → Asset Detail Terminal
compare selected assets
pin to watchlist
send to AI Copilot
open quick chart
Estados
dense table mode
cards mode
comparison mode
screener mode

7. FRAME 4 — ASSET DETAIL TERMINAL
Esta es la pantalla central de operación analítica. Probablemente la más importante después del Command Center.
Objetivo
Concentrar todo lo necesario para entender un activo y tomar acción.
Layout ideal
┌──────────────────────────────────────────────┐
│ Asset Header                                 │
├───────────────┬──────────────────────────────┤
│ Left Data     │ Main Chart Area              │
│ Panel         │                              │
├───────────────┼───────────────┬──────────────┤
│ Positions     │ AI Analysis   │ Order Panel  │
└───────────────┴───────────────┴──────────────┘
A. Asset Header
Debe contener:
nombre del activo
ticker
exchange
precio en tiempo real
cambio absoluto y %
market status
spread
day range
52-week range
volume
volatility badge
Botones:
add to watchlist
compare
open in AI
create alert
simulate trade
B. Main Chart Area
Este módulo tiene que sentirse premium.
Capas del gráfico
candlestick
line
area
Heikin Ashi opcional
Timeframes
1m
5m
15m
1h
4h
1D
1W
Indicadores
SMA / EMA
RSI
MACD
Volume
VWAP
Bollinger
support/resistance zones
Interacciones
zoom
pan
crosshair
OHLC tooltip
draw tools
event markers
add/remove overlays
Extra institucional
earnings markers
macro event markers
signal markers
trade entry/exit markers
C. Left Data Panel
1. Order Book
bids
asks
depth visualization
cumulative ladder
2. Trades Tape
last trades
size
aggressor
timestamp
3. Key Stats
beta
avg volume
ATR
implied volatility si aplica
sector
correlation cluster
D. AI Analysis Panel
Acá el sistema se diferencia.
Debe mostrar:
current signal: buy / sell / hold
confidence score
rationale
market regime
risk note
key drivers
Submódulos:
technical summary
sentiment summary
anomaly detection
pattern recognition
E. Order / Action Panel
Aunque sea demo o fake trading, visualmente debe existir.
Campos:
action: buy / sell
order type: market / limit / stop
quantity
leverage si aplica
stop loss
take profit
Botones:
simulate
paper trade
create alert instead
F. Positions / Exposure Panel
open position
average entry
unrealized P&L
risk exposure
max drawdown estimate
Estados
chart focus mode
execution mode
AI analysis expanded
comparison split view

8. FRAME 5 — AI COPILOT WORKSPACE
No un simple chat. Debe sentirse como un analista senior embebido en la terminal.
Objetivo
Permitir preguntar, interpretar y actuar sin salir de la plataforma.
Layout
A. Chat + Query Panel
input grande
prompts sugeridos
historial de preguntas
B. Analysis Canvas
Donde la IA responde con:
texto,
cards,
mini charts,
tablas,
acciones sugeridas.
C. Action Sidebar
open asset
compare symbols
generate watchlist
create alert
export summary
Casos de uso
“Analyze NVDA”
“Compare BTC vs ETH momentum”
“Show assets with strongest sentiment shift”
“Summarize market regime”
“Explain why this signal is bearish”
Tipos de respuesta
Respuesta corta
Resumen ejecutivo de 3–4 líneas.
Respuesta analítica
context
drivers
risk
possible scenarios
Respuesta accionable
signal
confidence
suggested watch items
linked modules
Estados
idle
generating
insight ready
action suggested
follow-up thread

9. FRAME 6 — GEO-INTELLIGENCE VIEW
Acá entramos más en ADN Palantir.
Objetivo
Ver mercados y actividad financiera con lógica espacial/geográfica.
Layout
A. Main Map / Globe
Opciones:
2D analytic map
3D globe
regional drilldown map
B. Layer Controls
volume
capital flow
macro stress
sentiment by geography
exchange activity
geopolitical relevance
C. Region Intelligence Panel
Al clickear un país/región:
market performance
major indices
capital movement
relevant assets
news intensity
sentiment score
risk level
D. Timeline Slider
Permite ver evolución temporal:
intraday
daily
weekly
event windows
Interacciones
hover country
select region cluster
compare geographies
turn layers on/off
animate flows
Estados
capital flow mode
risk map mode
sentiment map mode
regional comparison mode

10. FRAME 7 — NEWS / SENTIMENT INTELLIGENCE
Esto no debe ser una lista de noticias. Debe ser una consola de interpretación.
Objetivo
Transformar noticias, sentimiento y narrativa de mercado en contexto usable.
Layout
A. News Stream
Cards o lista institucional con:
headline
source
timestamp
impacted assets
sentiment tag
relevance score
B. Sentiment Dashboard
positive / neutral / negative ratio
trend over time
topic clusters
media intensity
C. Topic Intelligence
Clusters:
AI
semiconductors
energy
inflation
regulation
crypto ETFs
geopolitics
D. Asset Impact Mapping
Cuando clickeás una noticia:
activos afectados
expected impact
volatility risk
linked signals
Interacciones
filter by source
filter by asset
filter by tone
send to AI summary
create alert based on topic
Estados
live feed
topic cluster mode
asset-linked mode
sentiment heatmap mode

11. FRAME 8 — STRATEGY LAB / SIGNAL ENGINE
Esto es crítico si quieren impresionar como producto serio.
Objetivo
Mostrar que la terminal no solo observa; también genera hipótesis, señales y setups.
Layout
A. Strategy Catalog
momentum
mean reversion
breakout
volatility
sentiment-driven
AI composite
B. Signal Cards
Cada señal debe tener:
asset
strategy name
direction
confidence
timestamp
regime fit
expected risk
C. Backtest Snapshot
Aunque sea simplificado:
win rate
Sharpe
max drawdown
recent performance
D. Parameter Panel
timeframe
threshold
risk profile
filters
E. Opportunity Feed
Lista viva de setups detectados.
Interacciones
activate/deactivate strategy
inspect signal
open asset detail
send to portfolio watch
compare strategies
Estados
research mode
live signals mode
strategy compare mode
AI-generated strategy mode

12. FRAME 9 — PORTFOLIO / POSITIONS / RISK
Muy importante para dar realismo.
Objetivo
Visualizar exposición, rendimiento y riesgo.
Layout
A. Portfolio Header
total equity
daily P&L
total return
drawdown
risk score
B. Allocation View
by asset class
by sector
by geography
by strategy
C. Positions Table
Columnas:
symbol
qty
avg entry
current price
daily P&L
total P&L
risk contribution
D. Risk Module
VaR simplificado
correlation exposure
concentration risk
volatility exposure
E. Performance Chart
equity curve
drawdown chart
return comparison vs benchmark
Interacciones
close / reduce / simulate hedge
rebalance suggestions
AI portfolio review
Estados
portfolio overview
risk detail
attribution mode
benchmark compare

13. FRAME 10 — SETTINGS / DATA / INTEGRATIONS
No glamoroso, pero esencial.
Objetivo
Dar sensación de sistema robusto y configurable.
Secciones
A. User Preferences
theme
density
language
notifications
B. Workspace Preferences
layout presets
saved views
default panels
C. Data Connections
data sources
API status
feed health
refresh frequency
D. Alerts Settings
price alerts
signal alerts
news alerts
anomaly alerts
E. Access / Security
MFA
session logs
device access

14. MÓDULOS TRANSVERSALES QUE DEBEN EXISTIR EN TODA LA TERMINAL
Ahora salimos de pantallas y vamos a features universales.
A. Global Search
Debe ser potentísimo.
Puede buscar:
ticker
asset
sector
country
news topic
strategy
alert
Resultados:
quick open
preview card
suggested actions
B. Alerts Engine
Tipos:
price
volatility
volume anomaly
news event
AI signal
risk threshold
C. Workspace Management
save layout
restore layout
split view
multi-monitor mode conceptual
module pinning
D. Compare Mode
Muy Bloomberg.
Comparar:
asset vs asset
region vs region
strategy vs strategy
portfolio vs benchmark
E. Command Palette
Una paleta tipo Ctrl+K:
open asset
run screener
create alert
ask AI
jump to workspace

15. DISEÑO DE COMPONENTES CORE
Esto define el nivel Bloomberg/Palantir.
Cards
No deben verse como cards de SaaS común. Deben verse como paneles de consola.
Cada panel debe tener:
título corto,
subtítulo o timestamp,
action icons,
status badge,
contenido compacto.
Tables
Densas, elegantes, legibles.
Con:
sticky headers,
sorting,
hover states,
row selection,
compact / comfortable mode.
Charts
Muy limpios, profesionales, oscuros.
Con:
overlays,
crosshair,
legend contextual,
toggles por capa.
Tags / Badges
Para:
bullish / bearish
high risk
live
delayed
AI generated
anomaly
Drawers / Side Panels
Fundamentales para drilldown rápido sin perder contexto.

16. ESTADOS QUE TODO FRAME DEBE CONTEMPLAR
Para que el producto se vea real, cada módulo necesita estados.
Base
loading
empty
populated
error
reconnecting
Analíticos
no signal detected
signal weak
anomaly detected
data stale
market closed
UX
hover
focused
selected
pinned
expanded
compared

17. QUÉ NECESITA BACKEND PARA SOPORTAR ESTA VISIÓN
Aunque hoy quieras solo frontend, el backend necesita entender la promesa visual.
Para market modules
prices
% change
volume
OHLC
market status
Para AI modules
signal
confidence
explanation
tags
related assets
Para geo modules
region metrics
flow values
event density
sentiment by geography
Para news modules
title
source
timestamp
relevance
sentiment
linked assets
Para portfolio
positions
pnl
allocation
risk stats

18. ORDEN CORRECTO DE DISEÑO
No conviene diseñar todo junto. Conviene este orden:
Fase 1 — Core Identity
app shell
top bar
left nav
right intelligence rail
bottom activity console
Fase 2 — Core Screens
command center
asset detail
AI copilot
Fase 3 — Intelligence Layers
geo-intelligence
news/sentiment
strategy lab
Fase 4 — Portfolio & Settings
portfolio
risk
settings

19. MVP VISUAL REALISTA PARA 13 DÍAS
Con 13 días, no haría las 10 pantallas al mismo nivel.
Haría esto:
Nivel 1 — Deben quedar impecables
Global Command Center
Asset Detail Terminal
AI Copilot
Portfolio / Risk
Nivel 2 — Deben existir aunque sea más livianas
Geo-Intelligence
News / Sentiment
Strategy Lab
Nivel 3 — Pueden ser más simples
Settings
Login
Universe table

20. RECOMENDACIÓN ESTRATÉGICA
Tu gran ventaja no está en hacer “más features”.
Está en hacer que el sistema se sienta:
profundo,
coherente,
modular,
institucional,
listo para escalar.
Entonces el foco no debería ser “cuántas pantallas hacemos”, sino:
qué pantallas hacen que el jurado crea que esto podría convertirse en una plataforma real.

