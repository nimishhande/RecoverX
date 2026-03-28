import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Play, Square, Check, Clock, Save, FileText } from 'lucide-react';
import { getProjectsFromDB, addTimeLogToDB } from '../services/dbServices';

const CATEGORIES = ['Billable', 'Calls', 'Revisions', 'Admin', 'Scope'];

const TimeTracking = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Timer State
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0); // in seconds
  const timerRef = useRef(null);

  // Form State
  const [projectId, setProjectId] = useState('');
  const [task, setTask] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [manualHours, setManualHours] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadProjects();
    return () => clearInterval(timerRef.current);
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const data = await getProjectsFromDB();
    setProjects(data);
    if (data.length > 0) setProjectId(data[0].id);
    setIsLoading(false);
  };

  // Timer Handlers
  const handleStartTimer = () => {
    if (!projectId) {
      alert("Please select a project before starting the timer.");
      return;
    }
    setIsActive(true);
    timerRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
  };

  const handleStopTimer = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    
    if (time > 0) {
      // Ensure even a 2-second demo populates as 0.01h so the form validates properly
      const calcHours = time / 3600;
      const displayHours = calcHours < 0.01 ? 0.01 : calcHours;
      setManualHours(displayHours.toFixed(2));
    }
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    
    if (time > 0) {
      const calcHours = time / 3600;
      const displayHours = calcHours < 0.01 ? 0.01 : calcHours;
      setManualHours(displayHours.toFixed(2));
    }

    setTime(0);
  };

  // Submission Handler
  const handleLogTime = async (e) => {
    e.preventDefault();
    if (!projectId || !task || !manualHours || Number(manualHours) <= 0) {
      alert("Please fill out all required fields with valid numbers.");
      return;
    }

    setIsSubmitting(true);
    const logData = {
      task,
      category,
      hours: Number(manualHours),
      date
    };

    const res = await addTimeLogToDB(projectId, logData);
    if (res.success) {
      setSuccessMessage(`Successfully logged ${manualHours}h for "${task}"`);
      handleReset();
      setTask('');
      setManualHours('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      alert("Failed to save time log.");
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--rx-text-muted)' }}>
        <div className="rx-spinner" style={{ margin: '0 auto 16px' }}></div>
        Loading Tracker...
      </div>
    );
  }

  return (
    <div>
      <div className="rx-page-header">
        <h2 className="rx-page-title">Time Tracking</h2>
        <p className="rx-page-subtitle">Track live sessions or manually log your billable hours.</p>
      </div>

      <div className="rx-timer-grid">
        {/* Left Column - Live Timer */}
        <div>
          <Card title="Live Timer" subtitle="Track time as you work">
            <div className="rx-timer-display">
              {formatTime(time)}
            </div>
            
            <div className="rx-timer-controls">
              {!isActive ? (
                <Button onClick={handleStartTimer} style={{ width: '45%' }}>
                  <Play size={18} /> Start
                </Button>
              ) : (
                <Button className="rx-btn-stop" onClick={handleStopTimer} style={{ width: '45%' }}>
                  <Square size={18} /> Stop
                </Button>
              )}
              <button 
                 type="button" 
                 className="rx-btn-secondary" 
                 onClick={handleReset} 
                 disabled={time === 0 || isActive}
              >
                Reset
              </button>
            </div>
            
            <p style={{ textAlign: 'center', color: 'var(--rx-text-muted)', fontSize: '0.82rem', marginTop: '12px' }}>
              Stopping the timer automatically populates the Manual Entry form below.
            </p>
          </Card>
          
          {successMessage && (
            <div className="rx-alert-item info" style={{ marginTop: '20px' }}>
              <div className="rx-alert-icon"><Check size={16} /></div>
              <div className="rx-alert-content">
                <h4>Success</h4>
                <p>{successMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Entry Form */}
        <div>
          <Card title="Log Time" subtitle="Save this session to a project">
            <form onSubmit={handleLogTime} className="rx-form" style={{ marginTop: '16px' }}>
              <div className="rx-input-group">
                <label className="rx-label">Select Project</label>
                <div className="rx-input-wrapper">
                  <select 
                     className="rx-input" 
                     style={{ paddingLeft: '14px', appearance: 'auto', background: 'var(--rx-input-bg)' }}
                     value={projectId} 
                     onChange={(e) => setProjectId(e.target.value)}
                     disabled={isActive}
                     required
                  >
                    <option value="" disabled>-- Choose a project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rx-input-group">
                <label className="rx-label">Task Description</label>
                <div className="rx-input-wrapper">
                  <FileText size={18} className="rx-input-icon" />
                  <input 
                    type="text" 
                    className="rx-input" 
                    placeholder="e.g. Wireframing Home Page" 
                    value={task} 
                    onChange={(e) => setTask(e.target.value)} 
                    disabled={isActive}
                    required 
                  />
                </div>
              </div>

              <div className="rx-name-row">
                <div className="rx-input-group">
                  <label className="rx-label">Category</label>
                  <div className="rx-input-wrapper">
                    <select 
                       className="rx-input" 
                       style={{ paddingLeft: '14px', appearance: 'auto', background: 'var(--rx-input-bg)' }}
                       value={category} 
                       onChange={(e) => setCategory(e.target.value)}
                       disabled={isActive}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="rx-input-group">
                  <label className="rx-label">Date</label>
                  <div className="rx-input-wrapper">
                    <input 
                      type="date" 
                      className="rx-input" 
                      style={{ paddingLeft: '14px' }} 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      disabled={isActive}
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="rx-input-group">
                <label className="rx-label">Hours</label>
                <div className="rx-input-wrapper">
                  <Clock size={18} className="rx-input-icon" />
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    className="rx-input" 
                    placeholder="2.5" 
                    value={manualHours} 
                    onChange={(e) => setManualHours(e.target.value)} 
                    disabled={isActive}
                    required 
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting || isActive || projects.length === 0} style={{ marginTop: '12px' }}>
                {isSubmitting ? <div className="rx-spinner" /> : <><Save size={18} /> Save Log</>}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
