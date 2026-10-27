import http from 'k6/http';
import { sleep, check } from 'k6';

// PRUEBA DE CARGA: mezcla de lecturas y escrituras, como usuarios reales
export const options = {
  stages: [
    { duration: '20s', target: 20 },
    { duration: '40s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://node-app:3000';

export default function () {
  if (Math.random() < 0.7) {
    // 70% de las veces: listar tareas (lectura)
    const res = http.get(`${BASE_URL}/api/tasks`);
    check(res, { 'GET /api/tasks -> 200': (r) => r.status === 200 });
  } else {
    // 30% de las veces: crear una tarea nueva (escritura)
    const payload = JSON.stringify({ title: `Tarea de prueba ${Date.now()}` });
    const res = http.post(`${BASE_URL}/api/tasks`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, { 'POST /api/tasks -> 201': (r) => r.status === 201 });
  }
  sleep(1);
}
