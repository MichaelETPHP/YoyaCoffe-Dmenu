const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files
const staticPath = path.join(__dirname, '../public');
app.use(express.static(staticPath));

// Basic API test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Admin UI route - must come before the wildcard route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(staticPath, 'admin.html'));
});

// Catch admin sub-routes
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(staticPath, 'admin.html'));
});

// All other routes go to the main index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});