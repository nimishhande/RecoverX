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

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/projects', projectRoutes);
app.use('/api/timelogs', timelogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/insights', insightsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'ProfitLens API', version: '1.0.0' });
});

seedData();

app.listen(PORT, () => {
  console.log(`\n🔮 ProfitLens API running on http://localhost:${PORT}\n`);
});
