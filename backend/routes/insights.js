import { Router } from 'express';
import store from '../store/index.js';

const router = Router();

// GET AI insights
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

    // Rule 1: High revision time
    if (revisionPercent > 30) {
      insights.push({
        type: 'warning',
        icon: '🔄',
        project: p.name,
        client: p.clientName,
        title: 'High Revision Time',
        message: `${revisionPercent}% of time on "${p.name}" is spent on revisions, significantly reducing profitability.`,
        suggestion: 'Set a revision limit in your contract (e.g., 2 rounds included). Charge for additional rounds.'
      });
    }

    // Rule 2: Effective rate below minimum
    if (effectiveRate < settings.minimumRate && totalHrs > 0) {
      insights.push({
        type: 'danger',
        icon: '💸',
        project: p.name,
        client: p.clientName,
        title: 'Project is Underpaying',
        message: `Effective rate for "${p.name}" is ${settings.currency}${effectiveRate}/hr — below your minimum of ${settings.currency}${settings.minimumRate}/hr.`,
        suggestion: 'Renegotiate pricing or reduce non-billable effort. Consider increasing your base price by 20-30%.'
      });
    }

    // Rule 3: Scope creep
    if (scopeCreep > 15) {
      insights.push({
        type: 'warning',
        icon: '📈',
        project: p.name,
        client: p.clientName,
        title: 'Scope Creep Detected',
        message: `"${p.name}" has ${scopeCreep}% scope creep. Actual hours exceed the estimate by ${Math.round(totalHrs - p.estimatedHours)} hours.`,
        suggestion: 'Document all scope changes and charge for additions. Use a change request form for future projects.'
      });
    }

    // Rule 4: Non-billable overload
    if (nonBillablePercent > 40) {
      insights.push({
        type: 'danger',
        icon: '⏰',
        project: p.name,
        client: p.clientName,
        title: 'Too Much Unpaid Work',
        message: `${nonBillablePercent}% of time on "${p.name}" is non-billable. You're losing ${settings.currency}${Math.round(nonBillableHrs * settings.minimumRate)} on this project.`,
        suggestion: 'Include admin and call time in your project quotes. Build a 15-20% buffer into estimates.'
      });
    }

    // Rule 5: Scope additions without compensation
    if (scopeMins > 0 && p.projectType === 'fixed') {
      const scopeHrs = scopeMins / 60;
      insights.push({
        type: 'warning',
        icon: '🚨',
        project: p.name,
        client: p.clientName,
        title: 'Uncompensated Scope Additions',
        message: `${Math.round(scopeHrs * 10) / 10} hours of scope additions on "${p.name}" were done without additional pay.`,
        suggestion: 'Always document scope changes and bill separately. Consider switching to hourly for scope-heavy clients.'
      });
    }
  });

  // Global recommendations
  const totalMins = timelogs.reduce((sum, l) => sum + l.duration, 0);
  const revisionTotal = timelogs.filter(l => l.category === 'revisions').reduce((sum, l) => sum + l.duration, 0);
  const callsTotal = timelogs.filter(l => l.category === 'calls').reduce((sum, l) => sum + l.duration, 0);

  if (revisionTotal / totalMins > 0.2) {
    recommendations.push({
      icon: '📝',
      title: 'Set Revision Limits',
      message: 'Across your portfolio, revision time is high. Include a revision clause in all contracts to protect your margins.'
    });
  }

  if (callsTotal / totalMins > 0.1) {
    recommendations.push({
      icon: '📞',
      title: 'Optimize Client Communication',
      message: 'You spend significant time on calls. Try async communication (Loom videos, written updates) to reduce meeting overhead.'
    });
  }

  // Find loss-making clients
  const lossClients = projects.filter(p => {
    const pLogs = timelogs.filter(l => l.projectId === p.id);
    const hrs = pLogs.reduce((sum, l) => sum + l.duration, 0) / 60;
    const bHrs = pLogs.filter(l => l.category === 'billable').reduce((sum, l) => sum + l.duration, 0) / 60;
    const val = p.projectType === 'fixed' ? (p.fixedPrice || 0) : (bHrs * (p.hourlyRate || 0));
    return hrs > 0 && (val / hrs) < settings.minimumRate;
  });

  if (lossClients.length > 0) {
    recommendations.push({
      icon: '🎯',
      title: 'Increase Pricing for Difficult Clients',
      message: `${lossClients.map(c => c.clientName).join(', ')} — these clients are costing you money. Raise rates by at least 25% for future work or consider dropping them.`
    });
  }

  recommendations.push({
    icon: '💡',
    title: 'Build a Buffer into Estimates',
    message: 'Add 20% to all time estimates to account for communication, revisions, and admin work. This protects your effective rate.'
  });

  recommendations.push({
    icon: '📊',
    title: 'Track Time Consistently',
    message: 'The more accurately you track all time (including calls and admin), the clearer your profitability picture becomes.'
  });

  res.json({ insights, recommendations, currency: settings.currency });
});

// POST chat (rule-based AI chatbot)
router.post('/chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const msg = message.toLowerCase();
  const { projects, timelogs, settings } = store;

  // Calculate global stats for context
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
    if (nonBillablePercent > 30) reasons.push(`${nonBillablePercent}% of your time is non-billable (calls, revisions, admin)`);
    if (effectiveRate < settings.minimumRate) reasons.push(`your effective rate (${settings.currency}${effectiveRate}/hr) is below your minimum (${settings.currency}${settings.minimumRate}/hr)`);

    const revisionMins = timelogs.filter(l => l.category === 'revisions').reduce((sum, l) => sum + l.duration, 0);
    if (revisionMins / totalMins > 0.2) reasons.push('revision time is eating into your margins');

    const scopeMins = timelogs.filter(l => l.category === 'scope').reduce((sum, l) => sum + l.duration, 0);
    if (scopeMins > 0) reasons.push('you have uncompensated scope creep on active projects');

    response = reasons.length > 0
      ? `Your profit is low because: ${reasons.join('; ')}. I recommend reviewing your pricing strategy and setting clearer boundaries with clients.`
      : 'Your profitability looks reasonable! Keep tracking time accurately to maintain visibility.';

  } else if (msg.includes('rate') || msg.includes('earning') || msg.includes('how much')) {
    response = `Your current effective rate across all projects is ${settings.currency}${effectiveRate}/hr. Your minimum target is ${settings.currency}${settings.minimumRate}/hr. ${effectiveRate >= settings.minimumRate ? 'You\'re above your target — great!' : 'You\'re below target — consider raising prices or reducing non-billable work.'}`;

  } else if (msg.includes('scope') || msg.includes('creep')) {
    const scopeProjects = projects.filter(p => {
      const hrs = timelogs.filter(l => l.projectId === p.id).reduce((sum, l) => sum + l.duration, 0) / 60;
      return p.estimatedHours > 0 && hrs > p.estimatedHours * 1.1;
    });
    response = scopeProjects.length > 0
      ? `Scope creep detected on: ${scopeProjects.map(p => `"${p.name}" (${Math.round(((timelogs.filter(l => l.projectId === p.id).reduce((sum, l) => sum + l.duration, 0) / 60 - p.estimatedHours) / p.estimatedHours) * 100)}% over)`).join(', ')}. Use change request forms and bill for additions.`
      : 'No significant scope creep detected across your active projects. Keep monitoring!';

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
    const sorted = Object.entries(clientRates).map(([name, d]) => ({
      name, rate: d.hours > 0 ? Math.round(d.value / d.hours) : 0
    })).sort((a, b) => b.rate - a.rate);

    response = sorted.length > 0
      ? `Best client: ${sorted[0].name} (${settings.currency}${sorted[0].rate}/hr effective). Worst: ${sorted[sorted.length - 1].name} (${settings.currency}${sorted[sorted.length - 1].rate}/hr). Focus on clients who value your time.`
      : 'No client data available yet.';

  } else if (msg.includes('revision')) {
    const revisionMins = timelogs.filter(l => l.category === 'revisions').reduce((sum, l) => sum + l.duration, 0);
    const revisionHrs = Math.round(revisionMins / 60 * 10) / 10;
    const revisionPercent = totalMins > 0 ? Math.round((revisionMins / totalMins) * 100) : 0;
    response = `You've spent ${revisionHrs} hours on revisions (${revisionPercent}% of total time), costing you approximately ${settings.currency}${Math.round(revisionHrs * settings.minimumRate)}. ${revisionPercent > 20 ? 'This is high — set revision limits in contracts.' : 'This is within normal range.'}`;

  } else if (msg.includes('help') || msg.includes('what can')) {
    response = 'I can help you understand your profitability! Try asking:\n• "Why is my profit low?"\n• "What\'s my effective rate?"\n• "Do I have scope creep?"\n• "Who is my best client?"\n• "How much time on revisions?"';

  } else {
    response = `I analyze your freelance profitability data. Your current effective rate is ${settings.currency}${effectiveRate}/hr across ${projects.length} projects, with ${nonBillablePercent}% non-billable time. Try asking me specific questions like "Why is my profit low?" or "Who is my best client?"`;
  }

  res.json({ response, timestamp: new Date().toISOString() });
});

export { router as insightsRoutes };
