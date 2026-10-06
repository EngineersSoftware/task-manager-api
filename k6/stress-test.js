import http from 'k6/http';
import { sleep, check } from 'k6';

// PRUEBA DE ESTRES: solo escrituras (lo mas pesado para Mongo:
// un insert + un count en cada peticion), subiendo por escalones.
export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '30s', target: 150 },
    { duration: '30s', target: 300 },
    { duration: '30s', target: 500 },
    { duration: '20s', target: 0 },
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://node-app:3000';

export default function () {
  // __VU identifica al usuario virtual actual: evita titulos duplicados entre VUs
  const payload = JSON.stringify({ title: `Carga VU${__VU} - ${Date.now()}` });
  const res = http.post(`${BASE_URL}/api/tasks`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'POST /api/tasks -> 201': (r) => r.status === 201 });

  sleep(0.3);
}
