import { Router } from 'express';
import store from '../store/index.js';

const router = Router();

router.get('/dashboard', (req, res) => {
  const { projects, timelogs, settings } = store;
  const totalMinutes = timelogs.reduce((sum, l) => sum + l.duration, 0);
  const totalHours = totalMinutes / 60;
  const billableMinutes = timelogs.filter(l => l.category === 'billable').reduce((sum, l) => sum + l.duration, 0);
  const billableHours = billableMinutes / 60;
  const nonBillableHours = totalHours - billableHours;

  let totalValue = 0;
  projects.forEach(p => {
    const pLogs = timelogs.filter(l => l.projectId === p.id);
    const pBillable = pLogs.filter(l => l.category === 'billable').reduce((sum, l) => sum + l.duration, 0) / 60;
    totalValue += p.projectType === 'fixed' ? (p.fixedPrice || 0) : (pBillable * (p.hourlyRate || 0));
  });

  const effectiveRate = totalHours > 0 ? Math.round(totalValue / totalHours) : 0;
  const hiddenLoss = Math.round(nonBillableHours * settings.minimumRate);
  const nonBillablePercent = totalHours > 0 ? Math.round((nonBillableHours / totalHours) * 100) : 0;

  let riskLevel = 'Low';
  if (effectiveRate < settings.minimumRate) riskLevel = 'High';
  else if (effectiveRate < settings.minimumRate * 1.3) riskLevel = 'Medium';

  const lossBreakdown = {};
  ['revisions', 'calls', 'admin', 'scope'].forEach(cat => {
    const mins = timelogs.filter(l => l.category === cat).reduce((sum, l) => sum + l.duration, 0);
    const hrs = mins / 60;
    lossBreakdown[cat] = { hours: Math.round(hrs * 10) / 10, loss: Math.round(hrs * settings.minimumRate) };
  });

  const earningsTrend = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(); date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayLogs = timelogs.filter(l => l.createdAt.split('T')[0] === dateStr);
    const dayMinutes = dayLogs.reduce((sum, l) => sum + l.duration, 0);
    const dayBillable = dayLogs.filter(l => l.category === 'billable').reduce((sum, l) => sum + l.duration, 0);
    earningsTrend.push({
      date: dateStr,
      hours: Math.round(dayMinutes / 60 * 10) / 10,
      billableHours: Math.round(dayBillable / 60 * 10) / 10,
      nonBillableHours: Math.round((dayMinutes - dayBillable) / 60 * 10) / 10
    });
  }

  const alerts = [];
  if (effectiveRate < settings.minimumRate) {
    alerts.push({ type: 'danger', message: `Effective rate (${settings.currency}${effectiveRate}/hr) is below minimum (${settings.currency}${settings.minimumRate}/hr)` });
  }
  const revisionHours = lossBreakdown.revisions?.hours || 0;
  const revisionPercent = totalHours > 0 ? Math.round((revisionHours / totalHours) * 100) : 0;
  if (revisionPercent > 20) {
    alerts.push({ type: 'warning', message: `${revisionPercent}% of time spent on revisions` });
  }
  if (nonBillablePercent > 40) {
    alerts.push({ type: 'danger', message: `${nonBillablePercent}% of work is non-billable` });
  }
  projects.filter(p => p.status === 'active').forEach(p => {
    const pLogs = timelogs.filter(l => l.projectId === p.id);
    const pHours = pLogs.reduce((sum, l) => sum + l.duration, 0) / 60;
    if (p.estimatedHours > 0 && pHours > p.estimatedHours * 1.1) {
      const creep = Math.round(((pHours - p.estimatedHours) / p.estimatedHours) * 100);
      alerts.push({ type: 'warning', message: `"${p.name}" has ${creep}% scope creep` });
    }
  });

  res.json({
    kpis: { effectiveRate, hiddenLoss, totalHours: Math.round(totalHours * 10) / 10, riskLevel, totalValue: Math.round(totalValue), nonBillablePercent, activeProjects: projects.filter(p => p.status === 'active').length, totalProjects: projects.length },
    lossBreakdown, earningsTrend, alerts, currency: settings.currency
  });
});

router.get('/portfolio', (req, res) => {
  const { projects, timelogs, settings } = store;
  const clientStats = {};
  projects.forEach(p => {
    const logs = timelogs.filter(l => l.projectId === p.id);
    const totalMins = logs.reduce((sum, l) => sum + l.duration, 0);
    const totalHrs = totalMins / 60;
    const billableMins = logs.filter(l => l.category === 'billable').reduce((sum, l) => sum + l.duration, 0);
    const billableHrs = billableMins / 60;
    const nonBillableHrs = totalHrs - billableHrs;
    const value = p.projectType === 'fixed' ? (p.fixedPrice || 0) : (billableHrs * (p.hourlyRate || 0));
    const effectiveRate = totalHrs > 0 ? Math.round(value / totalHrs) : 0;
    const loss = Math.round(nonBillableHrs * settings.minimumRate);
    let health = 'profitable';
    if (effectiveRate < settings.minimumRate) health = 'loss';
    else if (effectiveRate < settings.minimumRate * 1.3) health = 'risky';
    if (!clientStats[p.clientName]) {
      clientStats[p.clientName] = { clientName: p.clientName, projects: [], totalValue: 0, totalHours: 0, totalLoss: 0 };
    }
    clientStats[p.clientName].projects.push({ id: p.id, name: p.name, value, totalHours: Math.round(totalHrs * 10) / 10, effectiveRate, health, loss });
    clientStats[p.clientName].totalValue += value;
    clientStats[p.clientName].totalHours += totalHrs;
    clientStats[p.clientName].totalLoss += loss;
  });
  Object.values(clientStats).forEach(c => {
    c.avgEffectiveRate = c.totalHours > 0 ? Math.round(c.totalValue / c.totalHours) : 0;
    c.totalHours = Math.round(c.totalHours * 10) / 10;
    c.health = c.avgEffectiveRate >= settings.minimumRate * 1.3 ? 'profitable' : c.avgEffectiveRate >= settings.minimumRate ? 'risky' : 'loss';
  });
  const clients = Object.values(clientStats).sort((a, b) => b.avgEffectiveRate - a.avgEffectiveRate);
  const totalValue = clients.reduce((sum, c) => sum + c.totalValue, 0);
  const totalHours = clients.reduce((sum, c) => sum + c.totalHours, 0);
  const totalLoss = clients.reduce((sum, c) => sum + c.totalLoss, 0);
  const avgEffectiveRate = totalHours > 0 ? Math.round(totalValue / totalHours) : 0;
  res.json({ totals: { totalValue, totalHours: Math.round(totalHours * 10) / 10, totalLoss, avgEffectiveRate }, clients, bestClient: clients[0] || null, worstClient: clients[clients.length - 1] || null, currency: settings.currency });
});

export { router as analyticsRoutes };
