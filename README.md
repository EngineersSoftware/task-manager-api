# Task Manager API — Proyecto final

Proyecto que junta todo lo visto en la tutoría: una API de tareas con MongoDB,
instrumentada con Prometheus, visualizable en Grafana, y sometida a pruebas
de carga/estrés con k6.

## Estructura

```
task-manager-api/
├── app/
│   ├── models/Task.js       # Esquema de Mongoose
│   ├── routes/tasks.js      # CRUD de tareas + medición de queries a Mongo
│   ├── metrics.js           # Definición de todas las métricas de Prometheus
│   ├── server.js            # Servidor Express, conexión a Mongo, middleware
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── prometheus/prometheus.yml
├── k6/
│   ├── load-test.js
│   └── stress-test.js
├── docker-compose.yml
└── README.md
```

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/health` | Estado de la app y de la conexión a Mongo |
| GET | `/api/tasks` | Lista todas las tareas |
| POST | `/api/tasks` | Crea una tarea (`{ "title": "..." }`) |
| GET | `/api/tasks/:id` | Obtiene una tarea |
| PUT | `/api/tasks/:id` | Actualiza una tarea |
| DELETE | `/api/tasks/:id` | Borra una tarea |
| GET | `/metrics` | Métricas en formato Prometheus |

## Levantarlo

```bash
docker compose up --build
```

| Servicio | URL |
|---|---|
| API | http://localhost:3000 |
| Métricas | http://localhost:3000/metrics |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin/admin) |

## Métricas nuevas respecto a la clase anterior

- `tasks_total` (**Gauge**): cuántas tareas existen ahora mismo. A diferencia de un Counter, puede subir y bajar.
- `db_query_duration_seconds` (**Histogram**, label `operation`): cuánto tarda cada tipo de query a Mongo (`find`, `create`, `count`, `findById`, etc). Útil para saber si el cuello de botella es la API o la base de datos.

Ideas de paneles en Grafana:
- `tasks_total` → gauge en vivo
- `rate(http_requests_total{route="/api/tasks"}[1m])` → tráfico del endpoint principal
- `histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m]))` por `operation` → qué operación de Mongo es la más lenta

## Pruebas con k6

```bash
docker network ls | grep monitoring

docker run --rm -i --network task-manager-api_monitoring \
  -v "$(pwd)/k6:/scripts" grafana/k6 run /scripts/load-test.js

docker run --rm -i --network task-manager-api_monitoring \
  -v "$(pwd)/k6:/scripts" grafana/k6 run /scripts/stress-test.js
```

`stress-test.js` solo crea tareas (POST), el camino más pesado para Mongo:
cada petición hace un `insert` y un `count`. Mientras corre, mira en Grafana
cómo evoluciona `tasks_total` y, sobre todo, el p95 de
`db_query_duration_seconds` — ahí vas a ver primero si quien se satura es
Node o es Mongo.
