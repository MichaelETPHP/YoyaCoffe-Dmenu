const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Database setup
const { testConnection } = require('./config/db');
const { initializeDatabase } = require('./config/setup-db');
const dbStorage = require('./models/db-storage');

// User credentials (for demo purposes)
const sessions = {}; // Will be replaced with database sessions

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Database initialization middleware
app.use(async (req, res, next) => {
  if (!app.locals.dbInitialized) {
    try {
      // Test database connection
      await testConnection();
      
      // Initialize database tables
      await initializeDatabase();
      
      app.locals.dbInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
  next();
});

// Simple auth middleware
const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Get session from database
    const session = await dbStorage.getSession(token);
    
    if (!session || Date.now() > session.expires) {
      if (session) {
        // Delete expired session
        await dbStorage.deleteSession(token);
      }
      return res.status(401).json({ message: 'Session expired' });
    }
    
    req.user = session.userData;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// API Routes

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await dbStorage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create a simple session token
    const token = Math.random().toString(36).substring(2);
    const userData = { id: user.id, username: user.username, isAdmin: !!user.isAdmin };
    const expiresTimestamp = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    // Store session in database
    await dbStorage.createSession(token, user.id, userData, expiresTimestamp);
    
    res.json({ 
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user
app.get('/api/user', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    
    // Get session from database
    const session = await dbStorage.getSession(token);
    
    if (!session || Date.now() > session.expires) {
      if (session) {
        // Delete expired session
        await dbStorage.deleteSession(token);
      }
      return res.status(401).json({ message: 'Session expired' });
    }
    
    res.json(session.userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout endpoint
app.post('/api/logout', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      await dbStorage.deleteSession(token);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  res.json({ message: 'Logged out successfully' });
});

// Menu items endpoints
app.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await dbStorage.getMenuItems();
    res.json(menuItems);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/menu/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const menuItem = await dbStorage.getMenuItemById(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Like a menu item
app.post('/api/menu/:id/like', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const menuItem = await dbStorage.getMenuItemById(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    const updatedItem = await dbStorage.likeMenuItem(id);
    
    // Log the event
    console.log('Like event:', {
      itemId: id,
      timestamp: new Date(),
      type: 'like'
    });
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Like menu item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dislike a menu item
app.post('/api/menu/:id/dislike', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const menuItem = await dbStorage.getMenuItemById(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    const updatedItem = await dbStorage.dislikeMenuItem(id);
    
    // Log the event
    console.log('Dislike event:', {
      itemId: id,
      timestamp: new Date(),
      type: 'dislike'
    });
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Dislike menu item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin menu management endpoints
app.post('/api/menu', isAuthenticated, async (req, res) => {
  try {
    const { name, description, price, categoryId, image, featured } = req.body;
    
    const newItem = await dbStorage.createMenuItem({
      name,
      description,
      price,
      categoryId: parseInt(categoryId),
      image,
      featured: featured || false
    });
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/menu/:id', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, categoryId, image, featured } = req.body;
    
    const menuItem = await dbStorage.getMenuItemById(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    const updatedItem = await dbStorage.updateMenuItem(id, {
      name,
      description,
      price,
      categoryId: parseInt(categoryId),
      image,
      featured: featured || false
    });
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/menu/:id', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const menuItem = await dbStorage.getMenuItemById(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    await dbStorage.deleteMenuItem(id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Categories endpoints
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await dbStorage.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/categories', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = await dbStorage.createCategory(name);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/categories/:id', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name } = req.body;
    
    const category = await dbStorage.getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const updatedCategory = await dbStorage.updateCategory(id, name);
    res.json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/categories/:id', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    try {
      await dbStorage.deleteCategory(id);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      if (error.message.includes('Cannot delete category')) {
        return res.status(400).json({ message: 'Cannot delete category that is used by menu items' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route for admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// Catch-all route for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Periodically clean up expired sessions
setInterval(async () => {
  try {
    await dbStorage.cleanUpExpiredSessions();
    console.log('Cleaned up expired sessions');
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}, 1000 * 60 * 60); // Run every hour

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Yoya Coffee MySQL server running at http://0.0.0.0:${PORT}/`);
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;