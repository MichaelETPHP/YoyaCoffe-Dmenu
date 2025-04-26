import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import categoryRoutes from './routes/categories.js';
import userRoutes from './routes/users.js';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5000', 'https://menu.yoyacoffee.com'],
  credentials: true
}));

// Configure sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'yoya-coffee-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);

// Frontend paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticPath = path.join(__dirname, '../public');

app.use(express.static(staticPath));

// Admin UI route
app.get('/admin*', (req, res) => {
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

// Handle cleanup on shutdown
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  console.log('Database pool closed');
  process.exit(0);
});