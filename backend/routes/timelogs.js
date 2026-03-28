import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import store from '../store/index.js';

const router = Router();

// GET logs for a project
router.get('/:projectId', (req, res) => {
  const logs = store.timelogs
    .filter(l => l.projectId === req.params.projectId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(logs);
});

// POST add time log
router.post('/', (req, res) => {
  const { projectId, category, duration, notes, startTime, endTime } = req.body;

  if (!projectId || !category || !duration) {
    return res.status(400).json({ error: 'projectId, category, and duration are required' });
  }

  const validCategories = ['billable', 'calls', 'revisions', 'admin', 'scope'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
  }

  const now = new Date().toISOString();
  const log = {
    id: uuidv4(),
    projectId,
    category,
    startTime: startTime || now,
    endTime: endTime || now,
    duration: Number(duration),
    notes: notes || '',
    createdAt: now
  };

  store.timelogs.push(log);
  res.status(201).json(log);
});

// DELETE time log
router.delete('/:id', (req, res) => {
  const idx = store.timelogs.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Time log not found' });

  store.timelogs.splice(idx, 1);
  res.json({ success: true });
});

export { router as timelogRoutes };
