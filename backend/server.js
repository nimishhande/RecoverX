import express from 'express';
import cors from 'cors';
import { projectRoutes } from './routes/projects.js';
import { timelogRoutes } from './routes/timelogs.js';
import { analyticsRoutes } from './routes/analytics.js';
import { settingsRoutes } from './routes/settings.js';
import { insightsRoutes } from './routes/insights.js';
import { seedData } from './store/seed.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/timelogs', timelogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/insights', insightsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'ProfitLens API', version: '1.0.0' });
});

// Seed demo data
seedData();

app.listen(PORT, () => {
  console.log(`\n🔮 ProfitLens API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
