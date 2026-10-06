const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { tasksTotalGauge, dbQueryDuration } = require('../metrics');

// Helper que envuelve cualquier operacion de Mongo y mide cuanto tarda
async function timedQuery(operation, fn) {
  const end = dbQueryDuration.startTimer({ operation });
  try {
    return await fn();
  } finally {
    end();
  }
}

// GET /api/tasks - listar todas las tareas
router.get('/', async (req, res) => {
  const tasks = await timedQuery('find', () => Task.find().sort({ createdAt: -1 }));
  res.json(tasks);
});

// POST /api/tasks - crear una tarea
router.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'El campo "title" es obligatorio' });
  }
  const task = await timedQuery('create', () => Task.create({ title }));
  const count = await timedQuery('count', () => Task.countDocuments());
  tasksTotalGauge.set(count);
  res.status(201).json(task);
});

// GET /api/tasks/:id - obtener una tarea puntual
router.get('/:id', async (req, res) => {
  const task = await timedQuery('findById', () => Task.findById(req.params.id));
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(task);
});

// PUT /api/tasks/:id - actualizar (ej. marcar como completada)
router.put('/:id', async (req, res) => {
  const task = await timedQuery('findByIdAndUpdate', () =>
    Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
  );
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(task);
});

// DELETE /api/tasks/:id - borrar
router.delete('/:id', async (req, res) => {
  const task = await timedQuery('findByIdAndDelete', () => Task.findByIdAndDelete(req.params.id));
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  const count = await timedQuery('count', () => Task.countDocuments());
  tasksTotalGauge.set(count);
  res.status(204).send();
});

module.exports = router;
