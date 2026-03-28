// LocalStorage Mock DB Services for immediate presentation (Bypasses Firebase)
const PROJECTS_KEY = 'rx_projects';
const LOGS_KEY = 'rx_logs';

// Helper to get data
const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Internal helper to handle the mock timestamp object safely since JSON.stringify removes functions
const getTimestamp = (item) => {
  if (!item.createdAt) return 0;
  if (typeof item.createdAt === 'number') return item.createdAt;
  if (item.createdAt.seconds) return item.createdAt.seconds * 1000;
  return Date.now();
};

export const addProjectToDB = async (projectData) => {
  return new Promise((resolve) => {
    const projects = getData(PROJECTS_KEY);
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      price: Number(projectData.price) || 0,
      estimatedHours: Number(projectData.estimatedHours) || 0,
      minRate: Number(projectData.minRate) || 0,
      loggedHours: 0,
      status: 'Active',
      createdAt: Date.now() // Store as pure number
    };
    projects.push(newProject);
    setData(PROJECTS_KEY, projects);
    resolve({ success: true, id: newProject.id });
  });
};

export const getProjectsFromDB = async () => {
  return new Promise((resolve) => {
    const projects = getData(PROJECTS_KEY);
    // Sort desc by our raw timestamp number
    const sorted = projects.sort((a,b) => getTimestamp(b) - getTimestamp(a));
    // Re-inject a dummy toMillis function for any UI components that might expect a Firestore Timestamp object
    const final = sorted.map(p => ({
      ...p,
      createdAt: { toMillis: () => getTimestamp(p) }
    }));
    resolve(final);
  });
};

export const getProjectFromDB = async (id) => {
  return new Promise((resolve) => {
    const projects = getData(PROJECTS_KEY);
    const p = projects.find(p => p.id === id);
    if (!p) return resolve(null);
    resolve({
      ...p,
      createdAt: { toMillis: () => getTimestamp(p) }
    });
  });
};

export const addTimeLogToDB = async (projectId, logData) => {
  return new Promise((resolve) => {
    const logs = getData(LOGS_KEY);
    const newLog = {
      id: Date.now().toString(),
      projectId,
      ...logData,
      hours: Number(logData.hours) || 0,
      createdAt: Date.now() // Store as pure number
    };
    logs.push(newLog);
    setData(LOGS_KEY, logs);

    // Increment project loggedHours
    const projects = getData(PROJECTS_KEY);
    const pIndex = projects.findIndex(p => p.id === projectId);
    if (pIndex !== -1) {
      projects[pIndex].loggedHours = (projects[pIndex].loggedHours || 0) + Number(logData.hours);
      setData(PROJECTS_KEY, projects);
    }
    
    resolve({ success: true, id: newLog.id });
  });
};

export const getTimeLogsFromDB = async (projectId) => {
  return new Promise((resolve) => {
    const logs = getData(LOGS_KEY);
    const pLogs = logs.filter(l => l.projectId === projectId);
    
    const sorted = pLogs.sort((a,b) => getTimestamp(b) - getTimestamp(a)).map(l => ({
      ...l,
      date: l.date || new Date(getTimestamp(l)).toLocaleDateString(),
      createdAt: { toMillis: () => getTimestamp(l) }
    }));
    resolve(sorted);
  });
};

export const getAllTimeLogsFromDB = async () => {
  return new Promise((resolve) => {
    const logs = getData(LOGS_KEY);
    const sorted = logs.sort((a,b) => getTimestamp(b) - getTimestamp(a)).map(l => ({
      ...l,
      date: l.date || new Date(getTimestamp(l)).toLocaleDateString(),
      createdAt: { toMillis: () => getTimestamp(l) }
    }));
    resolve(sorted);
  });
};
