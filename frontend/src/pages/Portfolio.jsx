import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { getProjectsFromDB, getAllTimeLogsFromDB } from '../services/dbServices';

const Portfolio = () => {
  const [clientStats, setClientStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const projects = await getProjectsFromDB();
      const logs = await getAllTimeLogsFromDB();
      
      const clientMap = {};

      projects.forEach(p => {
        if (!clientMap[p.client]) {
          clientMap[p.client] = { name: p.client, totalProjects: 0, totalRevenue: 0, totalHours: 0, totalNonBillable: 0, minRateTarget: 0 };
        }
        
        const client = clientMap[p.client];
        client.totalProjects += 1;
        client.totalRevenue += Number(p.price);
        client.minRateTarget = Math.max(client.minRateTarget, Number(p.minRate));

        const pLogs = logs.filter(l => l.projectId === p.id);
        const pTotalHours = pLogs.reduce((acc, curr) => acc + Number(curr.hours), 0);
        const pNonBillable = pLogs.filter(l => l.category !== 'Billable').reduce((acc, curr) => acc + Number(curr.hours), 0);

        client.totalHours += pTotalHours;
        client.totalNonBillable += pNonBillable;
      });

      // Compute final
      const finalized = Object.values(clientMap).map(c => {
         const effRate = c.totalHours > 0 ? (c.totalRevenue / c.totalHours).toFixed(2) : 0;
         const lossValue = c.totalNonBillable * c.minRateTarget;
         return {
           ...c,
           effectiveRate: Number(effRate),
           lossValue
         };
      });

      // Sort by Revenue desc
      setClientStats(finalized.sort((a,b) => b.totalRevenue - a.totalRevenue));
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--rx-text-muted)' }}>
        <div className="rx-spinner" style={{ margin: '0 auto 16px' }}></div>
        Building portfolio comparisons...
      </div>
    );
  }

  return (
    <div>
      <div className="rx-page-header">
        <h2 className="rx-page-title">Client Portfolio Analytics</h2>
        <p className="rx-page-subtitle">Compare performance and profitability across your clients.</p>
      </div>

      <Card>
        {clientStats.length === 0 ? (
          <div className="rx-empty-state">
            <h3 className="rx-empty-title">No client data yet</h3>
          </div>
        ) : (
          <div className="rx-table-container">
            <table className="rx-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Projects</th>
                  <th>Total Revenue</th>
                  <th>Total Hours</th>
                  <th>Effective Rate</th>
                  <th>Hidden Loss</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {clientStats.map((client, i) => {
                  const isBelowTarget = client.effectiveRate > 0 && client.effectiveRate < client.minRateTarget;
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--rx-text)' }}>{client.name}</td>
                      <td>{client.totalProjects}</td>
                      <td>${client.totalRevenue.toLocaleString()}</td>
                      <td>{client.totalHours}h</td>
                      <td style={{ color: isBelowTarget ? '#ff6b6b' : 'var(--rx-green)', fontWeight: 600 }}>
                        ${client.effectiveRate}/hr
                      </td>
                      <td style={{ color: client.lossValue > 0 ? '#ff6b6b' : 'var(--rx-text-muted)' }}>
                        {client.lossValue > 0 ? `-$${client.lossValue.toLocaleString()}` : '$0'}
                      </td>
                      <td>
                        <span className={`rx-badge ${isBelowTarget ? 'rx-badge-at-risk' : 'rx-badge-active'}`}>
                          {isBelowTarget ? 'Unprofitable' : 'Profitable'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <h4 style={{ color: '#60a5fa', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Portfolio Insight</h4>
        <p style={{ color: 'var(--rx-text-secondary)', margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
          Clients marked as <strong>Unprofitable</strong> are dragging your overall effective rate down. Consider renegotiating their retainers or limiting non-billable meeting hours.
        </p>
      </div>
    </div>
  );
};

export default Portfolio;
