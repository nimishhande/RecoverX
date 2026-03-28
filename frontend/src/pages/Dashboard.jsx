import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Target, AlertTriangle, Clock, TrendingDown, AlertCircle, CheckCircle, Send, MessageSquareText, X } from 'lucide-react';
import { getProjectsFromDB, getAllTimeLogsFromDB } from '../services/dbServices';
import { generateGlobalMetrics } from '../utils/calculations';

const COLORS = ['#ff6b6b', '#f59e0b', '#3b82f6', '#a855f7', '#00cc6a'];
const rxBorder = 'rgba(0, 255, 136, 0.1)';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: 'Hi! I am the ProfitLens rule-based AI assistant. Ask me how to increase margins or reduce leaks!' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const processQuery = (tempQ) => {
    setChatHistory(prev => [...prev, { role: 'user', text: tempQ }]);
    
    setTimeout(() => {
      const q = tempQ.toLowerCase();
      let answer = "I'm sorry, I am a rule-based bot. Try asking about 'scope creep', 'minimum rate', or 'hidden loss'.";
      
      if (q.includes('scope creep') || q.includes('reduce scope')) {
        answer = "To kill scope creep, ensure your contracts explicitly define the number of revisions included. Always enforce a 'Change Request' fee for new features.";
      } else if (q.includes('rate') || q.includes('minimum') || q.includes('set min')) {
        answer = "Your minimum rate should cover baseline living expenses divided by total billable capacity per month, plus 30% profit margin and 20% taxes.";
      } else if (q.includes('loss') || q.includes('leak')) {
        answer = "Hidden loss happens when you spend time on admin tasks or unlimited client calls without billing them. Use our Tracker system to expose these leaks!";
      }

      setChatHistory(prev => [...prev, { role: 'bot', text: answer }]);
    }, 600);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const q = chatInput.trim();
    setChatInput('');
    processQuery(q);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const projects = await getProjectsFromDB();
      const logs = await getAllTimeLogsFromDB();
      const computed = generateGlobalMetrics(projects, logs);
      setMetrics({ ...computed, projectsCount: projects.length });
    } catch (error) {
      console.error("Dashboard failed to load records:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--rx-text-muted)' }}>
        <div className="rx-spinner" style={{ margin: '0 auto 16px' }}></div>
        Crunching intelligence...
      </div>
    );
  }

  if (metrics.projectsCount === 0) {
    return (
      <div className="rx-dashboard">
        <div className="rx-page-header">
          <h2 className="rx-page-title">Dashboard Overview</h2>
          <p className="rx-page-subtitle">Add a project to begin unlocking metrics.</p>
        </div>
        <div className="rx-empty-state">
          <div className="rx-empty-icon">📈</div>
          <h3 className="rx-empty-title">Awaiting Data</h3>
          <p className="rx-empty-desc">Head over to the Projects tab and spin up a new gig.</p>
        </div>
      </div>
    );
  }

  const { effectiveRate, totalLoss, totalHours, riskLevel, scopeCreepPercent, lossBreakdown, earningsTrend, activeAlerts } = metrics;

  return (
    <div className="rx-dashboard">
      <div className="rx-page-header">
        <h2 className="rx-page-title">Dashboard Overview</h2>
        <p className="rx-page-subtitle">Your real-time freelance profitability and performance metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="rx-dashboard-kpi-grid">
        <Card className="rx-kpi-card">
          <div className="rx-kpi-header">
            <span className="rx-kpi-label">Effective Rate</span>
            <div className="rx-kpi-icon rx-icon-green"><Target size={18} /></div>
          </div>
          <div className="rx-kpi-value">${effectiveRate.toLocaleString()}<span className="rx-kpi-unit">/hr</span></div>
          <div className={`rx-kpi-trend ${effectiveRate > 0 ? 'positive' : 'neutral'}`}>
            Cross-project average
          </div>
        </Card>

        <Card className="rx-kpi-card">
          <div className="rx-kpi-header">
            <span className="rx-kpi-label">Total Hidden Loss</span>
            <div className={`rx-kpi-icon ${totalLoss > 0 ? 'rx-icon-red' : 'rx-icon-green'}`}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="rx-kpi-value">${totalLoss.toLocaleString()}</div>
          <div className={`rx-kpi-trend ${totalLoss > 0 ? 'negative' : 'positive'}`}>
            {totalLoss > 0 ? 'Leaked unbilled revenue' : 'Zero loss detected!'}
          </div>
        </Card>

        <Card className="rx-kpi-card">
          <div className="rx-kpi-header">
            <span className="rx-kpi-label">Total Billable/Logged</span>
            <div className="rx-kpi-icon rx-icon-blue"><Clock size={18} /></div>
          </div>
          <div className="rx-kpi-value">{totalHours}<span className="rx-kpi-unit">hrs</span></div>
          <div className="rx-kpi-trend neutral">Across {metrics.projectsCount} projects</div>
        </Card>

        <Card className="rx-kpi-card">
          <div className="rx-kpi-header">
            <span className="rx-kpi-label">Risk Level</span>
            <div className={`rx-kpi-icon ${riskLevel === 'Healthy' ? 'rx-icon-green' : riskLevel === 'Moderate' ? 'rx-icon-yellow' : 'rx-icon-red'}`}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="rx-kpi-value" style={{ color: riskLevel === 'Healthy' ? 'var(--rx-green)' : riskLevel === 'Moderate' ? '#fbbf24' : '#ff6b6b', fontSize: '1.4rem' }}>
            {riskLevel}
          </div>
          <div className={`rx-kpi-trend ${scopeCreepPercent > 0 ? 'negative' : 'positive'}`}>
            {scopeCreepPercent > 0 ? `${scopeCreepPercent}% net scope creep` : 'No scoping issues'}
          </div>
        </Card>
      </div>

      <div className="rx-dashboard-main-grid">
        {/* Charts */}
        <div className="rx-dashboard-charts">
          <Card title="Earnings Trend" subtitle="YTD actual revenue based on project total price value">
            <div style={{ width: '100%', height: 300, marginTop: 20 }}>
              <ResponsiveContainer>
                {earningsTrend.length > 0 ? (
                  <LineChart data={earningsTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={rxBorder} vertical={false} />
                    <XAxis dataKey="name" stroke="#5a7568" tick={{fill: '#8a9e93'}} />
                    <YAxis stroke="#5a7568" tick={{fill: '#8a9e93'}} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(10, 25, 18, 0.9)', borderColor: rxBorder, borderRadius: 8, color: '#e8f0ec' }}
                      itemStyle={{ color: '#00ff88' }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Earnings']}
                    />
                    <Line type="monotone" dataKey="earnings" stroke="#00ff88" strokeWidth={3} dot={{ fill: '#0a1210', stroke: '#00ff88', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rx-text-muted)' }}>Not enough data for trend</div>
                )}
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Hidden Loss Breakdown" subtitle="Where your unpaid time goes">
            <div style={{ width: '100%', height: 300, marginTop: 20 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={lossBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {lossBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10, 25, 18, 0.9)', borderColor: rxBorder, borderRadius: 8, color: '#e8f0ec' }}
                    itemStyle={{ color: '#e8f0ec' }}
                    formatter={(value) => value === 1 && lossBreakdown[0].name === 'No Tracking Yet' ? ['N/A', 'Status'] : [`$${value.toLocaleString()}`, 'Loss Value']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Alerts Section */}
        <div className="rx-dashboard-sidebar">
          <Card title="Intelligent Alerts" subtitle="Actionable insights from your data">
            <div className="rx-alerts-list">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert, i) => (
                  <div key={i} className={`rx-alert-item ${alert.type}`}>
                    <div className="rx-alert-icon">
                      {alert.type === 'info' ? <CheckCircle size={16} /> : 
                       alert.type === 'danger' ? <AlertTriangle size={16} /> : <AlertCircle size={16} />}
                    </div>
                    <div className="rx-alert-content">
                      <h4>{alert.title}</h4>
                      <p>{alert.desc}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--rx-text-muted)', fontSize: '0.88rem' }}>
                  No active alerts. You are running smoothly!
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Floating UI: Chatbot Button & Popup */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999,
          backgroundColor: '#00cc6a', border: 'none', borderRadius: '50%',
          width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,255,136,0.3)', cursor: 'pointer', color: '#0a1210', transition: 'all 0.2s'
        }}
      >
        {isChatOpen ? <X size={24} /> : <MessageSquareText size={24} />}
      </button>

      {isChatOpen && (
        <div style={{ position: 'fixed', bottom: '100px', right: '30px', zIndex: 9998, width: '360px', borderRadius: '16px', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
          <Card title="ProfitLens Assistant" subtitle="Click a prompt or type below" style={{ margin: 0 }}>
            <div style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
              <div className="rx-chat-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ 
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.role === 'user' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                    color: msg.role === 'user' ? '#00ff88' : 'var(--rx-text)',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                    borderBottomLeftRadius: msg.role === 'bot' ? '2px' : '12px',
                    maxWidth: '85%',
                    fontSize: '0.85rem',
                    lineHeight: 1.5
                  }}>
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Quick Prompt Pill Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                <button type="button" onClick={() => processQuery("How to reduce scope creep?")} style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0,255,136,0.25)', color: '#00cc6a', padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>⚡ Scope Creep</button>
                <button type="button" onClick={() => processQuery("Set Min Rate?")} style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0,255,136,0.25)', color: '#00cc6a', padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>⚡ Ideal Rate</button>
                <button type="button" onClick={() => processQuery("Identify hidden losses")} style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0,255,136,0.25)', color: '#00cc6a', padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>⚡ Hidden Loss</button>
              </div>

              <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Type a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', backgroundColor: 'var(--rx-bg-darker)', border: '1px solid var(--rx-border)', borderRadius: '8px', color: '#fff', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                />
                <button type="submit" style={{ backgroundColor: '#00cc6a', border: 'none', color: '#0a1210', padding: '0 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
