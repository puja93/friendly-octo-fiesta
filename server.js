const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API endpoint to get Mapbox token (MUST be before static files)
app.get('/api/config', (req, res) => {
  res.json({
    mapboxToken: process.env.MAPBOX_ACCESS_TOKEN || ''
  });
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Fallback to index.html for SPA routing (catch-all must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Mapbox token configured: ${process.env.MAPBOX_ACCESS_TOKEN ? 'Yes' : 'No'}`);
});
