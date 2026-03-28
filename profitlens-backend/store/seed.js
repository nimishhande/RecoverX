import { v4 as uuidv4 } from 'uuid';
import store from './index.js';

export function seedData() {
  store.projects = [];
  store.timelogs = [];

  const now = new Date();
  const day = (d) => new Date(now.getTime() - d * 86400000).toISOString();
  const hour = (h) => h * 60;

  const p1 = {
    id: uuidv4(), name: 'E-Commerce Redesign', clientName: 'TechMart India',
    projectType: 'fixed', fixedPrice: 120000, hourlyRate: null, estimatedHours: 80,
    minimumRate: 500, status: 'active', createdAt: day(45), updatedAt: day(1)
  };

  const p2 = {
    id: uuidv4(), name: 'Mobile App MVP', clientName: 'StartupXYZ',
    projectType: 'fixed', fixedPrice: 85000, hourlyRate: null, estimatedHours: 50,
    minimumRate: 500, status: 'active', createdAt: day(30), updatedAt: day(0)
  };

  const p3 = {
    id: uuidv4(), name: 'Brand Identity Package', clientName: 'Café Bloom',
    projectType: 'fixed', fixedPrice: 35000, hourlyRate: null, estimatedHours: 25,
    minimumRate: 500, status: 'completed', createdAt: day(60), updatedAt: day(10)
  };

  const p4 = {
    id: uuidv4(), name: 'API Integration Suite', clientName: 'FinServ Corp',
    projectType: 'hourly', fixedPrice: null, hourlyRate: 1200, estimatedHours: 40,
    minimumRate: 500, status: 'active', createdAt: day(20), updatedAt: day(0)
  };

  const p5 = {
    id: uuidv4(), name: 'Dashboard Analytics Tool', clientName: 'DataView Inc',
    projectType: 'fixed', fixedPrice: 95000, hourlyRate: null, estimatedHours: 60,
    minimumRate: 500, status: 'completed', createdAt: day(90), updatedAt: day(15)
  };

  store.projects = [p1, p2, p3, p4, p5];

  const log = (projectId, category, daysAgo, mins, notes) => ({
    id: uuidv4(), projectId, category,
    startTime: day(daysAgo),
    endTime: new Date(new Date(day(daysAgo)).getTime() + mins * 60000).toISOString(),
    duration: mins, notes, createdAt: day(daysAgo)
  });

  store.timelogs = [
    log(p1.id, 'billable', 40, hour(8), 'Homepage wireframe & design'),
    log(p1.id, 'billable', 38, hour(7), 'Product listing pages'),
    log(p1.id, 'billable', 35, hour(10), 'Cart & checkout flow'),
    log(p1.id, 'billable', 32, hour(8), 'Payment integration'),
    log(p1.id, 'billable', 28, hour(9), 'Responsive fixes'),
    log(p1.id, 'billable', 25, hour(6), 'Testing & QA'),
    log(p1.id, 'calls', 39, hour(1), 'Kickoff call'),
    log(p1.id, 'calls', 30, hour(1), 'Mid-project review'),
    log(p1.id, 'revisions', 26, hour(3), 'Color scheme revision'),
    log(p1.id, 'admin', 40, hour(1), 'Project setup & docs'),
    log(p1.id, 'admin', 20, hour(1), 'Invoice & delivery'),

    log(p2.id, 'billable', 28, hour(6), 'App architecture & setup'),
    log(p2.id, 'billable', 25, hour(8), 'Auth screens'),
    log(p2.id, 'billable', 22, hour(7), 'Dashboard UI'),
    log(p2.id, 'billable', 18, hour(6), 'API integration'),
    log(p2.id, 'billable', 15, hour(5), 'Push notifications'),
    log(p2.id, 'scope', 12, hour(8), 'Client requested chat feature'),
    log(p2.id, 'scope', 10, hour(6), 'Social login added mid-project'),
    log(p2.id, 'scope', 8, hour(4), 'Extra analytics dashboard'),
    log(p2.id, 'calls', 27, hour(1.5), 'Requirements discussion'),
    log(p2.id, 'calls', 20, hour(1), 'Progress review'),
    log(p2.id, 'calls', 14, hour(2), 'Scope change discussion'),
    log(p2.id, 'calls', 7, hour(1), 'Another revision call'),
    log(p2.id, 'revisions', 9, hour(4), 'UI redesign per client feedback'),
    log(p2.id, 'admin', 28, hour(1), 'Setup & docs'),

    log(p3.id, 'billable', 55, hour(5), 'Initial logo concepts'),
    log(p3.id, 'billable', 50, hour(4), 'Brand guidelines draft'),
    log(p3.id, 'billable', 45, hour(3), 'Stationery design'),
    log(p3.id, 'revisions', 48, hour(6), 'Logo revision round 1'),
    log(p3.id, 'revisions', 43, hour(5), 'Logo revision round 2'),
    log(p3.id, 'revisions', 38, hour(4), 'Color palette changes'),
    log(p3.id, 'revisions', 35, hour(3), 'Typography changes'),
    log(p3.id, 'revisions', 30, hour(4), 'Final artboard tweaks'),
    log(p3.id, 'calls', 55, hour(1), 'Brief call'),
    log(p3.id, 'calls', 47, hour(1.5), 'Feedback session'),
    log(p3.id, 'calls', 40, hour(1), 'More feedback'),
    log(p3.id, 'calls', 33, hour(1), 'Sign-off call'),
    log(p3.id, 'admin', 55, hour(1), 'Contracts & brief'),

    log(p4.id, 'billable', 18, hour(6), 'API architecture design'),
    log(p4.id, 'billable', 15, hour(8), 'Payment gateway integration'),
    log(p4.id, 'billable', 12, hour(7), 'Webhook handlers'),
    log(p4.id, 'billable', 8, hour(5), 'Error handling & retry logic'),
    log(p4.id, 'calls', 19, hour(1), 'Technical kickoff'),
    log(p4.id, 'calls', 10, hour(0.5), 'Quick sync'),
    log(p4.id, 'admin', 18, hour(1), 'Documentation'),
    log(p4.id, 'revisions', 6, hour(2), 'Minor endpoint adjustments'),

    log(p5.id, 'billable', 85, hour(8), 'Data pipeline setup'),
    log(p5.id, 'billable', 80, hour(10), 'Chart components'),
    log(p5.id, 'billable', 75, hour(8), 'Filter & drill-down'),
    log(p5.id, 'billable', 70, hour(7), 'Export functionality'),
    log(p5.id, 'billable', 65, hour(6), 'Performance optimization'),
    log(p5.id, 'billable', 60, hour(5), 'Final testing'),
    log(p5.id, 'calls', 88, hour(1), 'Kickoff'),
    log(p5.id, 'calls', 72, hour(1), 'Mid-review'),
    log(p5.id, 'revisions', 62, hour(3), 'Chart style adjustments'),
    log(p5.id, 'revisions', 58, hour(2), 'Color theme tweaks'),
    log(p5.id, 'admin', 85, hour(1.5), 'Setup & planning'),
    log(p5.id, 'admin', 55, hour(1), 'Handoff & docs'),
  ];

  console.log(`📦 Seeded ${store.projects.length} projects, ${store.timelogs.length} time logs`);
}
