const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Simple API endpoint for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Admin route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Default route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Basic server running on port ${PORT}`);
});