const express = require('express');
const mongoose = require('mongoose');
const { register, httpRequestsTotal, httpRequestDuration } = require('./metrics');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017/taskmanager';

app.use(express.json());

// Middleware que mide cada peticion HTTP que entra (igual que en la clase de Prometheus)
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? `${req.baseUrl}${req.route.path}` : req.path;
    const labels = { method: req.method, route, status_code: res.statusCode };
    httpRequestsTotal.inc(labels);
    end(labels);
  });
  next();
});

// Health check: util para saber si la app Y su conexion a Mongo estan bien
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mongoConnected: mongoose.connection.readyState === 1 });
});

app.use('/api/tasks', tasksRouter);

// Endpoint que Prometheus va a scrapear
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  });
