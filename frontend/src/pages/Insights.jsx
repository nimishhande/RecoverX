import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { Brain, AlertTriangle, CheckCircle, TrendingDown, Target } from 'lucide-react';
import { getProjectsFromDB, getAllTimeLogsFromDB } from '../services/dbServices';
import { generateGlobalMetrics } from '../utils/calculations';

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const projects = await getProjectsFromDB();
      const logs = await getAllTimeLogsFromDB();
      if (projects.length > 0) {
        const computed = generateGlobalMetrics(projects, logs);
        setInsights(computed.detailedInsights || []);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--rx-text-muted)' }}>
        <div className="rx-spinner" style={{ margin: '0 auto 16px' }}></div>
        Analyzing project data...
      </div>
    );
  }

  return (
    <div>
      <div className="rx-page-header">
        <h2 className="rx-page-title">AI Engine Insights</h2>
        <p className="rx-page-subtitle">Rule-based intelligence scanning for revenue leaks and scope creep.</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card>
          <div style={{ padding: '10px 0 20px', borderBottom: '1px solid var(--rx-border)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Brain size={28} style={{ color: 'var(--rx-green)' }} />
             <div>
               <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--rx-text)' }}>Engine Report</h3>
               <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--rx-text-secondary)' }}>Based on your logged time vs scopes.</p>
             </div>
          </div>

          <div className="rx-alerts-list" style={{ marginTop: 0 }}>
            {insights.map(insight => (
              <div key={insight.id} className={`rx-alert-item ${insight.type}`} style={{ padding: '20px' }}>
                <div className="rx-alert-icon" style={{ marginTop: '4px' }}>
                  {insight.type === 'info' ? <CheckCircle size={20} /> : 
                   insight.type === 'danger' ? <AlertTriangle size={20} /> : <TrendingDown size={20} />}
                </div>
                <div className="rx-alert-content" style={{ width: '100%' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>{insight.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--rx-text-secondary)', lineHeight: 1.6 }}>{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
