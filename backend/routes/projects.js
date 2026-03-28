import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import store from '../store/index.js';

const router = Router();

// GET all projects (with computed stats)
router.get('/', (req, res) => {
  const projects = store.projects.map(p => {
    const logs = store.timelogs.filter(l => l.projectId === p.id);
    const totalMinutes = logs.reduce((sum, l) => sum + l.duration, 0);
    const billableMinutes = logs.filter(l => l.category === 'billable').reduce((sum, l) => sum + l.duration, 0);
    const totalHours = totalMinutes / 60;
    const billableHours = billableMinutes / 60;

    const totalValue = p.projectType === 'fixed' ? p.fixedPrice : (billableHours * (p.hourlyRate || 0));
    const effectiveRate = totalHours > 0 ? Math.round(totalValue / totalHours) : 0;
    const scopeCreep = p.estimatedHours > 0 ? Math.round(((totalHours - p.estimatedHours) / p.estimatedHours) * 100) : 0;

    let health = 'profitable';
    if (effectiveRate < p.minimumRate) health = 'loss';
    else if (effectiveRate < p.minimumRate * 1.3) health = 'risky';

    return { ...p, totalHours: Math.round(totalHours * 10) / 10, effectiveRate, scopeCreep, health, totalValue };
  });

  res.json(projects);
});

// GET single project
router.get('/:id', (req, res) => {
  const project = store.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const logs = store.timelogs.filter(l => l.projectId === project.id);
  const totalMinutes = logs.reduce((sum, l) => sum + l.duration, 0);
  const totalHours = totalMinutes / 60;

  const categoryBreakdown = {};
  ['billable', 'calls', 'revisions', 'admin', 'scope'].forEach(cat => {
    const mins = logs.filter(l => l.category === cat).reduce((sum, l) => sum + l.duration, 0);
    categoryBreakdown[cat] = Math.round(mins / 60 * 10) / 10;
  });

  const billableHours = categoryBreakdown.billable || 0;
  const nonBillableHours = totalHours - billableHours;
  const totalValue = project.projectType === 'fixed' ? project.fixedPrice : (billableHours * (project.hourlyRate || 0));
  const effectiveRate = totalHours > 0 ? Math.round(totalValue / totalHours) : 0;
  const hiddenLoss = Math.round(nonBillableHours * (project.minimumRate || store.settings.minimumRate));
  const scopeCreep = project.estimatedHours > 0 ? Math.round(((totalHours - project.estimatedHours) / project.estimatedHours) * 100) : 0;
  const nonBillablePercent = totalHours > 0 ? Math.round((nonBillableHours / totalHours) * 100) : 0;

  let health = 'profitable';
  if (effectiveRate < project.minimumRate) health = 'loss';
  else if (effectiveRate < project.minimumRate * 1.3) health = 'risky';

  res.json({
    ...project,
    totalHours: Math.round(totalHours * 10) / 10,
    billableHours: Math.round(billableHours * 10) / 10,
    nonBillableHours: Math.round(nonBillableHours * 10) / 10,
    nonBillablePercent,
    effectiveRate,
    hiddenLoss,
    scopeCreep,
    health,
    totalValue,
    categoryBreakdown,
    logs
  });
});

// POST create project
router.post('/', (req, res) => {
  const { name, clientName, projectType, fixedPrice, hourlyRate, estimatedHours, minimumRate } = req.body;

  if (!name || !clientName) {
    return res.status(400).json({ error: 'Name and client name are required' });
  }

  const project = {
    id: uuidv4(),
    name,
    clientName,
    projectType: projectType || 'fixed',
    fixedPrice: fixedPrice || null,
    hourlyRate: hourlyRate || null,
    estimatedHours: estimatedHours || 0,
    minimumRate: minimumRate || store.settings.minimumRate,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.projects.push(project);
  res.status(201).json(project);
});

// PUT update project
router.put('/:id', (req, res) => {
  const idx = store.projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });

  store.projects[idx] = {
    ...store.projects[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json(store.projects[idx]);
});

// DELETE project
router.delete('/:id', (req, res) => {
  const idx = store.projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });

  store.projects.splice(idx, 1);
  store.timelogs = store.timelogs.filter(l => l.projectId !== req.params.id);
  res.json({ success: true });
});

export { router as projectRoutes };
