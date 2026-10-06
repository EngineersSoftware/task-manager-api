const client = require('prom-client');

// Registro propio: aqui se acumulan todas las metricas de esta app
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Counter: cuenta peticiones HTTP, solo puede subir
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Numero total de peticiones HTTP recibidas',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Histogram: distribucion de cuanto tardan las peticiones HTTP
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duracion de las peticiones HTTP en segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// Gauge: metrica de NEGOCIO, sube y baja segun cuantas tareas existen ahora
const tasksTotalGauge = new client.Gauge({
  name: 'tasks_total',
  help: 'Cantidad total de tareas almacenadas en este momento',
  registers: [register],
});

// Histogram: cuanto tardan especificamente las queries a MongoDB
const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duracion de las queries a MongoDB en segundos',
  labelNames: ['operation'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1],
  registers: [register],
});

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  tasksTotalGauge,
  dbQueryDuration,
};
