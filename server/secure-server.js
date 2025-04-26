const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Sample data (in production, this would come from a database)
const MENU_ITEMS = [
  {
    id: 1,
    name: 'Espresso',
    description: 'Strong black coffee made by forcing steam through ground coffee beans',
    price: 350,
    formattedPrice: '3.50',
    image: 'https://images.unsplash.com/photo-1520031607889-97ba0c7190ff?q=80&w=1974&auto=format&fit=crop',
    categoryId: 1,
    categoryName: 'Hot Coffee',
    likes: 25,
    dislikes: 3,
    featured: true
  },
  {
    id: 2,
    name: 'Cappuccino',
    description: 'Espresso coffee topped with steamed milk foam',
    price: 450,
    formattedPrice: '4.50',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=2070&auto=format&fit=crop',
    categoryId: 1,
    categoryName: 'Hot Coffee',
    likes: 42,
    dislikes: 1,
    featured: true
  },
  {
    id: 3,
    name: 'Iced Coffee',
    description: 'Chilled coffee served with ice cubes',
    price: 400,
    formattedPrice: '4.00',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=1974&auto=format&fit=crop',
    categoryId: 2,
    categoryName: 'Cold Coffee',
    likes: 18,
    dislikes: 2,
    featured: false
  }
];

const CATEGORIES = [
  { id: 1, name: 'Hot Coffee', description: 'Warm coffee beverages' },
  { id: 2, name: 'Cold Coffee', description: 'Chilled coffee beverages' },
  { id: 3, name: 'Specialty Drinks', description: 'Signature coffee creations' }
];

const USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', // In a real app, this would be hashed!
    email: 'admin@yoyacoffee.com',
    role: 'admin',
    createdAt: '2023-04-01T12:00:00Z'
  }
];

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'yoyacoffee-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using HTTPS
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  
  res.status(401).json({ error: 'Unauthorized' });
};

// Routes - Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find user by username and password
  const user = USERS.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Set user session
    req.session.userId = user.id;
    req.session.userRole = user.role;
    
    // Return user info (excluding password)
    const { password, ...userInfo } = user;
    res.json(userInfo);
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const user = USERS.find(u => u.id === req.session.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Return user info (excluding password)
  const { password, ...userInfo } = user;
  res.json(userInfo);
});

// Routes - Menu
app.get('/api/menu', (req, res) => {
  res.json(MENU_ITEMS);
});

app.get('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const menuItem = MENU_ITEMS.find(item => item.id === id);
  
  if (menuItem) {
    res.json(menuItem);
  } else {
    res.status(404).json({ error: 'Menu item not found' });
  }
});

app.post('/api/menu', requireAuth, (req, res) => {
  const newItem = {
    id: MENU_ITEMS.length > 0 ? Math.max(...MENU_ITEMS.map(item => item.id)) + 1 : 1,
    ...req.body,
    likes: 0,
    dislikes: 0
  };
  
  MENU_ITEMS.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/menu/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const index = MENU_ITEMS.findIndex(item => item.id === id);
  
  if (index !== -1) {
    // Update item but preserve id, likes and dislikes
    MENU_ITEMS[index] = { 
      ...MENU_ITEMS[index],
      ...req.body,
      id: MENU_ITEMS[index].id
    };
    
    res.json(MENU_ITEMS[index]);
  } else {
    res.status(404).json({ error: 'Menu item not found' });
  }
});

app.delete('/api/menu/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const index = MENU_ITEMS.findIndex(item => item.id === id);
  
  if (index !== -1) {
    const deletedItem = MENU_ITEMS.splice(index, 1)[0];
    res.json({ message: 'Menu item deleted', item: deletedItem });
  } else {
    res.status(404).json({ error: 'Menu item not found' });
  }
});

// Routes - Categories
app.get('/api/categories', (req, res) => {
  res.json(CATEGORIES);
});

app.get('/api/categories/stats/counts', (req, res) => {
  const categoriesWithCounts = CATEGORIES.map(category => {
    const itemCount = MENU_ITEMS.filter(item => item.categoryId === category.id).length;
    return { ...category, item_count: itemCount };
  });
  
  res.json(categoriesWithCounts);
});

app.get('/api/categories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const category = CATEGORIES.find(cat => cat.id === id);
  
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

app.post('/api/categories', requireAuth, (req, res) => {
  const newCategory = {
    id: CATEGORIES.length > 0 ? Math.max(...CATEGORIES.map(cat => cat.id)) + 1 : 1,
    ...req.body
  };
  
  CATEGORIES.push(newCategory);
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const index = CATEGORIES.findIndex(cat => cat.id === id);
  
  if (index !== -1) {
    CATEGORIES[index] = { ...CATEGORIES[index], ...req.body, id };
    res.json(CATEGORIES[index]);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

app.delete('/api/categories/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const index = CATEGORIES.findIndex(cat => cat.id === id);
  
  if (index !== -1) {
    // Check if category is in use
    const inUse = MENU_ITEMS.some(item => item.categoryId === id);
    
    if (inUse) {
      return res.status(400).json({ error: 'Cannot delete category that is in use' });
    }
    
    const deletedCategory = CATEGORIES.splice(index, 1)[0];
    res.json({ message: 'Category deleted', category: deletedCategory });
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

// Routes - Users
app.get('/api/users', requireAuth, (req, res) => {
  // Don't send passwords to the client
  const safeUsers = USERS.map(({ password, ...user }) => user);
  res.json(safeUsers);
});

// Dashboard stats
app.get('/api/menu/stats/dashboard', (req, res) => {
  const totalLikes = MENU_ITEMS.reduce((sum, item) => sum + item.likes, 0);
  const totalDislikes = MENU_ITEMS.reduce((sum, item) => sum + item.dislikes, 0);
  
  // Find most liked item
  let mostLikedItem = null;
  if (MENU_ITEMS.length > 0) {
    mostLikedItem = MENU_ITEMS.reduce((prev, current) => 
      (prev.likes > current.likes) ? prev : current
    );
  }
  
  res.json({
    totalMenuItems: MENU_ITEMS.length,
    totalCategories: CATEGORIES.length,
    totalLikes,
    totalDislikes,
    mostLikedItem: mostLikedItem ? {
      id: mostLikedItem.id,
      name: mostLikedItem.name,
      likes: mostLikedItem.likes
    } : null
  });
});

// Handle admin routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Handle unknown API routes
app.use('/api/:path*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Handle React routing for SPA - catch-all for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});