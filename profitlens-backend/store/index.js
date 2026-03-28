const store = {
  projects: [],
  timelogs: [],
  settings: {
    minimumRate: 500,
    industryType: 'developer',
    currency: '₹',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

export default store;
