const express = require('express');
const path = require('path');
require('dotenv').config();

console.log('Server starting...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Mapbox token exists:', !!process.env.MAPBOX_ACCESS_TOKEN);

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API endpoint to get Mapbox token (MUST be before static files)
app.get('/api/config', (req, res) => {
  console.log('📡 /api/config endpoint called');
  const token = process.env.MAPBOX_ACCESS_TOKEN || '';
  console.log('📡 Returning token:', token ? 'token exists (length: ' + token.length + ')' : 'empty token');
  res.json({
    mapboxToken: token
  });
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve node_modules for Mapbox GL
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Fallback to index.html for SPA routing (catch-all must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✓ Server is running on port ${PORT}`);
  console.log(`✓ Mapbox token configured: ${process.env.MAPBOX_ACCESS_TOKEN ? 'Yes' : 'No'}`);
  if (!process.env.MAPBOX_ACCESS_TOKEN) {
    console.warn('⚠ WARNING: MAPBOX_ACCESS_TOKEN is not set!');
  }
});
