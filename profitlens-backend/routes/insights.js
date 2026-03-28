import { Router } from 'express';
import store from '../store/index.js';

const router = Router();

router.get('/', (req, res) => {
  const { projects, timelogs, settings } = store;
  const insights = [];
  const recommendations = [];

  projects.forEach(p => {
    const logs = timelogs.filter(l => l.projectId === p.id);
    const totalMins = logs.reduce((sum, l) => sum + l.duration, 0);
    const totalHrs = totalMins / 60;
    const billableMins = logs.filter(l => l.category === 'billable').reduce((sum, l) => sum + l.duration, 0);
    const billableHrs = billableMins / 60;
    const nonBillableHrs = totalHrs - billableHrs;
    const revisionMins = logs.filter(l => l.category === 'revisions').reduce((sum, l) => sum + l.duration, 0);
    const scopeMins = logs.filter(l => l.category === 'scope').reduce((sum, l) => sum + l.duration, 0);
    const value = p.projectType === 'fixed' ? (p.fixedPrice || 0) : (billableHrs * (p.hourlyRate || 0));
    const effectiveRate = totalHrs > 0 ? Math.round(value / totalHrs) : 0;
    const revisionPercent = totalMins > 0 ? Math.round((revisionMins / totalMins) * 100) : 0;
    const nonBillablePercent = totalHrs > 0 ? Math.round((nonBillableHrs / totalHrs) * 100) : 0;
    const scopeCreep = p.estimatedHours > 0 ? Math.round(((totalHrs - p.estimatedHours) / p.estimatedHours) * 100) : 0;

    if (revisionPercent > 30) {
      insights.push({ type: 'warning', icon: '🔄', project: p.name, client: p.clientName, title: 'High Revision Time', message: `${revisionPercent}% of time on "${p.name}" is revisions.`, suggestion: 'Set revision limits in contracts.' });
    }
    if (effectiveRate < settings.minimumRate && totalHrs > 0) {
      insights.push({ type: 'danger', icon: '💸', project: p.name, client: p.clientName, title: 'Project is Underpaying', message: `Effective rate ${settings.currency}${effectiveRate}/hr is below minimum ${settings.currency}${settings.minimumRate}/hr.`, suggestion: 'Renegotiate pricing or reduce non-billable effort.' });
    }
    if (scopeCreep > 15) {
      insights.push({ type: 'warning', icon: '📈', project: p.name, client: p.clientName, title: 'Scope Creep Detected', message: `"${p.name}" has ${scopeCreep}% scope creep.`, suggestion: 'Document scope changes and charge for additions.' });
    }
    if (nonBillablePercent > 40) {
      insights.push({ type: 'danger', icon: '⏰', project: p.name, client: p.clientName, title: 'Too Much Unpaid Work', message: `${nonBillablePercent}% of time on "${p.name}" is non-billable.`, suggestion: 'Include admin time in project quotes.' });
    }
    if (scopeMins > 0 && p.projectType === 'fixed') {
      insights.push({ type: 'warning', icon: '🚨', project: p.name, client: p.clientName, title: 'Uncompensated Scope Additions', message: `${Math.round(scopeMins / 60 * 10) / 10}hrs of scope additions without pay.`, suggestion: 'Bill scope changes separately.' });
    }
  });

  const totalMins = timelogs.reduce((sum, l) => sum + l.duration, 0);
  const revisionTotal = timelogs.filter(l => l.category === 'revisions').reduce((sum, l) => sum + l.duration, 0);
  const callsTotal = timelogs.filter(l => l.category === 'calls').reduce((sum, l) => sum + l.duration, 0);

  if (revisionTotal / totalMins > 0.2) recommendations.push({ icon: '📝', title: 'Set Revision Limits', message: 'Revision time is high across portfolio. Add revision clauses to contracts.' });
  if (callsTotal / totalMins > 0.1) recommendations.push({ icon: '📞', title: 'Optimize Communication', message: 'Try async updates (Loom, written) to reduce meeting overhead.' });

  recommendations.push({ icon: '💡', title: 'Buffer Your Estimates', message: 'Add 20% to all estimates to account for non-billable work.' });
  recommendations.push({ icon: '📊', title: 'Track Consistently', message: 'Accurate tracking gives you a clearer profitability picture.' });

  res.json({ insights, recommendations, currency: settings.currency });
});

router.post('/chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  const msg = message.toLowerCase();
  const { projects, timelogs, settings } = store;

  const totalMins = timelogs.reduce((sum, l) => sum + l.duration, 0);
  const totalHrs = totalMins / 60;
  const billableMins = timelogs.filter(l => l.category === 'billable').reduce((sum, l) => sum + l.duration, 0);
  const nonBillableHrs = (totalMins - billableMins) / 60;
  const nonBillablePercent = totalHrs > 0 ? Math.round((nonBillableHrs / totalHrs) * 100) : 0;

  let totalValue = 0;
  projects.forEach(p => {
    const pLogs = timelogs.filter(l => l.projectId === p.id);
    const pBillable = pLogs.filter(l => l.category === 'billable').reduce((sum, l) => sum + l.duration, 0) / 60;
    totalValue += p.projectType === 'fixed' ? (p.fixedPrice || 0) : (pBillable * (p.hourlyRate || 0));
  });
  const effectiveRate = totalHrs > 0 ? Math.round(totalValue / totalHrs) : 0;

  let response = '';

  if (msg.includes('profit') && (msg.includes('low') || msg.includes('why') || msg.includes('drop'))) {
    const reasons = [];
    if (nonBillablePercent > 30) reasons.push(`${nonBillablePercent}% of time is non-billable`);
    if (effectiveRate < settings.minimumRate) reasons.push(`effective rate (${settings.currency}${effectiveRate}/hr) below minimum`);
    response = reasons.length > 0 ? `Your profit is low because: ${reasons.join('; ')}. Review pricing and set boundaries.` : 'Your profitability looks reasonable!';
  } else if (msg.includes('rate') || msg.includes('earning')) {
    response = `Effective rate: ${settings.currency}${effectiveRate}/hr. Target: ${settings.currency}${settings.minimumRate}/hr. ${effectiveRate >= settings.minimumRate ? 'Above target!' : 'Below target — raise prices.'}`;
  } else if (msg.includes('scope') || msg.includes('creep')) {
    const scopeProjects = projects.filter(p => {
      const hrs = timelogs.filter(l => l.projectId === p.id).reduce((sum, l) => sum + l.duration, 0) / 60;
      return p.estimatedHours > 0 && hrs > p.estimatedHours * 1.1;
    });
    response = scopeProjects.length > 0 ? `Scope creep on: ${scopeProjects.map(p => p.name).join(', ')}. Use change request forms.` : 'No significant scope creep detected!';
  } else if (msg.includes('client') || msg.includes('best') || msg.includes('worst')) {
    const clientRates = {};
    projects.forEach(p => {
      const logs = timelogs.filter(l => l.projectId === p.id);
      const hrs = logs.reduce((sum, l) => sum + l.duration, 0) / 60;
      const bHrs = logs.filter(l => l.category === 'billable').reduce((sum, l) => sum + l.duration, 0) / 60;
      const val = p.projectType === 'fixed' ? (p.fixedPrice || 0) : (bHrs * (p.hourlyRate || 0));
      if (!clientRates[p.clientName]) clientRates[p.clientName] = { value: 0, hours: 0 };
      clientRates[p.clientName].value += val;
      clientRates[p.clientName].hours += hrs;
    });
    const sorted = Object.entries(clientRates).map(([name, d]) => ({ name, rate: d.hours > 0 ? Math.round(d.value / d.hours) : 0 })).sort((a, b) => b.rate - a.rate);
    response = sorted.length > 0 ? `Best: ${sorted[0].name} (${settings.currency}${sorted[0].rate}/hr). Worst: ${sorted[sorted.length-1].name} (${settings.currency}${sorted[sorted.length-1].rate}/hr).` : 'No client data yet.';
  } else if (msg.includes('help') || msg.includes('what can')) {
    response = 'Ask me: "Why is my profit low?", "What\'s my rate?", "Any scope creep?", "Best client?"';
  } else {
    response = `Your effective rate is ${settings.currency}${effectiveRate}/hr across ${projects.length} projects with ${nonBillablePercent}% non-billable time. Ask me anything specific!`;
  }

  res.json({ response, timestamp: new Date().toISOString() });
});

export { router as insightsRoutes };
