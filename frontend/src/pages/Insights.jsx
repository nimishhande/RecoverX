import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { Brain, AlertTriangle, CheckCircle, TrendingDown, ShieldAlert, Award, Activity } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getProjectsFromDB, getAllTimeLogsFromDB } from '../services/dbServices';
import { generateGlobalMetrics } from '../utils/calculations';

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [clientTiers, setClientTiers] = useState([]);
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
        
        // --- Calculate Radar Data (Business DNA Vector Map) ---
        let totalHours = 0;
        let billable = 0, revisions = 0, calls = 0;
        let sumEffRate = 0, sumMinRate = 0;
        
        logs.forEach(l => {
          totalHours += Number(l.hours);
          if (l.category === 'Billable') billable += Number(l.hours);
          if (l.category === 'Revisions') revisions += Number(l.hours);
          if (l.category === 'Calls') calls += Number(l.hours);
        });

        projects.forEach(p => {
          const pLogs = logs.filter(l => l.projectId === p.id);
          const pTotal = pLogs.reduce((acc, curr) => acc + Number(curr.hours), 0);
          if (pTotal > 0) {
            sumEffRate += (Number(p.price) / pTotal);
            sumMinRate += Number(p.minRate);
          }
        });

        // 0-100 scores for pentagon graph
        const profitability = (sumMinRate > 0 && sumEffRate > 0) ? Math.min(100, Math.round((sumEffRate / sumMinRate) * 100)) : 50;
        const frictionFree = totalHours > 0 ? Math.max(0, 100 - Math.round((revisions / totalHours) * 200)) : 100; // Punish revisions heavily
        const asyncComm = totalHours > 0 ? Math.max(0, 100 - Math.round((calls / totalHours) * 200)) : 100;
        const velocity = totalHours > 0 ? Math.round((billable / totalHours) * 100) : 50;
        
        // Scope integrity = Estimated / Logged
        let totalEst = projects.reduce((acc, p) => acc + Number(p.estimatedHours), 0);
        const scopeInteg = totalHours > 0 ? Math.min(100, Math.round((totalEst / totalHours) * 100)) : 100;

        setRadarData([
          { subject: 'Profitability', A: profitability, fullMark: 100 },
          { subject: 'Scope Integrity', A: scopeInteg, fullMark: 100 },
          { subject: 'Friction-Free', A: frictionFree, fullMark: 100 },
          { subject: 'Async Comm', A: asyncComm, fullMark: 100 },
          { subject: 'Velocity', A: velocity, fullMark: 100 }
        ]);

        // --- Calculate Client Tiers (Should I fire them?) ---
        const tiers = projects.map(p => {
          const pLogs = logs.filter(l => l.projectId === p.id);
          const pTotal = pLogs.reduce((acc, curr) => acc + Number(curr.hours), 0);
          const effRate = pTotal > 0 ? (Number(p.price) / pTotal) : (Number(p.price) / Number(p.estimatedHours));
          const numRevisions = pLogs.filter(l => l.category === 'Revisions').length;
          
          let score = effRate / Number(p.minRate);
          score -= (numRevisions * 0.15); // Dynamic Penalty for asking for too many revisions
          
          let tier = 'C-Tier';
          let rationale = '';
          let color = '#f59e0b'; // yellow

          if (score >= 1.5) {
            tier = 'S-Tier (Unicorn)';
            color = '#a855f7'; // Purple
            rationale = 'Extremely high margins with zero friction. Pitch a permanent highest-tier retainer instantly.';
          } else if (score >= 1.1) {
            tier = 'A-Tier (Solid)';
            color = '#00cc6a'; // Green
            rationale = 'Consistently profitable with acceptable boundaries. Good for standard future prospects.';
          } else if (score >= 0.8) {
            tier = 'B-Tier (Average)';
            color = '#3b82f6'; // Blue
            rationale = 'Barely meeting target margins. Monitor closely; enforce contract limitations strictly.';
          } else {
            tier = 'F-Tier (Toxic)';
            color = '#ff6b6b'; // Red
            rationale = 'Actively draining revenue. The Algorithm advises immediate contract termination or 50% price hike.';
          }

          return { ...p, tier, color, rationale, effRate };
        }).sort((a, b) => b.effRate - a.effRate);

        setClientTiers(tiers);
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
        Analyzing neural pipelines...
      </div>
    );
  }

  return (
    <div>
      <div className="rx-page-header">
        <h2 className="rx-page-title">Agentic AI Pipeline</h2>
        <p className="rx-page-subtitle">Predictive analytics mapping health vectors and algorithmic client tier lists.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Business Health Radar (Option 3) */}
        <Card title="Business Health Radar" subtitle="Vectorized mapping of your freelance DNA">
           <div style={{ width: '100%', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
             {radarData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                   <PolarGrid stroke="rgba(255,255,255,0.1)" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--rx-text-muted)', fontSize: 13 }} />
                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                   <Tooltip contentStyle={{ backgroundColor: '#0a1210', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '8px', color: '#fff' }} />
                   <Radar name="DNA Score" dataKey="A" stroke="#00cc6a" fill="#00cc6a" fillOpacity={0.4} />
                 </RadarChart>
               </ResponsiveContainer>
             ) : (
               <p style={{ color: 'var(--rx-text-muted)' }}>Awaiting telemetry matrix...</p>
             )}
           </div>
        </Card>

        {/* Right Column: AI Output Terminal (Remix of Option 1) */}
        <Card>
          <div style={{ padding: '0 0 16px', borderBottom: '1px solid var(--rx-border)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Activity size={24} style={{ color: '#00cc6a' }} className="pulse" />
             <div>
               <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--rx-text)' }}>Live Command Terminal</h3>
               <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--rx-text-secondary)' }}>Dynamically streaming intelligent alerts.</p>
             </div>
          </div>
          <div className="rx-alerts-list" style={{ marginTop: 0, maxHeight: '270px', overflowY: 'auto', paddingRight: '8px' }}>
            {insights.length === 0 ? (
               <div style={{ padding: '20px', textAlign: 'center', color: 'var(--rx-text-muted)' }}>Terminal idle. System homeostasis normal.</div>
            ) : (
              insights.map(insight => (
                <div key={insight.id} className={`rx-alert-item ${insight.type}`} style={{ padding: '16px', marginBottom: '12px' }}>
                  <div className="rx-alert-icon" style={{ marginTop: '2px' }}>
                    {insight.type === 'success' || insight.type === 'info' ? <Award size={18} /> : 
                     insight.type === 'danger' ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <div className="rx-alert-content" style={{ width: '100%' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '6px' }}>{insight.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--rx-text-secondary)', lineHeight: 1.5 }}>{insight.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

      </div>

      {/* Full Width Row: Client Tier List (Option 2) */}
      <Card style={{ marginTop: '24px' }}>
        <div style={{ padding: '0 0 20px', borderBottom: '1px solid var(--rx-border)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Brain size={28} style={{ color: '#a855f7' }} />
             <div>
               <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--rx-text)' }}>Algorithmic Client Grading Matrix</h3>
               <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--rx-text-secondary)' }}>Mathematical tier list forecasting which clients you should fire, and which you should pursue for future projects.</p>
             </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
           {clientTiers.map(c => (
             <div key={c.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${c.color}35`, // Hex transparency
                borderRadius: '12px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s'
             }} className="rx-hover-lift">
                {/* Colored Glow Line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: c.color }}></div>
                
                <h4 style={{ margin: '0 0 10px', fontSize: '1.15rem', color: '#fff' }}>{c.client}</h4>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '4px 12px', 
                  background: `${c.color}25`, 
                  color: c.color, 
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '16px',
                  letterSpacing: '0.5px'
                }}>
                  {c.tier}
                </div>
                
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--rx-text-muted)', lineHeight: 1.6 }}>{c.rationale}</p>
             </div>
           ))}
           
           {clientTiers.length === 0 && (
              <div style={{ color: 'var(--rx-text-muted)' }}>Awaiting project nodes for algorithmic grading.</div>
           )}
        </div>
      </Card>
      
    </div>
  );
};

export default Insights;
