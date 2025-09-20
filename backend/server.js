const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000; // Can change if needed
const fs = require('fs');
const csv = require('csv-parser'); 

app.use(cors());

// Sample asset and alert data (can be from DB in full app)
const dashboardData = {
  totalAssets: 2847,
  operationalAssets: 1234,
  maintenanceQueue: 175,
  criticalAlerts: 18,
  assetDistribution: {
    excellent: 1851,
    good: 803,
    fair: 175,
    critical: 18
  },
  systemUptime: 97.8,
  avgResponseTime: 2.1,
  zones: [
    { name: "Northern Railway Zone", status: "Online" },
    { name: "Southern Railway Zone", status: "Online" },
    { name: "Eastern Railway Zone", status: "Maintenance" }
  ]
};

const alerts = [
  { id: 1, type: "Critical", message: "Immediate Action Required", affected: "Track Section 7A" },
  { id: 2, type: "Warning", message: "Warranty Expiring Soon", affected: "PAD038449" }
  // Add more alert samples here
];

// Main dashboard route
app.get('/api/dashboard', (req, res) => {
  res.json(dashboardData);
});

// Alerts route
app.get('/api/alerts', (req, res) => {
  const results = [];
  fs.createReadStream('fittings.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const maintenanceAlerts = results.filter(asset => 
        asset.Inspection_Result === 'Fail' || asset.Performance_Status === 'Defective');
      const criticalAlerts = results.filter(asset =>
        asset.Performance_Status === 'Critical');
      // Format alert objects as needed
      res.json({ maintenanceAlerts, criticalAlerts });
    });
});

app.get('/api/fittings', (req, res) => {
  const results = [];
  fs.createReadStream('fittings.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.json(results);
    })
    .on('error', err => {
      res.status(500).send('Could not read CSV');
    });
});

app.listen(port, () => {
  console.log(`Backend API listening at http://localhost:${port}`);
});
