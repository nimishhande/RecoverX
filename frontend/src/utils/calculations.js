// Calculate Effective Rate for a single project or globally
export const calcEffectiveRate = (totalValue, totalHours) => {
  if (totalHours <= 0) return 0;
  return Number((totalValue / totalHours).toFixed(2));
};

// Calculate Loss (Hidden Loss)
export const calcLoss = (nonBillableHours, minRate) => {
  return Number((nonBillableHours * minRate).toFixed(2));
};

// Calculate Scope Creep Percentage
export const calcScopeCreep = (actualHours, estimatedHours) => {
  if (estimatedHours <= 0) return 0;
  const diff = actualHours - estimatedHours;
  if (diff <= 0) return 0; // No creep
  return Number(((diff / estimatedHours) * 100).toFixed(1));
};

// Process ALL data to give Global Dashboard Metrics
export const generateGlobalMetrics = (projects, logs) => {
  let totalValue = 0;
  let totalHours = 0;
  let totalLoss = 0;
  let totalEstimated = 0;
  let totalRevisions = 0;
  let totalScope = 0;
  let totalAdmin = 0;
  let totalCalls = 0;

  // Aggregate stats per project and global
  projects.forEach(p => {
    totalValue += Number(p.price);
    totalEstimated += Number(p.estimatedHours);
    
    // Total hours logged to this project specifically
    const projectLogs = logs.filter(l => l.projectId === p.id);
    const pTotalHours = projectLogs.reduce((acc, curr) => acc + Number(curr.hours), 0);
    totalHours += pTotalHours;
    
    // Find non-billable for this project (everything except Billable)
    const pNonBillableHours = projectLogs
      .filter(l => l.category !== 'Billable')
      .reduce((acc, curr) => acc + Number(curr.hours), 0);
      
    totalLoss += calcLoss(pNonBillableHours, Number(p.minRate));

    // For pie breakdown - tracking value of lost time
    const calcCatLoss = (cat) => projectLogs.filter(l => l.category === cat).reduce((acc, curr) => acc + Number(curr.hours), 0) * Number(p.minRate);
    
    totalRevisions += calcCatLoss('Revisions');
    totalScope += calcCatLoss('Scope');
    totalAdmin += calcCatLoss('Admin');
    totalCalls += calcCatLoss('Calls');
  });

  const effectiveRate = calcEffectiveRate(totalValue, totalHours);
  const scopeCreepPercent = calcScopeCreep(totalHours, totalEstimated);
  
  let riskLevel = 'Healthy';
  if (scopeCreepPercent > 0) riskLevel = 'Moderate';
  if (scopeCreepPercent > 20 || totalLoss > (totalValue * 0.15)) riskLevel = 'High';

  const lossBreakdown = [
    { name: 'Revisions', value: Number(totalRevisions.toFixed(2)) },
    { name: 'Scope Creep', value: Number(totalScope.toFixed(2)) },
    { name: 'Admin Tasks', value: Number(totalAdmin.toFixed(2)) },
    { name: 'Unpaid Calls', value: Number(totalCalls.toFixed(2)) },
  ].filter(item => item.value > 0);

  // Fallback for pie chart if empty or no loss yet
  if (lossBreakdown.length === 0) {
    lossBreakdown.push({ name: 'No Tracking Yet', value: 1 });
  }

  // Naive earnings trend based on projects completed this year grouped by month
  const monthlyEarnings = { Jan:0, Feb:0, Mar:0, Apr:0, May:0, Jun:0, Jul:0, Aug:0, Sep:0, Oct:0, Nov:0, Dec:0 };
  
  projects.forEach(p => {
    const d = p.createdAt ? new Date(p.createdAt.toMillis()) : new Date();
    const month = d.toLocaleString('default', { month: 'short' });
    if(monthlyEarnings[month] !== undefined) {
      if(p.status === 'Completed' || p.status === 'Active') { 
         monthlyEarnings[month] += Number(p.price);
      }
    }
  });

  const earningsTrend = Object.keys(monthlyEarnings)
    .filter((_, i) => i <= new Date().getMonth()) // show months up to current
    .map(key => ({
      name: key,
      earnings: monthlyEarnings[key]
  }));

  // Create derived alerts array and detailed insights
  const activeAlerts = [];
  const detailedInsights = [];

  if (scopeCreepPercent > 0) {
    activeAlerts.push({ type: 'warning', title: 'Global Scope Creep', desc: `Overall logged hours exceed your estimates by ${scopeCreepPercent}%.` });
    detailedInsights.push({
      id: 'creep-global',
      type: 'warning',
      title: `Scope Creep Detected: ${scopeCreepPercent}%`,
      description: `Across all your projects, you have logged more time than estimated. This is diluting your effective hourly rate. Consider tightening project scopes or charging for overages.`
    });
  }
  if (totalLoss > 1000) {
    activeAlerts.push({ type: 'danger', title: 'High Hidden Loss', desc: `You have leaked $${totalLoss} in non-billable time this year.` });
  }

  if (effectiveRate >= 50 && riskLevel === 'Healthy') {
    activeAlerts.push({ type: 'info', title: 'Profitable Run', desc: `Your global effective rate of $${effectiveRate}/hr is excellent.`});
  }

  // Generate per-project insights
  projects.forEach(p => {
    const projectLogs = logs.filter(l => l.projectId === p.id);
    const pTotalHours = projectLogs.reduce((acc, curr) => acc + Number(curr.hours), 0);
    const pRate = pTotalHours > 0 ? (Number(p.price) / pTotalHours).toFixed(2) : 0;
    
    // Insight 1: Profit Margin Decay Predictor
    if (pTotalHours > Number(p.estimatedHours) * 0.7 && pTotalHours < Number(p.estimatedHours)) {
      const hoursLeft = Number(p.estimatedHours) - pTotalHours;
      detailedInsights.push({
        id: `burnrate-${p.id}`,
        type: 'warning',
        title: `🔥 Pipeline Predictor: Margin Decay on "${p.name}"`,
        description: `You have burned ${Math.round((pTotalHours/Number(p.estimatedHours))*100)}% of your estimated budget. At your current operational burn rate, your effective hourly rate will drop below acceptable minimum limits in exactly ${Math.max(1, hoursLeft).toFixed(1)} hours. ACTION: Freeze all new scope requests instantly.`
      });
    }

    // Insight 2: Severe Budget Overrun
    if (pTotalHours > Number(p.estimatedHours)) {
      const overPercent = (((pTotalHours - Number(p.estimatedHours)) / Number(p.estimatedHours)) * 100).toFixed(1);
      detailedInsights.push({
        id: `budget-${p.id}`,
        type: 'danger',
        title: `🚨 CRITICAL: "${p.name}" is ${overPercent}% over budget`,
        description: `You estimated ${p.estimatedHours}h but logged ${pTotalHours}h. Your effective rate has plummeted to $${pRate}/hr. The pipeline predicts complete operational exhaustion. ACTION: Renegotiate retainer parameters immediately or fire client.`
      });
    }

    // Insight 3: The "Client Upsell" / Goldmine Predictor
    const billableLogs = projectLogs.filter(l => l.category === 'Billable').reduce((a, b) => a + Number(b.hours), 0);
    const billableRatio = pTotalHours > 0 ? (billableLogs / pTotalHours) : 0;
    if (pTotalHours > 5 && billableRatio > 0.85 && Number(pRate) >= Number(p.minRate) * 1.5) {
      detailedInsights.push({
        id: `upsell-${p.id}`,
        type: 'info',
        title: `💰 Goldmine Predictor: Upsell "${p.client}"`,
        description: `Highest Efficiency Detected: Your effective rate of $${pRate}/hr is 150%+ above your minimum target with zero friction. ACTION: Pitch a permanent high-ticket $3k+ monthly retainer to this client today.`
      });
    }

    // Insight 4: Toxic Scope Micro-Increments
    const revisionCount = projectLogs.filter(l => l.category === 'Revisions').length;
    if (revisionCount >= 3) {
      detailedInsights.push({
        id: `toxic-${p.id}`,
        type: 'danger',
        title: `⚠️ Toxic Client Algorithm: "${p.client}"`,
        description: `This client is repeatedly requesting revisions in isolated micro-increments (${revisionCount} separate events). This psychological pattern drains deep work states. ACTION: Enforce a strict 'Per-Revision Fee' structure instantly.`
      });
    }

    // Insight 5: Communication Bleed
    const callHours = projectLogs.filter(l => l.category === 'Calls').reduce((a, b) => a + Number(b.hours), 0);
    if (callHours > Number(p.estimatedHours) * 0.2) {
      detailedInsights.push({
        id: `calls-${p.id}`,
        type: 'warning',
        title: `📞 Asynchronous Bleed: "${p.name}"`,
        description: `You've spent over 20% of your total budget (${callHours} hours) just sitting on non-billable phone calls. ACTION: Demand asynchronous communication via Slack/Email only to mathematically protect your margin.`
      });
    }

    // 3. Agentic Advisor Action (Non-billable > 40%)
    const pNonBillableAgent = projectLogs.filter(l => l.category !== 'Billable').reduce((a, b) => a + Number(b.hours), 0);
    if (pTotalHours > 0 && pNonBillableAgent > 0) {
      const nonBillPercent = Math.round((pNonBillableAgent / pTotalHours) * 100);
      if (nonBillPercent >= 40) {
        // Find the majority cause
        const catMap = {};
        projectLogs.filter(l => l.category !== 'Billable').forEach(l => {
           catMap[l.category] = (catMap[l.category] || 0) + Number(l.hours);
        });
        const worstCat = Object.keys(catMap).sort((a,b) => catMap[b] - catMap[a])[0] || 'revisions';

        activeAlerts.push({
          type: 'danger',
          title: `⚡ Agent Advisor: Profit Bleed on "${p.name}"`,
          desc: `⚠️ You spent ${nonBillPercent}% of total time on ${worstCat.toLowerCase()}. Suggestion: Limit ${worstCat.toLowerCase()} strictly in your contract, or instantly increase project price by 25%.`
        });
      }
    }
  });

  // Global Call / Admin time insights
  if (totalCalls > 500) { // e.g., >$500 worth of calls
    detailedInsights.push({
      id: 'global-calls',
      type: 'warning',
      title: 'High Meeting Overhead',
      description: `You've lost $${totalCalls} worth of time to unpaid calls across all projects. Consider capping meeting times in your contracts.`
    });
  }

  if (detailedInsights.length === 0) {
    detailedInsights.push({
      id: 'all-good',
      type: 'info',
      title: 'Operations Normal',
      description: 'Your projects are running efficiently with no major scope or time leaks detected.'
    });
  }

  return {
    effectiveRate,
    totalLoss,
    totalHours: Number(totalHours.toFixed(2)),
    riskLevel,
    scopeCreepPercent,
    lossBreakdown,
    earningsTrend,
    activeAlerts,
    detailedInsights
  };
};
