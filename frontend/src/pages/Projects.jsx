import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, X, Briefcase, Clock, DollarSign, Target, Mic } from 'lucide-react';
import { getProjectsFromDB, addProjectToDB } from '../services/dbServices';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', client: '', price: '', estimatedHours: '', minRate: ''
  });
  const [isListening, setIsListening] = useState(false);

  const handleVoiceFill = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser does not support voice recognition. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const txt = event.results[0][0].transcript.toLowerCase();
      let newForm = { ...formData };
      
      const nameMatch = txt.match(/project\s+(.*?)(?=\s+client|\s+price|\s+hours|\s+rate|$)/i);
      const clientMatch = txt.match(/client\s+(.*?)(?=\s+project|\s+price|\s+hours|\s+rate|$)/i);
      const priceMatch = txt.match(/price\s+(?:of\s+)?(?:is\s+)?(\d+)/i);
      const hoursMatch = txt.match(/(?:estimated\s+)?hours\s+(?:are\s+)?(\d+)|(\d+)\s+hours/i);
      const rateMatch = txt.match(/rate\s+(?:of\s+)?(?:is\s+)?(\d+)|(\d+)\s+rate/i) || txt.match(/minimum\s+rate\s+(?:of\s+)?(\d+)/i);

      if (nameMatch) newForm.name = nameMatch[1].replace(/\b\w/g, l => l.toUpperCase());
      if (clientMatch) newForm.client = clientMatch[1].replace(/\b\w/g, l => l.toUpperCase());
      if (priceMatch) newForm.price = priceMatch[1];
      if (hoursMatch) newForm.estimatedHours = hoursMatch[1] || hoursMatch[2];
      if (rateMatch) newForm.minRate = rateMatch[1] || rateMatch[2] || rateMatch[3];

      setFormData(newForm);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const data = await getProjectsFromDB();
    setProjects(data);
    setIsLoading(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    const res = await addProjectToDB(formData);
    if (res.success) {
      await loadProjects();
      setIsModalOpen(false);
      setFormData({ name: '', client: '', price: '', estimatedHours: '', minRate: '' });
    } else {
      alert("Failed to create project");
    }
    setIsAdding(false);
  };

  const getStatusBadge = (status) => {
    if (status === 'Active') return <span className="rx-badge rx-badge-active">Active</span>;
    if (status === 'Completed') return <span className="rx-badge rx-badge-completed">Completed</span>;
    return <span className="rx-badge rx-badge-at-risk">At Risk</span>;
  };

  return (
    <div className="rx-projects-page">
      <div className="rx-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="rx-page-title">Projects</h2>
          <p className="rx-page-subtitle">Manage your freelance gigs and client work.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Project
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--rx-text-muted)' }}>
            <div className="rx-spinner" style={{ margin: '0 auto 16px' }}></div>
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="rx-empty-state" style={{ padding: '40px 0' }}>
            <div className="rx-empty-icon">📁</div>
            <h3 className="rx-empty-title">No projects yet</h3>
            <p className="rx-empty-desc" style={{ marginBottom: 16 }}>Click "New Project" to start tracking.</p>
          </div>
        ) : (
          <div className="rx-table-container">
            <table className="rx-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Client</th>
                  <th>Price</th>
                  <th>Est. Hours</th>
                  <th>Effective Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => {
                  const safeHours = proj.loggedHours > 0 ? proj.loggedHours : proj.estimatedHours;
                  const effRate = safeHours > 0 ? (proj.price / safeHours).toFixed(2) : 0;
                  const isBelowMin = parseFloat(effRate) < Number(proj.minRate);

                  return (
                    <tr key={proj.id}>
                      <td>
                        <Link to={`/projects/${proj.id}`} className="rx-link" style={{ fontWeight: 600 }}>
                          {proj.name}
                        </Link>
                      </td>
                      <td>{proj.client}</td>
                      <td>${Number(proj.price).toLocaleString()}</td>
                      <td>{proj.loggedHours || 0} / {proj.estimatedHours}h</td>
                      <td style={{ color: isBelowMin ? '#ff6b6b' : 'var(--rx-green)' }}>
                        ${effRate}/hr
                      </td>
                      <td>{getStatusBadge(proj.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="rx-modal-overlay" onClick={() => !isAdding && setIsModalOpen(false)}>
          <div className="rx-modal" onClick={e => e.stopPropagation()}>
            <div className="rx-modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 className="rx-modal-title" style={{ margin: 0 }}>Add New Project</h3>
                <button 
                  type="button" 
                  onClick={handleVoiceFill}
                  style={{ 
                    background: isListening ? 'rgba(0, 204, 106, 0.2)' : 'rgba(255,255,255,0.05)', 
                    border: `1px solid ${isListening ? '#00cc6a' : 'var(--rx-border)'}`, 
                    color: isListening ? '#00cc6a' : 'var(--rx-text-muted)', 
                    padding: '4px 10px', borderRadius: '14px', fontSize: '0.75rem', 
                    display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <Mic size={14} /> {isListening ? 'Listening...' : 'Voice Fill'}
                </button>
              </div>
              <button className="rx-modal-close" onClick={() => !isAdding && setIsModalOpen(false)} disabled={isAdding}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="rx-modal-body rx-form">
                <div className="rx-input-group">
                  <label className="rx-label">Project Name</label>
                  <div className="rx-input-wrapper">
                    <Briefcase size={18} className="rx-input-icon" />
                    <input type="text" name="name" className="rx-input" required value={formData.name} onChange={handleChange} placeholder="e.g. Website Overhaul" />
                  </div>
                </div>

                <div className="rx-input-group">
                  <label className="rx-label">Client Name</label>
                  <div className="rx-input-wrapper">
                    <input type="text" name="client" className="rx-input" style={{ paddingLeft: '14px' }} required value={formData.client} onChange={handleChange} placeholder="e.g. Acme Corp" />
                  </div>
                </div>

                <div className="rx-name-row">
                  <div className="rx-input-group">
                    <label className="rx-label">Total Price ($)</label>
                    <div className="rx-input-wrapper">
                      <DollarSign size={18} className="rx-input-icon" />
                      <input type="number" name="price" className="rx-input" required value={formData.price} onChange={handleChange} placeholder="5000" min="0" />
                    </div>
                  </div>
                  <div className="rx-input-group">
                    <label className="rx-label">Estimated Hours</label>
                    <div className="rx-input-wrapper">
                      <Clock size={18} className="rx-input-icon" />
                      <input type="number" name="estimatedHours" className="rx-input" required value={formData.estimatedHours} onChange={handleChange} placeholder="80" min="1" />
                    </div>
                  </div>
                </div>

                <div className="rx-input-group">
                  <label className="rx-label">Minimum Acceptable Rate ($/hr)</label>
                  <div className="rx-input-wrapper">
                    <Target size={18} className="rx-input-icon" />
                    <input type="number" name="minRate" className="rx-input" required value={formData.minRate} onChange={handleChange} placeholder="45" min="0" />
                  </div>
                </div>
              </div>

              <div className="rx-modal-footer">
                <button type="button" className="rx-btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isAdding}>Cancel</button>
                <Button type="submit" style={{ width: 'auto', marginTop: 0, padding: '10px 20px' }} disabled={isAdding}>
                  {isAdding ? <div className="rx-spinner" style={{width: 16, height: 16}} /> : "Save Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
