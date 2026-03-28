import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { Clock, AlertTriangle, CheckCircle, Brain, ArrowLeft } from 'lucide-react';
import { getProjectFromDB, getTimeLogsFromDB } from '../services/dbServices';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    const projData = await getProjectFromDB(id);
    setProject(projData);
    if (projData) {
      const logsData = await getTimeLogsFromDB(id);
      setLogs(logsData);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--rx-text-muted)' }}>
        <div className="rx-spinner" style={{ margin: '0 auto 16px' }}></div>
        Loading project details...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rx-empty-state">
        <div className="rx-empty-icon">❌</div>
        <h3 className="rx-empty-title">Project Not Found</h3>
        <p className="rx-empty-desc">The project you are looking for does not exist.</p>
        <Link to="/projects" className="rx-btn-secondary" style={{ marginTop: 20 }}>Back to Projects</Link>
      </div>
    );
  }

  const safeHours = project.loggedHours > 0 ? project.loggedHours : project.estimatedHours;
  const currentRate = safeHours > 0 ? (project.price / safeHours).toFixed(2) : 0;
  const isBelowMin = parseFloat(currentRate) < Number(project.minRate);
  
  // Basic AI mock logic based on real DB values
  const revisionsList = logs.filter(l => l.category === 'Revisions').reduce((acc, curr) => acc + Number(curr.hours), 0);
  const revisionsPercent = project.loggedHours > 0 ? Math.round((revisionsList / project.loggedHours) * 100) : 0;
  
  // const healthBadge = isBelowMin ? 'At Risk' : revisionsPercent > 20 ? 'Warning' : 'Healthy';

  return (
    <div>
      <div className="rx-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Link to="/projects" className="rx-btn-secondary" style={{ padding: '6px' }}>
            <ArrowLeft size={18} />
          </Link>
          <h2 className="rx-page-title" style={{ margin: 0 }}>{project.name} ({project.client})</h2>
          <span className={`rx-badge ${project.status === 'Active' ? 'rx-badge-active' : 'rx-badge-completed'}`} style={{ marginLeft: '12px' }}>
            {project.status}
          </span>
        </div>
        <p className="rx-page-subtitle">Project #{id} analytics and logs.</p>
      </div>

      <div className="rx-project-grid">
        {/* Left Column - Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="rx-dashboard-kpi-grid">
            <Card className="rx-kpi-card">
              <div className="rx-kpi-header">
                <span className="rx-kpi-label">Logged Hours</span>
                <Clock size={16} className="rx-text-secondary" />
              </div>
              <div className="rx-kpi-value">{project.loggedHours || 0}<span className="rx-kpi-unit">/ {project.estimatedHours}</span></div>
              <div className={`rx-kpi-trend ${(project.loggedHours || 0) > project.estimatedHours ? 'negative' : 'neutral'}`}>
                {(project.loggedHours || 0) > project.estimatedHours ? 'Over budget' : 'On Schedule'}
              </div>
            </Card>

            <Card className="rx-kpi-card">
              <div className="rx-kpi-header">
                <span className="rx-kpi-label">Current Rate</span>
                <DollarSign size={16} className="rx-text-secondary" />
              </div>
              <div className="rx-kpi-value" style={{ color: isBelowMin ? '#ff6b6b' : 'var(--rx-green)' }}>
                ${currentRate}<span className="rx-kpi-unit">/hr</span>
              </div>
              <div className={`rx-kpi-trend ${isBelowMin ? 'negative' : 'positive'}`}>
                {isBelowMin ? 'Below minimum' : 'Above minimum'}
              </div>
            </Card>
          </div>

          <Card title="Time Logs" subtitle="Recent tracked sessions for this project">
            {logs.length === 0 ? (
               <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--rx-text-muted)', fontSize: '0.88rem' }}>
                 No time logs yet. Add hours in the Time Tracking tab (Phase 8).
               </div>
            ) : (
              <div className="rx-table-container">
                <table className="rx-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Task</th>
                      <th>Category</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id}>
                        <td style={{ color: 'var(--rx-text-secondary)' }}>{log.date}</td>
                        <td style={{ fontWeight: 500 }}>{log.task}</td>
                        <td>
                          <span className={`rx-badge ${log.category === 'Billable' ? 'rx-badge-active' : log.category === 'Revisions' ? 'rx-badge-at-risk' : 'rx-badge-completed'}`}>
                             {log.category}
                          </span>
                        </td>
                        <td>{log.hours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Insights */}
        <div>
          <Card title="Project Insights" subtitle="AI performance tracking">
            <div className="rx-alerts-list">
              {revisionsPercent > 15 && (
                <div className="rx-alert-item warning">
                  <div className="rx-alert-icon"><AlertTriangle size={16} /></div>
                  <div className="rx-alert-content">
                    <h4>Revisions Increasing</h4>
                    <p>You've spent {revisionsList} hours on revisions ({revisionsPercent}% of total). Ensure this doesn't exceed 20%.</p>
                  </div>
                </div>
              )}
              
              {!isBelowMin ? (
                <div className="rx-alert-item info">
                  <div className="rx-alert-icon"><CheckCircle size={16} /></div>
                  <div className="rx-alert-content">
                    <h4>Healthy Rate</h4>
                    <p>At the current pace, you're netting an effective rate of ${currentRate}/hr.</p>
                  </div>
                </div>
              ) : (
                <div className="rx-alert-item danger">
                  <div className="rx-alert-icon"><AlertTriangle size={16} /></div>
                  <div className="rx-alert-content">
                    <h4>Rate Alert</h4>
                    <p>Your effective rate (${currentRate}/hr) has dropped below your acceptable minimum (${project.minRate}/hr).</p>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--rx-border)'}}>
               <h4 style={{ fontSize: '0.85rem', color: 'var(--rx-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Project Stats</h4>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                 <span style={{ color: 'var(--rx-text-secondary)' }}>Total Fee</span>
                 <span>${Number(project.price).toLocaleString()}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                 <span style={{ color: 'var(--rx-text-secondary)' }}>Target Rate</span>
                 <span>${project.minRate}/hr</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                 <span style={{ color: 'var(--rx-text-secondary)' }}>Non-Billable</span>
                 <span style={{ color: revisionsPercent > 15 ? '#ff6b6b' : 'var(--rx-text-secondary)' }}>{revisionsPercent}%</span>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Quick mock icon substitute for missing import
function DollarSign(props) {
  return <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
}

export default ProjectDetails;
