# Memory

## Objetivo de este archivo

Este archivo resume los ultimos cambios reales hechos en el proyecto, las decisiones que tomamos como equipo, por que se tomaron, que sigue roto o incompleto y que no deberia volver a tocarse sin entender el contexto.

La idea es evitar perder tiempo y tokens reparando otra vez los mismos problemas o reintroduciendo ruido en el sistema.

---

## Estado actual honesto

El proyecto ya no esta en estado de maqueta rota. Backend y frontend pueden correr, Alpaca responde con credenciales validas y Binance vuelve a entregar datos reales para crypto.

Pero todavia no es un sistema controlado ni production-ready.

Lo que esta bien ahora:

- Backend responde.
- Alpaca funciona para quotes y batch quotes.
- Historical bars de acciones ya funcionan despues del fix en `alpaca_client.py`.
- Binance vuelve a responder para ticker, OHLCV y order book despues del fix en `ccxt_client.py`.
- Se optimizo el cliente crypto para no pagar `load_markets()` en cada request.
- Binance ahora se precalienta al arrancar el backend para evitar el primer request lento.
- Varias vistas del frontend dejaron de inventar noticias, senales o resumenes AI cuando una API falla.

Lo que sigue mal o incompleto:

- Redis sigue caido, asi que el cache esta deshabilitado.
- `frontend/src/hooks/use-market-data.ts` sigue siendo el punto principal donde todavia puede mezclarse comportamiento real con comportamiento mock.
- Portfolio, Strategy Lab, Geo Intel y Bottom Console siguen teniendo dependencia fuerte de mocks o datos sinteticos.
- No hay smoke tests suficientes para evitar regresiones.
- Hay deuda de configuracion frontend (`baseUrl` deprecado en TypeScript).

---

## Decisiones tomadas

### 1. No seguir ocultando fallas de APIs con mocks

Decision:

- Cuando una API falle, la UI debe mostrar `No disponible`, `Sin datos` o `Cargando`, no datos inventados.

Motivo:

- Los mocks agregaban ruido y hacian que el producto pareciera funcional cuando en realidad estaba degradado o roto.
- Eso dificulta depuracion, validacion y demo honesta.

Impacto:

- Las pantallas principales dejaron de mentir.
- Algunas secciones pueden verse mas vacias, pero ahora reflejan el estado real del sistema.

### 2. Mantener modulos visibles pero con estado `No disponible`

Decision:

- No ocultar modulos todavia; dejarlos visibles pero honestos cuando no exista backend real.

Motivo:

- Evita romper navegacion.
- Evita maquillar funcionalidad inexistente.
- Permite a los 6 integrantes ver claramente que falta implementar.

### 3. Arreglar primero la fuente real de datos antes de retocar UI

Decision:

- Se priorizo corregir Alpaca y Binance antes de seguir “decorando” pantallas.

Motivo:

- Si los proveedores no responden bien, cualquier ajuste visual termina apoyandose otra vez en fallback o ruido.

### 4. Reutilizar Binance compartido y precalentarlo

Decision:

- No reconstruir un cliente de Binance en cada request.
- Reutilizar un exchange compartido con mercados cacheados.
- Cargar Binance en startup del backend.

Motivo:

- Antes el primer request a crypto pagaba una carga absurda de latencia por `exchangeInfo/load_markets`.
- Eso congelaba la UI y hacia parecer que los datos no se movian.

---

## Lo que se arreglo hasta ahora

### Backend

#### 1. Alpaca credentials validadas

Resultado:

- Las keys nuevas de Alpaca son validas.
- Se verifico contra `paper-api.alpaca.markets/v2/account`.

#### 2. Fix en `aura_terminal/data_pipeline/alpaca_client.py`

Problema anterior:

- `get_stock_bars()` devolvia error o resultados vacios.

Que se hizo:

- Se agrego ventana temporal (`start`) por timeframe.
- Se forzo `feed=IEX` para la cuenta actual.
- Se corrigio la extraccion de barras desde la respuesta de Alpaca.

Resultado:

- El endpoint de historical bars para acciones ahora responde con velas reales.

#### 3. Fix funcional en `aura_terminal/data_pipeline/ccxt_client.py`

Problema anterior:

- `ccxt.async_support` fallaba al cargar mercados de Binance con `ExchangeNotAvailable`.

Que se hizo:

- Se abandono el camino async inestable.
- Se migro a cliente sincronico de `ccxt` envuelto con `asyncio.to_thread`.

Resultado:

- Binance vuelve a responder para ticker, OHLCV, order book y trades.

#### 4. Optimizacion del cliente crypto

Problema anterior:

- Cada request reconstruia Binance y volvia a cargar mercados.

Que se hizo:

- Singleton compartido de exchange.
- Mercados cacheados en memoria.
- Lock para evitar acceso concurrente inseguro.

Resultado:

- Requests calientes a ticker/order book bajaron drasticamente.

#### 5. Warm-up de Binance en startup

Archivo:

- `aura_terminal/main.py`

Que se hizo:

- Se agrego warm-up del exchange crypto durante el `lifespan` de FastAPI.

Resultado:

- El primer usuario ya no paga la carga inicial de Binance.

### Frontend

#### 6. Fix de congelamiento parcial en market data

Archivo:

- `frontend/src/hooks/use-market-data.ts`

Problema anterior:

- Si stocks o indices cargaban bien, el fallback se desactivaba para todos los simbolos, incluso crypto.
- Eso dejaba assets congelados o con valores viejos.

Que se hizo:

- El comportamiento se separo por simbolo en lugar de ser global.

Nota:

- Este archivo sigue pendiente de limpieza completa para pasar a API-only real.

#### 7. Se removieron varios mocks visibles de la UI

Archivos tocados:

- `frontend/src/pages/NewsSentimentPage.tsx`
- `frontend/src/components/shell/RightIntelRail.tsx`
- `frontend/src/pages/CommandCenterPage.tsx`
- `frontend/src/pages/AICopilotPage.tsx`
- `frontend/src/pages/AssetDetailPage.tsx`

Que se saco:

- `MOCK_NEWS`
- `MOCK_AI_MARKET_SUMMARY`
- `MOCK_SIGNALS` en widgets principales
- fallback mock de order book/trades en detalle de activo
- fallback de velas sinteticas en detalle de activo

Comportamiento nuevo:

- Si no hay datos reales, se muestra `No disponible`, `Sin datos` o `Cargando`.

---

## Archivos modificados en esta etapa

- `aura_terminal/data_pipeline/alpaca_client.py`
- `aura_terminal/data_pipeline/ccxt_client.py`
- `aura_terminal/main.py`
- `frontend/src/hooks/use-market-data.ts`
- `frontend/src/pages/NewsSentimentPage.tsx`
- `frontend/src/components/shell/RightIntelRail.tsx`
- `frontend/src/pages/CommandCenterPage.tsx`
- `frontend/src/pages/AICopilotPage.tsx`
- `frontend/src/pages/AssetDetailPage.tsx`

Archivos no trackeados ahora mismo:

- `logs/`
- `tareas.md`

---

## Lo que falta por arreglar

### Prioridad alta

#### 1. Limpiar `frontend/src/hooks/use-market-data.ts`

Esto es lo mas importante que falta en frontend.

Objetivo:

- dejar de inicializar precios con generadores mock
- dejar de sintetizar ticks
- poblar store solo desde APIs reales
- marcar simbolos sin datos como no disponibles

#### 2. Definir que hacer con pantallas aun mock-first

Pendientes fuertes:

- `PortfolioPage`
- `StrategyLabPage`
- `GeoIntelPage` / `GeoIntelMap`
- `BottomConsole`

La decision actual del equipo es:

- dejarlas visibles, pero con estado `No disponible` si no hay backend real.

#### 3. Levantar Redis

Hoy el sistema esta corriendo sin cache.

Impacto:

- peores tiempos de respuesta
- mas llamadas a proveedores externos
- mas variabilidad en UI

#### 4. Agregar smoke tests reales

Minimo cubrir:

- `/health`
- `/market/quote/{symbol}`
- `/market/bars/{symbol}`
- `/market/crypto/ticker/{symbol}`
- `/market/crypto/ohlcv/{symbol}`
- `/market/news`

### Prioridad media

#### 5. Corregir deuda TypeScript

Hay warning real por `baseUrl` deprecado en `frontend/tsconfig.app.json`.

#### 6. Revisar timeouts y manejo de errores por proveedor

Hoy hay mejoras, pero sigue faltando una politica clara de:

- timeout
- retry
- cache hit/miss
- error observable por proveedor

---

## Reglas para no volver a romper esto

1. No reintroducir mocks silenciosos cuando falle una API.
2. No usar `.catch(() => {})` para dejar basura previa en pantalla.
3. No mezclar fixes de backend, data provider y UI en un mismo commit si se puede evitar.
4. No tocar `ccxt_client.py` sin volver a medir latencia fria y caliente.
5. No tocar `alpaca_client.py` sin volver a probar quotes y bars reales.
6. Si una feature no tiene backend real, mostrar `No disponible` en vez de fabricar datos.
7. Antes de mergear, probar al menos un flujo stock y un flujo crypto end-to-end.

---

## Siguiente orden recomendado de trabajo

1. Limpiar `use-market-data.ts` y pasar market store a API-only.
2. Marcar `PortfolioPage`, `StrategyLabPage`, `GeoIntelPage` y `BottomConsole` como `No disponible` donde corresponda.
3. Levantar Redis y validar cache.
4. Agregar smoke tests backend.
5. Recién despues eliminar archivos mock/generators que queden muertos.

---

## Nota para el equipo

Si alguien ve una pantalla vacia o con `No disponible`, no significa que “se rompio”.

En muchos casos significa que justamente se dejo de mentir con mocks y ahora falta backend real o manejo de estado mas claro.

No arreglar eso metiendo otra vez datos fake.