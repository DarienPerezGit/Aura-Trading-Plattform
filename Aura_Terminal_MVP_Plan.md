# Aura Terminal — Plan MVP
### Terminal de Información para Traders estilo Bloomberg
**Aura Investments · Departamento I+D · 2025**

---

## Visión del Producto

Una terminal de información financiera open source que reemplaza Bloomberg Terminal (~$20,000/año). El trader ve en una sola pantalla: precios en tiempo real (cripto + acciones US), gráficos de velas con indicadores técnicos, noticias y sentiment.

**Importante:** No es un sistema de ejecución de órdenes. Es una terminal de **visualización y análisis de datos** de mercado.

**Costo del MVP: $0/mes**

---

## Arquitectura — 3 Capas

```
[Fuentes de Datos]          [Backend FastAPI :8000]       [Frontend Dash :8050]

yfinance (via OpenBB)  ──► openbb_service.py             ◄── dcc.Interval (60s)
CCXT Binance público   ──► ccxt_service.py + poller(5s)  ◄── dcc.Interval (5s)
Finnhub REST/WS        ──► finnhub_service.py            ◄── dcc.Interval (30s)
                              ↓
                        cache_service.py (TTL)
                              ↓
                        REST API endpoints
                              ↓
                   ──────────────────────────────────► Browser
```

---

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Hub de datos | OpenBB SDK (`from openbb import obb`) | Normaliza múltiples fuentes, ya incluye yfinance |
| Backend | FastAPI + Uvicorn | Orquesta fuentes, maneja cache, expone REST |
| Scheduler | APScheduler | Polling de crypto cada 5s dentro del proceso FastAPI |
| Datos históricos stocks | yfinance via OpenBB | Sin key, sin límite, funciona desde el día 1 |
| Datos crypto | CCXT (Binance público) | Sin key para datos públicos, 100+ exchanges |
| Noticias + sentiment | Finnhub REST | Key gratuita en finnhub.io, 60 req/min, WebSocket |
| Indicadores técnicos | pandas-ta | Cálculo local sobre DataFrames, sin API extra |
| Cache | cachetools (TTLCache) | In-process, sin Redis, perfecto para MVP |
| Frontend | **Dash 2.x + Plotly** | Callbacks reactivos — no re-ejecuta todo como Streamlit |
| Tema visual | dash-bootstrap-components + CSS | Tema oscuro Bloomberg-like |

> **Por qué Dash y no Streamlit:** Streamlit re-ejecuta todo el script en cada interacción. Dash usa callbacks reactivos — actualiza solo el componente necesario. Crítico para una terminal con datos cada 5 segundos.

---

## Estructura del Proyecto

```
aura-terminal/
├── .env                          # API keys (en .gitignore)
├── .env.example                  # plantilla de keys
├── requirements.txt
│
├── backend/
│   ├── main.py                   # FastAPI app + fix asyncio Windows
│   ├── config.py                 # carga .env
│   ├── routers/
│   │   ├── equity.py             # GET /api/equity/ohlcv, /api/technicals
│   │   ├── crypto.py             # GET /api/crypto/ohlcv, /api/crypto/ticker
│   │   ├── news.py               # GET /api/news/latest, /api/news/sentiment
│   │   └── health.py             # GET /api/health — status de cada fuente
│   ├── services/
│   │   ├── openbb_service.py     # wrapper OpenBB SDK
│   │   ├── ccxt_service.py       # fetch_ohlcv() y fetch_ticker() Binance
│   │   ├── finnhub_service.py    # news, sentiment, quotes
│   │   └── cache_service.py      # TTLCache por tipo de dato
│   └── websocket/
│       └── crypto_poller.py      # APScheduler job cada 5s
│
├── frontend/
│   ├── app.py                    # Dash instance, layout, callbacks, dcc.Interval
│   ├── layouts/
│   │   ├── main_layout.py        # grid principal 3 columnas
│   │   └── header.py             # reloj en tiempo real + status pills de APIs
│   ├── components/
│   │   ├── candlestick_chart.py  # make_subplots: velas + volumen + RSI + MACD
│   │   ├── watchlist.py          # DataTable con colores rojo/verde
│   │   ├── news_feed.py          # lista scrollable de noticias
│   │   └── technicals_panel.py   # RSI niveles 30/70, MACD histograma
│   └── assets/
│       └── style.css             # tema oscuro: bg #0a0a0a, verde #00d4aa, rojo #ff4d4d
│
└── scripts/
    ├── start_all.py              # un comando levanta todo
    └── test_feeds.py             # smoke test de cada fuente
```

---

## Layout Visual de la Terminal

```
┌──────────────────────────────────────────────────────────────────────┐
│  AURA TERMINAL  │  04-02-2026 15:42:33  │  [● OpenBB  ● CCXT  ● FH] │
├──────────┬────────────────────────────────┬───────────────────────────┤
│          │                                │                           │
│WATCHLIST │    CANDLESTICK CHART           │    NEWS FEED              │
│ AAPL ▲   │  (OHLCV + Volume subplot)      │                           │
│ MSFT ▼   │                                │ ■ Fed mantiene...    2m   │
│ NVDA ▲   │                                │ ■ AAPL beats earn... 5m   │
│ BTC  ▲   │                                │ ■ BTC rompe 70k...   12m  │
│ ETH  ▼   ├────────────────────────────────│                           │
│          │    RSI (con niveles 30/70)      │ SENTIMENT AAPL:           │
│          │    MACD (histograma + señal)    │ ████░░░░  0.62  BULLISH ▲ │
└──────────┴────────────────────────────────┴───────────────────────────┘
```

---

## APIs — Orden de Conexión

| Día | API | Key necesaria | Qué habilita |
|-----|-----|:---:|-------------|
| 1 | yfinance via OpenBB SDK | No | OHLCV histórico de cualquier acción → chart de velas |
| 1 | CCXT Binance público | No | OHLCV y ticker de BTC/ETH → watchlist cripto |
| 2 | Finnhub REST | Sí (gratis) | Noticias, sentiment, quotes en tiempo real |
| 3 | pandas-ta | No (local) | RSI, MACD, Bollinger Bands calculados en backend |
| 4 | Finnhub WebSocket | Misma key | Trades en tiempo real (~100ms latencia) |

> Alpha Vantage: **ignorar para MVP** (25 calls/día inutilizable con cache razonable)
> Alpaca: **diferir para V2** (quotes acciones US con menor latencia que yfinance)

---

## Estrategia de Cache

```python
CACHE_CONFIG = {
    "quote":       TTLCache(maxsize=200, ttl=5),    # 5s   — quotes cambian rápido
    "ohlcv_intra": TTLCache(maxsize=50,  ttl=60),   # 1min — velas intradía
    "ohlcv_daily": TTLCache(maxsize=100, ttl=3600), # 1h   — histórico diario
    "news":        TTLCache(maxsize=20,  ttl=120),  # 2min — noticias
    "sentiment":   TTLCache(maxsize=100, ttl=300),  # 5min — sentiment
    "technicals":  TTLCache(maxsize=100, ttl=60),   # 1min — indicadores
}
```

---

## Requirements.txt

```
# Hub de datos
openbb>=4.0
openbb-yfinance

# Backend
fastapi>=0.110
uvicorn[standard]>=0.27
apscheduler>=3.10
pydantic>=2.5
python-dotenv>=1.0
cachetools>=5.3
httpx>=0.26

# Fuentes de datos
ccxt>=4.2
finnhub-python>=2.4
yfinance>=0.2

# Análisis técnico
pandas>=2.1
numpy>=1.26
pandas-ta>=0.3

# Frontend
dash>=2.16
dash-bootstrap-components>=1.5
plotly>=5.18

# Utilidades
websockets>=12.0
```

---

## .env.example

```bash
# Finnhub — gratis en finnhub.io
FINNHUB_API_KEY=

# Alpaca — para V2, gratis en alpaca.markets
ALPACA_API_KEY=
ALPACA_SECRET_KEY=
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# Config de la app
BACKEND_HOST=localhost
BACKEND_PORT=8000
FRONTEND_PORT=8050
LOG_LEVEL=INFO
```

---

## Fix Crítico para Windows 11

En `backend/main.py`, agregar al inicio para evitar errores de event loop:

```python
import asyncio, sys
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
```

---

## Plan de Implementación — 5 Días

### Día 1 — Chart de velas funcionando (2-3 horas)

**Objetivo:** Un chart de velas de AAPL corriendo en el browser.

1. Crear estructura de carpetas completa
2. Crear `requirements.txt` y `.env.example`
3. `pip install` todas las dependencias
4. `backend/services/openbb_service.py` — función `get_ohlcv(symbol, period, interval)`
5. `backend/routers/equity.py` — `GET /api/equity/ohlcv`
6. `backend/main.py` — FastAPI básico + fix asyncio Windows
7. `frontend/components/candlestick_chart.py` — Candlestick + volumen subplot
8. `frontend/app.py` — layout mínimo, `dcc.Interval` a 60s, callback al backend

**Resultado:** `http://localhost:8050` muestra chart de AAPL con velas diarias y volumen.

---

### Día 2 — Watchlist + Crypto (3-4 horas)

**Objetivo:** Panel izquierdo con precios actualizados cada 5 segundos.

1. `backend/services/ccxt_service.py` — `get_ticker()` y `get_ohlcv_crypto()`
2. `backend/services/cache_service.py` — TTLCache por tipo
3. `backend/websocket/crypto_poller.py` — APScheduler job cada 5s
4. `frontend/components/watchlist.py` — DataTable con colores condicionales (verde/rojo)
5. Dropdown selector de symbol → cambia el chart al hacer click

**Resultado:** Watchlist BTC/ETH/AAPL/MSFT actualizado cada 5s. Click en símbolo cambia el chart.

---

### Día 3 — Noticias + Sentiment (2-3 horas)

**Objetivo:** Panel derecho con noticias financieras en tiempo real.

1. Registrar API key gratuita en `finnhub.io` → agregar a `.env`
2. `backend/services/finnhub_service.py` — `get_news()`, `get_sentiment()`
3. `backend/routers/news.py`
4. `frontend/components/news_feed.py` — lista scrollable con timestamp y fuente
5. Badge de sentiment en watchlist (BULLISH / BEARISH / NEUTRAL)

**Resultado:** Feed de noticias financieras + indicador de sentiment por símbolo.

---

### Día 4 — Indicadores Técnicos (2-3 horas)

**Objetivo:** RSI y MACD como subplots debajo del chart principal.

1. `GET /api/technicals` en backend — calcula RSI, MACD, BB con pandas-ta sobre el OHLCV
2. `frontend/components/technicals_panel.py` — RSI (línea + niveles 30/70), MACD (histograma + señal)
3. `make_subplots(rows=3, ...)` en `candlestick_chart.py` para integrar todo en un solo chart

**Resultado:** Chart completo con velas + volumen + RSI + MACD en paneles separados.

---

### Día 5 — Polish Visual + Start Script (2-3 horas)

**Objetivo:** Terminal que se ve profesional desde el primer vistazo.

1. `frontend/assets/style.css` — tema oscuro completo
2. `frontend/layouts/header.py` — reloj en tiempo real + status pills por API
3. `backend/routers/health.py` — latencia de cada fuente
4. `scripts/start_all.py` — un solo comando levanta backend + frontend
5. `scripts/test_feeds.py` — smoke test de cada fuente de datos

**Resultado:** MVP completo y visualmente impactante.

---

## Comando de Inicio (un solo comando)

```bash
python scripts/start_all.py
# Lanza backend en :8000 + frontend en :8050
# Abre http://localhost:8050 automáticamente
```

---

## Verificación End-to-End

```bash
# 1. Smoke test de fuentes
python scripts/test_feeds.py

# 2. Status de APIs
curl http://localhost:8000/api/health

# 3. OHLCV de acciones
curl "http://localhost:8000/api/equity/ohlcv?symbol=AAPL&period=1y&interval=1d"

# 4. Ticker de crypto
curl "http://localhost:8000/api/crypto/ticker?symbols=BTC/USDT"

# 5. Browser
open http://localhost:8050
```

---

## Roadmap Post-MVP

### V1.1 — Semana 2-3
- Alpaca WebSocket para quotes de acciones US con menor latencia
- Market Overview: heatmap sectorial del S&P 500
- Múltiples layouts (1 chart, 4 charts, modo noticias)
- Guardar watchlist personalizado en SQLite

### V1.2 — Semana 4-6
- Alertas de precio (umbral configurable, notificación en pantalla)
- Autenticación básica (token JWT, un usuario)
- Export de datos a CSV desde el UI
- PostgreSQL para histórico de configuraciones

### V2.0 — Mes 2-3
- Capa ML: señales con scikit-learn (clasificación tendencia up/down)
- Integración con OpenBB Workspace como frontend alternativo
- Deploy en Docker (un solo `docker-compose up`)
- Multi-usuario con roles

---

## Costos

| Fase | Costo/mes |
|------|-----------|
| MVP completo (días 1-5) | **$0** |
| V1.1 con Alpaca premium | $99/mes |
| V2.0 con Polygon.io Starter | +$29/mes |
| Sistema completo profesional | $200–$400/mes |
| Bloomberg Terminal | ~$1,700/mes |

---

*Aura Investments · Departamento de Investigación y Desarrollo · 2025*
*Documento de uso interno — Plan elaborado con base en la Guía de Recursos Sistema Quant*
