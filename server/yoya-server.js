const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, '../public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

// Data for the API endpoints
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

// Simple session store
let sessions = {};

// Simple file server
const server = http.createServer((req, res) => {
  // Add CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }
  
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  
  // Handle API requests
  if (pathname.startsWith('/api/')) {
    // Handle auth endpoints
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      // Handle login process by reading the posted data
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const credentials = JSON.parse(body);
          console.log('Login attempt:', credentials.username);
          
          // Check credentials against the default admin
          if (credentials.username === 'admin' && credentials.password === 'admin123') {
            const sessionId = Date.now().toString();
            const user = {
              id: 1,
              username: 'admin',
              email: 'admin@yoyacoffee.com',
              role: 'admin'
            };
            
            // Store session
            sessions[sessionId] = { userId: 1, user };
            
            // Set cookie
            res.setHeader('Set-Cookie', `sessionId=${sessionId}; Path=/; HttpOnly`);
            
            console.log('Login successful for admin');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user));
          } else {
            console.log('Login failed: invalid credentials');
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid credentials' }));
          }
        } catch (e) {
          console.error('Login error:', e);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request format' }));
        }
      });
      
      return;
    }
    
    else if (pathname === '/api/auth/me') {
      // Parse cookies to check for session
      const cookies = parseCookies(req);
      const sessionId = cookies.sessionId;
      
      if (sessionId && sessions[sessionId]) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(sessions[sessionId].user));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Not authenticated' }));
      }
    }
    
    else if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const cookies = parseCookies(req);
      const sessionId = cookies.sessionId;
      
      if (sessionId) {
        delete sessions[sessionId];
      }
      
      res.setHeader('Set-Cookie', 'sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Logout successful' }));
    }
    
    // Handle menu item endpoints
    else if (pathname === '/api/menu') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(MENU_ITEMS));
    }
    
    // Handle menu item by ID endpoint
    else if (pathname.startsWith('/api/menu/') && pathname !== '/api/menu/stats/dashboard') {
      const id = parseInt(pathname.split('/')[3]);
      const menuItem = MENU_ITEMS.find(item => item.id === id);
      
      if (menuItem) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(menuItem));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Menu item not found' }));
      }
    }
    
    // Handle categories endpoints
    else if (pathname === '/api/categories') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(CATEGORIES));
    }
    
    // Handle categories stats
    else if (pathname === '/api/categories/stats/counts') {
      const categoriesWithCounts = CATEGORIES.map(category => {
        const itemCount = MENU_ITEMS.filter(item => item.categoryId === category.id).length;
        return { ...category, item_count: itemCount };
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(categoriesWithCounts));
    }
    
    // Handle menu dashboard stats
    else if (pathname === '/api/menu/stats/dashboard') {
      const totalLikes = MENU_ITEMS.reduce((sum, item) => sum + item.likes, 0);
      const totalDislikes = MENU_ITEMS.reduce((sum, item) => sum + item.dislikes, 0);
      
      // Find most liked item
      let mostLikedItem = null;
      if (MENU_ITEMS.length > 0) {
        mostLikedItem = MENU_ITEMS.reduce((prev, current) => 
          (prev.likes > current.likes) ? prev : current
        );
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        totalMenuItems: MENU_ITEMS.length,
        totalCategories: CATEGORIES.length,
        totalLikes,
        totalDislikes,
        mostLikedItem: mostLikedItem ? {
          id: mostLikedItem.id,
          name: mostLikedItem.name,
          likes: mostLikedItem.likes
        } : null
      }));
    }
    
    // Handle users endpoint
    else if (pathname === '/api/users') {
      // Check authorization
      const cookies = parseCookies(req);
      const sessionId = cookies.sessionId;
      
      if (!sessionId || !sessions[sessionId]) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Unauthorized' }));
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify([
        {
          id: 1,
          username: 'admin',
          email: 'admin@yoyacoffee.com',
          role: 'admin',
          createdAt: '2023-04-01T12:00:00Z'
        }
      ]));
    }
    
    // Default response for other API endpoints
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'API endpoint not found' }));
  }
  
  // Normalize path and handle root or admin requests
  if (pathname === '/') {
    pathname = '/index.html';
  } else if (pathname === '/admin') {
    pathname = '/admin.html';
  }
  
  // Construct the file path
  let filePath = path.join(PUBLIC_DIR, pathname);
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If no file found, serve index.html for client-side routing
      filePath = path.join(PUBLIC_DIR, '/index.html');
    }
    
    // Determine content type
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

// Helper function to parse cookies
function parseCookies(req) {
  const cookies = {};
  const cookieHeader = req.headers.cookie;
  
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      const name = parts[0].trim();
      const value = parts[1] || '';
      cookies[name] = value.trim();
    });
  }
  
  return cookies;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Yoya Coffee server running at http://0.0.0.0:${PORT}/`);
});