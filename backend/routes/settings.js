import { Router } from 'express';
import store from '../store/index.js';

const router = Router();

// GET settings
router.get('/', (req, res) => {
  res.json(store.settings);
});

// PUT update settings
router.put('/', (req, res) => {
  const { minimumRate, industryType, currency } = req.body;

  if (minimumRate !== undefined) store.settings.minimumRate = Number(minimumRate);
  if (industryType !== undefined) store.settings.industryType = industryType;
  if (currency !== undefined) store.settings.currency = currency;
  store.settings.updatedAt = new Date().toISOString();

  res.json(store.settings);
});

export { router as settingsRoutes };
